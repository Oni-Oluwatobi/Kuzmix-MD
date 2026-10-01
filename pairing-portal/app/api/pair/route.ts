import { NextRequest, NextResponse } from 'next/server';
import { requestPairing, getSession, decodeDisconnectReason, getActiveSessionCount } from '@/lib/pairing/connection';

export const dynamic = 'force-dynamic';

function normalizePhone(input: string): string {
  return String(input || '').replace(/\D/g, '');
}

// --- In-memory rate limiter (single-instance deployment) ---
const RATE_WINDOW_MS = 60_000;
const hitLog = new Map<string, number[]>();

function allow(key: string, maxPerMinute: number): boolean {
  const now = Date.now();
  const hits = (hitLog.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= maxPerMinute) {
    hitLog.set(key, hits);
    return false;
  }
  hits.push(now);
  hitLog.set(key, hits);
  if (hitLog.size > 2000) {
    for (const [k, v] of hitLog) {
      if (v.every((t) => now - t >= RATE_WINDOW_MS)) hitLog.delete(k);
    }
  }
  return true;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function tooMany(ip: string) {
  return NextResponse.json(
    { error: 'Too many requests. Please wait a moment and try again.' },
    { status: 429 }
  );
}

// Cap concurrent Baileys pairing sockets (each holds memory + a temp
// credential dir; an unbounded count lets anyone exhaust the instance).
const MAX_ACTIVE_PAIRINGS = 6;

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
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
      if (!allow(`chk:${ip}`, 60)) return tooMany(ip);
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
      if (!allow(`clr:${ip}`, 6)) return tooMany(ip);
      const session = getSession(cleanPhone);
      // Never tear down a pairing that is actively requesting a code —
      // that was the unauthenticated mid-flight DoS vector.
      if (session && session.status === 'requesting') {
        return NextResponse.json(
          { error: 'A pairing request is in progress for this number. Please wait a few seconds.' },
          { status: 409 }
        );
      }
      const { cleanupSession } = await import('@/lib/pairing/connection');
      cleanupSession(cleanPhone, 'Cleared by user');
      return NextResponse.json({ success: true, phone: cleanPhone, status: 'idle' });
    }

    // Default: generate a real Baileys pairing code
    if (!allow(`gen:${ip}`, 5)) return tooMany(ip);
    if (getActiveSessionCount() >= MAX_ACTIVE_PAIRINGS) {
      return NextResponse.json(
        { error: 'The pairing service is busy right now. Please try again in a minute.' },
        { status: 429 }
      );
    }

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
    // Log details server-side only; never echo internals to the client.
    console.error('[PAIRING API ERROR]', err);
    return NextResponse.json(
      { error: 'Something went wrong while processing the pairing request. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  if (!allow(`get:${ip}`, 60)) return tooMany(ip);

  const phone = normalizePhone(req.nextUrl.searchParams.get('phone') || '');
  if (!phone || phone.length < 8) {
    return NextResponse.json({ status: 'idle', exists: false });
  }
  const session = getSession(phone);
  if (!session) {
    return NextResponse.json({ phone, status: 'idle', exists: false });
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
  });
}
