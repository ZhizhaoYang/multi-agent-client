import { ComponentLoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ChatbotLoading() {
  return (
    <div className="w-full">
      <div className="flex justify-center items-center mb-4">
        <div className="text-2xl font-bold text-blue-600">Supervisor Chatbot</div>
      </div>

      <ComponentLoadingSpinner message="Initializing chatbot..." />
    </div>
  );
}