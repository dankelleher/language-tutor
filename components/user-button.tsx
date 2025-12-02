'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User, Plus } from 'lucide-react';

interface UserButtonProps {
  onNewChat?: () => void;
}

export function UserButton({ onNewChat }: UserButtonProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const initials = session.user.email
    ?.split('@')[0]
    .slice(0, 2)
    .toUpperCase() ?? '??';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-honey-100 hover:bg-honey-200 text-honey-700 font-medium text-sm transition-colors border border-honey-300"
        title={session.user.email ?? 'User'}
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-honey-200 py-1 z-50">
          <div className="px-4 py-3 border-b border-honey-100">
            <div className="flex items-center gap-2 text-honey-700">
              <User size={16} />
              <span className="text-sm font-medium truncate">
                {session.user.email}
              </span>
            </div>
          </div>

          {onNewChat && (
            <button
              onClick={() => {
                onNewChat();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-honey-700 hover:bg-honey-50 flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              New chat session
            </button>
          )}

          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="w-full px-4 py-2 text-left text-sm text-honey-700 hover:bg-honey-50 flex items-center gap-2 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
