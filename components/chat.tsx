'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { ChatInput } from './chat-input';
import { CorrectionDisplay } from './correction-display';
import { UserButton } from './user-button';
import { BeeCelebration } from './bee-celebration';
import { ProgressHive } from './progress-hive';
import { tutorResponseSchema, type TutorResponse, type Language, languages, getLevelIndex } from '@/lib/types';

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
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);
  const [stepsToNextLevel, setStepsToNextLevel] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  const { object, submit, isLoading } = useObject({
    api: '/api/chat',
    schema: tutorResponseSchema,
    fetch: async (url, options) => {
      const response = await fetch(url, options);
      // Extract session ID from response header
      const sessionId = response.headers.get('X-Chat-Session-Id');
      if (sessionId && !chatSessionId) {
        setChatSessionId(sessionId);
      }
      return response;
    },
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

  // Check for level up when streaming completes
  useEffect(() => {
    if (!isLoading && object?.progress?.evaluatedLevel) {
      const newLevel = object.progress.evaluatedLevel;
      const newLevelIndex = getLevelIndex(newLevel);
      const currentLevelIndex = currentLevel ? getLevelIndex(currentLevel) : -1;

      if (newLevelIndex > currentLevelIndex && currentLevelIndex !== -1) {
        // Level up! Trigger celebration
        setShowCelebration(true);
      }

      setCurrentLevel(newLevel);
      setStepsToNextLevel(object.progress.stepsToNextLevel ?? null);
    }
  }, [isLoading, object?.progress?.evaluatedLevel, object?.progress?.stepsToNextLevel, currentLevel]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
  }, []);

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
      submit({ messages: apiMessages, language, sessionId: chatSessionId });
      if (!text) setInput('');
    }
  };

  const handleStart = () => {
    if (!name.trim()) return;
    handleSend(`Hi, I'm ${name.trim()}`);
  };

  return (
    <div className="flex h-[100dvh] bg-gradient-to-b from-amber-50/30 to-white overflow-hidden">
      {/* Bee Celebration Overlay */}
      <BeeCelebration isActive={showCelebration} onComplete={handleCelebrationComplete} />

      {/* Progress Hive - Left sidebar (hidden until conversation starts) */}
      {messages.length > 0 && (
        <>
          {/* Mobile: compact half-hexagons peeking from left */}
          <div className="sm:hidden fixed left-0 top-1/2 -translate-y-1/2 z-10">
            <ProgressHive currentLevel={currentLevel} stepsToNextLevel={stepsToNextLevel} compact />
          </div>
          {/* Desktop: full sidebar */}
          <div className="hidden sm:flex flex-col items-center bg-white/60 backdrop-blur-sm">
            <ProgressHive currentLevel={currentLevel} stepsToNextLevel={stepsToNextLevel} />
          </div>
        </>
      )}

      {/* Main content area */}
      <div className={`flex flex-col flex-1 w-full sm:max-w-4xl sm:mx-auto overflow-hidden ${messages.length > 0 ? 'pl-7 sm:pl-0' : ''}`}>
        {/* Header */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm px-3 py-2 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Image src="/buzz-32.png" alt="Buzz" width={32} height={32} className="flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-honey-800 truncate">Buzzling</h1>
                <p className="text-xs sm:text-sm text-honey-600 truncate">Learning {language}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="px-2 py-1.5 sm:px-3 sm:py-2 text-sm rounded-full bg-honey-100/80 hover:bg-honey-200/80 focus:outline-none focus:ring-2 focus:ring-honey-300 text-honey-800 transition-colors"
                disabled={messages.length > 0}
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <UserButton />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-honey-700 mt-20">
            <div className="relative inline-block mb-4">
              <Image src="/buzz-128.png" alt="Buzz" width={128} height={128} className="mx-auto" />
              <Image
                src={language === 'French' ? '/bonjour.png' : '/hello.png'}
                alt={language === 'French' ? 'Bonjour' : 'Hello'}
                width={100}
                height={70}
                className="absolute -top-2 -right-16 sm:-right-20"
              />
            </div>
            <p className="text-xl font-semibold mb-2 text-honey-800">Welcome to the hive!</p>
            <p className="text-sm mb-6 text-honey-600">
              Let's pollinate your brain with some {language}!
            </p>
            <div className="flex flex-col items-center gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder="What should we call you?"
                className="px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-300 text-center bg-white placeholder:text-amber-400 text-amber-900"
              />
              <button
                onClick={handleStart}
                disabled={!name.trim()}
                className="px-6 py-3 bg-honey-500 text-white rounded-full hover:bg-honey-600 disabled:bg-honey-200 disabled:text-honey-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Let's Buzz!
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
              className={`max-w-[95%] sm:max-w-2xl rounded-2xl p-3 sm:p-4 ${
                message.role === 'user'
                  ? 'bg-honey-500 text-white'
                  : 'bg-white/90 text-honey-900'
              }`}
            >
              {typeof message.content === 'string' ? (
                <div className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</div>
              ) : (
                <CorrectionDisplay correction={message.content} />
              )}
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {isLoading && object && (
          <div className="flex justify-start">
            <div className="max-w-[95%] sm:max-w-2xl rounded-2xl p-3 sm:p-4 bg-white/90 text-honey-900">
              <CorrectionDisplay correction={object} />
            </div>
          </div>
        )}

        {isLoading && !object && (
          <div className="flex justify-start">
            <div className="max-w-[95%] sm:max-w-2xl rounded-2xl p-3 sm:p-4 bg-white/90 text-honey-500 italic text-sm sm:text-base">
              Buzzing away...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

        {/* Input */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm p-3 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <ChatInput
            ref={inputRef}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
