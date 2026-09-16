# Kuzmix-MD (WhatsApp Multi-Device Bot & Administration Architecture)

Kuzmix-MD is a WhatsApp Multi-Device modular automation framework featuring an Admin Management Studio, an authentic WhatsApp Multi-Device Pairing Gateway, and a pure Node.js JavaScript Bot Daemon.

---

## 3-Tier Codebase Architecture

```
Kuzmix-MD/
│
├── admin-portal/        # [Workspace 1] Web Admin Studio & Documentation (Next.js / TS)
│   ├── app/             # Dashboard, identity editor, command explorer
│   ├── components/      # Modular UI components (No WhatsApp sockets)
│   └── package.json     # Web dependencies
│
├── pairing-portal/      # [Workspace 2] Authentic WhatsApp Pairing Gateway (Next.js / TS)
│   ├── app/pair/        # Real-time Baileys phone pairing interface
│   ├── app/api/pair/    # Official sock.requestPairingCode() endpoint
│   ├── lib/pairing/     # Isolated connection manager & DisconnectReason decoder
│   └── package.json     # Gateway dependencies (@whiskeysockets/baileys)
│
├── bot/                 # [Workspace 3] Standalone WhatsApp Bot Daemon (Pure Node.js JavaScript)
│   ├── index.js         # Command line runner & direct CLI pairing tool
│   ├── main.js          # Bootstrapper with uncaught error handlers
│   ├── bot.js           # Baileys Multi-Device socket initialization
│   ├── config.js        # Centralized configuration (prefix, owners, sessionDir)
│   ├── commands/        # Pure JavaScript command modules (.pair, .menu, .ping, .alive, .vv)
│   ├── handlers/        # Message pipeline, Command registry, Connection lifecycle
│   ├── database/        # Persistent key-value storage engine
│   └── package.json     # Bot runtime dependencies
│
├── ARCHITECTURE.md      # Detailed 3-tier architectural specification & data flow
├── .env.example         # Template environment variables with KUZMIX_AUTH_DIR
├── .gitignore           # Hardened security rules blocking session credentials
└── render.yaml          # Multi-service Render deployment blueprint
```

---

## Quick Start Guide

### 1. Pairing Portal (Web Linking)
```bash
cd pairing-portal
npm install
npm run dev
```
Open `http://localhost:3000/pair`, enter your phone number with country code, and input the authentic 8-digit code into your phone's WhatsApp (`Settings > Linked Devices > Link with phone number`).

### 2. Standalone Bot Daemon (Execution)
```bash
cd bot
npm install

# Option A: Normal startup (reads existing session)
node index.js

# Option B: Direct CLI pairing without web UI
node index.js pair 2348143186133
```

### 3. Admin Portal (Studio & Customization)
```bash
cd admin-portal
npm install
npm run dev
```

---

## Persistent Storage (`KUZMIX_AUTH_DIR`)

Both the **Pairing Portal** and **Bot** share credentials through the configurable `KUZMIX_AUTH_DIR` environment variable:

- **Local Development:** Default to `./session`
- **Render Cloud Service:** Set `KUZMIX_AUTH_DIR=/var/data/kuzmix-session` backed by a Render Persistent Disk.

---

## Adding Commands to the Bot

Adding a command is as simple as creating a CommonJS file in `bot/commands/<name>.js`:

```javascript
// bot/commands/hello.js
module.exports = {
  name: 'hello',
  aliases: ['hi'],
  category: 'General',
  description: 'Greets the user',
  usage: '.hello',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, senderNumber } = ctx;
    await reply(`Hello @${senderNumber}! Welcome to Kuzmix-MD.`);
  },
};
```
The command is automatically discovered and loaded into memory on bot launch.

---

## Baileys Disconnect Codes Decoded

Kuzmix-MD decodes raw status codes into human-readable diagnostics:
- **`515` (Stream Restart):** Automatic stream renegotiation initiated by Baileys.
- **`401` / `loggedOut`:** Session revoked by user or WhatsApp security. Requires re-pairing.
- **`403` (Forbidden):** WhatsApp account flagged or restricted.
- **`connectionLost` / `timedOut`:** Reconnection backoff triggers automatically.
