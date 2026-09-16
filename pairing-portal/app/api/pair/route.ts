import { NextRequest, NextResponse } from 'next/server';
import { requestPairing, getSession, decodeDisconnectReason, getActiveSessionCount } from '@/lib/pairing/connection';

export const dynamic = 'force-dynamic';

function normalizePhone(input: string): string {
  return String(input || '').replace(/\D/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}) as Record<string, unknown>);
    const { phone, action = 'generate' } = body as { phone?: string; action?: string };

    const cleanPhone = normalizePhone(phone || '');

    if (!cleanPhone || cleanPhone.length < 8 || cleanPhone.length > 16) {
      return NextResponse.json(
        {
          error: 'Invalid phone number. Provide a full international number without the "+" (e.g. 2348143186133).',
        },
        { status: 400 }
      );
    }

    if (action === 'check') {
      const session = getSession(cleanPhone);
      if (!session) {
        return NextResponse.json({ phone: cleanPhone, status: 'idle', exists: false });
      }

      return NextResponse.json({
        phone: cleanPhone,
        exists: true,
        status: session.status,
        code: session.status === 'verifying' || session.status === 'connected' ? session.code : null,
        statusCode: session.statusCode ?? null,
        disconnectReason: session.disconnectReason ?? null,
        expiresIn: session.expiresIn,
        sessionId: session.status === 'connected' ? `KUZMIX-MD~${cleanPhone}~CONNECTED` : null,
      });
    }

    if (action === 'clear') {
      const { cleanupSession } = await import('@/lib/pairing/connection');
      cleanupSession(cleanPhone, 'Cleared by user');
      return NextResponse.json({ success: true, phone: cleanPhone, status: 'idle' });
    }

    // Default: generate a real Baileys pairing code
    const result = await requestPairing(cleanPhone);

    if (!result.success) {
      const reason = result.error || 'Failed to request pairing code';
      return NextResponse.json(
        {
          error: reason,
          hint: decodeDisconnectReason({ message: reason }).reasonText || undefined,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      phone: cleanPhone,
      code: result.code,
      formattedCode: result.code,
      expiresIn: result.expiresIn ?? 120,
      status: result.status ?? 'verifying',
      sessionId: `KUZMIX-MD~${cleanPhone}~${Date.now().toString(36).toUpperCase()}`,
      instructions: [
        'Open WhatsApp on your phone',
        'Go to Settings or tap the 3 dots (⋮)',
        'Select "Linked Devices" and tap "Link a Device"',
        'Tap "Link with phone number instead" at the bottom',
        `Enter the 8-character code: ${result.code}`,
      ],
      branding: {
        bot: 'Kuzmix-MD',
        organization: 'The Kreadive Galaxy',
        engine: 'Baileys Multi-Device',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process pairing';
    console.error('[PAIRING API ERROR]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const phone = normalizePhone(req.nextUrl.searchParams.get('phone') || '');
  if (!phone || phone.length < 8) {
    return NextResponse.json({ status: 'idle', exists: false, activeSessions: getActiveSessionCount() });
  }
  const session = getSession(phone);
  if (!session) {
    return NextResponse.json({ phone, status: 'idle', exists: false, activeSessions: getActiveSessionCount() });
  }
  return NextResponse.json({
    phone,
    exists: true,
    status: session.status,
    code: session.status === 'verifying' || session.status === 'connected' ? session.code : null,
    statusCode: session.statusCode ?? null,
    disconnectReason: session.disconnectReason ?? null,
    expiresIn: session.expiresIn,
    sessionId: session.status === 'connected' ? `KUZMIX-MD~${phone}~CONNECTED` : null,
    activeSessions: getActiveSessionCount(),
  });
}