"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { BRAND } from '@/lib/brand';

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage('');
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    
    try {
      const res = await signIn('credentials', {
        password,
        redirect: false,
      });
      
      if (res?.error) {
        setErrorMessage('Incorrect password. Please try again.');
        setIsPending(false);
      } else if (res?.ok) {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setErrorMessage('Network error. Please try again.');
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col justify-between items-center p-6 font-sans">
      {/* Top Header with Back Link */}
      <header className="w-full max-w-sm flex items-center justify-start pt-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to site</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-sm my-auto">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs">
          {/* Brand Logo & Editorial Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <Link href="/" className="mb-4 inline-block">
              <Image
                src="/logo.webp"
                alt={BRAND.name}
                width={72}
                height={72}
                priority
                className="object-contain"
              />
            </Link>
            
            <h1 className="font-serif font-bold text-2xl text-slate-900 tracking-tight">
              {BRAND.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Staff and Editorial Sign In
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="password" 
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  autoFocus
                  placeholder="Enter your password"
                  className="w-full bg-white border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-lg py-2.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Minimal Support Note */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          Authorized personnel only. Need access? Contact the editor desk.
        </p>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-sm text-center py-4 text-[11px] text-slate-400">
        © {new Date().getFullYear()} {BRAND.name}
      </footer>
    </div>
  );
}
