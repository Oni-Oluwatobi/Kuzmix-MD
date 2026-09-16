import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Kuzmix-MD Studio',
  description: 'Official configuration generator, Baileys MD engine, command manager, and OpenRouter AI text-to-image and video studio for Kuzmix-MD WhatsApp bot.',
  openGraph: {
    title: 'Kuzmix-MD Studio',
    description: 'Official configuration generator, Baileys MD engine, command manager, and OpenRouter AI text-to-image and video studio for Kuzmix-MD WhatsApp bot.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kuzmix-MD Studio',
    description: 'Official configuration generator, Baileys MD engine, command manager, and OpenRouter AI text-to-image and video studio for Kuzmix-MD WhatsApp bot.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
