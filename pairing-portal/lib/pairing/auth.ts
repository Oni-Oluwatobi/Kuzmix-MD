import fs from 'fs';
import path from 'path';

export function getSharedAuthDir(): string {
  if (process.env.KUZMIX_AUTH_DIR) {
    return process.env.KUZMIX_AUTH_DIR;
  }
  return path.join(process.cwd(), 'session');
}

export function getIsolatedSessionDir(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  return path.join(process.cwd(), 'temp_sessions', `pair_${clean}`);
}

export function copyCredentialsToShared(sourceDir: string, targetDir: string): boolean {
  try {
    if (!fs.existsSync(sourceDir)) return false;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const files = fs.readdirSync(sourceDir);
    for (const file of files) {
      // Never carry signal session ratchets between directories -- they can
      // be poisoned by the pairing socket. The bot rebuilds them fresh.
      if (file.startsWith('session-')) continue;
      const srcFile = path.join(sourceDir, file);
      const destFile = path.join(targetDir, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile);
      }
    }
    return true;
  } catch (err) {
    console.error('[KUZMIX AUTH] Error copying credentials:', err);
    return false;
  }
}
