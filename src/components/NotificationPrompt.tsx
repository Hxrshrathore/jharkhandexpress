/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bell, X } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPromptProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationPrompt({ visible, onClose }: NotificationPromptProps) {
  if (!visible) return null;

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

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

      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VAPID public key not found');
        onClose();
        return;
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Send to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      toast.success('Successfully subscribed to notifications!');
      onClose();
    } catch (err) {
      console.error('Subscription error:', err);
      toast.error('Failed to subscribe to notifications.');
      onClose();
    }
  };

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
