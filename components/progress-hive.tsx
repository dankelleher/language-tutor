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
 * as a vertical hive with honeycomb cells in a zigzag pattern.
 * The bee climbs up as the user progresses.
 */
export function ProgressHive({ currentLevel, stepsToNextLevel, compact = false }: ProgressHiveProps) {
  const currentLevelIndex = currentLevel
    ? getLevelIndex(currentLevel)
    : 0;

  const normalizedSteps = stepsToNextLevel ?? 5;
  const maxSteps = 5;
  const progressWithinLevel = Math.max(0, Math.min(1, 1 - (normalizedSteps / maxSteps)));

  // Honeycomb cell dimensions
  const cellSize = compact ? 28 : 40;
  const cellOverlap = compact ? 8 : 12; // How much cells overlap vertically for zigzag

  if (compact) {
    return (
      <div className="flex flex-col items-start py-2" style={{ gap: `-${cellOverlap}px` }}>
        {/* Level cells - reverse order so C2 is at top */}
        {[...CEFR_LEVELS].reverse().map((level, reverseIndex) => {
          const levelIndex = CEFR_LEVELS.length - 1 - reverseIndex;
          const isCurrentLevel = levelIndex === currentLevelIndex;
          const isCompleted = levelIndex < currentLevelIndex;
          const isFuture = levelIndex > currentLevelIndex;
          const isEvenRow = reverseIndex % 2 === 0;

          return (
            <div
              key={level}
              className="relative"
              style={{
                marginLeft: isEvenRow ? '0' : `${cellSize * 0.3}px`,
                marginTop: reverseIndex === 0 ? '0' : `-${cellOverlap}px`
              }}
            >
              {/* Honeycomb cell */}
              <div
                className="relative flex items-center justify-center"
                style={{ width: cellSize, height: cellSize }}
              >
                <Image
                  src="/honeycomb.png"
                  alt=""
                  width={cellSize}
                  height={cellSize}
                  className={`absolute inset-0 transition-all duration-500 ${
                    isCompleted
                      ? 'brightness-100 saturate-100'
                      : isCurrentLevel
                        ? 'brightness-95 saturate-75'
                        : 'brightness-75 saturate-50 opacity-60'
                  }`}
                />
                <span className={`relative z-10 text-[9px] font-bold ${
                  isCompleted || isCurrentLevel ? 'text-amber-900' : 'text-amber-700/50'
                } ${isFuture ? 'opacity-50' : ''}`}>
                  {level}
                </span>
              </div>

              {/* Bee indicator on current level */}
              {isCurrentLevel && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                  <Image src="/buzz-16.png" alt="Buzz" width={16} height={16} className="animate-bounce-gentle" />
                </div>
              )}
            </div>
          );
        })}

        {/* Steps indicator - compact dots */}
        {currentLevel && stepsToNextLevel !== null && stepsToNextLevel > 0 && (
          <div className="mt-2 ml-1">
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
    <div className="flex flex-col items-center py-4 px-3">
      {/* Level cells - reverse order so C2 is at top */}
      {[...CEFR_LEVELS].reverse().map((level, reverseIndex) => {
        const levelIndex = CEFR_LEVELS.length - 1 - reverseIndex;
        const isCurrentLevel = levelIndex === currentLevelIndex;
        const isCompleted = levelIndex < currentLevelIndex;
        const isFuture = levelIndex > currentLevelIndex;
        const isEvenRow = reverseIndex % 2 === 0;

        return (
          <div
            key={level}
            className="relative"
            style={{
              marginLeft: isEvenRow ? '0' : `${cellSize * 0.4}px`,
              marginTop: reverseIndex === 0 ? '0' : `-${cellOverlap}px`
            }}
          >
            {/* Honeycomb cell */}
            <div
              className="relative flex items-center justify-center"
              style={{ width: cellSize, height: cellSize }}
            >
              <Image
                src="/honeycomb.png"
                alt=""
                width={cellSize}
                height={cellSize}
                className={`absolute inset-0 transition-all duration-500 ${
                  isCompleted
                    ? 'brightness-100 saturate-100'
                    : isCurrentLevel
                      ? 'brightness-95 saturate-75'
                      : 'brightness-75 saturate-50 opacity-60'
                }`}
              />
              <span className={`relative z-10 text-xs font-bold ${
                isCompleted || isCurrentLevel ? 'text-amber-900' : 'text-amber-700/50'
              } ${isFuture ? 'opacity-50' : ''}`}>
                {level}
              </span>
            </div>

            {/* Bee indicator for current level */}
            {isCurrentLevel && (
              <div
                className="absolute -right-6 z-20 transition-all duration-700 ease-out"
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
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10">
                <Image src="/honeydrop.png" alt="" width={8} height={10} className="opacity-70" />
              </div>
            )}
          </div>
        );
      })}

      {/* Steps indicator */}
      {currentLevel && stepsToNextLevel !== null && stepsToNextLevel > 0 && (
        <div className="mt-3 text-center">
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
          <p className="text-[10px] text-amber-700 leading-tight">
            {stepsToNextLevel} step{stepsToNextLevel !== 1 ? 's' : ''} to
            <br />next level
          </p>
        </div>
      )}
    </div>
  );
}
