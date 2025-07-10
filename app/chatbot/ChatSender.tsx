"use client";

import { Sender } from '@ant-design/x';
import { Flex } from 'antd';
import React, { useState } from 'react';

interface ChatSenderProps {
    handleSubmit?: (question: string) => void;
    isLoading?: boolean;
    handleCancel?: () => void;
}

const ChatSender: React.FC<ChatSenderProps> = ({ handleSubmit, isLoading, handleCancel }) => {
    const [value, setValue] = useState<string>('');

    return (
        <Flex vertical gap="middle">
            <Sender
                autoSize={{ minRows: 3, maxRows: 6 }}
                loading={isLoading}
                onChange={(v) => setValue(v)}
                onCancel={() => {
                    setValue('');
                    handleCancel && handleCancel();
                }}
                onSubmit={() => {
                    if (!value.trim()) return;
                    handleSubmit && handleSubmit(value);
                    setValue('');
                }}
                placeholder={isLoading ? 'Processing...' : 'Hello! Please ask me anything.'}
                value={value}
            />
        </Flex>
    );
}

export default ChatSender;