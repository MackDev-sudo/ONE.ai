import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { Conversation, Message, ChatMode } from '@/types/chat';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false); // Start with false since we don't want to show loading without userId
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef<SupabaseClient>(createClient());
  
  // Add effect to log authentication state changes
  useEffect(() => {
    console.log('useConversations hook - Auth state changed:', { userId });
  }, [userId]);

  const handleError = (error: PostgrestError | Error | unknown, customMessage: string) => {
    if ((error as PostgrestError)?.code === '429') {
      console.warn('Rate limited, waiting before retry');
      setError("Too many requests. Please wait a moment and try again.");
      return true;
    }
    if ((error as PostgrestError)?.code === 'PGRST301') {
      setError("Database connection error. Please try again.");
      return true;
    }
    console.error(customMessage, error);
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("Could not complete the operation. Please try again later.");
    }
    return false;
  };
  
  const fetchConversations = useCallback(async () => {
    console.log('fetchConversations called with userId:', userId);
    
    if (!userId) {
      console.log('No userId provided, clearing conversations');
      setConversations([]);
      setError(null);
      setLoading(false);
      return;
    }
    
    try {
      // Fetch conversations and their first user message for the current user only
      console.log('Fetching conversations for userId:', userId);
      
      const { data, error: supabaseError } = await supabaseRef.current
        .from('messages')
        .select(`
          content,
          conversation_id,
          conversations!messages_conversation_id_fkey (
            id,
            user_id,
            mode,
            created_at,
            updated_at
          )
        `)
        .eq('role', 'user')
        .eq('conversations.user_id', userId) // Filter by current user only
        .order('created_at', { ascending: false });
        
      console.log('Raw data from Supabase:', data);
        

      if (supabaseError) {
        if (handleError(supabaseError, 'Error fetching conversations')) return;
        throw supabaseError;
      }
      
      // Process the data to create conversation objects for current user only
      const processedData = (data || []).map((item: any) => {
        console.log('Processing message item:', item);
        
        if (!item?.conversations) {
          console.warn('Missing conversation data for message:', item);
          return null;
        }
        
        const conversation = item.conversations;
        
        // Double-check that this conversation belongs to the current user
        if (conversation.user_id !== userId) {
          console.warn('Skipping conversation for different user:', conversation.user_id, 'current user:', userId);
          return null;
        }
        
        const result = {
          id: conversation.id,
          user_id: conversation.user_id,
          mode: conversation.mode,
          created_at: conversation.created_at,
          updated_at: conversation.updated_at,
          title: item.content, // Use the user's question as the title
          last_message: item.content,
          messages: []
        } as Conversation;
        
        console.log('Processed conversation:', result);
        return result;
      });

      const validConversations = processedData.filter((conv): conv is Conversation => conv !== null);
      console.log('Final conversations to display:', validConversations);
      setConversations(validConversations);
      setError(null);
    } catch (error) {
      handleError(error, 'Error fetching conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchConversationMessages = useCallback(async (conversationId: string) => {
    if (!userId || !conversationId) {
      return null;
    }

    try {
      // First verify that the conversation belongs to the current user
      const { data: conversationData, error: conversationError } = await supabaseRef.current
        .from('conversations')
        .select('user_id')
        .eq('id', conversationId)
        .eq('user_id', userId) // Ensure conversation belongs to current user
        .single();

      if (conversationError || !conversationData) {
        console.warn('Conversation not found or does not belong to current user:', conversationId, userId);
        return null;
      }

      // Now fetch messages for the verified conversation
      const { data, error: supabaseError } = await supabaseRef.current
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (supabaseError) {
        if (handleError(supabaseError, 'Error fetching messages')) return null;
        throw supabaseError;
      }

      return data as Message[];
    } catch (error) {
      handleError(error, 'Error fetching messages');
      return null;
    }
  }, [userId]);

  const createConversation = useCallback(async (mode: ChatMode = 'General') => {
    console.log('createConversation called with:', { userId, mode, userType: typeof userId });
    
    if (!userId) {
      console.warn('createConversation: No userId provided, cannot create conversation');
      return null;
    }
    
    try {
      console.log('Inserting conversation with user_id:', userId);
      
      const { data, error } = await supabaseRef.current
        .from('conversations')
        .insert([{
          user_id: userId,
          title: 'New Chat',
          mode,
          last_message: ''
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        handleError(error, 'Error creating conversation');
        return null;
      }

      console.log('Successfully created conversation:', data);
      const newConversation = data as Conversation;
      setConversations(prev => [newConversation, ...prev]);
      return newConversation;
    } catch (error) {
      console.error('Exception in createConversation:', error);
      handleError(error, 'Error creating conversation');
      return null;
    }
  }, [userId]);

  const saveMessage = useCallback(async (conversationId: string, content: string, role: 'user' | 'assistant') => {
    try {
      const { error: messageError } = await supabaseRef.current
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          content,
          role
        }]);

      if (messageError) {
        if (handleError(messageError, 'Error saving message')) return;
        throw messageError;
      }

      const { error: conversationError } = await supabaseRef.current
        .from('conversations')
        .update({ 
          last_message: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (conversationError) {
        if (handleError(conversationError, 'Error updating conversation')) return;
        throw conversationError;
      }

      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, last_message: content, updated_at: new Date().toISOString() }
          : conv
      ));
    } catch (error) {
      handleError(error, 'Error saving message');
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const { error } = await supabaseRef.current
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) {
        if (handleError(error, 'Error deleting conversation')) return;
        throw error;
      }

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    } catch (error) {
      handleError(error, 'Error deleting conversation');
    }
  }, []);

  useEffect(() => {
    let channelName = `conversations-${userId || 'anonymous'}`;
    let mounted = true;

    const setupSubscription = async () => {
      if (!userId) return;

      try {
        // Initial fetch
        await fetchConversations();
        
        if (!mounted) return;

        const channel = supabaseRef.current
          .channel(channelName)
          .on('postgres_changes', 
            {
              event: '*',
              schema: 'public',
              table: 'conversations',
              filter: `user_id=eq.${userId}`
            },
            (payload) => {
              if (!mounted) return;
              
              // Handle different types of changes
              switch (payload.eventType) {
                case 'INSERT':
                  setConversations(prev => [payload.new as Conversation, ...prev]);
                  break;
                case 'UPDATE':
                  setConversations(prev => prev.map(conv => 
                    conv.id === payload.new.id ? payload.new as Conversation : conv
                  ));
                  break;
                case 'DELETE':
                  setConversations(prev => prev.filter(conv => conv.id !== payload.old.id));
                  break;
              }
            }
          )
          .subscribe((status, err) => {
            if (err) {
              console.error('Subscription error:', err);
              return;
            }
            console.log(`Subscription status for ${channelName}:`, status);
          });

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      mounted = false;
      // Channel cleanup is handled by setupSubscription's return function
    };
  }, [userId, fetchConversations]);

  return {
    conversations,
    loading,
    error,
    createConversation,
    deleteConversation,
    fetchConversations,
    fetchConversationMessages
  };
}
