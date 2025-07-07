import { NextRequest, NextResponse } from 'next/server'

// Google Custom Search API configuration for image search
const GOOGLE_SEARCH_API_KEY = 'AIzaSyAPhYvDko5bfccdt3cQyZuMG21yNvB882U'
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || 'c47d7c9c5b7c64e92'

interface ImageResult {
  title: string
  link: string
  displayLink: string
  image: {
    contextLink: string
    thumbnailLink: string
    width: number
    height: number
  }
}

interface ImageSearchResponse {
  items: ImageResult[]
}

// Function to perform Google Custom Search for images
async function performImageSearch(query: string): Promise<ImageResult[]> {
  try {
    console.log('🖼️ Performing Google Image Search for:', query)
    
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1')
    searchUrl.searchParams.set('key', GOOGLE_SEARCH_API_KEY)
    searchUrl.searchParams.set('cx', GOOGLE_SEARCH_ENGINE_ID)
    searchUrl.searchParams.set('q', query)
    searchUrl.searchParams.set('searchType', 'image') // This makes it search for images
    searchUrl.searchParams.set('num', '6') // Return up to 6 images
    searchUrl.searchParams.set('safe', 'active') // Safe search
    searchUrl.searchParams.set('imgSize', 'medium') // Medium sized images
    searchUrl.searchParams.set('imgType', 'photo') // Prefer photos
    
    console.log('🌐 Image search URL:', searchUrl.toString())
    
    const response = await fetch(searchUrl.toString(), {
      headers: {
        'User-Agent': 'OneAI-ImageBot/1.0',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Image Search API Error Response:', errorText)
      throw new Error(`Google Image Search API error: ${response.status} ${response.statusText}`)
    }
    
    const data: ImageSearchResponse = await response.json()
    
    if (!data.items) {
      console.warn('No images found in Google Image Search response')
      return []
    }
    
    return data.items
  } catch (error) {
    console.error('Google Image Search API error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Image search request:', query)
    
    let imageResults: ImageResult[] = []
    
    try {
      imageResults = await performImageSearch(query)
      console.log(`🖼️ Found ${imageResults.length} images`)
    } catch (error) {
      console.error('Image search failed:', error)
      return NextResponse.json(
        { 
          error: 'Image search failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
    
    if (imageResults.length === 0) {
      return NextResponse.json({
        message: `I couldn't find any images for "${query}". You might try searching with different keywords or checking image search engines like Google Images directly.`,
        images: [],
        query
      })
    }
    
    // Format the response with image data
    const formattedResults = imageResults.map(result => ({
      title: result.title,
      imageUrl: result.link,
      thumbnailUrl: result.image.thumbnailLink,
      sourceUrl: result.image.contextLink,
      sourceDomain: result.displayLink,
      width: result.image.width,
      height: result.image.height
    }))
    
    console.log('✅ Image search completed successfully')
    
    return NextResponse.json({
      message: `Found ${imageResults.length} images for "${query}"`,
      images: formattedResults,
      query,
      searchMethod: 'Google Custom Search Images'
    })
    
  } catch (error) {
    console.error('Image search endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process image search request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
