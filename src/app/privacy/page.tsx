import { ShieldCheck, Mail, Server, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Jharkhand Express",
  description: "Read about how we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans">
      <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-slate-950 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4 flex items-center gap-4 text-slate-950">
            <ShieldCheck className="w-10 h-10 text-[#0D5C46]" />
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-slate max-w-none font-sans text-base leading-relaxed space-y-8">
          <section>
            <h2 className="text-2xl font-serif font-bold text-slate-950">1. Introduction</h2>
            <p>
              Jharkhand Express Media Group ("we", "our", "us") respects your privacy and is committed to protecting your digital personal data. This Privacy Policy informs you about how we collect, use, and protect your data when you visit our website (jharkhandexpress.com) in compliance with the Digital Personal Data Protection (DPDP) Act, 2023.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-helvetica font-bold">2. Data Collection and Purpose</h2>
            <p>
              We collect minimal personal data to improve your experience. Specifically, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong>Usage Data:</strong> Pages visited, reading time, and interaction metrics. This is collected via Google Analytics to improve editorial content and platform performance. We only process this data if you explicitly consent via our Cookie Consent banner.
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, operating system, and IP address for security and anti-abuse purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-helvetica font-bold">3. Your Rights (DPDP Act, 2023)</h2>
            <p>
              As a Data Principal, you have the following rights regarding your digital personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Right to Access:</strong> You can request a summary of the personal data we process about you.</li>
              <li><strong>Right to Correction & Erasure:</strong> You can request us to correct inaccurate data or erase your personal data when it is no longer needed.</li>
              <li><strong>Right to Grievance Redressal:</strong> You have the right to register grievances with our Data Protection Officer regarding your data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-helvetica font-bold">4. WhatsApp Channel</h2>
            <p>
              We offer a WhatsApp Channel for live updates. Joining this channel is strictly voluntary. When you join, your interactions are subject to WhatsApp's (Meta) Privacy Policy. Jharkhand Express does not extract, store, or process your WhatsApp phone number or profile information on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-helvetica font-bold">5. Grievance Redressal</h2>
            <p>
              For any privacy-related questions, to withdraw consent, or to exercise your rights under the DPDP Act, 2023, please contact our Grievance Officer:
            </p>
            <div className="bg-zinc-50 border border-zinc-200 p-6 mt-4 rounded-md inline-block">
              <p className="flex items-center gap-3 font-mono text-sm mb-2">
                <Mail className="w-4 h-4 text-zinc-500" />
                <a href="mailto:contact@jharkhandexpress.com" className="hover:text-red-600 transition-colors">
                  contact@jharkhandexpress.com
                </a>
              </p>
              <p className="flex items-center gap-3 font-mono text-sm text-zinc-500">
                <Server className="w-4 h-4" />
                Jharkhand Express Media Group — Data Desk
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
