import { ReactNode, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Trash2, PanelLeftClose, PanelRightOpen, Search, PlusCircle, Library, X, Github } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
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
  onGoogleSignIn: () => void;
  onGithubSignIn: () => void;
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
  onGoogleSignIn,
  onGithubSignIn,
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
          <div className="mt-4 flex flex-col items-center space-y-2">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full max-w-48 flex items-center justify-center gap-2"
              onClick={onGoogleSignIn}
            >
              <FaGoogle className="w-3 h-3" />
              Sign in with Google
            </Button>
            <div className="text-xs text-gray-400 dark:text-gray-500">or</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full max-w-48 flex items-center justify-center gap-2"
              onClick={onGithubSignIn}
            >
              <Github className="w-3 h-3" />
              Sign in with GitHub
            </Button>
          </div>
        </div>
      );
    }

    // Special handling for guest users
    if (user?.app_metadata?.provider === 'guest' || user?.email === 'guest@example.com') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-0 mt-6">
          <div className={`p-4 rounded-lg ${uiStyle === "pixel" 
            ? "bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-400 dark:border-purple-600" 
            : "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700/50"
          }`}>
            <Library className={`h-12 w-12 mx-auto mb-4 ${uiStyle === "pixel" 
              ? "text-purple-600 dark:text-purple-400" 
              : "text-purple-500 dark:text-purple-400"
            }`} />
            <h3 className={`text-base font-semibold text-purple-700 dark:text-purple-300 mb-2 ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
              {uiStyle === "pixel" ? "GUEST MODE ACTIVE" : "Guest Mode Active"}
            </h3>
            <p className={`text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
              {uiStyle === "pixel" 
                ? "CHAT HISTORY NOT AVAILABLE IN GUEST MODE. SIGN IN TO SAVE CONVERSATIONS." 
                : "Chat history is not available in guest mode. Sign in with Google or GitHub to save your conversations and access them later."
              }
            </p>
            <div className="flex flex-col items-center space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className={`w-full max-w-48 flex items-center justify-center gap-2 ${uiStyle === "pixel" 
                  ? "border-2 border-purple-400 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30" 
                  : "border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                }`}
                onClick={onGoogleSignIn}
              >
                <FaGoogle className="w-3 h-3" />
                Sign in with Google
              </Button>
              <div className="text-xs text-gray-400 dark:text-gray-500">or</div>
              <Button 
                variant="outline" 
                size="sm" 
                className={`w-full max-w-48 flex items-center justify-center gap-2 ${uiStyle === "pixel" 
                  ? "border-2 border-purple-400 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30" 
                  : "border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                }`}
                onClick={onGithubSignIn}
              >
                <Github className="w-3 h-3" />
                Sign in with GitHub
              </Button>
            </div>
          </div>
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
                    group p-2 rounded-lg cursor-pointer transition-all duration-200
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
                  {/* Conversation title */}
                  <p className={`text-sm font-medium truncate mb-1 pr-2 ${
                    uiStyle === "pixel" 
                      ? "text-white pixel-font" 
                      : "text-gray-900 dark:text-gray-100"
                  }`}>
                    {conversation.last_message || conversation.title || 'Untitled Chat'}
                  </p>
                  
                  {/* Bottom row with mode, date, and delete button - all tightly packed on left */}
                  <div className="flex items-center gap-3 text-xs">
                    {/* Mode indicator - compact width */}
                    <span className={`inline-flex items-center gap-1 flex-shrink-0 max-w-[70px] ${modeInfo.color}`}>
                      <span className="flex-shrink-0">{modeInfo.emoji}</span>
                      <span className={`font-medium truncate ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
                        {modeInfo.label}
                      </span>
                    </span>
                    
                    {/* Date - compact and positioned towards left */}
                    <span className={`text-gray-500 dark:text-gray-400 text-[10px] flex-shrink-0 ${
                      uiStyle === "pixel" ? "pixel-font" : ""
                    }`}>
                      {timeDisplay}
                    </span>
                    
                    {/* Delete button - compact and positioned towards left */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`
                        h-4 w-4 p-0 flex-shrink-0
                        ${uiStyle === "pixel" 
                          ? "hover:bg-red-500/20" 
                          : "hover:bg-red-500/10 rounded"
                        }
                      `}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      aria-label="Delete conversation"
                    >
                      <Trash2 className={`h-2.5 w-2.5 transition-colors duration-200 ${
                        uiStyle === "pixel" 
                          ? "text-red-400 hover:text-red-300" 
                          : "text-gray-500 hover:text-red-500"
                      }`} />
                    </Button>
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

        {!isCollapsed && (
          <div className="px-4 pt-2">
            <h2 className={`text-lg font-semibold ${uiStyle === "pixel" ? "text-white pixel-font" : "bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-500 dark:from-purple-400 dark:via-pink-300 dark:to-fuchsia-400 bg-clip-text text-transparent"}`}>
              Chat History
            </h2>
          </div>
        )}

        {/* Chat History */}
        <ScrollArea className="flex-1 px-4">
          {isCollapsed ? (
            <div className="flex justify-center py-4">
              <MessageSquare className={`h-5 w-5 ${uiStyle === "pixel" ? "text-white" : "text-gray-500 dark:text-gray-400"}`} />
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
