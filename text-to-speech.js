// Imports the Google Cloud client library
import 'dotenv/config'
import textToSpeech from '@google-cloud/text-to-speech'

// Import other required libraries
import { writeFile } from 'node:fs/promises'

// Creates a client
const client = new textToSpeech.TextToSpeechClient()

async function quickStart() {
  // The text to synthesize
  const text =
    'According to a statement from Villa Somalia, the meeting focused on accelerating joint efforts in the fight against Al-Shabaab and ISIS, and on reinforcing Somalia’s engagement with international partners, including the African Union Transition Mission in Somalia (AUSSOM).'

  // Construct the request
  const request = {
    input: { text: text },
    // Select the language and SSML voice gender (optional)
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Chirp-HD-F',
    },
    // select the type of audio encoding
    audioConfig: { audioEncoding: 'LINEAR16' },
  }

  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request)

  // Save the generated binary audio content to a local file
  await writeFile('output.wav', response.audioContent, 'binary')
  console.log('Audio content written to file: output.wav')
}

await quickStart()
