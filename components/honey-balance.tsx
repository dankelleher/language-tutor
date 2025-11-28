'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

interface HoneyBalanceProps {
  className?: string;
}

/**
 * Displays the user's honey balance with a honeydrop icon.
 * Fetches the balance from the API and updates on mount.
 * Listens for 'honey-updated' custom events to refresh the balance.
 */
export function HoneyBalance({ className = '' }: HoneyBalanceProps) {
  const [honey, setHoney] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHoney = useCallback(async () => {
    try {
      const response = await fetch('/api/user/honey');
      if (response.ok) {
        const data = await response.json();
        setHoney(data.honey);
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
    return () => window.removeEventListener('honey-updated', handleHoneyUpdate);
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
        className="flex-shrink-0"
      />
      <span className="text-sm font-bold text-amber-700">{honey}</span>
    </div>
  );
}
