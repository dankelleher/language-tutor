'use client';

import { useEffect, useRef, useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { ChatInput } from './chat-input';
import { CorrectionDisplay } from './correction-display';
import { tutorResponseSchema, type TutorResponse, type Language } from '@/lib/types';

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
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Language Tutor</h1>
            <p className="text-sm text-gray-600">Learning {language}</p>
          </div>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="px-3 py-2 border rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={messages.length > 0}
          >
            <option value="German">German</option>
            <option value="French">French</option>
            <option value="Spanish">Spanish</option>
            <option value="Italian">Italian</option>
            <option value="Portuguese">Portuguese</option>
            <option value="Japanese">Japanese</option>
            <option value="Chinese">Chinese</option>
            <option value="Korean">Korean</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg mb-4">Welcome to Language Tutor!</p>
            <p className="text-sm mb-6">
              Ready to start your {language} learning journey?
            </p>
            <div className="flex flex-col items-center gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder="What is your name?"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              />
              <button
                onClick={handleStart}
                disabled={!name.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
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
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
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
            <div className="max-w-2xl rounded-lg p-4 bg-gray-100 text-gray-900">
              <CorrectionDisplay correction={object} />
            </div>
          </div>
        )}

        {isLoading && !object && (
          <div className="flex justify-start">
            <div className="max-w-2xl rounded-lg p-4 bg-gray-100 text-gray-500 italic">
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4 shadow-sm">
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
