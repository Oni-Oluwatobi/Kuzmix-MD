'use client';

import React from 'react';
import { BotConfig } from './types';
import {
  RefreshCw,
  User,
  Phone,
  Sparkles,
  Hash,
  MessageSquareText,
  Bot,
  Building,
  Shield,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';

interface IdentityConfiguratorProps {
  config: BotConfig;
  onChange: (updated: BotConfig) => void;
  onReset: () => void;
  onLogoUpload?: (url: string) => void;
}

export function IdentityConfigurator({
  config,
  onChange,
  onReset,
}: IdentityConfiguratorProps) {
  const handleNumberChange = (index: number, val: string) => {
    const updated = [...config.ownerNumbers];
    updated[index] = val.replace(/[^0-9]/g, '');
    onChange({ ...config, ownerNumbers: updated });
  };

  const addNumber = () => {
    onChange({ ...config, ownerNumbers: [...config.ownerNumbers, ''] });
  };

  const removeNumber = (index: number) => {
    if (config.ownerNumbers.length <= 1) return;
    const updated = config.ownerNumbers.filter((_, i) => i !== index);
    onChange({ ...config, ownerNumbers: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            Brand Identity &amp; System Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Parameters configured here instantly update all 13 production source files and live simulator instances.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: Core System & Naming */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">1. Core Bot Identity</h3>
              <p className="text-[11px] text-slate-400">Name and trigger prefix</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium flex items-center justify-between">
                <span>Bot Name</span>
                <span className="text-[10px] text-slate-500 font-mono">config.botName</span>
              </label>
              <input
                type="text"
                value={config.botName}
                onChange={(e) => onChange({ ...config, botName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs transition placeholder-slate-600"
                placeholder="Kuzmix-MD"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium flex items-center justify-between">
                <span>Command Prefix</span>
                <span className="text-[10px] text-slate-500 font-mono">config.prefix</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={config.prefix}
                  maxLength={3}
                  onChange={(e) => onChange({ ...config, prefix: e.target.value })}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-blue-300 font-mono text-center font-bold text-sm focus:outline-none focus:border-blue-500"
                  placeholder="."
                />
                <span className="text-[11px] text-slate-400">
                  Examples: <code className="text-blue-300 font-mono">{config.prefix}menu</code>, <code className="text-blue-300 font-mono">{config.prefix}unknown</code>
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium flex items-center justify-between">
                <span>Processing / Wait Note</span>
                <span className="text-[10px] text-slate-500 font-mono">config.waitMessage</span>
              </label>
              <input
                type="text"
                value={config.waitMessage}
                onChange={(e) => onChange({ ...config, waitMessage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs transition placeholder-slate-600"
                placeholder="⏳ Processing your request..."
              />
            </div>
          </div>
        </div>

        {/* Section 2: Creator & Organization */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">2. Creator &amp; Organization</h3>
              <p className="text-[11px] text-slate-400">Attribution and organization credentials</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium flex items-center justify-between">
                <span>Bot Developer</span>
                <span className="text-[10px] text-slate-500 font-mono">config.botDeveloper</span>
              </label>
              <input
                type="text"
                value={config.botDeveloper}
                onChange={(e) => onChange({ ...config, botDeveloper: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs transition placeholder-slate-600"
                placeholder="Oni Oluwatobi"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium flex items-center justify-between">
                <span>Owner &amp; Brand Title</span>
                <span className="text-[10px] text-slate-500 font-mono">config.ownerName</span>
              </label>
              <input
                type="text"
                value={config.ownerName}
                onChange={(e) => onChange({ ...config, ownerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs transition placeholder-slate-600"
                placeholder="Oni Oluwatobi | The Kreadive Galaxy"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium flex items-center justify-between">
                <span>Organization Name</span>
                <span className="text-[10px] text-slate-500 font-mono">config.organization</span>
              </label>
              <input
                type="text"
                value={config.organization}
                onChange={(e) => onChange({ ...config, organization: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs transition placeholder-slate-600"
                placeholder="The Kreadive Galaxy"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium flex items-center justify-between">
                <span>Bot Watermark / Footer</span>
                <span className="text-[10px] text-slate-500 font-mono">config.watermark</span>
              </label>
              <input
                type="text"
                value={config.watermark || `© ${config.botName} • ${config.organization}`}
                onChange={(e) => onChange({ ...config, watermark: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs transition placeholder-slate-600"
                placeholder="© Kuzmix-MD • The Kreadive Galaxy"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Sticker Pack & Exif Metadata */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">3. Sticker Exif Metadata</h3>
              <p className="text-[11px] text-slate-400">Embedded watermarks for .sticker</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium flex items-center justify-between">
                <span>Sticker Pack Title</span>
                <span className="text-[10px] text-slate-500 font-mono">config.stickerPack</span>
              </label>
              <input
                type="text"
                value={config.stickerPack}
                onChange={(e) => onChange({ ...config, stickerPack: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs transition placeholder-slate-600"
                placeholder="Kuzmix-MD"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium flex items-center justify-between">
                <span>Sticker Author Credit</span>
                <span className="text-[10px] text-slate-500 font-mono">config.stickerAuthor</span>
              </label>
              <input
                type="text"
                value={config.stickerAuthor}
                onChange={(e) => onChange({ ...config, stickerAuthor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs transition placeholder-slate-600"
                placeholder="Oni Oluwatobi"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>Injected into raw WebP Exif metadata chunks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Owner WhatsApp Numbers Full Width */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Owner Phone Authorization Numbers
              </h3>
              <p className="text-[11px] text-slate-400">
                Authorized WhatsApp numbers granted root privileges (<code className="text-cyan-300 font-mono">{config.prefix}restart</code>, <code className="text-cyan-300 font-mono">{config.prefix}bc</code>, <code className="text-cyan-300 font-mono">{config.prefix}eval</code>)
              </p>
            </div>
          </div>

          <button
            onClick={addNumber}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Add Number</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {config.ownerNumbers.map((num, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">#{i + 1}</span>
              <input
                type="text"
                value={num}
                onChange={(e) => handleNumberChange(i, e.target.value)}
                className="w-full bg-transparent text-white font-mono text-xs focus:outline-none focus:text-cyan-300"
                placeholder="2348143186133"
              />
              {config.ownerNumbers.length > 1 && (
                <button
                  onClick={() => removeNumber(i)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition"
                  title="Remove number"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
