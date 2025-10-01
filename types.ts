export type MessageRole = 'user' | 'ai';

export interface FileChange {
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  path: string;
  description: string;
  content?: string; // Raw file content as a string
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  codeChanges?: FileChange[];
  version?: number;
  error?: string;
  isStreaming?: boolean;
  imageUrls?: string[];
  previousFileSystem?: FileSystem;
  isExpectingCodeChanges?: boolean;
}

export interface FileData {
  content: string; // For text files: raw text. For binary files: base64 data.
  type: string; // e.g., 'tsx', 'html', 'css', or a mime-type like 'image/png'
  isBinary?: boolean;
}

export interface FileSystem {
  [path: string]: FileData;
}

export interface Project {
  id: number;
  name: string;
  fileSystem: FileSystem;
  messages: Message[];
}

export type AiStatus = 'idle' | 'thinking' | 'streaming';

export type AppTheme = 'light' | 'dark' | 'system';

export type IntegrationType = 
    | 'convex'
    | 'firecrawl'
    | 'vapi'
    | 'better_auth'
    | 'resend'
    | 'autumnpricing'
    | 'openai'
    | 'inkeep'
    | 'scorecard'
    | 'stripe';

export type OperationMode = 'gemini-2.5-flash' | 'chatgpt-5' | 'chat';

export type SettingsTab = 'subscription' | 'memory' | 'api_keys';

// Fix: Centralize and merge global Inkeep type definitions to resolve conflicts.
declare global {
  interface Window {
    Inkeep?: {
      ChatButton?: (config: any) => { open: () => void; cleanup: () => void };
      EmbeddedChat?: (target: string, config: any) => { cleanup: () => void };
    };
    inkeep?: {
      open: () => void;
    }
  }
}
