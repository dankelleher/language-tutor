'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Bee {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
  duration: number;
  path: 'left' | 'right' | 'up';
  endX: string;
  endY: string;
  endRotate: string;
}

interface BeeCelebrationProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function BeeCelebration({ isActive, onComplete }: BeeCelebrationProps) {
  const [bees, setBees] = useState<Bee[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate a swarm of bees
      const newBees: Bee[] = Array.from({ length: 20 }, (_, i) => {
        const path = ['left', 'right', 'up'][Math.floor(Math.random() * 3)] as 'left' | 'right' | 'up';
        const rotation = Math.random() * 360;
        return {
          id: i,
          x: 45 + Math.random() * 10, // Start near center
          y: 50,
          rotation,
          scale: 0.6 + Math.random() * 0.8,
          delay: Math.random() * 0.3,
          duration: 1.5 + Math.random() * 1,
          path,
          endX: path === 'left' ? '-100px' : path === 'right' ? '100px' : `${(Math.random() - 0.5) * 150}px`,
          endY: path === 'up' ? '-400px' : `-${200 + Math.random() * 200}px`,
          endRotate: `${rotation + (Math.random() - 0.5) * 720}deg`,
        };
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBees(newBees);

      // Clear after animation
      const timer = setTimeout(() => {
        setBees([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive || bees.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {bees.map((bee) => (
        <div
          key={bee.id}
          className="absolute text-2xl animate-bee-fly"
          style={{
            left: `${bee.x}%`,
            top: `${bee.y}%`,
            transform: `scale(${bee.scale})`,
            animationDelay: `${bee.delay}s`,
            animationDuration: `${bee.duration}s`,
            '--bee-end-x': bee.endX,
            '--bee-end-y': bee.endY,
            '--bee-rotate': bee.endRotate,
          } as React.CSSProperties}
        >
          <Image src="/buzz-32.png" alt="Buzz" width={32} height={32} />
        </div>
      ))}

      {/* Celebration text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-level-up-text text-4xl font-bold text-honey-600 drop-shadow-lg">
          Level Up! 🎉
        </div>
      </div>
    </div>
  );
}
