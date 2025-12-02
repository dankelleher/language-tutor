'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';

interface HoneyBalanceProps {
  className?: string;
}

/**
 * Displays the user's honey balance with a honeydrop icon.
 * Fetches the balance from the API and updates on mount.
 * Listens for 'honey-updated' custom events to refresh the balance.
 * Animates the coin when honey is earned.
 */
export function HoneyBalance({ className = '' }: HoneyBalanceProps) {
  const [honey, setHoney] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousHoneyRef = useRef<number | null>(null);

  const fetchHoney = useCallback(async () => {
    try {
      const response = await fetch('/api/user/honey');
      if (response.ok) {
        const data = await response.json();
        const newHoney = data.honey;

        // Check if honey increased (earned a coin)
        if (previousHoneyRef.current !== null && newHoney > previousHoneyRef.current) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 600);
        }

        previousHoneyRef.current = newHoney;
        setHoney(newHoney);
      }
    } catch (error) {
      console.error('Failed to fetch honey balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHoney();

    // Listen for honey updates from other components
    const handleHoneyUpdate = () => fetchHoney();
    window.addEventListener('honey-updated', handleHoneyUpdate);

    // Listen for test animation trigger
    const handleTestAnimation = () => {
      previousHoneyRef.current = 0;
      fetchHoney();
    };
    window.addEventListener('honey-test-animation', handleTestAnimation);

    return () => {
      window.removeEventListener('honey-updated', handleHoneyUpdate);
      window.removeEventListener('honey-test-animation', handleTestAnimation);
    };
  }, [fetchHoney]);

  if (isLoading || honey === null) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Image
        src="/coin.png"
        alt="Honey"
        width={20}
        height={20}
        className={`flex-shrink-0 transition-transform ${
          isAnimating ? 'animate-coin-earned' : ''
        }`}
      />
      <span className={`text-sm font-bold text-amber-700 ${isAnimating ? 'animate-pulse' : ''}`}>
        {honey}
      </span>
    </div>
  );
}
