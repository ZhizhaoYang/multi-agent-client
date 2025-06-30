"use client";

import React, { useState, useCallback } from "react";
import { message, Button } from 'antd';
import { title } from "@/components/primitives";
import useChatbot from "./useChatbot";
import useThoughtChainProcessor from "./useThoughtChainProcessor";
import ChatBoard from "./ChatBoard";
import ChatSender from "./ChatSender";
import ThoughtChainBoard from "./ThoughtChainBoard";
import { v4 as uuidv4 } from 'uuid';
import _ from "lodash";

export default function ChatbotPage() {
    const {
        currentAiResponse: sseData,
        loading,
        fetchChatStream,
        error: chatError,
        status: sseStatus,
        departmentTexts,
        activeDepartments,
        completedDepartments,
        resetThoughtChain,
    } = useChatbot();
    const [userQuery, setUserQuery] = useState<string>("");
    const [threadId, setThreadId] = useState<string>(() => uuidv4());

    // console.log("thoughtChain data: ", {
    //     departmentTexts: Array.from(departmentTexts.entries()),
    //     activeDepartments,
    //     completedDepartments
    // });

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
        await fetchChatStream({ userQuery: question, threadId });
    }, [threadId, fetchChatStream]);

    const handleNewChat = useCallback(() => {
        const newThreadId = uuidv4();
        setThreadId(newThreadId);
        setUserQuery("");
        resetThoughtChain(); // Reset thought chain data
        message.success(`New chat started (Thread: ${newThreadId.substring(0, 8)})`);
    }, [resetThoughtChain]);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={handleNewChat} type="primary">New Chat</Button>
            </div>
            <div className="flex justify-center items-center mb-4">
                <div className={`${title()}`} style={{ color: "rgb(77, 107, 254)" }}>Chatbot Demo</div>
            </div>



            <div className="flex gap-10 justify-center">
                <div className="w-7/12">
                    <div className="mb-10">
                        <ChatBoard
                            sseData={sseData}
                            sseStatus={sseStatus}
                            userQuery={userQuery}
                            threadId={threadId}
                            chatError={chatError}
                        />
                    </div>

                    <div>
                        <ChatSender handleSubmit={handleSenderSubmit} isLoading={loading} />
                    </div>
                </div>

                <div className="w-5/12">
                    <ThoughtChainBoard items={thoughtChainItems} />
                </div>
            </div>
        </div>
    );
}
