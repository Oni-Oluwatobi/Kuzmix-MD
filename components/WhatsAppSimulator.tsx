'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react';
import { BotConfig } from './types';
import {
  CheckCheck,
  Send,
  Sparkles,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Shield,
  Lock,
  Unlock,
  Users,
  MessageSquare,
  UserCheck,
  Radio,
  ArrowRight,
  RotateCcw,
  Trash2,
  Terminal,
  Activity,
  Check,
  Copy,
  ChevronRight,
  Info,
  Layers,
  HelpCircle,
  Film,
  Maximize2,
  Download,
  Image as ImageIcon,
  Ban,
  Reply,
  X,
  Eye,
  EyeOff,
  Music,
  Headphones,
  FileText,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Search,
  Palette,
  Lightbulb,
} from 'lucide-react';
import { soundEngine } from '../lib/audioPlayer';

interface WhatsAppSimulatorProps {
  config: BotConfig;
  customLogoUrl?: string;
}

export interface UserProfile {
  jid: string;
  name: string;
  phone: string;
  color: string;
  avatarColor: string;
}

export const SIMULATED_USERS: UserProfile[] = [
  {
    jid: '2348143186133@s.whatsapp.net',
    name: 'Oni Oluwatobi (User A)',
    phone: '+234 814 318 6133',
    color: 'bg-emerald-600',
    avatarColor: 'from-emerald-500 to-teal-700',
  },
  {
    jid: '2349124846023@s.whatsapp.net',
    name: 'Alex Developer (User B)',
    phone: '+234 912 484 6023',
    color: 'bg-indigo-600',
    avatarColor: 'from-blue-500 to-indigo-700',
  },
];

export interface ChatChannel {
  id: string;
  name: string;
  type: 'group' | 'dm';
  description: string;
  jid: string;
  badge?: string;
}

export const CHANNELS: ChatChannel[] = [
  {
    id: 'group_a',
    name: 'Dev Guild (Group A)',
    type: 'group',
    description: 'Public WhatsApp Group with 120 devs',
    jid: '120363024849284920@g.us',
    badge: '120 members',
  },
  {
    id: 'group_b',
    name: 'Beta Testers (Group B)',
    type: 'group',
    description: 'Secondary testing group',
    jid: '120363098765432100@g.us',
    badge: '45 members',
  },
  {
    id: 'dm',
    name: 'Kuzmix-MD Direct DM',
    type: 'dm',
    description: 'Private 1-on-1 bot chat',
    jid: 'user_private_dm',
    badge: 'Private',
  },
];

function computeSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) + 49281) % 1000000;
}

interface Message {
  id: string;
  sender: 'user' | 'bot' | 'system';
  userJid?: string;
  userName?: string;
  text: string;
  originalText?: string;
  time: string;
  loading?: boolean;
  loadingText?: string;
  mediaType?: 'image' | 'video' | 'audio';
  mediaUrl?: string;
  originalMediaUrl?: string;
  mediaPoster?: string;
  mediaPrompt?: string;
  mediaModel?: string;
  mediaResolution?: string;
  mediaDuration?: string;
  audioTrack?: {
    title: string;
    artist: string;
    durationSeconds: number;
    genre?: string;
    isVoiceNote?: boolean;
    ttsText?: string;
  };
  isDeleted?: boolean;
  isViewOnce?: boolean;
  viewOnceOpened?: boolean;
  quoted?: {
    id: string;
    sender: 'user' | 'bot' | 'system';
    userName?: string;
    text: string;
    mediaType?: 'image' | 'video' | 'audio';
    mediaUrl?: string;
    isViewOnce?: boolean;
  };
  adReply?: {
    title: string;
    body: string;
    source: string;
  };
}

let messageIdSeed = 1000;
function createMsgId(): string {
  messageIdSeed += 1;
  return `msg_${messageIdSeed}`;
}

export function generateSmartAiResponse(query: string, config: BotConfig): string {
  const q = query.toLowerCase().trim();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos';

  // 1. Clock / Time Questions
  if (
    q === 'time' ||
    q === 'time now' ||
    q.includes('what time is it') ||
    q.includes('current time') ||
    q.includes('time right now') ||
    q.includes("what's the time") ||
    q.includes('what is the time') ||
    q.includes('time in lagos')
  ) {
    return `🕒 *Current Local Time:* ${timeStr}\n📅 *Date:* ${dateStr}\n🌐 *Timezone:* ${tz} (GMT+1)\n\n> System clock is synchronized with atomic time servers.`;
  }

  // 2. What is Money / Economics
  if (q.includes('what is money') || q.includes('define money') || q.includes('explain money') || q.includes('concept of money')) {
    return `*Money* is anything widely accepted as a means of exchanging goods and services.

In simple terms, money makes it easier for people to buy and sell things without having to directly trade one item for another (barter system).

*Money generally serves four main purposes:*
• *Medium of exchange* — used to buy and sell things without barter.
• *Store of value* — allows people to save purchasing power for the future.
• *Unit of account* — gives goods and services a common way to be priced.
• *Standard of deferred payment* — can be used to settle debts and transactions later.

*Examples:* Cash, bank deposits, and certain digital forms of money.

💡 *Simple example:* If you have ₦5,000, you can exchange it for food or transportation because everyone agrees that ₦5,000 holds that value.`;
  }

  // 3. What is Baileys
  if (q.includes('what is baileys') || q.includes('baileys socket') || q.includes('whiskeysockets')) {
    return `*Baileys* (\`@whiskeysockets/baileys\`) is a TypeScript/JavaScript library that communicates directly with WhatsApp Web WebSocket servers without requiring a browser or Selenium/Puppeteer.

*Key Advantages:*
• Direct binary WebSocket protocol for ultra-low latency (<50ms).
• Native Multi-Device support (phone can remain completely offline).
• Low RAM footprint (~45MB vs >500MB for Chromium).
• Full end-to-end encryption handling using libsignal-node.`;
  }

  // 4. How to learn Python
  if (q.includes('learn python') || q.includes('how to code python') || q.includes('python roadmap')) {
    return `🐍 *Step-by-Step Python Learning Roadmap:*

1. *Core Fundamentals (Week 1-2):*
   • Variables, Data Types (\`str\`, \`int\`, \`float\`, \`bool\`)
   • Control Flow (\`if/elif/else\`, \`for\` and \`while\` loops)
   • Data Structures (\`lists\`, \`dicts\`, \`sets\`, \`tuples\`)

2. *Functions & Clean Code (Week 3):*
   • Functions, Arguments, Return types, Scope
   • List Comprehensions & Error Handling (\`try/except\`)

3. *Object-Oriented Programming (Week 4):*
   • Classes, Instances, Methods, Inheritance

4. *Practical Projects:*
   • Build a CLI tool, web scraper with \`BeautifulSoup\`, or WhatsApp bot with Baileys!`;
  }

  // 5. Photosynthesis
  if (q.includes('photosynthesis')) {
    return `🌱 *Photosynthesis* is the process by which green plants, algae, and certain bacteria convert light energy (sunlight) into chemical energy (glucose) using water and carbon dioxide.

*Chemical Equation:*
\`6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂\`

*Key Stages:*
1. *Light-dependent reactions:* Chlorophyll absorbs photons and splits water molecules, releasing Oxygen.
2. *Calvin Cycle (Light-independent):* ATP and NADPH fix Carbon Dioxide into glucose sugar for plant nutrition.`;
  }

  // Default intelligent response
  return `*${query.charAt(0).toUpperCase() + query.slice(1)}*

${query} is a multifaceted topic analyzed across multiple practical and conceptual domains.

• *Core Concept:* It functions through structured principles and systematic workflows.
• *Practical Application:* Applying these principles provides clarity, higher efficiency, and reliable outcomes.`;
}

export function WhatsAppSimulator({ config, customLogoUrl }: WhatsAppSimulatorProps) {
  // Active chat view: group_a, group_b, or dm
  const [activeChannelId, setActiveChannelId] = useState<string>('group_a');

  // Active simulated sender: User A or User B
  const [activeUserIndex, setActiveUserIndex] = useState<number>(0);
  const activeUser = SIMULATED_USERS[activeUserIndex];

  // UNKNOWN MODE state per User JID (persisted across groups)
  const [unknownSettings, setUnknownSettings] = useState<Record<string, boolean>>({
    '2348143186133@s.whatsapp.net': false,
    '2349124846023@s.whatsapp.net': false,
  });

  // Recent routing event for telemetry
  const [lastRouteNotice, setLastRouteNotice] = useState<{
    text: string;
    isPrivate: boolean;
    origin: string;
    target: string;
    timestamp: string;
  } | null>(null);

  // Active category in the Command Tray
  const [activeCommandTab, setActiveCommandTab] = useState<'aimedia' | 'music' | 'privacy' | 'ai' | 'media' | 'system'>('aimedia');

  // Currently quoted / replied-to message for commands like .del
  const [quotedMsg, setQuotedMsg] = useState<Message | null>(null);

  // Initial messages
  const initialMessages: Record<string, Message[]> = {
    group_a: [
      {
        id: '1',
        sender: 'user',
        userName: 'Alex Developer (User B)',
        userJid: '2349124846023@s.whatsapp.net',
        text: `${config.prefix}alive`,
        time: '12:40 PM',
      },
      {
        id: '2',
        sender: 'bot',
        text: `╭━━━〔 *${config.botName.toUpperCase()} IS ONLINE* 〕━━━┈⊷\n┃ ◈ *Status:* 🟢 Active & Listening\n┃ ◈ *Maintainer:* ${config.ownerName}\n┃ ◈ *Developer:* ${config.botDeveloper}\n┃ ◈ *Engine:* Baileys MD Core\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`,
        time: '12:40 PM',
      },
      {
        id: '3',
        sender: 'user',
        userName: 'Oni Oluwatobi (User A)',
        userJid: '2348143186133@s.whatsapp.net',
        text: `${config.prefix}imagine cyberpunk lion in neon savannah 8k`,
        time: '12:41 PM',
      },
      {
        id: '4',
        sender: 'bot',
        text: `╭━━━〔 *${config.botName.toUpperCase()} AI IMAGE* 〕━━━┈⊷\n┃ ◈ *Prompt:* cyberpunk lion in neon savannah 8k\n┃ ◈ *Engine:* FLUX.1 (OpenRouter AI)\n┃ ◈ *Resolution:* 1024x1024 HD\n╰━━━━━━━━━━━━━━━━━━━┈⊷\n> © ${config.botName} • ${config.organization}`,
        time: '12:41 PM',
        mediaType: 'image',
        mediaUrl: 'https://image.pollinations.ai/prompt/cyberpunk%20lion%20in%20neon%20savannah%208k%20cinematic%20lighting?width=1024&height=1024&model=flux&seed=49281&nologo=true',
        mediaModel: 'FLUX.1 (OpenRouter)',
      },
      {
        id: 'vo_sample_1',
        sender: 'user',
        userName: 'Alex Developer (User B)',
        userJid: '2349124846023@s.whatsapp.net',
        text: '👁️ View Once Photo',
        time: '12:42 PM',
        isViewOnce: true,
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'audio_sample_1',
        sender: 'bot',
        text: `🎵 *Wizkid - Essence (feat. Tems)*\n> ⚡ 320kbps MP3 Audio\n> ${config.watermark || `© ${config.botName} • ${config.organization}`}`,
        time: '12:43 PM',
        mediaType: 'audio',
        audioTrack: {
          title: 'Wizkid - Essence (feat. Tems)',
          artist: 'Wizkid ft. Tems',
          durationSeconds: 228,
          genre: '320kbps MP3',
        },
      },
    ],
    group_b: [
      {
        id: 'b1',
        sender: 'user',
        userName: 'Beta Moderator',
        userJid: 'moderator@s.whatsapp.net',
        text: `Welcome to Beta Testers channel! Try sending ${config.prefix}ping or ${config.prefix}unknown on.`,
        time: '12:30 PM',
      },
      {
        id: 'vo_sample_video',
        sender: 'user',
        userName: 'Beta Moderator',
        userJid: 'moderator@s.whatsapp.net',
        text: '👁️ View Once Video',
        time: '12:31 PM',
        isViewOnce: true,
        mediaType: 'video',
        mediaUrl: '/videos/flower.mp4',
        mediaPoster: 'https://image.pollinations.ai/prompt/macro%20spring%20flower%20blooming%20cinematic?width=800&height=450&nologo=true',
      },
    ],
    dm: [
      {
        id: 'dm1',
        sender: 'bot',
        text: `👋 Welcome to your private session with *${config.botName}*!\n\nWhen you enable *${config.prefix}unknown on*, any command you trigger in public groups will send its answer directly here in private.\n\nAlso, when you reply to a View Once media in a group with *${config.prefix}vv*, the recovered photo or video will be routed securely right here!`,
        time: '12:00 PM',
      },
      {
        id: 'dm_vo_1',
        sender: 'user',
        userName: 'Contact',
        userJid: 'contact@s.whatsapp.net',
        text: '👁️ View Once Photo',
        time: '12:05 PM',
        isViewOnce: true,
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      },
    ],
  };

  const [channelMessages, setChannelMessages] = useState<Record<string, Message[]>>(initialMessages);
  const [inputVal, setInputVal] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [undoNotice, setUndoNotice] = useState<{ id: string; text: string } | null>(null);

  // Audio Playback & Voice Synthesis States
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [audioElapsed, setAudioElapsed] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(true);

  // Clean up any ongoing Web Audio / Speech synthesis on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopAudio();
    };
  }, []);

  const formatAudioTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayAudio = (msg: Message) => {
    if (!msg.audioTrack) return;

    if (playingTrackId === msg.id) {
      soundEngine.stopAudio();
      setPlayingTrackId(null);
      setAudioElapsed(0);
    } else {
      setPlayingTrackId(msg.id);
      setAudioElapsed(0);

      if (msg.audioTrack.isVoiceNote && msg.audioTrack.ttsText) {
        soundEngine.speakText(msg.audioTrack.ttsText, () => {
          setPlayingTrackId(null);
          setAudioElapsed(0);
        });
      } else {
        soundEngine.playTrack(
          msg.id,
          msg.audioTrack.title,
          msg.mediaUrl,
          msg.audioTrack.durationSeconds || 32,
          (curTime, isDone) => {
            if (isDone) {
              setPlayingTrackId(null);
              setAudioElapsed(0);
            } else {
              setAudioElapsed(curTime);
            }
          }
        );
      }
    }
  };

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeChannel = CHANNELS.find((c) => c.id === activeChannelId) || CHANNELS[0];
  const isUnknownActiveForCurrentUser = Boolean(unknownSettings[activeUser.jid]);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [channelMessages, activeChannelId]);

  const handleClearChat = () => {
    setChannelMessages((prev) => ({
      ...prev,
      [activeChannelId]: [],
    }));
  };

  const handleResetAllChats = () => {
    setChannelMessages(initialMessages);
    setLastRouteNotice(null);
    setQuotedMsg(null);
    setUndoNotice(null);
  };

  const handleToggleUnknownMode = () => {
    const nextState = !isUnknownActiveForCurrentUser;
    sendCommand(`${config.prefix}unknown ${nextState ? 'on' : 'off'}`);
  };

  const handleInjectViewOnce = (type: 'image' | 'video') => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const otherUser = activeUserIndex === 0 ? SIMULATED_USERS[1] : SIMULATED_USERS[0];
    const newMsg: Message = {
      id: createMsgId(),
      sender: 'user',
      userName: otherUser.name,
      userJid: otherUser.jid,
      text: type === 'video' ? '👁️ View Once Video' : '👁️ View Once Photo',
      time: timeNow,
      isViewOnce: true,
      mediaType: type,
      mediaUrl:
        type === 'video'
          ? '/videos/drift.mp4'
          : `https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80`,
      mediaPoster: type === 'video' ? 'https://image.pollinations.ai/prompt/sports%20car%20drifting%20neon%20cinematic?width=800&height=450&nologo=true' : undefined,
    };

    setChannelMessages((prev) => ({
      ...prev,
      [activeChannel.id]: [...(prev[activeChannel.id] || []), newMsg],
    }));
  };

  const startReply = (msg: Message) => {
    setQuotedMsg(msg);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const deleteMessage = (msgId: string) => {
    setChannelMessages((prev) => {
      const msgs = prev[activeChannel.id] || [];
      return {
        ...prev,
        [activeChannel.id]: msgs.map((m) =>
          m.id === msgId
            ? {
                ...m,
                isDeleted: true,
                originalText: m.originalText || m.text,
                originalMediaUrl: m.originalMediaUrl || m.mediaUrl,
                mediaUrl: undefined,
              }
            : m
        ),
      };
    });
    if (quotedMsg?.id === msgId) {
      setQuotedMsg(null);
    }
    setUndoNotice({ id: msgId, text: 'Message deleted for everyone' });
  };

  const restoreMessage = (msgId: string) => {
    setChannelMessages((prev) => {
      const msgs = prev[activeChannel.id] || [];
      return {
        ...prev,
        [activeChannel.id]: msgs.map((m) =>
          m.id === msgId
            ? {
                ...m,
                isDeleted: false,
                text: m.originalText || m.text,
                mediaUrl: m.originalMediaUrl || m.mediaUrl,
              }
            : m
        ),
      };
    });
    setUndoNotice(null);
  };

  const sendCommand = async (cmdStr: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isGroup = activeChannel.type === 'group';
    const isUnknownOn = Boolean(unknownSettings[activeUser.jid]);
    const lower = cmdStr.toLowerCase().trim();
    const p = config.prefix;

    // Snapshot quoted message if replying
    const currentQuoted = quotedMsg;

    // 1. Record User's message in the active chat view with quoted context
    const userMsg: Message = {
      id: createMsgId(),
      sender: 'user',
      userName: activeUser.name,
      userJid: activeUser.jid,
      text: cmdStr,
      time: timeNow,
      quoted: currentQuoted
        ? {
            id: currentQuoted.id,
            sender: currentQuoted.sender,
            userName: currentQuoted.userName,
            text: currentQuoted.text || (currentQuoted.mediaType ? `[${currentQuoted.mediaType.toUpperCase()} file]` : 'Media'),
            mediaType: currentQuoted.mediaType,
            mediaUrl: currentQuoted.mediaUrl || currentQuoted.originalMediaUrl,
            isViewOnce: currentQuoted.isViewOnce,
          }
        : undefined,
    };

    setChannelMessages((prev) => ({
      ...prev,
      [activeChannel.id]: [...(prev[activeChannel.id] || []), userMsg],
    }));

    // Reset quoted message state after submitting
    setQuotedMsg(null);

    // 2. Handle .vv (View Once Opener) command directly
    const isVvCommand =
      lower === `${p}vv` ||
      lower.startsWith(`${p}vv `) ||
      lower === `${p}viewonce` ||
      lower.startsWith(`${p}viewonce `) ||
      lower === `${p}openvo` ||
      lower.startsWith(`${p}openvo `) ||
      lower === `${p}antiviewonce` ||
      lower.startsWith(`${p}antiviewonce `);

    if (isVvCommand) {
      if (!currentQuoted) {
        // [1] Validation: Used without replying to anything
        const invalidNoQuotedCard =
          `╭━━━〔 ${config.botName.toUpperCase()} 〕━━━┈⊷\n` +
          '👁️ *VIEW ONCE OPENER*\n\n' +
          `Reply to a View Once image or\nvideo with *${config.prefix}vv* to open it.\n` +
          '╰━━━━━━━━━━━━━━━━━━━┈⊷';

        const botReply: Message = {
          id: createMsgId(),
          sender: 'bot',
          text: invalidNoQuotedCard,
          time: timeNow,
        };

        setChannelMessages((prev) => ({
          ...prev,
          [activeChannel.id]: [...(prev[activeChannel.id] || []), botReply],
        }));

        setLastRouteNotice({
          text: `⚠️ .vv used without replying to View Once media.`,
          isPrivate: false,
          origin: activeChannel.name,
          target: activeChannel.name,
          timestamp: timeNow,
        });
        return;
      }

      if (!currentQuoted.isViewOnce) {
        // [2] Validation: Replied message is not View Once
        const invalidNotVoCard =
          `╭━━━〔 ${config.botName.toUpperCase()} 〕━━━┈⊷\n` +
          '⚠️ *INVALID MEDIA*\n\n' +
          'The replied message is not a\nView Once image or video.\n' +
          '╰━━━━━━━━━━━━━━━━━━━┈⊷';

        const botReply: Message = {
          id: createMsgId(),
          sender: 'bot',
          text: invalidNotVoCard,
          time: timeNow,
        };

        setChannelMessages((prev) => ({
          ...prev,
          [activeChannel.id]: [...(prev[activeChannel.id] || []), botReply],
        }));

        setLastRouteNotice({
          text: `⚠️ Quoted message is not View Once media.`,
          isPrivate: false,
          origin: activeChannel.name,
          target: activeChannel.name,
          timestamp: timeNow,
        });
        return;
      }

      // [3] Success: Recover View Once media
      const recoveredMediaType = currentQuoted.mediaType || 'image';
      const recoveredMediaUrl =
        currentQuoted.mediaUrl ||
        currentQuoted.originalMediaUrl ||
        (recoveredMediaType === 'video'
          ? '/videos/flower.mp4'
          : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');

      const captionText = `👁️ *VIEW ONCE RECOVERED*\n\n> © ${config.botName} • Baileys View Once Opener`;

      const botRecoveredMsg: Message = {
        id: createMsgId(),
        sender: 'bot',
        text: captionText,
        time: timeNow,
        mediaType: recoveredMediaType,
        mediaUrl: recoveredMediaUrl,
        mediaPoster: currentQuoted.mediaPoster,
      };

      if (isGroup) {
        // Group behavior: Send recovered media privately to user's DM
        setChannelMessages((prev) => ({
          ...prev,
          dm: [...(prev.dm || []), botRecoveredMsg],
        }));

        setLastRouteNotice({
          text: `👁️ View Once ${recoveredMediaType} recovered and delivered privately to ${activeUser.name}'s DM (Group kept clean).`,
          isPrivate: true,
          origin: activeChannel.name,
          target: 'Kuzmix-MD Direct DM',
          timestamp: timeNow,
        });
      } else {
        // DM behavior: Send recovered media directly in DM
        setChannelMessages((prev) => ({
          ...prev,
          dm: [...(prev.dm || []), botRecoveredMsg],
        }));

        setLastRouteNotice({
          text: `👁️ View Once ${recoveredMediaType} opened into normal media.`,
          isPrivate: false,
          origin: 'Direct DM',
          target: 'Direct DM',
          timestamp: timeNow,
        });
      }
      return;
    }

    // 2. Handle .unknown command directly
    if (lower.startsWith(`${p}unknown`) || lower === 'unknown') {
      const modeArg = lower.replace(new RegExp(`^\\${p}unknown\\s*`, 'i'), '').trim();

      // [A] .unknown on
      if (modeArg === 'on' || modeArg === 'enable' || modeArg === '1') {
        setUnknownSettings((prev) => ({ ...prev, [activeUser.jid]: true }));

        const confirmText = `╭━━━〔 *${config.botName.toUpperCase()}* 〕━━━┈⊷\n🔒 *UNKNOWN MODE ACTIVATED*\n\n*Status:* ENABLED for ${activeUser.name}\n*Recipient:* Private DM Only\n\nAll commands triggered by you in public groups will now respond silently here.\n╰━━━━━━━━━━━━━━━━━━━┈⊷`;
        const botDmMsg: Message = {
          id: createMsgId(),
          sender: 'bot',
          text: confirmText,
          time: timeNow,
        };

        // Deliver confirmation directly to Private DM
        setChannelMessages((prev) => ({
          ...prev,
          dm: [...(prev.dm || []), botDmMsg],
        }));

        setLastRouteNotice({
          text: `Unknown Mode ENABLED for ${activeUser.name}. Confirmation sent to Private DM.`,
          isPrivate: true,
          origin: activeChannel.name,
          target: 'Kuzmix-MD Direct DM',
          timestamp: timeNow,
        });
        return;
      }

      // [B] .unknown off
      if (modeArg === 'off' || modeArg === 'disable' || modeArg === '0') {
        setUnknownSettings((prev) => ({ ...prev, [activeUser.jid]: false }));

        const disabledCard = `╭━━━〔 *${config.botName.toUpperCase()}* 〕━━━┈⊷\n🔓 *UNKNOWN MODE DISABLED*\n\n*Status:* PUBLIC MODE RESTORED\n\nCommands triggered in groups will now reply publicly in the group.\n╰━━━━━━━━━━━━━━━━━━━┈⊷`;

        const botMsg: Message = {
          id: createMsgId(),
          sender: 'bot',
          text: disabledCard,
          time: timeNow,
        };

        // Response delivered to current chat
        setChannelMessages((prev) => ({
          ...prev,
          [activeChannel.id]: [...(prev[activeChannel.id] || []), botMsg],
        }));

        setLastRouteNotice({
          text: `Unknown Mode DISABLED for ${activeUser.name}. Replies restored to active chat.`,
          isPrivate: false,
          origin: activeChannel.name,
          target: activeChannel.name,
          timestamp: timeNow,
        });
        return;
      }

      // [C] .unknown (Status Query)
      const isEnabled = isUnknownOn;
      const statusCard = isEnabled
        ? `╭━━━〔 *${config.botName.toUpperCase()}* 〕━━━┈⊷\n🔒 *UNKNOWN MODE*\n\n*Status:* ENABLED\n*Target:* Private DM\n\nAll responses triggered by you in groups are delivered silently to your DM.\n╰━━━━━━━━━━━━━━━━━━━┈⊷`
        : `╭━━━〔 *${config.botName.toUpperCase()}* 〕━━━┈⊷\n🔓 *UNKNOWN MODE*\n\n*Status:* DISABLED\n*Target:* Active Chat\n\nUse *${config.prefix}unknown on* to route group replies privately.\n╰━━━━━━━━━━━━━━━━━━━┈⊷`;

      const botMsg: Message = {
        id: createMsgId(),
        sender: 'bot',
        text: statusCard,
        time: timeNow,
      };

      const targetChannel = (isGroup && isEnabled) ? 'dm' : activeChannel.id;
      setChannelMessages((prev) => ({
        ...prev,
        [targetChannel]: [...(prev[targetChannel] || []), botMsg],
      }));

      setLastRouteNotice({
        text: `Status check: Unknown Mode is ${isEnabled ? 'ENABLED (Routing to DM)' : 'DISABLED (Public)'}.`,
        isPrivate: isEnabled && isGroup,
        origin: activeChannel.name,
        target: targetChannel === 'dm' ? 'Kuzmix-MD Direct DM' : activeChannel.name,
        timestamp: timeNow,
      });
      return;
    }

    // 3. Centralized Response Routing Destination
    const targetChannelId = (isGroup && isUnknownOn) ? 'dm' : activeChannel.id;

    // Check for Text to Image commands (OpenRouter FLUX.1)
    const isImageQuery =
      lower.startsWith(`${p}imagine`) ||
      lower.startsWith(`${p}image`) ||
      lower.startsWith(`${p}txt2img`) ||
      lower.startsWith(`${p}flux`) ||
      lower.startsWith(`${p}draw`) ||
      lower.startsWith(`${p}photoreal`) ||
      lower.startsWith(`${p}anime`) ||
      lower.startsWith(`${p}aiimg`) ||
      lower.startsWith(`${p}dalle`);

    // Check for Video Cluster Status (.vidstatus)
    const isVidStatus =
      lower === `${p}vidstatus` ||
      lower.startsWith(`${p}vidstatus`) ||
      lower === `${p}videostatus` ||
      lower === `${p}renderstatus` ||
      lower === `${p}gpuqueue`;

    if (isVidStatus) {
      const hud =
        `╭━━━〔 *🎬 ${config.botName.toUpperCase()} VIDEO CLUSTER HUD* 〕━━━┈⊷\n` +
        `┃ ◈ *Engine:* Wan2.1 + Veo-2 Neural Array\n` +
        `┃ ◈ *Status:* 🟢 Online & Processing Ready\n` +
        `┃ ◈ *Cluster Nodes:* 8x NVIDIA H100 SXM5\n` +
        `┃ ◈ *Queue Load:* 0 jobs in queue (Ready)\n` +
        `┃ ◈ *Render Speed:* 60 FPS @ 1080p HD\n` +
        `┃ ◈ *Average Latency:* 2.4s per 5s clip\n` +
        `┃ ◈ *Memory Bandwidth:* 3.35 TB/s\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n` +
        `> ${config.watermark || `© ${config.botName} • ${config.organization}`}`;

      const botMsgId = createMsgId();
      const statusMsg: Message = {
        id: botMsgId,
        sender: 'bot',
        text: hud,
        time: timeNow,
      };

      setChannelMessages((prev) => ({
        ...prev,
        [targetChannelId]: [...(prev[targetChannelId] || []), statusMsg],
      }));
      return;
    }

    // Check for Video Styles Catalog (.vidstyle)
    const isVidStyle =
      lower.startsWith(`${p}vidstyle`) ||
      lower.startsWith(`${p}videostyle`) ||
      lower.startsWith(`${p}vstyle`);

    if (isVidStyle) {
      let chosenStyle = cmdStr.trim();
      if (chosenStyle.startsWith(config.prefix)) {
        chosenStyle = chosenStyle.substring(config.prefix.length).trim();
      }
      chosenStyle = chosenStyle.replace(/^(vidstyle|videostyle|vstyle)\s*/i, '').trim().toLowerCase();

      let styleResponse = '';
      if (!chosenStyle || chosenStyle === 'list') {
        styleResponse =
          `╭━━━〔 *🎨 CINEMATIC VIDEO STYLES* 〕━━━┈⊷\n` +
          `┃ ◈ 1. *cinematic* — 4K Panavision, 24fps film grain, shallow depth\n` +
          `┃ ◈ 2. *drone* — Dynamic high-speed FPV aerial orbit & dive\n` +
          `┃ ◈ 3. *cyberpunk* — Neon-soaked rainy streets, cyan/magenta flares\n` +
          `┃ ◈ 4. *nature* — Hyperrealistic 8K wildlife, golden hour rays\n` +
          `┃ ◈ 5. *anime* — Shonen 60fps dynamic combat & cel shading\n` +
          `┃ ◈ 6. *slowmo* — 120fps fluid physics, water & particle dynamics\n` +
          `┃ ◈ 7. *vintage* — 35mm Kodak Portra film grain & warm grading\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n` +
          `> 💡 *Usage:* ${config.prefix}genvideo <prompt> --style <name>\n` +
          `> *Example:* ${config.prefix}genvideo sports car drifting --style cyberpunk\n` +
          `> ${config.watermark || `© ${config.botName} • ${config.organization}`}`;
      } else {
        const styleMap: Record<string, { title: string; camera: string; lighting: string; fps: string; example: string }> = {
          cinematic: {
            title: 'Cinematic 4K Master',
            camera: '35mm Panavision anamorphic lens, slow smooth tracking',
            lighting: 'Volumetric cinematic rim lighting with soft bokeh',
            fps: '24fps Panavision Motion Blur',
            example: `${config.prefix}genvideo detective walking through rainy alleyway --style cinematic`,
          },
          drone: {
            title: 'Drone FPV Dynamic Orbit',
            camera: 'High-speed FPV drone sweeping fly-through, banking turn',
            lighting: 'High dynamic range daylight, sun flare',
            fps: '60fps High Velocity Motion',
            example: `${config.prefix}genvideo golden eagle soaring over snowy mountain peaks --style drone`,
          },
          cyberpunk: {
            title: 'Cyberpunk Neon Matrix',
            camera: 'Low angle street-level tracking, 50mm anamorphic',
            lighting: 'Neon cyan & magenta specular reflections, wet asphalt',
            fps: '60fps Fluid Motion',
            example: `${config.prefix}genvideo futuristic supercar speeding down neo Tokyo street --style cyberpunk`,
          },
          nature: {
            title: 'Hyperrealistic Nature 8K',
            camera: 'Macro telephoto tracking, shallow depth of field',
            lighting: 'Golden hour atmospheric sunlight rays, morning mist',
            fps: '60fps Ultra Clarity',
            example: `${config.prefix}genvideo blooming lotus flower opening in tranquil pond --style nature`,
          },
          anime: {
            title: 'Anime Shonen 60fps Action',
            camera: 'High dynamic perspective warp, fast action cuts',
            lighting: 'Vibrant energy aura, sharp cel-shaded highlights',
            fps: '60fps Animation',
            example: `${config.prefix}genvideo warrior wielding electric blade on rooftop --style anime`,
          },
          slowmo: {
            title: 'Slow-Motion Fluid Dynamics',
            camera: 'Ultra high-speed phantom camera tracking',
            lighting: 'High-speed strobe lighting, crystal clear refraction',
            fps: '120fps Super Slow-Mo',
            example: `${config.prefix}genvideo water droplet splashing into calm indigo pool --style slowmo`,
          },
          vintage: {
            title: 'Vintage 35mm Retro Film',
            camera: 'Classic 1970s handheld motion, gentle zoom',
            lighting: 'Warm Kodak Portra 400 tones, subtle light leaks',
            fps: '24fps Film Grain',
            example: `${config.prefix}genvideo convertible cruising along coastal highway at sunset --style vintage`,
          },
        };

        const matched = styleMap[chosenStyle] || {
          title: `${chosenStyle.toUpperCase()} Style Preset`,
          camera: 'Cinematic camera tracking, high visual fidelity',
          lighting: 'Atmospheric volumetric lighting',
          fps: '60fps Smooth Motion',
          example: `${config.prefix}genvideo ${chosenStyle} scene with dynamic motion`,
        };

        styleResponse =
          `╭━━━〔 *🎨 VIDEO STYLE: ${matched.title.toUpperCase()}* 〕━━━┈⊷\n` +
          `┃ ◈ *Camera Movement:* ${matched.camera}\n` +
          `┃ ◈ *Lighting & Look:* ${matched.lighting}\n` +
          `┃ ◈ *Framerate:* ${matched.fps}\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n` +
          `> ⚡ *Run this command:*\n` +
          `> *${matched.example}*\n` +
          `> ${config.watermark || `© ${config.botName} • ${config.organization}`}`;
      }

      const botMsgId = createMsgId();
      const styleMsg: Message = {
        id: botMsgId,
        sender: 'bot',
        text: styleResponse,
        time: timeNow,
      };

      setChannelMessages((prev) => ({
        ...prev,
        [targetChannelId]: [...(prev[targetChannelId] || []), styleMsg],
      }));
      return;
    }

    // Check for Video Prompt Enhancer (.vidprompt)
    const isVidPrompt =
      lower.startsWith(`${p}vidprompt`) ||
      lower.startsWith(`${p}enhancevid`) ||
      lower.startsWith(`${p}promptvid`) ||
      lower.startsWith(`${p}cinemaprompt`);

    if (isVidPrompt) {
      let rawIdea = cmdStr.trim();
      if (rawIdea.startsWith(config.prefix)) {
        rawIdea = rawIdea.substring(config.prefix.length).trim();
      }
      rawIdea = rawIdea.replace(/^(vidprompt|enhancevid|promptvid|cinemaprompt)\s*/i, '').trim();
      if (!rawIdea) rawIdea = 'sports car drifting in neon rain';

      const botMsgId = createMsgId();
      const tempLoadingMsg: Message = {
        id: botMsgId,
        sender: 'bot',
        text: '💡 *Engineering cinematic video prompt with director camera specs...*',
        time: timeNow,
        loading: true,
        loadingText: 'Engineering director camera prompt...',
      };

      setChannelMessages((prev) => ({
        ...prev,
        [targetChannelId]: [...(prev[targetChannelId] || []), tempLoadingMsg],
      }));
      setIsAiLoading(true);

      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `You are an award-winning cinematic director and prompt engineer for AI video generation (Wan2.1, Veo 2).
Enhance this basic video concept: "${rawIdea}".
Generate a single, vivid 40-word prompt describing camera movement, lens, dramatic lighting, framerate, and motion physics.
OUTPUT ONLY THE FINAL EXPANDED PROMPT STRING.`,
            botName: config.botName,
          }),
        });

        let enhancedPrompt = '';
        if (res.ok) {
          const data = await res.json();
          enhancedPrompt = data.text?.replace(/^["']|["']$/g, '').trim() || `${rawIdea}, cinematic camera tracking shot, 4k 60fps, volumetric lighting, hyperrealistic fluid motion`;
        } else {
          enhancedPrompt = `${rawIdea}, cinematic camera tracking shot, 4k 60fps, volumetric lighting, hyperrealistic fluid motion`;
        }

        const promptCard =
          `╭━━━〔 *🎬 CINEMATIC PROMPT DIRECTOR* 〕━━━┈⊷\n` +
          `┃ ◈ *Original Concept:* "${rawIdea}"\n` +
          `┃\n` +
          `┃ ◈ *Enhanced Motion Prompt:*\n` +
          `┃ "${enhancedPrompt}"\n` +
          `┃\n` +
          `┃ ◈ *Director Breakdown:*\n` +
          `┃ • *Camera:* Smooth orbital tracking, Panavision anamorphic\n` +
          `┃ • *Lighting:* Volumetric rim light, soft specular reflections\n` +
          `┃ • *Motion:* 1080p 60fps high dynamic range fluid physics\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n` +
          `> ⚡ *Run this command now:*\n` +
          `> *${config.prefix}genvideo ${enhancedPrompt}*\n` +
          `> ${config.watermark || `© ${config.botName} • ${config.organization}`}`;

        setChannelMessages((prev) => ({
          ...prev,
          [targetChannelId]: (prev[targetChannelId] || []).map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: promptCard,
                  loading: false,
                }
              : m
          ),
        }));
      } catch {
        const enhancedPrompt = `${rawIdea}, cinematic 35mm anamorphic tracking shot, volumetric golden hour rim lighting, 1080p 60fps, fluid motion physics`;
        const promptCard =
          `╭━━━〔 *🎬 CINEMATIC PROMPT DIRECTOR* 〕━━━┈⊷\n` +
          `┃ ◈ *Original Concept:* "${rawIdea}"\n` +
          `┃\n` +
          `┃ ◈ *Enhanced Motion Prompt:*\n` +
          `┃ "${enhancedPrompt}"\n` +
          `┃\n` +
          `┃ ◈ *Director Breakdown:*\n` +
          `┃ • *Camera:* Smooth orbital tracking, Panavision anamorphic\n` +
          `┃ • *Lighting:* Volumetric rim light, soft specular reflections\n` +
          `┃ • *Motion:* 1080p 60fps high dynamic range fluid physics\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n` +
          `> ⚡ *Run this command now:*\n` +
          `> *${config.prefix}genvideo ${enhancedPrompt}*\n` +
          `> ${config.watermark || `© ${config.botName} • ${config.organization}`}`;

        setChannelMessages((prev) => ({
          ...prev,
          [targetChannelId]: (prev[targetChannelId] || []).map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: promptCard,
                  loading: false,
                }
              : m
          ),
        }));
      } finally {
        setIsAiLoading(false);
      }
      return;
    }

    // Check for Animate / Image-to-Video (.animate, .img2vid, .i2v)
    const isAnimateQuery =
      lower.startsWith(`${p}animate`) ||
      lower.startsWith(`${p}img2vid`) ||
      lower.startsWith(`${p}i2v`) ||
      lower.startsWith(`${p}animateimg`);

    // Check for Text to Video commands (OpenRouter Wan2.1 / Veo-2)
    const isVideoQuery =
      lower.startsWith(`${p}genvideo`) ||
      lower.startsWith(`${p}vid `) ||
      lower === `${p}vid` ||
      lower.startsWith(`${p}videoai`) ||
      lower.startsWith(`${p}txt2video`) ||
      lower.startsWith(`${p}t2v`) ||
      lower.startsWith(`${p}cinematic`) ||
      isAnimateQuery;

    if (isImageQuery) {
      let cleanPrompt = cmdStr.trim();
      if (cleanPrompt.startsWith(config.prefix)) {
        cleanPrompt = cleanPrompt.substring(config.prefix.length).trim();
      }
      cleanPrompt = cleanPrompt.replace(/^(imagine|image|txt2img|flux|draw|photoreal|anime|aiimg|dalle)\s*/i, '').trim();
      if (!cleanPrompt) cleanPrompt = 'cyberpunk lion in neon savannah 8k, volumetric lighting';

      const botMsgId = createMsgId();
      const tempLoadingMsg: Message = {
        id: botMsgId,
        sender: 'bot',
        text: '🎨 *Generating image, please wait...*',
        time: timeNow,
        loading: true,
        loadingText: 'Generating HD image...',
      };

      setChannelMessages((prev) => ({
        ...prev,
        [targetChannelId]: [...(prev[targetChannelId] || []), tempLoadingMsg],
      }));
      setIsAiLoading(true);

      try {
        const res = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: cleanPrompt,
            type: 'image',
            botName: config.botName,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const caption = `> © ${config.botName} • ${config.organization}`;

          setChannelMessages((prev) => ({
            ...prev,
            [targetChannelId]: (prev[targetChannelId] || []).map((m) =>
              m.id === botMsgId
                ? {
                    ...m,
                    text: caption,
                    loading: false,
                    mediaType: 'image',
                    mediaUrl: data.url,
                    mediaPrompt: data.enhancedPrompt,
                    mediaModel: data.model,
                  }
                : m
            ),
          }));
        } else {
          throw new Error('Image synthesis failed');
        }
      } catch {
        const seed = computeSeed(cleanPrompt);
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + ', photorealistic masterpiece, 8k UHD, studio lighting, Hasselblad H6D-100c, 85mm lens, sharp focus')}?width=1024&height=1024&model=flux-realism&seed=${seed}&enhance=true&nologo=true`;
        const caption = `🎨 *Model:* FLUX.1-Realism Ultra HD\n⚡ *Engine:* FLUX.1 + Neural Enhancement\n\n> © ${config.botName} • ${config.organization}`;

        setChannelMessages((prev) => ({
          ...prev,
          [targetChannelId]: (prev[targetChannelId] || []).map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: caption,
                  loading: false,
                  mediaType: 'image',
                  mediaUrl: fallbackUrl,
                  mediaModel: 'FLUX.1-Realism Ultra HD',
                }
              : m
          ),
        }));
      } finally {
        setIsAiLoading(false);
      }

      if (isGroup && isUnknownOn) {
        setLastRouteNotice({
          text: `AI Image delivered privately to ${activeUser.name}'s DM (Group kept clean).`,
          isPrivate: true,
          origin: activeChannel.name,
          target: 'Kuzmix-MD Direct DM',
          timestamp: timeNow,
        });
      } else {
        setLastRouteNotice({
          text: `AI Image generated in ${activeChannel.name}.`,
          isPrivate: false,
          origin: activeChannel.name,
          target: activeChannel.name,
          timestamp: timeNow,
        });
      }
      return;
    }

    if (isVideoQuery) {
      let cleanPrompt = cmdStr.trim();
      if (cleanPrompt.startsWith(config.prefix)) {
        cleanPrompt = cleanPrompt.substring(config.prefix.length).trim();
      }
      cleanPrompt = cleanPrompt.replace(/^(genvideo|vid|animate|img2vid|i2v|animateimg|videoai|txt2video|t2v|cinematic|generatevideo)\s*/i, '').trim();
      if (!cleanPrompt) {
        cleanPrompt = isAnimateQuery
          ? 'cinematic drone camera orbiting futuristic city at sunset, 60fps'
          : 'golden eagle soaring over snowy mountain peaks 4k, smooth cinematic drone pan';
      }

      const botMsgId = createMsgId();
      const tempLoadingMsg: Message = {
        id: botMsgId,
        sender: 'bot',
        text: isAnimateQuery ? '✨ *Animating scene into video, please wait...*' : '🎬 *Synthesizing video, please wait...*',
        time: timeNow,
        loading: true,
        loadingText: isAnimateQuery ? 'Simulating neural fluid motion & keyframing...' : 'Rendering 1080p cinematic video clip...',
      };

      setChannelMessages((prev) => ({
        ...prev,
        [targetChannelId]: [...(prev[targetChannelId] || []), tempLoadingMsg],
      }));
      setIsAiLoading(true);

      try {
        const res = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: cleanPrompt,
            type: 'video',
            botName: config.botName,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const caption = `> © ${config.botName} • ${config.organization}`;

          setChannelMessages((prev) => ({
            ...prev,
            [targetChannelId]: (prev[targetChannelId] || []).map((m) =>
              m.id === botMsgId
                ? {
                    ...m,
                    text: caption,
                    loading: false,
                    mediaType: 'video',
                    mediaUrl: data.url,
                    mediaPoster: data.posterUrl,
                    mediaModel: data.model,
                    mediaDuration: data.duration,
                    mediaResolution: data.resolution,
                  }
                : m
            ),
          }));
        } else {
          throw new Error('Video synthesis failed');
        }
      } catch {
        const sampleVideos = [
          '/videos/eagle.mp4',
          '/videos/drift.mp4',
          '/videos/cinematic.mp4',
          '/videos/flower.mp4',
        ];
        const lowerPrompt = cleanPrompt.toLowerCase();
        let fallbackUrl = '/videos/eagle.mp4';
        if (/drift|car|race|drive|vehicle|speed|city|street|night/.test(lowerPrompt)) {
          fallbackUrl = '/videos/drift.mp4';
        } else if (/flower|nature|garden|spring|petal|forest/.test(lowerPrompt)) {
          fallbackUrl = '/videos/flower.mp4';
        } else if (/eagle|bird|mountain|snow|peak|sky|fly|wing/.test(lowerPrompt)) {
          fallbackUrl = '/videos/eagle.mp4';
        } else {
          const seed = computeSeed(cleanPrompt);
          fallbackUrl = sampleVideos[seed % sampleVideos.length];
        }

        const posterUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + ', cinematic video frame, 4k')}?width=1280&height=720&model=flux&seed=${computeSeed(cleanPrompt)}&nologo=true`;

        const caption = `> © ${config.botName} • ${config.organization}`;

        setChannelMessages((prev) => ({
          ...prev,
          [targetChannelId]: (prev[targetChannelId] || []).map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: caption,
                  loading: false,
                  mediaType: 'video',
                  mediaUrl: fallbackUrl,
                  mediaPoster: posterUrl,
                  mediaModel: 'Wan2.1',
                }
              : m
          ),
        }));
      } finally {
        setIsAiLoading(false);
      }

      if (isGroup && isUnknownOn) {
        setLastRouteNotice({
          text: `AI Video delivered privately to ${activeUser.name}'s DM (Group kept clean).`,
          isPrivate: true,
          origin: activeChannel.name,
          target: 'Kuzmix-MD Direct DM',
          timestamp: timeNow,
        });
      } else {
        setLastRouteNotice({
          text: `AI Video generated in ${activeChannel.name}.`,
          isPrivate: false,
          origin: activeChannel.name,
          target: activeChannel.name,
          timestamp: timeNow,
        });
      }
      return;
    }

    // Check for AI questions
    const isAiQuery =
      lower.startsWith(`${p}ai`) ||
      lower.startsWith(`${p}ask`) ||
      lower.startsWith(`${p}chat`) ||
      lower.startsWith(`${p}explain`) ||
      lower.startsWith(`${p}summarize`) ||
      lower.startsWith(`${p}translate`) ||
      lower.startsWith(`${p}gpt`) ||
      lower.startsWith(`${p}gemini`) ||
      lower.startsWith(`${p}kuzmixai`);

    if (isAiQuery) {
      let cleanQuery = cmdStr.trim();
      if (cleanQuery.startsWith(config.prefix)) {
        cleanQuery = cleanQuery.substring(config.prefix.length).trim();
      }
      cleanQuery = cleanQuery.replace(/^(ai|ask|chat|explain|summarize|translate|gpt|gemini|kuzmixai)\s*/i, '').trim();
      if (!cleanQuery) cleanQuery = 'what is money';

      const botMsgId = createMsgId();
      const tempLoadingMsg: Message = {
        id: botMsgId,
        sender: 'bot',
        text: `⏳ *${config.botName} AI is thinking...*`,
        time: timeNow,
        loading: true,
      };

      setChannelMessages((prev) => ({
        ...prev,
        [targetChannelId]: [...(prev[targetChannelId] || []), tempLoadingMsg],
      }));
      setIsAiLoading(true);

      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: cleanQuery,
            botName: config.botName,
            developer: config.botDeveloper,
            organization: config.organization,
          }),
        });

        let answerText = '';
        if (res.ok) {
          const data = await res.json();
          answerText = data.text || generateSmartAiResponse(cleanQuery, config);
        } else {
          answerText = generateSmartAiResponse(cleanQuery, config);
        }

        const formatted = `╭━━━〔 *${config.botName.toUpperCase()} AI* 〕━━━┈⊷\n${answerText}\n╰━━━━━━━━━━━━━━━━━━━┈⊷\n> Powered by ${config.organization}`;

        setChannelMessages((prev) => ({
          ...prev,
          [targetChannelId]: (prev[targetChannelId] || []).map((m) =>
            m.id === botMsgId ? { ...m, text: formatted, loading: false } : m
          ),
        }));
      } catch {
        const fallback = generateSmartAiResponse(cleanQuery, config);
        const formatted = `╭━━━〔 *${config.botName.toUpperCase()} AI* 〕━━━┈⊷\n${fallback}\n╰━━━━━━━━━━━━━━━━━━━┈⊷\n> Powered by ${config.organization}`;
        setChannelMessages((prev) => ({
          ...prev,
          [targetChannelId]: (prev[targetChannelId] || []).map((m) =>
            m.id === botMsgId ? { ...m, text: formatted, loading: false } : m
          ),
        }));
      } finally {
        setIsAiLoading(false);
      }

      if (isGroup && isUnknownOn) {
        setLastRouteNotice({
          text: `AI response routed privately to ${activeUser.name}'s DM (Group kept silent).`,
          isPrivate: true,
          origin: activeChannel.name,
          target: 'Kuzmix-MD Direct DM',
          timestamp: timeNow,
        });
      } else {
        setLastRouteNotice({
          text: `AI response posted to ${activeChannel.name}.`,
          isPrivate: false,
          origin: activeChannel.name,
          target: activeChannel.name,
          timestamp: timeNow,
        });
      }
      return;
    }

    // 4. Standard Commands Execution
    let botResponseText = '';
    let adReplyData: Message['adReply'] | undefined = undefined;
    let attachedAudioTrack: Message['audioTrack'] | undefined = undefined;

    if (lower === `${p}cred` || lower === `${p}credits`) {
      botResponseText = `╭━━━〔 *${config.botName.toUpperCase()} CREDITS* 〕━━━┈⊷\n┃ ◈ *Bot Name:* ${config.botName}\n┃ ◈ *Lead Engineer:* ${config.botDeveloper}\n┃ ◈ *Organization:* ${config.organization}\n┃ ◈ *Maintainer:* ${config.ownerName}\n┃ ◈ *Engine:* Native Baileys Multi-Device Core\n╰━━━━━━━━━━━━━━━━━━┈⊷\n> ${config.watermark || `© ${config.botName} • ${config.organization}`}`;
    } else if (lower === `${p}menu` || lower === `${p}help` || lower === 'menu') {
      botResponseText = `╭━━━〔 *${config.botName.toUpperCase()} MASTER SUITE* 〕━━━┈⊷
┃ ◈ *User:* ${activeUser.name}
┃ ◈ *Bot:* ${config.botName}
┃ ◈ *Dev:* ${config.botDeveloper}
┃ ◈ *Maintainer:* ${config.ownerName}
┃ ◈ *Prefix:* [ ${config.prefix} ]
┃ ◈ *Engine:* Baileys MD v6.6.0
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭───『 ⚙️ *SYSTEM* 』───
│ • ${p}menu • ${p}alive • ${p}ping • ${p}health • ${p}status
╰────────────────────────┈⊷

╭───『 🛡️ *SECURITY & PRIVACY / ADMIN* 』───
│ • ${p}del • ${p}delete • ${p}unknown <on/off> • ${p}antilink • ${p}tagall
╰────────────────────────┈⊷

╭───『 🎵 *MUSIC & AUDIO ENGINE* 』───
│ • ${p}play <title> • ${p}lyrics <title> • ${p}video <title>
│ • ${p}tts <text> • ${p}ringtone <title> • ${p}shazam • ${p}spotify
╰────────────────────────┈⊷

╭───『 🤖 *AI REASONING* 』───
│ • ${p}ai <q> • ${p}ask <q> • ${p}summarize • ${p}code
╰────────────────────────┈⊷

> Powered by ${config.organization} • Engine by ${config.botDeveloper}`;
    } else if (lower.includes('ping') || lower.includes('speed')) {
      botResponseText = `⚡ *PONG!*\n◈ *Latency:* 28.4 ms\n◈ *RAM:* 48.2 MB / 512 MB\n◈ *Destination:* ${targetChannelId === 'dm' ? 'Private DM 🔒' : 'Group Public 🌐'}`;
    } else if (lower.includes('alive')) {
      botResponseText = `╭━━━〔 *${config.botName.toUpperCase()} IS ONLINE* 〕━━━┈⊷\n┃ ◈ *Status:* 🟢 Active & Listening\n┃ ◈ *Maintainer:* ${config.ownerName}\n┃ ◈ *Developer:* ${config.botDeveloper}\n┃ ◈ *Prefix:* [ ${config.prefix} ]\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`;
    } else if (lower.startsWith(`${p}code`)) {
      const q = cmdStr.replace(new RegExp(`^\\${p}code\\s*`, 'i'), '') || 'debounce function';
      botResponseText = `👨‍💻 *${config.botName} Code Studio*\nRequest: "${q}"\n\n\`\`\`javascript\nfunction debounce(fn, ms = 300) {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), ms);\n  };\n}\n\`\`\``;
    } else if (lower.includes('sticker') || lower === `${p}s`) {
      botResponseText = `🎨 *Sticker Generated!*\n◈ *Packname:* ${config.stickerPack}\n◈ *Author:* ${config.stickerAuthor}\n◈ *Format:* WebP 512x512 with Exif metadata`;
    } else if (
      lower.startsWith(`${p}play`) ||
      lower.startsWith(`${p}song`) ||
      lower.startsWith(`${p}music`) ||
      lower.startsWith(`${p}ytmp3`) ||
      lower.startsWith(`${p}audio`)
    ) {
      let songTitle = cmdStr.replace(new RegExp(`^\\${p}(play|song|music|ytmp3|audio)\\s*`, 'i'), '').trim();
      if (!songTitle) songTitle = 'Wizkid - Essence (feat. Tems)';

      const artistMatch = songTitle.includes('-') ? songTitle.split('-')[0].trim() : (songTitle.includes('by') ? songTitle.split('by')[1].trim() : 'Official Artist');
      const trackName = songTitle.includes('-') ? songTitle.split('-')[1].trim() : (songTitle.includes('by') ? songTitle.split('by')[0].trim() : songTitle);

      botResponseText = `🎵 *${trackName}* — ${artistMatch}\n> ⚡ 320kbps MP3 Audio Stream\n> ${config.watermark || `© ${config.botName} • ${config.organization}`}`;

      attachedAudioTrack = {
        title: trackName,
        artist: artistMatch,
        durationSeconds: 228,
        genre: '320kbps MP3',
      };
    } else if (
      lower.startsWith(`${p}lyrics`) ||
      lower.startsWith(`${p}lyric`) ||
      lower.startsWith(`${p}songlyrics`) ||
      lower.startsWith(`${p}words`)
    ) {
      let songQuery = cmdStr.replace(new RegExp(`^\\${p}(lyrics|lyric|songlyrics|words)\\s*`, 'i'), '').trim();
      if (!songQuery) songQuery = 'Essence - Wizkid ft. Tems';

      const isEssence = songQuery.toLowerCase().includes('essence');
      const isCalmDown = songQuery.toLowerCase().includes('calm down');
      const isLonely = songQuery.toLowerCase().includes('lonely') || songQuery.toLowerCase().includes('top');

      let lyricsBody = '';
      if (isEssence) {
        lyricsBody = `[VERSE 1: Wizkid]
Say I wanna leave you in the mornin'
But I need you in the night
Yeah, I find all the love that I'm missin'
When I'm with you, yeah, you make it feel right...

[CHORUS: Tems]
You don't need no other body
You don't need no other body
Only you fit hold my body
Only you fit hold my body

[VERSE 2: Wizkid]
Baby, baby, make we dey
Say my love will never fade away
Girl, anywhere you go I go dey...

[OUTRO]
Yeah, yeah, yeah, only you fit hold my body...`;
      } else if (isCalmDown) {
        lyricsBody = `[INTRO: Rema]
(Vibez)
Another banger

[CHORUS: Rema]
Baby, calm down, calm down
Girl, this your body put my head for shutdown
Oh, no, no, girl, make you calm down...

[VERSE 1: Rema]
I see this fine girl for my party, yeah
She wear yellow, every other girl dey wear green
I say, "Hi", she say, "Hello"
Then we start to dance slow...`;
      } else if (isLonely) {
        lyricsBody = `[CHORUS: Asake]
Lonely at the top, lonely at the top
L'oju won, everything wey I do dem go talk
K'o de ma pe mi l'olofo
Ti o ba r'owo, ma lo farawe o

[VERSE 1: Asake]
Everyday na money grind
Mo ti hustle till the sunrise
Dem say success get price
Now we count the blessings in real life!`;
      } else {
        lyricsBody = `[VERSE 1]
Walking down the city streets under the neon glow,
Listening to the rhythm of the memories we know.
Every single second feels like poetry in time,
Chasing after melodies and making every line rhyme.

[CHORUS]
Sing it out loud from the top of the world,
Let the sound of the future softly unfurl!
No looking back, we're taking the lead,
This is the moment, this is all that we need!

[VERSE 2]
Through the storm and through the rain,
Finding power through the pain.
Every beat brings us alive,
This is how we learn to thrive!

[OUTRO]
Yeah... harmony in the sound,
Watch the galaxies spin round and round!`;
      }

      botResponseText = `╭━━━〔 *📜 ${config.botName.toUpperCase()} LYRICS FINDER* 〕━━━┈⊷
┃ ◈ *Song:* ${songQuery.toUpperCase()}
┃ ◈ *Engine:* Verified Global Lyrics Archive
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

${lyricsBody}

> ${config.watermark || `© ${config.botName} • ${config.organization}`}`;
    } else if (
      lower.startsWith(`${p}video`) ||
      lower.startsWith(`${p}ytmp4`) ||
      lower.startsWith(`${p}ytvideo`)
    ) {
      let videoQuery = cmdStr.replace(new RegExp(`^\\${p}(video|ytmp4|ytvideo)\\s*`, 'i'), '').trim();
      if (!videoQuery) videoQuery = 'Burna Boy - City Boys Official 4K Video';

      botResponseText = `╭━━━〔 *🎥 ${config.botName.toUpperCase()} VIDEO DOWNLOADER* 〕━━━┈⊷
┃ ◈ *Title:* ${videoQuery}
┃ ◈ *Quality:* 1080p Full HD MP4
┃ ◈ *Duration:* 03:42
┃ ◈ *Status:* Video rendered and dispatched
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
> ${config.watermark || `© ${config.botName} • ${config.organization}`}`;
    } else if (lower.startsWith(`${p}spotify`) || lower.startsWith(`${p}spot`)) {
      let spotQuery = cmdStr.replace(new RegExp(`^\\${p}(spotify|spot)\\s*`, 'i'), '').trim();
      if (!spotQuery) spotQuery = 'Rema - Calm Down';

      botResponseText = `╭━━━〔 *🟢 SPOTIFY GLOBAL SEARCH* 〕━━━┈⊷
┃ ◈ *Track:* ${spotQuery}
┃ ◈ *Platform:* Spotify Premium Hi-Fi
┃ ◈ *Popularity:* 94% Global Rank #12
┃ ◈ *Album:* World Sound Edition (2024)
┃ ◈ *Audio Quality:* 320kbps Lossless
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
> ${config.watermark || `© ${config.botName} • ${config.organization}`}`;
    } else if (lower.startsWith(`${p}shazam`) || lower.startsWith(`${p}findsong`) || lower.startsWith(`${p}whatsong`)) {
      botResponseText = `╭━━━〔 *🔍 ${config.botName.toUpperCase()} SHAZAM DETECTOR* 〕━━━┈⊷
┃ ◈ *Identified Song:* Asake - Lonely at the Top
┃ ◈ *Album:* Work of Art (2023)
┃ ◈ *Genre:* Afrobeats / Amapiano
┃ ◈ *Confidence Score:* 99.8% Match
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
> 💡 *Tip:* Use *${config.prefix}play Asake Lonely at the Top* to download the full MP3!`;
    } else if (lower.startsWith(`${p}ringtone`) || lower.startsWith(`${p}sound`)) {
      let toneQuery = cmdStr.replace(new RegExp(`^\\${p}(ringtone|sound)\\s*`, 'i'), '').trim() || 'iPhone Remix';
      botResponseText = `🔔 *${config.botName} Ringtone Engine*\n◈ *Title:* "${toneQuery}"\n◈ *Duration:* 00:30\n◈ *Format:* 320kbps MP3 Ringtone\n◈ *Status:* Tone dispatched to your device!`;
      attachedAudioTrack = {
        title: `${toneQuery} Ringtone`,
        artist: `${config.botName} Audio Engine`,
        durationSeconds: 30,
        genre: 'Mobile Ringtone HD',
      };
    } else if (lower.startsWith(`${p}yts`) || lower.startsWith(`${p}ytsearch`)) {
      let ytsQuery = cmdStr.replace(new RegExp(`^\\${p}(yts|ytsearch)\\s*`, 'i'), '').trim() || 'Afrobeats 2024';
      botResponseText = `╭━━━〔 *🔍 YOUTUBE SEARCH: "${ytsQuery}"* 〕━━━┈⊷
┃ *[1]* ${ytsQuery} - Official Music Video
┃ ◈ *Duration:* 03:45 | *Views:* 28.5M
┃ ◈ *Command:* *${config.prefix}play ${ytsQuery}*
┃
┃ *[2]* ${ytsQuery} (Live Performance 4K)
┃ ◈ *Duration:* 04:12 | *Views:* 6.1M
┃ ◈ *Command:* *${config.prefix}video ${ytsQuery} Live*
┃
┃ *[3]* ${ytsQuery} (Acoustic Version)
┃ ◈ *Duration:* 03:18 | *Views:* 1.9M
┃ ◈ *Command:* *${config.prefix}play ${ytsQuery} Acoustic*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
> Type *${config.prefix}play <title>* to download audio!`;
    } else if (lower.startsWith(`${p}tts`) || lower.startsWith(`${p}say`) || lower.startsWith(`${p}speak`)) {
      let ttsText = cmdStr.replace(new RegExp(`^\\${p}(tts|say|speak)\\s*`, 'i'), '').trim() || `Welcome to ${config.botName}`;
      botResponseText = `🔊 *Voice Note Synthesized!*\n◈ *Voice:* Google Neural HD\n◈ *Text:* "${ttsText}"\n◈ *Format:* WhatsApp PTT Voice Waveform\n\n> © ${config.botName} Voice AI`;
      attachedAudioTrack = {
        title: `Voice Note: "${ttsText.slice(0, 30)}${ttsText.length > 30 ? '...' : ''}"`,
        artist: `${config.botName} Neural Voice`,
        durationSeconds: Math.max(3, Math.ceil(ttsText.split(' ').length * 0.5)),
        isVoiceNote: true,
        ttsText: ttsText,
      };
    } else if (lower.startsWith(`${p}compose`) || lower.startsWith(`${p}songwrite`)) {
      let compTheme = cmdStr.replace(new RegExp(`^\\${p}(compose|songwrite)\\s*`, 'i'), '').trim() || 'futuristic revolution';
      botResponseText = `╭━━━〔 *🎼 ${config.botName.toUpperCase()} STUDIO COMPOSER* 〕━━━┈⊷
┃ ◈ *Theme:* ${compTheme}
┃ ◈ *Style:* Contemporary Anthem
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

[VERSE 1]
Electric skies above the golden bay,
We code the dawn of a brand new day.
A million pulses beating into one,
We run the race that has just begun!

[CHORUS]
Oh, raise the sound, let the speakers roar,
We're opening every locked-up door!
With every line and every harmony,
We're writing modern history!

> © ${config.botName} Studio Suite`;
    } else if (lower.startsWith(`${p}weather`)) {
      let city = cmdStr.replace(new RegExp(`^\\${p}weather\\s*`, 'i'), '').trim() || 'Lagos, Nigeria';
      botResponseText = `╭━━━〔 *🌤️ LIVE WEATHER REPORT* 〕━━━┈⊷
┃ ◈ *Location:* ${city}
┃ ◈ *Temperature:* 29°C (Feels like 33°C)
┃ ◈ *Condition:* Partly Cloudy ⛅
┃ ◈ *Humidity:* 76%
┃ ◈ *Wind Speed:* 14 km/h SW
┃ ◈ *Barometer:* 1012 hPa
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
> © ${config.botName} Live Weather Station`;
    } else if (lower.includes('tagall')) {
      botResponseText = `╭━━━〔 *${config.botName.toUpperCase()} BROADCAST* 〕━━━┈⊷\n⭔ @2348143186133\n⭔ @2349124846023\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`;
    } else if (
      lower === `${p}del` ||
      lower.startsWith(`${p}del `) ||
      lower === `${p}delete` ||
      lower.startsWith(`${p}delete `)
    ) {
      const targetId = currentQuoted?.id;
      let wasDeleted = false;

      setChannelMessages((prev) => {
        const msgs = prev[activeChannel.id] || [];
        if (targetId) {
          return {
            ...prev,
            [activeChannel.id]: msgs.map((m) => {
              if (m.id === targetId) {
                wasDeleted = true;
                return {
                  ...m,
                  isDeleted: true,
                  originalText: m.originalText || m.text,
                  originalMediaUrl: m.originalMediaUrl || m.mediaUrl,
                  mediaUrl: undefined,
                };
              }
              return m;
            }),
          };
        } else {
          // Find the last non-deleted message before the user's .del command
          const copy = [...msgs];
          for (let i = copy.length - 1; i >= 0; i--) {
            if (copy[i].id !== userMsg.id && !copy[i].isDeleted) {
              copy[i] = {
                ...copy[i],
                isDeleted: true,
                originalText: copy[i].originalText || copy[i].text,
                originalMediaUrl: copy[i].originalMediaUrl || copy[i].mediaUrl,
                mediaUrl: undefined,
              };
              wasDeleted = true;
              break;
            }
          }
          return {
            ...prev,
            [activeChannel.id]: copy,
          };
        }
      });

      if (wasDeleted) {
        botResponseText = `🗑️ *Message deleted by Admin.*\n> © ${config.botName} • ${config.organization}`;
      } else {
        botResponseText = `⚠️ *No message to delete!*\n◈ *Usage:* Click the 🗑️ icon on any message, or reply to a message and send \`${p}del\`.`;
      }
    } else if (userMsg.quoted && !cmdStr.startsWith(p)) {
      const quotedAuthor = userMsg.quoted.sender === 'user' ? (userMsg.quoted.userName || 'User') : config.botName;
      botResponseText = `💬 *Reply Received*\n◈ *Replying to:* ${quotedAuthor}\n◈ *Message:* "${cmdStr}"\n\n> © ${config.botName} • ${config.organization}`;
    } else {
      botResponseText = `${config.waitMessage}\n\nCommand received: "${cmdStr}". Type *${config.prefix}menu* or *${config.prefix}unknown* to explore.`;
    }

    const botResponse: Message = {
      id: createMsgId(),
      sender: 'bot',
      text: botResponseText,
      time: timeNow,
      adReply: adReplyData,
      mediaType: attachedAudioTrack ? 'audio' : undefined,
      audioTrack: attachedAudioTrack,
    };

    setChannelMessages((prev) => ({
      ...prev,
      [targetChannelId]: [...(prev[targetChannelId] || []), botResponse],
    }));

    // Play notification chime and auto-play audio track if attached
    if (soundEnabled) {
      soundEngine.playIncomingChime();
      if (attachedAudioTrack && autoPlayAudio) {
        setTimeout(() => {
          togglePlayAudio(botResponse);
        }, 300);
      }
    }

    if (isGroup && isUnknownOn) {
      setLastRouteNotice({
        text: `Command "${cmdStr}" executed. Output routed silently to ${activeUser.name}'s DM.`,
        isPrivate: true,
        origin: activeChannel.name,
        target: 'Kuzmix-MD Direct DM',
        timestamp: timeNow,
      });
    } else {
      setLastRouteNotice({
        text: `Command "${cmdStr}" executed in ${activeChannel.name}.`,
        isPrivate: false,
        origin: activeChannel.name,
        target: activeChannel.name,
        timestamp: timeNow,
      });
    }
  };

  const handleManualSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendCommand(inputVal.trim());
    setInputVal('');
  };

  const currentMessages = channelMessages[activeChannel.id] || [];

  const commandTrayItems = {
    privacy: [
      {
        cmd: `${config.prefix}del`,
        label: 'Delete Message (.del)',
        desc: 'Deletes quoted or previous message for everyone',
        icon: Trash2,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      },
      {
        cmd: `${config.prefix}unknown on`,
        label: 'Enable Unknown Mode',
        desc: 'Routes all group responses silently to DM',
        icon: Lock,
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      },
      {
        cmd: `${config.prefix}unknown off`,
        label: 'Disable Unknown Mode',
        desc: 'Restores public replies in group chat',
        icon: Unlock,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      },
      {
        cmd: `${config.prefix}unknown`,
        label: 'Check Routing Status',
        desc: 'Inquires active routing state for this JID',
        icon: Shield,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      },
    ],
    aimedia: [
      {
        cmd: `${config.prefix}imagine cyberpunk lion in neon savannah 8k`,
        label: 'FLUX.1: Cyberpunk Lion',
        desc: 'Photorealistic 8K text to image generation',
        icon: Sparkles,
        color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
      },
      {
        cmd: `${config.prefix}imagine futuristic glass smartphone with glowing hologram`,
        label: 'FLUX.1: Hologram Device',
        desc: 'Complex cinematic lighting and reflection synthesis',
        icon: ImageIcon,
        color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      },
      {
        cmd: `${config.prefix}genvideo golden eagle soaring over snowy mountain peaks 4k`,
        label: 'Video Gen (.genvideo)',
        desc: 'Cinematic tracking aerial drone video synthesis',
        icon: Film,
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      },
      {
        cmd: `${config.prefix}vid sports car drifting on rainy city night 60fps`,
        label: 'Fast Video (.vid)',
        desc: 'High speed motion cinematic widescreen video',
        icon: Video,
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      },
      {
        cmd: `${config.prefix}animate cherry blossom tree in breeze`,
        label: 'Animate Image/Scene (.animate)',
        desc: 'Transforms still frames to fluid dynamic video',
        icon: Sparkles,
        color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      },
      {
        cmd: `${config.prefix}vidstatus`,
        label: 'Cluster Status (.vidstatus)',
        desc: 'Checks Wan2.1 H100 GPU cluster queue & render metrics',
        icon: Activity,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      },
      {
        cmd: `${config.prefix}vidstyle cyberpunk`,
        label: 'Video Style (.vidstyle)',
        desc: 'Inspects and applies cinematic director presets',
        icon: Palette,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      },
      {
        cmd: `${config.prefix}vidprompt sports car neon city drifting`,
        label: 'Prompt Director (.vidprompt)',
        desc: 'Optimizes video prompts with lighting & camera motion',
        icon: Lightbulb,
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      },
    ],
    ai: [
      {
        cmd: `${config.prefix}ai what is money`,
        label: 'Ask AI: Money & Currency',
        desc: 'Comprehensive economic breakdown',
        icon: Sparkles,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      },
      {
        cmd: `${config.prefix}ai what is photosynthesis`,
        label: 'Ask AI: Photosynthesis',
        desc: 'Scientific chemical equation and stages',
        icon: Sparkles,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      },
      {
        cmd: `${config.prefix}code debounce function`,
        label: 'Code Studio: Debounce',
        desc: 'Generates TypeScript / JS code snippet',
        icon: Terminal,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      },
    ],
    system: [
      {
        cmd: `${config.prefix}ping`,
        label: 'Ping & Latency',
        desc: 'Checks engine response speed and RAM',
        icon: Activity,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      },
      {
        cmd: `${config.prefix}alive`,
        label: 'Alive Status Card',
        desc: 'Verifies uptime, developer & owner info',
        icon: Radio,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      },
      {
        cmd: `${config.prefix}menu`,
        label: 'Master 18-Module Menu',
        desc: 'Displays categorized master command list',
        icon: Layers,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      },
      {
        cmd: `${config.prefix}cred`,
        label: 'Official Credits Card',
        desc: 'System credit and author verification',
        icon: CheckCheck,
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      },
    ],
    music: [
      {
        cmd: `${config.prefix}play Wizkid Essence`,
        label: 'Play Track (.play)',
        desc: 'Downloads & streams 320kbps YouTube/Spotify MP3',
        icon: Music,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      },
      {
        cmd: `${config.prefix}lyrics Essence Wizkid`,
        label: 'Find Lyrics (.lyrics)',
        desc: 'Fetches verified lyrics from Genius & Musixmatch',
        icon: FileText,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      },
      {
        cmd: `${config.prefix}lyrics Calm Down Rema`,
        label: 'Lyrics: Calm Down',
        desc: 'Structured verses and chorus lyrics lookup',
        icon: FileText,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      },
      {
        cmd: `${config.prefix}video Burna Boy City Boys`,
        label: 'Video Downloader (.video)',
        desc: 'Fetches 1080p Full HD video from YouTube',
        icon: Film,
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      },
      {
        cmd: `${config.prefix}spotify Rema Calm Down`,
        label: 'Spotify Search (.spotify)',
        desc: 'Streams track metadata and direct streaming link',
        icon: Headphones,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      },
      {
        cmd: `${config.prefix}shazam`,
        label: 'Identify Music (.shazam)',
        desc: 'Audio track fingerprint identification engine',
        icon: Search,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      },
      {
        cmd: `${config.prefix}compose afrobeat triumph anthem`,
        label: 'Song Composer (.compose)',
        desc: 'Generates studio verses, chorus and chord flow',
        icon: Sparkles,
        color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
      },
      {
        cmd: `${config.prefix}tts Welcome to Kuzmix-MD`,
        label: 'Text to Speech (.tts)',
        desc: 'Neural voice note audio generator',
        icon: Volume2,
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      },
    ],
    media: [
      {
        cmd: `${config.prefix}vv`,
        label: 'Open View Once (.vv)',
        desc: 'Recovers quoted View Once photo/video into normal media',
        icon: Eye,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      },
      {
        cmd: `${config.prefix}sticker`,
        label: 'Generate WebP Sticker',
        desc: 'Converts media with custom Exif packname',
        icon: Sparkles,
        color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      },
      {
        cmd: `${config.prefix}play Wizkid Essence`,
        label: 'Download 320kbps Audio',
        desc: 'Simulates high-definition music streaming',
        icon: Radio,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      },
      {
        cmd: `${config.prefix}tagall`,
        label: 'Group Tagall Broadcast',
        desc: 'Mentions all participants in the group',
        icon: Users,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Strip */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              WhatsApp Live Interaction Simulator
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Dual-Persona Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Test commands, examine Baileys multi-device formatting, and verify private Unknown Mode routing in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
            title="Clear messages in active chat"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Chat</span>
          </button>
          <button
            onClick={handleResetAllChats}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
            title="Reset all channels to default state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Uncrowded Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: WhatsApp Chat Phone / Web Frame (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full bg-[#0b141a] rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[620px]">
            {/* WhatsApp Top Header */}
            <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-slate-700/50 select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-white/20 flex items-center justify-center font-bold text-white text-xs overflow-hidden shadow-inner shrink-0">
                  {activeChannel.type === 'group' ? (
                    <Users className="w-5 h-5 text-white" />
                  ) : customLogoUrl ? (
                    <img src={customLogoUrl} alt="Bot Avatar" className="w-full h-full object-cover" />
                  ) : (
                    config.botName.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-xs leading-none truncate max-w-[180px] sm:max-w-[240px]">
                      {activeChannel.name}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium block truncate mt-0.5">
                    {activeChannel.type === 'group'
                      ? 'Group • 120 participants'
                      : 'online • Baileys Multi-Device Core'}
                  </span>
                </div>
              </div>

              {/* Action icons & Channel Switcher Dropdown */}
              <div className="flex items-center gap-2 text-slate-300">
                <div className="flex items-center gap-1 hidden sm:flex">
                  <button
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      if (!next) {
                        soundEngine.stopAudio();
                        setPlayingTrackId(null);
                      }
                    }}
                    className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono flex items-center gap-1 transition shadow-sm ${
                      soundEnabled
                        ? 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border-cyan-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                    }`}
                    title={soundEnabled ? 'Audio Output Enabled (Click to mute)' : 'Audio Output Muted (Click to enable)'}
                  >
                    {soundEnabled ? <Volume2 className="w-2.5 h-2.5 text-cyan-400" /> : <VolumeX className="w-2.5 h-2.5 text-slate-400" />}
                    <span>{soundEnabled ? 'Audio ON' : 'Muted'}</span>
                  </button>
                  <button
                    onClick={() => handleInjectViewOnce('image')}
                    className="px-2 py-0.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1 transition shadow-sm"
                    title="Simulate receiving a View Once photo to test .vv"
                  >
                    <Eye className="w-2.5 h-2.5" />
                    <span>+ VO Photo</span>
                  </button>
                  <button
                    onClick={() => handleInjectViewOnce('video')}
                    className="px-2 py-0.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1 transition shadow-sm"
                    title="Simulate receiving a View Once video to test .vv"
                  >
                    <Film className="w-2.5 h-2.5" />
                    <span>+ VO Video</span>
                  </button>
                </div>
                {/* Active channel badge */}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                  activeChannel.type === 'dm'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/30'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                }`}>
                  {activeChannel.type === 'dm' ? '🔒 1-on-1 DM' : '👥 Public Group'}
                </span>
              </div>
            </div>

            {/* Active Context Banner inside Chat */}
            {activeChannel.type === 'group' && isUnknownActiveForCurrentUser && (
              <div className="bg-cyan-950/70 border-b border-cyan-500/30 px-3 py-1.5 text-center text-[11px] text-cyan-300 font-mono flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  <strong>Unknown Mode ACTIVE:</strong> Your commands here reply silently in your DM.
                </span>
              </div>
            )}

            {/* Routing Alert Toast (if triggered) */}
            {lastRouteNotice && (
              <div className={`px-3 py-1.5 text-xs flex items-center justify-between gap-2 border-b ${
                lastRouteNotice.isPrivate
                  ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500/30'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700/50'
              }`}>
                <div className="flex items-center gap-1.5 truncate text-[11px]">
                  {lastRouteNotice.isPrivate ? (
                    <Lock className="w-3 h-3 text-cyan-400 shrink-0" />
                  ) : (
                    <Info className="w-3 h-3 text-blue-400 shrink-0" />
                  )}
                  <span className="truncate">{lastRouteNotice.text}</span>
                </div>
                {lastRouteNotice.isPrivate && activeChannelId !== 'dm' && (
                  <button
                    onClick={() => setActiveChannelId('dm')}
                    className="px-2 py-0.5 rounded bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-200 text-[10px] font-semibold transition shrink-0 flex items-center gap-1"
                  >
                    Open DM <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            )}

            {/* WhatsApp Chat Area */}
            <div
              ref={chatScrollRef}
              className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#0b141a] bg-opacity-95"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)',
                backgroundSize: '16px 16px',
              }}
            >
              {currentMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 opacity-40 text-slate-400" />
                  <p className="text-xs text-slate-400 font-medium">No messages in this chat yet</p>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Type a command below or click a sample trigger from the right panel to test.
                  </p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl p-2.5 sm:p-3 text-xs shadow-md space-y-1.5 ${
                          isUser
                            ? 'bg-[#005c4b] text-white rounded-tr-none'
                            : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-white/5'
                        }`}
                      >
                        {/* Sender Name in Group */}
                        {isUser && activeChannel.type === 'group' && (
                          <div className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1 border-b border-emerald-700/50 pb-0.5">
                            <span>{msg.userName || activeUser.name}</span>
                            {unknownSettings[msg.userJid || activeUser.jid] && (
                              <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1 rounded font-mono">
                                [UNKNOWN ON]
                              </span>
                            )}
                          </div>
                        )}

                        {/* Rich ExternalAdReply Preview Card */}
                        {msg.adReply && (
                          <div className="bg-[#111b21] rounded-xl overflow-hidden border border-white/10 mb-2">
                            <div className="h-20 bg-gradient-to-br from-blue-900 via-indigo-950 to-black relative flex items-center justify-center p-2 text-center overflow-hidden">
                              {customLogoUrl ? (
                                <img
                                  src={customLogoUrl}
                                  alt="Preview"
                                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                                />
                              ) : (
                                <div className="text-white font-extrabold text-xs tracking-wider opacity-90 drop-shadow">
                                  🌌 {config.botName.toUpperCase()}
                                </div>
                              )}
                              <span className="absolute bottom-1 right-2 text-[8px] bg-black/60 px-1 py-0.5 rounded text-slate-300 backdrop-blur-md font-mono">
                                WhatsApp Bot
                              </span>
                            </div>
                            <div className="p-2 space-y-0.5 bg-[#182229]">
                              <p className="text-[11px] font-bold text-white truncate">{msg.adReply.title}</p>
                              <p className="text-[10px] text-slate-400 truncate">{msg.adReply.body}</p>
                              <p className="text-[9px] text-blue-400 font-mono truncate">{msg.adReply.source}</p>
                            </div>
                          </div>
                        )}

                        {/* WhatsApp View Once Message Bubble */}
                        {msg.isViewOnce && !msg.loading && (
                          <div className="rounded-xl overflow-hidden bg-[#111b21] border border-emerald-500/30 p-2.5 mb-1.5 space-y-2 select-none shadow-sm">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center text-emerald-400 bg-emerald-500/10 font-bold text-xs shrink-0">
                                1
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
                                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{msg.mediaType === 'video' ? 'View Once Video' : 'View Once Photo'}</span>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                  {msg.mediaType === 'video' ? 'Protected Video Message' : 'Protected Image Message'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/5">
                              <span className="text-[9px] font-mono text-cyan-400">
                                Reply with {config.prefix}vv
                              </span>
                              <button
                                onClick={() => {
                                  setQuotedMsg(msg);
                                  sendCommand(`${config.prefix}vv`);
                                }}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-medium transition flex items-center gap-1 shadow-sm"
                                title="Reply with .vv to unlock"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Open with .vv</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Image Media Card */}
                        {msg.mediaType === 'image' && msg.mediaUrl && !msg.loading && !msg.isViewOnce && (
                          <div className="rounded-xl overflow-hidden bg-black/50 border border-white/10 mb-2 group relative">
                            <img
                              src={msg.mediaUrl}
                              alt={msg.mediaPrompt || 'AI Generated Image'}
                              className="w-full h-auto max-h-60 object-cover cursor-pointer hover:opacity-95 transition"
                              onClick={() => window.open(msg.mediaUrl, '_blank')}
                            />
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/30 backdrop-blur-md flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                FLUX.1 HD
                              </span>
                            </div>
                            <div className="absolute bottom-2 right-2 flex items-center gap-1">
                              <a
                                href={msg.mediaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded-md bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition flex items-center gap-1 text-[9px] font-mono px-1.5"
                                title="Open full resolution"
                              >
                                <Maximize2 className="w-2.5 h-2.5" />
                                <span>HD View</span>
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Video Media Card */}
                        {msg.mediaType === 'video' && msg.mediaUrl && !msg.loading && !msg.isViewOnce && (
                          <div className="rounded-xl overflow-hidden bg-black border border-white/10 mb-2 group relative">
                            <video
                              autoPlay
                              muted
                              loop
                              controls
                              playsInline
                              preload="auto"
                              poster={msg.mediaPoster}
                              className="w-full max-h-60 rounded-t-xl bg-black block"
                              key={msg.mediaUrl}
                              onLoadedMetadata={(e) => {
                                e.currentTarget.muted = true;
                                e.currentTarget.play().catch(() => {});
                              }}
                            >
                              <source src={msg.mediaUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                            <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#182229] text-[10px]">
                              <span className="font-semibold text-purple-300 flex items-center gap-1">
                                <Film className="w-3 h-3 text-purple-400" />
                                Wan2.1 HD
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-slate-400">
                                  {msg.mediaResolution || '1080p'} • {msg.mediaDuration || '0:05'}
                                </span>
                                <a
                                  href={msg.mediaUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-1.5 py-0.5 rounded bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white transition flex items-center gap-1 text-[9px] font-mono"
                                  title="Open in new tab / Fullscreen"
                                >
                                  <Maximize2 className="w-2.5 h-2.5" />
                                  <span>Fullscreen</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* WhatsApp Native Audio Player Card */}
                        {msg.audioTrack && !msg.loading && (
                          <div className="rounded-xl overflow-hidden bg-black/40 border border-white/10 p-2.5 mb-2 shadow-sm">
                            <div className="flex items-center gap-3">
                              {/* Circular Play / Pause button */}
                              <button
                                onClick={() => togglePlayAudio(msg)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition shrink-0 shadow-md ${
                                  playingTrackId === msg.id
                                    ? 'bg-emerald-500 text-slate-950 scale-105 ring-2 ring-emerald-400/50'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                                title={playingTrackId === msg.id ? 'Pause Audio' : 'Play Audio'}
                              >
                                {playingTrackId === msg.id ? (
                                  <Pause className="w-4 h-4 fill-current" />
                                ) : (
                                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                                )}
                              </button>

                              {/* Track Info & Animated Waveform Bars */}
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-semibold text-slate-200 truncate">
                                    {msg.audioTrack.title}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                    {playingTrackId === msg.id
                                      ? `${formatAudioTime(audioElapsed)} / ${formatAudioTime(msg.audioTrack.durationSeconds)}`
                                      : formatAudioTime(msg.audioTrack.durationSeconds)}
                                  </span>
                                </div>

                                {/* Dynamic Visualizer Waveform */}
                                <div className="flex items-center gap-1 h-3.5 cursor-pointer" onClick={() => togglePlayAudio(msg)}>
                                  {Array.from({ length: 26 }).map((_, i) => {
                                    const isPlaying = playingTrackId === msg.id;
                                    const progressPercent = (audioElapsed / (msg.audioTrack?.durationSeconds || 1)) * 100;
                                    const barPercent = (i / 26) * 100;
                                    const isPassed = barPercent <= progressPercent;

                                    return (
                                      <span
                                        key={i}
                                        className={`flex-1 rounded-full transition-all duration-150 ${
                                          isPlaying
                                            ? isPassed
                                              ? 'bg-emerald-400'
                                              : 'bg-slate-600'
                                            : isPassed
                                            ? 'bg-emerald-500'
                                            : 'bg-slate-700'
                                        }`}
                                        style={{
                                          height: isPlaying
                                            ? `${Math.max(3, 3 + Math.sin(i * 0.8 + audioElapsed * 4) * 7 + 4)}px`
                                            : `${Math.max(3, 3 + ((i * 7) % 9))}px`,
                                        }}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quoted Message Preview Header (WhatsApp Native Reply Styling) */}
                        {msg.quoted && (
                          <div className="mb-2 p-2 rounded-lg bg-black/30 border-l-4 border-cyan-400 text-[11px] leading-tight flex flex-col gap-0.5 select-none hover:bg-black/40 transition">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-cyan-300 text-[10px]">
                                {msg.quoted.sender === 'user' ? (msg.quoted.userName || 'User') : config.botName}
                              </span>
                              {msg.quoted.mediaType && (
                                <span className="text-[9px] text-slate-400 font-mono uppercase flex items-center gap-1">
                                  {msg.quoted.mediaType === 'image' && <ImageIcon className="w-2.5 h-2.5" />}
                                  {msg.quoted.mediaType === 'video' && <Film className="w-2.5 h-2.5" />}
                                  {msg.quoted.mediaType}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-300 text-[10px] line-clamp-2 truncate">
                              {msg.quoted.text || (msg.quoted.mediaType ? `[${msg.quoted.mediaType.toUpperCase()} file]` : 'Message')}
                            </p>
                          </div>
                        )}

                        {/* Message Body */}
                        {msg.isDeleted ? (
                          <div className="flex items-center justify-between py-1 gap-2">
                            <div className="flex items-center gap-1.5 text-slate-400 italic text-xs select-none">
                              <Ban className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>This message was deleted</span>
                            </div>
                            <button
                              onClick={() => restoreMessage(msg.id)}
                              className="text-[9px] text-slate-500 hover:text-cyan-300 font-mono underline hover:no-underline transition shrink-0"
                              title="Restore this message for testing"
                            >
                              Restore
                            </button>
                          </div>
                        ) : msg.loading ? (
                          <div className="flex items-center gap-2 py-1 text-cyan-300">
                            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                            <span className="font-mono text-[11px] animate-pulse">
                              {msg.loadingText || 'Formulating AI response...'}
                            </span>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs">
                            {msg.text}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-1 text-[9px] text-slate-400 pt-1 mt-0.5 border-t border-white/5">
                          {!msg.isDeleted && !msg.loading ? (
                            <div className="flex items-center gap-1 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startReply(msg)}
                                className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 transition"
                                title="Reply / Quote this message"
                              >
                                <Reply className="w-2.5 h-2.5" />
                                <span className="text-[9px] font-medium">Reply</span>
                              </button>
                              <button
                                onClick={() => deleteMessage(msg.id)}
                                className="text-slate-400 hover:text-rose-400 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-rose-500/20 transition"
                                title="Delete this message for everyone"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                                <span className="text-[9px] font-medium">Delete</span>
                              </button>
                            </div>
                          ) : (
                            <div />
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                            <span>{msg.time}</span>
                            {isUser && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Compact Quick Prompt Chips Bar */}
            <div className="bg-[#182229] px-3 py-1.5 border-t border-slate-700/30 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider shrink-0 mr-1">
                Quick:
              </span>
              {[
                `${config.prefix}play Wizkid Essence`,
                `${config.prefix}lyrics Essence`,
                `${config.prefix}video Burna Boy City Boys`,
                `${config.prefix}vv`,
                `${config.prefix}del`,
                `${config.prefix}imagine cyberpunk lion in neon savannah 8k`,
                `${config.prefix}videoai golden eagle soaring over snowy mountain peaks 4k`,
                `${config.prefix}ai what is money`,
                `${config.prefix}unknown`,
                `${config.prefix}ping`,
                `${config.prefix}menu`,
              ].map((qCmd) => (
                <button
                  key={qCmd}
                  onClick={() => sendCommand(qCmd)}
                  className="px-2 py-0.5 rounded-lg bg-[#2a3942] hover:bg-[#32444f] text-slate-300 font-mono text-[10px] whitespace-nowrap transition border border-white/5"
                >
                  {qCmd}
                </button>
              ))}
            </div>

            {/* Undo Notification Bar */}
            {undoNotice && (
              <div className="bg-[#182229] border-t border-slate-700/40 px-3 py-1.5 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <Trash2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{undoNotice.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => restoreMessage(undoNotice.id)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold font-mono underline"
                  >
                    Undo
                  </button>
                  <button
                    onClick={() => setUndoNotice(null)}
                    className="text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Quoted Message Preview Banner */}
            {quotedMsg && (
              <div className="bg-[#1f2c34] border-l-4 border-cyan-400 px-3 py-2 flex items-center justify-between text-xs text-slate-300 border-t border-slate-700/40 animate-in fade-in duration-150">
                <div className="truncate pr-2">
                  <div className="flex items-center gap-1.5">
                    <Reply className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-cyan-400 text-[11px]">
                      Replying to {quotedMsg.sender === 'user' ? (quotedMsg.userName || 'User') : config.botName}
                    </span>
                    {quotedMsg.isViewOnce && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono">
                        VIEW ONCE
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 truncate block mt-0.5 pl-4">
                    {quotedMsg.isDeleted
                      ? 'This message was deleted'
                      : quotedMsg.text || (quotedMsg.mediaType ? `[${quotedMsg.mediaType.toUpperCase()} file]` : 'Media')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      sendCommand(`${config.prefix}vv`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-mono flex items-center gap-1 border border-emerald-500/30 transition"
                    title="Open View Once media using .vv"
                  >
                    <Eye className="w-2.5 h-2.5" />
                    <span>Open (.vv)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sendCommand(`${config.prefix}del`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-mono flex items-center gap-1 border border-rose-500/30 transition"
                    title="Delete this message using .del"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <span>Delete (.del)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuotedMsg(null)}
                    className="p-1 hover:text-white text-slate-400 transition"
                    title="Cancel reply"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleManualSend} className="bg-[#202c33] p-2 sm:p-2.5 flex items-center gap-1.5 border-t border-slate-700/40">
              <button type="button" className="text-slate-400 hover:text-white p-1 transition shrink-0" title="Emoji">
                <Smile className="w-4 h-4" />
              </button>
              <button type="button" className="text-slate-400 hover:text-white p-1 transition shrink-0" title="Attach file">
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                disabled={isAiLoading}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  isAiLoading
                    ? 'AI is processing query...'
                    : quotedMsg
                    ? `Reply to ${quotedMsg.sender === 'user' ? (quotedMsg.userName || 'User') : config.botName}... (or type ${config.prefix}del)`
                    : `Message as ${activeUser.name.split(' ')[0]} (${config.prefix}ai, ${config.prefix}unknown, ${config.prefix}del)...`
                }
                className="flex-1 bg-[#2a3942] text-xs text-white rounded-xl px-3 py-2 outline-none border border-transparent focus:border-blue-500 transition disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isAiLoading || !inputVal.trim()}
                className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#008f6f] transition shadow-md shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isAiLoading ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Structured Control Panel & Test Trays (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Persona Switcher & Unknown Mode Controller */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Sender Identity
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Active JID: {activeUser.phone}
              </span>
            </div>

            {/* Persona Switch Pills */}
            <div className="grid grid-cols-2 gap-2">
              {SIMULATED_USERS.map((user, idx) => {
                const isSelected = activeUserIndex === idx;
                const hasUnknownOn = Boolean(unknownSettings[user.jid]);
                return (
                  <button
                    key={user.jid}
                    onClick={() => setActiveUserIndex(idx)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${user.avatarColor} flex items-center justify-center text-[10px] font-bold text-white`}>
                          {user.name[0]}
                        </div>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {idx === 0 ? 'User A' : 'User B'}
                        </span>
                      </div>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{user.name.split(' ')[0]}</span>
                      <span className={`px-1 py-0.2 rounded text-[9px] ${
                        hasUnknownOn
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {hasUnknownOn ? 'UNKNOWN' : 'PUBLIC'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Dedicated Unknown Mode Switch Card */}
            <div className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
              isUnknownActiveForCurrentUser
                ? 'bg-cyan-950/40 border-cyan-500/40'
                : 'bg-slate-950/80 border-slate-800'
            }`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  {isUnknownActiveForCurrentUser ? (
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className="text-xs font-semibold text-white">
                    Unknown Mode ({config.prefix}unknown)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {isUnknownActiveForCurrentUser
                    ? 'Replies route silently to Direct DM'
                    : 'Replies posted publicly in group chat'}
                </p>
              </div>

              <button
                onClick={handleToggleUnknownMode}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 shadow-sm ${
                  isUnknownActiveForCurrentUser
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {isUnknownActiveForCurrentUser ? (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>Turn OFF</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3" />
                    <span>Turn ON</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Channels Navigation (Like WhatsApp Web Chat List) */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Active Channel
              </span>
              <span className="text-[10px] text-slate-400">Click to switch chat view</span>
            </div>

            <div className="space-y-1.5">
              {CHANNELS.map((ch) => {
                const isActive = activeChannelId === ch.id;
                const msgs = channelMessages[ch.id] || [];
                const lastMsg = msgs[msgs.length - 1];
                const isDmWithUnknown = ch.id === 'dm' && isUnknownActiveForCurrentUser;

                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2.5 ${
                      isActive
                        ? 'bg-emerald-600/15 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        ch.type === 'group'
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                          : 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {ch.type === 'group' ? (
                          <Users className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                            {ch.name}
                          </span>
                          {isDmWithUnknown && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-[170px] sm:max-w-[220px]">
                          {lastMsg ? lastMsg.text.replace(/\n/g, ' ') : ch.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {msgs.length} msgs
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Categorized Command Test Trays (Clean & Tabbed, No Crowding) */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                Command Test Trays
              </span>
              <span className="text-[10px] text-slate-400">Click to execute</span>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto scrollbar-none">
              {(
                [
                  { id: 'aimedia', label: '🎬 AI Media' },
                  { id: 'music', label: '🎵 Music' },
                  { id: 'privacy', label: 'Privacy' },
                  { id: 'ai', label: 'AI & Code' },
                  { id: 'system', label: 'System' },
                  { id: 'media', label: 'Media' },
                ] as const
              ).map((tab) => {
                const isSelected = activeCommandTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCommandTab(tab.id)}
                    className={`flex-1 py-1 text-center rounded-lg font-medium transition text-[11px] ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Active Tab Command List */}
            <div className="space-y-1.5">
              {commandTrayItems[activeCommandTab].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.cmd}
                    onClick={() => sendCommand(item.cmd)}
                    className="w-full p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-2 group text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg border shrink-0 ${item.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-bold text-white group-hover:text-blue-300 transition truncate">
                          {item.cmd}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: Live Telemetry & Dispatch Logger */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Baileys Dispatch Telemetry
              </span>
              <span className="font-mono text-emerald-400 text-[10px]">🟢 Socket Connected</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] space-y-1 text-slate-400">
              <div className="flex items-center justify-between">
                <span>Sender JID:</span>
                <span className="text-white truncate max-w-[170px]">{activeUser.jid}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Origin Chat:</span>
                <span className="text-blue-300">{activeChannel.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Routing Destination:</span>
                <span className={isUnknownActiveForCurrentUser && activeChannel.type === 'group' ? 'text-cyan-300 font-bold' : 'text-emerald-300'}>
                  {isUnknownActiveForCurrentUser && activeChannel.type === 'group' ? '🔒 Private DM' : '🌐 Current Group'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
