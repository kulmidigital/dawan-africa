import 'dotenv/config'
import textToSpeech from '@google-cloud/text-to-speech'

// Creates a client
const client = new textToSpeech.TextToSpeechClient({
  projectId: process.env.GOOGLE_APPLICATION_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_APPLICATION_PRIVATE_KEY,
  },
})

export async function generateAudioFromText(textToSynthesize: string): Promise<Buffer> {
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

  try {
    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request)

    if (!response.audioContent) {
      throw new Error('No audio content received from Google TTS')
    }

    return response.audioContent as Buffer
  } catch (error) {
    console.error('Error synthesizing speech:', error)
    throw error // Re-throw the error to be handled by the caller
  }
}
