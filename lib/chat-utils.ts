import { Conversation, GroupedConversations, Message } from '@/types/chat';
import { supabase } from './supabase';

export function groupConversationsByTime(conversations: Conversation[]): GroupedConversations {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const justNowThreshold = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

  return conversations.reduce((groups: GroupedConversations, conversation) => {
    const conversationDate = new Date(conversation.updated_at);
    
    // Messages from the last 10 minutes go into "Just Now"
    if (conversationDate >= justNowThreshold) {
      groups.justNow.push(conversation);
    }
    // Messages from today (excluding just now)
    else if (conversationDate >= today) {
      groups.today.push(conversation);
    }
    // Messages from yesterday
    else if (conversationDate >= yesterday) {
      groups.yesterday.push(conversation);
    }
    // Messages from this week (last 7 days, excluding today/yesterday)
    else if (conversationDate >= thisWeekStart) {
      groups.thisWeek.push(conversation);
    }
    // Messages from this month (excluding this week)
    else if (conversationDate >= thisMonthStart) {
      groups.thisMonth.push(conversation);
    }
    // Older messages
    else {
      groups.older.push(conversation);
    }

    return groups;
  }, {
    justNow: [],
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: []
  });
}

export async function createConversation(userId: string | null, title: string, mode: string = 'general') {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Use the passed userId, or fall back to session user id, or null for anonymous
    const actualUserId = userId || session?.user?.id || null;
    
    console.log('createConversation in chat-utils:', {
      providedUserId: userId,
      sessionUserId: session?.user?.id,
      actualUserId,
      title,
      mode
    });
    
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        user_id: actualUserId,  // Use the actual user ID
        title,
        mode,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
    
    console.log('Successfully created conversation:', conversation);
    return conversation;
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw error;
  }
}

export async function saveMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
  try {
    // For assistant messages, properly format newlines and special characters
    let formattedContent = content;
    if (role === 'assistant') {
      // Preserve newlines and formatting
      formattedContent = content
        .replace(/\n/g, '\\n')  // Escape newlines
        .replace(/\r/g, '\\r'); // Escape carriage returns
    }

    // First save the message
    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content: formattedContent,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }

    // Then update the conversation's last_message_preview
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        last_message_preview: content.slice(0, 100), // Take first 100 chars for preview
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      throw updateError;
    }

    return newMessage;
  } catch (error) {
    console.error('Error in saveMessage:', error);
    throw error;
  }
}

export async function getConversationMessages(conversationId: string) {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return messages;
}

export async function getUserConversations(userId: string) {
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return conversations;
}

// Helper functions for conversation display
export function formatConversationTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 5) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      // Show actual date for older conversations
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
}

export function formatConversationDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

export function getModeDisplayInfo(mode: string) {
  const modeMap: Record<string, { label: string; color: string; emoji: string }> = {
    'general': { label: 'General', color: 'text-blue-600 dark:text-blue-400', emoji: '💬' },
    'productivity': { label: 'Productivity', color: 'text-green-600 dark:text-green-400', emoji: '⚡' },
    'wellness': { label: 'Wellness', color: 'text-pink-600 dark:text-pink-400', emoji: '🌸' },
    'learning': { label: 'Learning', color: 'text-purple-600 dark:text-purple-400', emoji: '📚' },
    'creative': { label: 'Creative', color: 'text-orange-600 dark:text-orange-400', emoji: '🎨' },
    'bff': { label: 'BFF', color: 'text-red-600 dark:text-red-400', emoji: '💕' }
  };
  
  return modeMap[mode.toLowerCase()] || modeMap['general'];
}

export function getTimelineGroupLabel(groupKey: string): string {
  const labels: Record<string, string> = {
    justNow: 'Just Now',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    older: 'Older'
  };
  
  return labels[groupKey] || groupKey;
}
