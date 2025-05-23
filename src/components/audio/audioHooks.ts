import { CollectionAfterChangeHook, CollectionBeforeDeleteHook } from 'payload'
import { generateAudioForPost, deleteAudioFromUploadthing } from './audioUtils'

// Hook to generate audio after a blog post is created or updated
export const generateAudioAfterChange: CollectionAfterChangeHook = async ({
  doc,
  req,
  previousDoc,
  operation,
}) => {
  // Only process if the environment variables are set up for audio generation
  if (
    !process.env.GOOGLE_APPLICATION_PROJECT_ID ||
    !process.env.GOOGLE_CLIENT_EMAIL ||
    !process.env.GOOGLE_APPLICATION_PRIVATE_KEY ||
    !process.env.UPLOADTHING_SECRET
  ) {
    console.log('Audio generation skipped: missing environment variables')
    return doc
  }

  try {
    console.log(`\nAudio generation triggered for post "${doc.name}" (${operation})`)

    // Check if content has changed (for updates) or if this is a new post
    const contentChanged =
      operation === 'create' ||
      !previousDoc ||
      doc.name !== previousDoc.name ||
      JSON.stringify(doc.layout) !== JSON.stringify(previousDoc.layout)

    if (!contentChanged) {
      console.log('No content changes detected, skipping audio generation')
      return doc
    }

    // If this is an update and there's an existing audio file, delete it
    if (operation === 'update' && previousDoc?.audioUrl) {
      console.log('Deleting previous audio file...')
      await deleteAudioFromUploadthing(previousDoc.audioUrl)
    }

    // Generate new audio
    const audioUrl = await generateAudioForPost({
      id: doc.id,
      name: doc.name,
      slug: doc.slug,
      layout: doc.layout,
      audioUrl: doc.audioUrl,
    })

    if (audioUrl) {
      // Update the document with the new audio URL
      const updatedDoc = await req.payload.update({
        collection: 'blogPosts',
        id: doc.id,
        data: { audioUrl },
        depth: 0, // Don't need deep population for this update
      })

      console.log(`✅ Audio generation completed for post "${doc.name}"`)
      return { ...doc, audioUrl }
    } else {
      console.log(`⚠️ No audio generated for post "${doc.name}" (likely no content)`)

      // If there was previous audio but no new content, clear the audioUrl
      if (previousDoc?.audioUrl) {
        await req.payload.update({
          collection: 'blogPosts',
          id: doc.id,
          data: { audioUrl: null },
          depth: 0,
        })
        return { ...doc, audioUrl: null }
      }
    }
  } catch (error) {
    // Log the error but don't fail the entire operation
    console.error(
      `❌ Audio generation failed for post "${doc.name}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    )

    // Optionally, you could set a flag or send a notification about the failure
    // For now, we'll just continue without audio
  }

  return doc
}

// Hook to delete audio file when a blog post is deleted
export const deleteAudioBeforeDelete: CollectionBeforeDeleteHook = async ({ req, id }) => {
  try {
    // Fetch the document to get the audio URL before deletion
    const doc = await req.payload.findByID({
      collection: 'blogPosts',
      id,
      depth: 0,
    })

    if (doc.audioUrl) {
      console.log(`Deleting audio file for post "${doc.name}" before deletion`)
      await deleteAudioFromUploadthing(doc.audioUrl)
      console.log(`✅ Audio file deleted for post "${doc.name}"`)
    }
  } catch (error) {
    console.error(
      `❌ Failed to delete audio file for post ID ${id}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }

  return true // Allow the deletion to proceed
}
