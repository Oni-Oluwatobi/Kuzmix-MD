import { BotConfig } from '@/components/types';

export interface CommandDefinition {
  name: string;
  syntax: string;
  desc: string;
  category:
    | 'system'
    | 'ai'
    | 'aimedia'
    | 'vision'
    | 'coding'
    | 'voice'
    | 'creative'
    | 'media'
    | 'download'
    | 'internet'
    | 'group'
    | 'security'
    | 'stats'
    | 'education'
    | 'fun'
    | 'utilities'
    | 'smart'
    | 'owner'
    | 'kuzmix';
  permission: 'Public' | 'Group Admin' | 'Owner';
  example?: string;
  aliases?: string[];
}

export interface CategoryInfo {
  id: CommandDefinition['category'] | 'all';
  label: string;
  emoji: string;
  iconName: string;
  description: string;
}

export const COMMAND_CATEGORIES: CategoryInfo[] = [
  { id: 'all', label: 'All Commands', emoji: '⚡', iconName: 'Sparkles', description: 'Complete Kuzmix-MD ecosystem command suite' },
  { id: 'system', label: 'System', emoji: '⚙️', iconName: 'Cpu', description: 'Core system metrics, uptime, latency and bot operational diagnostics' },
  { id: 'ai', label: 'AI Reasoning', emoji: '🤖', iconName: 'Bot', description: 'General intelligence, reasoning, grammar, summary, research & agent tasks' },
  { id: 'aimedia', label: 'AI Media (Image & Video)', emoji: '🎬', iconName: 'Film', description: 'Free OpenRouter text-to-image (FLUX.1/SDXL) & text-to-video (Wan2.1/CogVideo) synthesis' },
  { id: 'vision', label: 'AI Vision', emoji: '👁️', iconName: 'Eye', description: 'Image analysis, OCR text extraction, document parsing & object detection' },
  { id: 'coding', label: 'AI Coding', emoji: '👨‍💻', iconName: 'Code', description: 'Code generation, debugging, optimization, regex, SQL & architecture' },
  { id: 'voice', label: 'AI Voice', emoji: '🔊', iconName: 'Volume2', description: 'Text-to-speech audio synthesis, voice transcription & voice AI responses' },
  { id: 'creative', label: 'AI Creative', emoji: '🎨', iconName: 'Palette', description: 'Stories, poetry, song lyrics, video scripts, character design & slogans' },
  { id: 'media', label: 'Media & Stickers', emoji: '🖼️', iconName: 'Image', description: 'Sticker generation, watermark, conversion, background removal & resizing' },
  { id: 'download', label: 'Downloaders', emoji: '📥', iconName: 'Download', description: 'Music/MP3 search, YouTube videos, GitHub repo ZIPs & package lookups' },
  { id: 'internet', label: 'Internet & Search', emoji: '🌐', iconName: 'Globe', description: 'Web search, Wikipedia, live weather, currency conversion, QR & news' },
  { id: 'group', label: 'Group Admin', emoji: '👥', iconName: 'Users', description: 'Group broadcasting, member management, admin roles & permission toggles' },
  { id: 'security', label: 'Group Security', emoji: '🛡️', iconName: 'Shield', description: 'Anti-link, anti-spam, anti-flood, warning counters & welcome announcements' },
  { id: 'stats', label: 'Group Stats', emoji: '📊', iconName: 'BarChart2', description: 'User XP, levels, ranks, leaderboards & group activity telemetry' },
  { id: 'education', label: 'Education', emoji: '🎓', iconName: 'GraduationCap', description: 'Academic math, physics, chemistry, quizzes, study plans & flashcards' },
  { id: 'fun', label: 'Fun & Games', emoji: '🎮', iconName: 'Gamepad2', description: 'Magic 8-ball, dice roll, coin flip, jokes, roasts, truth & dare' },
  { id: 'utilities', label: 'Utilities', emoji: '🧰', iconName: 'Wrench', description: 'Base64 encoders, hash generators, UUID, password creators, timers' },
  { id: 'smart', label: 'Smart Tools', emoji: '🧠', iconName: 'BrainCircuit', description: 'Reminders, task schedulers, todo tracking & persistent notes' },
  { id: 'owner', label: 'Owner & Dev', emoji: '👑', iconName: 'Crown', description: 'Server restarts, remote eval/exec, broadcast, user bans & maintenance' },
  { id: 'kuzmix', label: 'Kuzmix Core', emoji: '🌌', iconName: 'Orbit', description: 'Official Kuzmix AI engine, OS architecture, roadmap, releases & credits' },
];

export function getRawCommandsList(): Omit<CommandDefinition, 'syntax'>[] {
  return [
    // ⚙️ SYSTEM
    { name: 'menu', desc: 'Show complete command menu', category: 'system', permission: 'Public', aliases: ['help', 'list', 'commands'] },
    { name: 'alive', desc: 'Check bot status and connection', category: 'system', permission: 'Public', aliases: ['bot', 'online'] },
    { name: 'ping', desc: 'Check response latency', category: 'system', permission: 'Public', aliases: ['speed', 'latency'] },
    { name: 'health', desc: 'Check bot services and system health', category: 'system', permission: 'Public', aliases: ['healthcheck'] },
    { name: 'status', desc: 'Show complete bot status', category: 'system', permission: 'Public', aliases: ['state'] },
    { name: 'system', desc: 'Show CPU, RAM, OS, Node.js and system information', category: 'system', permission: 'Public', aliases: ['sysinfo', 'host'] },
    { name: 'version', desc: 'Show Kuzmix-MD version', category: 'system', permission: 'Public', aliases: ['v', 'ver'] },
    { name: 'uptime', desc: 'Show bot uptime', category: 'system', permission: 'Public', aliases: ['runtime'] },
    { name: 'stats', desc: 'Show bot usage statistics', category: 'system', permission: 'Public', aliases: ['botstats'] },
    { name: 'credits', desc: 'Show project credits', category: 'system', permission: 'Public', aliases: ['cred', 'developer'] },
    { name: 'owner', desc: 'Show developer contact', category: 'system', permission: 'Public', aliases: ['dev', 'creator'] },
    { name: 'repo', desc: 'Show official repository', category: 'system', permission: 'Public', aliases: ['github', 'sc', 'source'] },
    { name: 'changelog', desc: 'Show latest changes', category: 'system', permission: 'Public', aliases: ['updates', 'changes'] },

    // 🤖 AI
    { name: 'ai', desc: 'Ask AI anything', category: 'ai', permission: 'Public', example: 'ai how do multi-device sockets work' },
    { name: 'ask', desc: 'Ask AI a question', category: 'ai', permission: 'Public', example: 'ask explain quantum computing simply' },
    { name: 'chat', desc: 'Start AI conversation session', category: 'ai', permission: 'Public' },
    { name: 'resetai', desc: 'Reset AI conversation memory', category: 'ai', permission: 'Public' },
    { name: 'summarize', desc: 'Summarize text or replied article', category: 'ai', permission: 'Public', example: 'summarize [long article]' },
    { name: 'explain', desc: 'Explain a topic simply', category: 'ai', permission: 'Public', example: 'explain black holes' },
    { name: 'translate', desc: 'Translate text into target language', category: 'ai', permission: 'Public', example: 'translate Spanish Good morning friend' },
    { name: 'rewrite', desc: 'Rewrite text in a chosen tone or style', category: 'ai', permission: 'Public', example: 'rewrite formal Hey send me the docs asap' },
    { name: 'grammar', desc: 'Correct grammar and punctuation', category: 'ai', permission: 'Public', example: 'grammar they does not went there' },
    { name: 'paraphrase', desc: 'Paraphrase text with fresh vocabulary', category: 'ai', permission: 'Public', example: 'paraphrase Technology evolves rapidly' },
    { name: 'proofread', desc: 'Proofread and polish writing', category: 'ai', permission: 'Public' },
    { name: 'caption', desc: 'Generate high-engagement social media caption', category: 'ai', permission: 'Public', example: 'caption sunset in Lagos' },
    { name: 'hashtags', desc: 'Generate relevant trending hashtags', category: 'ai', permission: 'Public', example: 'hashtags web development' },
    { name: 'ideas', desc: 'Generate creative concepts & ideas', category: 'ai', permission: 'Public', example: 'ideas mobile app for students' },
    { name: 'brainstorm', desc: 'Brainstorm solutions for challenges', category: 'ai', permission: 'Public', example: 'brainstorm increase community engagement' },
    { name: 'compare', desc: 'Compare two items or technologies', category: 'ai', permission: 'Public', example: 'compare React vs Vue' },
    { name: 'factcheck', desc: 'Check factual accuracy of a claim', category: 'ai', permission: 'Public', example: 'factcheck lightning never strikes twice' },
    { name: 'research', desc: 'Perform in-depth structured topic research', category: 'ai', permission: 'Public', example: 'research artificial neural networks' },
    { name: 'plan', desc: 'Create a structured step-by-step plan', category: 'ai', permission: 'Public', example: 'plan build a SaaS in 30 days' },
    { name: 'agent', desc: 'Perform an autonomous multi-step AI task', category: 'ai', permission: 'Public', example: 'agent analyze market competitors and summarize' },
    { name: 'decision', desc: 'Help analyze options and decisions', category: 'ai', permission: 'Public', example: 'decision buy laptop vs upgrade desktop' },

    // 🎬 AI MEDIA (FREE TEXT TO IMAGE & VIDEO VIA OPENROUTER)
    { name: 'genvideo', desc: 'Generate a video from a prompt (Wan2.1 / Veo-2)', category: 'aimedia', permission: 'Public', example: 'genvideo golden eagle soaring over snowy mountain peaks 4k', aliases: ['vid', 'videoai', 'txt2video', 't2v', 'cinematic'] },
    { name: 'vid', desc: 'Short alias to generate video from a prompt', category: 'aimedia', permission: 'Public', example: 'vid sports car drifting through neon rain 60fps' },
    { name: 'animate', desc: 'Animate an image or descriptive scene into a dynamic video', category: 'aimedia', permission: 'Public', example: 'animate (reply to image or pass prompt)', aliases: ['img2vid', 'i2v', 'animateimg'] },
    { name: 'img2vid', desc: 'Transform still image to animated cinematic video', category: 'aimedia', permission: 'Public', example: 'img2vid (reply to image with motion instructions)' },
    { name: 'vidstatus', desc: 'Check video generation progress and cluster GPU status', category: 'aimedia', permission: 'Public', example: 'vidstatus', aliases: ['videostatus', 'renderstatus', 'gpuqueue'] },
    { name: 'vidstyle', desc: 'Choose, inspect, and configure cinematic video styles', category: 'aimedia', permission: 'Public', example: 'vidstyle cinematic (or vidstyle list)', aliases: ['videostyle', 'vstyle'] },
    { name: 'vidprompt', desc: 'Improve a video-generation prompt with director camera direction', category: 'aimedia', permission: 'Public', example: 'vidprompt sports car neon city drifting', aliases: ['enhancevid', 'promptvid'] },
    { name: 'imagine', desc: 'Generate high-definition AI image from descriptive text (FLUX.1/SDXL)', category: 'aimedia', permission: 'Public', example: 'imagine futuristic cybernetic lion in neon savanna 8k', aliases: ['image', 'draw', 'aiimg', 'dalle', 'flux'] },
    { name: 'txt2img', desc: 'Direct text to photorealistic image synthesizer', category: 'aimedia', permission: 'Public', example: 'txt2img ancient temple hidden in rainforest, cinematic lighting', aliases: ['genimg', 'photogen'] },
    { name: 'flux', desc: 'Fast ultra high-resolution FLUX.1-schnell image generator', category: 'aimedia', permission: 'Public', example: 'flux glass bottle holding a glowing miniature galaxy' },
    { name: 'photoreal', desc: 'Generate ultra-photorealistic portrait or landscape from text', category: 'aimedia', permission: 'Public', example: 'photoreal elderly fisherman smiling at sunset, 85mm lens' },
    { name: 'anime', desc: 'Generate Japanese anime / manga stylized illustration artwork', category: 'aimedia', permission: 'Public', example: 'anime mecha samurai standing on rooftop at dusk' },

    // 👁️ AI VISION
    { name: 'vision', desc: 'Analyze replied image with multi-modal AI', category: 'vision', permission: 'Public' },
    { name: 'imageask', desc: 'Ask AI a question about a replied image', category: 'vision', permission: 'Public', example: 'imageask what breed is this dog?' },
    { name: 'describe', desc: 'Describe replied image in vivid detail', category: 'vision', permission: 'Public' },
    { name: 'ocr', desc: 'Extract printed/handwritten text from image', category: 'vision', permission: 'Public' },
    { name: 'imgcaption', desc: 'Generate catchy caption for image', category: 'vision', permission: 'Public' },
    { name: 'detect', desc: 'Detect objects/content in image', category: 'vision', permission: 'Public' },
    { name: 'chart', desc: 'Analyze data from a chart or graph', category: 'vision', permission: 'Public' },
    { name: 'document', desc: 'Analyze and extract info from document', category: 'vision', permission: 'Public' },

    // 👨‍💻 AI CODING
    { name: 'code', desc: 'Generate production-ready code', category: 'coding', permission: 'Public', example: 'code React hook for debouncing input' },
    { name: 'debug', desc: 'Analyze replied code/stack trace for bugs', category: 'coding', permission: 'Public' },
    { name: 'fixcode', desc: 'Fix errors in replied code automatically', category: 'coding', permission: 'Public' },
    { name: 'explaincode', desc: 'Explain how replied code functions step by step', category: 'coding', permission: 'Public' },
    { name: 'optimize', desc: 'Optimize replied code for speed & memory', category: 'coding', permission: 'Public' },
    { name: 'convertcode', desc: 'Convert code to another programming language', category: 'coding', permission: 'Public', example: 'convertcode Python to TypeScript' },
    { name: 'regex', desc: 'Generate and explain regular expressions', category: 'coding', permission: 'Public', example: 'regex validate international phone numbers' },
    { name: 'sql', desc: 'Generate optimized SQL queries & schemas', category: 'coding', permission: 'Public', example: 'sql query top 5 customers with highest revenue' },
    { name: 'json', desc: 'Format, validate and analyze JSON payloads', category: 'coding', permission: 'Public' },
    { name: 'api', desc: 'Design REST/GraphQL API contracts & endpoints', category: 'coding', permission: 'Public', example: 'api payment webhook handler' },
    { name: 'gitai', desc: 'Get AI diagnostic help with Git merge/rebase issues', category: 'coding', permission: 'Public', example: 'gitai undo last commit without losing changes' },
    { name: 'readme', desc: 'Generate professional GitHub README.md', category: 'coding', permission: 'Public', example: 'readme WhatsApp Baileys multi-device bot' },
    { name: 'commit', desc: 'Generate conventional Git commit messages', category: 'coding', permission: 'Public', example: 'commit added sticker converter and menu command' },
    { name: 'architect', desc: 'Design full-stack software architecture blueprints', category: 'coding', permission: 'Public', example: 'architect real-time collaborative canvas' },

    // 🔊 AI VOICE
    { name: 'tts', desc: 'Convert text to voice note audio', category: 'voice', permission: 'Public', example: 'tts Welcome to Kuzmix Multi-Device' },
    { name: 'say', desc: 'Speak text in WhatsApp voice waveform', category: 'voice', permission: 'Public', example: 'say Hello from Nigeria' },
    { name: 'speak', desc: 'Convert text to voice with chosen language', category: 'voice', permission: 'Public', example: 'speak Greetings team' },
    { name: 'transcribe', desc: 'Convert voice note audio to written text', category: 'voice', permission: 'Public' },
    { name: 'aivoice', desc: 'Ask AI and receive response as voice audio', category: 'voice', permission: 'Public', example: 'aivoice What is the speed of light?' },

    // 🎨 AI CREATIVE
    { name: 'story', desc: 'Generate an immersive fictional story', category: 'creative', permission: 'Public', example: 'story a rogue AI exploring cyberspace' },
    { name: 'poem', desc: 'Generate an original expressive poem', category: 'creative', permission: 'Public', example: 'poem ode to late-night coding' },
    { name: 'lyrics', desc: 'Generate original song lyrics with verses & chorus', category: 'creative', permission: 'Public', example: 'lyrics upbeat afro-pop anthem' },
    { name: 'script', desc: 'Generate formatted YouTube or video script', category: 'creative', permission: 'Public', example: 'script 60-second tech tutorial' },
    { name: 'dialogue', desc: 'Generate dialogue between characters', category: 'creative', permission: 'Public', example: 'dialogue detective confronting suspect' },
    { name: 'character', desc: 'Create complete character profile & backstory', category: 'creative', permission: 'Public', example: 'character cyberpunk hacker protagonist' },
    { name: 'plot', desc: 'Develop engaging story plot twists & arcs', category: 'creative', permission: 'Public', example: 'plot time travel thriller in ancient Africa' },
    { name: 'name', desc: 'Generate unique names for apps, brands, or characters', category: 'creative', permission: 'Public', example: 'name futuristic fintech platform' },
    { name: 'brand', desc: 'Generate brand identity concepts & styling', category: 'creative', permission: 'Public', example: 'brand minimalist eco-friendly coffee' },
    { name: 'slogan', desc: 'Generate punchy marketing taglines & slogans', category: 'creative', permission: 'Public', example: 'slogan ultra-fast cloud hosting' },
    { name: 'bio', desc: 'Generate professional or witty social media bios', category: 'creative', permission: 'Public', example: 'bio full-stack engineer and bot builder' },

    // 🖼️ MEDIA
    { name: 'vv', desc: 'Reply to a View Once image or video to open it normally', category: 'media', permission: 'Public', aliases: ['viewonce', 'openvo'], example: 'vv (reply to View Once media)' },
    { name: 'sticker', desc: 'Convert replied image/video to WebP sticker', category: 'media', permission: 'Public', aliases: ['s'] },
    { name: 's', desc: 'Short alias to create sticker', category: 'media', permission: 'Public' },
    { name: 'take', desc: 'Re-watermark sticker with custom packname', category: 'media', permission: 'Public', example: 'take Kuzmix | Dev' },
    { name: 'wm', desc: 'Create sticker with custom watermark text', category: 'media', permission: 'Public', example: 'wm MyPack | Author' },
    { name: 'toimg', desc: 'Convert static sticker to JPG image', category: 'media', permission: 'Public' },
    { name: 'tovideo', desc: 'Convert animated sticker to MP4 video', category: 'media', permission: 'Public' },
    { name: 'toaudio', desc: 'Extract high-quality audio track from video', category: 'media', permission: 'Public' },
    { name: 'compress', desc: 'Compress media to reduce file size', category: 'media', permission: 'Public' },
    { name: 'resize', desc: 'Resize image to specific dimensions', category: 'media', permission: 'Public', example: 'resize 800x600' },
    { name: 'crop', desc: 'Crop image to aspect ratio (1:1, 16:9, etc.)', category: 'media', permission: 'Public', example: 'crop 1:1' },
    { name: 'rotate', desc: 'Rotate image by degrees', category: 'media', permission: 'Public', example: 'rotate 90' },
    { name: 'flip', desc: 'Flip image horizontally or vertically', category: 'media', permission: 'Public' },
    { name: 'blur', desc: 'Apply blur effect to replied image', category: 'media', permission: 'Public' },
    { name: 'enhance', desc: 'Enhance visual clarity and colors of image', category: 'media', permission: 'Public' },
    { name: 'upscale', desc: 'Upscale resolution of low-res image', category: 'media', permission: 'Public' },
    { name: 'removebg', desc: 'Remove image background transparently', category: 'media', permission: 'Public' },
    { name: 'watermark', desc: 'Overlay custom watermark text on image', category: 'media', permission: 'Public', example: 'watermark Kuzmix-MD' },
    { name: 'meme', desc: 'Create meme with top and bottom captions', category: 'media', permission: 'Public', example: 'meme Top text | Bottom text' },

    // 📥 DOWNLOAD
    { name: 'play', desc: 'Search and download 320kbps MP3 audio', category: 'download', permission: 'Public', example: 'play Burna Boy City Boys' },
    { name: 'song', desc: 'Search and download full song', category: 'download', permission: 'Public', example: 'song Asake Lonely At The Top' },
    { name: 'music', desc: 'Search high-speed audio stream', category: 'download', permission: 'Public', example: 'music Rema Calm Down' },
    { name: 'yt', desc: 'Search and fetch YouTube video link', category: 'download', permission: 'Public', example: 'yt Next.js tutorial' },
    { name: 'ytsearch', desc: 'Search YouTube video catalog', category: 'download', permission: 'Public', example: 'ytsearch Baileys whatsapp bot' },
    { name: 'video', desc: 'Download video from supported platforms', category: 'download', permission: 'Public', example: 'video https://...' },
    { name: 'audio', desc: 'Download audio from supported platforms', category: 'download', permission: 'Public', example: 'audio https://...' },
    { name: 'gitclone', desc: 'Download public GitHub repository as ZIP', category: 'download', permission: 'Public', example: 'gitclone https://github.com/thekreadivegalaxy/Kuzmix-MD' },
    { name: 'github', desc: 'Search GitHub repositories for libraries', category: 'download', permission: 'Public', example: 'github baileys multi device' },
    { name: 'npm', desc: 'Search npm registry for Node packages', category: 'download', permission: 'Public', example: 'npm @whiskeysockets/baileys' },
    { name: 'pypi', desc: 'Search Python packages on PyPI', category: 'download', permission: 'Public', example: 'pypi fastapi' },

    // 🌐 INTERNET
    { name: 'search', desc: 'Search the live web for articles', category: 'internet', permission: 'Public', example: 'search latest AI breakthroughs 2026' },
    { name: 'google', desc: 'Google search results lookup', category: 'internet', permission: 'Public', example: 'google TypeScript 5.5 release notes' },
    { name: 'wiki', desc: 'Wikipedia summary lookup', category: 'internet', permission: 'Public', example: 'wiki Lagos Nigeria' },
    { name: 'define', desc: 'Dictionary definitions, phonetic & origin', category: 'internet', permission: 'Public', example: 'define serendipity' },
    { name: 'weather', desc: 'Live weather report and forecasts', category: 'internet', permission: 'Public', example: 'weather Abuja Nigeria' },
    { name: 'time', desc: 'Current local time in any city/country', category: 'internet', permission: 'Public', example: 'time London' },
    { name: 'timezone', desc: 'Timezone offset & coordinate info', category: 'internet', permission: 'Public', example: 'timezone GMT+1' },
    { name: 'country', desc: 'Country capital, population, currency & flag', category: 'internet', permission: 'Public', example: 'country Nigeria' },
    { name: 'currency', desc: 'Live currency conversion calculator', category: 'internet', permission: 'Public', example: 'currency 100 USD NGN' },
    { name: 'news', desc: 'Search latest global or regional news', category: 'internet', permission: 'Public', example: 'news technology' },
    { name: 'calc', desc: 'Evaluate mathematical expressions safely', category: 'internet', permission: 'Public', example: 'calc (45 * 12) / sqrt(16)' },
    { name: 'unit', desc: 'Convert measurement units (km to miles, etc.)', category: 'internet', permission: 'Public', example: 'unit 50 km to miles' },
    { name: 'qr', desc: 'Generate QR code for text or URL', category: 'internet', permission: 'Public', example: 'qr https://github.com/thekreadivegalaxy/Kuzmix-MD' },
    { name: 'shorten', desc: 'Shorten long URLs to clean short links', category: 'internet', permission: 'Public', example: 'shorten https://long-url...' },

    // 👥 GROUP
    { name: 'tagall', desc: 'Mention all group members with broadcast header', category: 'group', permission: 'Group Admin', example: 'tagall Team standup meeting now' },
    { name: 'hidetag', desc: 'Broadcast message with invisible mentions', category: 'group', permission: 'Group Admin', example: 'hidetag Important announcement' },
    { name: 'kick', desc: 'Remove targeted member from group', category: 'group', permission: 'Group Admin', example: 'kick @user' },
    { name: 'promote', desc: 'Promote member to Group Admin', category: 'group', permission: 'Group Admin', example: 'promote @user' },
    { name: 'demote', desc: 'Demote member from Admin privileges', category: 'group', permission: 'Group Admin', example: 'demote @user' },
    { name: 'group', desc: 'Change group messaging mode (open/close)', category: 'group', permission: 'Group Admin', example: 'group close' },
    { name: 'groupinfo', desc: 'Show group metadata, creation date & owner', category: 'group', permission: 'Public' },
    { name: 'admins', desc: 'List all group administrators with links', category: 'group', permission: 'Public' },
    { name: 'link', desc: 'Get active group invite link', category: 'group', permission: 'Group Admin' },
    { name: 'revoke', desc: 'Revoke and reset group invite link', category: 'group', permission: 'Group Admin' },
    { name: 'setname', desc: 'Change group subject/name', category: 'group', permission: 'Group Admin', example: 'setname Kuzmix Dev Squad' },
    { name: 'setdesc', desc: 'Change group description text', category: 'group', permission: 'Group Admin', example: 'setdesc Official developer hub' },
    { name: 'setpp', desc: 'Update group profile icon picture', category: 'group', permission: 'Group Admin' },
    { name: 'getpp', desc: 'Get full-res group profile picture', category: 'group', permission: 'Public' },

    // 🛡️ GROUP SECURITY & PRIVACY
    { name: 'unknown', desc: 'Toggle private response routing mode across all WhatsApp groups', category: 'security', permission: 'Public', example: 'unknown on', aliases: ['private', 'ghost'] },
    { name: 'antilink', desc: 'Enable/disable automatic WhatsApp link ban', category: 'security', permission: 'Group Admin', example: 'antilink on' },
    { name: 'antispam', desc: 'Enable/disable anti-spam rate limiting', category: 'security', permission: 'Group Admin', example: 'antispam on' },
    { name: 'antiflood', desc: 'Enable/disable message flood protection', category: 'security', permission: 'Group Admin', example: 'antiflood on' },
    { name: 'antitag', desc: 'Enable/disable excessive-tag protection', category: 'security', permission: 'Group Admin', example: 'antitag on' },
    { name: 'antibot', desc: 'Enable/disable unauthorized bot protection', category: 'security', permission: 'Group Admin', example: 'antibot on' },
    { name: 'warn', desc: 'Warn member for rules violation (3 strikes = kick)', category: 'security', permission: 'Group Admin', example: 'warn @user' },
    { name: 'warnings', desc: 'Check current active warnings for a member', category: 'security', permission: 'Public', example: 'warnings @user' },
    { name: 'resetwarn', desc: 'Reset warning counter for member', category: 'security', permission: 'Group Admin', example: 'resetwarn @user' },
    { name: 'welcome', desc: 'Enable/disable new member welcome messages', category: 'security', permission: 'Group Admin', example: 'welcome on' },
    { name: 'goodbye', desc: 'Enable/disable member farewell messages', category: 'security', permission: 'Group Admin', example: 'goodbye on' },
    { name: 'setwelcome', desc: 'Set custom welcome greeting template', category: 'security', permission: 'Group Admin', example: 'setwelcome Welcome @user to @group!' },
    { name: 'setgoodbye', desc: 'Set custom goodbye message template', category: 'security', permission: 'Group Admin', example: 'setgoodbye Goodbye @user, we will miss you!' },

    // 📊 GROUP STATS
    { name: 'profile', desc: 'Show user profile, activity stats & rank badge', category: 'stats', permission: 'Public' },
    { name: 'rank', desc: 'Show current level rank in community', category: 'stats', permission: 'Public' },
    { name: 'level', desc: 'Show user XP points and progress bar', category: 'stats', permission: 'Public' },
    { name: 'leaderboard', desc: 'Show group leaderboard of most active members', category: 'stats', permission: 'Public' },
    { name: 'top', desc: 'Show top 10 members by total message count', category: 'stats', permission: 'Public' },
    { name: 'activity', desc: 'Show group 24-hour activity analytics graph', category: 'stats', permission: 'Public' },

    // 🎓 EDUCATION
    { name: 'solve', desc: 'Solve complex academic questions step by step', category: 'education', permission: 'Public', example: 'solve 2x^2 + 5x - 12 = 0' },
    { name: 'math', desc: 'Step-by-step calculus, algebra & geometry help', category: 'education', permission: 'Public', example: 'math integrate sin(x)*cos(x) dx' },
    { name: 'physics', desc: 'Physics theory, equations and problem breakdown', category: 'education', permission: 'Public', example: 'physics calculate gravitational potential energy' },
    { name: 'chemistry', desc: 'Chemical equations balancing & molecular concepts', category: 'education', permission: 'Public', example: 'chemistry balance Fe + O2 -> Fe2O3' },
    { name: 'biology', desc: 'Cellular biology, genetics & physiology explanations', category: 'education', permission: 'Public', example: 'biology explain DNA replication fork' },
    { name: 'study', desc: 'Generate customized revision & study plan', category: 'education', permission: 'Public', example: 'study Data Structures in 2 weeks' },
    { name: 'flashcards', desc: 'Generate digital Q&A flashcards for any topic', category: 'education', permission: 'Public', example: 'flashcards Nigerian History' },
    { name: 'quiz', desc: 'Generate interactive multiple-choice test', category: 'education', permission: 'Public', example: 'quiz Computer Networks' },
    { name: 'revision', desc: 'Generate high-yield revision summaries', category: 'education', permission: 'Public', example: 'revision Organic Chemistry functional groups' },
    { name: 'formula', desc: 'Lookup and explain mathematical/scientific formulas', category: 'education', permission: 'Public', example: 'formula quadratic formula derivations' },

    // 🎮 FUN
    { name: '8ball', desc: 'Ask Magic 8-Ball oracle any question', category: 'fun', permission: 'Public', example: '8ball Will my bot deploy successfully?' },
    { name: 'dice', desc: 'Roll a random 6-sided dice (1-6)', category: 'fun', permission: 'Public' },
    { name: 'coin', desc: 'Flip a coin (Heads or Tails)', category: 'fun', permission: 'Public' },
    { name: 'choose', desc: 'Randomly choose between provided options', category: 'fun', permission: 'Public', example: 'choose Pizza | Burger | Shawarma' },
    { name: 'joke', desc: 'Tell a clean hilarious joke', category: 'fun', permission: 'Public' },
    { name: 'roast', desc: 'Generate a lighthearted friendly roast', category: 'fun', permission: 'Public', example: 'roast @user' },
    { name: 'compliment', desc: 'Generate a genuine uplifting compliment', category: 'fun', permission: 'Public', example: 'compliment @user' },
    { name: 'truth', desc: 'Generate a fun truth question for party games', category: 'fun', permission: 'Public' },
    { name: 'dare', desc: 'Generate a harmless fun dare challenge', category: 'fun', permission: 'Public' },
    { name: 'riddle', desc: 'Generate a brain-teaser riddle with revealable answer', category: 'fun', permission: 'Public' },
    { name: 'trivia', desc: 'Generate trivia question with points scoring', category: 'fun', permission: 'Public' },

    // 🧰 UTILITIES
    { name: 'base64', desc: 'Encode or decode text in Base64 format', category: 'utilities', permission: 'Public', example: 'base64 encode Hello Kuzmix' },
    { name: 'hash', desc: 'Generate MD5, SHA-256 and SHA-512 hashes', category: 'utilities', permission: 'Public', example: 'hash KuzmixBot2026' },
    { name: 'uuid', desc: 'Generate random RFC-4122 v4 UUID strings', category: 'utilities', permission: 'Public' },
    { name: 'random', desc: 'Generate random number within range', category: 'utilities', permission: 'Public', example: 'random 1 100' },
    { name: 'password', desc: 'Generate secure high-entropy password', category: 'utilities', permission: 'Public' },
    { name: 'timestamp', desc: 'Convert timestamp to readable date/time', category: 'utilities', permission: 'Public', example: 'timestamp 1718000000' },
    { name: 'color', desc: 'Convert HEX, RGB, HSL color codes with preview', category: 'utilities', permission: 'Public', example: 'color #3b82f6' },
    { name: 'markdown', desc: 'Format and preview markdown text formatting', category: 'utilities', permission: 'Public', example: 'markdown *bold* _italic_' },
    { name: 'timer', desc: 'Start countdown timer with voice/text alert', category: 'utilities', permission: 'Public', example: 'timer 5m' },
    { name: 'stopwatch', desc: 'Interactive group stopwatch precision timer', category: 'utilities', permission: 'Public' },

    // 🧠 SMART TOOLS
    { name: 'remind', desc: 'Create time-based personal or group reminder', category: 'smart', permission: 'Public', example: 'remind 30m Check server deployments' },
    { name: 'schedule', desc: 'Schedule recurring or future bot tasks', category: 'smart', permission: 'Public', example: 'schedule 8am Send daily motivaton' },
    { name: 'todo', desc: 'Add task to persistent WhatsApp to-do list', category: 'smart', permission: 'Public', example: 'todo update baileys dependency' },
    { name: 'tasks', desc: 'View and manage your active to-do list', category: 'smart', permission: 'Public' },
    { name: 'notes', desc: 'View your saved persistent notes', category: 'smart', permission: 'Public' },
    { name: 'note', desc: 'Save text note for quick retrieval later', category: 'smart', permission: 'Public', example: 'note VPS IP is 192.168.1.1' },

    // 👑 OWNER
    { name: 'restart', desc: 'Safely restart the Kuzmix-MD Node.js instance', category: 'owner', permission: 'Owner' },
    { name: 'shutdown', desc: 'Gracefully shut down the bot process', category: 'owner', permission: 'Owner' },
    { name: 'update', desc: 'Pull latest updates from GitHub repository', category: 'owner', permission: 'Owner' },
    { name: 'broadcast', desc: 'Broadcast message to all connected chats', category: 'owner', permission: 'Owner', example: 'broadcast Kuzmix v2.0 update live!' },
    { name: 'ban', desc: 'Ban abusive user from interacting with bot', category: 'owner', permission: 'Owner', example: 'ban @user' },
    { name: 'unban', desc: 'Unban previously banned user', category: 'owner', permission: 'Owner', example: 'unban @user' },
    { name: 'block', desc: 'Block user contact on WhatsApp', category: 'owner', permission: 'Owner', example: 'block @user' },
    { name: 'unblock', desc: 'Unblock user contact on WhatsApp', category: 'owner', permission: 'Owner', example: 'unblock @user' },
    { name: 'eval', desc: 'Execute JavaScript code on server (Developer only)', category: 'owner', permission: 'Owner', example: 'eval return process.memoryUsage()' },
    { name: 'exec', desc: 'Execute bash terminal command on host VPS', category: 'owner', permission: 'Owner', example: 'exec git status' },
    { name: 'logs', desc: 'Fetch latest 50 lines of execution logs', category: 'owner', permission: 'Owner' },
    { name: 'database', desc: 'View database telemetry and session records', category: 'owner', permission: 'Owner' },
    { name: 'cache', desc: 'Clear media temp files and session memory cache', category: 'owner', permission: 'Owner' },
    { name: 'setprefix', desc: 'Change global bot trigger prefix dynamically', category: 'owner', permission: 'Owner', example: 'setprefix !' },
    { name: 'maintenance', desc: 'Toggle bot maintenance mode (owner only mode)', category: 'owner', permission: 'Owner', example: 'maintenance on' },

    // 🌌 KUZMIX
    { name: 'kuzmix', desc: 'Main Kuzmix AI assistant query handler', category: 'kuzmix', permission: 'Public', example: 'kuzmix what makes Kuzmix-MD unique?' },
    { name: 'kuzmixai', desc: 'Open Kuzmix AI interactive conversation terminal', category: 'kuzmix', permission: 'Public' },
    { name: 'kuzmixinfo', desc: 'Full information on Kuzmix ecosystem & features', category: 'kuzmix', permission: 'Public' },
    { name: 'kuzmixos', desc: 'Kuzmix OS architecture, kernel & protocol specs', category: 'kuzmix', permission: 'Public' },
    { name: 'kuzmixmd', desc: 'Kuzmix-MD multi-device socket specification', category: 'kuzmix', permission: 'Public' },
    { name: 'features', desc: 'Show all 18 feature modules and capabilities', category: 'kuzmix', permission: 'Public' },
    { name: 'roadmap', desc: 'Show Kuzmix-MD development timeline and roadmap', category: 'kuzmix', permission: 'Public' },
    { name: 'release', desc: 'Show latest release notes and version download', category: 'kuzmix', permission: 'Public' },
    { name: 'cred', desc: 'Show foundational project credits & attribution', category: 'kuzmix', permission: 'Public' },
  ];
}

export function getAllCommands(config: BotConfig): CommandDefinition[] {
  const rawList = getRawCommandsList();
  return rawList.map((item) => ({
    ...item,
    syntax: `${config.prefix}${item.name}${item.example ? ' ' + item.example.split(' ').slice(1).join(' ') : ''}`,
    example: item.example ? `${config.prefix}${item.example}` : `${config.prefix}${item.name}`,
  }));
}
