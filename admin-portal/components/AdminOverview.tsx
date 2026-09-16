'use client';

import React from 'react';
import { BotConfig } from './types';
import {
  Activity,
  Cpu,
  Layers,
  Lock,
  MessageSquare,
  Play,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  User,
  Zap,
  CheckCircle2,
  ArrowRight,
  Code2,
  FileCode,
} from 'lucide-react';

interface AdminOverviewProps {
  config: BotConfig;
  onNavigate: (section: 'overview' | 'pairing' | 'config' | 'commands' | 'unknown' | 'simulator' | 'files' | 'assets' | 'security') => void;
  totalFiles: number;
}

export function AdminOverview({ config, onNavigate, totalFiles }: AdminOverviewProps) {
  const p = config.prefix;

  return (
    <div className="space-y-6">
      {/* Hero Cockpit Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Baileys Multi-Device Core Online
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v2.0 Native Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {config.botName} Administration Hub
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Engineered by <strong className="text-white">{config.botDeveloper}</strong> ({config.organization}). Unified management interface for 18 command modules, private response routing (<code className="text-cyan-300 font-mono">{p}unknown</code>), and real-time WhatsApp Baileys execution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('pairing')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-black transition flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-black text-black" />
              <span>Pair WhatsApp Bot</span>
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Smartphone className="w-4 h-4" />
              <span>Launch Simulator</span>
            </button>
            <button
              onClick={() => onNavigate('commands')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-2"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Explore 130+ Commands</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Engine Status</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white flex items-center gap-1.5">
            <span>Active &amp; Ready</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Latency ~28ms • WebSocket connected
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Master Suite</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white">
            18 Modules <span className="text-xs font-normal text-slate-400">(130+ cmds)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Prefix set to <code className="text-blue-300 font-mono font-bold">{p}</code>
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Response Mode</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-cyan-300 flex items-center gap-1.5">
            <span>Unknown Router</span>
          </div>
          <p className="text-[11px] text-slate-400">
            User-level private routing enabled
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Source Files</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white">
            {totalFiles} Artifacts
          </div>
          <p className="text-[11px] text-slate-400">
            Production JS, config, &amp; manifests
          </p>
        </div>
      </div>

      {/* Two-Column Cockpit Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Identity & Quick Operations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Quick Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Active Identity &amp; Ownership</h2>
                  <p className="text-xs text-slate-400">Real-time parameters injected into all bot source files</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('config')}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
              >
                <span>Edit Parameters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-slate-400 block text-[11px]">Bot Display Name</span>
                <span className="font-semibold text-white font-mono">{config.botName}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-slate-400 block text-[11px]">Primary Developer</span>
                <span className="font-semibold text-white">{config.botDeveloper}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-slate-400 block text-[11px]">Owner / Organization</span>
                <span className="font-semibold text-white">{config.ownerName}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-slate-400 block text-[11px]">Primary Number</span>
                <span className="font-semibold text-emerald-400 font-mono">+{config.ownerNumbers[0]}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-slate-400 block text-[11px]">Sticker Pack / Author</span>
                <span className="font-semibold text-slate-200">{config.stickerPack} • {config.stickerAuthor}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-slate-400 block text-[11px]">Command Prefix</span>
                <span className="font-semibold text-blue-300 font-mono text-sm">[ {config.prefix} ]</span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Quick Studio Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onNavigate('unknown')}
                className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/40 text-left transition group space-y-1"
              >
                <div className="flex items-center justify-between text-cyan-400">
                  <Lock className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-xs font-semibold text-white">Unknown Mode</div>
                <div className="text-[11px] text-slate-400">Inspect &amp; test private group-to-DM response routing</div>
              </button>

              <button
                onClick={() => onNavigate('files')}
                className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-blue-500/40 text-left transition group space-y-1"
              >
                <div className="flex items-center justify-between text-blue-400">
                  <Code2 className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-xs font-semibold text-white">Source Files</div>
                <div className="text-[11px] text-slate-400">View and download all 13 generated bot files</div>
              </button>

              <button
                onClick={() => onNavigate('security')}
                className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-amber-500/40 text-left transition group space-y-1"
              >
                <div className="flex items-center justify-between text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-xs font-semibold text-white">Deploy &amp; PM2</div>
                <div className="text-[11px] text-slate-400">Production hygiene, keys, &amp; 24/7 server setup</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Engine Telemetry & Features */}
        <div className="space-y-6">
          {/* Telemetry Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              Runtime Telemetry
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Protocol</span>
                <span className="text-slate-200 font-mono">Baileys WebSocket</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Multi-Device</span>
                <span className="text-emerald-400 font-medium">Enabled (Independent)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">RAM Target</span>
                <span className="text-slate-200 font-mono">&lt; 50 MB Baseline</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Session Storage</span>
                <span className="text-slate-200 font-mono">creds.json / FileAuthState</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">User Settings DB</span>
                <span className="text-cyan-300 font-mono">database/userSettings.json</span>
              </div>
            </div>
          </div>

          {/* Module Architecture Highlights */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Engine Highlights
            </h2>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>18 Command Modules:</strong> System, AI, Coding, Vision, Media, Security, Fun, Utilities, and Owner tools.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Unknown Mode:</strong> Direct user privacy toggle routing group responses to private DMs silently.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Anti-Spam &amp; Anti-Link:</strong> Automated group protection and participant moderation engine.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
