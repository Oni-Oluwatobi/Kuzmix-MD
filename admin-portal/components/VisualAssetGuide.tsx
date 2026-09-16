'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useRef } from 'react';
import { BotConfig } from './types';
import { Image as ImageIcon, Upload, Layers, Palette, CheckCircle2 } from 'lucide-react';

interface VisualAssetGuideProps {
  config: BotConfig;
  customLogoUrl?: string;
  onLogoUpload: (dataUrl: string) => void;
}

export function VisualAssetGuide({ config, customLogoUrl, onLogoUpload }: VisualAssetGuideProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onLogoUpload(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-1">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-pink-400" />
          Visual Assets &amp; Media Directory Mapping
        </h2>
        <p className="text-xs text-slate-400">
          Directory mapping for your Kuzmix-MD logos, alive banners, and thumbnail assets.
        </p>
      </div>

      {/* Upload tester */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
            {customLogoUrl ? (
              <img src={customLogoUrl} alt="Uploaded logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-6 h-6 text-slate-500" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Custom Logo Preview</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload your branded image (JPG/PNG) to test how it looks in the WhatsApp chat simulator and rich cards.
            </p>
          </div>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-blue-600/25"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Select Brand Logo</span>
          </button>
        </div>
      </div>

      {/* Asset Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Main Brand Assets */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              Primary System Images
            </span>
            <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-mono">
              /image directory
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-blue-300 font-semibold font-mono text-xs">
                1. Main Menu Banner
              </p>
              <p className="text-slate-400 text-xs">
                Path: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-blue-300 font-mono border border-slate-800">./image/kuzmix.jpg</code>
              </p>
              <p className="text-slate-500 text-[11px]">Recommended: 1280x720 JPEG</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-blue-300 font-semibold font-mono text-xs">
                2. Alive / Status Image
              </p>
              <p className="text-slate-400 text-xs">
                Path: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-blue-300 font-mono border border-slate-800">./image/alive.jpg</code>
              </p>
              <p className="text-slate-500 text-[11px]">Recommended: 1080x1080 Square JPEG</p>
            </div>
          </div>
        </div>

        {/* Media & Audio Assets */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-pink-400" />
              Audio &amp; Sticker Folders
            </span>
            <span className="text-[10px] bg-pink-500/10 text-pink-300 px-2.5 py-0.5 rounded-full border border-pink-500/20 font-mono">
              /media directory
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-pink-300 font-semibold font-mono text-xs">
                1. Voice &amp; TTS Cache
              </p>
              <p className="text-slate-400 text-xs">
                Path: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-pink-300 font-mono border border-slate-800">./media/voice/</code>
              </p>
              <p className="text-slate-500 text-[11px]">Stores temporary .mp3 &amp; .opus voice files</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-pink-300 font-semibold font-mono text-xs">
                2. WebP Sticker Temp Cache
              </p>
              <p className="text-slate-400 text-xs">
                Path: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-pink-300 font-mono border border-slate-800">./media/stickers/</code>
              </p>
              <p className="text-slate-500 text-[11px]">Stores converted stickers before sending</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
