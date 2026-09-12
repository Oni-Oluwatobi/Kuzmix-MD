'use client';

import React, { useState } from 'react';
import { BotConfig } from './types';
import {
  Lock,
  Unlock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
  MessageSquare,
  Copy,
  Check,
  Play,
  Key,
  Smartphone,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

interface UnknownModeDocumentationProps {
  config: BotConfig;
  onTestCommand?: (cmd: string) => void;
  onNavigateToSimulator?: () => void;
}

export function UnknownModeDocumentation({
  config,
  onTestCommand,
  onNavigateToSimulator,
}: UnknownModeDocumentationProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const p = config.prefix;

  const syntaxItems = [
    {
      cmd: `${p}unknown on`,
      desc: 'Enables private response mode for your WhatsApp JID across all groups.',
      state: 'ENABLE',
      color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      badge: 'ENABLES ROUTING',
    },
    {
      cmd: `${p}unknown off`,
      desc: 'Disables private response mode and restores standard in-group replies.',
      state: 'DISABLE',
      color: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      badge: 'RESTORES IN-CHAT',
    },
    {
      cmd: `${p}unknown`,
      desc: 'Displays the current active Unknown Mode status card for your JID.',
      state: 'STATUS',
      color: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      badge: 'STATUS CHECK',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                {p}unknown
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Private Response Routing Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">
                User-Level Setting (JID)
              </span>
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight">
              Unknown Mode Architecture &amp; Usage
            </h2>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              When a user enables Unknown Mode, any bot command they trigger inside a WhatsApp group (<code className="text-cyan-300 font-mono">{p}ai</code>, <code className="text-cyan-300 font-mono">{p}play</code>, <code className="text-cyan-300 font-mono">{p}ping</code>, <code className="text-cyan-300 font-mono">{p}menu</code>, <code className="text-cyan-300 font-mono">{p}sticker</code>) has its response payload delivered <strong className="text-white">silently to their private 1-on-1 DM</strong>. The group chat receives zero response or notification.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToSimulator && (
              <button
                onClick={onNavigateToSimulator}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center gap-2 shadow-lg shadow-cyan-950/40"
              >
                <Smartphone className="w-4 h-4" />
                <span>Test in Simulator</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Syntax Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {syntaxItems.map((item) => {
            const isCopied = copiedText === item.cmd;
            return (
              <div
                key={item.cmd}
                className="bg-slate-950 rounded-2xl border border-slate-800 p-4.5 space-y-3 flex flex-col justify-between hover:border-slate-700 transition group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-sm text-cyan-300">
                      {item.cmd}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${item.color}`}
                    >
                      {item.state}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.badge}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {onTestCommand && (
                      <button
                        onClick={() => onTestCommand(item.cmd)}
                        className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition text-[10px] font-mono flex items-center gap-1"
                        title="Run in simulator"
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>Test</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(item.cmd)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition text-[10px] font-mono flex items-center gap-1"
                      title="Copy syntax"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture & Flow Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step-by-Step Flow */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Response Routing Life-Cycle
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-white">User triggers command in WhatsApp Group</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Example: User sends <code className="text-cyan-300 font-mono">{p}ai summarize quantum computing</code> inside a 200-member group.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-white">Central Router checks Sender WhatsApp JID</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  The dispatcher checks <code className="text-cyan-300 font-mono">isUnknownMode(sender)</code> from <code className="text-slate-300 font-mono">userSettings.json</code>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-white">Response is delivered to Private DM</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  The destination is redirected to <code className="text-emerald-400 font-mono">sender</code> (Private WhatsApp JID). The group chat receives zero response or notification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Key Principles */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" />
            Core Architectural Rules
          </h3>

          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">User-Specific, Not Group-Specific:</strong> The setting is keyed to the user&apos;s WhatsApp JID (<code className="text-cyan-300 font-mono">userJid</code>). Enabling it in Group A keeps responses private across Group B, Group C, and future groups.</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">Zero Group Trace:</strong> The group does not receive placeholder messages, reactions, or quotes.</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">Persistent Across Restarts:</strong> Stored in JSON database (<code className="text-slate-300 font-mono">database/userSettings.json</code>).</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
