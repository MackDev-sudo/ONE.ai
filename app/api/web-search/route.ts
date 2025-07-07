import { NextRequest, NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

// Google Custom Search API configuration
const GOOGLE_SEARCH_API_KEY = 'AIzaSyAPhYvDko5bfccdt3cQyZuMG21yNvB882U'
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || 'c47d7c9c5b7c64e92'
const SERPAPI_KEY = process.env.SERPAPI_KEY

interface SearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
}

interface SearchResponse {
  items: SearchResult[]
}

// Function to fetch web content from a URL with timeout
async function fetchWebContent(url: string): Promise<string> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OneAI-Bot/1.0)',
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Simple HTML to text conversion (remove tags and extract meaningful content)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '') // Remove navigation
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '') // Remove headers
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '') // Remove footers
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
    
    // Return first 2500 characters to avoid token limits
    return textContent.slice(0, 2500)
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error)
    return ''
  }
}

// Function to perform search using SerpAPI (fallback)
async function performSerpAPISearch(query: string, numResults: number = 8): Promise<SearchResult[]> {
  if (!SERPAPI_KEY) {
    throw new Error('SerpAPI key not configured')
  }
  
  try {
    const searchUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&num=${numResults}&api_key=${SERPAPI_KEY}`
    
    const response = await fetch(searchUrl)
    
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Convert SerpAPI format to our format
    const results: SearchResult[] = (data.organic_results || []).map((result: any) => ({
      title: result.title || '',
      link: result.link || '',
      snippet: result.snippet || '',
      displayLink: result.displayed_link || result.link || ''
    }))
    
    return results
  } catch (error) {
    console.error('SerpAPI error:', error)
    throw error
  }
}

// Function to perform Google Custom Search
async function performGoogleSearch(query: string, numResults: number = 8): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=${numResults}`
    
    console.log('🔍 Making Google Custom Search request...')
    const response = await fetch(searchUrl)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Search API Error Response:', errorText)
      throw new Error(`Google Search API error: ${response.status} ${response.statusText}`)
    }
    
    const data: SearchResponse = await response.json()
    
    if (!data.items) {
      console.warn('No items found in Google Search response')
      return []
    }
    
    return data.items
  } catch (error) {
    console.error('Google Search API error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, provider = 'gemini' } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Web search request:', query)
    
    let searchResults: SearchResult[] = []
    let searchMethod = 'unknown'
    
    // Try Google Custom Search first, fallback to SerpAPI
    try {
      searchResults = await performGoogleSearch(query)
      searchMethod = 'Google Custom Search'
      console.log(`📊 Found ${searchResults.length} results using Google Custom Search`)
    } catch (googleError) {
      console.warn('Google Custom Search failed, trying SerpAPI fallback:', googleError)
      
      try {
        searchResults = await performSerpAPISearch(query)
        searchMethod = 'SerpAPI (fallback)'
        console.log(`📊 Found ${searchResults.length} results using SerpAPI fallback`)
      } catch (serpError) {
        console.error('Both search methods failed:', { googleError, serpError })
        
        // Return a helpful error with setup instructions
        return NextResponse.json({
          success: false,
          message: 'Web search is not properly configured',
          error: 'Both Google Custom Search and SerpAPI failed',
          searchResults: [],
          content: '',
          summary: `I'm sorry, but web search is currently not available due to API configuration issues. 

**Setup Required:**
1. Create a Google Custom Search Engine at https://programmablesearchengine.google.com/
2. Enable the Custom Search API in Google Cloud Console
3. Configure the search engine to "Search the entire web"
4. Add your Search Engine ID to environment variables

**Alternative:** Sign up for SerpAPI (100 free searches/month) at https://serpapi.com/

For detailed setup instructions, check the WEB_SEARCH_SETUP.md file in your project.`,
          setupInstructions: {
            googleCustomSearch: 'https://programmablesearchengine.google.com/',
            enableAPI: 'https://console.cloud.google.com/apis/library/customsearch.googleapis.com',
            serpApiAlternative: 'https://serpapi.com/'
          }
        })
      }
    }
    
    if (searchResults.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No search results found',
        searchResults: [],
        content: '',
        summary: `No relevant information found for your search query "${query}". Please try different keywords or check if the search terms are correct.`
      })
    }
    
    // Step 2: Fetch content from top results (limit to first 5 to avoid timeout)
    console.log(`📄 Fetching content from top ${Math.min(5, searchResults.length)} results...`)
    const contentPromises = searchResults.slice(0, 5).map(async (result) => {
      const content = await fetchWebContent(result.link)
      return {
        title: result.title,
        url: result.link,
        snippet: result.snippet,
        content: content,
        displayLink: result.displayLink
      }
    })
    
    const contentResults = await Promise.all(contentPromises)
    const successfulResults = contentResults.filter(result => result.content.length > 100) // At least 100 chars
    
    console.log(`📝 Successfully fetched content from ${successfulResults.length} sources`)
    
    if (successfulResults.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Could not fetch content from search results',
        searchResults: searchResults.map(r => ({
          title: r.title,
          url: r.link,
          snippet: r.snippet,
          displayLink: r.displayLink
        })),
        summary: `I found ${searchResults.length} search results for "${query}", but I couldn't access the content of these pages to provide a detailed analysis. Here are the search results:\n\n${searchResults.map((r, i) => `${i + 1}. **${r.title}**\n   ${r.snippet}\n   Source: ${r.displayLink}\n   URL: ${r.link}`).join('\n\n')}`
      })
    }
    
    // Step 3: Prepare content for AI analysis
    const combinedContent = successfulResults.map((result, index) => 
      `## Source ${index + 1}: ${result.title}
**URL**: ${result.url}
**Domain**: ${result.displayLink}
**Snippet**: ${result.snippet}
**Content**: ${result.content}

---`
    ).join('\n\n')
    
    // Step 4: Use Gemini to analyze and summarize the content
    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!geminiApiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY not configured')
    }
    
    const model = google('gemini-2.0-flash-exp')
    
    const analysisPrompt = `You are an expert research analyst. I have gathered information from multiple web sources about the following query: "${query}"

Please analyze the following content from ${successfulResults.length} web sources and provide a comprehensive, well-structured summary:

${combinedContent}

Please provide your analysis in the following format:

# 🔍 Web Search Results: ${query}

## 📊 Quick Summary
[Provide a concise 2-3 sentence summary of the key findings]

## 🔍 Key Findings
[List 3-5 main points discovered from the research, with bullet points]

## 📈 Detailed Analysis
[Provide a comprehensive analysis of the information, organizing it logically with subheadings as needed]

## 🌐 Sources Analyzed
${successfulResults.map((result, index) => `${index + 1}. **${result.title}**
   - ${result.displayLink}
   - ${result.url}`).join('\n')}

## 💡 Key Insights
[Any interesting observations, trends, or implications based on the gathered information]

*Search performed using: ${searchMethod}*
*Sources analyzed: ${successfulResults.length} out of ${searchResults.length} found*

Guidelines followed:
- Objective and fact-based analysis
- Organized information logically
- Used markdown formatting for readability
- Included relevant statistics and dates when available
- Highlighted any conflicting information found
`
    
    const { text: summary } = await generateText({
      model,
      prompt: analysisPrompt,
    })
    
    console.log('✅ AI analysis completed')
    
    return NextResponse.json({
      success: true,
      query,
      searchMethod,
      searchResults: searchResults.map(r => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
        displayLink: r.displayLink
      })),
      sourcesAnalyzed: successfulResults.length,
      totalResults: searchResults.length,
      summary,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Web search error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform web search',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      summary: `I encountered an error while trying to search the web: ${error instanceof Error ? error.message : 'Unknown error'}. 

This might be due to:
- API configuration issues
- Network connectivity problems  
- Rate limiting

Please check the setup instructions in WEB_SEARCH_SETUP.md or try again later.`,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
