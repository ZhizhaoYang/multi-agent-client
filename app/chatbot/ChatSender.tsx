"use client";

import { Sender } from '@ant-design/x';
import { App, Flex } from 'antd';
import React, { useState } from 'react';
// import useChatbot, { ChatStatus } from './useChatbot'; // Removed, as logic is in page.tsx

interface ChatSenderProps {
    // onResponse?: (response: string) => void; // Removed redundant prop
    handleSubmit?: (question: string) => void;
    isLoading?: boolean;
    handleCancel?: () => void;
}

// Renamed to ChatSender as it's the primary export now.
const ChatSender: React.FC<ChatSenderProps> = ({ handleSubmit, isLoading, handleCancel }) => {
    const [value, setValue] = useState<string>('');
    const { message } = App.useApp(); // This requires <App> context from a parent.

    return (
        <Flex vertical gap="middle">
            <Sender
                loading={isLoading}
                value={value}
                placeholder={isLoading ? 'Processing...' : 'Hello! Please ask me anything.'}
                onChange={(v) => {
                    setValue(v);
                }}
                // disabled={isLoading}
                onSubmit={() => {
                    if (!value.trim()) return;
                    handleSubmit && handleSubmit(value);
                    setValue('');
                }}
                onCancel={() => {
                    setValue('');
                    handleCancel && handleCancel();
                }}
                autoSize={{ minRows: 3, maxRows: 6 }}
            />
        </Flex>
    );
}

export default ChatSender;