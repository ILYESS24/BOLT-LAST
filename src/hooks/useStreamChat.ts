import { useState, useCallback } from 'react';

export interface StreamChatOptions {
  onMessage?: (message: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export function useStreamChat(options: StreamChatOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    setIsStreaming(true);
    setError(null);

    try {
      // Simulation d'un stream de chat
      // Dans une vraie implémentation, ceci se connecterait à un WebSocket ou SSE
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        options.onMessage?.(chunk);
      }

      options.onComplete?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsStreaming(false);
    }
  }, [options]);

  return {
    sendMessage: (message: string) => sendMessage(message),
    streamMessage: (message: string) => sendMessage(message),
    isStreaming,
    setIsStreaming: () => {},
    error,
    setError: () => {},
  };
}