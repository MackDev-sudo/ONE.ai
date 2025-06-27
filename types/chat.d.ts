export type ChatMode = 'General' | 'Productivity' | 'Wellness' | 'Learning' | 'Creative' | 'BFF';

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  mode: ChatMode;
  last_message: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface GroupedConversations {
  justNow: Conversation[];
  today: Conversation[];
  yesterday: Conversation[];
  thisWeek: Conversation[];
  thisMonth: Conversation[];
  older: Conversation[];
}
