"use client"

import { useEffect, useRef, useState } from "react"
import { User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { AIVisualization } from "@/components/ai-visualization"
import type { Components } from "react-markdown"
import { formatAssistantMessage, type FormattedSection } from "@/lib/message-formatter"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { ThumbsUp, ThumbsDown, Copy, Download, Volume2, Share, CheckCheck } from "lucide-react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CopyButton({ content, className = "" }: { content: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast({
        description: "Copied to clipboard!",
        duration: 2000
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy to clipboard",
        duration: 2000
      })
    }
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className={`opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 h-8 w-8 ${className}`}
      onClick={copyToClipboard}
    >
      {copied ? (
        <CheckCheck className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )
}

const MarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-semibold mb-4 text-foreground">{children}</h1>
  ),
  h2: ({ children }) => {
    const content = String(children);
    const isSpecialSection = content.includes('📊') || content.includes('✅') || content.includes('⚖️');
    
    return (
      <h2 className={`text-lg font-semibold mb-4 text-foreground flex items-center gap-2 ${
        isSpecialSection ? 'border-l-4 border-primary pl-4 bg-gradient-to-r from-primary/5 to-transparent py-2 rounded-r-lg' : ''
      }`}>
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const content = String(children);
    const isProsCons = content.includes('✅') || content.includes('⚖️');
    
    if (isProsCons) {
      return (
        <div className="my-6 p-4 bg-gradient-to-r from-green-50 to-red-50 dark:from-green-950/50 dark:to-red-950/50 rounded-lg border border-border">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
            {children}
          </h3>
        </div>
      );
    }
    
    return (
      <h3 className="text-base font-semibold mb-3 text-foreground flex items-center gap-2">
        {children}
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="text-base text-muted-foreground leading-relaxed mb-4">{children}</p>
  ),
  img: ({ src, alt, title }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const imageSrc = typeof src === 'string' ? src : '';
    
    return (
      <div className="my-4 group relative">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="flex items-center justify-center h-48 bg-muted animate-pulse">
              <div className="text-muted-foreground text-sm">Loading image...</div>
            </div>
          )}
          {imageError && (
            <div className="flex items-center justify-center h-48 bg-muted">
              <div className="text-muted-foreground text-sm">Failed to load image</div>
            </div>
          )}
          {imageSrc && (
            <img
              src={imageSrc}
              alt={alt || "Image"}
              title={title}
              className={`w-full h-auto max-w-full object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => {
                setImageLoaded(true);
                setImageError(false);
              }}
              onError={() => {
                setImageError(true);
                setImageLoaded(false);
              }}
              style={{ 
                maxHeight: '400px',
                display: imageLoaded ? 'block' : 'none'
              }}
            />
          )}
          {alt && imageLoaded && (
            <div className="px-3 py-2 bg-muted/50 border-t">
              <p className="text-sm text-muted-foreground">{alt}</p>
            </div>
          )}
        </div>
        {imageSrc && imageLoaded && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 px-2 text-xs"
              onClick={() => window.open(imageSrc, '_blank')}
            >
              Open
            </Button>
            <CopyButton 
              content={imageSrc} 
              className="!relative !right-0 !top-0 !transform-none h-8 w-8"
            />
          </div>
        )}
      </div>
    );
  },
  ul: ({ children }) => {
    const content = String(children);
    const isProsCons = content.includes('✅') || content.includes('❌');
    
    return (
      <div className="relative group">
        <ul className={`space-y-2 mb-4 text-muted-foreground ${
          isProsCons ? 'list-none' : 'list-disc list-inside'
        }`}>
          {children}
        </ul>
        {/* Only show copy button if list contains more than 2 items */}
        {Array.isArray(children) && children.length > 2 && (
          <CopyButton 
            content={String(children)
              .replace(/<[^>]*>/g, '')
              .trim()} 
          />
        )}
      </div>
    );
  },
  li: ({ children }) => {
    const content = String(children);
    const isProsCons = content.includes('✅') || content.includes('❌');
    
    return (
      <li className={`text-base leading-relaxed ${
        isProsCons 
          ? 'flex items-start gap-2 py-1 px-3 rounded-md hover:bg-muted/50 transition-colors' 
          : 'list-item'
      }`}>
        {children}
      </li>
    );
  },
  table: ({ children }) => {
    // Check if this is a comparison table by looking for common comparison keywords
    const tableContent = String(children);
    const isComparison = tableContent.includes('Feature') || 
                        tableContent.includes('vs') || 
                        tableContent.includes('Comparison') ||
                        tableContent.includes('Differences');
    
    if (isComparison) {
      return <ComparisonTable>{children}</ComparisonTable>;
    }
    
    return (
      <div className="relative group w-full my-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <Table>
            {children}
          </Table>
        </div>
        <CopyButton 
          content={String(children)
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim()} 
        />
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
  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const isInline = !className?.includes('language-');
    
    return !isInline ? (
      <div className="relative group rounded-lg overflow-hidden my-4 bg-[#1E1E1E]">
        <div className="absolute right-2 top-2 z-10">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 hover:bg-muted/50 text-muted-foreground hover:text-foreground rounded-md px-2 py-1 text-xs flex items-center gap-1.5"
            onClick={() => navigator.clipboard.writeText(String(children))}
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy code</span>
          </Button>
        </div>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus as any}
          PreTag="div"
          className="text-sm !bg-[#1E1E1E] !m-0"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className="bg-muted rounded px-1 py-0.5 font-mono text-sm">
        {children}
      </code>
    );
  },
  a: ({ href, children }) => {
    const isEmail = href?.startsWith('mailto:');
    
    return (
      <span className="relative group inline-block">
        <a 
          href={href}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
        {isEmail && (
          <CopyButton 
            content={String(children)} 
            className="!absolute !right-0 !top-0 transform translate-x-full -translate-y-1/2"
          />
        )}
      </span>
    );
  },
  blockquote: ({ children }) => (
    <div className="relative group">
      <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">
        {children}
      </blockquote>
      <CopyButton content={String(children)} />
    </div>
  ),
  pre: ({ children }) => {
    const content = String(children);
    const isCommand = content.includes('$') || content.includes('>');
    
    return isCommand ? (
      <div className="relative group">
        <pre className="bg-secondary text-secondary-foreground rounded-lg p-4 my-4 overflow-x-auto font-mono">
          {children}
        </pre>
        <CopyButton 
          content={content.replace(/^\$\s+/gm, '').replace(/^>\s+/gm, '')} 
          className="!bg-secondary/80 hover:!bg-secondary"
        />
      </div>
    ) : (
      <pre>{children}</pre>
    );
  },
}

// Custom component for enhanced comparison tables
function ComparisonTable({ children }: { children: React.ReactNode }) {
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
      <CopyButton 
        content={String(children)
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim()} 
      />
    </div>
  );
}

// Custom component for pros and cons sections
function ProsConsSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 p-4 bg-gradient-to-r from-green-50 to-red-50 dark:from-green-950/50 dark:to-red-950/50 rounded-lg border border-border">
      <div className="text-sm font-semibold mb-3 flex items-center gap-2">
        ⚖️ Pros and Cons
      </div>
      {children}
    </div>
  );
}

interface ChatMessagesProps {
  messages: any[]
  currentMode: any
  mode: string
  isLoading: boolean
  isListening: boolean
  quickActions: string[]
  onQuickAction: (action: string) => void
  user?: any
}

export function ChatMessages({
  messages,
  currentMode,
  mode,
  isLoading,
  isListening,
  quickActions,
  onQuickAction,
  user,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const CurrentModeIcon = currentMode.icon
  const { toast } = useToast()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content)
    toast({
      description: "Response copied to clipboard",
      duration: 2000,
    })
  }

  const handleDownload = (content: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "response.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast({
      description: "Response downloaded as text file",
      duration: 2000,
    })
  }

  const handleSpeak = (content: string) => {
    const utterance = new SpeechSynthesisUtterance(content)
    window.speechSynthesis.speak(utterance)
    toast({
      description: "Speaking response...",
      duration: 2000,
    })
  }

  const handleShare = async (content: string) => {
    try {
      await navigator.share({
        text: content,
      })
    } catch (error) {
      toast({
        description: "Sharing not supported on this device",
        duration: 2000,
      })
    }
  }

  function MessageSection({ section, index }: { section: FormattedSection; index: number }) {
  switch (section.type) {
    case 'heading':
      const headingClasses = `font-semibold mb-${section.headingLevel || 2} text-${section.headingLevel ? 24-(section.headingLevel*2) : 20}px`;
      switch (section.headingLevel) {
        case 1: return <h1 className={headingClasses}>{section.content}</h1>;
        case 2: return <h2 className={headingClasses}>{section.content}</h2>;
        case 3: return <h3 className={headingClasses}>{section.content}</h3>;
        case 4: return <h4 className={headingClasses}>{section.content}</h4>;
        case 5: return <h5 className={headingClasses}>{section.content}</h5>;
        case 6: return <h6 className={headingClasses}>{section.content}</h6>;
        default: return <h2 className={headingClasses}>{section.content}</h2>;
      }

      case 'comparison':
        return (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  {section.columns?.map((col, i) => (
                    <th key={i} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-left font-semibold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Render comparison content */}
              </tbody>
            </table>
          </div>
        );

      case 'json':
        return (
          <div className="my-4">
            <SyntaxHighlighter
              language="json"
              style={vscDarkPlus}
              className="rounded-lg text-sm"
            >
              {JSON.stringify(JSON.parse(section.content), null, 2)}
            </SyntaxHighlighter>
          </div>
        );

      case 'html':
        return (
          <div 
            className="my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        );

      case 'numbered-list':
        return (
          <ol className="list-decimal list-inside space-y-2 my-4">
            {section.content.split('\n').filter(Boolean).map((item, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">
                {item.replace(/^\d+\.\s/, '')}
              </li>
            ))}
          </ol>
        );

      case "emoji-section":
        return (
          <div key={index} className="flex items-start gap-3 border-l-4 border-cyan-500 dark:border-cyan-600 pl-4 my-6">
            <span className="text-2xl leading-none">{section.emoji}</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                {section.content}
              </h3>
              {section.metadata?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {section.metadata.description}
                </p>
              )}
            </div>
            {section.metadata?.highlight && (
              <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-600"></div>
            )}
          </div>
        )
      case "table":
        return (
          <div key={index} className="w-full overflow-x-auto my-4">
            <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <ReactMarkdown components={MarkdownComponents}>{section.content}</ReactMarkdown>
            </div>
          </div>
        )
      case "list":
        return (
          <div key={index} className="space-y-2">
            <ReactMarkdown components={MarkdownComponents}>{section.content}</ReactMarkdown>
          </div>
        )
      case "code-example":
        return (
          <div key={index} className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4">
              {section.metadata?.title && (
                <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  {section.metadata.title}
                </h4>
              )}
              {section.metadata?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {section.metadata.description}
                </p>
              )}
              <div className="relative">
                <SyntaxHighlighter
                  language={section.language || 'c'}
                  style={vscDarkPlus as any}
                  className="rounded-lg text-sm"
                >
                  {section.content}
                </SyntaxHighlighter>
                <button
                  onClick={() => handleCopy(section.content)}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            {section.metadata?.explanation && (
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800/30 dark:to-gray-800/30 border-t border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Code Explanation:
                </h5>
                <div className="text-sm text-gray-700 dark:text-gray-300 prose-sm">
                  <ReactMarkdown components={MarkdownComponents}>
                    {section.metadata.explanation}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )


      case "code-block":
        return (
          <div className="relative my-4">
            <div className="absolute right-2 top-2 z-10">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 hover:bg-gray-700/50 text-gray-400 hover:text-gray-300 rounded-md px-2 py-1 text-xs flex items-center gap-1.5"
                onClick={() => handleCopy(section.content)}
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy code</span>
              </Button>
            </div>
            <SyntaxHighlighter
              language={section.language || 'cpp'}
              style={vscDarkPlus as any}
              className="rounded-lg text-sm !bg-[#1E1E1E] !m-0"
            >
              {section.content}
            </SyntaxHighlighter>
          </div>
        );
      default:
        return (
          <div key={index} className="text-gray-700 dark:text-gray-300">
            <ReactMarkdown components={MarkdownComponents}>{section.content}</ReactMarkdown>
          </div>
        )
    }
  }

  function MessageContent({ message, isLoading }: { message: any; isLoading: boolean }) {
    if (message.role === "assistant") {
      const formattedSections = formatAssistantMessage(message.content);
      
      return (      <div className="max-w-none text-base leading-relaxed space-y-4">
        {formattedSections.map((section, index) => (
          <MessageSection key={index} section={section} index={index} />
        ))}
      </div>
      )
    }

    return (
      <div className="max-w-none text-base leading-relaxed text-gray-700 dark:text-gray-300">
        <ReactMarkdown components={MarkdownComponents}>{message.content}</ReactMarkdown>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-500 scrollbar-track-transparent">
      <div className="max-w-4xl mx-auto px-2 sm:px-6 py-3 sm:py-6">
        {messages.length === 0 && (
          <>
            <div className="text-center py-6 sm:py-10">
              <div className="mb-8">
                <AIVisualization mode={mode} isActive={isLoading || isListening} />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {mode === "bff"
                  ? "Hey bestie! What's on your mind? 💕"
                  : `What can I help you ${mode === "general" ? "with" : `${mode === "creative" ? "create" : mode}`}?`}
              </h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400 max-w-md mx-auto px-2 sm:px-4">
                {mode === "bff"
                  ? "I'm your GenZ bestie who speaks your language! Chat with me in any language and I'll vibe with you! ✨"
                  : `I'm your ${currentMode.label.toLowerCase()} assistant. Ask me anything or use the quick actions to get started.`}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 px-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => onQuickAction(action)}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors border border-gray-300 dark:border-cyan-500/20 hover:border-gray-400 dark:hover:border-cyan-500/40"
                >
                  {action}
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
                  className={`flex-shrink-0 w-8 h-8 rounded-lg ${currentMode.bg} ${currentMode.border} border flex items-center justify-center shadow-lg ${currentMode.glow}`}
                >
                  <CurrentModeIcon className={`w-5 h-5 ${currentMode.color}`} />
                </div>
              )}
              <div
                className={`flex-1 max-w-[80%] sm:max-w-[85%] ${message.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl ${
                    message.role === "user"
                      ? "bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                      : "bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {message.role === "user" ? (
                    <div className="text-sm break-words">{message.content}</div>
                  ) : (
                    <MessageContent message={message} isLoading={isLoading} />
                  )}
                </div>
                <div
                  className={`text-[10px] sm:text-xs text-gray-600 dark:text-gray-500 mt-0.5 sm:mt-1 ${message.role === "user" ? "text-right" : "text-left"}`}
                >
                  {formatTime(message.createdAt ? new Date(message.createdAt).getTime() : Date.now())}
                </div>
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0">
                  <Avatar className="w-8 h-8 rounded-lg shadow-lg">
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
              className={`flex-shrink-0 w-8 h-8 rounded-lg ${currentMode.bg} ${currentMode.border} border flex items-center justify-center shadow-lg ${currentMode.glow}`}
            >
              <CurrentModeIcon className={`w-5 h-5 ${currentMode.color} animate-pulse`} />
            </div>
            <div className="flex-1">
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 px-3 py-2 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-cyan-600 dark:bg-cyan-400 rounded-full animate-bounce" />
                    <div
                      className="w-1.5 h-1.5 bg-cyan-600 dark:bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-cyan-600 dark:bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-400">ONE.ai is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div ref={messagesEndRef} />
    </div>
  )
}
