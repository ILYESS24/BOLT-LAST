import React, { useState } from 'react';
import { useStreamChat } from '../hooks/useStreamChat';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

export function ChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const { sendMessage, isStreaming, error } = useStreamChat({
    onMessage: (chunk) => {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          return [...prev.slice(0, -1), { ...lastMessage, content: lastMessage.content + chunk }];
        } else {
          return [...prev, { role: 'assistant' as const, content: chunk }];
        }
      });
    },
    onComplete: () => {
      console.log('Message complet');
    },
    onError: (err) => {
      console.error('Erreur:', err);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: 'user' as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    try {
      await sendMessage(message);
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "max-w-[80%] p-3 rounded-lg",
              msg.role === 'user'
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-muted"
            )}
          >
            <div className="text-sm font-medium mb-1">
              {msg.role === 'user' ? 'Vous' : 'Assistant'}
            </div>
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}
        
        {isStreaming && (
          <div className="max-w-[80%] p-3 rounded-lg bg-muted">
            <div className="text-sm font-medium mb-1">Assistant</div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-[80%] p-3 rounded-lg bg-red-100 text-red-800 ml-auto">
            <div className="text-sm font-medium mb-1">Erreur</div>
            <div>{error.message}</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isStreaming}
          />
          <Button type="submit" disabled={isStreaming || !message.trim()}>
            Envoyer
          </Button>
        </div>
      </form>
    </div>
  );
}