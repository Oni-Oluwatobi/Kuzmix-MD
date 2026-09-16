'use client';

import React, { useState, useMemo } from 'react';
import { BotConfig } from '@/components/types';
import { Header } from '@/components/Header';
import { AdminOverview } from '@/components/AdminOverview';
import { IdentityConfigurator } from '@/components/IdentityConfigurator';
import { CodeViewer } from '@/components/CodeViewer';
import { WhatsAppSimulator } from '@/components/WhatsAppSimulator';
import { VisualAssetGuide } from '@/components/VisualAssetGuide';
import { SecurityChecklist } from '@/components/SecurityChecklist';
import { CommandCatalog } from '@/components/CommandCatalog';
import { UnknownModeDocumentation } from '@/components/UnknownModeDocumentation';
import {
  generateKuzmixConfig,
  generateKuzmixIndex,
  generateCredCommand,
  generateMenuCommand,
  generateUnknownCommand,
  generateAiAndCodingCommands,
  generateAiMediaCommands,
  generateVisionAndMediaCommands,
  generateVoiceAndCreativeCommands,
  generateGroupAndSecurityCommands,
  generateInternetAndDownloadCommands,
  generateOwnerAndKuzmixCommands,
  generatePackageJson,
  generateEnv,
  generateRenderYaml,
  generateDeployScript,
} from '@/lib/codeGenerators';
import { PairingPortal } from '@/components/PairingPortal';
import {
  LayoutDashboard,
  Settings,
  Terminal,
  Lock,
  Smartphone,
  FileCode,
  Palette,
  Shield,
  Bot,
  X,
  ChevronRight,
  ExternalLink,
  Zap,
} from 'lucide-react';

const INITIAL_CONFIG: BotConfig = {
  botName: 'Kuzmix-MD',
  ownerName: 'Oni Oluwatobi | The Kreadive Galaxy',
  botDeveloper: 'Oni Oluwatobi',
  ownerNumbers: ['2348143186133', '2349124846023'],
  stickerPack: 'Kuzmix-MD',
  stickerAuthor: 'Oni Oluwatobi',
  prefix: '.',
  organization: 'The Kreadive Galaxy',
  email: 'thekreadivegalaxy@gmail.com',
  waitMessage: '⏳ Processing your request with Kuzmix-MD, please wait...',
  watermark: '© Kuzmix-MD • The Kreadive Galaxy',
};

type AdminSection =
  | 'overview'
  | 'pairing'
  | 'config'
  | 'commands'
  | 'unknown'
  | 'simulator'
  | 'files'
  | 'assets'
  | 'security';

export default function HomePage() {
  const [config, setConfig] = useState<BotConfig>(INITIAL_CONFIG);
  const [customLogoUrl, setCustomLogoUrl] = useState<string | undefined>(undefined);
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleReset = () => {
    setConfig(INITIAL_CONFIG);
  };

  // Generate code files dynamically based on reactive user state
  const generatedFiles = useMemo(() => {
    return [
      {
        id: 'kuzmix-config',
        name: 'config.js',
        category: 'Config' as const,
        path: './config.js',
        description: 'Primary configuration, prefix settings, owner credentials, and media paths',
        content: generateKuzmixConfig(config),
      },
      {
        id: 'kuzmix-index',
        name: 'index.js',
        category: 'Core' as const,
        path: './index.js',
        description: 'Native Baileys WebSocket socket connection, session reconnects, and command router',
        content: generateKuzmixIndex(config),
      },
      {
        id: 'kuzmix-menu',
        name: 'menu.js',
        category: 'Commands' as const,
        path: './commands/menu.js',
        description: 'Master 18-module command hierarchy with runtime telemetry & system stats',
        content: generateMenuCommand(config),
      },
      {
        id: 'kuzmix-cred',
        name: 'cred.js',
        category: 'Commands' as const,
        path: './commands/cred.js',
        description: 'Kuzmix-MD official developer credits & engine verification banner',
        content: generateCredCommand(config),
      },
      {
        id: 'ai-coding-cmd',
        name: 'ai-coding.js',
        category: 'Commands' as const,
        path: './commands/ai-coding.js',
        description: 'AI intelligence, reasoning, translation, and code engineering suite',
        content: generateAiAndCodingCommands(config),
      },
      {
        id: 'ai-media-cmd',
        name: 'ai-media.js',
        category: 'Commands' as const,
        path: './commands/ai-media.js',
        description: 'OpenRouter Free Text-to-Image (FLUX.1) & Text-to-Video (Wan2.1) Generative Suite',
        content: generateAiMediaCommands(config),
      },
      {
        id: 'vision-media-cmd',
        name: 'vision-media.js',
        category: 'Commands' as const,
        path: './commands/vision-media.js',
        description: 'Vision OCR, image manipulation, sticker converter & Exif watermarking',
        content: generateVisionAndMediaCommands(config),
      },
      {
        id: 'voice-creative-cmd',
        name: 'voice-creative.js',
        category: 'Commands' as const,
        path: './commands/voice-creative.js',
        description: 'Text-to-speech audio voice notes and creative story writing suite',
        content: generateVoiceAndCreativeCommands(config),
      },
      {
        id: 'group-security-cmd',
        name: 'group-security.js',
        category: 'Commands' as const,
        path: './commands/group-security.js',
        description: 'Group administration, tagall broadcasts, anti-link & anti-spam shield',
        content: generateGroupAndSecurityCommands(config),
      },
      {
        id: 'unknown-cmd',
        name: 'unknown.js',
        category: 'Commands' as const,
        path: './commands/unknown.js',
        description: 'Private Response Routing Mode (UNKNOWN MODE) user-level toggle and status handler',
        content: generateUnknownCommand(config),
      },
      {
        id: 'internet-download-cmd',
        name: 'internet-download.js',
        category: 'Commands' as const,
        path: './commands/internet-download.js',
        description: '320kbps music downloader, GitHub repo cloner, live weather & utilities',
        content: generateInternetAndDownloadCommands(config),
      },
      {
        id: 'owner-kuzmix-cmd',
        name: 'owner-kuzmix.js',
        category: 'Commands' as const,
        path: './commands/owner-kuzmix.js',
        description: 'Owner management, restart, broadcast, eval, and core Kuzmix ecosystem info',
        content: generateOwnerAndKuzmixCommands(config),
      },
      {
        id: 'package-json',
        name: 'package.json',
        category: 'General' as const,
        path: './package.json',
        description: 'Complete project manifest, Baileys dependencies, and author metadata',
        content: generatePackageJson(config),
      },
      {
        id: 'env-file',
        name: 'config.env',
        category: 'Config' as const,
        path: './config.env',
        description: 'Environment variables for cloud deployment (Heroku, Koyeb, VPS)',
        content: generateEnv(config),
      },
      {
        id: 'render-yaml',
        name: 'render.yaml',
        category: 'Config' as const,
        path: './render.yaml',
        description: 'Render Blueprint infrastructure configuration for 24/7 free web service deployment',
        content: generateRenderYaml(config),
      },
      {
        id: 'deploy-sh',
        name: 'deploy.sh',
        category: 'Config' as const,
        path: './deploy.sh',
        description: 'One-click automated deployment script for Render, Heroku & Koyeb with injected environment variables',
        content: generateDeployScript(config, 'render'),
      },
    ];
  }, [config]);

  const navItems = useMemo(() => [
    {
      group: 'Core Management',
      items: [
        {
          id: 'overview' as const,
          label: 'Overview & Cockpit',
          icon: LayoutDashboard,
          badge: 'Online',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        },
        {
          id: 'pairing' as const,
          label: 'Pairing Portal',
          icon: Zap,
          badge: 'Pair Bot',
          badgeColor: 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-yellow-300 border-orange-500/40',
        },
        {
          id: 'config' as const,
          label: 'Identity & Config',
          icon: Settings,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'commands' as const,
          label: 'Command Catalog',
          icon: Terminal,
          badge: '18 Modules',
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        },
        {
          id: 'unknown' as const,
          label: 'Unknown Mode',
          icon: Lock,
          badge: 'Privacy',
          badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        },
      ],
    },
    {
      group: 'Testing & Development',
      items: [
        {
          id: 'simulator' as const,
          label: 'WhatsApp Simulator',
          icon: Smartphone,
          badge: 'Live',
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        },
        {
          id: 'files' as const,
          label: 'Generated Files',
          icon: FileCode,
          badge: `${generatedFiles.length}`,
          badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
        },
        {
          id: 'assets' as const,
          label: 'Visual Assets',
          icon: Palette,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'security' as const,
          label: 'Security & Deploy',
          icon: Shield,
          badge: null,
          badgeColor: '',
        },
      ],
    },
  ], [generatedFiles.length]);

  const currentNavTitle = useMemo(() => {
    for (const group of navItems) {
      const match = group.items.find((item) => item.id === activeSection);
      if (match) return match.label;
    }
    return 'Administration';
  }, [activeSection, navItems]);

  const handleNavigate = (section: AdminSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-200 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* Top Header Bar */}
      <Header
        botName={config.botName}
        ownerName={config.ownerName}
        botDeveloper={config.botDeveloper}
        activeSectionTitle={currentNavTitle}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onQuickSimulator={() => setActiveSection('simulator')}
      />

      {/* Main Admin Workspace (Sidebar + Content View) */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 shrink-0 hidden lg:block space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 space-y-6 sticky top-22">
            {navItems.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
                  {group.group}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                              isActive
                                ? 'bg-blue-500/40 text-white border-blue-400/40'
                                : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quick Engine Status Footer Box in Sidebar */}
            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 px-2 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span>Prefix</span>
                <span className="font-mono text-blue-300 font-bold">{config.prefix}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>Owner</span>
                <span className="font-mono text-emerald-400 text-[10px]">+{config.ownerNumbers[0]}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-full bg-slate-950 border-r border-slate-800 h-full p-4 flex flex-col justify-between overflow-y-auto z-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-white text-sm">{config.botName}</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {navItems.map((group, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                      {group.group}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                              isActive
                                ? 'bg-blue-600 text-white font-semibold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
                <span>Developer: <strong className="text-white">{config.botDeveloper}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Workspace (Single Focused View Per Section) */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Section 1: Overview & Dashboard Cockpit */}
          {activeSection === 'overview' && (
            <AdminOverview
              config={config}
              onNavigate={handleNavigate}
              totalFiles={generatedFiles.length}
            />
          )}

          {/* Section 1.5: WhatsApp Multi-Device Pairing Portal (Orange, Yellow & White) */}
          {activeSection === 'pairing' && (
            <PairingPortal
              botName={config.botName}
              developerName={config.botDeveloper}
              organization={config.organization}
              initialPhone={config.ownerNumbers[0]}
              onBackToStudio={() => setActiveSection('overview')}
            />
          )}

          {/* Section 2: Identity & Parameters */}
          {activeSection === 'config' && (
            <IdentityConfigurator
              config={config}
              onChange={setConfig}
              onReset={handleReset}
              onLogoUpload={setCustomLogoUrl}
            />
          )}

          {/* Section 3: 18-Module Master Command Catalog */}
          {activeSection === 'commands' && (
            <CommandCatalog
              config={config}
              onTestCommand={(cmd) => {
                setActiveSection('simulator');
              }}
              onNavigateToUnknown={() => setActiveSection('unknown')}
            />
          )}

          {/* Section 4: Unknown Mode Documentation & Sandbox */}
          {activeSection === 'unknown' && (
            <UnknownModeDocumentation
              config={config}
              onTestCommand={(cmd) => {
                setActiveSection('simulator');
              }}
              onNavigateToSimulator={() => setActiveSection('simulator')}
            />
          )}

          {/* Section 5: WhatsApp Client Simulator */}
          {activeSection === 'simulator' && (
            <WhatsAppSimulator config={config} customLogoUrl={customLogoUrl} />
          )}

          {/* Section 6: Source Code Files */}
          {activeSection === 'files' && (
            <CodeViewer files={generatedFiles} config={config} />
          )}

          {/* Section 7: Visual Assets */}
          {activeSection === 'assets' && (
            <VisualAssetGuide
              config={config}
              customLogoUrl={customLogoUrl}
              onLogoUpload={setCustomLogoUrl}
            />
          )}

          {/* Section 8: Security & Deployment */}
          {activeSection === 'security' && (
            <SecurityChecklist config={config} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/60 py-6 px-4 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{config.botName} Administration Studio</span>
            <span>•</span>
            <span>Developed by <strong className="text-slate-300">{config.botDeveloper}</strong></span>
          </div>
          <div className="text-[11px] text-slate-400">
            Native Baileys Multi-Device Architecture • The Kreadive Galaxy
          </div>
          <div className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
