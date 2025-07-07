"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  HelpCircle,
  Search,
  Brain,
  Mic,
  Settings,
  Shield,
  MessageSquare,
  Lightbulb,
  Users,
  Globe,
  Zap,
  Play,
  BookOpen,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info,
  Youtube,
  Github
} from "lucide-react"
import { useState } from "react"

interface HelpCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uiStyle?: "modern" | "pixel"
}

export function HelpCenter({ open, onOpenChange, uiStyle = "modern" }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)

  const helpCategories = [
    {
      icon: Users,
      title: "Sign Up & Guest Mode",
      description: "Account options and authentication methods",
      content: "ONE.AI offers flexible access options. Guest Mode allows immediate use without registration - no data is saved but full AI features are available. Signed accounts (Google/GitHub) enable conversation history, data export, custom settings, and full privacy controls. Choose Guest for privacy, Account for persistence.",
      articles: [
        "Guest Mode: Complete privacy, no data storage, instant access",
        "Google Sign-up: One-click authentication, secure login",
        "GitHub Sign-up: Developer-friendly authentication", 
        "Data Persistence: Signed accounts save all conversations",
        "Account Benefits: Export data, custom themes, full features",
        "Privacy Trade-offs: Guest vs Account comparison"
      ]
    },
    {
      icon: Brain,
      title: "AI Modes & Usage",
      description: "6 specialized AI modes for different needs",
      content: "Each mode optimizes AI behavior for specific tasks. General Mode handles everyday conversations. Productivity Mode focuses on work efficiency, planning, and professional tasks. Creative Mode excels at writing, brainstorming, and artistic projects. Wellness Mode provides health, fitness, and mental well-being guidance. Learning Mode offers educational content and skill development. BFF Mode creates casual, friendly conversations.",
      articles: [
        "General Mode: Everyday Q&A, general assistance, balanced responses",
        "Productivity Mode: Task planning, work optimization, professional help",
        "Creative Mode: Writing assistance, brainstorming, artistic content",
        "Wellness Mode: Health tips, mental wellness, fitness guidance",
        "Learning Mode: Educational content, skill building, explanations",
        "BFF Mode: Casual chat, friendly tone, relaxed conversations"
      ]
    },
    {
      icon: Settings,
      title: "AI Features & Configuration",
      description: "Advanced AI capabilities and customization",
      content: "ONE.AI supports multiple AI providers (Groq, Gemini, OpenAI, Claude) with automatic switching. Bring Your Own Key allows premium access with personal API keys for OpenAI and Claude. Web Search integration provides real-time internet data. Image and document analysis enable visual and text processing with AI insights.",
      articles: [
        "AI Model Selector: Switch between Groq, Gemini, OpenAI, Claude",
        "Custom API Keys: Use your OpenAI/Claude keys for premium access",
        "Web Search: Real-time internet integration for current info",
        "Image Analysis: Upload photos for AI visual understanding",
        "Document Processing: Analyze PDFs and text files",
        "Response Enhancement: Advanced AI processing algorithms"
      ]
    },
    {
      icon: Globe,
      title: "Vision & Web Search",
      description: "Visual content and internet search capabilities",
      content: "Vision features enable image analysis and web-based visual search. Upload images (JPG, PNG, GIF, WebP under 10MB) for AI analysis. Web search provides current information and can fetch relevant images. Use keywords like 'show me images of', 'search web for', or 'analyze this image' to trigger visual features.",
      articles: [
        "Image Upload: Drag & drop or click to upload visual content",
        "Visual Analysis: AI describes, analyzes, and explains images",
        "Web Image Search: Find and display relevant online images",
        "Search Keywords: 'show images', 'web search', 'visual analysis'",
        "Supported Formats: JPG, PNG, GIF, WebP (max 10MB)",
        "Vision Prompts: Optimize queries for visual understanding"
      ]
    },
    {
      icon: Shield,
      title: "Data Management & Privacy",
      description: "Control your data and privacy settings",
      content: "Complete control over your data. Export all conversations as CSV files through Security settings. Delete all data permanently with confirmation. Guest mode stores no data. Signed accounts retain data until manually deleted. All data handling complies with privacy regulations and user consent.",
      articles: [
        "CSV Export: Download all chat history in spreadsheet format",
        "Data Deletion: Permanently remove all stored information",
        "Guest Privacy: No data storage, complete anonymity",
        "Account Data: Secure storage with encryption",
        "Privacy Controls: Manage what data is kept",
        "Data Security: Advanced protection and compliance"
      ]
    },
    {
      icon: Mic,
      title: "Voice & Audio Features",
      description: "Speech input and audio capabilities",
      content: "Voice input enables hands-free interaction. Click the microphone icon, grant browser permissions, and speak your questions. Text-to-speech reads AI responses aloud. Works in all modes and supports multiple languages. Requires HTTPS connection and microphone permissions.",
      articles: [
        "Voice Setup: Enable microphone in browser settings",
        "Speech Input: Click mic icon and speak your question",
        "Text-to-Speech: AI responses read aloud automatically",
        "Voice Commands: Hands-free interaction with AI",
        "Language Support: Multiple languages for voice input",
        "Troubleshooting: Fix audio permissions and connection issues"
      ]
    },
    {
      icon: Lightbulb,
      title: "Analytics & Insights",
      description: "Activity tracking and usage analytics",
      content: "Activity Matrix visualizes your chat patterns with color-coded calendar view. Track daily conversations, response times, and usage patterns. Analytics show conversation counts, AI model usage, and activity trends. All analytics respect privacy settings and are only visible to you.",
      articles: [
        "Activity Matrix: Visual calendar of your chat activity",
        "Usage Statistics: Track conversations and AI interactions",
        "Pattern Analysis: Understand your communication habits",
        "Performance Metrics: Response times and efficiency data",
        "Visual Dashboard: Color-coded activity representation",
        "Privacy Protected: Analytics visible only to you"
      ]
    },
    {
      icon: Settings,
      title: "Themes & Customization",
      description: "Personalize your ONE.AI experience",
      content: "Choose between Modern UI (clean, contemporary) or Pixel UI (retro, gaming-inspired). Toggle Dark/Light themes for optimal viewing. Themes persist across sessions when signed in. Pixel UI includes special fonts and styling. All themes maintain full functionality and accessibility.",
      articles: [
        "Modern UI: Clean, contemporary interface design",
        "Pixel UI: Retro gaming-inspired visual style",
        "Dark Theme: Reduced eye strain, better for low light",
        "Light Theme: Bright, clear visibility for day use",
        "Theme Persistence: Settings saved with account",
        "Accessibility: All themes support accessibility features"
      ]
    }
  ]

  const quickGuides = [
    {
      icon: Play,
      title: "Getting Started",
      description: "New to ONE.AI? Start here",
      steps: [
        "Choose Sign Up (Google/GitHub) or Guest Mode", 
        "Select your preferred AI mode", 
        "Configure AI provider or use default", 
        "Start your first conversation"
      ]
    },
    {
      icon: MessageSquare,
      title: "Effective Prompting",
      description: "How to ask better questions",
      steps: [
        "Be specific and clear in your requests", 
        "Use context keywords for better results", 
        "Try 'explain', 'analyze', 'create', 'summarize'", 
        "Add 'with web search' for current information"
      ]
    },
    {
      icon: Brain,
      title: "Advanced AI Usage",
      description: "Maximize AI capabilities",
      steps: [
        "Upload images for visual analysis", 
        "Use custom API keys for premium models", 
        "Enable web search for real-time data", 
        "Switch modes based on your task"
      ]
    },
    {
      icon: Zap,
      title: "Power User Tips",
      description: "Advanced features and shortcuts",
      steps: [
        "Use voice commands for hands-free interaction", 
        "Export chat history for backup", 
        "Analyze your usage with activity matrix", 
        "Customize themes for optimal experience"
      ]
    }
  ]

  const troubleshooting = [
    {
      icon: AlertCircle,
      title: "Common Issues",
      items: [
        { issue: "Voice input not working", solution: "Check microphone permissions in browser settings and ensure HTTPS connection" },
        { issue: "Custom API key errors", solution: "Verify your OpenAI/Claude API key is correctly entered and has sufficient credits" },
        { issue: "Web search not returning results", solution: "Check internet connection and try rephrasing your search query" },
        { issue: "Image upload failed", solution: "Ensure image is under 10MB and in supported format (JPG, PNG, GIF, WebP)" },
        { issue: "Chat history not saving", solution: "Sign in with Google/GitHub account - Guest mode doesn't save conversations" },
        { issue: "Theme not persisting", solution: "Enable cookies in browser settings to save theme preferences" },
        { issue: "Slow AI responses", solution: "Try switching to a different AI provider or check your internet connection" },
        { issue: "Data export not working", solution: "Ensure you're signed in and have conversations to export" }
      ]
    }
  ]

  const resources = [
    {
      icon: Brain,
      title: "Quick Tips",
      description: "Essential tips for better AI interactions",
      content: "Use specific keywords: 'explain', 'analyze', 'create', 'summarize'. Add 'with web search' for current information. Be specific in requests. Try different AI models for varied perspectives.",
      comingSoon: false
    },
    {
      icon: MessageSquare,
      title: "Best Practices",
      description: "Optimize your ONE.AI experience",
      content: "Start conversations with context. Use appropriate AI modes for tasks. Upload images for visual analysis. Save important conversations before switching to Guest mode.",
      comingSoon: false
    },
    {
      icon: Zap,
      title: "Advanced Features",
      description: "Power user capabilities",
      content: "Custom API keys unlock premium models. Web search provides real-time data. Voice input enables hands-free operation. Activity matrix tracks usage patterns.",
      comingSoon: false
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your data protection guide",
      content: "Guest mode ensures no data storage. Signed accounts enable data export/deletion. All communications are encrypted. Third-party AI providers have separate terms.",
      comingSoon: false
    }
  ]

  const filteredCategories = helpCategories.filter(category =>
    searchQuery === "" || 
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article => article.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-5xl max-h-[90vh] overflow-y-auto ${
        uiStyle === "pixel"
          ? "bg-gray-200 dark:bg-gray-800 border-4 border-gray-400 dark:border-gray-600 pixel-border rounded-none"
          : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
      }`}>
        <DialogHeader className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Enhanced Help Icon Above Title */}
            <div className={`p-6 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 ${
              uiStyle === "pixel" ? "pixel-border border-4 border-purple-400" : "rounded-2xl"
            } shadow-2xl transform hover:scale-105 transition-transform duration-200`}>
              <HelpCircle className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
            
            {/* Enhanced Title Section */}
            <div className="text-center space-y-3">
              <DialogTitle className={`text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                {uiStyle === "pixel" ? "HELP CENTER" : "Help Center"}
              </DialogTitle>
              <p className={`text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                Find answers, guides, and comprehensive support for ONE.AI
              </p>
            </div>
            
            {/* Enhanced Badge */}
            <div className="flex items-center justify-center">
              <Badge variant="outline" className={`text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-900/20 px-6 py-3 text-sm font-medium ${
                uiStyle === "pixel" ? "pixel-font border-2" : "rounded-full"
              }`}>
                <BookOpen className="w-4 h-4 mr-2" />
                Comprehensive Support & Documentation
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={uiStyle === "pixel" ? "SEARCH HELP ARTICLES..." : "Search help articles..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 h-12 text-base ${
                uiStyle === "pixel"
                  ? "bg-gray-100 dark:bg-gray-700 border-4 border-gray-400 dark:border-gray-600 pixel-font pixel-border"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500"
              }`}
            />
          </div>

          {/* Quick Start Guides */}
          <div>
            <h3 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "QUICK START GUIDES" : "Quick Start Guides"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickGuides.map((guide, index) => {
                const Icon = guide.icon
                return (
                  <Card key={index} className={`cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 ${
                    uiStyle === "pixel" ? "border-2" : "border-gray-200 dark:border-gray-700"
                  }`}>
                    <CardHeader className="pb-3">
                      <CardTitle className={`flex items-center gap-2 text-base ${
                        uiStyle === "pixel" ? "pixel-font" : ""
                      }`}>
                        <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        {guide.title}
                      </CardTitle>
                      <CardDescription className={`text-sm ${
                        uiStyle === "pixel" ? "pixel-font text-xs" : ""
                      }`}>
                        {guide.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className={`flex items-start text-sm text-gray-600 dark:text-gray-400 ${
                            uiStyle === "pixel" ? "pixel-font text-xs" : ""
                          }`}>
                            <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full text-xs flex items-center justify-center mr-3 mt-0.5 font-bold flex-shrink-0">
                              {stepIndex + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Help Categories */}
          <div>
            <h3 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "HELP CATEGORIES" : "Help Categories"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCategories.map((category, index) => {
                const Icon = category.icon
                const isExpanded = expandedCategory === index
                return (
                  <Card key={index} className={`transition-all duration-200 hover:shadow-lg ${
                    uiStyle === "pixel" ? "border-2" : "border-gray-200 dark:border-gray-700"
                  }`}>
                    <CardHeader 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                      onClick={() => setExpandedCategory(isExpanded ? null : index)}
                    >
                      <CardTitle className={`flex items-center gap-2 ${
                        uiStyle === "pixel" ? "pixel-font" : ""
                      }`}>
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        {category.title}
                        <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      </CardTitle>
                      <CardDescription className={`text-sm ${
                        uiStyle === "pixel" ? "pixel-font text-xs" : ""
                      }`}>
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isExpanded ? (
                        <div className="space-y-4">
                          <p className={`text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg ${
                            uiStyle === "pixel" ? "pixel-font text-xs border-2 border-blue-200 dark:border-blue-800" : ""
                          }`}>
                            {category.content}
                          </p>
                          <Separator />
                          <ul className="space-y-2">
                            {category.articles.map((article, articleIndex) => (
                              <li key={articleIndex} className={`flex items-start text-sm text-gray-700 dark:text-gray-300 ${
                                uiStyle === "pixel" ? "pixel-font text-xs" : ""
                              }`}>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{article}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {category.articles.slice(0, 3).map((article, articleIndex) => (
                            <li key={articleIndex} className={`flex items-center text-sm text-gray-700 dark:text-gray-300 ${
                              uiStyle === "pixel" ? "pixel-font text-xs" : ""
                            }`}>
                              <ChevronRight className="h-3 w-3 mr-2 text-gray-400" />
                              {article.split(' - ')[0]}...
                            </li>
                          ))}
                          <li className={`text-xs text-blue-600 dark:text-blue-400 italic ${
                            uiStyle === "pixel" ? "pixel-font" : ""
                          }`}>
                            Click to expand and see detailed explanation
                          </li>
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Troubleshooting */}
          <div>
            <h3 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "TROUBLESHOOTING" : "Troubleshooting"}
            </h3>
            {troubleshooting.map((section, index) => {
              const Icon = section.icon
              return (
                <Card key={index} className={`${
                  uiStyle === "pixel" ? "border-2" : "border-gray-200 dark:border-gray-700"
                }`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${
                      uiStyle === "pixel" ? "pixel-font" : ""
                    }`}>
                      <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className={`p-4 ${
                          uiStyle === "pixel"
                            ? "bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"
                            : "bg-gray-50 dark:bg-gray-800 rounded-lg"
                        }`}>
                          <div className={`flex items-start space-x-3`}>
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className={`font-medium text-sm text-gray-900 dark:text-gray-100 ${
                                uiStyle === "pixel" ? "pixel-font text-xs" : ""
                              }`}>
                                {item.issue}
                              </p>
                              <div className="flex items-start space-x-2 mt-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <p className={`text-xs text-gray-600 dark:text-gray-400 ${
                                  uiStyle === "pixel" ? "pixel-font" : ""
                                }`}>
                                  {item.solution}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Separator className="my-8" />

          {/* Additional Resources */}
          <div>
            <h3 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "QUICK REFERENCE" : "Quick Reference"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((resource, index) => {
                const Icon = resource.icon
                return (
                  <Card key={index} className={`hover:shadow-lg transition-shadow duration-200 ${
                    uiStyle === "pixel" ? "border-2" : "border-gray-200 dark:border-gray-700"
                  }`}>
                    <CardHeader className="pb-3">
                      <CardTitle className={`flex items-center gap-2 text-base ${
                        uiStyle === "pixel" ? "pixel-font" : ""
                      }`}>
                        <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        {resource.title}
                      </CardTitle>
                      <CardDescription className={`text-sm ${
                        uiStyle === "pixel" ? "pixel-font text-xs" : ""
                      }`}>
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-sm text-gray-700 dark:text-gray-300 ${
                        uiStyle === "pixel" ? "pixel-font text-xs" : ""
                      }`}>
                        {resource.content}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-3">
            <Card className={`border-blue-200 dark:border-blue-800 ${
              uiStyle === "pixel" ? "border-2" : ""
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h4 className={`font-medium text-blue-700 dark:text-blue-400 ${
                    uiStyle === "pixel" ? "pixel-font" : ""
                  }`}>
                    {uiStyle === "pixel" ? "NEED MORE HELP?" : "Need More Help?"}
                  </h4>
                </div>
                <p className={`text-sm text-gray-600 dark:text-gray-400 ${
                  uiStyle === "pixel" ? "pixel-font text-xs" : ""
                }`}>
                  All information is provided within this help center. Use the search function or browse categories above for specific topics. Click on any category to expand detailed explanations and step-by-step guides.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <p className={`text-xs text-gray-500 dark:text-gray-400 ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                Help Center last updated: December 27, 2025
              </p>
              
              <p className={`text-xs text-gray-500 dark:text-gray-500 ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                © 2025 Mackdev Inc. | ONE.AI Help & Support
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}