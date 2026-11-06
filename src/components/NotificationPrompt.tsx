/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPromptProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationPrompt({ visible, onClose }: NotificationPromptProps) {
  // Convert URL-safe base64 string to Uint8Array, hardening against pattern mismatch errors
  const urlBase64ToUint8Array = (base64String: string) => {
    try {
      const cleanBase64 = (base64String || '').trim().replace(/^["']+|["']+$/g, '');
      const padding = '='.repeat((4 - (cleanBase64.length % 4)) % 4);
      const base64 = (cleanBase64 + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    } catch (e: any) {
      console.error('Failed to convert VAPID key to Uint8Array:', e);
      throw new Error(`Invalid VAPID key format: ${e?.message || e}`);
    }
  };

  const syncPushSubscription = async (showSuccessToast = false) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      if (showSuccessToast) toast.error('Push notifications are not supported by your browser.');
      return false;
    }

    const rawVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!rawVapidKey) {
      console.warn('VAPID public key not found in NEXT_PUBLIC_VAPID_PUBLIC_KEY');
      return false;
    }

    // 1. Ensure service worker is registered AND ready before requesting push subscription
    await navigator.serviceWorker.register('/sw.js');
    const registration = await navigator.serviceWorker.ready;

    // 2. Check for existing subscription or request a new one
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(rawVapidKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    if (!subscription) {
      throw new Error('Unable to obtain push subscription from browser PushManager');
    }

    // 3. Send subscription to server with HTTP response validation
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    const contentType = res.headers.get('content-type') || '';
    let result: any = {};
    if (contentType.includes('application/json')) {
      result = await res.json();
    } else {
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`Subscription server error ${res.status}: ${text.slice(0, 150)}`);
      }
      try {
        result = JSON.parse(text);
      } catch {
        // Fallback for non-JSON responses
      }
    }

    if (!res.ok || result.error) {
      throw new Error(result.error || `Subscription failed with server status ${res.status}`);
    }

    if (showSuccessToast) {
      toast.success('Successfully subscribed to notifications!');
    }
    return true;
  };

  // Automatic background device synchronisation for users who have already granted notification permissions
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      syncPushSubscription(false).catch((err) => {
        console.warn('Background push subscription sync:', err?.message || err);
      });
    }
  }, []);

  const handleSubscribe = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error('Push notifications are not supported by your browser.');
        onClose();
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        onClose();
        return;
      }

      await syncPushSubscription(true);
      onClose();
    } catch (err: any) {
      console.error('Subscription error:', err);
      toast.error('Failed to subscribe to notifications: ' + (err?.message || 'Unknown error'));
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div className="bg-brand-black text-white px-6 py-2.5 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-3">
        <img src="/logo-small.webp" alt="Jharkhand Express" className="w-5 h-5 object-contain rounded-full" />
        <Bell className="w-4 h-4 text-brand-red animate-pulse" />
        <p className="text-[10px] font-mono tracking-widest uppercase">
          Enable real-time intelligence protocols for instant updates.
        </p>
      </div>
      <div className="flex items-center gap-6">
        <button 
          onClick={handleSubscribe}
          className="text-[9px]  tracking-widest uppercase px-3 py-1.5 border border-white/20 hover:bg-white hover:text-brand-black transition-all cursor-pointer font-bold"
        >
          Allow Notifications
        </button>
        <button onClick={onClose} className="opacity-40 hover:opacity-100 cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
