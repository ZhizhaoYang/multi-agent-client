import React from 'react';
import { Spinner } from '@heroui/spinner';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  message = 'Loading...',
  className = ''
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <Spinner color="primary" size={size} />
      {message && (
        <p className="text-sm text-default-600">
          {message}
        </p>
      )}
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner
        className="text-center"
        message="Loading page..."
        size="lg"
      />
    </div>
  );
}

export function ComponentLoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner message={message} size="md" />
    </div>
  );
}