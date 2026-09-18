"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("je_cookie_consent");
    if (!consent) {
      setShowBanner(true);
    } else if (consent === "accepted") {
      window.dispatchEvent(new Event("cookie_consent_accepted"));
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("je_cookie_consent", "accepted");
    setShowBanner(false);
    window.dispatchEvent(new Event("cookie_consent_accepted"));
  };

  const handleDecline = () => {
    localStorage.setItem("je_cookie_consent", "declined");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto bg-black text-white p-6 shadow-2xl pointer-events-auto border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-helvetica font-bold text-lg mb-2">Respecting Your Privacy</h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-helvetica">
                We use cookies and analytical tracking to improve your experience and deliver relevant news. 
                By clicking "Accept", you consent to our use of these technologies in accordance with the Digital Personal Data Protection (DPDP) Act, 2023. 
                <a href="/privacy" className="underline underline-offset-2 ml-1 text-white hover:text-red-500">Read our Privacy Policy</a>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={handleDecline}
                className="px-6 py-2 border border-zinc-700 text-zinc-300 text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2 bg-red-600 text-white text-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
