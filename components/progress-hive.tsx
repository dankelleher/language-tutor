'use client';

import Image from 'next/image';
import { CEFR_LEVELS, getLevelIndex } from '@/lib/types';

interface ProgressHiveProps {
  currentLevel: string | null;
  stepsToNextLevel: number | null;
  compact?: boolean;
}

/**
 * A bee-themed progress indicator showing the user's language level
 * as a vertical hive with honeycomb cells. The bee climbs up as the user progresses.
 * In compact mode (mobile), shows half-hexagons peeking from the side with bee on top.
 */
export function ProgressHive({ currentLevel, stepsToNextLevel, compact = false }: ProgressHiveProps) {
  const currentLevelIndex = currentLevel
    ? getLevelIndex(currentLevel)
    : 0;

  const normalizedSteps = stepsToNextLevel ?? 5;
  const maxSteps = 5;
  const progressWithinLevel = Math.max(0, Math.min(1, 1 - (normalizedSteps / maxSteps)));

  if (compact) {
    return (
      <div className="flex flex-col items-start gap-0.5 py-2">
        {/* Level cells - reverse order so C2 is at top */}
        {[...CEFR_LEVELS].reverse().map((level, reverseIndex) => {
          const levelIndex = CEFR_LEVELS.length - 1 - reverseIndex;
          const isCurrentLevel = levelIndex === currentLevelIndex;
          const isCompleted = levelIndex < currentLevelIndex;
          const isFuture = levelIndex > currentLevelIndex;

          return (
            <div key={level} className="relative">
              {/* Half-hexagon cell peeking from left */}
              <div
                className={`
                  w-6 h-7 flex items-center justify-start pl-1
                  clip-hexagon-half transition-all duration-500
                  ${isCompleted
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
                    : isCurrentLevel
                      ? 'bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800'
                      : 'bg-amber-100/80 text-amber-400'
                  }
                `}
              >
                <span className={`text-[8px] font-bold ${isFuture ? 'opacity-50' : ''}`}>
                  {level}
                </span>
              </div>

              {/* Bee indicator on top of current level */}
              {isCurrentLevel && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 transition-all duration-700 ease-out"
                >
                  <Image src="/buzz-16.png" alt="Buzz" width={16} height={16} className="animate-bounce-gentle" />
                </div>
              )}
            </div>
          );
        })}

        {/* Steps indicator - compact dots */}
        {currentLevel && stepsToNextLevel !== null && stepsToNextLevel > 0 && (
          <div className="mt-1 ml-0.5">
            <div className="flex flex-col gap-0.5">
              {Array.from({ length: maxSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-full transition-colors ${
                    i < (maxSteps - normalizedSteps)
                      ? 'bg-amber-500'
                      : 'bg-amber-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 py-4 px-2">
      {/* Level cells - reverse order so C2 is at top */}
      {[...CEFR_LEVELS].reverse().map((level, reverseIndex) => {
        const levelIndex = CEFR_LEVELS.length - 1 - reverseIndex;
        const isCurrentLevel = levelIndex === currentLevelIndex;
        const isCompleted = levelIndex < currentLevelIndex;
        const isFuture = levelIndex > currentLevelIndex;

        return (
          <div key={level} className="relative">
            {/* Honeycomb cell */}
            <div
              className={`
                w-12 h-10 flex items-center justify-center
                clip-hexagon transition-all duration-500
                ${isCompleted
                  ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white'
                  : isCurrentLevel
                    ? 'bg-gradient-to-br from-amber-200 to-amber-300 text-amber-800'
                    : 'bg-amber-100/80 text-amber-400'
                }
              `}
            >
              <span className={`text-xs font-bold ${isFuture ? 'opacity-50' : ''}`}>
                {level}
              </span>
            </div>

            {/* Bee indicator for current level */}
            {isCurrentLevel && (
              <div
                className="absolute -right-5 transition-all duration-700 ease-out"
                style={{
                  top: `${50 - (progressWithinLevel * 40)}%`,
                  transform: 'translateY(-50%)'
                }}
              >
                <Image src="/buzz-32.png" alt="Buzz" width={24} height={24} className="animate-bounce-gentle" />
              </div>
            )}

            {/* Honey drip for completed levels */}
            {isCompleted && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full opacity-60" />
            )}
          </div>
        );
      })}

      {/* Steps indicator */}
      {currentLevel && stepsToNextLevel !== null && stepsToNextLevel > 0 && (
        <div className="mt-2 text-center">
          <div className="flex gap-0.5 justify-center mb-1">
            {Array.from({ length: maxSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i < (maxSteps - normalizedSteps)
                    ? 'bg-amber-500'
                    : 'bg-amber-200'
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-amber-600 leading-tight">
            {stepsToNextLevel} step{stepsToNextLevel !== 1 ? 's' : ''} to
            <br />next level
          </p>
        </div>
      )}
    </div>
  );
}
