"use client";
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, setIsPending] = useState(false);
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
        setErrorMessage('Invalid credentials.');
        setIsPending(false);
      } else if (res?.ok) {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setErrorMessage('Something went wrong.');
      setIsPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-muted selection:text-foreground relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-200 h-125 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-b from-blue-500/30 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-background/80 backdrop-blur-xl border border-border p-10 rounded-2xl shadow-2xl">
          <div className="mb-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-muted border border-border rounded-full flex items-center justify-center mb-6 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-zinc-300" />
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">JHARKHAND EXPRESS</h1>
            <p className="text-muted-foreground mt-2 text-sm font-medium uppercase tracking-widest">Admin Workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Enter Passkey"
                  className="w-full bg-background/50 border border-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pl-12 pr-4 py-4 text-foreground outline-none font-mono tracking-widest transition-all rounded-xl shadow-inner placeholder:text-zinc-700"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? 'Authenticating...' : 'Access Workspace'}
              {!isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
            
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-sm text-center font-medium backdrop-blur-sm">
                {errorMessage}
              </div>
            )}
          </form>
        </div>
        
        <div className="mt-8 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Secured by NextAuth
        </div>
      </div>
    </main>
  );
}
