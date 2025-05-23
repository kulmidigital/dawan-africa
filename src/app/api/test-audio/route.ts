import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test audio generation for a specific post
    const testPostId = '6830d3fdc4fcacf9bd9ecb01' // Use the latest post ID from the logs
    const isDevelopment = process.env.NODE_ENV === 'development'
    const baseUrl = isDevelopment
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/generate-audio/${testPostId}`

    console.log(`🧪 [TEST API] Testing audio generation for post: ${testPostId}`)
    console.log(`🧪 [TEST API] API URL: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      result,
      testPostId,
      apiUrl,
    })
  } catch (error) {
    console.error(`❌ [TEST API] Error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
