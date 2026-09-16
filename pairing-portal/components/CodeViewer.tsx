'use client';

import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Info } from 'lucide-react';
import { BotConfig } from './types';

interface CodeFileItem {
  id: string;
  name: string;
  category: 'Core' | 'Commands' | 'Config' | 'General';
  path: string;
  description: string;
  content: string;
}

interface CodeViewerProps {
  files: CodeFileItem[];
  config?: BotConfig;
}

export function CodeViewer({ files, config }: CodeViewerProps) {
  const [activeTab, setActiveTab] = useState<string>(files[0]?.id || 'kuzmix-config');
  const [filterCategory, setFilterCategory] = useState<'All' | 'Config' | 'Core' | 'Commands' | 'General'>('All');
  const [copied, setCopied] = useState<boolean>(false);

  const filteredFiles = filterCategory === 'All' 
    ? files 
    : files.filter((f) => f.category === filterCategory);

  const currentFile = files.find((f) => f.id === activeTab) || filteredFiles[0] || files[0];

  const handleCopy = async () => {
    if (!currentFile) return;
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    if (!currentFile) return;
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-0">
      {/* Category Filter Bar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium mr-1 hidden sm:inline-block">Filter Category:</span>
          {(['All', 'Config', 'Core', 'Commands', 'General'] as const).map((cat) => {
            const count = cat === 'All' ? files.length : files.filter((f) => f.category === cat).length;
            const isSelected = filterCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setFilterCategory(cat);
                  const firstOfCat = cat === 'All' ? files[0] : files.find((f) => f.category === cat);
                  if (firstOfCat) setActiveTab(firstOfCat.id);
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
        <span className="text-[11px] text-slate-400 hidden md:inline-block font-mono">
          {filteredFiles.length} file{filteredFiles.length === 1 ? '' : 's'} available
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-800 bg-slate-950/60 p-2 sm:p-3 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
        {filteredFiles.map((file) => {
          const isActive = file.id === activeTab;
          return (
            <button
              key={file.id}
              onClick={() => setActiveTab(file.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{file.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                file.category === 'Core' 
                  ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' 
                  : file.category === 'Commands'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : file.category === 'Config'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {file.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Target Path Bar */}
      <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-xs">Path:</span>
          <span className="font-mono px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold">
            {currentFile.path}
          </span>
          <span className="text-slate-400 text-[11px] hidden md:inline-block">
            — {currentFile.description}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition border shadow-sm ${
              copied
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-blue-200" />
                <span>Copied Code</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-blue-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
            title="Download this file"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="relative">
        <pre className="p-4 sm:p-5 text-xs text-slate-200 font-mono overflow-x-auto bg-slate-950 max-h-[520px] leading-relaxed select-text">
          <code>{currentFile.content}</code>
        </pre>
      </div>

      {/* Footer Instructions */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-white font-medium">Deployment Target: </span>
          Replace the content of <code className="text-blue-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{currentFile.path}</code> in your Baileys bot repository.
        </div>
      </div>
    </div>
  );
}
