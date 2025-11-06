
export enum ChatRole {
  USER = 'user',
  BOT = 'model',
}

export interface ImagePart {
  mimeType: string;
  data: string;
  preview: string;
}

export type MessagePart = 
  | { type: 'text', content: string }
  | { type: 'image', content: ImagePart };


export interface Message {
  role: ChatRole;
  parts: MessagePart[];
}
