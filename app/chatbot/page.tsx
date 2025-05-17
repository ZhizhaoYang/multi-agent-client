"use client";

import React, { useState, useEffect, useCallback } from "react";
import { message, Button, Alert } from 'antd';
import { title } from "@/components/primitives";
import useChatbot from "./useChatbot";
import ChatBoard from "./ChatBoard";
import ChatSender from "./ChatSender";
import { v4 as uuidv4 } from 'uuid';

export default function ChatbotPage() {
    const { data: sseData, loading, fetchChatStream, error: chatError, status: sseStatus } = useChatbot();
    const [userQuery, setUserQuery] = useState<string>("");
    const [threadId, setThreadId] = useState<string>(() => uuidv4());

    const handleSenderSubmit = useCallback(async (question: string) => {
        if (!threadId) {
            message.error("Thread ID is not available. Please try again.");
            return;
        }
        message.info(`Question: ${question} (Thread: ${threadId.substring(0,8)})`);
        setUserQuery(question);
        await fetchChatStream({ userQuery: question, threadId });
    }, [threadId, fetchChatStream]);

    const handleNewChat = useCallback(() => {
        const newThreadId = uuidv4();
        setThreadId(newThreadId);
        setUserQuery("");
        message.success(`New chat started (Thread: ${newThreadId.substring(0,8)})`);
    }, []);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <div className={`${title()}`}>Chatbot</div>
                <Button onClick={handleNewChat} type="primary">New Chat</Button>
            </div>

            {chatError && (
                <Alert
                    message="Chat Error"
                    description={chatError.message}
                    type="error"
                    showIcon
                    closable
                    className="mb-4"
                />
            )}

            <ChatBoard sseData={sseData} sseStatus={sseStatus} userQuery={userQuery} threadId={threadId} />
            <ChatSender handleSubmit={handleSenderSubmit} isLoading={loading} />
        </div>
    );
}
