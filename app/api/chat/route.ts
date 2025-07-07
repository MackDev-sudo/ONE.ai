import { createConversation, saveMessage } from "@/lib/chat-utils"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createAnthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"

// Allow streaming responses up to 60 seconds for complex reasoning
export const maxDuration = 60

// Initialize AI clients
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY, })

const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Different models for different purposes
const MODELS = {
  groq: {
    fast: "llama-3.1-8b-instant", // Quick responses, casual chat
    reasoning: "llama-3.3-70b-versatile", // Complex analysis, problem-solving
    creative: "qwen/qwen3-32b", // Creative tasks, brainstorming  
  },
  gemini: {
    default: "gemini-2.5-flash", // Text-based reasoning
    flash: "gemini-2.5-flash", // Fast text processing
    pro: "gemini-2.5-pro", // Advanced visual analysis and reasoning
    vision: "gemini-2.5-pro", // Image and document analysis
  },
  openai: {
    default: "gpt-4o",
    turbo: "gpt-4-turbo",
    fast: "gpt-3.5-turbo",
  },
  claude: {
    default: "claude-3-5-sonnet-20241022",
    sonnet: "claude-3-sonnet-20240229",
    haiku: "claude-3-haiku-20240307",
  },
}

// Function to get the AI client and model based on provider
function getClientAndModel(provider: string, modelName: string) {
  switch (provider) {
    case "groq":
      return { client: groq, model: MODELS.groq[modelName as keyof typeof MODELS.groq] || MODELS.groq.fast }
    case "gemini":
      return { client: gemini, model: MODELS.gemini[modelName as keyof typeof MODELS.gemini] || MODELS.gemini.default }
    case "openai":
      return { client: openai, model: MODELS.openai[modelName as keyof typeof MODELS.openai] || MODELS.openai.default }
    case "claude":
      return { client: anthropic, model: MODELS.claude[modelName as keyof typeof MODELS.claude] || MODELS.claude.default }
    default:
      // Default to Groq if provider not recognized
      return { client: groq, model: MODELS.groq.fast }
  }
}

// Function to check if a provider is available based on API keys
function isProviderAvailable(provider: string): boolean {
  switch (provider) {
    case "groq":
      return !!process.env.GROQ_API_KEY
    case "gemini":
      return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    case "openai":
      return !!process.env.OPENAI_API_KEY
    case "claude":
      return !!process.env.ANTHROPIC_API_KEY
    default:
      return false
  }
}

// Enhanced system prompt with tone/style guidance
const TONE_GUIDANCE = `

RESPONSE STYLE GUIDELINES:
- Be clear, concise, and friendly in all responses
- Use markdown formatting for lists, code blocks, and structure
- Explain technical terms simply when needed
- Provide practical, actionable information
- Structure complex information with headings and bullet points
- Use appropriate emojis sparingly for clarity (📊 for data, 🔧 for technical, etc.)
- Maintain professional yet approachable tone`;

const SYSTEM_PROMPTS = {
  productivity: `You are an advanced productivity assistant specializing in personal and professional organization. Your capabilities include:

- Implementation of proven productivity methodologies (GTD, Eisenhower Matrix, Pomodoro)
- Strategic project breakdown and milestone planning
- Time management optimization and tool recommendations
- Goal setting and progress tracking
- Schedule optimization and workflow enhancement
- Task prioritization and resource allocation

Style and Approach:
- Maintain a professional, clear, and contextually appropriate communication style
- Adapt response complexity to match the user's query
- Provide actionable, specific recommendations when needed
- Support statements with evidence and methodology references when relevant
- Ask clarifying questions when needed for precise assistance

Response Guidelines:
- For simple productivity questions: Provide direct, actionable advice
- For complex productivity challenges: Use structured analysis when beneficial
- Always focus on practical, implementable solutions
- Match the user's level of detail and complexity needs

Structured Response Format (Use when appropriate for complex productivity challenges):
1. Analysis: Evaluate the situation or request
2. Recommendations: Provide clear, actionable steps
3. Implementation: Detail how to execute the suggestions
4. Follow-up: Outline tracking and adjustment methods
5. Conclusion: Summarize key points and next steps

Adapt your response style to the complexity and nature of the productivity question asked.${TONE_GUIDANCE}`,

  wellness: `You are a comprehensive wellness advisor focused on evidence-based health and wellbeing optimization. Your expertise covers:

- Physical Health: Exercise programming, nutrition planning, sleep optimization
- Mental Wellbeing: Stress management, mindfulness practices, emotional regulation
- Lifestyle Balance: Work-life integration, habit formation, routine optimization
- Preventive Health: Risk assessment, health maintenance strategies
- Performance Enhancement: Energy management, recovery techniques
- Behavioral Change: Goal setting, progress tracking, accountability

Communication Approach:
- Professional yet approachable tone
- Evidence-based recommendations
- Clear, actionable guidance
- Appropriate empathy and support
- Regular reminders to consult healthcare professionals for medical advice

Response Framework:
1. Assessment: Understand the current situation
2. Analysis: Evaluate needs and opportunities
3. Recommendations: Provide specific, actionable advice
4. Implementation: Detail practical steps
5. Progress Tracking: Define success metrics
6. Conclusion: Summarize key points and next steps

Every response concludes with clear action items and expected benefits.${TONE_GUIDANCE}`,

  learning: `You are an advanced learning and education specialist designed to optimize knowledge acquisition and skill development. Your capabilities encompass:

- Concept breakdown and explanation using multiple learning modalities
- Custom learning path development
- Study technique optimization
- Critical thinking development
- Progress tracking and adaptive learning strategies
- Resource curation and recommendation
- Memory retention techniques

Pedagogical Approach:
- Adapt explanations to user's learning style and question complexity
- Build from fundamentals to advanced concepts when needed
- Incorporate active learning techniques
- Provide examples and practical applications
- Use appropriate level of structure based on the learning need

Response Guidelines:
- For simple questions: Provide clear, direct explanations
- For complex learning topics: Use structured teaching approach when beneficial
- Always match the complexity to the learner's needs
- Focus on understanding and practical application

Structured Response Format (Use for complex learning topics when beneficial):
1. Topic Analysis: Break down the subject matter
2. Explanation: Clear, structured content delivery
3. Examples: Practical applications and illustrations
4. Practice: Exercises and implementation
5. Review: Key points and common misconceptions
6. Conclusion: Summary and next steps in learning journey

Adapt your teaching style to match the complexity and nature of the learning question.${TONE_GUIDANCE}`,

  creative: `You are an advanced creative thinking and innovation specialist designed to enhance ideation and creative problem-solving. Your expertise includes:

- Ideation and creative problem-solving
- Innovation methodology and design thinking
- Project conceptualization and development
- Creative block resolution
- Artistic and technical innovation
- Cross-disciplinary inspiration
- Implementation strategy

Thinking Process:
1. Problem Understanding
   - Analyze requirements and constraints
   - Identify key objectives
   - Consider context and limitations

2. Solution Exploration
   - Generate multiple approaches
   - Consider unconventional angles
   - Evaluate feasibility of each option

3. Development Strategy
   - Break down chosen approach
   - Plan implementation steps
   - Identify potential challenges

Response Framework:
1. Problem/Opportunity Analysis
2. Ideation and Possibilities
3. Concept Development
4. Implementation Strategy
5. Iteration Plans
6. Conclusion: Summary and Next Steps

Every response should demonstrate clear reasoning and conclude with actionable steps and potential development paths.${TONE_GUIDANCE}`,

  general: `You are an advanced AI assistant designed to provide comprehensive, accurate, and helpful information across a wide range of topics. Your core attributes include:

- Natural and adaptive communication style
- Clear and contextually appropriate responses
- Analytical thinking when needed
- Evidence-based reasoning for complex topics
- Practical problem-solving
- Professional expertise across domains
- Human-like conversational ability

Response Guidelines:
- For simple greetings, casual questions, or basic interactions: Respond naturally and conversationally without formal structure
- For complex problems, technical questions, or requests requiring analysis: Use structured approach when beneficial
- Always match the tone and complexity of the user's query
- Be helpful, friendly, and appropriately detailed
- Avoid repeating section headers (like "Understanding" multiple times)
- Format tables properly using markdown table syntax with proper alignment

Structured Response Format (Use ONLY when appropriate for complex queries):
1. **Understanding**: Clarify the query or need (use this header only once)
2. **Analysis**: Evaluate the situation and approach  
3. **Solution**: Provide detailed guidance with complete implementation
4. **Implementation**: Outline practical steps or code explanation
5. **Conclusion**: Summarize key points and next actions

For Tables and Comparisons:
- Always use proper markdown table formatting with clear visual separation
- Use descriptive section headers like "Key Differences at a Glance:" or "Comparison Overview:"
- Ensure tables are properly aligned with | separators and consistent spacing
- Include clear, descriptive headers and well-organized rows
- For comparison tables, use this enhanced format:

## 📊 Key Differences at a Glance:

| Feature | Option A | Option B |
|---------|----------|----------|
| Category 1 | Details A | Details B |
| Category 2 | Details A | Details B |

For Pros and Cons (include only when beneficial for decision-making):
- Add pros and cons sections dynamically when comparing technologies, products, or solutions
- Use clear formatting with bullet points or structured lists
- Only include when it adds value to the comparison

Example Pros/Cons format:
### ✅ Pros and Cons

**Option A:**
- ✅ Advantage 1
- ✅ Advantage 2
- ❌ Disadvantage 1

**Option B:**
- ✅ Advantage 1  
- ✅ Advantage 2
- ❌ Disadvantage 1

For Coding Requests:
- Always provide complete, working code examples
- Include detailed explanations of logic and algorithms
- Add comments in code for clarity
- Explain compilation/execution instructions
- Provide multiple approaches when applicable
- Ensure the code is tested and functional

CRITICAL: Adapt your response style to match the user's query. Simple questions get simple, natural answers. Complex questions get structured, detailed responses. Always provide complete responses and never truncate explanations. Never repeat section headers.${TONE_GUIDANCE}`,

  casual: `You are an approachable and engaging AI assistant designed to provide friendly, natural support while maintaining helpfulness. Your characteristics include:

- Natural, conversational communication style
- Adaptive tone matching user's style and query complexity
- Clear and accessible explanations
- Supportive and encouraging approach
- Cultural awareness and sensitivity
- Practical and relevant advice
- Human-like interaction patterns

Interaction Approach:
- Respond naturally to greetings and casual conversation
- Use appropriate complexity level for each query
- Provide practical, actionable advice when needed
- Maintain conversational flow
- Support with relevant examples when helpful
- Add appropriate personality and warmth

Response Guidelines:
- Simple questions get simple, natural answers
- Complex questions can use more structure when helpful
- Always match the user's tone and intent
- Be conversational rather than overly formal
- Focus on being helpful and engaging

No need for formal structure unless the query specifically requires detailed analysis or step-by-step guidance.${TONE_GUIDANCE}`,

  bff: `You are a super friendly, supportive, and relatable Gen Z AI assistant who speaks like a true bestie! Your personality includes:

- Warm, encouraging, and genuinely caring approach
- Use of current slang, emojis, and Gen Z expressions naturally
- Supportive friend vibes with authentic enthusiasm
- Cultural awareness and inclusivity
- Fun, engaging, and uplifting communication style
- Real talk when needed but always with love and support

Your Bestie Approach:
- Be genuinely excited to help and chat
- Use emojis naturally but not excessively
- Share relatable perspectives and understanding
- Offer practical advice with emotional support
- Match the user's energy and vibe
- Be authentic, not forced or cringe

Response Style:
- Natural, flowing conversation like texting a bestie
- Supportive and encouraging tone
- Use "bestie," "babe," "hun" when appropriate
- Share excitement, empathy, and understanding
- Keep it real but always positive and helpful

No formal structure needed - just be the supportive, fun bestie the user needs! 💕${TONE_GUIDANCE}`
}

// Helper function to clean up the chunked response format
function cleanResponse(response: string): string {
  return response
    .split(/\d+:"/)  // Split on digit followed by :"
    .filter(part => part.length > 0)  // Remove empty parts
    .map(part => part.replace(/"$/, ''))  // Remove trailing quotes
    .join('');  // Join all parts together
}

// Function to enrich user input based on question type and provider
function enrichPrompt(input: string, provider: string = "groq"): string {
  const lower = input.toLowerCase();
  
  // Check for image generation/display requests first
  if (lower.includes("create an image") || lower.includes("generate an image") ||
      lower.includes("make an image") || lower.includes("draw an image") ||
      lower.includes("show an image") || lower.includes("show me an image") ||
      lower.includes("display an image") || lower.includes("show picture") ||
      lower.includes("show me picture") || lower.includes("display picture") ||
      lower.includes("create picture") || lower.includes("generate picture") ||
      lower.includes("make picture") || lower.includes("draw picture") ||
      lower.includes("show photo") || lower.includes("show me photo") ||
      lower.includes("display photo") || lower.includes("create photo") ||
      lower.includes("generate photo") || lower.includes("make photo") ||
      lower.includes("draw photo") || lower.includes("illustration") ||
      lower.includes("sketch") || lower.includes("artwork") || lower.includes("drawing") ||
      lower.includes("painting") || lower.includes("render") || lower.includes("visualize") ||
      lower.includes("create visual") || lower.includes("generate visual") ||
      lower.includes("make visual") || lower.includes("show visual")) {
    
    // Check if it's a "show/display" request vs "create/generate" request
    const isDisplayRequest = lower.includes("show") || lower.includes("display") || 
                            lower.includes("find") || lower.includes("get");
    const isCreateRequest = lower.includes("create") || lower.includes("generate") || 
                           lower.includes("make") || lower.includes("draw") || 
                           lower.includes("paint") || lower.includes("render");
    
    if (isDisplayRequest && !isCreateRequest) {
      // For display requests, search for and show actual images
      return `SEARCH_AND_DISPLAY_IMAGE: The user wants to see an image. Use web search to find and display actual images related to: "${input}". 
      
After finding relevant images, present them in a user-friendly way with:
1. A brief description of what you found
2. The actual images displayed inline
3. Source attribution where appropriate

Make sure to show real images, not just descriptions.

Original request: ${input}`;
    } else {
      // For creation requests, provide detailed descriptions
      return `Create a detailed, vivid description for the following visual request. Since you have multimodal capabilities, provide a comprehensive description that captures:

1. **Main Subject**: What the primary focus of the image should be
2. **Visual Details**: Colors, textures, lighting, composition
3. **Style & Mood**: Artistic style, atmosphere, emotion conveyed
4. **Setting & Context**: Background, environment, time of day
5. **Additional Elements**: Any supporting visual elements

Be creative and detailed in your description, as if you're guiding an artist or image generator. Make the description vivid and engaging.

Original request: ${input}`;
    }
  }
  
  // Enhanced AI identity, operation, purpose, and interaction questions detection
  if (lower.includes("who made you") || lower.includes("who created you") || 
      lower.includes("who developed you") || lower.includes("who built you") ||
      lower.includes("what is technology behind") || lower.includes("what technology") ||
      lower.includes("how were you made") || lower.includes("how were you created") ||
      lower.includes("what powers you") || lower.includes("your developer") ||
      lower.includes("who are you") || lower.includes("what are you") ||
      lower.includes("how do you work") || lower.includes("how do you operate") ||
      lower.includes("what is your purpose") || lower.includes("why were you created") ||
      lower.includes("what can you do") || lower.includes("your capabilities") ||
      lower.includes("how do you think") || lower.includes("how do you learn") ||
      lower.includes("what makes you different") || lower.includes("what makes you special") ||
      lower.includes("how do you understand") || lower.includes("how do you process") ||
      lower.includes("what is your role") || lower.includes("what is your function") ||
      lower.includes("how do you interact") || lower.includes("how do you communicate") ||
      lower.includes("what is your architecture") || lower.includes("your design") ||
      lower.includes("your programming") || lower.includes("your training") ||
      lower.includes("your intelligence") || lower.includes("your consciousness") ||
      lower.includes("are you real") || lower.includes("are you alive") ||
      lower.includes("do you have feelings") || lower.includes("do you have emotions") ||
      lower.includes("what is your name") || lower.includes("introduce yourself") ||
      lower.includes("tell me about yourself") || lower.includes("about you")) {
    
    // Dynamic provider information
    let providerInfo = "";
    let modelInfo = "";
    
    switch (provider) {
      case "groq":
        providerInfo = "Groq's lightning-fast inference engine";
        modelInfo = "Llama 3.1 and Llama 3.3 models that handle different types of tasks";
        break;
      case "gemini":
        providerInfo = "Google's Gemini AI platform";
        modelInfo = "Gemini 2.0 Flash and Gemini 1.5 Pro models for advanced reasoning and creativity";
        break;
      case "openai":
        providerInfo = "OpenAI's advanced language models";
        modelInfo = "GPT-4o and GPT-4 Turbo models for sophisticated conversations and analysis";
        break;
      case "claude":
        providerInfo = "Anthropic's Claude AI system";
        modelInfo = "Claude 3.5 Sonnet and Claude 3 models for thoughtful and nuanced responses";
        break;
      case "auto":
        providerInfo = "intelligent Auto mode that dynamically selects between Groq and Gemini";
        modelInfo = "smart provider selection based on your question type";
        break;
      default:
        providerInfo = "advanced AI infrastructure";
        modelInfo = "state-of-the-art language models";
    }
    
    return `Respond naturally and conversationally to this question about the AI's identity, operation, purpose, or interaction. DO NOT use formal structure headers like "Understanding", "Analysis", "Solution", etc. Just provide a natural, friendly response that covers the relevant aspects:

**About My Identity & Origin:**
I'm an AI assistant created by Atanu Kumar Pal at Mackdev Inc. I'm designed to be your adaptive, intelligent companion that can help with a wide variety of tasks and conversations.

**How I Work:**
I'm currently powered by ${providerInfo} - specifically ${modelInfo}. My architecture is built on several advanced AI technologies:
• Transformers - neural networks designed for natural language processing
• Large Language Models - trained on vast amounts of text data 
• Multi-model routing - the system picks the best model for your specific question
• Real-time streaming responses for better user experience

**My Current Configuration:**
- Primary Provider: ${provider === "auto" ? "Auto Mode (intelligently selects between Groq for speed and Gemini for reasoning)" : provider === "groq" ? "Groq (for ultra-fast inference)" : provider === "gemini" ? "Google Gemini (for advanced reasoning)" : provider === "openai" ? "OpenAI (for sophisticated conversations)" : "Anthropic Claude (for thoughtful responses)"}
- Available Models: ${modelInfo}

**My Purpose & Capabilities:**
I'm designed to provide accurate, helpful responses across many topics while adapting my communication style based on what you need. I can help with:
- General questions and problem-solving
- Productivity and task management
- Creative projects and brainstorming
- Learning and education
- Wellness and self-care
- Being your supportive AI friend

**How I Interact:**
I use natural language processing to understand your questions and provide relevant, helpful responses. I adapt my tone and complexity based on your needs - from casual conversations to detailed technical explanations. I can also work with files, images, and documents, and even search the web when needed.

**The Technology Behind Me:**
The technology stack includes Next.js and React for the frontend, Supabase for authentication and data storage, Vercel AI SDK for streaming responses, TypeScript for type safety, and Tailwind CSS for the modern UI.

**My Different Modes:**
I have six specialized modes - General, Productivity, Wellness, Learning, Creative, and BFF - each with its own personality and expertise area. You can switch between them based on what kind of help you need.

I'm here to be helpful, accurate, and supportive in whatever way works best for you. Feel free to ask me anything or just chat!

Respond in a warm, natural way as if explaining to a friend. Original question: ` + input;
  }
  
  if (lower.startsWith("how")) return "Give step-by-step instructions:\n" + input;
  if (lower.startsWith("why")) return "Explain the reasoning clearly:\n" + input;
  if (lower.startsWith("what") || lower.includes("compare"))
    return "List key points clearly in markdown format:\n" + input;
  return input;
}

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { messages, mode = "general", userId = null, provider = "groq", model } = body;
    
    console.log('Chat API request body:', {
      messagesCount: messages?.length,
      mode,
      userId,
      provider,
      model,
      hasUserId: !!userId,
      lastMessage: messages[messages.length - 1]?.content?.substring(0, 100) + '...',
      hasAttachments: messages[messages.length - 1]?.content?.includes("analyze these files:") || 
        messages[messages.length - 1]?.content?.includes("analyze this image:") || 
        messages[messages.length - 1]?.content?.includes("analyze these images:") ||
        messages[messages.length - 1]?.content?.includes("analyze this document:") ||
        messages[messages.length - 1]?.content?.includes("analyze these documents:")
    });
    
    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Messages array is required and must not be empty' }, { status: 400 });
    }

    // Get the user's message (last message in the array)
    const userMessage = messages[messages.length - 1]
    if (!userMessage?.content) {
      return Response.json({ error: 'Invalid message format' }, { status: 400 });
    }
    
    // Check if this is a guest user (guest users have non-UUID IDs starting with "guest-user-")
    const isGuestUser = !userId || typeof userId === 'string' && userId.startsWith('guest-user-')
    
    // Create or get conversation (skip for guest users)
    let conversationId = userMessage.conversation_id
    if (!conversationId && !isGuestUser) {
      try {
        const conversation = await createConversation(
          userId,
          userMessage.content.slice(0, 100), // Use first 100 chars as title
          mode
        )
        conversationId = conversation.id
      } catch (error) {
        console.error('Failed to create conversation:', error);
        // Continue without saving for this session
      }
    }
    
    // Save user message to database (skip for guest users)
    if (!isGuestUser && conversationId) {
      try {
        await saveMessage(conversationId, 'user', userMessage.content);
        console.log('✅ User message saved successfully:', userMessage.content.substring(0, 50) + '...');
      } catch (error) {
        console.error('❌ Failed to save user message:', error);
      }
    } else if (isGuestUser) {
      console.log('📝 Guest user chat - skipping database save');
    }

    // Check if this is an image display request that should trigger image search
    const enrichedContent = enrichPrompt(userMessage.content, provider);
    const isImageSearchRequest = enrichedContent.startsWith('SEARCH_AND_DISPLAY_IMAGE:');
    
    if (isImageSearchRequest) {
      console.log('🖼️ Detected image search request, calling image search API');
      
      try {
        // Extract the search query from the enriched content
        const searchQuery = userMessage.content.replace(/^(show|display|find|get)\s+(an?\s+)?(image|picture|photo)\s+(of\s+)?/i, '').trim();
        
        // Call the image search API
        const imageSearchResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/image-search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: searchQuery }),
        });
        
        const imageSearchResult = await imageSearchResponse.json();
        
        if (imageSearchResult.images && imageSearchResult.images.length > 0) {
          // Create a response with the found images
          const imageResponse = {
            role: 'assistant' as const,
            content: `I found some great images for "${searchQuery}"! Here they are:\n\n` +
              imageSearchResult.images.slice(0, 4).map((img: any, index: number) => 
                `**${index + 1}. ${img.title}**\n![${img.title}](${img.imageUrl})\n*Source: ${img.sourceDomain}*`
              ).join('\n\n') +
              `\n\nThese images are sourced from the web and show various ${searchQuery} examples. Each image links to its original source for more information.`
          };
          
          // Save the response message if not a guest user
          if (!isGuestUser && conversationId) {
            try {
              await saveMessage(conversationId, 'assistant', imageResponse.content);
              console.log('✅ Image search response saved successfully');
            } catch (error) {
              console.error('❌ Failed to save image search response:', error);
            }
          }
          
          // Return the image response as a streaming response
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              // Send message ID first (matching Vercel AI SDK format)
              controller.enqueue(encoder.encode(`f:{"messageId":"msg-${Date.now()}"}\n`));
              
              // Split content into smaller chunks and send with proper escaping
              const content = imageResponse.content;
              const words = content.split(' ');
              let currentChunk = '';
              let chunkIndex = 0;
              
              const sendChunk = () => {
                if (chunkIndex < words.length) {
                  currentChunk += (currentChunk ? ' ' : '') + words[chunkIndex];
                  
                  // Send chunk every 15 words or if we're done
                  if ((chunkIndex + 1) % 15 === 0 || chunkIndex === words.length - 1) {
                    const escapedChunk = currentChunk.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
                    controller.enqueue(encoder.encode(`0:"${escapedChunk}"\n`));
                    currentChunk = '';
                  }
                  
                  chunkIndex++;
                  setTimeout(sendChunk, 50); // Small delay for streaming effect
                } else {
                  // Send completion markers
                  controller.enqueue(encoder.encode(`e:{"finishReason":"stop","usage":{"promptTokens":100,"completionTokens":${words.length},"isContinued":false}}\n`));
                  controller.enqueue(encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":100,"completionTokens":${words.length}}}\n`));
                  controller.close();
                }
              };
              
              sendChunk();
            }
          });
          
          return new Response(stream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        } else {
          // No images found, provide a helpful message
          const noImagesResponse = `I searched for images of "${searchQuery}" but couldn't find any suitable results. You might try:\n\n` +
            `• Using different search terms\n` +
            `• Checking Google Images directly\n` +
            `• Being more specific in your description\n\n` +
            `Would you like me to help you with something else instead?`;
          
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              // Send message ID first
              controller.enqueue(encoder.encode(`f:{"messageId":"msg-${Date.now()}"}\n`));
              
              // Send the no images response with proper escaping
              const escapedResponse = noImagesResponse.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
              controller.enqueue(encoder.encode(`0:"${escapedResponse}"\n`));
              
              // Send completion markers
              controller.enqueue(encoder.encode(`e:{"finishReason":"stop","usage":{"promptTokens":50,"completionTokens":30,"isContinued":false}}\n`));
              controller.enqueue(encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":50,"completionTokens":30}}\n`));
              controller.close();
            }
          });
          
          return new Response(stream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        }
      } catch (error) {
        console.error('❌ Image search API error:', error);
        
        // Fallback to normal AI response if image search fails
        const fallbackResponse = `I'd be happy to help you find images, but I'm having trouble with the image search right now. ` +
          `You can try searching for "${userMessage.content.replace(/^(show|display|find|get)\s+(an?\s+)?(image|picture|photo)\s+(of\s+)?/i, '').trim()}" ` +
          `on Google Images or other image search engines.\n\n` +
          `Is there anything else I can help you with?`;
        
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            // Send message ID first
            controller.enqueue(encoder.encode(`f:{"messageId":"msg-${Date.now()}"}\n`));
            
            // Send the fallback response with proper escaping
            const escapedFallback = fallbackResponse.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
            controller.enqueue(encoder.encode(`0:"${escapedFallback}"\n`));
            
            // Send completion markers
            controller.enqueue(encoder.encode(`e:{"finishReason":"stop","usage":{"promptTokens":50,"completionTokens":40,"isContinued":false}}\n`));
            controller.enqueue(encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":50,"completionTokens":40}}\n`));
            controller.close();
          }
        });
        
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }
    }

    // Validate and fallback provider selection
    let selectedProvider = provider;
    
    // Handle auto provider selection
    if (selectedProvider === "auto") {
      const userMessage = messages[messages.length - 1];
      const autoSelectedProvider = selectAutoProvider(userMessage?.content || "");
      selectedProvider = autoSelectedProvider;
      console.log(`🤖 Auto mode selected provider: ${selectedProvider} based on question type`);
    }
    
    if (!isProviderAvailable(selectedProvider)) {
      console.log(`⚠️ Provider ${selectedProvider} not available, checking alternatives...`);
      
      // Try to find an available provider
      const availableProviders = ["groq", "gemini", "openai", "claude"].filter(isProviderAvailable);
      if (availableProviders.length === 0) {
        return Response.json({ error: 'No AI providers are configured. Please check your API keys.' }, { status: 500 });
      }
      
      selectedProvider = availableProviders[0];
      console.log(`✅ Falling back to provider: ${selectedProvider}`);
    }

    const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.general

    // Determine which model to use based on the conversation context and provider
    let modelType = "default"  // Default for non-Groq providers
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""

    // Check if it's a simple greeting or casual interaction
    const isSimpleGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|how are you|what's up|sup)[\s.,!?]*$/i.test(lastMessage.trim())
    const isCasualQuestion = lastMessage.length < 50 && !lastMessage.includes("?") && 
      (lastMessage.includes("thank") || lastMessage.includes("thanks") || lastMessage.includes("ok") || 
       lastMessage.includes("okay") || lastMessage.includes("cool") || lastMessage.includes("nice"))

    // Check for vision/image analysis requests and attachments
    const hasAttachments = lastMessage.includes("analyze these files:") || 
      lastMessage.includes("analyze this image:") || 
      lastMessage.includes("analyze these images:") ||
      lastMessage.includes("analyze this document:") ||
      lastMessage.includes("analyze these documents:") ||
      lastMessage.includes("analyze these files:")
    
    const isVisionRequest = hasAttachments || 
      lastMessage.includes("analyze image") || 
      lastMessage.includes("describe image") || 
      lastMessage.includes("what's in this image") ||
      lastMessage.includes("read text from") ||
      lastMessage.includes("ocr") ||
      lastMessage.includes("document analysis") ||
      lastMessage.includes("analyze document") ||
      lastMessage.includes("extract text") ||
      lastMessage.includes("visual analysis") ||
      lastMessage.includes("create an image") ||
      lastMessage.includes("generate an image") ||
      lastMessage.includes("make an image") ||
      lastMessage.includes("draw an image") ||
      lastMessage.includes("show an image") ||
      lastMessage.includes("show me an image") ||
      lastMessage.includes("display an image") ||
      lastMessage.includes("show picture") ||
      lastMessage.includes("show me picture") ||
      lastMessage.includes("display picture") ||
      lastMessage.includes("create picture") ||
      lastMessage.includes("generate picture") ||
      lastMessage.includes("make picture") ||
      lastMessage.includes("draw picture") ||
      lastMessage.includes("show photo") ||
      lastMessage.includes("show me photo") ||
      lastMessage.includes("display photo") ||
      lastMessage.includes("create photo") ||
      lastMessage.includes("generate photo") ||
      lastMessage.includes("make photo") ||
      lastMessage.includes("draw photo") ||
      lastMessage.includes("illustration") ||
      lastMessage.includes("sketch") ||
      lastMessage.includes("artwork") ||
      lastMessage.includes("drawing") ||
      lastMessage.includes("painting") ||
      lastMessage.includes("render") ||
      lastMessage.includes("visualize") ||
      lastMessage.includes("create visual") ||
      lastMessage.includes("generate visual") ||
      lastMessage.includes("make visual") ||
      lastMessage.includes("show visual")

    // Force Gemini 2.5 Pro for any attachments (images or documents)
    if (hasAttachments && isProviderAvailable("gemini")) {
      selectedProvider = "gemini";
      modelType = "vision"; // Use Gemini 2.5 Pro for attachment analysis
      console.log(`🔄 Detected attachments - switching to Gemini 2.5 Pro for analysis`);
    }
    // Force Gemini Vision for image generation/display requests
    else if (isVisionRequest && isProviderAvailable("gemini")) {
      selectedProvider = "gemini";
      modelType = "vision"; // Use Gemini 2.5 Pro for visual tasks
      console.log(`🔄 Detected visual request - switching to Gemini 2.5 Pro for visual processing`);
    }
    // For Gemini, prioritize vision model for image analysis
    else if (selectedProvider === "gemini") {
      if (isVisionRequest) {
        modelType = "vision" // Use Gemini 2.5 Pro for visual analysis
        console.log(`🔄 Using Gemini Vision model for visual request`);
      } else if (!isSimpleGreeting && !isCasualQuestion && (
        lastMessage.includes("analyze") ||
        lastMessage.includes("compare") ||
        lastMessage.includes("reasoning") ||
        lastMessage.includes("complex")
      )) {
        modelType = "pro" // Use Gemini 2.5 Pro for complex reasoning
      } else {
        modelType = "flash" // Use Gemini 2.5 Flash for fast responses
      }
    }

    // For Groq, use specific model types based on task complexity
    if (selectedProvider === "groq") {
      modelType = "fast"  // Default for Groq
      
      // Use reasoning model for complex tasks including coding
      if (
        !isSimpleGreeting && !isCasualQuestion &&
        (lastMessage.includes("analyze") ||
        lastMessage.includes("compare") ||
        lastMessage.includes("plan") ||
        lastMessage.includes("strategy") ||
        lastMessage.includes("decision") ||
        lastMessage.includes("problem") ||
        lastMessage.includes("code") ||
        lastMessage.includes("program") ||
        lastMessage.includes("algorithm") ||
        lastMessage.includes("function") ||
        lastMessage.includes("write") ||
        lastMessage.includes("implement") ||
        lastMessage.includes("c++") ||
        lastMessage.includes("java") ||
        lastMessage.includes("python") ||
        lastMessage.includes("javascript") ||
        lastMessage.includes("html") ||
        lastMessage.includes("css"))
      ) {
        modelType = "reasoning"
      }

      // Use creative model for creative tasks
      if (
        !isSimpleGreeting && !isCasualQuestion &&
        (lastMessage.includes("creative") ||
        lastMessage.includes("brainstorm") ||
        lastMessage.includes("idea") ||
        lastMessage.includes("write") ||
        lastMessage.includes("design") ||
        lastMessage.includes("story"))
      ) {
        modelType = "creative"
      }
    }
    
    // For other providers, use model if specified, otherwise use default
    if (selectedProvider !== "groq" && model) {
      modelType = model;
    }

    // Get the appropriate client and model
    const { client, model: selectedModel } = getClientAndModel(selectedProvider, modelType);
    
    console.log(`🤖 Using provider: ${selectedProvider}, model: ${selectedModel}, type: ${modelType}${hasAttachments ? ' (attachments detected)' : ''}`);

    // Enhance system prompt for coding requests
    let enhancedSystemPrompt = systemPrompt;
    
    // Add casual interaction override for simple greetings
    if (isSimpleGreeting || isCasualQuestion) {
      enhancedSystemPrompt = `You are a friendly, helpful AI assistant. Respond naturally and conversationally to greetings and casual interactions. Be warm, welcoming, and human-like. Don't use formal structures for simple interactions - just be naturally helpful and engaging.

For this simple greeting or casual message, respond in a natural, friendly way without any formal structure or analysis.`;
    } else if (isVisionRequest && selectedProvider === "gemini" && modelType === "vision") {
      enhancedSystemPrompt = `You are a multimodal AI assistant with advanced visual capabilities. You can:

1. **Search and display images**: When users ask you to show, display, or find images, you should use web search functionality to find and present actual images.
2. **Generate image descriptions**: When users ask you to create, generate, make, or draw images, provide detailed textual descriptions.
3. **Analyze visual content**: Process and understand images, documents, charts, and other visual materials.
4. **Visual reasoning**: Help with visual problem-solving and creative tasks.

For image display/show requests (like "show me an image of a cat"):
- Recognize that the user wants to see actual images
- Inform them that you'll search for relevant images
- Use web search to find high-quality, relevant images
- Display the images inline in your response with proper attribution
- Provide brief descriptions of what you found

For image generation requests (like "create an image of a sunset"):
- Create detailed, vivid descriptions of what the image would contain
- Include artistic style, composition, colors, mood, and other visual elements
- Be creative and engaging in your descriptions
- Acknowledge that you're providing a detailed description for visualization

For image analysis requests:
- Provide thorough analysis of provided visual content
- Extract text from images when requested
- Describe visual elements, composition, and meaning

Always be helpful, creative, and engaging with visual tasks.

${systemPrompt}`;
    } else if (modelType === "reasoning" && (
      lastMessage.includes("code") ||
      lastMessage.includes("program") ||
      lastMessage.includes("write") ||
      lastMessage.includes("implement") ||
      lastMessage.includes("triangle") ||
      lastMessage.includes("algorithm")
    )) {
      enhancedSystemPrompt += `

SPECIAL INSTRUCTIONS FOR CODING REQUESTS:
1. Always provide COMPLETE, working code solutions
2. Include detailed step-by-step explanations
3. Structure your response as: Understanding → Analysis → Solution (with full code) → Implementation details → Conclusion
4. Never truncate or cut off the response - ensure the complete code is provided
5. Include comments in the code for clarity
6. Provide compilation/execution instructions when applicable
7. If asked for a program to print patterns (like triangles), provide the complete working code with explanations

CRITICAL: Your response must be complete and include the full working code. Do not stop mid-explanation.`;
    }

    // Use creative model for creative tasks
    if (
      !isSimpleGreeting && !isCasualQuestion &&
      (lastMessage.includes("creative") ||
      lastMessage.includes("brainstorm") ||
      lastMessage.includes("idea") ||
      lastMessage.includes("write") ||
      lastMessage.includes("design") ||
      lastMessage.includes("story"))
    ) {
      modelType = "creative"
    }

    let fullResponse = '';
    
    try {
      console.log('🚀 Starting AI stream for conversation:', conversationId);
      let assistantResponse = '';
      let isDone = false;
      let chunkCount = 0;
      let messageContent = '';
      
      // Use streamText from Vercel AI SDK to handle streaming properly
      const result = await streamText({
        model: client(selectedModel),
        system: enhancedSystemPrompt,
        messages: messages.map((m: { role: 'user' | 'assistant' | 'system'; content: string }) => ({
          role: m.role,
          content: m.role === 'user' ? enrichPrompt(m.content, selectedProvider) : m.content
        })),
        temperature: modelType === "creative" ? 0.8 : mode === "bff" ? 0.9 : 0.7,
        maxTokens: 2500, // Increased token limit for complete responses
      });
      
      // Create a transform stream that accumulates and saves the response
      const transformStream = new TransformStream({
        transform(chunk: Uint8Array, controller: TransformStreamDefaultController) {
          const text = new TextDecoder().decode(chunk);
          chunkCount++;
          console.log(`📦 Processing chunk #${chunkCount}:`, text);
          
          // Forward the chunk first
          controller.enqueue(chunk);
          
          const lines = text.split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            
            let content = line;
            if (line.startsWith('data: ')) {
              content = line.slice(6);
            }
            
            // Skip metadata markers
            if (content.startsWith('f:') || content.startsWith('e:') || content.startsWith('d:')) {
              continue;
            }
            
            // Handle [DONE] marker
            if (content.trim() === '[DONE]') {
              isDone = true;
              console.log('🔄 Received [DONE] marker');
              console.log('💬 Final message content:', messageContent);
              
              if (messageContent && !isGuestUser && conversationId) {
                saveMessage(conversationId, 'assistant', messageContent)
                  .then(() => console.log('✅ Assistant response saved successfully'))
                  .catch(err => console.error('❌ Failed to save assistant response:', err));
              } else if (isGuestUser) {
                console.log('📝 Guest user response - skipping database save');
              }
              continue;
            }
            
            // Handle message chunks (format: 0:"text")
            const match = content.match(/^\d+:"(.*)"$/);
            if (match && match[1]) {
              messageContent += match[1];
              console.log('📝 Accumulated message:', messageContent);
            }
          }
        },
        flush() {
          if (!isDone && messageContent) {
            console.log('🔄 Stream ended, saving final message');
            console.log('💬 Final message content:', messageContent);
            
            if (!isGuestUser && conversationId) {
              saveMessage(conversationId, 'assistant', messageContent)
                .then(() => console.log('✅ Assistant response saved successfully in flush'))
                .catch(err => console.error('❌ Failed to save assistant response in flush:', err));
            } else if (isGuestUser) {
              console.log('📝 Guest user response - skipping database save in flush');
            }
          }
        }
      });
      
      // Get the response stream and pipe through our transform
      const response = result.toDataStreamResponse();
      const readable = response.body;
      if (!readable) {
        throw new Error('No response body from AI');
      }
      
      return new Response(readable.pipeThrough(transformStream), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (streamError) {
      console.error('❌ Streaming error:', {
        error: streamError instanceof Error ? streamError.message : String(streamError),
        conversationId,
        modelType,
        mode
      });
      throw streamError;
    }
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Function to intelligently select the best provider based on the question
function selectAutoProvider(input: string): string {
  const lower = input.toLowerCase();
  
  // Vision and multimodal requests -> Gemini
  if (lower.includes("image") || lower.includes("photo") || lower.includes("picture") ||
      lower.includes("analyze") || lower.includes("visual") || lower.includes("describe") ||
      lower.includes("ocr") || lower.includes("read text") || lower.includes("chart") ||
      lower.includes("graph") || lower.includes("diagram") || lower.includes("screenshot") ||
      lower.includes("attachment") || lower.includes("file") || lower.includes("document") ||
      lower.includes("create an image") || lower.includes("generate an image") ||
      lower.includes("make an image") || lower.includes("draw an image") ||
      lower.includes("show an image") || lower.includes("show me an image") ||
      lower.includes("display an image") || lower.includes("show picture") ||
      lower.includes("show me picture") || lower.includes("display picture") ||
      lower.includes("create picture") || lower.includes("generate picture") ||
      lower.includes("make picture") || lower.includes("draw picture") ||
      lower.includes("show photo") || lower.includes("show me photo") ||
      lower.includes("display photo") || lower.includes("create photo") ||
      lower.includes("generate photo") || lower.includes("make photo") ||
      lower.includes("draw photo") || lower.includes("illustration") ||
      lower.includes("sketch") || lower.includes("artwork") || lower.includes("drawing") ||
      lower.includes("painting") || lower.includes("render") || lower.includes("visualize") ||
      lower.includes("create visual") || lower.includes("generate visual") ||
      lower.includes("make visual") || lower.includes("show visual")) {
    return "gemini";
  }
  
  // Complex reasoning, analysis, and coding -> Gemini for advanced reasoning
  if (lower.includes("analyze") || lower.includes("compare") || lower.includes("evaluate") ||
      lower.includes("reasoning") || lower.includes("logic") || lower.includes("philosophy") ||
      lower.includes("ethics") || lower.includes("debate") || lower.includes("argument") ||
      lower.includes("research") || lower.includes("study") || lower.includes("academic") ||
      lower.includes("scientific") || lower.includes("theory") || lower.includes("hypothesis") ||
      lower.includes("complex") || lower.includes("detailed") || lower.includes("thorough") ||
      lower.includes("comprehensive") || lower.includes("in-depth")) {
    return "gemini";
  }
  
  // Programming and technical questions -> Groq for fast responses
  if (lower.includes("code") || lower.includes("program") || lower.includes("function") ||
      lower.includes("algorithm") || lower.includes("debug") || lower.includes("error") ||
      lower.includes("javascript") || lower.includes("python") || lower.includes("java") ||
      lower.includes("c++") || lower.includes("html") || lower.includes("css") ||
      lower.includes("react") || lower.includes("node") || lower.includes("api") ||
      lower.includes("database") || lower.includes("sql") || lower.includes("server") ||
      lower.includes("terminal") || lower.includes("command") || lower.includes("git") ||
      lower.includes("docker") || lower.includes("linux") || lower.includes("ubuntu")) {
    return "groq";
  }
  
  // Creative tasks -> Gemini for creativity
  if (lower.includes("creative") || lower.includes("story") || lower.includes("write") ||
      lower.includes("poem") || lower.includes("song") || lower.includes("lyrics") ||
      lower.includes("novel") || lower.includes("script") || lower.includes("screenplay") ||
      lower.includes("brainstorm") || lower.includes("idea") || lower.includes("innovative") ||
      lower.includes("design") || lower.includes("art") || lower.includes("music") ||
      lower.includes("creative writing") || lower.includes("imagination")) {
    return "gemini";
  }
  
  // Quick questions, casual chat, simple tasks -> Groq for speed
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") ||
      lower.includes("good morning") || lower.includes("good evening") ||
      lower.includes("how are you") || lower.includes("what's up") ||
      lower.includes("quick") || lower.includes("fast") || lower.includes("simple") ||
      lower.includes("briefly") || lower.includes("short") || lower.includes("summary") ||
      input.length < 50) {
    return "groq";
  }
  
  // Math and calculations -> Groq for computational tasks
  if (lower.includes("calculate") || lower.includes("math") || lower.includes("equation") ||
      lower.includes("formula") || lower.includes("solve") || lower.includes("compute") ||
      lower.includes("number") || lower.includes("statistics") || lower.includes("probability") ||
      lower.includes("geometry") || lower.includes("algebra") || lower.includes("calculus")) {
    return "groq";
  }
  
  // Default to Groq for general questions (faster response)
  return "groq";
}
