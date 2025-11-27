'use client';

import { useEffect, useRef, useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { ChatInput } from './chat-input';
import { CorrectionDisplay } from './correction-display';
import { tutorResponseSchema, type TutorResponse, type Language, languages } from '@/lib/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string | TutorResponse;
}

interface ChatProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function Chat({ language, onLanguageChange }: ChatProps) {
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { object, submit, isLoading } = useObject({
    api: '/api/chat',
    schema: tutorResponseSchema,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when loading finishes
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Auto-scroll to bottom when new messages arrive or object updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, object]);

  // When streaming completes, add the response to messages
  useEffect(() => {
    if (!isLoading && object && Object.keys(object).length > 0) {
      // Check if this object is already in messages (avoid duplicates)
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role !== 'assistant' || lastMessage.content !== object) {
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: object as TutorResponse,
          }
        ]);
      }
    }
  }, [isLoading, object]);

  const handleSend = (text?: string) => {
    const messageText = text ?? input;
    if (messageText.trim() && !isLoading) {
      // Add user message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: messageText,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Convert messages to format expected by API
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string'
          ? msg.content
          : JSON.stringify(msg.content),
      }));

      // Submit to API
      submit({ messages: apiMessages, language });
      if (!text) setInput('');
    }
  };

  const handleStart = () => {
    if (!name.trim()) return;
    handleSend(`Hi, I'm ${name.trim()}`);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-honey-50/30">
      {/* Header */}
      <div className="border-b border-honey-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🐝</div>
            <div>
              <h1 className="text-2xl font-bold text-honey-800">Buzzling</h1>
              <p className="text-sm text-honey-600">Learning {language}</p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="px-3 py-2 border border-honey-300 rounded-md bg-white hover:bg-honey-50 focus:outline-none focus:ring-2 focus:ring-honey-400 text-honey-800"
            disabled={messages.length > 0}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-honey-700 mt-20">
            <div className="text-6xl mb-4">🐝</div>
            <p className="text-xl font-semibold mb-2 text-honey-800">Welcome to Buzzling!</p>
            <p className="text-sm mb-6 text-honey-600">
              Ready to start your {language} learning journey?
            </p>
            <div className="flex flex-col items-center gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder="What is your name?"
                className="px-4 py-2 border border-honey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-400 text-center bg-white"
              />
              <button
                onClick={handleStart}
                disabled={!name.trim()}
                className="px-6 py-3 bg-honey-500 text-white rounded-lg hover:bg-honey-600 disabled:bg-honey-200 disabled:text-honey-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
              >
                Start Learning {language}
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-honey-500 text-white'
                  : 'bg-white border border-honey-200 text-honey-900 shadow-sm'
              }`}
            >
              {typeof message.content === 'string' ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <CorrectionDisplay correction={message.content} />
              )}
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {isLoading && object && (
          <div className="flex justify-start">
            <div className="max-w-2xl rounded-lg p-4 bg-white border border-honey-200 text-honey-900 shadow-sm">
              <CorrectionDisplay correction={object} />
            </div>
          </div>
        )}

        {isLoading && !object && (
          <div className="flex justify-start">
            <div className="max-w-2xl rounded-lg p-4 bg-white border border-honey-200 text-honey-500 italic shadow-sm">
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-honey-200 bg-white p-4 shadow-sm">
        <ChatInput
          ref={inputRef}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
