"use client"

import { useChat, Message as AiMessage } from "@ai-sdk/react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useConversations } from "@/hooks/use-conversations"
import { Message } from "@/types/chat"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { FaGoogle } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Brain,
  Heart,
  BookOpen,
  Lightbulb,
  User,
  Target,
  MessageCircle,
  Trash2,
  Mic,
  MicOff,
  ArrowUp,
  Sparkles,
  Github,
  Menu,
  X,
  Volume2,
  VolumeX,
  Users,
  Sun,
  Moon,
  Cpu,
  AlertCircle,
  ChevronDown,
  Key,
  Check,
  Gamepad2,
  Palette,
  Info,
  Shield,
  HelpCircle,
  MessageSquare,
  FileText,
  Eraser,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Download,
  Share2,
} from "lucide-react"
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { AIVisualization } from "@/components/ai-visualization"
import { ActivityMatrix } from "@/components/activity-matrix"
import { useSpeech } from "@/hooks/use-speech"
import { RightSidebar } from "@/components/right-sidebar"
import { LeftSidebar } from "@/components/left-sidebar"
import { LandingPage } from "@/components/landing-page"
import { About } from "@/components/options-menu/About"
import { Security } from "@/components/options-menu/Security"
import { Disclaimer } from "@/components/options-menu/Disclaimer"
import { ContactUs } from "@/components/options-menu/ContactUs"
import { HelpCenter } from "@/components/options-menu/HelpCenter"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "../styles/globals.css"
import { toast } from "sonner"

type Mode = "general" | "productivity" | "wellness" | "learning" | "creative" | "bff"
type Provider = "groq" | "gemini" | "openai" | "claude"
type UIStyle = "modern" | "pixel"

const MODES = {
  general: {
    icon: Brain,
    label: "General",
    description: "General assistance and conversation",
    placeholder: "Ask me anything...",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-100/50 dark:bg-cyan-950/30",
    bgPixel: "bg-cyan-100 dark:bg-cyan-900/30",
    border: "border-cyan-300 dark:border-cyan-500/30",
    borderPixel: "border-cyan-400 dark:border-cyan-500",
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
  },
  productivity: {
    icon: Target,
    label: "Productivity",
    description: "Task management and organization",
    placeholder: "How can I help you be more productive?",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100/50 dark:bg-emerald-950/30",
    bgPixel: "bg-emerald-100 dark:bg-emerald-900/30",
    border: "border-emerald-300 dark:border-emerald-500/30",
    borderPixel: "border-emerald-400 dark:border-emerald-500",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
  },
  wellness: {
    icon: Heart,
    label: "Wellness",
    description: "Health and well-being guidance",
    placeholder: "What wellness topic can I help with?",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100/50 dark:bg-rose-950/30",
    bgPixel: "bg-rose-100 dark:bg-rose-900/30",
    border: "border-rose-300 dark:border-rose-500/30",
    borderPixel: "border-rose-400 dark:border-rose-500",
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/20",
  },
  learning: {
    icon: BookOpen,
    label: "Learning",
    description: "Education and skill development",
    placeholder: "What would you like to learn?",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100/50 dark:bg-purple-950/30",
    bgPixel: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-300 dark:border-purple-500/30",
    borderPixel: "border-purple-400 dark:border-purple-500",
    gradient: "from-purple-500 to-indigo-600",
    glow: "shadow-purple-500/20",
  },
  creative: {
    icon: Lightbulb,
    label: "Creative",
    description: "Ideas and creative projects",
    placeholder: "Let's brainstorm something creative...",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100/50 dark:bg-amber-950/30",
    bgPixel: "bg-amber-100 dark:bg-amber-900/30",
    border: "border-amber-300 dark:border-amber-500/30",
    borderPixel: "border-amber-400 dark:border-amber-500",
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
  },
  bff: {
    icon: Users,
    label: "BFF",
    description: "Your GenZ bestie who speaks your language",
    placeholder: "Hey bestie, what's up? 💕",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-100/50 dark:bg-pink-950/30",
    bgPixel: "bg-pink-100 dark:bg-pink-900/30",
    border: "border-pink-300 dark:border-pink-500/30",
    borderPixel: "border-pink-400 dark:border-pink-500",
    gradient: "from-pink-500 to-rose-600",
    glow: "shadow-pink-500/20",
  },
}

const PROVIDERS = {
  groq: {
    name: "Groq",
    description: "Fast and efficient LLM",
    models: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "qwen/qwen3-32b"],
    requiresApiKey: false,
    color: "pink",
  },
  gemini: {
    name: "Gemini",
    description: "Google's multimodal AI",
    models: ["gemini-2.0-flash"],
    requiresApiKey: false,
    color: "emerald",
  },
  openai: {
    name: "OpenAI",
    description: "Advanced language models",
    models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
    requiresApiKey: true,
    color: "violet",
  },
  claude: {
    name: "Claude",
    description: "Anthropic's helpful assistant",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    requiresApiKey: true,
    color: "orange",
  },
}

const QUICK_ACTIONS = {
  general: [
    "Help me make a decision",
    "Explain complex topic",
    "Give advice on a situation",
    "Solve a problem step by step",
  ],
  productivity: ["Plan my day effectively", "Break down a project", "Prioritize my tasks", "Time management tips"],
  wellness: ["Morning routine ideas", "Stress management techniques", "Healthy habit suggestions", "Workout planning"],
  learning: ["Explain a concept", "Create a study plan", "Learning resources", "Practice exercises"],
  creative: ["Brainstorm ideas", "Creative writing prompts", "Project inspiration", "Overcome creative blocks"],
  bff: ["What's the tea? ☕", "I need some motivation 💪", "Help me with drama 🎭", "Let's chat about life 💫"],
}

import type { Components } from "react-markdown"

interface UserMetadata {
  avatar_url?: string;
  full_name?: string;
  provider?: string;
  hostIP?: string;
  loginTime?: string;
}

interface User {
  id: string;
  email?: string;
  user_metadata?: UserMetadata;
  app_metadata?: {
    provider?: string;
  };
}

// Add this function before the FuturisticRadhika component
const getIpAddress = async () => {
  try {
    const response = await fetch('/api/ip');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return '127.0.0.1'; // fallback to localhost if fetch fails
  }
};

const handleCopyMessage = async (content: string) => {
  await navigator.clipboard.writeText(content);
  toast.success("Message copied to clipboard");
};

const handleDownloadMessage = (content: string) => {
  const element = document.createElement("a");
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = "message.txt";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  toast.success("Message downloaded");
};

const handleShareMessage = async (content: string) => {
  if (navigator.share) {
    try {
      await navigator.share({
        text: content,
      });
      toast.success("Message shared successfully");
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error("Error sharing message");
      }
    }
  } else {
    await handleCopyMessage(content);
    toast.success("Link copied to clipboard (sharing not supported)");
  }
};

export default function ChatPage() {
  const [mode, setMode] = useState<Mode>("general")
  const [provider, setProvider] = useState<Provider>("groq")
  const [darkMode, setDarkMode] = useState(true)
  const [uiStyle, setUIStyle] = useState<UIStyle>("modern")
  const [error, setError] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider>("groq")
  const [tempApiKey, setTempApiKey] = useState("")
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    loginTime: string;
    hostIP: string;
  } | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [systemIp, setSystemIp] = useState<string>('');
  const [textToSpeak, setTextToSpeak] = useState<string>("");

  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [disclaimerDialogOpen, setDisclaimerDialogOpen] = useState(false);
  const [contactUsDialogOpen, setContactUsDialogOpen] = useState(false);
  const [helpCenterDialogOpen, setHelpCenterDialogOpen] = useState(false);

  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    createConversation,
    deleteConversation,
    fetchConversationMessages
  } = useConversations(user?.id);

  // Check for existing session
  useEffect(() => {
    console.log('Main page - Getting initial session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Main page - Initial session:', { 
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        setAuthDialogOpen(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Main page - Auth state changed:', { 
        event: _event,
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });
      setUser(session?.user ?? null)
      if (session?.user) {
        setAuthDialogOpen(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with GitHub:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setAuthDialogOpen(true)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Effect to fetch IP address
  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        if (userProfile) {
          setUserProfile({ ...userProfile, hostIP: data.ip });
        }
      } catch (error) {
        console.error('Failed to fetch IP:', error);
      }
    };
    if (userProfile) {
      fetchIP();
    }
  }, [userProfile?.name]);

  const handleGuestAccess = useCallback(() => {
    const currentTime = new Date().toLocaleString();
    setAuthDialogOpen(false);
    setIsAuthenticated(true);
    setUserProfile({
      name: "Guest",
      email: "guest@example.com",
      loginTime: currentTime,
      hostIP: "Fetching...",
    });
    
    // Create a mock user object for guest access
    const guestUser = {
      id: 'guest-user-' + Date.now(),
      email: 'guest@example.com',
      user_metadata: {
        full_name: 'Guest User',
        avatar_url: '/user.svg'
      },
      app_metadata: {
        provider: 'guest'
      }
    } as any; // Type assertion since this is a mock object
    
    setUser(guestUser);
  }, []);

  // Dynamic Markdown Components based on UI style
  const MarkdownComponents: Components = useMemo(
    () => ({
      h1: ({ children }) => (
        <h1
          className={`text-base lg:text-lg mb-2 lg:mb-3 text-gray-900 dark:text-gray-100 ${uiStyle === "pixel" ? "text-xs lg:text-sm font-bold pixel-font" : "font-semibold"}`}
        >
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2
          className={`text-sm lg:text-base mb-1.5 lg:mb-2 text-gray-900 dark:text-gray-100 ${uiStyle === "pixel" ? "text-xs lg:text-xs font-bold pixel-font" : "font-semibold"}`}
        >
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3
          className={`text-xs lg:text-sm mb-1.5 lg:mb-2 text-gray-900 dark:text-gray-100 ${uiStyle === "pixel" ? "text-xs lg:text-xs font-bold pixel-font" : "font-semibold"}`}
        >
          {children}
        </h3>
      ),
      p: ({ children }) => (
        <p
          className={`mb-2 lg:mb-3 last:mb-0 text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed ${uiStyle === "pixel" ? "text-xs lg:text-xs pixel-font" : ""}`}
        >
          {children}
        </p>
      ),
      ul: ({ children }) => (
        <ul
          className={`mb-2 lg:mb-3 space-y-1 text-sm lg:text-base text-gray-700 dark:text-gray-300 ${uiStyle === "pixel" ? "list-none text-xs lg:text-xs pixel-font" : "list-disc list-inside"}`}
        >
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol
          className={`mb-2 lg:mb-3 space-y-1 text-sm lg:text-base text-gray-700 dark:text-gray-300 ${uiStyle === "pixel" ? "list-none text-xs lg:text-xs pixel-font" : "list-decimal list-inside"}`}
        >
          {children}
        </ol>
      ),
      li: ({ children }) => (
        <li
          className={`text-sm lg:text-base text-gray-700 dark:text-gray-300 ${uiStyle === "pixel" ? 'text-xs lg:text-xs pixel-font before:content-["▶_"] before:text-cyan-600 dark:before:text-cyan-400' : ""}`}
        >
          {children}
        </li>
      ),
      strong: ({ children }) => (
        <strong
          className={`text-gray-900 dark:text-gray-100 ${uiStyle === "pixel" ? "font-bold pixel-font" : "font-semibold"}`}
        >
          {children}
        </strong>
      ),
      em: ({ children }) => (
        <em className={`italic text-gray-700 dark:text-gray-300 ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
          {children}
        </em>
      ),
      code: ({ children, className }) => {
        const isInline = !className?.includes("language-")
        return isInline ? (
          <code
            className={`px-1.5 py-0.5 text-xs lg:text-sm font-mono text-cyan-700 dark:text-cyan-400 ${uiStyle === "pixel"
              ? "bg-gray-300 dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 pixel-border pixel-font px-2 py-1 text-gray-900 dark:text-gray-100"
              : "bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
              }`}
          >
            {children}
          </code>
        ) : (
          <code
            className={`block p-2 lg:p-3 text-xs lg:text-sm font-mono overflow-x-auto ${uiStyle === "pixel"
              ? "bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-2 border-gray-400 dark:border-gray-600 pixel-border"
              : "bg-gray-200 dark:bg-gray-900 rounded-lg text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700"
              }`}
          >
            {children}
          </code>
        )
      },
      pre: ({ children }) => (
        <pre
          className={`p-2 lg:p-3 mb-2 lg:mb-3 overflow-x-auto ${uiStyle === "pixel"
            ? "bg-gray-200 dark:bg-gray-900 border-2 border-gray-400 dark:border-gray-600 pixel-border"
            : "bg-gray-200 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700"
            }`}
        >
          {children}
        </pre>
      ),
      blockquote: ({ children, ...props }) => (
        <blockquote
          {...props}
          className={`border-l-4 border-cyan-500 pl-3 lg:pl-4 italic mb-2 lg:mb-3 text-sm lg:text-base text-gray-600 dark:text-gray-400 ${uiStyle === "pixel" ? "pixel-font border-cyan-600 dark:border-cyan-400" : ""}`}
        >
          {children}
        </blockquote>
      ),
      a: ({ href, children }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 underline ${uiStyle === "pixel" ? "pixel-font" : ""}`}
        >
          {children}
        </a>
      ),
      table: ({ children }) => {
        // Check if this is a comparison table by looking for common comparison keywords
        const tableContent = String(children);
        const isComparison = tableContent.includes('Feature') || 
                            tableContent.includes('vs') || 
                            tableContent.includes('Comparison') ||
                            tableContent.includes('Differences');
        
        if (isComparison) {
          return (
            <div className="relative group w-full my-6">
              <div className="rounded-lg border bg-card text-card-foreground shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-3 border-b">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    📊 Comparison Overview
                  </div>
                </div>
                <Table>
                  {children}
                </Table>
              </div>
            </div>
          );
        }
        
        return (
          <div className="relative group w-full my-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <Table>
                {children}
              </Table>
            </div>
          </div>
        );
      },
      thead: ({ children }) => (
        <TableHeader>
          {children}
        </TableHeader>
      ),
      tbody: ({ children }) => (
        <TableBody>
          {children}
        </TableBody>
      ),
      tr: ({ children }) => (
        <TableRow>
          {children}
        </TableRow>
      ),
      th: ({ children }) => (
        <TableHead className="font-semibold">
          {children}
        </TableHead>
      ),
      td: ({ children }) => (
        <TableCell>
          {children}
        </TableCell>
      ),
    }),
    [uiStyle],
  )

  // Use the speech hook
  const {
    isListening,
    isSpeaking,
    voiceEnabled,
    error: speechError,
    setVoiceEnabled,
    speakMessage,
    stopSpeaking,
    startListening,
    clearError: clearSpeechError,
  } = useSpeech()

  // Stable API keys state
  const [apiKeys, setApiKeys] = useState(() => ({
    openai: "",
    claude: "",
  }))

  // Separate message states for each mode - use ref to avoid dependency issues
  const messagesByModeRef = useRef<Record<Mode, any[]>>({
    general: [],
    productivity: [],
    wellness: [],
    learning: [],
    creative: [],
    bff: [],
  })

  // Function to filter thinking content from messages
  const filterThinkingContent = useCallback((content: string): string => {
    if (!content) return content;
    
    // Remove complete thinking blocks
    let filteredContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
    
    // Also remove any remaining incomplete thinking sections at the start
    if (filteredContent.trim().startsWith('<think>')) {
      const endIndex = filteredContent.indexOf('</think>');
      if (endIndex !== -1) {
        filteredContent = filteredContent.substring(endIndex + 8);
      } else {
        // If it's an incomplete thinking section, remove everything until we find actual content
        const lines = filteredContent.split('\n');
        let startIndex = 0;
        for (let i = 0; i < lines.length; i++) {
          if (!lines[i].trim().startsWith('<think>') && lines[i].trim() !== '') {
            startIndex = i;
            break;
          }
        }
        filteredContent = lines.slice(startIndex).join('\n');
      }
    }
    
    return filteredContent.trim();
  }, []);

  // Current mode ref to avoid stale closures
  const currentModeRef = useRef<Mode>(mode)
  currentModeRef.current = mode

  // Memoize the current API key to prevent unnecessary re-renders
  const currentApiKey = useMemo(() => {
    if (!PROVIDERS[provider].requiresApiKey) return ""
    return provider === "openai" ? apiKeys.openai : provider === "claude" ? apiKeys.claude : ""
  }, [provider, apiKeys])

  // Stable chat configuration - memoized to prevent infinite loops
  const chatConfig = useMemo(
    () => ({
      api: "/api/chat",
      experimental_throttle: 50, // Throttle UI updates to prevent infinite loops
      body: {
        mode,
        provider,
        userId: user?.id, // Include user ID in the request body
        ...(PROVIDERS[provider].requiresApiKey && provider === "openai" && apiKeys.openai
          ? { apiKey: apiKeys.openai }
          : provider === "claude" && apiKeys.claude
            ? { apiKey: apiKeys.claude }
            : {}),
      },
      onError: (error: Error) => {
        console.error("Chat error details:", {
          error,
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        const errorMessage = error.message || "Failed to send message. Please try again."
        setError(errorMessage)

        // If it's an API key error, suggest setting up the API key
        if (errorMessage.includes("API configuration error") || errorMessage.includes("API key")) {
          setError(`${errorMessage} Please set up your ${PROVIDERS[provider].name} API key.`)
        }
      },
      onFinish: (message: any) => {
        setError(null)
        // Filter thinking content before speaking
        const filteredContent = filterThinkingContent(message.content);
        if (voiceEnabled && filteredContent) {
          speakMessage(filteredContent)
        }
      }
    }),
    [mode, provider, apiKeys.openai, apiKeys.claude, voiceEnabled, speakMessage, filterThinkingContent, user?.id],
  )

  const { messages: rawMessages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading, setMessages, setInput } = useChat(chatConfig)

  // Wrap handleSubmit to ensure user is authenticated
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      console.warn('Cannot submit message: User not authenticated');
      setError('Please sign in to start chatting');
      setAuthDialogOpen(true);
      return;
    }
    
    if (!input.trim()) {
      return;
    }
    
    console.log('Submitting message with user:', { userId: user.id, userEmail: user.email });
    originalHandleSubmit(e);
  }, [user, input, originalHandleSubmit]);

  // Filter thinking content from messages
  const messages = useMemo(() => {
    return rawMessages.map(msg => {
      if (msg.role === 'assistant' && msg.content) {
        return {
          ...msg,
          content: filterThinkingContent(msg.content)
        };
      }
      return msg;
    });
  }, [rawMessages, filterThinkingContent]);

  // Update messages by mode when messages change - use useCallback to prevent infinite loops
  const updateMessagesByMode = useCallback(() => {
    if (messages.length > 0) {
      messagesByModeRef.current[currentModeRef.current] = [...messages]
    }
  }, [messages])

  useEffect(() => {
    updateMessagesByMode()
  }, [updateMessagesByMode])

  // Apply theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // Load API keys from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedApiKeys = localStorage.getItem("radhika-api-keys")
      if (savedApiKeys) {
        try {
          const parsedKeys = JSON.parse(savedApiKeys)
          setApiKeys(parsedKeys)
        } catch (e) {
          console.error("Failed to parse saved API keys:", e)
        }
      }
    }
  }, [])

  // Combine errors
  const combinedError = error || speechError

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleQuickAction = useCallback(
    (action: string) => {
      setInput(action)
      setError(null)
      clearSpeechError()
    },
    [setInput, clearSpeechError],
  )

  const clearChat = useCallback(() => {
    setMessages([])
    messagesByModeRef.current[currentModeRef.current] = []
    setError(null)
    clearSpeechError()
    stopSpeaking()
  }, [setMessages, clearSpeechError, stopSpeaking])

  const handleNewChat = useCallback(() => {
    // Clear current chat state
    setMessages([])
    messagesByModeRef.current[currentModeRef.current] = []
    setError(null)
    clearSpeechError()
    stopSpeaking()
    // Clear the selected conversation
    setSelectedConversationId(undefined)
    // Clear any input text
    setInput("")
  }, [setMessages, clearSpeechError, stopSpeaking, setInput])

  const handleVoiceInput = useCallback(() => {
    startListening((transcript: string) => {
      setInput(transcript)
    })
  }, [startListening, setInput])

  // Handle mode change - load messages for the new mode
  const handleModeChange = useCallback(
    (newMode: Mode) => {
      if (newMode === mode) return // Don't update if mode hasn't changed

      // Save current messages to current mode
      messagesByModeRef.current[currentModeRef.current] = [...messages]

      // Switch to new mode
      setMode(newMode)
      setError(null)
      clearSpeechError()
      setIsMobileMenuOpen(false)

      // Set messages for new mode
      const newModeMessages = messagesByModeRef.current[newMode] || []
      setMessages(newModeMessages)
    },
    [messages, setMessages, mode, clearSpeechError],
  )

  // Handle provider change
  const handleProviderChange = useCallback(
    (newProvider: Provider) => {
      // Close the provider menu
      setIsProviderMenuOpen(false)

      // Check if API key is required and available
      if (PROVIDERS[newProvider].requiresApiKey) {
        const hasApiKey = newProvider === "openai" ? apiKeys.openai : newProvider === "claude" ? apiKeys.claude : false
        if (!hasApiKey) {
          setSelectedProvider(newProvider)
          setTempApiKey("")
          setIsApiKeyDialogOpen(true)
          return
        }
      }

      setProvider(newProvider)
      setError(null)
      clearSpeechError()
    },
    [apiKeys, clearSpeechError],
  )

  // Handle API key save
  const handleSaveApiKey = useCallback(() => {
    if (!tempApiKey.trim()) {
      setIsApiKeyDialogOpen(false)
      return
    }

    // Update API keys
    const updatedApiKeys = {
      ...apiKeys,
      [selectedProvider]: tempApiKey.trim(),
    }
    setApiKeys(updatedApiKeys)

    // Save API keys to localStorage
    localStorage.setItem("radhika-api-keys", JSON.stringify(updatedApiKeys))

    // Switch to the selected provider
    setProvider(selectedProvider)
    setError(null)
    clearSpeechError()
    setIsApiKeyDialogOpen(false)
    setTempApiKey("")
  }, [apiKeys, selectedProvider, tempApiKey, clearSpeechError])

  const currentMode = useMemo(() => MODES[mode], [mode])
  const CurrentModeIcon = currentMode.icon

  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }, [])

  // Close provider menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isProviderMenuOpen && !target.closest('[data-provider-menu="true"]')) {
        setIsProviderMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isProviderMenuOpen])

  // Fetch and set IP address
  useEffect(() => {
    let isSubscribed = true;
    const fetchIp = async () => {
      try {
        const ip = await getIpAddress();
        if (!isSubscribed) return;
        
        setSystemIp(ip);
        
        // If user is logged in, update their profile with exponential backoff
        if (user && ip) {
          let retries = 0;
          const maxRetries = 3;
          const baseDelay = 1000; // 1 second

          while (retries < maxRetries) {
            try {
              const userProfile = {
                ...user.user_metadata,
                hostIP: ip,
                loginTime: new Date().toISOString() // Use ISO string for consistency
              };
              
              const { error } = await supabase.auth.updateUser({
                data: userProfile
              });

              if (!error) break; // Success, exit retry loop
              
              if (error.status === 429) {
                // Rate limited, wait longer before retry
                const delay = baseDelay * Math.pow(2, retries);
                await new Promise(resolve => setTimeout(resolve, delay));
                retries++;
              } else {
                // Other error, log and break
                console.error('Error updating user profile:', error);
                break;
              }
            } catch (error) {
              console.error('Error in profile update:', error);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching IP:', error);
      }
    };

    fetchIp();
    return () => {
      isSubscribed = false;
    };
  }, [user]);

  // Add speech synthesis
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      toast.success("Speaking message");
    } else {
      toast.error("Text-to-speech not supported in your browser");
    }
  };

  const handleConversationSelect = useCallback(async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    const messages = await fetchConversationMessages(conversationId);
    if (messages) {
      setMessages(messages.map((msg: Message) => {
        let content = msg.content;
        
        // Handle line breaks and formatting for assistant messages
        if (msg.role === "assistant") {
          // Replace \n with actual line breaks
          content = content.replace(/\\n/g, '\n');
          // Remove any escaped characters except newlines
          content = content.replace(/\\([^n])/g, '$1');
        }

        return {
          id: msg.id,
          role: msg.role,
          content: content,
          createdAt: new Date(msg.created_at)
        };
      }));
    }
  }, [fetchConversationMessages, setMessages]);

  // Handle Get Started from Landing Page
  const handleGetStarted = useCallback(() => {
    setShowLandingPage(false)
    setAuthDialogOpen(true)
  }, [])

  // If landing page should be shown
  if (showLandingPage) {
    return <LandingPage onGetStarted={handleGetStarted} />
  }

  return (
    <div
      className={`h-screen overflow-hidden transition-colors duration-200 ${uiStyle === "pixel"
        ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pixel-font"
        : "bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
        }`}
    >
      <div className="flex h-full">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <LeftSidebar 
          uiStyle={uiStyle}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onConversationSelect={handleConversationSelect}
          selectedConversationId={selectedConversationId}
          user={user}
          loading={loading}
          onSignIn={handleGoogleLogin}
          onNewChat={handleNewChat}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div
            className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-4 ${uiStyle === "pixel"
              ? "bg-gray-50 dark:bg-gray-950 "
              : "bg-gray-50 dark:bg-gray-950 backdrop-blur-xl"
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex-shrink-0 p-1 ${uiStyle === "pixel"
                    ? "hover:bg-gray-300 dark:hover:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 pixel-border"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                >
                  <Menu className="w-4 h-4" />
                </Button>
                <div
                  className={`p-1.5 sm:p-2 flex-shrink-0 shadow-lg ${currentMode.glow} ${uiStyle === "pixel"
                    ? `${currentMode.bgPixel} ${currentMode.borderPixel} border-4 pixel-border`
                    : `rounded-lg ${currentMode.bg} ${currentMode.border} border`
                    }`}
                >
                  <CurrentModeIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${currentMode.color}`} />
                </div>
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className={`h-8 ${uiStyle === "pixel" ? "pixel-font" : ""}`}
                      >
                        <span className="font-semibold">
                          {uiStyle === "pixel" ? currentMode.label.toUpperCase() : currentMode.label}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {Object.entries(MODES).map(([key, modeData]) => {
                        const ModeIcon = modeData.icon;
                        return (
                          <DropdownMenuItem 
                            key={key}
                            onClick={() => handleModeChange(key as Mode)}
                            className="flex items-center gap-2"
                          >
                            <ModeIcon className="h-4 w-4" />
                            <span>{modeData.label}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <p className={`text-xs text-gray-600 dark:text-gray-400 truncate hidden sm:block ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
                    {currentMode.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                {/* Analytics */}
                <RightSidebar 
                  messages={messages.map(msg => ({
                    ...msg,
                    createdAt: msg.createdAt?.toString()
                  }))} 
                  currentMode={mode} 
                  uiStyle={uiStyle}
                />
                
                {/* UI Style Toggle Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUIStyle(uiStyle === "modern" ? "pixel" : "modern")}
                  className={`text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1 transition-colors ${uiStyle === "pixel"
                    ? "hover:bg-gray-300 dark:hover:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 pixel-border"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                  title={`Switch to ${uiStyle === "modern" ? "Pixel" : "Modern"} UI`}
                >
                  {uiStyle === "modern" ? <Gamepad2 className="w-3.5 h-3.5" /> : <Palette className="w-3.5 h-3.5" />}
                </Button>

                {/* Theme Toggle Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1 ${uiStyle === "pixel"
                    ? "hover:bg-gray-300 dark:hover:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 pixel-border"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                >
                  {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </Button>

                <Badge
                  variant="secondary"
                  className={`hidden sm:inline-flex ${uiStyle === "pixel"
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-2 border-gray-400 dark:border-gray-600 pixel-border pixel-font"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-cyan-500/30"
                    }`}
                >
                  <MessageCircle className="w-3 h-3 mr-2" />
                  {messages.length}
                </Badge>
                {/* <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-1 transition-colors ${voiceEnabled
                    ? "text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    } ${uiStyle === "pixel"
                      ? `border-2 pixel-border ${voiceEnabled ? "border-cyan-400 dark:border-cyan-500" : "border-gray-400 dark:border-gray-600"}`
                      : ""
                    }`}
                >
                  {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </Button> */}
                {/* <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  disabled={messages.length === 0}
                  className={`text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1 disabled:opacity-50 ${uiStyle === "pixel"
                    ? "hover:bg-gray-300 dark:hover:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 pixel-border"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button> */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-gray-800 dark:text-gray-300 transition-colors p-2 ${uiStyle === "pixel"
                    ? "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 border-2 border-gray-400 dark:border-gray-600 pixel-border"
                    : "bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                    }`}
                  asChild
                >
                  <a
                    href="https://github.com/MackDev-sudo"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View on GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative w-8 h-8 p-0">
                      <Avatar>
                        <AvatarImage src={user?.user_metadata?.avatar_url || "/user.svg"} />
                        <AvatarFallback>{(user?.user_metadata?.full_name || userProfile?.name || "G")[0]}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 p-0" align="end">
                    <div className="flex flex-col p-4 space-y-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={user?.user_metadata?.avatar_url || "/user.svg"} />
                          <AvatarFallback>{(user?.user_metadata?.full_name || userProfile?.name || "G")[0]}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="font-medium text-base">{user?.user_metadata?.full_name || userProfile?.name}</h3>
                          <p className="text-sm text-muted-foreground">{user?.email || userProfile?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {user?.app_metadata?.provider === 'github' ? (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Github className="w-3.5 h-3.5" />
                                <span>GitHub Authentication Method</span>
                              </div>
                            ) : user?.app_metadata?.provider === 'google' ? (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <FaGoogle className="w-3.5 h-3.5" />
                                <span>Google Authentication Method</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Guest</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center justify-between">
                            <span>Login Time</span>
                            <span>{userProfile?.loginTime || new Date().toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Host IP</span>
                            <span>{user?.user_metadata?.hostIP || systemIp || "Fetching..."}</span>
                          </div>
                        </div>
                      </div>

                      <DropdownMenuSeparator />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-sm font-normal"
                          onClick={() => setAboutDialogOpen(true)}
                        >
                          <Info className="w-4 h-4 mr-2" />
                          About
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-sm font-normal"
                          onClick={() => setSecurityDialogOpen(true)}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Security
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-sm font-normal"
                          onClick={() => setHelpCenterDialogOpen(true)}
                        >
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Help Center
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-sm font-normal"
                          onClick={() => setContactUsDialogOpen(true)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Us
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-sm font-normal"
                          onClick={() => setDisclaimerDialogOpen(true)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Disclaimer
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-sm font-normal">
                          <Eraser className="w-4 h-4 mr-2" />
                          Clear Memory
                        </Button>
                      </div>

                      <DropdownMenuSeparator />
                      
                      <div className="text-xs text-muted-foreground px-2">
                        <div>Version: ai.1.0.2.24062025</div>
                        <div>Code Name: Malibu</div>
                      </div>

                      <DropdownMenuSeparator />

                      <div className="pt-2">
                        <Button
                          variant="destructive"
                          className="w-full justify-center text-sm"
                          onClick={handleSignOut}
                          disabled={userProfile?.name === "Guest"}
                        >
                          Logout
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {combinedError && (
            <div
              className={`px-3 sm:px-6 py-2 ${uiStyle === "pixel"
                ? "bg-red-200 dark:bg-red-900/30 border-b-4 border-red-400 dark:border-red-600"
                : "bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800/50"
                }`}
            >
              <div className="flex items-center space-x-2 text-red-800 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className={`text-sm ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
                  {uiStyle === "pixel" ? "ERROR: " : ""}
                  {combinedError}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setError(null)
                    clearSpeechError()
                  }}
                  className={`ml-auto text-red-800 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 ${uiStyle === "pixel" ? "border-2 border-red-400 dark:border-red-600 pixel-border" : ""
                    }`}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div
            className={`flex-1 overflow-y-auto ${uiStyle === "pixel"
              ? "bg-gray-50 dark:bg-gray-950"
              : "bg-gray-50 dark:bg-gray-950 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-500 scrollbar-track-transparent"
              }`}
          >
            <div className="max-w-4xl mx-auto px-2 sm:px-6 py-3 sm:py-6">
              {messages.length === 0 && (
                <>
                  <div className="text-center py-6 sm:py-10">
                    <div className="mb-8">
                      <AIVisualization mode={mode} isActive={isLoading || isListening} />
                    </div>
                    <h3
                      className={`text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2 ${uiStyle === "pixel" ? "font-bold pixel-font" : ""
                        }`}
                    >
                      {mode === "bff"
                        ? uiStyle === "pixel"
                          ? "HEY BESTIE! WHAT'S ON YOUR MIND? 💕"
                          : "Hey bestie! What's on your mind? 💕"
                        : uiStyle === "pixel"
                          ? `WHAT CAN I HELP YOU ${mode === "general" ? "WITH" : `${mode === "creative" ? "CREATE" : mode.toUpperCase()}`}?`
                          : `What can I help you ${mode === "general" ? "with" : `${mode === "creative" ? "create" : mode}`}?`}
                    </h3>
                    <p
                      className={`text-sm sm:text-base text-gray-700 dark:text-gray-400 max-w-md mx-auto px-2 sm:px-4 ${uiStyle === "pixel" ? "pixel-font" : ""
                        }`}
                    >
                      {mode === "bff"
                        ? "I'm your GenZ bestie who speaks your language! Chat with me in any language and I'll vibe with you! ✨"
                        : `I'm your ${currentMode.label.toLowerCase()} assistant. Ask me anything or use the quick actions to get started.`}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 px-2">
                    {QUICK_ACTIONS[mode].map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action)}
                        className={`px-3 py-2 text-sm text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors ${uiStyle === "pixel"
                          ? "hover:bg-gray-300 dark:hover:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 pixel-border pixel-font"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-cyan-500/20 hover:border-gray-400 dark:hover:border-cyan-500/40"
                          }`}
                      >
                        {uiStyle === "pixel" ? `▶ ${action}` : action}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="space-y-3 sm:space-y-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex space-x-2 sm:space-x-3 ${message.role === "user" ? "justify-end" : ""}`}
                  >
                    {message.role === "assistant" && (
                      <div
                        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center shadow-lg ${currentMode.glow} ${uiStyle === "pixel"
                          ? `${currentMode.bgPixel} ${currentMode.borderPixel} border-4 pixel-border`
                          : `rounded-lg ${currentMode.bg} ${currentMode.border} border`
                          }`}
                      >
                        <CurrentModeIcon className={`w-5 h-5 ${currentMode.color}`} />
                      </div>
                    )}
                    <div
                      className={`flex-1 max-w-[80%] sm:max-w-[85%] ${message.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}`}
                    >
                      <div
                        className={`px-3 py-2 ${uiStyle === "pixel" ? "border-2" : "rounded-2xl"} ${
                          message.role === "user"
                            ? `bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100`
                            : "bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {message.role === "user" ? (
                          <div className={`text-sm break-words ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
                            {message.content}
                          </div>
                        ) : (
                          <>
                            <div className={`prose prose-sm max-w-none dark:prose-invert ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
                              <ReactMarkdown 
                                components={MarkdownComponents}
                                remarkPlugins={[remarkGfm]}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                            <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => toast.success("Response liked")}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => toast.success("Response disliked")}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => handleCopyMessage(message.content)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => handleDownloadMessage(message.content)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setTextToSpeak(message.content);
                                  speak(message.content);
                                }}
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => handleShareMessage(message.content)}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      <div
                        className={`text-[10px] sm:text-xs text-gray-600 dark:text-gray-500 mt-0.5 sm:mt-1 ${message.role === "user" ? "text-right" : "text-left"
                          } ${uiStyle === "pixel" ? "pixel-font" : ""}`}
                      >
                        {uiStyle === "pixel" ? "[" : ""}
                        {formatTime(message.createdAt ? (typeof message.createdAt === 'string' ? new Date(message.createdAt).getTime() : message.createdAt.getTime()) : Date.now())}
                        {uiStyle === "pixel" ? "]" : ""}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="flex-shrink-0">
                        <Avatar className={`w-8 h-8 ${uiStyle === "pixel" ? "pixel-border border-2 border-cyan-400 dark:border-cyan-600" : "rounded-lg shadow-lg"}`}>
                          {user?.user_metadata?.avatar_url ? (
                            <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name || user.email} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-600">
                              <User className="w-5 h-5 text-white" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {isLoading && (
                <div className="flex space-x-2 sm:space-x-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 flex items-center justify-center shadow-lg ${currentMode.glow} ${uiStyle === "pixel"
                      ? `${currentMode.bgPixel} ${currentMode.borderPixel} border-4 pixel-border`
                      : `rounded-lg ${currentMode.bg} ${currentMode.border} border`
                      }`}
                  >
                    <CurrentModeIcon className={`w-5 h-5 ${currentMode.color} animate-pulse`} />
                  </div>
                  <div className="flex-1">
                    <div
                      className={`px-3 py-2 ${uiStyle === "pixel"
                        ? "bg-white dark:bg-gray-800 border-4 border-gray-400 dark:border-gray-600 pixel-border"
                        : "bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl"
                        }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div
                            className={`bg-cyan-600 dark:bg-cyan-400 animate-bounce ${uiStyle === "pixel" ? "w-2 h-2 pixel-border" : "w-1.5 h-1.5 rounded-full"
                              }`}
                          />
                          <div
                            className={`bg-cyan-600 dark:bg-cyan-400 animate-bounce ${uiStyle === "pixel" ? "w-2 h-2 pixel-border" : "w-1.5 h-1.5 rounded-full"
                              }`}
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className={`bg-cyan-600 dark:bg-cyan-400 animate-bounce ${uiStyle === "pixel" ? "w-2 h-2 pixel-border" : "w-1.5 h-1.5 rounded-full"
                              }`}
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                        <span
                          className={`text-xs text-gray-700 dark:text-gray-400 ${uiStyle === "pixel" ? "pixel-font" : ""}`}
                        >
                          {uiStyle === "pixel" ? "OneAI IS PROCESSING..." : "OneAI is thinking..."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className={`flex-shrink-0 p-2 sm:p-4 ${uiStyle === "pixel"
              ? "bg-gray-50 dark:bg-gray-800 border-t-4 border-gray-400 dark:border-gray-600"
              : "bg-gray-50 dark:bg-gray-900/95 backdrop-blur-xl"
              }`}
          >
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder={!user ? "Please sign in to start chatting" : (uiStyle === "pixel" ? `> ${currentMode.placeholder}` : currentMode.placeholder)}
                  disabled={!user}
                  className={`min-h-[50px] sm:min-h-[60px] max-h-32 resize-none text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-500 focus:ring-0 pr-20 sm:pr-24 text-base sm:text-lg leading-relaxed ${!user ? "opacity-50 cursor-not-allowed" : ""} ${uiStyle === "pixel"
                    ? "bg-gray-300 dark:bg-gray-900 border-4 border-gray-400 dark:border-gray-600 focus:border-cyan-500 dark:focus:border-cyan-400 pixel-font pixel-border"
                    : "bg-white/95 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-700/50 focus:border-cyan-500/50"
                    }`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      if (user) {
                        handleSubmit(e as any)
                      }
                    }
                  }}
                />
                <div className="absolute right-1.5 bottom-1.5 flex items-center space-x-1">
                  {isSpeaking && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={stopSpeaking}
                      className={`text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 ${uiStyle === "pixel"
                        ? "hover:bg-red-200 dark:hover:bg-red-900/30 border-2 border-red-400 dark:border-red-600 pixel-border"
                        : "hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl"
                        }`}
                    >
                      <VolumeX className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleVoiceInput}
                    className={`p-2 transition-all duration-200 ${isListening
                      ? `text-red-700 dark:text-red-400 animate-pulse ${uiStyle === "pixel"
                        ? "bg-red-200 dark:bg-red-900/30 hover:bg-red-300 dark:hover:bg-red-800/40 border-4 border-red-400 dark:border-red-600 pixel-border"
                        : "bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl"
                      }`
                      : `text-gray-600 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 ${uiStyle === "pixel"
                        ? "hover:bg-gray-300 dark:hover:bg-gray-700 border-4 border-gray-400 dark:border-gray-600 pixel-border"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl"
                      }`
                      }`}
                    disabled={isLoading}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !input.trim()}
                    className={`bg-gradient-to-r ${currentMode.gradient} hover:opacity-90 text-white p-2 shadow-lg ${currentMode.glow} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl ${uiStyle === "pixel" ? `border-4 ${currentMode.borderPixel} pixel-border` : "rounded-xl"
                      }`}
                  >
                    <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </form>

              {/* Model selector */}
              <div
                className={`flex items-center justify-between mt-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-500 ${uiStyle === "pixel" ? "pixel-font" : ""
                  }`}
              >
                <span className="hidden sm:inline">
                  {uiStyle === "pixel"
                    ? "[ENTER] = SEND | [SHIFT+ENTER] = NEW LINE"
                    : "Press Enter to send, Shift+Enter for new line"}
                </span>
                <span className="sm:hidden">{uiStyle === "pixel" ? "[TAP TO SEND]" : "Tap to send"}</span>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className={`${currentMode.color} font-medium ${uiStyle === "pixel" ? "font-bold" : ""}`}>
                      {uiStyle === "pixel" ? currentMode.label.toUpperCase() : currentMode.label}
                    </span>
                  </div>

                  <div
                    className={`flex items-center space-x-2 pl-3 ${uiStyle === "pixel"
                      ? "border-l-2 border-gray-400 dark:border-gray-600"
                      : "border-l border-gray-300 dark:border-gray-700"
                      }`}
                  >
                    <Cpu className="w-3 h-3 text-gray-600 dark:text-gray-400" />

                    {/* Custom Provider Dropdown */}
                    <div className="relative" data-provider-menu="true">
                      <button
                        onClick={() => setIsProviderMenuOpen(!isProviderMenuOpen)}
                        className={`h-6 px-2 text-xs flex items-center gap-1 font-medium transition-colors ${uiStyle === "pixel"
                          ? "hover:bg-gray-300 dark:hover:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 pixel-border font-bold"
                          : "rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                      >
                        <span
                          className={`${provider === "groq"
                            ? "text-pink-700 dark:text-pink-400"
                            : provider === "gemini"
                              ? "text-emerald-700 dark:text-emerald-400"
                              : provider === "openai"
                                ? "text-violet-700 dark:text-violet-400"
                                : "text-orange-700 dark:text-orange-400"
                            }`}
                        >
                          {uiStyle === "pixel" ? PROVIDERS[provider].name.toUpperCase() : PROVIDERS[provider].name}
                        </span>
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {isProviderMenuOpen && (
                        <div
                          className={`absolute right-0 bottom-full mb-1 w-40 py-1 z-50 ${uiStyle === "pixel"
                            ? "bg-gray-200 dark:bg-gray-800 border-4 border-gray-400 dark:border-gray-600 pixel-border"
                            : "bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700"
                            }`}
                        >
                          {Object.entries(PROVIDERS).map(([key, providerData]) => (
                            <button
                              key={key}
                              onClick={() => handleProviderChange(key as Provider)}
                              className={`flex items-center justify-between w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${uiStyle === "pixel" ? "pixel-font" : ""
                                }`}
                            >
                              <span className={`${key === provider ? "font-medium" : ""}`}>
                                {uiStyle === "pixel" ? providerData.name.toUpperCase() : providerData.name}
                              </span>
                              {key === provider ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                providerData.requiresApiKey &&
                                ((key === "openai" && !apiKeys.openai) || (key === "claude" && !apiKeys.claude)) && (
                                  <Key className="w-3 h-3 text-gray-400" />
                                )
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Dialog */}
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent
          className={`w-[calc(100%-2rem)] max-w-md sm:w-full sm:mx-auto px-4 py-6 sm:px-6 sm:py-8 ${uiStyle === "pixel"
              ? "bg-gray-200 dark:bg-gray-800 border-4 border-gray-400 dark:border-gray-600 pixel-border rounded-none"
              : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
            }`}
        >
          <DialogHeader>
            <DialogTitle
              className={`text-gray-900 dark:text-gray-100 ${uiStyle === "pixel" ? "pixel-font font-bold" : ""}`}
            >
              {uiStyle === "pixel"
                ? `${PROVIDERS[selectedProvider]?.name.toUpperCase()} API KEY REQUIRED`
                : `Enter ${PROVIDERS[selectedProvider]?.name} API Key`}
            </DialogTitle>
            <DialogDescription
              className={`text-gray-600 dark:text-gray-400 ${uiStyle === "pixel" ? "pixel-font" : ""}`}
            >
              To use {PROVIDERS[selectedProvider]?.name}, please enter your API key. It will be stored securely in your
              browser.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="api-key"
                className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${uiStyle === "pixel" ? "font-bold pixel-font" : ""
                  }`}
              >
                {uiStyle === "pixel"
                  ? `${PROVIDERS[selectedProvider]?.name.toUpperCase()} API KEY`
                  : `${PROVIDERS[selectedProvider]?.name} API Key`}
              </label>
              <Input
                id="api-key"
                type="password"
                placeholder={`Enter your ${PROVIDERS[selectedProvider]?.name} API key`}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className={`text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${uiStyle === "pixel"
                  ? "bg-gray-100 dark:bg-gray-900 border-4 border-gray-400 dark:border-gray-600 pixel-font pixel-border"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSaveApiKey()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setIsApiKeyDialogOpen(false)}
              className={`text-gray-900 dark:text-gray-100 ${uiStyle === "pixel"
                ? "border-4 border-gray-400 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 pixel-font pixel-border"
                : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              {uiStyle === "pixel" ? "CANCEL" : "Cancel"}
            </Button>
            <Button
              onClick={handleSaveApiKey}
              disabled={!tempApiKey.trim()}
              className={`text-white ${uiStyle === "pixel"
                ? "bg-cyan-600 hover:bg-cyan-700 pixel-font font-bold border-4 border-cyan-400 pixel-border"
                : "bg-cyan-600 hover:bg-cyan-700"
                }`}
            >
              {uiStyle === "pixel" ? "SAVE & SWITCH" : "Save & Switch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Authentication Dialog */}
      <Dialog open={authDialogOpen} onOpenChange={() => {}}>
        <DialogContent className={`w-[calc(100%-2rem)] max-w-md sm:w-full sm:mx-auto px-4 py-6 sm:px-6 sm:py-8 ${
    uiStyle === "pixel"
      ? "bg-gray-200 dark:bg-gray-800 border-4 border-gray-400 dark:border-gray-600 pixel-border rounded-none"
      : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
  }`}>
    <DialogHeader>
      <DialogTitle className={`text-gray-900 dark:text-gray-100 ${uiStyle === "pixel" ? "pixel-font font-bold" : ""}`}>
        {uiStyle === "pixel" ? "WELCOME TO OneAI" : "Welcome to ONE.ai"}
      </DialogTitle>
      <DialogDescription className={`text-gray-600 dark:text-gray-400 ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
        Please select a login method to continue
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-6">
      <Button
        onClick={handleGoogleLogin}
        className={`w-full flex items-center justify-center gap-2 ${uiStyle === "pixel" 
          ? "bg-cyan-600 hover:bg-cyan-700 text-white pixel-font font-bold border-4 border-cyan-400 pixel-border"
          : "bg-cyan-600 hover:bg-cyan-700 text-white"}`}
      >
        {uiStyle !== "pixel" && <FaGoogle className="w-5 h-5" />}
        {uiStyle === "pixel" ? "LOGIN WITH GOOGLE" : "Login with Google"}
      </Button>

      <Button
        onClick={handleGithubLogin}
        className={`w-full flex items-center justify-center gap-2 ${uiStyle === "pixel" 
          ? "bg-cyan-600 hover:bg-cyan-700 text-white pixel-font font-bold border-4 border-cyan-400 pixel-border"
          : "bg-cyan-600 hover:bg-cyan-700 text-white"}`}
      >
        {uiStyle !== "pixel" && <Github className="w-5 h-5" />}
        {uiStyle === "pixel" ? "LOGIN WITH GITHUB" : "Login with GitHub"}
      </Button>
      
      <div className={`relative ${uiStyle === "pixel" ? "my-8" : "my-6"}`}>
        <div className="absolute inset-0 flex items-center">
          <span className={`w-full border-t ${
            uiStyle === "pixel" 
              ? "border-gray-400 dark:border-gray-600 border-2" 
              : "border-gray-300 dark:border-gray-700"
          }`} />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className={`px-2 ${
            uiStyle === "pixel"
              ? "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 pixel-font"
              : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400"
          }`}>Or</span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleGuestAccess}
        className={`w-full ${uiStyle === "pixel"
          ? "border-4 border-gray-400 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 pixel-font pixel-border"
          : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        {uiStyle === "pixel" ? "CONTINUE AS GUEST" : "Continue as Guest"}
      </Button>
    </div>

    <div className={`mt-4 space-y-4 ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
      <div className="text-center">
        <Button
          variant="link"
          className={`${uiStyle === "pixel"
            ? "text-cyan-600 dark:text-cyan-400 pixel-font"
            : "text-cyan-600 dark:text-cyan-400"
          }`}
          onClick={() => setShowLandingPage(true)}
        >
          {uiStyle === "pixel" ? "LEARN MORE" : "Learn More"}
        </Button>
      </div>
      
      <p className={`text-xs text-center text-gray-500 dark:text-gray-400 ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
        By continuing, you agree to our{' '}
        <a href="#" className="underline hover:text-cyan-600">Terms of Service</a>{' '}
        and{' '}
        <a href="#" className="underline hover:text-cyan-600">Privacy Policy</a>
      </p>
      
      <p className={`text-xs text-center text-gray-500 dark:text-gray-400 ${uiStyle === "pixel" ? "pixel-font" : ""}`}>
        © 2025 Mackdev Inc. All rights reserved. 
      </p>
    </div>
  </DialogContent>
</Dialog>

      {/* About Dialog */}
      <About 
        open={aboutDialogOpen} 
        onOpenChange={setAboutDialogOpen}
        uiStyle={uiStyle}
      />

      {/* Security Dialog */}
      <Security 
        open={securityDialogOpen} 
        onOpenChange={setSecurityDialogOpen}
        uiStyle={uiStyle}
      />

      {/* Disclaimer Dialog */}
      <Disclaimer 
        open={disclaimerDialogOpen} 
        onOpenChange={setDisclaimerDialogOpen}
        uiStyle={uiStyle}
      />

      {/* Contact Us Dialog */}
      <ContactUs 
        open={contactUsDialogOpen} 
        onOpenChange={setContactUsDialogOpen}
        uiStyle={uiStyle}
      />

      {/* Help Center Dialog */}
      <HelpCenter 
        open={helpCenterDialogOpen} 
        onOpenChange={setHelpCenterDialogOpen}
        uiStyle={uiStyle}
      />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .pixel-font {
          font-family: 'Press Start 2P', 'Courier New', monospace;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        
        .pixel-border {
          border-style: solid;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        
        /* Remove all rounded corners for pixel perfect look */
        .pixel-font * {
          border-radius: 0 !important;
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-gray-400 {
          scrollbar-color: #9ca3af transparent;
        }
        .dark .scrollbar-thumb-gray-500 {
          scrollbar-color: #6b7280 transparent;
        }
        .scrollbar-track-transparent {
          scrollbar-track-color: transparent;
        }
        
        /* Webkit scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 2px;
          height: 2px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #9ca3af;
          border-radius: 1px;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #6b7280;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #6b7280;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        
        /* Pixel button effects */
        .pixel-font button:active {
          transform: translateY(2px);
        }
        
        /* Remove focus rings and add pixel borders */
        .pixel-font *:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        
        /* Pixel-perfect animations */
        @keyframes pixelBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        
        .pixel-font .animate-bounce {
          animation: pixelBounce 1s infinite;
        }
      `}</style>
    </div>
  )
}
