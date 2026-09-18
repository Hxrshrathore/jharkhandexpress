'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Send, MapPin, Phone, Mail } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    sendGAEvent('event', 'contact_submit', { method: 'form' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Contact Desk.</h1>
              <p className="text-brand-black/60 leading-relaxed max-w-md">
                Have a tip, partnership inquiry, or technical issue? Reach out to our dedicated desks and we'll get back to you promptly.
              </p>
            </div>
            
            <div className="space-y-6 pt-4 border-t-2 border-brand-black/10">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-brand-red mt-1" />
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-widest mb-1">Headquarters</h3>
                  <p className="text-brand-black/70 text-sm">Jharkhand Express Media<br />Ranchi, Jharkhand, India</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-brand-red mt-1" />
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-widest mb-1">General Inquiries</h3>
                  <a href="mailto:contact@jharkhandexpress.com" className="text-brand-black/70 text-sm hover:text-brand-red transition-colors">contact@jharkhandexpress.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-brand-red mt-1" />
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-widest mb-1">Tipline</h3>
                  <p className="text-brand-black/70 text-sm">+91 1800-TRUTH</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 border border-brand-black/10 shadow-sm relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-red" />
            <h2 className="text-xl font-bold mb-6">Send a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-brand-black/20 p-3 text-sm focus:border-brand-black outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-brand-black/20 p-3 text-sm focus:border-brand-black outline-none transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">Subject</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full border border-brand-black/20 p-3 text-sm focus:border-brand-black outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">Message</label>
                <textarea 
                  required 
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full border border-brand-black/20 p-3 text-sm focus:border-brand-black outline-none transition-colors resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-brand-black text-white p-4 text-[10px] font-bold tracking-widest uppercase hover:bg-brand-red transition-all flex items-center justify-center gap-2 mt-4"
              >
                {status === 'loading' ? 'Sending...' : 'Transmit Message'} <Send className="w-3.5 h-3.5" />
              </button>

              {status === 'success' && (
                <div className="p-3 bg-green-50 text-green-700 text-sm border border-green-200 mt-4 text-center">
                  Your message has been received successfully.
                </div>
              )}
              {status === 'error' && (
                <div className="p-3 bg-red-50 text-red-700 text-sm border border-red-200 mt-4 text-center">
                  There was an error sending your message. Please try again later.
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-zinc-50 border-t border-zinc-200 py-8 mt-16 text-center">
        <p className="text-xs text-zinc-500 font-medium">
          © {new Date().getFullYear()} Jharkhand Express Media. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
