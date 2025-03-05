import { ForwardRefExoticComponent, RefAttributes } from 'react';

export interface TextInputProps {
  locked?: boolean;
  active?: boolean;
  value?: string;
  label?: string;
  conversationId?: string | null;
  error?: string;
  onConversationCreated?: (conversationId: string) => void;
  onSendMessage?: (text: string) => void;
  onResponseReceived?: (text: string) => void;
  onSpeakingStart?: (text: string) => void;
  onSpeakingStop?: () => void;
}

export interface TextInputRef {
  sendMessage: (text: string) => void;
}

declare const TextInput: ForwardRefExoticComponent<TextInputProps & RefAttributes<TextInputRef>>;

export default TextInput; 