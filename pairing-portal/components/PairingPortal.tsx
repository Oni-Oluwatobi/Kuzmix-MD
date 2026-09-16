'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Smartphone,
  Key,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Zap,
  AlertCircle,
  Clock,
  Radio,
  CheckCircle2,
  Loader2,
  Lock,
  RefreshCcw,
} from 'lucide-react';

const COUNTRY_CODES = [
  { code: '234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '233', name: 'Ghana', flag: '🇬🇭' },
  { code: '254', name: 'Kenya', flag: '🇰🇪' },
  { code: '27', name: 'South Africa', flag: '🇿🇦' },
  { code: '1', name: 'USA / Canada', flag: '🇺🇸' },
  { code: '44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '91', name: 'India', flag: '🇮🇳' },
  { code: '971', name: 'UAE', flag: '🇦🇪' },
  { code: '256', name: 'Uganda', flag: '🇺🇬' },
  { code: '255', name: 'Tanzania', flag: '🇹🇿' },
];

type LiveStatus = 'idle' | 'requesting' | 'verifying' | 'connected' | 'error';

interface PairingPortalProps {
  botName?: string;
  developerName?: string;
  organization?: string;
}

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
    desc: 'Type the code shown below. WhatsApp connects instantly and sends a login notification.',
  },
];

export function PairingPortal({
  botName = 'Kuzmix-MD',
  developerName = 'Oni Oluwatobi',
  organization = 'The Kreadive Galaxy',
}: PairingPortalProps) {
  const [countryCode, setCountryCode] = useState('234');
  const [phoneNumber, setPhoneNumber] = useState('8143186133');
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(120);
  const [copied, setCopied] = useState(false);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
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
    <div className="min-h-screen bg-[#0a0704] text-white font-sans relative overflow-hidden selection:bg-orange-500 selection:text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 h-[520px] w-[820px] rounded-full bg-gradient-to-b from-orange-600/20 via-amber-500/10 to-transparent blur-[130px]" />
        <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-amber-400/10 blur-[130px]" />
        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-orange-700/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:26px_26px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-7 mb-9 border-b border-orange-500/15">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 p-[2px] shadow-lg shadow-orange-500/30">
              <div className="w-full h-full bg-[#120a05] rounded-[14px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{botName}</h1>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-black">
                  Pairing Portal
                </span>
              </div>
              <p className="text-xs text-orange-200/60 font-medium mt-0.5">
                Official Multi-Device WhatsApp Linking Gateway • {organization}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-950/50 border border-orange-500/25 text-xs text-orange-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span className="font-mono text-[11px]">Baileys MD Engine — Live</span>
          </div>
        </header>

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-400/15 to-orange-500/15 border border-orange-500/40 text-yellow-300 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Instant WhatsApp Device Linking</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Connect Your WhatsApp to{' '}
            <span className="bg-gradient-to-r from-orange-400 via-yellow-300 to-white bg-clip-text text-transparent">
              {botName}
            </span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Link your number with a real, WhatsApp-issued{' '}
            <strong className="text-yellow-400 font-semibold">8-digit pairing code</strong> — generated
            live by the Baileys Multi-Device engine, no QR scanning required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: pairing card */}
          <div className="lg:col-span-7 space-y-5">
            <div className="relative rounded-3xl bg-[#140b06]/90 border border-orange-500/25 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-orange-950/50 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500" />

              {liveStatus === 'idle' && (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      Enter your WhatsApp phone number
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative sm:w-40 shrink-0">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full h-12 bg-black/60 border border-orange-500/40 rounded-xl px-3 text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code} className="bg-[#140b06]">
                              {c.flag} +{c.code} {c.name}
                            </option>
                          ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 text-[10px] pointer-events-none">▼</span>
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 8143186133"
                        className="flex-1 h-12 bg-black/60 border border-orange-500/40 rounded-xl px-4 font-mono text-sm sm:text-base font-bold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Full number: <span className="font-mono text-yellow-300 font-semibold">+{fullPhone}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !phoneNumber.trim()}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-500 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-orange-500/25 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Contacting WhatsApp servers...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Generate 8-Digit Pairing Code</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Requesting state */}
              {liveStatus === 'requesting' && (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
                  <div>
                    <p className="text-sm font-bold text-white">Requesting code from WhatsApp</p>
                    <p className="text-xs text-slate-400 mt-1">Connecting the Baileys socket and negotiating a secure pairing session...</p>
                  </div>
                </div>
              )}

              {/* Verifying: code ready */}
              {(liveStatus === 'verifying' || liveStatus === 'connected') && code && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-yellow-400">
                      <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      Your Official WhatsApp Pairing Code
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-black/60 border border-orange-500/40 text-orange-300">
                      <Clock className="w-3.5 h-3.5 text-yellow-400" />
                      {liveStatus === 'connected' ? 'Linked' : `Expires in ${formatTimer(expiresIn)}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-center py-5 bg-black/80 rounded-xl border border-yellow-400/40 shadow-inner">
                    <span className="font-mono text-3xl sm:text-5xl font-black tracking-widest text-white drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] select-all">
                      {code}
                    </span>
                  </div>

                  {liveStatus === 'connected' ? (
                    <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        Device Successfully Linked to {botName}!
                      </div>
                      <p className="text-[11px] text-emerald-200">
                        Your WhatsApp session credentials were authenticated and saved to the bot&apos;s
                        session store at {connectedAt}. Start the bot with <span className="font-mono">node index.js</span>.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-white/20 transition active:scale-95"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-black" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerate}
                          className="w-full sm:w-auto py-3 px-4 rounded-xl bg-orange-950/60 hover:bg-orange-900/60 border border-orange-500/40 text-orange-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Get New Code
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-[11px] text-orange-100 flex items-start gap-2">
                        <Radio className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <strong>Watching for your connection...</strong> On your phone tap{' '}
                          <strong>Linked Devices</strong> ➔ <strong>Link a Device</strong> ➔{' '}
                          <strong>Link with phone number</strong> and enter{' '}
                          <strong className="font-mono">{code}</strong>. This page updates automatically
                          once WhatsApp links the device.
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Error state */}
              {liveStatus === 'error' && (
                <div className="space-y-4 py-4 text-center">
                  <div className="p-4 rounded-xl bg-red-950/70 border border-red-500/40 flex items-start gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-200 space-y-1">
                      <p className="font-bold text-red-100">WhatsApp did not complete the link</p>
                      <p>{error || 'Unknown pairing error.'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition active:scale-[0.99]"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Request a New Code
                  </button>
                </div>
              )}
            </div>

            {/* Trust markers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#120a05] border border-orange-500/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-xs font-bold block">Live Engine</span>
                  <span className="text-[10px] text-slate-400">Real WhatsApp pairing codes</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#120a05] border border-orange-500/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-xs font-bold block">Encrypted</span>
                  <span className="text-[10px] text-slate-400">Baileys Signal protocol</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#120a05] border border-orange-500/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-xs font-bold block">Live Status</span>
                  <span className="text-[10px] text-slate-400">Auto-updates as you link</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: step-by-step guide */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl bg-[#140b06]/90 border border-orange-500/25 p-6 backdrop-blur-xl shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-orange-500/15 pb-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider">How to Link</h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  Step {activeStep} of 4
                </span>
              </div>

              <div className="space-y-3">
                {STEPS.map((s, i) => {
                  const stepNum = i + 1;
                  const isCurrent = activeStep === stepNum;
                  return (
                    <div
                      key={stepNum}
                      onClick={() => setActiveStep(stepNum)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                        isCurrent
                          ? 'bg-gradient-to-r from-orange-500/20 to-yellow-500/10 border-yellow-400 shadow-md'
                          : 'bg-black/30 border-orange-500/10 hover:border-orange-500/30 hover:bg-black/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                            isCurrent
                              ? 'bg-gradient-to-tr from-orange-500 to-yellow-400 text-black shadow-md shadow-orange-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {stepNum}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className={`text-xs font-bold leading-snug ${isCurrent ? 'text-yellow-300' : 'text-slate-200'}`}>
                            {s.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 text-xs text-orange-200/90 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Lead Engineer</span>
                  <span className="text-yellow-400 font-semibold">{developerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Organization</span>
                  <span className="text-yellow-400 font-semibold">{organization}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Engine</span>
                  <span className="text-yellow-400 font-semibold">Baileys Multi-Device</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-7 border-t border-orange-500/15 text-center text-xs text-slate-400 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-3 text-orange-300/90 font-medium">
            <span>© {new Date().getFullYear()} {botName}</span>
            <span>•</span>
            <span>{organization}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Powered by Baileys Multi-Device WebSockets. WhatsApp is a registered trademark of Meta Platforms, Inc.
          </p>
        </footer>
      </div>
    </div>
  );
}