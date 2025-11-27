'use client';

import type { UIMessage } from 'ai';
import { CorrectionDisplay } from './correction-display';

interface MessageProps {
  message: UIMessage;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-2xl rounded-lg p-4 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {message.parts.map((part, index) => {
          // Handle text parts
          if (part.type === 'text') {
            return (
              <div key={index} className="whitespace-pre-wrap">
                {part.text}
              </div>
            );
          }

          // Handle tool invocation parts (tool-provideCorrection)
          if (part.type === 'tool-provideCorrection') {
            const toolPart = part as {
              type: string;
              toolCallId: string;
              state: string;
              input: Record<string, unknown>;
              output?: { success: boolean; correction: Record<string, unknown> };
            };

            // Only show correction when output is available
            if (toolPart.state === 'output-available' && toolPart.output?.correction) {
              return (
                <CorrectionDisplay
                  key={index}
                  correction={toolPart.output.correction}
                />
              );
            }

            // Show loading state while tool is executing
            if (toolPart.state === 'input-available' || toolPart.state === 'input-streaming') {
              return (
                <div key={index} className="text-sm text-gray-500 italic">
                  Analyzing your translation...
                </div>
              );
            }
          }

          return null;
        })}
      </div>
    </div>
  );
}
