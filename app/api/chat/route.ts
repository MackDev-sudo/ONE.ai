import { createConversation, saveMessage } from "@/lib/chat-utils"
import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 60 seconds for complex reasoning
export const maxDuration = 60

// Initialize Groq client with the OpenAI-compatible API
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
})

// Different models for different purposes
const MODELS = {
  groq: {
    fast: "llama-3.1-8b-instant", // Quick responses, casual chat
    reasoning: "llama-3.3-70b-versatile", // Complex analysis, problem-solving
    creative: "qwen/qwen3-32b", // Creative tasks, brainstorming  
  },
  gemini: {
    default: "gemini-2.0-flash",
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

Adapt your response style to the complexity and nature of the productivity question asked.`,

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

Every response concludes with clear action items and expected benefits.`,

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

Adapt your teaching style to match the complexity and nature of the learning question.`,

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

Every response should demonstrate clear reasoning and conclude with actionable steps and potential development paths.`,

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

CRITICAL: Adapt your response style to match the user's query. Simple questions get simple, natural answers. Complex questions get structured, detailed responses. Always provide complete responses and never truncate explanations. Never repeat section headers.`,

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

No need for formal structure unless the query specifically requires detailed analysis or step-by-step guidance.`
}

// Helper function to clean up the chunked response format
function cleanResponse(response: string): string {
  return response
    .split(/\d+:"/)  // Split on digit followed by :"
    .filter(part => part.length > 0)  // Remove empty parts
    .map(part => part.replace(/"$/, ''))  // Remove trailing quotes
    .join('');  // Join all parts together
}

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { messages, mode = "general", userId = null } = body;
    
    console.log('Chat API request body:', {
      messagesCount: messages?.length,
      mode,
      userId,
      hasUserId: !!userId
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

    const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.general

    // Determine which model to use based on the conversation context
    let modelType = "fast"
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""

    // Check if it's a simple greeting or casual interaction
    const isSimpleGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|how are you|what's up|sup)[\s.,!?]*$/i.test(lastMessage.trim())
    const isCasualQuestion = lastMessage.length < 50 && !lastMessage.includes("?") && 
      (lastMessage.includes("thank") || lastMessage.includes("thanks") || lastMessage.includes("ok") || 
       lastMessage.includes("okay") || lastMessage.includes("cool") || lastMessage.includes("nice"))

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

    // Enhance system prompt for coding requests
    let enhancedSystemPrompt = systemPrompt;
    
    // Add casual interaction override for simple greetings
    if (isSimpleGreeting || isCasualQuestion) {
      enhancedSystemPrompt = `You are a friendly, helpful AI assistant. Respond naturally and conversationally to greetings and casual interactions. Be warm, welcoming, and human-like. Don't use formal structures for simple interactions - just be naturally helpful and engaging.

For this simple greeting or casual message, respond in a natural, friendly way without any formal structure or analysis.`;
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

    const selectedModel = MODELS.groq[modelType as keyof typeof MODELS.groq]

    let fullResponse = '';
    
    try {
      console.log('🚀 Starting AI stream for conversation:', conversationId);
      let assistantResponse = '';
      let isDone = false;
      let chunkCount = 0;
      let messageContent = '';
      
      // Use streamText from Vercel AI SDK to handle streaming properly
      const result = await streamText({
        model: groq(selectedModel),
        system: enhancedSystemPrompt,
        messages: messages.map((m: { role: 'user' | 'assistant' | 'system'; content: string }) => ({
          role: m.role,
          content: m.content
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
