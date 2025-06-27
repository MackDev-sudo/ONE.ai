import { ReactNode, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Trash2, PanelLeftClose, PanelRightOpen, Search, PlusCircle, Library, X } from "lucide-react";
import { useConversations } from '@/hooks/use-conversations';
import { 
  groupConversationsByTime, 
  formatConversationTime, 
  getModeDisplayInfo, 
  getTimelineGroupLabel 
} from '@/lib/chat-utils';
import { Conversation } from '@/types/chat';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface LeftSidebarProps {
  uiStyle: "modern" | "pixel";
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
  onConversationSelect?: (conversationId: string) => void;
  selectedConversationId?: string;
  user: SupabaseUser | null;
  loading: boolean;
  onSignIn: () => void;
  onNewChat?: () => void;
}

export function LeftSidebar({
  uiStyle,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onConversationSelect,
  selectedConversationId,
  user,
  loading: authLoading,
  onSignIn,
  onNewChat
}: LeftSidebarProps): React.ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debug: Log authentication state in more detail
  useEffect(() => {
    console.log('LeftSidebar - Detailed auth state:', { 
      user,
      userExists: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authLoading,
      userType: typeof user
    });
  }, [user, authLoading]);
  
  const { conversations, loading: conversationsLoading, error, createConversation, deleteConversation } = useConversations(user?.id);

  // Debug user authentication state
  useEffect(() => {
    console.log('LeftSidebar - User auth state:', { 
      user: user,
      userId: user?.id,
      userEmail: user?.email,
      authLoading,
      conversationsLoading,
      conversationsCount: conversations?.length
    });
    
    // Log the current state when createConversation function changes
    console.log('LeftSidebar - createConversation function state:', {
      createConversationExists: !!createConversation,
      userIdForConversations: user?.id
    });
  }, [user, authLoading, conversationsLoading, conversations, createConversation]);

  const filteredConversations = conversations?.filter(conv =>
    (conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  ) || [];

  const renderContent = () => {
    console.log('Render Content - Current state:', {
      userId: user?.id,
      loading: authLoading || conversationsLoading,
      error,
      conversationsCount: conversations?.length,
      conversations
    });

    // Show loading while authenticating
    if (authLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="ml-3 text-sm text-gray-500">Checking authentication...</p>
        </div>
      );
    }

    // Show loading when fetching conversations for authenticated user
    if (conversationsLoading && user) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="ml-3 text-sm text-gray-500">Loading conversations...</p>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-center text-gray-500">
          <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
          <p className={`text-sm ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
            Sign in to start chatting
          </p>
          <Button 
            variant="default" 
            size="sm" 
            className="mt-4"
            onClick={onSignIn}
          >
            Sign in with Google
          </Button>
        </div>
      );
    }

    // Special handling for guest users
    if (user?.app_metadata?.provider === 'guest' || user?.email === 'guest@example.com') {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-center text-gray-500">
          <Library className="h-8 w-8 mb-3 opacity-60" />
          <p className={`text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
            {uiStyle === "pixel" ? "GUEST MODE ACTIVE" : "Guest Mode Active"}
          </p>
          <p className={`text-xs text-gray-500 dark:text-gray-500 px-4 ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
            {uiStyle === "pixel" 
              ? "CHAT HISTORY NOT AVAILABLE IN GUEST MODE. SIGN IN TO SAVE CONVERSATIONS." 
              : "Chat history is not available in guest mode. Sign in with Google or GitHub to save your conversations and access them later."
            }
          </p>
          {!uiStyle || uiStyle !== "pixel" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 text-xs"
              onClick={onSignIn}
            >
              Sign in to save history
            </Button>
          )}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-center text-gray-500">
          <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
          <p className={`text-sm ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
            {error}
          </p>
        </div>
      );
    }

    if (!conversations || conversations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-center text-gray-500">
          <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
          <p className={`text-sm ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
            No chat history yet
          </p>
          <p className={`text-xs mt-1 ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
            Start a new chat to begin
          </p>
        </div>
      );
    }

    const groupedConversations = groupConversationsByTime(filteredConversations);
    const nonEmptyGroups = Object.entries(groupedConversations).filter(([_, conversations]) => conversations.length > 0);

    return (
      <div className="space-y-4 py-4">
        {nonEmptyGroups.map(([groupKey, conversations]) => (
          <div key={groupKey} className="space-y-2">
            {/* Group Header */}
            <div className="px-2">
              <h3 className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                {getTimelineGroupLabel(groupKey)}
              </h3>
            </div>
            
            {/* Conversations in this group */}
            {conversations.map((conversation: Conversation) => {
              const modeInfo = getModeDisplayInfo(conversation.mode || 'general');
              const timeDisplay = formatConversationTime(conversation.updated_at);
              
              return (
                <div
                  key={conversation.id}
                  className={`
                    group flex flex-col p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${selectedConversationId === conversation.id
                      ? uiStyle === "pixel" 
                        ? 'bg-gray-700 border-l-4 border-cyan-400'
                        : 'bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-fuchsia-500/10 border-l-4 border-purple-500'
                      : uiStyle === "pixel"
                        ? 'hover:bg-gray-800/50'
                        : 'hover:bg-gradient-to-r hover:from-purple-600/5 hover:via-pink-500/5 hover:to-fuchsia-500/5'}
                  `}
                  onClick={() => onConversationSelect?.(conversation.id)}
                >
                  {/* Main content row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        uiStyle === "pixel" 
                          ? "text-white pixel-font" 
                          : "text-gray-900 dark:text-gray-100"
                      }`}>
                        {conversation.last_message || conversation.title || 'Untitled Chat'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ml-2"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                  
                  {/* Meta information row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      {/* Mode indicator */}
                      <span className={`inline-flex items-center space-x-1 ${modeInfo.color}`}>
                        <span>{modeInfo.emoji}</span>
                        <span className={`font-medium ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
                          {modeInfo.label}
                        </span>
                      </span>
                    </div>
                    
                    {/* Time indicator */}
                    <span className={`text-gray-500 dark:text-gray-400 ${
                      uiStyle === "pixel" ? "pixel-font" : ""
                    }`}>
                      {timeDisplay}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 flex flex-col transform transition-all duration-300 ease-out
          ${isCollapsed ? 'w-20' : 'w-80'}
          ${uiStyle === "pixel"
            ? "bg-gray-200 dark:bg-gray-800 border-r-4 border-gray-400 dark:border-gray-600 pixel-border"
            : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-cyan-500/20"
          }
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between ${uiStyle === "pixel" ? "border-b-4 border-gray-400 dark:border-gray-600" : "border-b border-gray-200 dark:border-cyan-500/20"}`}>
          <div className="flex items-center">
            <div
              className={`relative w-12 h-12 flex items-center justify-center ${uiStyle === "pixel" ? "pixel-border" : "rounded-2xl"} ${isCollapsed ? 'cursor-pointer group' : ''}`}
              onClick={isCollapsed ? () => setIsCollapsed(false) : undefined}
            >
              <img
                src="/xxx.png"
                alt="OneAI Logo"
                className="w-20 h-20 object-contain"
              />
              {isCollapsed && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <PanelRightOpen className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <h1 className={`text-2xl font-bold ${uiStyle === "pixel" ? "pixel-font" : "bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-500 dark:from-purple-400 dark:via-pink-300 dark:to-fuchsia-400 bg-clip-text text-transparent"}`}>
                  ONE.ai
                </h1>
              </div>
            )}
          </div>

          {/* Collapse/Expand button */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className={`hidden lg:flex text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200`}
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          )}

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`lg:hidden ${uiStyle === "pixel" ? "pixel-border border-2" : ""}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Section Title */}
        

        {/* Search and Actions */}
        <div className="p-4 space-y-4">
          {isCollapsed ? (
            <Button
              variant="ghost"
              className={`w-full flex justify-center items-center ${uiStyle === "pixel" ? "pixel-border border-2" : ""}`}
              onClick={() => setSearchQuery('')}
            >
              <Search className="h-4 w-4 text-gray-500" />
            </Button>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search chats..."
                className={`pl-9 w-full ${uiStyle === "pixel" ? "pixel-border border-2" : ""}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          <Button
            variant="default"
            className={`w-full flex items-center gap-2 ${uiStyle === "pixel" ? "pixel-border border-2" : ""} ${isCollapsed ? 'justify-center px-0' : ''}`}
            onClick={() => {
              console.log('New Chat button clicked:', { user, userId: user?.id, hasUser: !!user });
              if (user) {
                console.log('Creating new chat and clearing current conversation');
                // Clear the current chat state
                onNewChat?.();
                // Optionally create a new conversation in the backend
                // createConversation('General');
              } else {
                console.warn('No user found, cannot create conversation');
              }
            }}
            disabled={!user}
          >
            <PlusCircle className="h-4 w-4" />
            {!isCollapsed && <span>New Chat</span>}
          </Button>

          
        </div>

        <Separator className={uiStyle === "pixel" ? "h-1" : ""} />

        <div className="px-4 pt-2">
          <h2 className={`text-lg font-semibold ${uiStyle === "pixel" ? "text-white pixel-font" : "bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-500 dark:from-purple-400 dark:via-pink-300 dark:to-fuchsia-400 bg-clip-text text-transparent"}`}>
            Chat History
          </h2>
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 px-4">
          {isCollapsed ? (
            <div className="flex justify-center text-gray-500">
              <MessageSquare className="h-4 w-4 opacity-50" />
            </div>
          ) : (
            renderContent()
          )}
        </ScrollArea>

        {/* Footer */}
        <div className={`p-4 ${uiStyle === "pixel" ? "border-t-4 border-gray-400 dark:border-gray-600" : "border-t border-gray-200 dark:border-cyan-500/20"}`}>
          {!isCollapsed && (
            <p className={`text-xs text-center text-gray-500 ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
              © 2025 Mackdev Inc. All rights reserved.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
