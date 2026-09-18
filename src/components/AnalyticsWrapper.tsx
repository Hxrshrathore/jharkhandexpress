"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from '@next/third-parties/google';

export default function AnalyticsWrapper({ gaId }: { gaId: string }) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("je_cookie_consent");
    if (consent === "accepted") {
      setHasConsent(true);
    }

    const handleConsent = () => {
      setHasConsent(true);
    };

    window.addEventListener("cookie_consent_accepted", handleConsent);
    return () => window.removeEventListener("cookie_consent_accepted", handleConsent);
  }, []);

  if (!hasConsent) return null;

  return <GoogleAnalytics gaId={gaId} />;
}
