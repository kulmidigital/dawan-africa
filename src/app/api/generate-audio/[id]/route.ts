import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateAudioForPost } from '../../../../components/audio/audioUtils'

// Timeout protection - ensure we don't exceed serverless function limits
const AUDIO_GENERATION_TIMEOUT = 4 * 60 * 1000 // 4 minutes

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now()
  let timeoutId: NodeJS.Timeout | null = null

  try {
    const { id } = await params
    console.log(`🎵 [AUDIO API] Starting audio generation for post ID: ${id}`)
    console.log(`🎵 [AUDIO API] Route is working! Request received.`)
    console.log(`⏰ [AUDIO API] Timeout protection: ${AUDIO_GENERATION_TIMEOUT / 1000} seconds`)

    // Set up timeout protection
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          new Error(`Audio generation timed out after ${AUDIO_GENERATION_TIMEOUT / 1000} seconds`),
        )
      }, AUDIO_GENERATION_TIMEOUT)
    })

    // Initialize Payload with Local API
    const payload = await getPayload({ config })

    // Fetch the post document
    console.log(`🔍 [AUDIO API] Fetching post document...`)
    const post = await payload.findByID({
      collection: 'blogPosts',
      id,
      depth: 0,
    })

    if (!post) {
      console.log(`❌ [AUDIO API] Post not found with ID: ${id}`)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    console.log(`📄 [AUDIO API] Found post: "${post.name}"`)

    // Generate audio using the proven working logic with timeout protection
    console.log(`🎯 [AUDIO API] Generating audio...`)
    const audioUrl = await Promise.race([
      generateAudioForPost({
        id: post.id,
        name: post.name,
        slug: post.slug,
        layout: post.layout ?? undefined,
        audioUrl: post.audioUrl ?? undefined,
      }),
      timeoutPromise,
    ])

    // Clear timeout since we succeeded
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    const duration = Date.now() - startTime
    console.log(`⏱️ [AUDIO API] Audio generation took ${duration}ms`)

    if (audioUrl) {
      // Update the post with the new audio URL using Local API
      console.log(`💾 [AUDIO API] Updating post with audio URL...`)
      const updatedPost = await payload.update({
        collection: 'blogPosts',
        id: post.id,
        data: { audioUrl },
        // Set context flag to prevent hook from running again (prevent infinite loop)
        context: {
          triggerAfterChange: false,
        },
      })

      console.log(`✅ [AUDIO API] Audio generation completed successfully`)
      console.log(`✅ [AUDIO API] Audio URL: ${audioUrl}`)

      return NextResponse.json({
        success: true,
        audioUrl,
        postId: id,
        postName: post.name,
        duration: duration,
      })
    } else {
      console.log(`⚠️ [AUDIO API] No audio generated (likely no content)`)
      return NextResponse.json({
        success: false,
        message: 'No audio generated - post may not have sufficient content',
        postId: id,
        duration: duration,
      })
    }
  } catch (error) {
    // Clear timeout on error
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const duration = Date.now() - startTime
    console.error(`❌ [AUDIO API] Error generating audio after ${duration}ms:`, error)

    // Provide more specific error messages
    let errorMessage = 'Unknown error'
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message

      // Handle timeout specifically
      if (error.message.includes('timed out')) {
        statusCode = 408 // Request Timeout
        console.error(`⏰ [AUDIO API] Request timed out after ${duration}ms`)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration: duration,
      },
      { status: statusCode },
    )
  }
}

// Also support GET requests for manual triggering
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return POST(request, { params })
}
