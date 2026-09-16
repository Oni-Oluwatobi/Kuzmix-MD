let baileys = null;
try {
  baileys = require('@whiskeysockets/baileys');
} catch (_) {
  try {
    baileys = require('../node_modules/@whiskeysockets/baileys');
  } catch (_) {
    try {
      baileys = require('../../bot/node_modules/@whiskeysockets/baileys');
    } catch (_) {}
  }
}

/**
 * Recursively unwraps WhatsApp message wrappers like ephemeralMessage,
 * viewOnceMessage, viewOnceMessageV2, documentWithCaptionMessage, etc.
 */
function unwrapMessage(msg) {
  if (!msg) return null;
  let m = msg.message || msg;

  let depth = 0;
  while (m && depth < 10) {
    depth++;
    if (m.ephemeralMessage) {
      m = m.ephemeralMessage.message;
    } else if (m.viewOnceMessage) {
      m = m.viewOnceMessage.message;
    } else if (m.viewOnceMessageV2) {
      m = m.viewOnceMessageV2.message;
    } else if (m.viewOnceMessageV2Extension) {
      m = m.viewOnceMessageV2Extension.message;
    } else if (m.documentWithCaptionMessage) {
      m = m.documentWithCaptionMessage.message;
    } else if (m.editedMessage) {
      m = m.editedMessage.message?.protocolMessage?.editedMessage || m.editedMessage.message;
    } else {
      break;
    }
  }

  return m;
}

/**
 * Extract media object, media type, and view-once status from direct message or quoted message
 */
function extractMediaInfo(msg) {
  if (!msg) return null;

  const rawMsg = msg.message || msg;
  const unwrappedDirect = unwrapMessage(rawMsg);
  const keyViewOnce = Boolean(msg && msg.key && msg.key.viewOnce);

  // Check quoted message first
  const quoted =
    rawMsg?.extendedTextMessage?.contextInfo?.quotedMessage ||
    unwrappedDirect?.extendedTextMessage?.contextInfo?.quotedMessage;

  const unwrappedQuoted = quoted ? unwrapMessage(quoted) : null;

  // 1. Inspect Quoted Message
  if (unwrappedQuoted) {
    const isQuotedViewOnce = Boolean(
      keyViewOnce ||
      quoted?.viewOnceMessage ||
      quoted?.viewOnceMessageV2 ||
      quoted?.viewOnceMessageV2Extension ||
      unwrappedQuoted?.imageMessage?.viewOnce ||
      unwrappedQuoted?.videoMessage?.viewOnce ||
      unwrappedQuoted?.audioMessage?.viewOnce
    );

    if (unwrappedQuoted.imageMessage) {
      return {
        mediaObject: unwrappedQuoted.imageMessage,
        type: 'image',
        mimetype: unwrappedQuoted.imageMessage.mimetype || 'image/jpeg',
        caption: unwrappedQuoted.imageMessage.caption || '',
        isViewOnce: isQuotedViewOnce,
        isQuoted: true,
        rawMessage: unwrappedQuoted,
      };
    }
    if (unwrappedQuoted.videoMessage) {
      return {
        mediaObject: unwrappedQuoted.videoMessage,
        type: 'video',
        mimetype: unwrappedQuoted.videoMessage.mimetype || 'video/mp4',
        caption: unwrappedQuoted.videoMessage.caption || '',
        isViewOnce: isQuotedViewOnce,
        isQuoted: true,
        rawMessage: unwrappedQuoted,
      };
    }
    if (unwrappedQuoted.audioMessage) {
      return {
        mediaObject: unwrappedQuoted.audioMessage,
        type: 'audio',
        mimetype: unwrappedQuoted.audioMessage.mimetype || 'audio/mp4',
        isViewOnce: isQuotedViewOnce,
        isQuoted: true,
        rawMessage: unwrappedQuoted,
      };
    }
    if (unwrappedQuoted.stickerMessage) {
      return {
        mediaObject: unwrappedQuoted.stickerMessage,
        type: 'sticker',
        mimetype: unwrappedQuoted.stickerMessage.mimetype || 'image/webp',
        isViewOnce: false,
        isQuoted: true,
        rawMessage: unwrappedQuoted,
      };
    }
    if (unwrappedQuoted.documentMessage) {
      return {
        mediaObject: unwrappedQuoted.documentMessage,
        type: 'document',
        mimetype: unwrappedQuoted.documentMessage.mimetype || 'application/octet-stream',
        caption: unwrappedQuoted.documentMessage.caption || '',
        fileName: unwrappedQuoted.documentMessage.fileName || 'document',
        isViewOnce: isQuotedViewOnce,
        isQuoted: true,
        rawMessage: unwrappedQuoted,
      };
    }
  }

  // 2. Inspect Direct Message
  if (unwrappedDirect) {
    const isDirectViewOnce = Boolean(
      keyViewOnce ||
      rawMsg?.viewOnceMessage ||
      rawMsg?.viewOnceMessageV2 ||
      rawMsg?.viewOnceMessageV2Extension ||
      unwrappedDirect?.imageMessage?.viewOnce ||
      unwrappedDirect?.videoMessage?.viewOnce ||
      unwrappedDirect?.audioMessage?.viewOnce
    );

    if (unwrappedDirect.imageMessage) {
      return {
        mediaObject: unwrappedDirect.imageMessage,
        type: 'image',
        mimetype: unwrappedDirect.imageMessage.mimetype || 'image/jpeg',
        caption: unwrappedDirect.imageMessage.caption || '',
        isViewOnce: isDirectViewOnce,
        isQuoted: false,
        rawMessage: unwrappedDirect,
      };
    }
    if (unwrappedDirect.videoMessage) {
      return {
        mediaObject: unwrappedDirect.videoMessage,
        type: 'video',
        mimetype: unwrappedDirect.videoMessage.mimetype || 'video/mp4',
        caption: unwrappedDirect.videoMessage.caption || '',
        isViewOnce: isDirectViewOnce,
        isQuoted: false,
        rawMessage: unwrappedDirect,
      };
    }
    if (unwrappedDirect.audioMessage) {
      return {
        mediaObject: unwrappedDirect.audioMessage,
        type: 'audio',
        mimetype: unwrappedDirect.audioMessage.mimetype || 'audio/mp4',
        isViewOnce: isDirectViewOnce,
        isQuoted: false,
        rawMessage: unwrappedDirect,
      };
    }
    if (unwrappedDirect.stickerMessage) {
      return {
        mediaObject: unwrappedDirect.stickerMessage,
        type: 'sticker',
        mimetype: unwrappedDirect.stickerMessage.mimetype || 'image/webp',
        isViewOnce: false,
        isQuoted: false,
        rawMessage: unwrappedDirect,
      };
    }
    if (unwrappedDirect.documentMessage) {
      return {
        mediaObject: unwrappedDirect.documentMessage,
        type: 'document',
        mimetype: unwrappedDirect.documentMessage.mimetype || 'application/octet-stream',
        caption: unwrappedDirect.documentMessage.caption || '',
        fileName: unwrappedDirect.documentMessage.fileName || 'document',
        isViewOnce: isDirectViewOnce,
        isQuoted: false,
        rawMessage: unwrappedDirect,
      };
    }
  }

  return null;
}

/**
 * Downloads media payload into a Buffer using Baileys stream decryptor
 */
async function downloadMedia(mediaInfo, sock, originalMsg) {
  if (!mediaInfo || !mediaInfo.mediaObject) {
    throw new Error('No media found to download.');
  }

  const { mediaObject, type } = mediaInfo;

  // Strategy 1: downloadContentFromMessage (primary, most resilient)
  if (baileys && typeof baileys.downloadContentFromMessage === 'function') {
    try {
      const stream = await baileys.downloadContentFromMessage(mediaObject, type);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      if (buffer && buffer.length > 0) {
        return buffer;
      }
    } catch (err) {
      console.warn('[MEDIA DOWNLOAD] downloadContentFromMessage failed, trying fallback:', err.message);
    }
  }

  // Strategy 2: downloadMediaMessage with reconstructed message wrapper
  if (baileys && typeof baileys.downloadMediaMessage === 'function') {
    try {
      const target = {
        key: originalMsg?.key || {},
        message: mediaInfo.rawMessage || { [`${type}Message`]: mediaObject },
      };
      const buf = await baileys.downloadMediaMessage(
        target,
        'buffer',
        {},
        {
          logger: { level: 'silent', child: () => ({ info: () => {}, error: () => {}, warn: () => {}, debug: () => {}, trace: () => {} }), info: () => {}, error: () => {}, warn: () => {}, debug: () => {}, trace: () => {} },
          reuploadRequest: sock?.updateMediaMessage,
        }
      );
      if (buf && buf.length > 0) {
        return buf;
      }
    } catch (fallbackErr) {
      console.error('[MEDIA DOWNLOAD] downloadMediaMessage fallback also failed:', fallbackErr.message);
    }
  }

  throw new Error('Could not download media stream from WhatsApp servers. Media may have expired.');
}

module.exports = {
  unwrapMessage,
  extractMediaInfo,
  downloadMedia,
};
