![banner](https://raw.githubusercontent.com/RS-labhub/Radhika/master/public/banner.png)

# RADHIKA - Adaptive Reasoning & Intelligence Assistant
A sophisticated AI-powered assistant built with Next.js and powered by multiple LLM providers including Groq, Gemini, OpenAI, and Claude. RADHIKA adapts to different modes of interaction, providing specialized assistance for productivity, wellness, learning, creative tasks, and even acts as your GenZ bestie!

## 🎬 Project Showcase

| Preview             | Description        |
|---------------------|--------------------|
| [![YouTube Demo](https://raw.githubusercontent.com/RS-labhub/Radhika/master/public/youtube.jpg)](https://www.youtube.com/watch?v=2FW6IJeOkzI) | 🎬 **YouTube Demo**<br>Click the image to watch the full demo. |
| ![Blog Post](https://raw.githubusercontent.com/RS-labhub/Radhika/master/public/cover-image.png) | 📝 **Blog Post**<br>Read the blog for in-depth explanation. |



## ✨ Features

### 🎯 **Multi-Mode Intelligence**
- **General Assistant**: All-purpose AI companion for everyday queries and conversations
- **Productivity Coach**: Task management, planning, organization, and time optimization expert
- **Wellness Guide**: Health, fitness, mental well-being, and self-care support with sensitive guidance
- **Learning Mentor**: Personalized education, skill development, and study planning
- **Creative Partner**: Brainstorming, ideation, creative projects, and artistic inspiration
- **BFF Mode**: Your GenZ bestie who speaks your language, provides emotional support, and vibes with you! 💕

### 🤖 **Multi-Provider AI Support**
- **Groq**: Lightning-fast LLM inference with Llama models (default, no API key required)
- **Google Gemini**: Advanced multimodal AI capabilities (no API key required)
- **OpenAI**: GPT-4o, GPT-4 Turbo, and GPT-3.5 Turbo (requires API key)
- **Claude**: Anthropic's helpful assistant models (requires API key)
- **Smart Model Selection**: Automatically selects optimal models based on query complexity

### 🚀 **Advanced Chat Interface**
- **Real-time Streaming**: Lightning-fast responses with streaming text
- **Persistent Chat History**: Automatic saving per mode across browser sessions
- **Mode-Specific Contexts**: Each mode maintains its own conversation history
- **Beautiful Responsive UI**: Seamless experience across desktop, tablet, and mobile
- **Dark/Light Themes**: Toggle between themes with smooth transitions
- **Message Export**: Download your chat history (coming soon)

### 🎤 **Voice Integration**
- **Speech-to-Text**: Hands-free input with advanced speech recognition
- **Text-to-Speech**: AI responses spoken aloud with natural voice synthesis
- **Multi-Language Support**: Automatic language detection and appropriate voice selection
- **Voice Controls**: Toggle voice features on/off, stop speaking mid-response
- **Visual Feedback**: Clear indicators for recording and speaking states

### ⚡ **Quick Actions & Smart Features**
- **Mode-Specific Quick Actions**: Pre-defined prompts tailored to each mode
- **One-Click Access**: Instant access to common tasks and queries
- **Context-Aware Suggestions**: Smart recommendations based on your current mode
- **Error Handling**: Comprehensive error management with helpful suggestions
- **API Key Management**: Secure local storage of API keys for premium providers

### 🎨 **Dynamic AI Visualization**
- **Interactive Particle System**: Beautiful 3D particle visualization that responds to AI activity
- **Mode-Based Colors**: Visualization changes colors based on selected mode
- **Activity Indicators**: Particles move more dynamically when AI is active
- **Smooth Animations**: 60fps particle animations with proper boundary constraints
- **Real-time Activity Matrix**: Live statistics and usage analytics

### 📊 **Activity Analytics**
- **Real-time Statistics**: Message count, response times, and session tracking
- **Mode Usage Analytics**: Visual breakdown of how you use different modes
- **AI Status Monitoring**: Live status of neural networks and voice systems
- **Performance Metrics**: Track your productivity and engagement patterns

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 14 with App Router and React 18
- **Styling**: Tailwind CSS with custom design system
- **Components**: shadcn/ui component library
- **Icons**: Lucide React icon library
- **3D Graphics**: Three.js for particle visualizations
- **Animations**: CSS transitions and keyframe animations

### **AI & Backend**
- **AI Integration**: Vercel AI SDK for unified LLM access
- **Providers**: Groq, Google Gemini, OpenAI, Claude
- **Speech**: WebKit Speech Recognition and Synthesis APIs
- **Storage**: Browser localStorage for chat persistence and settings
- **API**: Next.js API routes for secure LLM communication

### **Development**
- **Language**: TypeScript for type safety
- **Build**: Next.js build system with optimizations
- **Deployment**: Vercel-ready with environment variable support
- **Performance**: Optimized bundle splitting and lazy loading

## 💃 Smart Model Selection

RADHIKA automatically selects the best model based on your query complexity:

```typescript
// Determine which model to use based on conversation context
let modelType = "fast"; // llama-3.1-8b-instant for quick responses

// Use reasoning model for complex analytical tasks
if (query.includes("analyze", "compare", "plan", "strategy", "decision", "problem")) {
  modelType = "reasoning"; // llama-3.3-70b-versatile
}

// Use creative model for artistic and innovative tasks
if (query.includes("creative", "brainstorm", "idea", "write", "design", "story")) {
  modelType = "creative"; // qwen/qwen3-32b
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Modern web browser with speech API support
- Optional: API keys for OpenAI/Claude (Groq and Gemini work without keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RS-labhub/radhika.git
   cd radhika
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables (check `.env.example`)**
   ```bash
   touch .env
   ```

   Add your API keys (optional for full functionality):
   ```env
   # Required for Groq (free tier available)
   GROQ_API_KEY=your_groq_api_key_here
   
   # Required for Gemini (free tier available)
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
   
   # Optional: Add via UI for OpenAI/Claude
   # OPENAI_API_KEY=your_openai_api_key_here
   # ANTHROPIC_API_KEY=your_claude_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎮 Usage Guide

### **Selecting AI Modes**
Click on any of the six mode buttons to switch RADHIKA's personality and expertise:

- 🧠 **General** - Everyday questions, problem-solving, and general conversations
- 🎯 **Productivity** - Task management, planning, time optimization, and organization
- ❤️ **Wellness** - Health guidance, fitness routines, mental well-being, and self-care
- 📚 **Learning** - Educational support, study plans, skill development, and tutoring
- 💡 **Creative** - Brainstorming, content creation, artistic projects, and innovation
- 💕 **BFF** - Your GenZ bestie for emotional support, casual chats, and life advice

### **AI Provider Selection**
Choose from multiple AI providers in the bottom-right corner:

- **Groq Cloud** (Default): Fast responses, no API key required
- **Gemini**: Google's advanced AI, no API key required  
- **OpenAI**: Premium models, requires API key (enter via dialog)
- **Claude**: Anthropic's assistant, requires API key (enter via dialog)

### **Voice Features**
- **Voice Input**: Click the microphone button to speak your message
- **Voice Output**: Toggle the speaker icon to enable/disable AI voice responses
- **Multi-Language**: Speak in any language - RADHIKA adapts automatically
- **Voice Controls**: Stop speaking mid-response with the stop button

### **Quick Actions**
Each mode provides quick action buttons with pre-defined prompts:
- Click any quick action to instantly populate the input field
- Actions are tailored to each mode's specialty
- Perfect for getting started or exploring capabilities

### **Chat Management**
- **Auto-Save**: Conversations are automatically saved per mode
- **Clear Chat**: Use the trash button to clear current mode's history (with confirmation)
- **Mode Switching**: Switch between modes without losing conversation context
- **Persistent Storage**: Chat history persists across browser sessions

### **Themes & Customization**
- **Dark/Light Mode**: Toggle themes with the sun/moon button
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Mode Colors**: UI adapts colors based on selected mode
- **Accessibility**: Full keyboard navigation and screen reader support

## 🏗️ Project Structure

```
radhika/
├── app/
│   ├── api/chat/route.ts          # Multi-provider chat API endpoint
│   ├── globals.css                # Global styles and theme variables
│   ├── layout.tsx                 # Root layout with metadata
│   └── page.tsx                   # Main application orchestrator
├── components/
│   ├── ui/                        # shadcn/ui base components
│   ├── chat-header.tsx            # Header with controls and mode display
│   ├── chat-sidebar.tsx           # Mode selection and quick actions
│   ├── chat-messages.tsx          # Message display and formatting
│   ├── chat-input.tsx             # Input field with voice controls
│   ├── chat-container.tsx         # Chat logic and state management
│   ├── ai-visualization.tsx       # 3D particle system visualization
│   └── activity-matrix.tsx        # Real-time analytics dashboard
├── hooks/
│   └── use-speech.ts              # Speech recognition and synthesis
├── types/
│   └── speech.d.ts                # TypeScript definitions for speech APIs
└── lib/
    └── utils.ts                   # Utility functions and helpers
```

## 🔧 Configuration

### **System Prompts**
Each mode has a carefully crafted system prompt in `app/api/chat/route.ts`:

- **Productivity**: GTD methodology, Eisenhower Matrix, time management
- **Wellness**: Physical/mental health, habit formation, empathetic support
- **Learning**: Adaptive teaching, personalized study plans, progress tracking
- **Creative**: Idea generation, creative blocks, artistic inspiration
- **General**: Balanced, helpful, and insightful responses
- **BFF**: GenZ language, emotional support, casual and fun interactions

### **Model Configuration**
Customize model selection in the API route:

```typescript
const MODELS = {
  groq: {
    fast: "llama-3.1-8b-instant",
    reasoning: "llama-3.3-70b-versatile", 
    creative: "qwen/qwen3-32b"
  },
  gemini: { default: "gemini-2.0-flash" },
  openai: { default: "gpt-4o" },
  claude: { default: "claude-3-5-sonnet-20241022" }
}
```

### **Customization Options**
- **Quick Actions**: Modify `QUICK_ACTIONS` in `app/page.tsx`
- **Mode Styling**: Update `MODES` configuration for colors and descriptions
- **Particle Effects**: Adjust visualization parameters in `ai-visualization.tsx`
- **Voice Settings**: Configure speech synthesis options in `use-speech.ts`

## 🌟 Key Features Explained

### **Adaptive Model Selection**
RADHIKA intelligently chooses the best model for your query:
- **Fast Model**: Quick responses for casual conversations
- **Reasoning Model**: Complex analysis, planning, and problem-solving
- **Creative Model**: Brainstorming, writing, and artistic tasks

### **Persistent Chat History**
- Each mode maintains separate conversation history
- Stored locally in browser with automatic cleanup
- Seamless switching between modes without context loss
- Export functionality for backup and sharing

### **Advanced Voice Integration**
- **Multi-language Support**: Automatic language detection
- **Natural Voices**: Gender and accent preferences
- **Emoji Filtering**: Clean text-to-speech without emoji artifacts
- **Interrupt Capability**: Stop speaking mid-response

### **Real-time Analytics**
- **Usage Patterns**: Track which modes you use most
- **Performance Metrics**: Response times and message counts
- **AI Status**: Live monitoring of system components

### **Responsive Design**
- **Mobile-First**: Optimized touch interfaces
- **Progressive Enhancement**: Works on all devices
- **Accessibility**: WCAG compliant with keyboard navigation
- **Performance**: Optimized loading and smooth animations

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow TypeScript best practices
   - Add tests for new functionality
   - Update documentation as needed
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### **Development Guidelines**
- Use TypeScript for all new code
- Follow the existing component structure
- Add proper error handling
- Include accessibility features
- Test on multiple devices and browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Community

- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/RS-labhub/radhika/issues)
- **Discussions**: Join conversations on [GitHub Discussions](https://github.com/RS-labhub/radhika/discussions)
- **Email**: Contact the maintainer at `rs4101976@gmail.com`
- **X/Twitter**: Follow updates [@rrs00179](https://x.com/rrs00179)


## 🔮 Roadmap

### **Upcoming Features**
- [ ] **Message Export**: Download chat history in multiple formats
- [ ] **Custom System Prompts**: User-defined AI personalities
- [ ] **Collaboration**: Share conversations and collaborate in real-time
- [ ] **Voice Cloning**: Personalized AI voice synthesis

### **Performance Improvements**
- [ ] **Caching**: Intelligent response caching for faster interactions
- [ ] **Compression**: Optimized message storage and transmission

---

## Meet the Author

<img  src="https://raw.githubusercontent.com/RS-labhub/Radhika/master/public/Author.jpg" alt="Author">

<div align="center">

**Built with ❤️ by [RS-labhub](https://github.com/RS-labhub)**

*RADHIKA - Your Adaptive AI Companion for Every Need*

[⭐ Star this repo](https://github.com/RS-labhub/radhika) • [🐛 Report Bug • 💡 Request Feature](https://github.com/RS-labhub/radhika/issues)

</div>
