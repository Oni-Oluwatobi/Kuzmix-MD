'use client';

import React from 'react';
import { PairingPortal } from '@/components/PairingPortal';
import Link from 'next/link';
import { Bot, ArrowLeft } from 'lucide-react';

export default function StandalonePairingPage() {
  return (
    <main className="min-h-screen bg-[#0d0905]">
      {/* Floating quick return to studio */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-xs font-semibold text-orange-200 hover:text-white border border-orange-500/30 backdrop-blur-md shadow-lg shadow-black/50 transition duration-150"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-yellow-400" />
          <span>Open Kuzmix-MD Studio</span>
        </Link>
      </div>

      <PairingPortal
        botName="Kuzmix-MD"
        developerName="Oni Oluwatobi"
        organization="The Kreadive Galaxy"
        initialPhone="2348143186133"
        isStandalone={true}
      />
    </main>
  );
}
