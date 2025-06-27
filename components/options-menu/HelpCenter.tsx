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
  ExternalLink,
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

  const helpCategories = [
    {
      icon: Brain,
      title: "AI Modes & Features",
      description: "Learn about the 6 specialized AI modes",
      articles: [
        "Understanding General Mode",
        "Productivity Mode Features",
        "Creative Mode Capabilities",
        "Wellness Mode Guide",
        "Learning Mode Tips",
        "BFF Mode - Your AI Bestie"
      ]
    },
    {
      icon: Mic,
      title: "Voice & Audio",
      description: "Voice commands and audio features",
      articles: [
        "Setting up Voice Input",
        "Text-to-Speech Configuration",
        "Voice Commands Guide",
        "Audio Troubleshooting",
        "Microphone Permissions"
      ]
    },
    {
      icon: Settings,
      title: "Settings & Customization",
      description: "Personalize your ONE.AI experience",
      articles: [
        "UI Theme Selection",
        "Pixel vs Modern UI",
        "Provider Configuration",
        "API Key Setup",
        "Account Settings"
      ]
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Data protection and privacy controls",
      articles: [
        "Guest Mode Privacy",
        "Data Deletion Guide",
        "Privacy Settings",
        "Account Security",
        "Data Export Options"
      ]
    }
  ]

  const quickGuides = [
    {
      icon: Play,
      title: "Getting Started",
      description: "New to ONE.AI? Start here",
      steps: ["Sign up or use Guest Mode", "Choose your AI mode", "Start chatting", "Explore features"]
    },
    {
      icon: MessageSquare,
      title: "Chat Basics",
      description: "Learn the fundamentals",
      steps: ["Type your message", "Use voice input", "Switch AI providers", "Save conversations"]
    },
    {
      icon: Zap,
      title: "Advanced Features",
      description: "Power user tips",
      steps: ["Use quick actions", "Customize responses", "Export chats", "API integrations"]
    }
  ]

  const troubleshooting = [
    {
      icon: AlertCircle,
      title: "Common Issues",
      items: [
        { issue: "Voice input not working", solution: "Check microphone permissions in browser settings" },
        { issue: "API key errors", solution: "Verify your API key is correctly entered and valid" },
        { issue: "Slow responses", solution: "Try switching to a different AI provider" },
        { issue: "Login problems", solution: "Clear browser cache and try again" }
      ]
    }
  ]

  const resources = [
    {
      icon: Youtube,
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      link: "https://www.youtube.com/watch?v=2FW6IJeOkzI",
      external: true
    },
    {
      icon: Github,
      title: "Documentation",
      description: "Technical documentation and API guides",
      link: "https://github.com/MackDev-sudo",
      external: true
    },
    {
      icon: MessageSquare,
      title: "Community Forum",
      description: "Connect with other users",
      link: "#",
      external: false,
      comingSoon: true
    },
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Comprehensive help articles",
      link: "#",
      external: false,
      comingSoon: true
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
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className={`p-3 bg-gradient-to-br from-purple-500 to-indigo-600 ${
              uiStyle === "pixel" ? "pixel-border border-4 border-purple-400" : "rounded-lg"
            }`}>
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <DialogTitle className={`text-2xl font-bold text-gray-900 dark:text-gray-100 ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                {uiStyle === "pixel" ? "HELP CENTER" : "Help Center"}
              </DialogTitle>
              <p className={`text-sm text-gray-600 dark:text-gray-400 ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                Find answers, guides, and support for ONE.AI
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <Badge variant="outline" className={`text-purple-600 border-purple-300 ${
              uiStyle === "pixel" ? "pixel-font border-2" : ""
            }`}>
              Comprehensive Support & Documentation
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={uiStyle === "pixel" ? "SEARCH HELP ARTICLES..." : "Search help articles..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${
                uiStyle === "pixel"
                  ? "bg-gray-100 dark:bg-gray-700 border-4 border-gray-400 dark:border-gray-600 pixel-font pixel-border"
                  : "bg-gray-50 dark:bg-gray-800"
              }`}
            />
          </div>

          {/* Quick Start Guides */}
          <div>
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "QUICK START GUIDES" : "Quick Start Guides"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickGuides.map((guide, index) => {
                const Icon = guide.icon
                return (
                  <Card key={index} className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    uiStyle === "pixel" ? "border-2" : ""
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
                      <ol className="space-y-1">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className={`flex items-center text-xs text-gray-600 dark:text-gray-400 ${
                            uiStyle === "pixel" ? "pixel-font" : ""
                          }`}>
                            <span className="w-4 h-4 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full text-xs flex items-center justify-center mr-2 font-bold">
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

          <Separator />

          {/* Help Categories */}
          <div>
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "HELP CATEGORIES" : "Help Categories"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCategories.map((category, index) => {
                const Icon = category.icon
                return (
                  <Card key={index} className={`${uiStyle === "pixel" ? "border-2" : ""}`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${
                        uiStyle === "pixel" ? "pixel-font" : ""
                      }`}>
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        {category.title}
                      </CardTitle>
                      <CardDescription className={`text-sm ${
                        uiStyle === "pixel" ? "pixel-font text-xs" : ""
                      }`}>
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.articles.slice(0, 4).map((article, articleIndex) => (
                          <li key={articleIndex} className={`flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer ${
                            uiStyle === "pixel" ? "pixel-font text-xs" : ""
                          }`}>
                            <ChevronRight className="h-3 w-3 mr-2 text-gray-400" />
                            {article}
                          </li>
                        ))}
                        {category.articles.length > 4 && (
                          <li className={`text-xs text-blue-600 dark:text-blue-400 cursor-pointer ${
                            uiStyle === "pixel" ? "pixel-font" : ""
                          }`}>
                            View {category.articles.length - 4} more articles...
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Troubleshooting */}
          <div>
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "TROUBLESHOOTING" : "Troubleshooting"}
            </h3>
            {troubleshooting.map((section, index) => {
              const Icon = section.icon
              return (
                <Card key={index} className={`${uiStyle === "pixel" ? "border-2" : ""}`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${
                      uiStyle === "pixel" ? "pixel-font" : ""
                    }`}>
                      <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className={`p-3 ${
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
                              <div className="flex items-start space-x-2 mt-1">
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

          <Separator />

          {/* Additional Resources */}
          <div>
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "ADDITIONAL RESOURCES" : "Additional Resources"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((resource, index) => {
                const Icon = resource.icon
                return (
                  <Card key={index} className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    uiStyle === "pixel" ? "border-2" : ""
                  } ${resource.comingSoon ? "opacity-60" : ""}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className={`flex items-center gap-2 text-base ${
                        uiStyle === "pixel" ? "pixel-font" : ""
                      }`}>
                        <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        {resource.title}
                        {resource.comingSoon && (
                          <Badge variant="outline" className={`text-xs ${
                            uiStyle === "pixel" ? "pixel-font border-2" : ""
                          }`}>
                            Coming Soon
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className={`text-sm ${
                        uiStyle === "pixel" ? "pixel-font text-xs" : ""
                      }`}>
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={resource.comingSoon}
                        onClick={() => resource.external && window.open(resource.link, '_blank')}
                        className={`w-full ${
                          uiStyle === "pixel" ? "pixel-font border-2" : ""
                        }`}
                      >
                        {resource.comingSoon ? "Coming Soon" : "Access Resource"}
                        {!resource.comingSoon && resource.external && <ExternalLink className="w-3 h-3 ml-1" />}
                      </Button>
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
                <p className={`text-sm text-gray-600 dark:text-gray-400 mb-4 ${
                  uiStyle === "pixel" ? "pixel-font text-xs" : ""
                }`}>
                  Can't find what you're looking for? Our support team is here to help!
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('mailto:support@mackdev.com?subject=ONE.AI Help Request', '_blank')}
                    className={`${
                      uiStyle === "pixel" ? "pixel-font border-2" : ""
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {uiStyle === "pixel" ? "CONTACT SUPPORT" : "Contact Support"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://github.com/MackDev-sudo', '_blank')}
                    className={`${
                      uiStyle === "pixel" ? "pixel-font border-2" : ""
                    }`}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    {uiStyle === "pixel" ? "VIEW DOCS" : "View Docs"}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
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