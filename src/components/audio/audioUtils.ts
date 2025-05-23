import 'dotenv/config'
import { generateAudioFromText } from './textToSpeech'
import { UTApi, UTFile } from 'uploadthing/server'

// Helper function to extract text from Lexical rich text editor data
const extractTextFromLexicalNode = (node: any): string => {
  if (node.type === 'text') {
    return node.text || ''
  }
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextFromLexicalNode).join(' ')
  }
  return ''
}

export const extractTextFromLayout = (layout: any[] = []): string => {
  const textParts: string[] = []
  for (const block of layout) {
    if (
      block.blockType === 'richtext' &&
      block.content &&
      block.content.root &&
      block.content.root.children
    ) {
      const blockText = block.content.root.children.map(extractTextFromLexicalNode).join(' ')
      if (blockText) {
        textParts.push(blockText)
      }
    }
  }
  return textParts.join('\n\n')
}

const GOOGLE_TTS_CHARACTER_LIMIT = 500

// Function to split text into manageable chunks for TTS
export const chunkText = (text: string): string[] => {
  const MAX_CHUNK_SIZE = GOOGLE_TTS_CHARACTER_LIMIT
  const chunks: string[] = []

  // Define break points in order of preference (better breaks first)
  const sentenceEnders = ['. ', '! ', '? ']
  const breakPoints = [
    '; ',
    ', ',
    ' and ',
    ' or ',
    ' but ',
    ' the ',
    ' is ',
    ' was ',
    ' are ',
    ' were ',
    ' ',
  ]

  let remaining = text.trim()

  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHUNK_SIZE) {
      // Remaining text fits in one chunk
      chunks.push(remaining)
      break
    }

    // First try to find sentence endings within the limit
    let bestBreakIndex = -1
    let bestBreakPoint = ''

    // Priority 1: Look for sentence endings
    for (const breakPoint of sentenceEnders) {
      const searchLimit = Math.min(MAX_CHUNK_SIZE, remaining.length)
      const lastIndex = remaining.lastIndexOf(breakPoint, searchLimit)

      if (lastIndex > 0 && lastIndex + breakPoint.length <= searchLimit) {
        bestBreakIndex = lastIndex + breakPoint.length
        bestBreakPoint = breakPoint
        break
      }
    }

    // Priority 2: If no sentence ending found, look for other break points
    if (bestBreakIndex === -1) {
      for (const breakPoint of breakPoints) {
        const searchLimit = Math.min(MAX_CHUNK_SIZE, remaining.length)
        const lastIndex = remaining.lastIndexOf(breakPoint, searchLimit)

        if (lastIndex > bestBreakIndex && lastIndex > 0) {
          bestBreakIndex = lastIndex + breakPoint.length
          bestBreakPoint = breakPoint
          break
        }
      }
    }

    // Priority 3: Force split if still no break point found
    if (bestBreakIndex === -1) {
      let forceSplitIndex = Math.min(MAX_CHUNK_SIZE, remaining.length)

      // Look backwards from the limit to find a space (word boundary)
      for (let i = forceSplitIndex; i > forceSplitIndex - 50 && i > 0; i--) {
        if (remaining[i] === ' ') {
          forceSplitIndex = i + 1
          break
        }
      }

      bestBreakIndex = forceSplitIndex
      console.log(
        '    Warning: Force-splitting text at character ' +
          forceSplitIndex +
          ' (no natural break point found)',
      )
    }

    // Extract the chunk
    const chunk = remaining.substring(0, bestBreakIndex).trim()
    if (chunk.length > 0) {
      if (chunk.length > MAX_CHUNK_SIZE) {
        console.log('    Warning: Chunk still too long, emergency splitting...')
        const emergencyChunks = emergencySplitText(chunk, MAX_CHUNK_SIZE / 2)
        chunks.push(...emergencyChunks)
      } else {
        chunks.push(chunk)
      }
    }

    remaining = remaining.substring(bestBreakIndex).trim()
  }

  return chunks.filter((chunk) => chunk.length > 0)
}

// Emergency function to split extremely long text into very small chunks
const emergencySplitText = (text: string, maxSize: number): string[] => {
  const chunks: string[] = []
  let remaining = text

  while (remaining.length > maxSize) {
    let splitIndex = maxSize
    for (let i = maxSize; i > maxSize - 20 && i > 0; i--) {
      if (remaining[i] === ' ') {
        splitIndex = i
        break
      }
    }

    chunks.push(remaining.substring(0, splitIndex).trim())
    remaining = remaining.substring(splitIndex).trim()
  }

  if (remaining.length > 0) {
    chunks.push(remaining)
  }

  return chunks
}

// Function to properly concatenate WAV audio buffers
export const concatenateWavBuffers = (audioBuffers: Buffer[]): Buffer | null => {
  if (audioBuffers.length === 0) return null
  if (audioBuffers.length === 1) return audioBuffers[0]

  const WAV_HEADER_SIZE = 44

  const audioDataChunks = audioBuffers.map((buffer) => {
    if (buffer.length <= WAV_HEADER_SIZE) {
      console.warn('    Warning: Audio buffer too small, might be corrupted')
      return Buffer.alloc(0)
    }
    return buffer.slice(WAV_HEADER_SIZE)
  })

  const totalAudioDataSize = audioDataChunks.reduce((sum, chunk) => sum + chunk.length, 0)

  if (totalAudioDataSize === 0) {
    console.error('    Error: No audio data found in buffers')
    return null
  }

  const firstBuffer = audioBuffers[0]
  const newHeader = Buffer.from(firstBuffer.slice(0, WAV_HEADER_SIZE))

  const totalFileSize = WAV_HEADER_SIZE + totalAudioDataSize - 8
  newHeader.writeUInt32LE(totalFileSize, 4)

  newHeader.writeUInt32LE(totalAudioDataSize, 40)

  const combinedBuffer = Buffer.concat([newHeader, ...audioDataChunks])

  console.log(
    `    Combined ${audioBuffers.length} audio chunks into single WAV file (${totalAudioDataSize} bytes of audio data)`,
  )

  return combinedBuffer
}

// Main function to generate audio for a blog post
export const generateAudioForPost = async (post: {
  id: string
  name?: string
  slug?: string
  layout?: any[]
  audioUrl?: string
}): Promise<string | null> => {
  try {
    console.log(`Generating audio for post: "${post.name}" (ID: ${post.id})`)

    const titleText = post.name || ''
    const layoutText = extractTextFromLayout(post.layout)
    const fullTextToSynthesize = (titleText + '.\n\n' + layoutText).trim()

    if (!fullTextToSynthesize || fullTextToSynthesize === '.') {
      console.log('  No text content found to synthesize.')
      return null
    }

    console.log('  Splitting text into chunks...')
    const textChunks = chunkText(fullTextToSynthesize)

    if (textChunks.length === 0) {
      console.log('  No valid text chunks to synthesize after splitting.')
      return null
    }

    console.log(`  Synthesizing ${textChunks.length} audio chunk(s)...`)

    const audioBuffers: Buffer[] = []
    let chunkIndex = 0

    for (const chunk of textChunks) {
      chunkIndex++
      console.log(
        `    Synthesizing chunk ${chunkIndex}/${textChunks.length} (${chunk.length} chars)...`,
      )
      try {
        const audioBufferChunk = await generateAudioFromText(chunk)
        if (audioBufferChunk) {
          audioBuffers.push(audioBufferChunk)
        } else {
          console.warn('    Warning: TTS generation for a chunk returned no data.')
        }
      } catch (chunkError) {
        console.error(
          `    ❌ Error synthesizing chunk ${chunkIndex}: ${
            chunkError instanceof Error ? chunkError.message : String(chunkError)
          }`,
        )
        throw chunkError // Fail the entire operation if any chunk fails
      }
    }

    if (audioBuffers.length === 0 || audioBuffers.length !== textChunks.length) {
      throw new Error('Not all text chunks were successfully converted to audio')
    }

    console.log(`  Concatenating ${audioBuffers.length} audio buffers...`)
    const finalAudioBuffer = concatenateWavBuffers(audioBuffers)

    if (!finalAudioBuffer) {
      throw new Error('Failed to concatenate audio buffers')
    }

    // Upload to Uploadthing - correct initialization
    const utapi = new UTApi()
    const filename = `audio-${post.slug || post.id}-${Date.now()}.wav`

    // Create UTFile correctly
    const fileToUpload = new UTFile([finalAudioBuffer], filename)

    console.log(`  Uploading audio file "${filename}" to Uploadthing...`)
    const uploadResponse = await utapi.uploadFiles([fileToUpload])

    if (
      uploadResponse &&
      uploadResponse[0] &&
      uploadResponse[0].data &&
      uploadResponse[0].data.url
    ) {
      const audioUrl = uploadResponse[0].data.url
      console.log(`  ✅ Audio uploaded successfully. URL: ${audioUrl}`)
      return audioUrl
    } else {
      throw new Error('Uploadthing upload failed or did not return a URL')
    }
  } catch (error) {
    console.error(
      `  ❌ Error generating audio for post ID ${post.id}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
    throw error
  }
}

// Function to delete audio file from Uploadthing
export const deleteAudioFromUploadthing = async (audioUrl: string): Promise<void> => {
  try {
    if (!audioUrl) return

    // Extract file key from Uploadthing URL
    const urlParts = audioUrl.split('/')
    const fileKey = urlParts[urlParts.length - 1]

    if (!fileKey) {
      console.warn('Could not extract file key from audio URL:', audioUrl)
      return
    }

    const utapi = new UTApi()
    await utapi.deleteFiles([fileKey])
    console.log(`  🗑️ Deleted old audio file: ${fileKey}`)
  } catch (error) {
    console.error('Error deleting audio file from Uploadthing:', error)
    // Don't throw here - we don't want audio deletion failure to break the post update
  }
}
