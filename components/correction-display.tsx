'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { StreamingTutorResponse } from '@/lib/types';

interface CorrectionDisplayProps {
  correction: StreamingTutorResponse;
  isLatest?: boolean;
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
  }

  return segments;
};

const SentenceWithParts = ({ sentence, parts }: SentenceWithPartsProps) => {
  const [selectedPart, setSelectedPart] = useState<PartInfo | null>(null);
  const segments = parseSentenceWithParts(sentence, parts);

  return (
    <div>
      <p className="text-lg sm:text-xl font-bold text-amber-950 leading-relaxed">
        {segments.map((segment, idx) =>
          segment.part ? (
            <button
              key={idx}
              onClick={() => setSelectedPart(selectedPart === segment.part ? null : segment.part!)}
              className={`underline decoration-amber-800 decoration-2 underline-offset-4 hover:bg-amber-300/50 rounded px-0.5 transition-colors ${
                selectedPart === segment.part ? 'bg-amber-300/70' : ''
              }`}
            >
              {segment.text}
            </button>
          ) : (
            <span key={idx}>{segment.text}</span>
          )
        )}
      </p>
      {selectedPart && (
        <div className="mt-4 p-3 bg-amber-950/20 rounded-xl">
          <p className="font-bold text-amber-950">{selectedPart.text}</p>
          {selectedPart.translation && (
            <p className="text-amber-950 mt-1 font-medium">→ {selectedPart.translation}</p>
          )}
          {selectedPart.notes && (
            <p className="text-amber-900 mt-2 text-sm">{selectedPart.notes}</p>
          )}
        </div>
      )}
    </div>
  );
};

export function CorrectionDisplay({ correction, isLatest = false }: CorrectionDisplayProps) {
  const [expandedExplanation, setExpandedExplanation] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setExpandedExplanation(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!correction) return null;

  const hasCorrection = correction.submittedSentence || correction.correctedResponse;
  const hasExplanations = correction.explanations && correction.explanations.filter(Boolean).length > 0;
  const hasNextExercise = correction.nextExercise?.fullSentence;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Hero Section - Chat Message */}
      {correction.chatMessage && (
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-5 py-3 shadow-sm">
            <Image src="/buzz-32.png" alt="Buzz" width={32} height={32} />
            <p className="text-amber-900 font-medium">{correction.chatMessage}</p>
          </div>
        </div>
      )}

      {/* Correction Section */}
      {hasCorrection && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 sm:p-6 space-y-4">
          {correction.submittedSentence && (
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Your attempt</p>
              <p className="text-amber-800 italic">{correction.submittedSentence}</p>
            </div>
          )}

          {correction.correctedResponse && (
            <div className="pt-3 border-t border-amber-100">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <span className="text-base">✓</span> Correct version
              </p>
              <p className="text-amber-900 font-medium text-lg">{correction.correctedResponse}</p>
            </div>
          )}
        </div>
      )}

      {/* Explanations Section */}
      {hasExplanations && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide px-1">Tips & Explanations</p>
          <div className="flex flex-wrap gap-2">
            {correction.explanations?.filter(Boolean).map((explanation, idx) => (
              <button
                key={idx}
                onClick={() => setExpandedExplanation(expandedExplanation === idx ? null : idx)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  expandedExplanation === idx
                    ? 'bg-amber-500 text-amber-950'
                    : 'bg-amber-100/80 text-amber-800 hover:bg-amber-200/80'
                }`}
              >
                💡 Tip {idx + 1}
              </button>
            ))}
          </div>
          {expandedExplanation !== null && correction.explanations?.[expandedExplanation] && (
            <div className="bg-amber-50/80 rounded-2xl p-4 mt-2">
              <p className="text-amber-900">{correction.explanations[expandedExplanation]}</p>
            </div>
          )}
        </div>
      )}

      {/* Next Challenge Section - Prominent Card */}
      {hasNextExercise && (
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-3xl p-5 sm:p-6 shadow-lg">
          <p className="text-xs font-bold text-amber-950 uppercase tracking-wide mb-3">
            🎯 Translate this
          </p>
          <SentenceWithParts
            sentence={correction.nextExercise!.fullSentence!}
            parts={correction.nextExercise!.parts}
          />
          <p className="text-xs font-medium text-amber-900 mt-4">
            Tap the underlined words for hints
          </p>
        </div>
      )}

      {/* Level Progress - Subtle Footer */}
      {correction.progress?.evaluatedLevel && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className="text-xs text-amber-600">Current Level</span>
          <span className="px-3 py-1 bg-amber-400/80 text-amber-900 rounded-full text-sm font-bold">
            {correction.progress.evaluatedLevel}
          </span>
          {correction.progress.stepsToNextLevel !== undefined && correction.progress.stepsToNextLevel > 0 && (
            <span className="text-xs text-amber-600">
              {correction.progress.stepsToNextLevel} step{correction.progress.stepsToNextLevel !== 1 ? 's' : ''} to level up
            </span>
          )}
        </div>
      )}
    </div>
  );
}
