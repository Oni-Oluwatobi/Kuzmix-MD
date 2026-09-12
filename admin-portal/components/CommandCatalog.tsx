'use client';

import React, { useState, useMemo } from 'react';
import { BotConfig } from './types';
import {
  COMMAND_CATEGORIES,
  getAllCommands,
  CommandDefinition,
} from '@/lib/commandData';
import {
  Terminal,
  Search,
  Copy,
  Check,
  Play,
  Sparkles,
  Download,
  Filter,
  Layers,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface CommandCatalogProps {
  config: BotConfig;
  onTestCommand?: (cmd: string) => void;
  onNavigateToUnknown?: () => void;
}

export function CommandCatalog({
  config,
  onTestCommand,
  onNavigateToUnknown,
}: CommandCatalogProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [copiedManual, setCopiedManual] = useState<boolean>(false);

  const allCommands = useMemo(() => getAllCommands(config), [config]);

  const filteredCommands = useMemo(() => {
    return allCommands.filter((cmd) => {
      const matchesCategory =
        activeCategory === 'all' || cmd.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesName = cmd.name.toLowerCase().includes(query);
      const matchesDesc = cmd.desc.toLowerCase().includes(query);
      const matchesAliases = cmd.aliases?.some((a) =>
        a.toLowerCase().includes(query)
      );
      const matchesCat = cmd.category.toLowerCase().includes(query);

      return matchesCategory && (matchesName || matchesDesc || matchesAliases || matchesCat);
    });
  }, [allCommands, activeCategory, searchQuery]);

  const activeCategoryMeta = COMMAND_CATEGORIES.find((c) => c.id === activeCategory);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCmd(text);
      setTimeout(() => setCopiedCmd(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyFullManual = async () => {
    let manual = `=======================================================\n`;
    manual += `  ${config.botName.toUpperCase()} — OFFICIAL COMMAND SUITE MANUAL\n`;
    manual += `  Maintainer: ${config.ownerName} | Dev: ${config.botDeveloper}\n`;
    manual += `  Prefix: [ ${config.prefix} ] | Organization: ${config.organization}\n`;
    manual += `=======================================================\n\n`;

    COMMAND_CATEGORIES.filter((c) => c.id !== 'all').forEach((cat) => {
      const cmds = allCommands.filter((c) => c.category === cat.id);
      if (cmds.length === 0) return;
      manual += `\n${cat.emoji} ${cat.label.toUpperCase()} (${cmds.length})\n`;
      manual += `-------------------------------------------------------\n`;
      cmds.forEach((c) => {
        manual += `${config.prefix}${c.name} — ${c.desc} [${c.permission}]\n`;
      });
    });

    try {
      await navigator.clipboard.writeText(manual);
      setCopiedManual(true);
      setTimeout(() => setCopiedManual(false), 2500);
    } catch (err) {
      console.error('Failed to copy manual', err);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      case 'ai':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
      case 'aimedia':
        return 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20';
      case 'vision':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
      case 'coding':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'media':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'owner':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      case 'group':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              18-Module Master Command Catalog ({allCommands.length} commands)
            </h2>
            <p className="text-xs text-slate-400">
              Categorized command suite configured for prefix <code className="px-1.5 py-0.5 rounded bg-slate-950 text-blue-300 font-mono font-bold border border-slate-800">{config.prefix}</code>. Click any command to test live.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={handleCopyFullManual}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-2 whitespace-nowrap"
              title="Copy entire manual formatted for WhatsApp / Docs"
            >
              {copiedManual ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Manual Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Copy Text Manual</span>
                </>
              )}
            </button>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search commands, aliases..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[10px] bg-slate-800 px-1.5 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Unknown Mode Spotlight Pill */}
        {onNavigateToUnknown && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-300">
                <strong className="text-white">Private Response Routing ({config.prefix}unknown):</strong> User-level privacy engine routing group responses silently to private DMs.
              </span>
            </div>
            <button
              onClick={onNavigateToUnknown}
              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 shrink-0 ml-2"
            >
              <span>Inspect Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Category Filter Chips */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              Filter by Module:
            </span>
            <span>Showing {filteredCommands.length} of {allCommands.length} commands</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
            {COMMAND_CATEGORIES.map((cat) => {
              const count =
                cat.id === 'all'
                  ? allCommands.length
                  : allCommands.filter((c) => c.category === cat.id).length;
              const isSelected = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Commands */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredCommands.map((cmd) => {
          const isCopied = copiedCmd === cmd.example || copiedCmd === `${config.prefix}${cmd.name}`;
          const permissionColor =
            cmd.permission === 'Group Admin'
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : cmd.permission === 'Owner'
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';

          return (
            <div
              key={cmd.name}
              className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 space-y-3 hover:border-slate-700 transition flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <span className="font-mono font-bold text-sm text-blue-300">
                    {config.prefix}{cmd.name}
                  </span>

                  <div className="flex items-center gap-1">
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border uppercase ${getCategoryColor(cmd.category)}`}>
                      {cmd.category}
                    </span>
                    <span className={`text-[9px] font-medium px-2 py-0.5 rounded border ${permissionColor}`}>
                      {cmd.permission}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {cmd.desc}
                </p>

                {cmd.aliases && cmd.aliases.length > 0 && (
                  <div className="text-[10px] text-slate-500 font-mono">
                    <span className="text-slate-400">Aliases: </span>
                    {cmd.aliases.map((a) => `${config.prefix}${a}`).join(', ')}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]" title={cmd.syntax}>
                  {cmd.syntax}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onTestCommand && (
                    <button
                      onClick={() => onTestCommand(cmd.example || `${config.prefix}${cmd.name}`)}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/30 transition flex items-center gap-1 text-[10px] font-mono font-medium"
                      title="Test inside WhatsApp Simulator"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>Test</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleCopy(cmd.example || `${config.prefix}${cmd.name}`)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1 text-[10px] font-mono"
                    title="Copy command syntax"
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

      {filteredCommands.length === 0 && (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
          <Search className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-300 font-medium">
            No commands found matching &quot;{searchQuery}&quot;
          </p>
          <p className="text-[11px] text-slate-500">
            Try searching for keywords like &quot;sticker&quot;, &quot;ai&quot;, &quot;kick&quot;, or click &quot;All Commands&quot;.
          </p>
        </div>
      )}
    </div>
  );
}
