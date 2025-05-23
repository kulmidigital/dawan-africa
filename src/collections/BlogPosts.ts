import { CollectionConfig, Forbidden } from 'payload'
import { RichText } from '../blocks/richText/schema.ts'
import { Cover } from '../blocks/cover/schema.ts'
import { Image } from '../blocks/image/schema.ts'
import slugify from 'slugify'
import { ObjectId } from 'mongodb'
import { generateAudioAfterChange, deleteAudioBeforeDelete } from '../components/audio/audioHooks'

export const BlogPost: CollectionConfig = {
  slug: 'blogPosts',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [generateAudioAfterChange],
    beforeDelete: [deleteAudioBeforeDelete],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'This is automatically generated from the title.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            return data?.title ? slugify(data.title, { lower: true, strict: true }) : value
          },
        ],
      },
      required: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Layout',
      blocks: [RichText, Cover, Image],
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'blogCategories',
      hasMany: true,
      label: 'Categories',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: 'Author',
      required: true,
    },
    {
      name: 'likes',
      type: 'number',
      label: 'Likes',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'favoritesCount',
      type: 'number',
      label: 'Favorites Count',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'views',
      type: 'number',
      label: 'Views',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'isEditorsPick',
      type: 'checkbox',
      label: "Editor's Pick",
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'audioUrl',
      type: 'text',
      label: 'Audio URL',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'URL of the generated audio file for this post.',
      },
    },
  ],
  endpoints: [
    {
      path: '/increment-view/:id',
      method: 'post',
      handler: async (req) => {
        const idFromParams = req.routeParams?.id
        if (typeof idFromParams !== 'string') {
          return Response.json({ error: 'Invalid post ID format' }, { status: 400 })
        }

        try {
          // Get the MongoDB collection through Payload's db.collections interface
          const collection = req.payload.db.collections.blogPosts.collection

          // Convert string ID to MongoDB ObjectId
          const objectId = new ObjectId(idFromParams)

          // Use MongoDB's native $inc operator for atomic increment
          // This is a single atomic operation - no read required
          const result = await collection.updateOne({ _id: objectId }, { $inc: { views: 1 } })

          if (result.matchedCount === 0) {
            return Response.json({ error: 'Post not found' }, { status: 404 })
          }

          return Response.json({
            success: true,
            message: 'View count incremented successfully',
          })
        } catch (error) {
          // If the ID string is invalid for ObjectId, catch that specific error
          if (error instanceof Error && error.message.includes('Invalid ObjectId')) {
            return Response.json({ error: 'Invalid post ID format' }, { status: 400 })
          }

          req.payload.logger.error(
            `Error incrementing view count for post ${idFromParams}: ${error instanceof Error ? error.message : String(error)}`,
          )

          if (error instanceof Forbidden) {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
          }

          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  ],
}
