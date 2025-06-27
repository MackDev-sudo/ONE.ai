"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  Heart,
  BookOpen,
  Lightbulb,
  Target,
  MessageCircle,
  Mic,
  Volume2,
  Sparkles,
  Github,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Globe,
  Users,
  Activity,
  Palette,
  ChevronRight,
  Play,
  CheckCircle,
  Code,
  Layers,
  Cpu,
  Rocket,
  MessageSquare,
  BarChart3,
  Settings,
  Moon,
  Sun,
} from "lucide-react"
import { FaGoogle } from "react-icons/fa"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [currentMode, setCurrentMode] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const modes = [
    {
      icon: Brain,
      name: "General",
      description: "Everyday conversations and problem-solving",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      icon: Target,
      name: "Productivity",
      description: "Task management and time optimization",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800"
    },
    {
      icon: Heart,
      name: "Wellness",
      description: "Health guidance and mental well-being",
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-950/20",
      borderColor: "border-pink-200 dark:border-pink-800"
    },
    {
      icon: BookOpen,
      name: "Learning",
      description: "Educational support and skill development",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800"
    },
    {
      icon: Lightbulb,
      name: "Creative",
      description: "Brainstorming and artistic inspiration",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      borderColor: "border-yellow-200 dark:border-yellow-800"
    },
    {
      icon: MessageCircle,
      name: "BFF",
      description: "Your GenZ bestie for casual chats",
      color: "text-rose-500",
      bgColor: "bg-rose-50 dark:bg-rose-950/20",
      borderColor: "border-rose-200 dark:border-rose-800"
    }
  ]

  const features = [
    {
      icon: Brain,
      title: "Multi-Modal Intelligence",
      description: "Six specialized AI personalities in one platform, each optimized for different use cases."
    },
    {
      icon: Zap,
      title: "Multi-Provider Support",
      description: "Powered by Groq, Gemini, OpenAI, and Claude with intelligent model selection."
    },
    {
      icon: Mic,
      title: "Advanced Voice Integration",
      description: "Speech-to-text input and natural text-to-speech output with multi-language support."
    },
    {
      icon: Sparkles,
      title: "Dynamic 3D Visuals",
      description: "Interactive particle system that responds to AI activity with mode-based colors."
    },
    {
      icon: Shield,
      title: "Smart Persistence",
      description: "Automatic chat history saving per mode with seamless context switching."
    },
    {
      icon: Activity,
      title: "Real-time Analytics",
      description: "Live usage statistics, performance metrics, and AI activity monitoring."
    }
  ]

  const providers = [
    {
      name: "Groq",
      description: "Lightning-fast inference",
      icon: Rocket,
      color: "text-orange-500",
      free: true
    },
    {
      name: "Gemini",
      description: "Google's multimodal AI",
      icon: Globe,
      color: "text-emerald-500",
      free: true
    },
    {
      name: "OpenAI",
      description: "Advanced language models",
      icon: Brain,
      color: "text-violet-500",
      free: false
    },
    {
      name: "Claude",
      description: "Anthropic's helpful assistant",
      icon: MessageSquare,
      color: "text-orange-600",
      free: false
    }
  ]

  const techStack = [
    "Next.js 14",
    "Vercel AI SDK",
    "TypeScript",
    "Tailwind CSS",
    "Three.js",
    "Supabase",
    "Radix UI",
    "React Hook Form"
  ]

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentMode((prev) => (prev + 1) % modes.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [modes.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Badge variant="outline" className="mb-6 text-sm font-medium px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Powered by Multiple AI Providers
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6">
                ONE.ai
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-4 font-light">
                Adaptive Reasoning & Intelligence Assistant
              </p>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                Experience the next generation of AI assistance with specialized modes, advanced voice integration, 
                and beautiful visualizations. One platform, infinite possibilities.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg" 
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-medium transition-all duration-200"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-3 text-lg font-medium"
                  onClick={() => window.open('https://github.com/RS-labhub/ONE.ai', '_blank')}
                >
                  <Github className="mr-2 w-5 h-5" />
                  View on GitHub
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Free to use
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Open source
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No registration required
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modes Showcase */}
      <section className="py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Six Specialized AI Modes
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Each mode is crafted with unique system prompts and optimized for specific use cases
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {modes.map((mode, index) => {
              const Icon = mode.icon
              const isActive = currentMode === index
              
              return (
                <Card 
                  key={mode.name}
                  className={`transition-all duration-500 cursor-pointer hover:scale-105 ${
                    isActive 
                      ? `${mode.bgColor} ${mode.borderColor} border-2 shadow-lg` 
                      : 'hover:shadow-md border'
                  }`}
                  onClick={() => setCurrentMode(index)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-4 ${isActive ? 'ring-2 ring-offset-2 ring-current' : ''}`}>
                      <Icon className={`w-6 h-6 ${mode.color}`} />
                    </div>
                    <CardTitle className="text-xl font-semibold">{mode.name}</CardTitle>
                    <CardDescription className="text-sm">{mode.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built with cutting-edge technology for an exceptional AI experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              
              return (
                <div 
                  key={feature.title}
                  className={`transition-all duration-500 delay-${index * 100}`}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* AI Providers Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Multiple AI Providers
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose from the best AI models or let our smart selection pick the optimal one for your query
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {providers.map((provider) => {
              const Icon = provider.icon
              
              return (
                <Card key={provider.name} className="text-center hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-4">
                      <Icon className={`w-6 h-6 ${provider.color}`} />
                    </div>
                    <CardTitle className="text-lg font-semibold flex items-center justify-center gap-2">
                      {provider.name}
                      {provider.free && (
                        <Badge variant="secondary" className="text-xs">Free</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">{provider.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Built with Modern Tech
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powered by the latest technologies for performance, reliability, and developer experience
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {techStack.map((tech) => (
              <Badge 
                key={tech} 
                variant="outline" 
                className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <Code className="w-4 h-4 mr-2" />
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose ONE.ai?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Experience the difference with our advanced AI platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">6</div>
              <div className="text-lg opacity-90">Specialized AI Modes</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">4</div>
              <div className="text-lg opacity-90">AI Provider Options</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">∞</div>
              <div className="text-lg opacity-90">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Experience the Future of AI?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of users who are already experiencing the power of adaptive AI assistance. 
              No registration required - start chatting in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-medium"
              >
                Start Chatting Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-3 text-lg font-medium"
                onClick={() => window.open('https://www.youtube.com/watch?v=2FW6IJeOkzI', '_blank')}
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">ONE.ai</h3>
              <p className="text-gray-400">Adaptive Reasoning & Intelligence Assistant</p>
            </div>
            
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open('https://github.com/RS-labhub/ONE.ai', '_blank')}
                className="text-gray-400 hover:text-white"
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open('https://www.youtube.com/watch?v=2FW6IJeOkzI', '_blank')}
                className="text-gray-400 hover:text-white"
              >
                <Play className="w-5 h-5 mr-2" />
                Demo
              </Button>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-800" />
          
          <div className="text-center text-gray-400 text-sm">
            <p>© 2024 ONE.ai. Built with ❤️ by Mackdev Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}