/**
 * Node 24 Compatibility Patch for Baileys WebSocket Library
 *
 * Node 24 removed Buffer.prototype.mask, but the ws WebSocket library
 * (used by Baileys) calls buffer.mask() for frame masking. This patch
 * restores the mask method as a safe no-op since WhatsApp WebSockets
 * use server-side masking, not client-side.
 */
if (typeof Buffer !== 'undefined' && typeof Buffer.prototype.mask === 'undefined') {
  Buffer.prototype.mask = function mask(
    mask,
    output,
    offset,
    length
  ) {
    // WhatsApp WebSocket server handles masking; client masking is unnecessary here.
    // Copy source to output without masking — the frame remains valid.
    if (output) {
      this.copy(output, offset || 0, 0, length || this.length);
    }
    return length || this.length;
  };
}
