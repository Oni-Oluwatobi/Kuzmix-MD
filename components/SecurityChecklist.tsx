'use client';

import React, { useState } from 'react';
import { BotConfig } from './types';
import { generateDeployScript, generateRenderYaml } from '@/lib/codeGenerators';
import {
  ShieldCheck,
  AlertOctagon,
  KeyRound,
  Terminal,
  Server,
  Check,
  Copy,
  Download,
  Rocket,
  Code2,
  Cpu,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  Lock,
  Globe,
  Activity,
  HeartPulse,
} from 'lucide-react';

interface SecurityChecklistProps {
  config?: BotConfig;
}

export function SecurityChecklist({ config }: SecurityChecklistProps) {
  const currentConfig: BotConfig = config || {
    botName: 'Kuzmix-MD',
    ownerName: 'Emmanuel (Kuzmix)',
    botDeveloper: 'Kuzmix Tech (Emmanuel)',
    ownerNumbers: ['2348143186133', '2349124846023'],
    stickerPack: 'Kuzmix-MD Sticker Pack',
    stickerAuthor: 'The Kreadive Galaxy',
    prefix: '.',
    organization: 'The Kreadive Galaxy',
    email: 'thekreadivegalaxy@gmail.com',
    waitMessage: '⏳ Please wait, processing your request...',
  };

  const [platform, setPlatform] = useState<'all' | 'render' | 'heroku' | 'koyeb'>('render');
  const [customSessionId, setCustomSessionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadRenderSuccess, setDownloadRenderSuccess] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [showRenderPreview, setShowRenderPreview] = useState(false);

  const deployScriptContent = generateDeployScript(currentConfig, platform, customSessionId);
  const renderYamlContent = generateRenderYaml(currentConfig, customSessionId);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(deployScriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDeployScript = () => {
    const blob = new Blob([deployScriptContent], { type: 'application/x-sh;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deploy.sh';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleDownloadRenderYaml = () => {
    const blob = new Blob([renderYamlContent], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'render.yaml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadRenderSuccess(true);
    setTimeout(() => setDownloadRenderSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-1">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          Cloud Deployment &amp; Session Hardening
        </h2>
        <p className="text-xs text-slate-400">
          Automated deployment utilities, session hardening, and 24/7 free cloud hosting automation for {currentConfig.botName}.
        </p>
      </div>

      {/* DEDICATED RENDER SPOTLIGHT CARD */}
      <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-cyan-950/70 rounded-2xl border border-indigo-500/40 p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1 font-mono">
                <Globe className="w-3 h-3 text-indigo-400" />
                Render Free Hosting
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                24/7 Free Web Service Ready
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Deploy to Render (Free Online)</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Deploy {currentConfig.botName} completely free on <strong>Render</strong> using its GitHub continuous deployment engine with built-in HTTP health endpoints and pre-configured <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-[11px]">render.yaml</code> Blueprint.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadRenderYaml}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition flex items-center gap-1.5 border border-indigo-500/30 active:scale-95"
            >
              {downloadRenderSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>render.yaml Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download render.yaml</span>
                </>
              )}
            </button>
            <a
              href="https://dashboard.render.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 active:scale-95 border border-indigo-400/30"
            >
              <span>Open Render Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Step by Step Render Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[11px]">1</span>
              Push to GitHub
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Push your bot folder with <code className="text-cyan-300 font-mono">render.yaml</code> to a private or public GitHub repository.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px]">2</span>
              Connect on Render
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Click <strong>New +</strong> → <strong>Web Service</strong> (or Blueprints), select your repo, and Render will auto-fill build and start commands.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[11px]">3</span>
              Set SESSION_ID &amp; 24/7 Keep-Alive
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Add your <code className="text-emerald-400 font-mono">SESSION_ID</code> in Environment Settings, then ping your <code className="text-emerald-400 font-mono">/health</code> endpoint with UptimeRobot so it stays online 24/7.
            </p>
          </div>
        </div>

        {/* 24/7 Keep Alive Notice Banner */}
        <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs">
          <HeartPulse className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-indigo-200">How to keep Render Free Tier running 24/7:</strong> Free Render web services sleep after 15 minutes without requests. {currentConfig.botName} includes a built-in Express endpoint (<code className="text-cyan-300 font-mono">/health</code>). Add your free Render URL to <a href="https://uptimerobot.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-semibold">UptimeRobot.com</a> with a 5-minute HTTP ping to keep your WhatsApp bot awake non-stop!
          </div>
        </div>
      </div>

      {/* ONE-CLICK DEPLOY SCRIPT CARD (RENDER, HEROKU, KOYEB) */}
      <div className="bg-gradient-to-br from-slate-900 via-[#101b2b] to-slate-950 rounded-2xl border border-blue-500/30 p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider flex items-center gap-1 font-mono">
                <Rocket className="w-3 h-3 text-blue-400" />
                Multi-Cloud Automation
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Render · Heroku · Koyeb
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>One-Click Deploy Script Generator</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Generate a fully configured, executable <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-[11px]">deploy.sh</code> with automated workflows for <strong>Render</strong>, <strong>Heroku</strong>, and <strong>Koyeb</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadDeployScript}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 border border-blue-400/30"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>deploy.sh Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>One-Click Deploy (deploy.sh)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Platform Selector */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Target Deployment Platform
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setPlatform('render')}
                className={`px-2 py-2 rounded-lg border font-mono text-[10px] transition text-center ${
                  platform === 'render'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Render (Free)
              </button>
              <button
                type="button"
                onClick={() => setPlatform('heroku')}
                className={`px-2 py-2 rounded-lg border font-mono text-[10px] transition text-center ${
                  platform === 'heroku'
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Heroku
              </button>
              <button
                type="button"
                onClick={() => setPlatform('koyeb')}
                className={`px-2 py-2 rounded-lg border font-mono text-[10px] transition text-center ${
                  platform === 'koyeb'
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Koyeb
              </button>
              <button
                type="button"
                onClick={() => setPlatform('all')}
                className={`px-2 py-2 rounded-lg border font-mono text-[10px] transition text-center ${
                  platform === 'all'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All Platforms
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {platform === 'render' && 'Generates complete render.yaml Blueprint manifest and automated GitHub deployment instructions.'}
              {platform === 'heroku' && 'Configures Heroku CLI, Procfile worker, FFmpeg buildpack & config vars.'}
              {platform === 'koyeb' && 'Generates koyeb.yaml manifest, Koyeb CLI commands & MicroVM config.'}
              {platform === 'all' && 'Provides an interactive terminal menu supporting Render, Heroku & Koyeb.'}
            </p>
          </div>

          {/* WhatsApp Session ID injection */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp SESSION_ID (Optional)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Injected into script</span>
            </label>
            <input
              type="text"
              value={customSessionId}
              onChange={(e) => setCustomSessionId(e.target.value)}
              placeholder="e.g. KUZMIX-MD~4b2f1a9c..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 transition placeholder:text-slate-600"
            />
            <p className="text-[11px] text-slate-400">
              Leave blank to insert placeholder or specify your Baileys multi-device pairing session string.
            </p>
          </div>
        </div>

        {/* Quick Run Command Instructions Banner */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              How to execute <code className="text-cyan-300 font-mono text-[11px]">deploy.sh</code> in your terminal:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyScript}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition px-2 py-1 rounded bg-slate-900 border border-slate-800"
                title="Copy entire deploy.sh to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy deploy.sh</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCodePreview(!showCodePreview)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition px-2 py-1 rounded bg-slate-900 border border-slate-800"
              >
                <Code2 className="w-3 h-3" />
                <span>{showCodePreview ? 'Hide Script' : 'Inspect Script'}</span>
                {showCodePreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-lg p-2.5 font-mono text-xs text-emerald-300 border border-slate-800 flex items-center justify-between overflow-x-auto">
            <code>chmod +x deploy.sh &amp;&amp; ./deploy.sh</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText('chmod +x deploy.sh && ./deploy.sh');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-1 hover:text-white text-slate-400 transition shrink-0 ml-2"
              title="Copy execution command"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Live Script Preview */}
        {showCodePreview && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-mono text-[11px] text-cyan-300">Generated deploy.sh preview ({deployScriptContent.split('\n').length} lines)</span>
              <span className="text-[10px] text-slate-400">Auto-tailored with active environment variables</span>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl text-slate-300 font-mono text-[11px] overflow-x-auto max-h-96 border border-slate-800 leading-relaxed scrollbar-thin">
              {deployScriptContent}
            </pre>
          </div>
        )}

        {/* Injected Environment Variables Summary Tags */}
        <div className="pt-2 border-t border-slate-800/80">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-cyan-400" />
            Pre-Injected Environment Variables in Script:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              `BOT_NAME="${currentConfig.botName}"`,
              `BOT_DEV="${currentConfig.botDeveloper}"`,
              `OWNER_NAME="${currentConfig.ownerName}"`,
              `OWNER_NUMBER="${currentConfig.ownerNumbers.join(',')}"`,
              `PREFIX="${currentConfig.prefix}"`,
              `STICKER_PACK="${currentConfig.stickerPack}"`,
              `STICKER_AUTHOR="${currentConfig.stickerAuthor}"`,
              `ORGANIZATION="${currentConfig.organization}"`,
              `EMAIL="${currentConfig.email}"`,
              `MODE="public"`,
              `ALWAYS_ONLINE="true"`,
              `PORT="3000"`,
              `NODE_ENV="production"`,
            ].map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-rose-300">
        <AlertOctagon className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-rose-200">Strict Safety Rule: Never Commit Your Session Data or Private Keys</p>
          <p className="text-rose-300/90 leading-relaxed">
            WhatsApp Multi-Device authentication uses Baileys cryptographic keys (<code className="bg-rose-950/80 px-1.5 py-0.5 rounded text-rose-100 font-mono border border-rose-500/20">creds.json</code>). If this file or your <code className="bg-rose-950/80 px-1.5 py-0.5 rounded text-rose-100 font-mono border border-rose-500/20">SESSION_ID</code> is pushed to a public GitHub repository, attackers can hijack your WhatsApp account and send unauthorized traffic.
          </p>
        </div>
      </div>

      {/* Recommended .gitignore */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <KeyRound className="w-4 h-4 text-blue-400" />
          Mandatory <code className="font-mono text-blue-300">.gitignore</code> Entries
        </h3>
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
          <p className="text-slate-500"># Baileys WhatsApp Session folders</p>
          <p className="text-blue-300">session/</p>
          <p className="text-blue-300">session/*.json</p>
          <p className="text-blue-300">creds.json</p>
          <p className="text-blue-300">*.session</p>
          <p className="text-slate-500 mt-2"># Environment variables &amp; secrets</p>
          <p className="text-blue-300">.env</p>
          <p className="text-blue-300">config.env</p>
          <p className="text-slate-500 mt-2"># Node.js dependencies</p>
          <p className="text-slate-400">node_modules/</p>
        </div>
      </div>

      {/* Deployment quick commands */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Globe className="w-4 h-4 text-indigo-400" />
            Render Environment Variables
          </div>
          <p className="text-slate-400 text-xs">Add these variables in Render Dashboard under <strong>Environment</strong>:</p>
          <pre className="bg-slate-950 p-3.5 rounded-xl text-indigo-300 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
{`SESSION_ID=YOUR_GENERATED_SESSION
OWNER_NUMBER=${currentConfig.ownerNumbers.join(',')}
BOT_NAME=${currentConfig.botName}
PREFIX=${currentConfig.prefix}
PORT=3000`}
          </pre>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Local / VPS Setup (PM2 24/7)
          </div>
          <p className="text-slate-400 text-xs">Run Kuzmix-MD permanently in the background on Linux VPS:</p>
          <pre className="bg-slate-950 p-3.5 rounded-xl text-emerald-300 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
{`npm install -g pm2
npm install
pm2 start index.js --name "kuzmix-md"
pm2 save && pm2 startup`}
          </pre>
        </div>
      </div>
    </div>
  );
}

