import React, { useState, useEffect, useRef, useCallback } from "react";
import { UserOutlined, WarningOutlined } from "@ant-design/icons";
import { Bubble } from "@ant-design/x"
import { Spin } from 'antd';
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import { v4 as uuidv4 } from 'uuid';
import MarkdownIt from 'markdown-it';

import type { GetRef } from 'antd';

import { ChatStatus } from "./useChatbot";

const md = new MarkdownIt();

const INITIAL_WELCOME_MESSAGE: BubbleDataType = {
    key: 'welcome',
    role: 'ai',
    content: 'Hello, I am the chatbot. How can I help you today?',
    placement: 'start',
    avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
    typing: { step: 5, interval: 20 },
    style: {
        maxWidth: 600,
    },
};

const THINKING_BUBBLE_KEY = 'ai-thinking-bubble';

interface ChatBoardProps {
    sseData?: string;
    sseStatus?: ChatStatus;
    userQuery?: string;
    threadId?: string;
    chatError?: Error | null;
    resetTrigger?: number; // When this changes, reset the chat board
}

// Helper component to render HTML content safely
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

const ChatBoard = ({ sseData, sseStatus, userQuery, threadId, chatError, resetTrigger }: ChatBoardProps) => {
    const listRef = useRef<GetRef<typeof Bubble.List>>(null);
    const [bubbleList, setBubbleList] = useState<BubbleDataType[]>([INITIAL_WELCOME_MESSAGE]);
    const lastMessageRef = useRef<BubbleDataType | null>(null);
    const currentThreadIdRef = useRef<string | undefined>(threadId);
    const displayedErrorRef = useRef<string | null>(null);

    const updateBubbleInList = useCallback((key: string | number, newProps: Partial<BubbleDataType>) => {
        setBubbleList(prevList =>
            prevList.map(bubble =>
                bubble.key === key ? { ...bubble, ...newProps } : bubble
            )
        );
    }, []);

    const removeBubbleFromList = useCallback((key: string | number) => {
        setBubbleList(prevList => prevList.filter(bubble => bubble.key !== key));
    }, []);

    useEffect(() => {
        if (threadId && threadId !== currentThreadIdRef.current) {
            setBubbleList([INITIAL_WELCOME_MESSAGE]);
            lastMessageRef.current = null;
            currentThreadIdRef.current = threadId;
            displayedErrorRef.current = null;
            setTimeout(() => {
                setBubbleList(prevList => prevList.filter(bubble => bubble.key !== THINKING_BUBBLE_KEY));
            }, 0);
        }
    }, [threadId]);

    useEffect(() => {
        if (userQuery) {
            const userBubble: BubbleDataType = {
                key: `user-${uuidv4()}`,
                role: 'user',
                content: userQuery,
                placement: 'end',
                avatar: { icon: <UserOutlined />, style: { background: 'primary' } },
            };
            setBubbleList(prevList => [...prevList, userBubble]);
            lastMessageRef.current = null;
            setTimeout(() => {
                setBubbleList(prevList => prevList.filter(bubble => bubble.key !== THINKING_BUBBLE_KEY));
            }, 0);
        }
    }, [userQuery]);

    useEffect(() => {
        if (chatError && chatError.message !== displayedErrorRef.current) {
            setTimeout(() => {
                setBubbleList(prevList => {
                    const filteredList = prevList.filter(bubble => bubble.key !== THINKING_BUBBLE_KEY);
                    const errorBubble: BubbleDataType = {
                        key: `error-${uuidv4()}`,
                        role: 'ai',
                        content: <MarkdownRenderer content={md.render(`**Error:** ${chatError.message}`)} />,
                        placement: 'start',
                        avatar: { icon: <WarningOutlined />, style: { background: '#fff2f0', color: '#ff4d4f' } },
                        style: {
                            maxWidth: 600,
                            border: '1px solid #ffccc7',
                            backgroundColor: '#fff2f0'
                        },
                    };
                    return [...filteredList, errorBubble];
                });
            }, 0);
            displayedErrorRef.current = chatError.message;
            lastMessageRef.current = null;
        }
    }, [chatError]);

    // Handle reset trigger - reset chat board when resetTrigger changes
    useEffect(() => {
        if (resetTrigger !== undefined && resetTrigger > 0) {
            setBubbleList([INITIAL_WELCOME_MESSAGE]);
            lastMessageRef.current = null;
            displayedErrorRef.current = null;
        }
    }, [resetTrigger]);

    const handleSseProcessing = useCallback((currentSseData: string | undefined, activeKey: string | number | null) => {
        setBubbleList(prevList => prevList.filter(bubble => bubble.key !== THINKING_BUBBLE_KEY));
        displayedErrorRef.current = null;
        if (!currentSseData) return;

        let htmlContent;
        try {
            htmlContent = md.render(currentSseData, { html: true });
        } catch (error) {
            console.error("Markdown rendering error in handleSseProcessing:", error);
            const escapedData = currentSseData.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            htmlContent = `<pre>${escapedData}</pre>`;
        }

        if (activeKey) {
            updateBubbleInList(activeKey, { content: <MarkdownRenderer content={htmlContent} />, typing: true });
        } else {
            const newAiBubbleKey = `ai-${uuidv4()}`;
            const newAiBubble: BubbleDataType = {
                key: newAiBubbleKey,
                role: 'ai',
                content: <MarkdownRenderer content={htmlContent} />,
                placement: 'start',
                avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
                typing: true,
                style: { maxWidth: 600 },
            };
            setBubbleList(prevList => [...prevList, newAiBubble]);
            lastMessageRef.current = newAiBubble;
        }
    }, [updateBubbleInList]);

    const handleSseDone = useCallback((activeKey: string | number | null) => {
        setBubbleList(prevList => prevList.filter(bubble => bubble.key !== THINKING_BUBBLE_KEY));
        if (activeKey) {
            updateBubbleInList(activeKey, { typing: false });
            lastMessageRef.current = null;
        }
    }, [updateBubbleInList]);

    const handleSseError = useCallback((currentSseData: string | undefined, activeMsg: BubbleDataType | null, activeKey: string | number | null) => {
        setBubbleList(prevList => prevList.filter(bubble => bubble.key !== THINKING_BUBBLE_KEY));
        if (!activeKey || !activeMsg) return;
        const errorMessage = "\nChat stream error occurred.";
        const contentBeforeError = currentSseData || '';
        let finalMarkdown = contentBeforeError.split('\n')[0] + errorMessage;

        let finalHtml;
        try {
            finalHtml = md.render(finalMarkdown);
        } catch (error) {
            console.error("Markdown rendering error in handleSseError:", error);
            const escapedMarkdown = finalMarkdown.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            finalHtml = `<pre>${escapedMarkdown}</pre>`;
        }
        updateBubbleInList(activeKey, { content: <MarkdownRenderer content={finalHtml} />, typing: false });
        lastMessageRef.current = null;
        displayedErrorRef.current = finalMarkdown;
    }, [updateBubbleInList]);

    // Effect to orchestrate SSE data and status changes
    useEffect(() => {
        const activeAIMessage = lastMessageRef.current;
        const activeAIMessageKey = (activeAIMessage?.role === 'ai' && activeAIMessage.key) ? activeAIMessage.key : null;

        const timeoutId = setTimeout(() => {
            switch (sseStatus) {
                case ChatStatus.PROCESSING:
                    if (!sseData && !activeAIMessageKey) {
                        setBubbleList(prevList => {
                            const thinkingBubbleExists = prevList.some(b => b.key === THINKING_BUBBLE_KEY);
                            if (!thinkingBubbleExists) {
                                const thinkingBubble: BubbleDataType = {
                                    key: THINKING_BUBBLE_KEY, role: 'ai', content: <Spin size="small" style={{ margin: 'auto' }}/>,
                                    placement: 'start', avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
                                    typing: true, style: { maxWidth: 100, textAlign: 'left' },
                                };
                                return [...prevList, thinkingBubble];
                            }
                            return prevList;
                        });
                    } else if (sseData) {
                        handleSseProcessing(sseData, activeAIMessageKey);
                    }
                    break;
                case ChatStatus.DONE:
                    setBubbleList(prevList => {
                        const thinkingBubbleExists = prevList.some(b => b.key === THINKING_BUBBLE_KEY);
                        if (activeAIMessageKey || thinkingBubbleExists) {
                            handleSseDone(activeAIMessageKey);
                        }
                        return prevList;
                    });
                    break;
                case ChatStatus.ERROR:
                    if (activeAIMessageKey) {
                        handleSseError(sseData, activeAIMessage, activeAIMessageKey);
                    }
                    break;
                case ChatStatus.IDLE:
                    setBubbleList(prevList => prevList.filter(bubble => bubble.key !== THINKING_BUBBLE_KEY));
                    break;
            }
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [sseStatus, sseData, handleSseProcessing, handleSseDone, handleSseError]);

    return (
        <div>
            <Bubble.List
                ref={listRef}
                items={bubbleList}
                style={{
                    textAlign: 'left',
                }}
            />
        </div>
    )
}

export default ChatBoard;