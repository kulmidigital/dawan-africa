// Imports the Google Cloud client library
import 'dotenv/config'
import textToSpeech from '@google-cloud/text-to-speech'

// Import other required libraries
// import { writeFile } from 'node:fs/promises' // No longer writing to file directly here

// Creates a client
const client = new textToSpeech.TextToSpeechClient({
  projectId: process.env.GOOGLE_APPLICATION_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_APPLICATION_PRIVATE_KEY,
  },
})

export async function generateAudioFromText(textToSynthesize) {
  // The text to synthesize
  // const text =
  //   'According to a statement from Villa Somalia, the meeting focused on accelerating joint efforts in the fight against Al-Shabaab and ISIS, and on reinforcing Somalia's engagement with international partners, including the African Union Transition Mission in Somalia (AUSSOM).'

  // Construct the request
  const request = {
    input: { text: textToSynthesize },
    // Select the language and SSML voice gender (optional)
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Chirp-HD-F',
    },
    // select the type of audio encoding
    audioConfig: { audioEncoding: 'LINEAR16' },
  }

  try {
  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request)

  // Save the generated binary audio content to a local file
    // await writeFile('output.wav', response.audioContent, 'binary')
    // console.log('Audio content written to file: output.wav')
    return response.audioContent // Return the audio content buffer
  } catch (error) {
    console.error('Error synthesizing speech:', error)
    throw error // Re-throw the error to be handled by the caller
  }
}

// await quickStart() // Removed direct call
