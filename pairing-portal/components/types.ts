export interface BotConfig {
  botName: string;
  ownerName: string;
  botDeveloper: string;
  ownerNumbers: string[];
  stickerPack: string;
  stickerAuthor: string;
  prefix: string;
  organization: string;
  email: string;
  waitMessage: string;
  watermark?: string;
}

export type ModuleCategory = 'Core' | 'Commands' | 'Config' | 'General';
