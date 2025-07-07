import { createConversation, saveMessage } from "@/lib/chat-utils"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createAnthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"
import { NextRequest } from "next/server"

// Allow streaming responses up to 60 seconds for complex reasoning
export const maxDuration = 60

// File processing functions
async function extractTextFromFile(buffer: Buffer, fileName: string): Promise<string> {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  try {
    switch (extension) {
      case 'pdf':
        // For PDFs, we'll convert to base64 and let the vision model handle them
        return `PDF file: ${fileName} (${buffer.length} bytes) - Content will be analyzed by AI vision model`;
      
      case 'docx':
        // For DOCX, try to extract text using mammoth library
        try {
          // Dynamic import of mammoth
          const mammoth = await import('mammoth');
          console.log('📝 Extracting text from DOCX using mammoth...');
          const docxResult = await mammoth.extractRawText({ buffer });
          console.log('✅ DOCX text extraction successful, length:', docxResult.value.length);
          
          // Clean up extracted text
          const cleanText = docxResult.value.trim();
          if (cleanText.length > 0) {
            return cleanText;
          } else {
            throw new Error('DOCX file appears to be empty');
          }
        } catch (error) {
          console.error('❌ Mammoth extraction failed:', error);
          throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      
      case 'doc':
        // For older .doc files, try basic text extraction
        try {
          const textContent = buffer.toString('utf-8');
          // Filter out binary data and keep only readable text
          const cleanText = textContent.replace(/[^\x20-\x7E\s]/g, '').trim();
          if (cleanText.length > 50) {
            console.log('📝 DOC text extraction succeeded');
            return cleanText;
          }
          throw new Error('Insufficient readable text found in DOC file');
        } catch (error) {
          throw new Error(`Failed to extract text from DOC: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      
      case 'txt':
      case 'md':
      case 'markdown':
      case 'html':
      case 'htm':
      case 'css':
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'json':
      case 'yaml':
      case 'yml':
      case 'sql':
      case 'ini':
      case 'toml':
      case 'xml':
      case 'dockerfile':
      case 'gitignore':
      case 'py':
      case 'pl':
      case 'sh':
      case 'rb':
      case 'vb':
      case 'ps1':
      case 'php':
      case 'java':
      case 'c':
      case 'cpp':
      case 'cxx':
      case 'cc':
      case 'h':
      case 'hpp':
      case 'hxx':
      case 'cs':
      case 'go':
      case 'rs':
      case 'swift':
      case 'kt':
      case 'scala':
      case 'r':
      case 'dart':
      case 'lua':
      case 'vim':
      case 'bat':
      case 'cmd':
      case 'conf':
      case 'config':
      case 'cfg':
      case 'env':
      case 'log':
      case 'csv':
      case 'tsv':
      case 'svg':
      case 'vue':
      case 'astro':
      case 'svelte':
      case 'scss':
      case 'sass':
      case 'less':
      case 'styl':
      case 'stylus':
      case 'postcss':
      case 'makefile':
      case 'cmake':
      case 'gradle':
      case 'maven':
      case 'pom':
      case 'sbt':
      case 'lock':
      case 'backup':
      case 'tmp':
      case 'temp':
        console.log(`📝 Extracting text from ${extension.toUpperCase()} file`);
        return buffer.toString('utf-8');
      
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    console.error('❌ Error extracting text from file:', error);
    throw error;
  }
}

async function processImageFile(buffer: Buffer, fileName: string): Promise<string> {
  // Convert image to base64 for vision models
  const base64 = buffer.toString('base64');
  const extension = fileName.split('.').pop()?.toLowerCase();
  const mimeType = getMimeType(extension || '');
  
  console.log(`🖼️ Image processing: ${fileName}, size: ${buffer.length} bytes, mime: ${mimeType}`);
  
  return `data:${mimeType};base64,${base64}`;
}

async function processDocumentFile(buffer: Buffer, fileName: string): Promise<string> {
  // Convert document to base64 for vision models
  const base64 = buffer.toString('base64');
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  // Map document extensions to MIME types
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc': 'application/msword',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'ppt': 'application/vnd.ms-powerpoint',
    'txt': 'text/plain',
    'html': 'text/html',
    'htm': 'text/html',
    'md': 'text/markdown',
    'rtf': 'application/rtf',
    'odt': 'application/vnd.oasis.opendocument.text',
    'ods': 'application/vnd.oasis.opendocument.spreadsheet',
    'odp': 'application/vnd.oasis.opendocument.presentation'
  };
  
  const mimeType = mimeTypes[extension || ''] || 'application/octet-stream';
  console.log(`📄 Document processing: ${fileName}, size: ${buffer.length} bytes, mime: ${mimeType}`);
  
  return `data:${mimeType};base64,${base64}`;
}

function getMimeType(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'avif': 'image/avif'
  };
  return mimeTypes[extension] || 'image/jpeg';
}

function isImageFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'svg', 'webp', 'avif'].includes(extension || '');
}

// Initialize AI clients
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
})

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
    fast: "llama-3.1-8b-instant",
    reasoning: "llama-3.3-70b-versatile",
    creative: "qwen/qwen3-32b",
  },
  gemini: {
    default: "gemini-2.5-flash",
    flash: "gemini-2.5-flash",
    pro: "gemini-2.5-pro",
    vision: "gemini-2.5-pro",
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

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 File upload endpoint called');
    
    const formData = await req.formData();
    const message = formData.get('message') as string;
    const mode = formData.get('mode') as string || 'general';
    const provider = formData.get('provider') as string || 'groq';
    const userId = formData.get('userId') as string;
    const fileCount = parseInt(formData.get('fileCount') as string || '0');

    console.log('📝 Request details:', { message, mode, provider, userId, fileCount });

    // Force Gemini 2.5 Pro for file analysis (overrides auto selection)
    let selectedProvider = "gemini";
    console.log(`🔄 File analysis mode: Always using Gemini for optimal vision/document analysis${provider === "auto" ? " (auto mode detected)" : ""}`);
    
    if (!isProviderAvailable("gemini")) {
      console.log('⚠️ Gemini not available, checking alternatives...');
      const availableProviders = ["groq", "openai", "claude"].filter(isProviderAvailable);
      if (availableProviders.length === 0) {
        return Response.json({ error: 'No AI providers are configured for file analysis.' }, { status: 500 });
      }
      selectedProvider = availableProviders[0];
    }

    const modelType = "vision"; // Always use vision model for file analysis
    
    let client;
    let model: string;
    
    if (selectedProvider === "gemini") {
      client = gemini;
      model = MODELS.gemini.vision;
    } else if (selectedProvider === "groq") {
      client = groq;
      model = MODELS.groq.reasoning; // Use reasoning model for complex analysis
    } else if (selectedProvider === "openai") {
      client = openai;
      model = MODELS.openai.default;
    } else {
      client = anthropic;
      model = MODELS.claude.default;
    }

    console.log(`🤖 Using provider: ${selectedProvider}, model: ${model} for file analysis`);

    // Process files
    const fileContents: string[] = [];
    const imageContents: string[] = [];
    
    console.log(`📁 Processing ${fileCount} files...`);
    
    for (let i = 0; i < fileCount; i++) {
      const file = formData.get(`file_${i}`) as File;
      if (file) {
        console.log(`📄 Processing file ${i}: ${file.name} (${file.size} bytes)`);
        
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const extension = file.name.split('.').pop()?.toLowerCase();
          
          if (isImageFile(file.name)) {
            console.log(`🖼️ Processing as image: ${file.name}`);
            const imageDataUrl = await processImageFile(buffer, file.name);
            imageContents.push(imageDataUrl); // Store the data URL directly
          } else if (['pdf'].includes(extension || '')) {
            console.log(`📄 Processing as document with vision: ${file.name}`);
            // For PDFs, treat them as images for vision analysis
            const documentDataUrl = await processDocumentFile(buffer, file.name);
            imageContents.push(documentDataUrl); // Add documents to imageContents for vision processing
            
            // Also try to extract text if possible
            const textContent = await extractTextFromFile(buffer, file.name);
            if (textContent && !textContent.includes('Content will be analyzed by AI vision model')) {
              fileContents.push(`File: ${file.name}\nExtracted Text:\n${textContent}\n\n`);
            }
          } else {
            console.log(`📄 Processing as text document: ${file.name}`);
            try {
              const text = await extractTextFromFile(buffer, file.name);
              fileContents.push(`File: ${file.name}\nContent:\n${text}\n\n`);
            } catch (extractError) {
              console.error(`❌ Text extraction failed for ${file.name}:`, extractError);
              // If text extraction fails, try to process as binary document for vision (if supported)
              if (['docx', 'doc', 'xlsx', 'pptx'].includes(extension || '')) {
                console.log(`📄 Fallback: Processing ${file.name} as document with vision`);
                const documentDataUrl = await processDocumentFile(buffer, file.name);
                imageContents.push(documentDataUrl);
                fileContents.push(`File: ${file.name}\nNote: Text extraction failed, analyzing as binary document.\n\n`);
              } else {
                // For other unsupported files, provide error message
                fileContents.push(`File: ${file.name}\nError: ${extractError instanceof Error ? extractError.message : 'Failed to process file'}\n\n`);
              }
            }
          }
        } catch (fileError) {
          console.error(`❌ Error processing file ${file.name}:`, fileError);
          fileContents.push(`File: ${file.name}\nError: Failed to process file - ${fileError instanceof Error ? fileError.message : 'Unknown error'}\n\n`);
        }
      } else {
        console.warn(`⚠️ File ${i} not found in form data`);
      }
    }

    // Create enhanced prompt with file contents
    const messageContent: any[] = [{ type: 'text', text: message }];
    
    // Add text file contents to the message
    if (fileContents.length > 0) {
      messageContent.push({
        type: 'text',
        text: '\n\nText file contents:\n' + fileContents.join('\n')
      });
    }
    
    // Add images and documents directly as vision content for Gemini
    if (imageContents.length > 0 && selectedProvider === "gemini") {
      console.log(`🖼️ Adding ${imageContents.length} images/documents for vision analysis`);
      for (let i = 0; i < imageContents.length; i++) {
        const imageDataUrl = imageContents[i];
        const mimeType = imageDataUrl.split(';')[0].split(':')[1];
        const dataSize = imageDataUrl.length;
        console.log(`📷 Adding vision content ${i + 1}: mime=${mimeType}, size=${dataSize} chars`);
        
        messageContent.push({
          type: 'image',
          image: imageDataUrl
        });
      }
    } else if (imageContents.length > 0) {
      // For non-Gemini providers, add as text description
      messageContent.push({
        type: 'text',
        text: '\n\nImage/Document data (base64):\n' + imageContents.map((data, i) => `File ${i + 1}: ${data.substring(0, 100)}...`).join('\n')
      });
    }

    console.log(`📝 Message content structure:`, {
      totalParts: messageContent.length,
      textParts: messageContent.filter(p => p.type === 'text').length,
      visionParts: messageContent.filter(p => p.type === 'image').length
    });

    // Create conversation and save user message
    const isGuestUser = !userId || userId.startsWith('guest-user-');
    let conversationId: string | undefined;
    
    if (!isGuestUser) {
      try {
        const conversation = await createConversation(
          userId,
          message.slice(0, 100),
          mode
        );
        conversationId = conversation.id as string;
        if (conversationId) {
          await saveMessage(conversationId, 'user', message);
        }
      } catch (error) {
        console.error('Failed to create conversation or save message:', error);
      }
    }

    // System prompt for file analysis
    const systemPrompt = `You are an expert AI assistant specialized in analyzing documents, images, and files. Your capabilities include:

**Document Analysis**: 
- **Text Documents**: .txt, .md, .html, .css, .js, .jsx, .ts, .tsx, .json, .xml, .yaml, .sql, .py, .java, .c, .cpp, .cs, .go, .php, .rb, .swift, .kt, .scala, .dart, .r, .lua, and other programming/markup files
- **Office Documents**: .docx, .doc, .xlsx, .xls, .pptx, .ppt, .rtf, .odt, .ods, .odp files
- **PDF Documents**: Comprehensive PDF analysis including text extraction, structure analysis, and form recognition
- **Configuration Files**: .ini, .toml, .env, .config, .dockerfile, .gitignore, .lock files
- **Data Files**: .csv, .tsv, .log files
- **Web Files**: .html, .htm, .css, .scss, .sass, .less, .vue, .astro, .svelte files

**Image Analysis**: 
- Detailed visual analysis, object detection, text recognition (OCR)
- Scene understanding, composition analysis, technical diagrams
- Charts, graphs, tables, and data visualization interpretation
- Support for .jpg, .jpeg, .png, .svg, .webp, .avif formats

**Code Analysis**:
- Syntax highlighting and code structure analysis
- Bug detection and optimization suggestions
- Documentation and comment analysis
- Multi-language support for all major programming languages

**Analysis Instructions**:
1. **Examine ALL provided content** - both extracted text and visual content
2. **For text files**: Analyze code structure, syntax, functionality, and provide insights
3. **For documents**: Extract key information, analyze structure, identify important sections
4. **For images**: Describe visual elements, extract text via OCR, analyze composition
5. **For data files**: Interpret data patterns, structure, and statistical information
6. **For code files**: Provide code review, identify issues, suggest improvements
7. **Be thorough but organized** - use clear headers, bullet points, and structured analysis
8. **Quality assessment**: Evaluate document quality, completeness, and effectiveness

**Response Structure**:
- **Document Overview**: Brief summary of the file(s) analyzed
- **Key Findings**: Main insights and important information
- **Detailed Analysis**: In-depth examination of content and structure  
- **Quality Assessment**: Evaluation of document quality and effectiveness
- **Recommendations**: Suggestions for improvement or next steps (if applicable)

**Important Notes**:
- If both extracted text and visual content are provided, use both for comprehensive analysis
- For programming files, focus on code quality, structure, and potential improvements
- For documents, evaluate clarity, organization, and completeness
- For data files, provide insights into patterns and structure
- Be specific and actionable in your recommendations

Provide detailed, accurate analysis while maintaining clarity and organization.`;

    // Stream the response
    const result = await streamText({
      model: client(model),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: messageContent
        }
      ],
      temperature: 0.7,
      maxTokens: 2500,
    });

    console.log('🚀 Starting AI stream with enhanced prompt...');
    console.log('📝 Final message structure:', JSON.stringify(messageContent.map(c => ({
      type: c.type,
      textLength: c.type === 'text' ? c.text?.length : undefined,
      hasVisionContent: c.type === 'image' ? !!c.image : undefined
    })), null, 2));
    
    // Save assistant response and track content
    let fullResponse = '';
    let isDone = false;
    
    const transformStream = new TransformStream({
      transform(chunk: Uint8Array, controller: TransformStreamDefaultController) {
        const text = new TextDecoder().decode(chunk);
        console.log('📤 Streaming chunk:', text.substring(0, 100));
        controller.enqueue(chunk);
        
        // Extract content for saving
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6);
            if (content === '[DONE]') {
              isDone = true;
              console.log('✅ Stream completed');
            } else if (!content.startsWith('f:') && !content.startsWith('e:') && !content.startsWith('d:')) {
              // Try to extract content from different formats
              try {
                const parsed = JSON.parse(content);
                if (parsed.content) {
                  fullResponse += parsed.content;
                }
              } catch (e) {
                const match = content.match(/^\d+:"(.*)"$/);
                if (match && match[1]) {
                  fullResponse += match[1];
                }
              }
            }
          }
        }
      },
      flush() {
        console.log('🔄 Stream flush - Final response length:', fullResponse.length);
        if (fullResponse && !isGuestUser && conversationId && !isDone) {
          console.log('💾 Saving assistant response to database...');
          saveMessage(conversationId, 'assistant', fullResponse)
            .then(() => console.log('✅ Assistant file analysis response saved'))
            .catch(err => console.error('❌ Failed to save file analysis response:', err));
        } else if (isGuestUser) {
          console.log('📝 Guest user - skipping database save');
        }
      }
    });

    const response = result.toDataStreamResponse();
    const readable = response.body;
    if (!readable) {
      throw new Error('No response body from AI');
    }

    console.log('📡 Returning streaming response...');
    return new Response(readable.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('File upload chat error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process file upload request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
