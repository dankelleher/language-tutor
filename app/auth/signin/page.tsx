'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

const isDev = process.env.NODE_ENV === 'development';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    await signIn('resend', { email, callbackUrl: '/' });
  };

  const handleDevLogin = async () => {
    setIsLoading(true);
    await signIn('credentials', { email: 'dev@localhost', callbackUrl: '/' });
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-b from-honey-50 to-white p-4">
      <div className="max-w-md w-full p-6 sm:p-8 bg-white rounded-xl shadow-lg border border-honey-100">
        <div className="text-center mb-6">
          <Image src="/buzz-64.png" alt="Buzz" width={64} height={64} className="mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-honey-800">Buzzling</h1>
          <p className="text-honey-600 mt-1">
            Join the hive and start learning!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-honey-700 mb-1">
              Your email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
              placeholder="busy.bee@example.com"
              required
              className="w-full px-4 py-2 border border-honey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-400 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full py-2 px-4 bg-honey-500 text-white rounded-lg hover:bg-honey-600 disabled:bg-honey-200 disabled:text-honey-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
          >
            {isLoading ? 'Sending...' : 'Send me a magic link'}
          </button>
        </form>

        <p className="mt-4 text-xs text-honey-500 text-center">
          We'll send a sweet little link to your inbox
        </p>

        {isDev && (
          <div className="mt-6 pt-4 border-t border-honey-200">
            <button
              onClick={handleDevLogin}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors text-sm"
            >
              Dev Login (localhost only)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
