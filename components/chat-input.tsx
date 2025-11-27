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
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <textarea
          ref={ref}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isLoading ? "Buzzing away..." : "Type your translation..."}
          disabled={isLoading}
          className="flex-1 p-2 sm:p-3 text-sm sm:text-base border border-honey-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-honey-400 disabled:bg-honey-50 disabled:text-honey-400 min-h-[44px] max-h-[120px]"
          rows={1}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-honey-500 text-white rounded-lg hover:bg-honey-600 disabled:bg-honey-200 disabled:text-honey-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm text-sm sm:text-base flex-shrink-0"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    );
  }
);
