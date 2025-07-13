"use client";

import dynamic from 'next/dynamic';

import { ComponentLoadingSpinner } from '@/components/ui/LoadingSpinner';

const ChatbotPageContent = dynamic(() => import('./ChatbotPageContent'), {
  ssr: false,
  loading: () => <ComponentLoadingSpinner message="Initializing chatbot..." />
});

export default function ChatbotPage() {
  return <ChatbotPageContent />;
}
