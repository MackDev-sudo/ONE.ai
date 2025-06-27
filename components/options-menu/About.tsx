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
  Github,
  ExternalLink,
  Heart,
  Zap,
  Users
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
      title: "6 AI Modes",
      description: "Specialized assistants for every need"
    },
    {
      icon: Cpu,
      title: "Multi-Provider",
      description: "Groq, Gemini, OpenAI & Claude"
    },
    {
      icon: Mic,
      title: "Voice Support",
      description: "Speech-to-text & text-to-speech"
    },
    {
      icon: Sparkles,
      title: "3D Visuals",
      description: "Dynamic particle visualizations"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Local storage & secure authentication"
    },
    {
      icon: Globe,
      title: "Open Source",
      description: "Built with modern web technologies"
    }
  ]

  const techStack = [
    "Next.js 14",
    "TypeScript",
    "Tailwind CSS",
    "Vercel AI SDK",
    "Three.js",
    "Supabase"
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${
        uiStyle === "pixel"
          ? "bg-gray-200 dark:bg-gray-800 border-4 border-gray-400 dark:border-gray-600 pixel-border rounded-none"
          : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
      }`}>
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
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
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Description */}
          <div className="text-center space-y-2">
            <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${
              uiStyle === "pixel" ? "pixel-font text-xs" : ""
            }`}>
              ONE.ai is a next-generation conversational AI platform that adapts to your needs with specialized modes, 
              advanced voice integration, and beautiful visualizations. Built for productivity, creativity, and seamless interaction.
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

          {/* Tech Stack */}
          <div>
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 text-center ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "TECHNOLOGY STACK" : "Technology Stack"}
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {techStack.map((tech) => (
                <Badge 
                  key={tech} 
                  variant="outline" 
                  className={`text-xs ${
                    uiStyle === "pixel" ? "pixel-font border-2" : ""
                  }`}
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://github.com/RS-labhub/ONE.ai', '_blank')}
                className={`${
                  uiStyle === "pixel" ? "pixel-font border-2" : ""
                }`}
              >
                <Github className="w-4 h-4 mr-2" />
                {uiStyle === "pixel" ? "SOURCE CODE" : "Source Code"}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://www.youtube.com/watch?v=2FW6IJeOkzI', '_blank')}
                className={`${
                  uiStyle === "pixel" ? "pixel-font border-2" : ""
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                {uiStyle === "pixel" ? "DEMO VIDEO" : "Demo Video"}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
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
                  Powered by cutting-edge AI technology
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
