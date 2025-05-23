import 'dotenv/config'
import textToSpeech from '@google-cloud/text-to-speech'

// Creates a client with custom timeout settings
const client = new textToSpeech.TextToSpeechClient({
  projectId: process.env.GOOGLE_APPLICATION_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_APPLICATION_PRIVATE_KEY,
  },
  // Set custom timeout and retry settings
  timeout: 120000, // 2 minutes timeout per request
  retrySettings: {
    totalTimeoutMillis: 180000, // 3 minutes total timeout
    initialRetryDelayMillis: 1000, // Start with 1 second delay
    retryDelayMultiplier: 2, // Double the delay each retry
    maxRetryDelayMillis: 30000, // Max 30 seconds between retries
    maxRetries: 3, // Maximum 3 retries
  },
})

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000, // Start with 1 second
  maxDelayMs: 30000, // Max 30 seconds
  backoffMultiplier: 2,
}

// Helper function to wait for a specified time
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Helper function to calculate exponential backoff delay
const calculateBackoffDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt)
  return Math.min(delay, RETRY_CONFIG.maxDelayMs)
}

export async function generateAudioFromText(textToSynthesize: string): Promise<Buffer> {
  console.log(
    `🎤 [TTS] Starting TTS synthesis for text (${textToSynthesize.length} chars): "${textToSynthesize.substring(0, 100)}${textToSynthesize.length > 100 ? '...' : ''}"`,
  )

  // Construct the request
  const request = {
    input: { text: textToSynthesize },
    // Select the language and SSML voice gender (optional)
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Chirp-HD-F',
    },
    // select the type of audio encoding
    audioConfig: { audioEncoding: 'LINEAR16' as const },
  }

  console.log(
    `🎤 [TTS] Request config: ${JSON.stringify({ voice: request.voice, audioConfig: request.audioConfig })}`,
  )

  let lastError: Error | null = null

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = calculateBackoffDelay(attempt - 1)
        console.log(
          `🔄 [TTS] Retry attempt ${attempt}/${RETRY_CONFIG.maxRetries} after ${delay}ms delay...`,
        )
        await sleep(delay)
      }

      console.log(
        `🎤 [TTS] Calling Google TTS API... (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1})`,
      )

      // Performs the text-to-speech request with timeout
      const [response] = await client.synthesizeSpeech(request)

      console.log(`🎤 [TTS] TTS API response received`)
      console.log(`🎤 [TTS] Audio content exists: ${!!response.audioContent}`)

      if (!response.audioContent) {
        const error = new Error('No audio content received from Google TTS')
        console.error('❌ [TTS] No audio content received from Google TTS')
        throw error
      }

      const audioBuffer = response.audioContent as Buffer
      console.log(`✅ [TTS] TTS synthesis successful (${audioBuffer.length} bytes)`)

      if (attempt > 0) {
        console.log(`🎉 [TTS] Success on retry attempt ${attempt}!`)
      }

      return audioBuffer
    } catch (error) {
      lastError = error as Error
      console.error(`❌ [TTS] Error on attempt ${attempt + 1}:`, error)

      // Check if this is a timeout or retryable error
      const isRetryable = isRetryableError(error)
      const isLastAttempt = attempt === RETRY_CONFIG.maxRetries

      if (isLastAttempt || !isRetryable) {
        console.error(`❌ [TTS] Final failure after ${attempt + 1} attempts`)
        console.error(`❌ [TTS] Failed text: "${textToSynthesize.substring(0, 200)}..."`)
        break
      }

      console.log(
        `⏳ [TTS] Will retry... (${RETRY_CONFIG.maxRetries - attempt} attempts remaining)`,
      )
    }
  }

  // If we get here, all retries failed
  throw lastError || new Error('TTS generation failed after all retries')
}

// Helper function to determine if an error is retryable
function isRetryableError(error: any): boolean {
  if (!error) return false

  const errorMessage = error.message?.toLowerCase() || ''
  const errorCode = error.code

  // Retry on timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('deadline exceeded')) {
    return true
  }

  // Retry on rate limit errors (code 8 = RESOURCE_EXHAUSTED)
  if (errorCode === 8) {
    return true
  }

  // Retry on temporary server errors (code 14 = UNAVAILABLE)
  if (errorCode === 14) {
    return true
  }

  // Retry on internal server errors (code 13 = INTERNAL)
  if (errorCode === 13) {
    return true
  }

  // Don't retry on client errors like invalid input (code 3 = INVALID_ARGUMENT)
  if (errorCode === 3) {
    return false
  }

  // Default to retryable for unknown errors
  return true
}
