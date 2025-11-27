'use client';

import { forwardRef, type KeyboardEvent } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  function ChatInput({ input, setInput, onSend, isLoading }, ref) {
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend();
  };

    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          ref={ref}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isLoading ? "Buzzing away..." : "Type your translation or ask a question..."}
          disabled={isLoading}
          className="flex-1 p-3 border border-honey-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-honey-400 disabled:bg-honey-50 disabled:text-honey-400"
          rows={2}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-honey-500 text-white rounded-lg hover:bg-honey-600 disabled:bg-honey-200 disabled:text-honey-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    );
  }
);
