'use client';

import React from 'react';
import {
  Bot,
  Menu,
  Sparkles,
  Smartphone,
  ExternalLink,
  Shield,
  Activity,
  User,
} from 'lucide-react';

interface HeaderProps {
  botName: string;
  ownerName: string;
  botDeveloper: string;
  activeSectionTitle: string;
  onOpenMobileMenu?: () => void;
  onQuickSimulator?: () => void;
  onOpenPairing?: () => void;
}

export function Header({
  botName,
  ownerName,
  botDeveloper,
  activeSectionTitle,
  onOpenMobileMenu,
  onQuickSimulator,
  onOpenPairing,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Breadcrumbs */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm tracking-tight">{botName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 hidden sm:inline-block">
                  v2.0 MD
                </span>
                <span className="text-slate-500 hidden sm:inline-block">/</span>
                <span className="text-xs text-slate-300 font-medium hidden sm:inline-block">
                  {activeSectionTitle}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Status Badges & Quick Action */}
        <div className="flex items-center gap-3">
          {/* Engine Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span className="text-slate-300 font-medium text-[11px]">Baileys Active</span>
          </div>

          {/* Pair Bot CTA Button (Orange, Yellow & White) */}
          <a
            href="/pair"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-black shadow-md shadow-orange-500/25 transition active:scale-95"
            title="Open Standalone WhatsApp Pairing Site"
          >
            <Sparkles className="w-3.5 h-3.5 text-black fill-black" />
            <span>Pair Bot</span>
            <ExternalLink className="w-3 h-3 text-black opacity-80" />
          </a>

          {/* Quick Simulator CTA */}
          {onQuickSimulator && (
            <button
              onClick={onQuickSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Open Simulator</span>
            </button>
          )}

          {/* Creator Profile Chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-400">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-semibold text-xs border border-slate-700">
              {botDeveloper.charAt(0)}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <span className="text-white font-medium block text-[11px]">{botDeveloper}</span>
              <span className="text-[10px] text-slate-500">Developer</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
