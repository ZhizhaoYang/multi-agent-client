"use client";

import React, { useState, useCallback, useEffect } from "react";
import { message, Button, Drawer } from 'antd';
import { v4 as uuidv4 } from 'uuid';

import useChatbot from "./useChatbot";
import useThoughtChainProcessor from "./useThoughtChainProcessor";
import ChatBoard from "./ChatBoard";
import ChatSender from "./ChatSender";
import ThoughtChainBoard from "./ThoughtChainBoard";

import { title } from "@/components/primitives";


export default function ChatbotPageContent() {
    const {
        currentAiResponse: sseData,
        loading,
        fetchChatStream,
        error: chatError,
        status: sseStatus,
        departmentTexts,
        activeDepartments,
        completedDepartments,

        cancelChat,
        resetChat,
    } = useChatbot();
    const [userQuery, setUserQuery] = useState<string>("");
    const [threadId, setThreadId] = useState<string>(() => uuidv4());
    const [openThoughtChain, setOpenThoughtChain] = useState(false);
    const [resetTrigger, setResetTrigger] = useState<number>(0);

    // Auto-close thought chain when final output starts displaying
    useEffect(() => {
        if (sseData && sseData.trim() !== "") {
            // Close thought chain drawer when final output starts streaming
            setOpenThoughtChain(false);
        }
    }, [sseData]);

    // Process raw thought chain data using custom hook
    const thoughtChainItems = useThoughtChainProcessor({
        departmentTexts,
        activeDepartments,
        completedDepartments
    });

    const handleSenderSubmit = useCallback(async (question: string) => {
        if(!threadId) {
            message.error("Thread ID is not available. Please try again.");
            return;
        }
        message.info(`Question: ${question} (Thread: ${threadId.substring(0, 8)})`);
        setUserQuery(question);

        // Auto-open thought chain when user sends a query
        setOpenThoughtChain(true);

        // Note: resetThoughtChain moved to fetchChatStream for better timing
        await fetchChatStream({ userQuery: question, threadId });
    }, [threadId, fetchChatStream]);

    const handleNewChat = useCallback(() => {
        // Generate new thread ID
        const newThreadId = uuidv4();
        setThreadId(newThreadId);

        // Clear user query
        setUserQuery("");

        // Reset all chat state (responses, loading, thought chain, etc.)
        resetChat();

        // Reset the chat board UI by triggering reset
        setResetTrigger(prev => prev + 1);

        message.success(`New chat started (Thread: ${newThreadId.substring(0, 8)})`);
    }, [resetChat]);

    const handleCancel = useCallback(() => {
        // Cancel the SSE connection and reset chatbot state
        cancelChat();

        // Clear user query
        setUserQuery("");

        // Trigger ChatBoard reset by incrementing resetTrigger
        setResetTrigger(prev => prev + 1);

        message.success("Chat cancelled and reset successfully!");
    }, [cancelChat]);

    return (
        <div className="w-full">
            <div className="flex justify-center items-center mb-4">
                <div className={`${title()}`} style={{ color: "rgb(77, 107, 254)" }}>Supervisor Chatbot</div>
            </div>
            <div className="flex justify-end items-center mb-4 gap-4">
                <Button type="primary" onClick={handleNewChat}>New Chat</Button>
                <Button type="default" onClick={() => setOpenThoughtChain(!openThoughtChain)}>Thought Chain</Button>
            </div>




            <div className="flex gap-10 justify-left">
                <div className={`${openThoughtChain ? "w-1/2" : "w-full"}`}>
                    <div className="mb-10">
                        <ChatBoard
                            chatError={chatError}
                            resetTrigger={resetTrigger}
                            sseData={sseData}
                            sseStatus={sseStatus}
                            threadId={threadId}
                            userQuery={userQuery}
                        />
                    </div>

                    <div>
                        <ChatSender
                            handleCancel={handleCancel}
                            handleSubmit={handleSenderSubmit}
                            isLoading={loading}
                        />
                    </div>
                </div>

                <Drawer
                    open={openThoughtChain}
                    placement="right"
                    title="Thought Chain"
                    width={500}
                    onClose={() => setOpenThoughtChain(false)}
                >
                    <ThoughtChainBoard items={thoughtChainItems} />
                </Drawer>

            </div>
        </div>
    );
}