'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { StreamingTutorResponse } from '@/lib/types';

interface CorrectionDisplayProps {
  correction: StreamingTutorResponse;
}

type PartInfo = {
  text: string;
  translation?: string;
  notes?: string;
};

interface SentenceWithPartsProps {
  sentence: string;
  parts?: (Partial<PartInfo> | undefined)[];
}

interface SentenceSegment {
  text: string;
  part?: PartInfo;
}

const parseSentenceWithParts = (sentence: string, parts?: (Partial<PartInfo> | undefined)[]): SentenceSegment[] => {
  const validParts = (parts ?? []).filter((p): p is PartInfo => !!p?.text);

  if (validParts.length === 0) {
    return [{ text: sentence }];
  }

  const segments: SentenceSegment[] = [];
  let remaining = sentence;
  let position = 0;

  while (remaining.length > 0) {
    let earliestMatch: { index: number; part: PartInfo } | null = null;

    for (const part of validParts) {
      const index = remaining.indexOf(part.text);
      if (index !== -1 && (earliestMatch === null || index < earliestMatch.index)) {
        earliestMatch = { index, part };
      }
    }

    if (earliestMatch === null) {
      segments.push({ text: remaining });
      break;
    }

    if (earliestMatch.index > 0) {
      segments.push({ text: remaining.slice(0, earliestMatch.index) });
    }

    segments.push({
      text: earliestMatch.part.text,
      part: earliestMatch.part,
    });

    remaining = remaining.slice(earliestMatch.index + earliestMatch.part.text.length);
    position += earliestMatch.index + earliestMatch.part.text.length;
  }

  return segments;
};

const SentenceWithParts = ({ sentence, parts }: SentenceWithPartsProps) => {
  const [selectedPart, setSelectedPart] = useState<PartInfo | null>(null);
  const segments = parseSentenceWithParts(sentence, parts);

  return (
    <span>
      {segments.map((segment, idx) =>
        segment.part ? (
          <button
            key={idx}
            onClick={() => setSelectedPart(selectedPart === segment.part ? null : segment.part!)}
            className={`underline decoration-purple-400 decoration-2 underline-offset-2 hover:bg-purple-100 rounded px-0.5 transition-colors ${
              selectedPart === segment.part ? 'bg-purple-200' : ''
            }`}
          >
            {segment.text}
          </button>
        ) : (
          <span key={idx}>{segment.text}</span>
        )
      )}
      {selectedPart && (
        <span className="block mt-2 p-2 bg-purple-50 rounded text-xs border border-purple-200">
          <span className="font-semibold text-purple-700">{selectedPart.text}</span>
          {selectedPart.translation && (
            <span className="text-purple-600"> → {selectedPart.translation}</span>
          )}
          {selectedPart.notes && (
            <span className="block mt-1 text-gray-600">{selectedPart.notes}</span>
          )}
        </span>
      )}
    </span>
  );
};

export function CorrectionDisplay({ correction }: CorrectionDisplayProps) {
  const [selectedExplanation, setSelectedExplanation] = useState<number | null>(null);
  const explanationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (explanationsRef.current && !explanationsRef.current.contains(event.target as Node)) {
        setSelectedExplanation(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!correction) return null;

  return (
    <div className="space-y-3">
      {/* Chat Message from Tutor */}
      {correction.chatMessage && (
        <p className="text-sm">{correction.chatMessage}</p>
      )}

      {/* Submitted Translation */}
      {correction.submittedSentence && (
        <div className={correction.chatMessage ? 'border-t pt-3 border-gray-300' : ''}>
          <p className="text-xs font-semibold text-gray-600 mb-1">Your Translation:</p>
          <p className="text-sm italic">{correction.submittedSentence}</p>
        </div>
      )}

      {/* Correct Translation */}
      {correction.correctedResponse && (
        <div>
          <p className="text-xs font-semibold text-green-700 mb-1">✓ Correct Translation:</p>
          <p className="text-sm font-medium">{correction.correctedResponse}</p>
        </div>
      )}

      {/* Explanations */}
      {correction.explanations && correction.explanations.filter(Boolean).length > 0 && (
        <div ref={explanationsRef}>
          <p className="text-xs font-semibold text-orange-700 mb-2">💡 Explanations:</p>
          <div className="space-y-2">
            {correction.explanations.filter(Boolean).map((explanation, idx) => (
              <div key={idx} className="relative">
                <Card
                  className="bg-orange-50 border-orange-200 cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                  onClick={() => setSelectedExplanation(selectedExplanation === idx ? null : idx)}
                >
                  <CardContent className="p-3 pr-6">
                    <p className="text-sm">{explanation}</p>
                  </CardContent>
                </Card>
                <button
                  className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 border border-orange-200 rounded-full hover:bg-orange-200 whitespace-nowrap shadow-sm transition-all duration-200 ${
                    selectedExplanation === idx
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-90 pointer-events-none'
                  }`}
                >
                  Learn more &gt;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level Assessment */}
      {correction.evaluatedLevel && (
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-gray-600">Current Level:</p>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
            {correction.evaluatedLevel}
          </span>
        </div>
      )}

      {/* Next Challenge */}
      {correction.nextExercise?.fullSentence && (
        <div className="border-t pt-3 mt-3 border-gray-300">
          <p className="text-xs font-semibold text-purple-700 mb-2">🎯 Next Challenge:</p>
          <p className="text-sm font-medium bg-white/50 p-2 rounded">
            <SentenceWithParts
              sentence={correction.nextExercise.fullSentence}
              parts={correction.nextExercise.parts}
            />
          </p>
        </div>
      )}
    </div>
  );
}
