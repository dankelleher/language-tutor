'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { ChatInput } from './chat-input';
import { CorrectionDisplay } from './correction-display';
import { UserButton } from './user-button';
import { HoneyBalance } from './honey-balance';
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
  const [age, setAge] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('English');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  console.log('[RENDER] Chat component render', { messagesCount: messages.length, language });
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);
  const [stepsToNextLevel, setStepsToNextLevel] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

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

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolledForStreamRef = useRef(false);
  const streamingMessageIdRef = useRef<string | null>(null);

  // Track scroll position changes
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      console.log('[SCROLL EVENT]', {
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
        clientHeight: container.clientHeight,
        atBottom: Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 10
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch('/api/chat/history');
        const data = await response.json();

        if (data.session && data.messages.length > 0) {
          setChatSessionId(data.session.id);
          setMessages(data.messages);
          if (data.session.level?.overallLevel) {
            setCurrentLevel(data.session.level.overallLevel);
          }
          // Update language if different
          if (data.session.language && data.session.language !== language) {
            onLanguageChange(data.session.language as Language);
          }
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  // Scroll to bottom when history finishes loading
  useEffect(() => {
    console.log('[SCROLL] History effect triggered', { isLoadingHistory, messagesCount: messages.length });
    const container = messagesContainerRef.current;
    if (!container || isLoadingHistory) return;

    // Only scroll if we have messages (history just loaded)
    if (messages.length > 0) {
      console.log('[SCROLL] Scrolling after history load', { scrollHeight: container.scrollHeight });
      container.scrollTop = container.scrollHeight;
    }
  }, [isLoadingHistory]);

  // Scroll to bottom when streaming starts
  useEffect(() => {
    console.log('[SCROLL] Streaming effect triggered', {
      isLoading,
      hasObject: !!object,
      hasScrolled: hasScrolledForStreamRef.current,
      scrollTop: messagesContainerRef.current?.scrollTop,
      scrollHeight: messagesContainerRef.current?.scrollHeight
    });
    const container = messagesContainerRef.current;
    if (!container || !isLoading || !object || hasScrolledForStreamRef.current) return;

    console.log('[SCROLL] Scrolling for streaming start');
    container.scrollTop = container.scrollHeight;
    hasScrolledForStreamRef.current = true;
  }, [isLoading, object]);

  // Reset flag when streaming completes
  useEffect(() => {
    console.log('[SCROLL] Reset flag effect triggered', { isLoading });
    if (!isLoading) {
      console.log('[SCROLL] Resetting scroll flag');
      hasScrolledForStreamRef.current = false;
    }
  }, [isLoading]);

  // Focus input when loading finishes
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Check for level up when streaming completes
  useEffect(() => {
    if (!isLoading && object?.progress?.overallLevel) {
      const newLevel = object.progress.overallLevel;
      const newLevelIndex = getLevelIndex(newLevel);
      const currentLevelIndex = currentLevel ? getLevelIndex(currentLevel) : -1;

      if (newLevelIndex > currentLevelIndex && currentLevelIndex !== -1) {
        // Level up! Trigger celebration
        setShowCelebration(true);
      }

      setCurrentLevel(newLevel);
      setStepsToNextLevel(object.progress.stepsToNextLevel ?? null);
    }
  }, [isLoading, object?.progress?.overallLevel, object?.progress?.stepsToNextLevel, currentLevel]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setChatSessionId(null);
    setCurrentLevel(null);
    setStepsToNextLevel(null);
  }, []);

  // When streaming starts or updates, add/update the response in messages
  useEffect(() => {
    console.log('[MESSAGES] Message effect triggered', {
      isLoading,
      hasObject: !!object,
      objectKeys: object ? Object.keys(object).length : 0,
      streamingMessageId: streamingMessageIdRef.current,
      messagesCount: messages.length
    });

    if (object && Object.keys(object).length > 0) {
      // If we're streaming and haven't added the message yet, add it
      if (isLoading && !streamingMessageIdRef.current) {
        console.log('[MESSAGES] Adding streaming message to array');
        const messageId = crypto.randomUUID();
        streamingMessageIdRef.current = messageId;
        setMessages(prev => [
          ...prev,
          {
            id: messageId,
            role: 'assistant',
            content: object as TutorResponse,
          }
        ]);
      }
      // If we're streaming and have already added the message, update its content
      else if (isLoading && streamingMessageIdRef.current) {
        console.log('[MESSAGES] Updating streaming message content');
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.id === streamingMessageIdRef.current) {
            lastMessage.content = object as TutorResponse;
          }
          return newMessages;
        });
      }

      // When streaming completes, refresh honey balance and reset ref
      if (!isLoading && streamingMessageIdRef.current) {
        console.log('[MESSAGES] Streaming completed, refreshing honey');
        streamingMessageIdRef.current = null;
        window.dispatchEvent(new CustomEvent('honey-updated'));
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
      submit({
        messages: apiMessages,
        language,
        sessionId: chatSessionId,
        ...(age && nativeLanguage && { userAge: parseInt(age), userNativeLanguage: nativeLanguage }),
      });
      if (!text) setInput('');
    }
  };

  const handleStart = () => {
    if (!name.trim() || !age.trim()) return;
    handleSend(`Hi, I'm ${name.trim()}, I'm ${age} years old, I speak ${nativeLanguage}, and I want to learn ${language}!`);
  };

  return (
    <div className="fixed inset-0 flex bg-gradient-to-b from-amber-50/30 to-white overflow-hidden pt-[env(safe-area-inset-top)]">
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
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm px-3 py-2 sm:p-4 relative z-20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Image src="/buzz-128.png" alt="Buzz" width={40} height={40} className="flex-shrink-0 sm:w-20 sm:h-20" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-amber-900 truncate">Buzzling</h1>
                <p className="text-xs sm:text-sm text-amber-700 truncate">Learning {language}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {messages.length > 0 && (
                <>
                  <HoneyBalance />
                  <UserButton onNewChat={handleNewChat} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Messages - snap scroll container */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto snap-y snap-proximity">
        {messages.length === 0 && !isLoading && !isLoadingHistory && (
          <div className="min-h-full flex items-center justify-center snap-start p-4">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Image src="/buzz-192.png" alt="Buzz" width={160} height={160} className="mx-auto" />
                <Image
                  src={language === 'French' ? '/bonjour.png' : '/hello.png'}
                  alt={language === 'French' ? 'Bonjour' : 'Hello'}
                  width={100}
                  height={70}
                  className="absolute -top-2 -right-16 sm:-right-20"
                />
              </div>
              <p className="text-xl font-semibold mb-2 text-amber-900">Welcome to the hive!</p>
              <p className="text-sm mb-6 text-amber-800">
                Let's get started with your language journey!
              </p>
              <div className="flex flex-col items-center gap-4 w-full max-w-md">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  placeholder="What should we call you?"
                  className="w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 text-center text-base bg-white placeholder:text-amber-600 text-amber-900 border border-amber-200"
                />
                <input
                  type="text"
                  value={age}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (/^\d+$/.test(value) && value.length <= 3)) {
                      setAge(value);
                    }
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  placeholder="How old are you?"
                  className="w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 text-center text-base bg-white placeholder:text-amber-600 text-amber-900 border border-amber-200"
                  maxLength={3}
                />
                <div className="w-full">
                  <label className="block text-sm text-amber-800 mb-1 text-center">You want to learn:</label>
                  <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value as Language)}
                    className="w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 text-center text-base bg-white text-amber-900 border border-amber-200"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label className="block text-sm text-amber-800 mb-1 text-center">You speak:</label>
                  <select
                    value={nativeLanguage}
                    onChange={(e) => setNativeLanguage(e.target.value)}
                    className="w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 text-center text-base bg-white text-amber-900 border border-amber-200"
                  >
                    <option value="English">English</option>
                    <option value="German">German</option>
                  </select>
                </div>
                <button
                  onClick={handleStart}
                  disabled={!name.trim() || !age.trim()}
                  className="px-6 py-3 bg-amber-500 text-amber-950 font-semibold rounded-full hover:bg-amber-400 disabled:bg-amber-100 disabled:text-amber-400 disabled:cursor-not-allowed transition-colors"
                >
                  Let's Buzz!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Only show assistant messages - they contain all the context */}
        {messages
          .filter(message => message.role === 'assistant')
          .map((message, index, assistantMessages) => {
            console.log('[RENDER] Rendering completed message', { messageId: message.id, index, total: assistantMessages.length });
            return (
            <div
              key={message.id}
              className="min-h-full snap-start flex items-center justify-center p-4"
            >
              <div className="w-full max-w-2xl">
                <CorrectionDisplay
                  correction={message.content as TutorResponse}
                  isLatest={index === assistantMessages.length - 1}
                />
              </div>
            </div>
            );
          })}

        {/* Streaming response - only show if not already added to messages array */}
        {(() => {
          const shouldShow = isLoading && object && !streamingMessageIdRef.current;
          console.log('[RENDER] Streaming card', { shouldShow, isLoading, hasObject: !!object, hasStreamingId: !!streamingMessageIdRef.current });
          return shouldShow && (
          <div className="min-h-full snap-start flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <CorrectionDisplay correction={object} isLatest={true} />
            </div>
          </div>
          );
        })()}

        {isLoading && !streamingMessageIdRef.current && (
          <div className="min-h-full snap-start flex items-center justify-center p-4">
            <div className="text-center">
              <div className="animate-figure-8 mb-4">
                <Image src="/buzz-128.png" alt="Buzz thinking" width={80} height={80} />
              </div>
              <p className="text-amber-600 italic">Buzzing away...</p>
            </div>
          </div>
        )}
      </div>

        {/* Input - only show after conversation has started */}
        {messages.length > 0 && (
          <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm p-3 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <ChatInput
              ref={inputRef}
              input={input}
              setInput={setInput}
              onSend={handleSend}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
