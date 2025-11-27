'use client';

import { useState } from 'react';
import { Chat } from '@/components/chat';
import { type Language } from '@/lib/types';

export default function Home() {
  const [language, setLanguage] = useState<Language>('German');

  return (
    <main className="min-h-screen bg-gradient-to-b from-honey-50 to-white">
      <Chat language={language} onLanguageChange={setLanguage} />
    </main>
  );
}
