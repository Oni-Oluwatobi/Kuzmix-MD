'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Link2,
  LayoutGrid,
  HelpCircle,
  Info,
  ChevronDown,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
  Zap,
} from 'lucide-react';

const COUNTRY_CODES = [
  { code: '234', iso: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: '233', iso: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: '254', iso: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: '27', iso: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: '1', iso: 'US', name: 'USA / Canada', flag: '🇺🇸' },
  { code: '44', iso: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '91', iso: 'IN', name: 'India', flag: '🇮🇳' },
  { code: '971', iso: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: '256', iso: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: '255', iso: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
];

type LiveStatus = 'idle' | 'requesting' | 'verifying' | 'connected' | 'error';

interface PairingPortalProps {
  botName?: string;
  developerName?: string;
  organization?: string;
}

const NAV: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  active?: boolean;
}[] = [
  { label: 'Pair Device', icon: Link2, href: '#pair', active: true },
  { label: 'Features', icon: LayoutGrid, href: '#how-to' },
  { label: 'Help', icon: HelpCircle, href: '#how-to' },
  { label: 'About', icon: Info, href: '#about' },
];

const STEPS = [
  {
    title: 'Open WhatsApp on your phone',
    desc: 'Android: tap the 3 dots top-right. iPhone: tap Settings bottom-right.',
  },
  {
    title: 'Tap "Linked Devices"',
    desc: 'Select "Linked devices", then press the green "Link a device" button.',
  },
  {
    title: 'Choose "Link with phone number"',
    desc: 'Tap "Link with phone number instead" at the bottom of the camera screen.',
  },
  {
    title: 'Enter the 8-digit code',
    desc: 'Type the code generated on this page into WhatsApp to complete the link.',
  },
];

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.463 3.488" />
    </svg>
  );
}

export function PairingPortal({
  botName = 'Kuzmix-MD',
  organization = 'The Kreadive Galaxy',
}: PairingPortalProps) {
  const [countryCode, setCountryCode] = useState('234');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(120);
  const [copied, setCopied] = useState(false);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [connectedAt, setConnectedAt] = useState<string | null>(null);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const codeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;

  const stopTimers = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (codeTimerRef.current) clearInterval(codeTimerRef.current);
    pollRef.current = null;
    codeTimerRef.current = null;
  }, []);

  const resetAfterExpiry = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    setLiveStatus('error');
    setError('The pairing code expired before it was entered. Request a new code and try again quickly.');
  }, []);

  const startExpiryCountdown = useCallback((seconds: number) => {
    if (codeTimerRef.current) clearInterval(codeTimerRef.current);
    setExpiresIn(seconds);
    codeTimerRef.current = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          if (codeTimerRef.current) clearInterval(codeTimerRef.current);
          resetAfterExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [resetAfterExpiry]);

  const checkStatus = useCallback(async (phone: string) => {
    try {
      const res = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, action: 'check' }),
      });
      const data = await res.json();
      if (!data.exists) return;

      if (data.status === 'connected') {
        if (pollRef.current) clearInterval(pollRef.current);
        setLiveStatus('connected');
        setConnectedAt(new Date().toLocaleTimeString());
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { soundEngine } = require('@/lib/audioPlayer');
          soundEngine.playIncomingChime();
        } catch (_) {}
      } else if (data.status === 'error' || data.status === 'disconnected') {
        if (pollRef.current) clearInterval(pollRef.current);
        setLiveStatus('error');
        setError(
          data.disconnectReason ||
            'WhatsApp rejected the session. This is usually a temporary block from too many pairing attempts — wait, then retry.'
        );
      } else if (typeof data.expiresIn === 'number' && data.expiresIn >= 0) {
        startExpiryCountdown(data.expiresIn);
      }
    } catch (_) {
      // keep polling; transient network blip
    }
  }, [startExpiryCountdown]);

  const handleGenerate = async () => {
    if (!phoneNumber.trim()) return;
    setIsGenerating(true);
    setCode(null);
    setLiveStatus('requesting');
    setError(null);
    setConnectedAt(null);
    stopTimers();

    try {
      const res = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, action: 'generate' }),
      });
      const data = await res.json();
      if (!res.ok || !data.code) {
        setLiveStatus('error');
        setError(data.error || 'Could not request a pairing code from the Baileys engine.');
        return;
      }
      setCode(data.code);
      setLiveStatus('verifying');
      setExpiresIn(data.expiresIn || 120);
      startExpiryCountdown(data.expiresIn || 120);

      pollRef.current = setInterval(() => {
        checkStatus(fullPhone);
      }, 2500);
    } catch (err: unknown) {
      setLiveStatus('error');
      setError(err instanceof Error ? err.message : 'Network error contacting the pairing engine.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    stopTimers();
    setCode(null);
    setLiveStatus('idle');
    setError(null);
    setExpiresIn(120);
    setConnectedAt(null);
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code.replace('-', ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => stopTimers();
  }, [stopTimers]);

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#090A0C] text-[#F5F5F5] antialiased selection:bg-[#FFA51C] selection:text-[#090A0C]">
      {/* Header */}
      <header className="border-b border-white/[0.08]">
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between gap-6 px-6 sm:h-24 sm:px-10 lg:px-16">
          {/* Brand */}
          <a href="#pair" className="flex shrink-0 items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFA51C]">
              <Zap className="h-5 w-5 fill-[#090A0C] text-[#090A0C]" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[22px] font-bold tracking-tight text-[#F5F5F5]">
                Kuzmix<span className="text-[#FFA51C]">-MD</span>
              </span>
              <span className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.3em] text-[#6E6E76]">
                The Kreadive Galaxy
              </span>
            </span>
          </a>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 border-b-2 pb-1 text-sm transition-colors ${
                  item.active
                    ? 'border-[#FFA51C] font-semibold text-[#FFA51C]'
                    : 'border-transparent font-medium text-[#C9C9D1] hover:text-[#F5F5F5]'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </a>
            ))}
          </nav>

          {/* Engine status */}
          <div className="hidden shrink-0 items-center gap-3 rounded-xl border border-white/10 px-3.5 py-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
            <span className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-[#F5F5F5]">Baileys MD Engine</span>
              <span className="text-[10px] text-[#6E6E76]">Fast · Secure · Reliable</span>
            </span>
            <span className="ml-1 rounded-full bg-[#22C55E] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Live
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        {/* Page intro */}
        <section className="pt-14 sm:pt-16 lg:pt-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFA51C]">
              WhatsApp Device Linking
            </span>
            <span className="h-[2px] w-8 bg-[#FFA51C]" />
          </div>
          <h1 className="mt-5 max-w-3xl text-[34px] font-bold leading-[1.15] tracking-tight sm:text-[42px]">
            Connect Your WhatsApp to <span className="text-[#FFC933]">Kuzmix-MD</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-[#9B9BA3]">
            Link your number with a real, WhatsApp-issued 8-digit pairing code — generated live by
            the Baileys Multi-Device engine, no QR scanning required.
          </p>
        </section>

        {/* Two-column content */}
        <div className="mt-12 grid grid-cols-1 gap-10 pb-4 lg:mt-16 lg:grid-cols-[1.55fr_1fr] lg:gap-0">
          {/* Left: pairing */}
          <section id="pair" className="lg:pr-16">
            <div className="flex items-center gap-3">
              <WhatsAppGlyph className="h-7 w-7 text-[#25D366]" />
              <h2 className="text-xl font-semibold tracking-tight">Enter Your WhatsApp Phone Number</h2>
            </div>
            <p className="mt-2 text-sm text-[#9B9BA3]">
              Use your real WhatsApp number with country code.
            </p>

            {(liveStatus === 'idle' || liveStatus === 'requesting') && (
              <div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <div className="relative w-full shrink-0 sm:w-[190px]">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      aria-label="Country code"
                      className="h-14 w-full cursor-pointer appearance-none rounded-xl border border-[#24272C] bg-[#0D0F12] pl-4 pr-10 text-sm font-medium text-[#F5F5F5] outline-none transition focus:border-[#FFA51C]"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code} className="bg-[#0D0F12]">
                          {`${c.flag}  ${c.iso}  +${c.code}`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E6E76]" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 8143186133"
                    aria-label="WhatsApp phone number"
                    className="h-14 w-full flex-1 rounded-xl border border-[#24272C] bg-[#0D0F12] px-4 text-base text-[#F5F5F5] outline-none transition placeholder:text-[#5A5A62] focus:border-[#FFA51C]"
                  />
                </div>

                <p className="mt-4 flex items-center gap-2 text-xs text-[#9B9BA3]">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#22C55E]" />
                  <span>
                    Your information is secure <span className="text-[#22C55E]">and never stored</span>.
                  </span>
                </p>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !phoneNumber.trim()}
                  className="relative mt-6 flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-[#FFA51C] px-6 text-[15px] font-semibold text-[#090A0C] transition hover:bg-[#FFB53F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Requesting code from WhatsApp…</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4" />
                      <span>Generate 8-Digit Pairing Code</span>
                      <ArrowRight className="absolute right-6 hidden h-4 w-4 sm:block" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Pairing code */}
            {(liveStatus === 'verifying' || liveStatus === 'connected') && code && (
              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFA51C]">
                    Pairing Code
                  </span>
                  <span className="font-mono text-xs text-[#9B9BA3]">
                    {liveStatus === 'connected' ? (
                      <span className="font-semibold text-[#22C55E]">Linked</span>
                    ) : (
                      `Expires in ${formatTimer(expiresIn)}`
                    )}
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] py-7 text-center">
                  <span className="select-all font-mono text-4xl font-bold tracking-[0.25em] text-[#F5F5F5] sm:text-5xl">
                    {code}
                  </span>
                </div>

                {liveStatus === 'connected' ? (
                  <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#22C55E]">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Device Successfully Linked to {botName}!
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#9B9BA3]">
                      Your WhatsApp session credentials were authenticated and saved to the
                      bot&apos;s session store at {connectedAt}. Start the bot with{' '}
                      <span className="font-mono text-[#C9C9D1]">node index.js</span>.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFA51C] px-4 text-sm font-semibold text-[#090A0C] transition hover:bg-[#FFB53F]"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-5 text-sm font-medium text-[#C9C9D1] transition hover:border-white/20 hover:text-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Get New Code
                      </button>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-[#9B9BA3]">
                      Open WhatsApp → <span className="text-[#C9C9D1]">Linked Devices</span> →{' '}
                      <span className="text-[#C9C9D1]">Link with phone number</span> and enter the
                      code above. This page updates automatically once WhatsApp links the device.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Error */}
            {liveStatus === 'error' && (
              <div className="mt-7 space-y-4">
                <div className="flex gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.06] p-4">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold text-[#F5F5F5]">WhatsApp did not complete the link</p>
                    <p className="mt-1 text-[#9B9BA3]">{error || 'Unknown pairing error.'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FFA51C] px-4 text-sm font-semibold text-[#090A0C] transition hover:bg-[#FFB53F]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Request a New Code
                </button>
              </div>
            )}
          </section>

          {/* Vertical divider + right: how to link */}
          <section
            id="how-to"
            className="border-t border-white/10 pt-10 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-[#FFA51C]" />
              <h2 className="text-xl font-semibold tracking-tight">How to Link</h2>
            </div>
            <p className="mt-2 text-sm text-[#9B9BA3]">
              Follow these simple steps to connect your WhatsApp device.
            </p>

            <ol className="mt-7 space-y-6">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#FFA51C] text-[13px] font-semibold text-[#FFA51C]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold leading-snug text-[#F5F5F5]">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#9B9BA3]">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer id="about" className="mx-auto mt-14 max-w-[1400px] px-6 sm:mt-16 sm:px-10 lg:px-16">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-[#6E6E76] sm:flex-row">
          <div className="flex items-center gap-4">
            <span className="font-medium text-[#9B9BA3]">Kuzmix-MD</span>
            <span>v1.0</span>
            <span className="text-white/15">|</span>
            <span>{organization}</span>
          </div>
          <span className="italic">Empowering the World with Innovative AI</span>
        </div>
      </footer>
    </div>
  );
}
