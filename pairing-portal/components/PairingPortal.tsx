'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Link2,
  ChevronDown,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
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

const STATUS_META: Record<
  LiveStatus,
  { label: string; dot: string; text: string; pulse?: boolean }
> = {
  idle: { label: 'Ready', dot: 'bg-white/40', text: 'text-[#9B9BA3]' },
  requesting: {
    label: 'Requesting',
    dot: 'bg-[#FFA51C]',
    text: 'text-[#FFA51C]',
    pulse: true,
  },
  verifying: { label: 'Pairing', dot: 'bg-[#FFA51C]', text: 'text-[#FFA51C]', pulse: true },
  connected: { label: 'Connected', dot: 'bg-[#22C55E]', text: 'text-[#22C55E]' },
  error: { label: 'Error', dot: 'bg-red-400', text: 'text-red-300' },
};

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

  const isExpired = liveStatus === 'error' && !!error && error.toLowerCase().includes('expired');
  const statusMeta = STATUS_META[liveStatus];
  const statusLabel = isExpired ? 'Expired' : statusMeta.label;

  const helperText =
    liveStatus === 'verifying'
      ? 'In WhatsApp, open Linked devices → Link with phone number and enter the code above. This page updates automatically.'
      : liveStatus === 'connected'
        ? 'The session has been saved securely — you can close this page.'
        : liveStatus === 'error'
          ? 'If this keeps happening, wait a few minutes before requesting another code.'
          : 'In WhatsApp: Settings → Linked devices → Link with phone number. Codes are valid for 2 minutes and your number is never stored.';

  const inputClass =
    'h-12 w-full rounded-xl border border-white/[0.14] bg-white/[0.05] text-[15px] text-[#F5F5F5] outline-none transition duration-200 hover:border-white/[0.22] focus:border-[#FFA51C] focus:ring-2 focus:ring-[#FFA51C]/25';

  const primaryButtonClass =
    'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FFA51C] px-5 text-[14px] font-semibold text-[#090A0C] transition duration-200 hover:bg-[#FFB84D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA51C]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090A0C] disabled:cursor-not-allowed disabled:opacity-50';

  const ghostButtonClass =
    'flex h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.14] bg-white/[0.03] px-5 text-[13.5px] font-medium text-[#C9C9D1] transition duration-200 hover:border-white/25 hover:text-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="flex min-h-screen flex-col text-[#F5F5F5] antialiased selection:bg-[#FFA51C] selection:text-[#090A0C]">
      {/* Floating glass navigation */}
      <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 sm:pt-5">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-2xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 shadow-[0_10px_40px_-16px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-5">
          <a href="#pair" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFA51C]">
              <Zap className="h-3.5 w-3.5 fill-[#090A0C] text-[#090A0C]" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-[#F5F5F5]">
              Kuzmix AI
            </span>
          </a>
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex items-center gap-4 text-[13px] font-medium sm:gap-5">
              <a href="#pair" className="font-semibold text-[#F5F5F5]">
                Pair
              </a>
              <a
                href="#help"
                className="text-[#9B9BA3] transition-colors duration-200 hover:text-[#F5F5F5]"
              >
                Guide
              </a>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-[#9B9BA3] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
              Engine live
            </span>
          </div>
        </nav>
      </header>

      {/* Main pairing area */}
      <main
        id="pair"
        className="flex flex-1 scroll-mt-24 flex-col items-center justify-center px-5 py-10 sm:py-14"
      >
        <div className="w-full max-w-[560px]">
          {/* Hero */}
          <div className="mb-8 text-center sm:mb-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FFA51C]">
              Kuzmix AI
            </p>
            <h1 className="mt-3.5 text-[34px] font-bold leading-[1.1] tracking-tight sm:text-[44px]">
              Pair your device
            </h1>
            <p className="mx-auto mt-3.5 max-w-[400px] text-[15px] leading-relaxed text-[#9B9BA3]">
              Connect your WhatsApp session securely and continue using Kuzmix AI.
            </p>
          </div>

          {/* Single glass panel */}
          <div className="rounded-[22px] border border-white/[0.14] bg-white/[0.07] p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-[22px] sm:p-7">
            {/* Panel header: section label + live status */}
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.10] pb-4">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9B9BA3]">
                <WhatsAppGlyph className="h-3.5 w-3.5 text-[#25D366]" />
                Device pairing
              </span>
              <span
                className={`flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold ${statusMeta.text}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot} ${statusMeta.pulse ? 'animate-pulse' : ''}`}
                />
                {statusLabel}
              </span>
            </div>

            {/* Panel body */}
            <div className="pt-5">
              {(liveStatus === 'idle' || liveStatus === 'requesting') && (
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2.5 block text-[12px] font-medium text-[#9B9BA3]"
                  >
                    WhatsApp phone number
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative w-full shrink-0 sm:w-[168px]">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        aria-label="Country code"
                        className={`${inputClass} cursor-pointer appearance-none pl-3.5 pr-10 font-medium`}
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
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 8143186133"
                      aria-label="WhatsApp phone number"
                      className={`${inputClass} min-w-0 px-4`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !phoneNumber.trim()}
                    className={`${primaryButtonClass} mt-4`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Requesting code…</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4" />
                        <span>Generate pairing code</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Pairing code / connected */}
              {(liveStatus === 'verifying' || liveStatus === 'connected') && code && (
                <div>
                  <div className="text-center">
                    <span className="select-all font-mono text-[32px] font-semibold tracking-[0.12em] text-[#F5F5F5] sm:text-[46px] sm:tracking-[0.16em]">
                      {code}
                    </span>
                    <p className="mt-2.5 font-mono text-[12px] text-[#9B9BA3]">
                      {liveStatus === 'connected' ? (
                        <span className="font-semibold text-[#22C55E]">Linked</span>
                      ) : (
                        <>
                          Valid for{' '}
                          <span className="font-semibold text-[#FFA51C]">
                            {formatTimer(expiresIn)}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {liveStatus === 'connected' ? (
                    <div className="mt-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-semibold text-[#F5F5F5]">
                            Device linked to {botName}
                          </p>
                          <p className="mt-1 text-[12.5px] leading-relaxed text-[#9B9BA3]">
                            Session saved at {connectedAt}. Start the bot with{' '}
                            <span className="font-mono text-[#C9C9D1]">node index.js</span>.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleReset}
                        className={`${ghostButtonClass} w-full`}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Pair another device
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className={`${primaryButtonClass} sm:flex-1`}
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy code</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`${ghostButtonClass} w-full sm:w-auto`}
                      >
                        <RotateCcw className="h-4 w-4" />
                        New code
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {liveStatus === 'error' && (
                <div>
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-[#F5F5F5]">
                        {isExpired ? 'Code expired' : 'Pairing failed'}
                      </p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-[#9B9BA3]">
                        {error || 'Unknown pairing error.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`${primaryButtonClass} mt-4`}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Request a new code
                  </button>
                </div>
              )}
            </div>

            {/* Helper / guide zone */}
            <div
              id="help"
              className="mt-5 scroll-mt-28 border-t border-white/[0.08] pt-4 text-[12.5px] leading-relaxed text-[#9B9BA3]"
            >
              {helperText}
            </div>
          </div>
        </div>
      </main>

      {/* Understated footer */}
      <footer className="px-5 pb-6 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 border-t border-white/[0.08] pt-5 text-[11.5px] text-[#6E6E76] sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#9B9BA3]">{botName}</span>
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
