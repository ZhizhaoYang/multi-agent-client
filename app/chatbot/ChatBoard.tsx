import React, { useState, useEffect, useRef, useCallback } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Bubble } from "@ant-design/x"
import type { GetProp, GetRef } from 'antd';
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import { ChatStatus } from "./useChatbot";
import { v4 as uuidv4 } from 'uuid';
import MarkdownIt from 'markdown-it';

// Initialize markdown-it instance
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

interface ChatBoardProps {
    sseData?: string;
    sseStatus?: ChatStatus;
    userQuery?: string;
    threadId?: string;
}

// Helper component to render HTML content safely
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

const ChatBoard = ({ sseData, sseStatus, userQuery, threadId }: ChatBoardProps) => {
    const listRef = useRef<GetRef<typeof Bubble.List>>(null);
    const [bubbleList, setBubbleList] = useState<BubbleDataType[]>([{
        ...INITIAL_WELCOME_MESSAGE,
        content: INITIAL_WELCOME_MESSAGE.content
    }]);
    const lastMessageRef = useRef<BubbleDataType | null>(null);
    const currentThreadIdRef = useRef<string | undefined>(threadId);

    const updateBubbleInList = useCallback((key: string | number, newProps: Partial<BubbleDataType>) => {
        setBubbleList(prevList =>
            prevList.map(bubble =>
                bubble.key === key ? { ...bubble, ...newProps } : bubble
            )
        );
    }, []);

    useEffect(() => {
        if (threadId && threadId !== currentThreadIdRef.current) {
            setBubbleList([{
                ...INITIAL_WELCOME_MESSAGE,
                content: INITIAL_WELCOME_MESSAGE.content
            }]);
            lastMessageRef.current = null;
            currentThreadIdRef.current = threadId;
        }
    }, [threadId]);

    useEffect(() => {
        if (userQuery) {
            const userBubble: BubbleDataType = {
                key: `user-${uuidv4()}`,
                role: 'user',
                content: userQuery,
                placement: 'end',
            };
            setBubbleList(prev => [...prev, userBubble]);
            lastMessageRef.current = null;
        }
    }, [userQuery]);

    const handleSseProcessing = useCallback((currentSseData: string | undefined, activeKey: string | number | null) => {
        if (!currentSseData) return;
        const htmlContent = md.render(currentSseData);
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
        if (activeKey) {
            const currentBubble = bubbleList.find(b => b.key === activeKey);
            if (currentBubble) {
                updateBubbleInList(activeKey, { typing: false });
            }
            lastMessageRef.current = null;
        }
    }, [updateBubbleInList, bubbleList]);

    const handleSseError = useCallback((currentSseData: string | undefined, activeMsg: BubbleDataType | null, activeKey: string | number | null) => {
        if (!activeKey || !activeMsg) return;
        const errorMessage = "\nError processing message.";
        const currentContentString = typeof activeMsg.content === 'string' ? activeMsg.content : (currentSseData || '');
        let finalMarkdown: string;

        if (currentContentString.includes("Error processing message")) {
             finalMarkdown = currentContentString;
        } else {
             finalMarkdown = currentContentString + errorMessage;
        }
        const finalHtml = md.render(finalMarkdown);

        updateBubbleInList(activeKey, { content: <MarkdownRenderer content={finalHtml} />, typing: false });
        lastMessageRef.current = null;
    }, [updateBubbleInList]);

    useEffect(() => {
        const activeAIMessage = lastMessageRef.current;
        const activeAIMessageKey = (activeAIMessage?.role === 'ai' && activeAIMessage.key) ? activeAIMessage.key : null;

        switch (sseStatus) {
            case ChatStatus.PROCESSING:
                handleSseProcessing(sseData, activeAIMessageKey);
                break;
            case ChatStatus.DONE:
                handleSseDone(activeAIMessageKey);
                break;
            case ChatStatus.ERROR:
                handleSseError(sseData, activeAIMessage, activeAIMessageKey);
                break;
            case ChatStatus.IDLE:
                break;
        }
    }, [sseData, sseStatus, handleSseProcessing, handleSseDone, handleSseError]);

    return (
        <div>
            <Bubble.List
                ref={listRef}
                items={bubbleList}
            />
        </div>
    )
}

export default ChatBoard;