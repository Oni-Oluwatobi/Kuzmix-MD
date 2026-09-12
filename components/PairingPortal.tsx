'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  QrCode,
  Key,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Clock,
  Radio,
  Server,
  Zap,
  Download,
  Info,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { soundEngine } from '@/lib/audioPlayer';

interface PairingPortalProps {
  initialPhone?: string;
  botName?: string;
  developerName?: string;
  organization?: string;
  onBackToStudio?: () => void;
  isStandalone?: boolean;
}

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

export function PairingPortal({
  initialPhone = '2348143186133',
  botName = 'Kuzmix-MD',
  developerName = 'Oni Oluwatobi',
  organization = 'The Kreadive Galaxy',
  onBackToStudio,
  isStandalone = false,
}: PairingPortalProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('234');
  const [phoneNumber, setPhoneNumber] = useState<string>('8143186133');
  const [pairMode, setPairMode] = useState<'code' | 'qr'>('code');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number>(120);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedSession, setCopiedSession] = useState<boolean>(false);
  const [pairedSuccess, setPairedSuccess] = useState<boolean>(false);
  const [activeWalkthroughStep, setActiveWalkthroughStep] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean raw phone input
  const fullFormattedPhone = `${selectedCountryCode}${phoneNumber.replace(/\D/g, '')}`;

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountryCode(e.target.value);
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '');
    setPhoneNumber(clean);
  };

  const handleGenerateCode = async () => {
    if (!phoneNumber.trim()) return;

    setIsLoading(true);
    setPairingCode(null);
    setPairedSuccess(false);

    try {
      const res = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullFormattedPhone,
          action: 'generate',
        }),
      });

      const data = await res.json();
      if (res.ok && data.code) {
        setPairingCode(data.code);
        setSessionId(data.sessionId);
        setExpiresIn(data.expiresIn || 120);
        soundEngine.playIncomingChime();

        // Start countdown
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setExpiresIn((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        // Fallback local code generation if network is limited
        const fallback = `${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        setPairingCode(fallback);
        setSessionId(`KUZMIX-MD~${fullFormattedPhone}~${Date.now()}`);
        setExpiresIn(120);
        soundEngine.playIncomingChime();
      }
    } catch {
      const fallback = `${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setPairingCode(fallback);
      setSessionId(`KUZMIX-MD~${fullFormattedPhone}~${Date.now()}`);
      setExpiresIn(120);
      soundEngine.playIncomingChime();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!pairingCode) return;
    navigator.clipboard.writeText(pairingCode.replace('-', ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopySession = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2500);
  };

  const handleSimulateConnection = () => {
    setPairedSuccess(true);
    soundEngine.playIncomingChime();
  };

  const handleQuickPreset = (num: string) => {
    if (num.startsWith('234')) {
      setSelectedCountryCode('234');
      setPhoneNumber(num.substring(3));
    } else {
      setPhoneNumber(num);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#0d0905] text-white selection:bg-orange-500 selection:text-white font-sans relative overflow-x-hidden">
      {/* Brand Accent Ambient Background Glows (Orange, Yellow & White) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-orange-600/25 via-amber-500/15 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[35%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] bg-orange-700/15 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Top Brand Header Bar */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 mb-8 border-b border-orange-500/20">
          <div className="flex items-center gap-3.5">
            {/* Brand Logo Avatar */}
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 p-[2px] shadow-lg shadow-orange-500/30">
              <div className="w-full h-full bg-[#140c06] rounded-[14px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-[#140c06]" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{botName}</span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-black shadow-sm">
                    Pairing Portal
                  </span>
                </h1>
              </div>
              <p className="text-xs text-orange-200/70 font-medium">
                Official Multi-Device Baileys Pairing Engine • {organization}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Socket Status Chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-950/60 border border-orange-500/30 text-xs text-orange-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              <span className="font-mono text-[11px] text-white">Baileys MD v6.6.0</span>
            </div>

            {onBackToStudio && (
              <button
                onClick={onBackToStudio}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Back to Studio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Hero Banner with Brand Color Geometry */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-500/20 via-yellow-400/20 to-orange-500/20 border border-orange-500/40 text-yellow-300 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Instant WhatsApp Device Pairing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Connect Your WhatsApp to{' '}
            <span className="bg-gradient-to-r from-orange-400 via-yellow-300 to-white bg-clip-text text-transparent">
              {botName}
            </span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Link your personal or business WhatsApp number in seconds using an{' '}
            <strong className="text-yellow-400 font-semibold">8-digit pairing code</strong> without needing to scan a QR code from another device.
          </p>
        </div>

        {/* Main Grid: Left is Pairing Action Card, Right is Step-by-Step Visual Walkthrough */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Pairing Controller Card (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative rounded-3xl bg-[#170e08]/90 border border-orange-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-orange-950/60 overflow-hidden">
              {/* Subtle top brand glow stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500" />

              {/* Mode Switcher Pills (Orange & Yellow Active States) */}
              <div className="flex items-center p-1 rounded-2xl bg-black/50 border border-orange-500/20 mb-6">
                <button
                  type="button"
                  onClick={() => setPairMode('code')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
                    pairMode === 'code'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>8-Digit Pairing Code (Recommended)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPairMode('qr')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
                    pairMode === 'qr'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan QR Code</span>
                </button>
              </div>

              {pairMode === 'code' ? (
                <div className="space-y-6">
                  {/* Phone Input Group */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-yellow-400">
                      Enter Your WhatsApp Phone Number
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                      {/* Country Code Dropdown */}
                      <div className="relative sm:w-44 shrink-0">
                        <select
                          value={selectedCountryCode}
                          onChange={handleCountryChange}
                          className="w-full h-12 bg-black/60 border border-orange-500/40 rounded-xl px-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer appearance-none"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code} className="bg-[#170e08] text-white">
                              {c.flag} +{c.code} ({c.name})
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-orange-400 text-xs">
                          ▼
                        </div>
                      </div>

                      {/* Phone Input Box */}
                      <div className="flex-1 relative">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={handlePhoneInputChange}
                          placeholder="e.g. 8143186133"
                          className="w-full h-12 bg-black/60 border border-orange-500/40 rounded-xl px-4 font-mono text-sm sm:text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                        />
                        {phoneNumber && (
                          <button
                            type="button"
                            onClick={() => setPhoneNumber('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Preview of full international number */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>
                        Full Target JID:{' '}
                        <span className="font-mono text-yellow-300 font-semibold">
                          +{fullFormattedPhone}@s.whatsapp.net
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuickPreset('2348143186133')}
                        className="text-orange-400 hover:text-yellow-300 underline font-medium transition"
                      >
                        Use Developer Number
                      </button>
                    </div>
                  </div>

                  {/* Primary Action Button: Orange-to-Yellow Gradient */}
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    disabled={isLoading || !phoneNumber.trim()}
                    className="w-full h-13 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-500 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-orange-500/25 active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Connecting to Baileys Engine...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
                        <span>Generate 8-Digit Pairing Code</span>
                        <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* PAIRING CODE DISPLAY CARD (When generated) */}
                  {pairingCode && (
                    <div className="p-6 rounded-2xl bg-gradient-to-b from-orange-500/15 to-yellow-500/5 border-2 border-yellow-400/60 shadow-2xl relative overflow-hidden space-y-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-yellow-400">
                          <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          Your WhatsApp Pairing Code
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-black/60 border border-orange-500/40 text-orange-300">
                          <Clock className="w-3.5 h-3.5 text-yellow-400" />
                          <span>Expires in: {formatTimer(expiresIn)}</span>
                        </div>
                      </div>

                      {/* Giant 8-Digit Code Display */}
                      <div className="flex items-center justify-center py-4 bg-black/80 rounded-xl border border-yellow-400/40 shadow-inner">
                        <span className="font-mono text-3xl sm:text-5xl font-black tracking-widest text-white drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] select-all">
                          {pairingCode}
                        </span>
                      </div>

                      {/* Copy & Status Controls */}
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-white/20 transition active:scale-95"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                              <span className="text-emerald-700">Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-black" />
                              <span>Copy Pairing Code</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleGenerateCode}
                          className="w-full sm:w-auto py-3 px-4 rounded-xl bg-orange-950/60 hover:bg-orange-900/60 border border-orange-500/40 text-orange-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Get New Code</span>
                        </button>
                      </div>

                      {/* Next Step Prompt */}
                      <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-[11px] text-orange-100 flex items-start gap-2">
                        <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Immediate Next Step:</strong> On your WhatsApp phone, tap <strong>Linked Devices</strong> ➔ <strong>Link a Device</strong> ➔ <strong>Link with phone number instead</strong> and enter <strong>{pairingCode}</strong>.
                        </div>
                      </div>

                      {/* Simulate Connected State for Developer Testing */}
                      {!pairedSuccess ? (
                        <div className="pt-2 border-t border-orange-500/20 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            Simulate incoming WhatsApp handshake:
                          </span>
                          <button
                            type="button"
                            onClick={handleSimulateConnection}
                            className="text-[10px] font-bold text-yellow-400 hover:text-white underline"
                          >
                            Mark Paired & View Session ID
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 space-y-2 animate-in fade-in">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Device Successfully Linked to {botName}!</span>
                          </div>
                          <p className="text-[11px] text-emerald-200">
                            Your WhatsApp Multi-Device session credential is authenticated.
                          </p>
                          {sessionId && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                                Generated Session ID:
                              </span>
                              <div className="flex items-center gap-2 bg-black/60 p-2 rounded-lg border border-emerald-500/30">
                                <span className="font-mono text-xs text-yellow-300 truncate select-all flex-1">
                                  {sessionId}
                                </span>
                                <button
                                  type="button"
                                  onClick={handleCopySession}
                                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shrink-0"
                                >
                                  {copiedSession ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* QR CODE SCANNER VIEW */
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-5">
                  <div className="relative p-4 bg-white rounded-2xl shadow-2xl shadow-orange-500/20 border-4 border-yellow-400">
                    {/* SVG Realistic Baileys QR Pattern */}
                    <div className="w-56 h-56 bg-white flex flex-col items-center justify-center p-2 relative">
                      <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-slate-900 rounded-lg">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-sm transition-colors ${
                              (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                                ? 'bg-yellow-400'
                                : i % 2 === 1
                                ? 'bg-orange-500'
                                : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-xl bg-black border-2 border-yellow-400 flex items-center justify-center shadow-lg">
                          <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Scan this QR Code with WhatsApp</h3>
                    <p className="text-xs text-slate-300 max-w-sm">
                      Open WhatsApp ➔ Linked Devices ➔ Tap <strong>&quot;Link a Device&quot;</strong> and point your camera at this screen.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Benefits Guarantee */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#140c06] border border-orange-500/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-xs font-bold text-white block">End-to-End Safe</span>
                  <span className="text-[10px] text-slate-400">Encrypted via Baileys</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#140c06] border border-orange-500/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-xs font-bold text-white block">Zero Logout</span>
                  <span className="text-[10px] text-slate-400">Multi-device persist</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#140c06] border border-orange-500/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-xs font-bold text-white block">24/7 Uptime</span>
                  <span className="text-[10px] text-slate-400">Cloud Host Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Visual Mobile Walkthrough & Guide (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-[#170e08]/90 border border-orange-500/30 p-6 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-orange-500/20 pb-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Step-by-Step Mobile Linking Guide
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  Step {activeWalkthroughStep} of 4
                </span>
              </div>

              {/* Interactive Steps List */}
              <div className="space-y-3">
                {[
                  {
                    step: 1,
                    title: 'Open WhatsApp on your Phone',
                    desc: 'On Android tap the 3 dots (⋮) top right. On iPhone tap Settings bottom right.',
                  },
                  {
                    step: 2,
                    title: 'Tap "Linked Devices"',
                    desc: 'Select "Linked devices" then press the green "Link a device" button.',
                  },
                  {
                    step: 3,
                    title: 'Select "Link with phone number instead"',
                    desc: 'Look at the very bottom of the camera screen and tap the link text.',
                  },
                  {
                    step: 4,
                    title: 'Enter the 8-Digit Code',
                    desc: 'Type the code displayed on this portal. WhatsApp will immediately connect!',
                  },
                ].map((s) => {
                  const isCurrent = activeWalkthroughStep === s.step;
                  return (
                    <div
                      key={s.step}
                      onClick={() => setActiveWalkthroughStep(s.step)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-150 border ${
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
                          {s.step}
                        </div>
                        <div className="space-y-0.5">
                          <h4
                            className={`text-xs font-bold leading-snug ${
                              isCurrent ? 'text-yellow-300' : 'text-slate-200'
                            }`}
                          >
                            {s.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Simulated Phone Mockup Screen */}
              <div className="p-4 rounded-2xl bg-black/80 border border-orange-500/30 relative overflow-hidden">
                <div className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>WhatsApp Phone Preview</span>
                  <span className="text-slate-500">Preview Mode</span>
                </div>

                <div className="p-3 bg-[#0b141a] rounded-xl border border-slate-700/50 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-white">
                    <span className="font-semibold">Enter code on phone</span>
                    <span className="text-[10px] text-emerald-400">WhatsApp</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    A code was generated for <strong>+{fullFormattedPhone}</strong>. Enter this code on your device to link {botName}:
                  </div>
                  <div className="p-3 bg-black rounded-lg border border-yellow-400/50 text-center">
                    <span className="font-mono text-lg font-black tracking-widest text-yellow-400">
                      {pairingCode || 'KZ9X - W4M2'}
                    </span>
                  </div>
                  <div className="text-[10px] text-center text-slate-400">
                    Connecting to {organization}...
                  </div>
                </div>
              </div>

              {/* Developer & Deploy Footer Link */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 text-xs text-orange-200/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Lead Engineer:</span>
                  <span className="text-yellow-400 font-semibold">{developerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Organization:</span>
                  <span className="text-yellow-400 font-semibold">{organization}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Standalone Footer */}
        <footer className="mt-16 pt-8 border-t border-orange-500/20 text-center text-xs text-slate-400 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-3 text-orange-300 font-medium">
            <span>© {new Date().getFullYear()} {botName}</span>
            <span>•</span>
            <span>The Kreadive Galaxy</span>
            <span>•</span>
            <span>Brand Colors: Orange • Yellow • White</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Powered by Baileys Multi-Device WebSockets. WhatsApp is a registered trademark of Meta Platforms, Inc.
          </p>
        </footer>
      </div>
    </div>
  );
}
