"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  Cpu,
  Globe,
  Mic,
  Sparkles,
  Shield,
  Heart,
  Zap,
  FileText,
  Palette,
  MessageSquare,
  Search,
  Upload,
  Download
} from "lucide-react"

interface AboutProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uiStyle?: "modern" | "pixel"
}

export function About({ open, onOpenChange, uiStyle = "modern" }: AboutProps) {
  const features = [
    {
      icon: Brain,
      title: "8 AI Modes",
      description: "General, Creative, Academic, Technical, BFF, Cooking, Fitness & Analysis"
    },
    {
      icon: Cpu,
      title: "Multi-Provider",
      description: "Groq, Gemini, OpenAI & Claude with seamless switching"
    },
    {
      icon: Mic,
      title: "Voice Integration",
      description: "Advanced speech-to-text & text-to-speech capabilities"
    },
    {
      icon: Sparkles,
      title: "Interactive UI",
      description: "Modern gradient and retro pixel art themes with smooth animations"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Secure authentication, local storage & encrypted data"
    },
    {
      icon: Globe,
      title: "Web Search",
      description: "Real-time web search integration for current information"
    }
  ]

  const newFeatures = [
    {
      icon: Search,
      title: "Real-time Web Search",
      description: "Get current information from the web instantly"
    },
    {
      icon: Upload,
      title: "File Upload Support",
      description: "Analyze images, documents, and code files"
    },
    {
      icon: MessageSquare,
      title: "Enhanced Chat History",
      description: "Smart conversation management with timeline grouping"
    },
    {
      icon: Palette,
      title: "Dual UI Themes",
      description: "Modern gradient theme and retro pixel art theme"
    },
    {
      icon: FileText,
      title: "Message Actions",
      description: "Copy, download, share, and listen to AI responses"
    },
    {
      icon: Download,
      title: "Clear Memory",
      description: "Secure deletion of all conversation history"
    }
  ]

  const techStack = [
    "Built with modern web technologies and frameworks",
    "Powered by advanced AI SDKs and APIs",
    "Utilizes cutting-edge frontend libraries",
    "Integrated with secure database solutions",
    "Enhanced with interactive UI components",
    "Optimized for performance and scalability"
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${
        uiStyle === "pixel"
          ? "bg-gray-200 dark:bg-gray-800 border-4 border-gray-400 dark:border-gray-600 pixel-border rounded-none"
          : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
      }`}>
        <DialogHeader className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className={`p-3 bg-gradient-to-br from-blue-500 to-purple-600 ${
              uiStyle === "pixel" ? "pixel-border border-4 border-blue-400" : "rounded-lg"
            }`}>
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <DialogTitle className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                ONE.ai
              </DialogTitle>
              <p className={`text-sm text-gray-600 dark:text-gray-400 ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                Adaptive Reasoning & Intelligence Assistant
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className={uiStyle === "pixel" ? "pixel-font border-2" : ""}>
              Version 1.0.2
            </Badge>
            <Badge variant="outline" className={uiStyle === "pixel" ? "pixel-font border-2" : ""}>
              Code Name: Malibu
            </Badge>
            <Badge variant="outline" className={`text-green-600 border-green-600 ${uiStyle === "pixel" ? "pixel-font border-2" : ""}`}>
              Enhanced
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Description */}
          <div className="text-center space-y-2">
            <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${
              uiStyle === "pixel" ? "pixel-font text-xs" : ""
            }`}>
              ONE.ai is a comprehensive conversational AI platform featuring 8 specialized modes, multi-provider AI support, 
              advanced voice integration, and real-time web search. Built for productivity, 
              creativity, and seamless interaction with secure chat history management and modern UI themes.
            </p>
          </div>

          <Separator />

          {/* Features Grid */}
          <div>
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "KEY FEATURES" : "Key Features"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className={`flex items-start space-x-3 p-3 ${
                    uiStyle === "pixel"
                      ? "bg-gray-100 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600"
                      : "bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  }`}>
                    <Icon className={`w-5 h-5 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0`} />
                    <div className="min-w-0">
                      <h4 className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${
                        uiStyle === "pixel" ? "pixel-font text-xs" : ""
                      }`}>
                        {feature.title}
                      </h4>
                      <p className={`text-xs text-gray-600 dark:text-gray-400 ${
                        uiStyle === "pixel" ? "pixel-font" : ""
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Latest Features */}
          <div>
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "LATEST ENHANCEMENTS" : "Latest Enhancements"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {newFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className={`flex items-start space-x-3 p-3 ${
                    uiStyle === "pixel"
                      ? "bg-green-100 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600"
                      : "bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  }`}>
                    <Icon className={`w-5 h-5 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0`} />
                    <div className="min-w-0">
                      <h4 className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${
                        uiStyle === "pixel" ? "pixel-font text-xs" : ""
                      }`}>
                        {feature.title}
                      </h4>
                      <p className={`text-xs text-gray-600 dark:text-gray-400 ${
                        uiStyle === "pixel" ? "pixel-font" : ""
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Tech Stack */}
          <div>
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 text-center ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "TECHNOLOGY FOUNDATION" : "Technology Foundation"}
            </h3>
            <div className="space-y-2">
              {techStack.map((tech, index) => (
                <div 
                  key={index} 
                  className={`text-center p-2 ${
                    uiStyle === "pixel" 
                      ? "bg-gray-100 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 pixel-font text-xs"
                      : "bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  }`}
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {tech}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="space-y-4">
            <div className="text-center">
              <p className={`text-sm text-blue-600 dark:text-blue-400 font-medium ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                🚀 Enhanced with advanced features and improved performance
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                <span className={uiStyle === "pixel" ? "pixel-font" : ""}>
                  Built with
                </span>
                <Heart className="w-4 h-4 text-red-500" />
                <span className={uiStyle === "pixel" ? "pixel-font" : ""}>
                  by Mackdev Inc.
                </span>
              </div>
              
              <p className={`text-xs text-gray-500 dark:text-gray-500 ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                © 2025 Mackdev Inc. All rights reserved.
              </p>
              
              <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                <Zap className="w-3 h-3" />
                <span className={uiStyle === "pixel" ? "pixel-font" : ""}>
                  Powered by cutting-edge AI technology with continuous improvements
                </span>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                <span className={uiStyle === "pixel" ? "pixel-font" : ""}>
                  Build: {new Date().toLocaleDateString()}
                </span>
                <span>•</span>
                <span className={uiStyle === "pixel" ? "pixel-font" : ""}>
                  Status: Active Development
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
