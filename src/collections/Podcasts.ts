import { CollectionConfig } from 'payload'
import slugify from 'slugify'
import { parseFile, parseBuffer } from 'music-metadata'

// Helper fetch-based duration extractor
const extractDurationFromUrl = async (url: string): Promise<number | null> => {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const arrayBuf = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuf)
    const { format } = await parseBuffer(buffer)
    return typeof format.duration === 'number' ? Math.round(format.duration) : null
  } catch (err) {
    console.error('Unable to fetch/parse audio metadata:', err)
    return null
  }
}

// Helper function to extract audio duration from file metadata
// This would ideally use a proper audio metadata extraction library
const extractAudioDuration = async (file: any): Promise<number | null> => {
  try {
    const { format } = await parseFile(file.path, { duration: true })
    return typeof format.duration === 'number' ? Math.round(format.duration) : null
  } catch (err) {
    console.error('Unable to parse audio metadata:', err)
    return null
  }
}

export const Podcasts: CollectionConfig = {
  slug: 'podcasts',
  defaultSort: '-createdAt',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
    update: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
    delete: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Podcast Title',
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
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
      admin: {
        description: 'A brief description of the podcast episode or content.',
      },
    },
    {
      name: 'audioFile',
      type: 'upload',
      relationTo: 'media',
      label: 'Audio File',
      required: true,
      filterOptions: {
        mimeType: { contains: 'audio' },
      },
      admin: {
        description: 'Upload the audio file for this podcast.',
      },
    },
    {
      name: 'series',
      type: 'relationship',
      relationTo: 'podcastSeries',
      label: 'Series',
      admin: {
        description: 'Select a podcast series (leave blank for standalone episode).',
        allowCreate: true,
        position: 'sidebar',
      },
    },
    {
      name: 'episodeNumber',
      type: 'number',
      label: 'Episode Number',
      admin: {
        position: 'sidebar',
        description: 'Auto-incremented episode number within the selected series.',
        readOnly: true,
      },
    },
    {
      name: 'duration',
      type: 'number',
      label: 'Duration (seconds)',
      admin: {
        position: 'sidebar',
        description: 'Duration of the podcast in seconds (auto-detected).',
        readOnly: true,
      },
      validate: (val: unknown) => {
        const value = val as number | undefined | null
        if (value !== undefined && value !== null && value < 0) {
          return 'Duration must be positive'
        }
        return true
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'blogCategories',
      hasMany: true,
      label: 'Categories',
      maxDepth: 1,
      admin: {
        position: 'sidebar',
        allowCreate: false,
        description: 'Select relevant categories for this podcast.',
      },
    },
    {
      name: 'peopleInvolved',
      type: 'array',
      label: 'People Involved',
      minRows: 1,
      admin: {
        description: 'List of people involved in this podcast (hosts, guests, etc.).',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          label: 'Role',
          options: [
            { label: 'Host', value: 'host' },
            { label: 'Co-Host', value: 'co-host' },
            { label: 'Guest', value: 'guest' },
            { label: 'Interviewer', value: 'interviewer' },
            { label: 'Producer', value: 'producer' },
            { label: 'Editor', value: 'editor' },
            { label: 'Sound Engineer', value: 'sound-engineer' },
            { label: 'Moderator', value: 'moderator' },
          ],
          defaultValue: 'host',
          required: true,
        },
        {
          name: 'bio',
          type: 'textarea',
          label: 'Brief Bio',
          admin: {
            description: 'Optional brief bio or description of this person.',
          },
        },
      ],
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image',
      filterOptions: {
        mimeType: { contains: 'image' },
      },
      admin: {
        description: 'Cover image for this podcast episode.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published Date',
      admin: {
        position: 'sidebar',
        description: 'When this podcast was published.',
        date: {
          displayFormat: 'MMMM do, yyyy',
        },
      },
      defaultValue: () => new Date(),
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      label: 'Published',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Whether this podcast is visible to the public.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Mark as featured to highlight this podcast.',
      },
    },
    {
      name: 'playCount',
      type: 'number',
      label: 'Play Count',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Number of times this podcast has been played.',
      },
    },
    {
      name: 'likes',
      type: 'number',
      label: 'Likes',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Number of likes this podcast has received.',
      },
    },
    {
      name: 'externalLinks',
      type: 'array',
      label: 'External Links',
      admin: {
        description: 'Links mentioned in the podcast or related resources.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Link Title',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
          validate: (val: unknown) => {
            const value = val as string
            if (value && !value.match(/^https?:\/\/.+/)) {
              return 'Please enter a valid URL starting with http:// or https://'
            }
            return true
          },
        },
        {
          name: 'description',
          type: 'text',
          label: 'Description',
        },
      ],
    },
  ],
  endpoints: [
    {
      path: '/increment-play/:id',
      method: 'post',
      handler: async (req) => {
        const idFromParams = req.routeParams?.id
        if (typeof idFromParams !== 'string') {
          return Response.json({ error: 'Invalid podcast ID format' }, { status: 400 })
        }

        try {
          // First get the current podcast to read current play count
          const currentPodcast = await req.payload.findByID({
            collection: 'podcasts',
            id: idFromParams,
          })

          // Update with incremented play count
          const result = await req.payload.update({
            collection: 'podcasts',
            id: idFromParams,
            data: {
              playCount: (currentPodcast.playCount || 0) + 1,
            },
          })

          return Response.json({
            success: true,
            playCount: result.playCount,
            message: 'Play count incremented successfully',
          })
        } catch (error) {
          req.payload.logger.error(
            `Error incrementing play count for podcast ${idFromParams}: ${error instanceof Error ? error.message : String(error)}`,
          )

          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  ],
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'series',
      'episodeNumber',
      'duration',
      'isPublished',
      'featured',
      'playCount',
      'createdAt',
    ],
    listSearchableFields: ['title', 'description'],
    group: 'Content Management',
    pagination: {
      defaultLimit: 20,
    },
    description: 'Manage podcast episodes and series.',
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (data && data.series) {
          if (!data.episodeNumber) {
            try {
              const countResult = await req.payload.count({
                collection: 'podcasts',
                where: {
                  series: { equals: data.series },
                },
              })
              data.episodeNumber = (countResult.totalDocs || 0) + 1
            } catch (err) {
              req.payload.logger.error('Error auto-setting episode number', err)
            }
          }
        } else if (data) {
          // Standalone episode, ensure episodeNumber is null
          data.episodeNumber = null
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req }) => {
        // duration extraction
        if (!data?.duration) {
          if (req.file) {
            const dur = await extractAudioDuration(req.file)
            if (dur) data.duration = dur
          } else if (data?.audioFile) {
            try {
              // get media doc
              const mediaDoc = await req.payload.findByID({
                collection: 'media',
                id:
                  typeof data.audioFile === 'string'
                    ? data.audioFile
                    : (data.audioFile.id ?? data.audioFile),
              })
              if (mediaDoc?.url) {
                // Ensure we have an absolute URL (media.url can be relative like "/api/media/file/...")
                let absoluteUrl = mediaDoc.url as string
                if (!absoluteUrl.startsWith('http')) {
                  const base =
                    process.env.SERVER_BASE_URL ||
                    (req.payload?.config as any)?.serverURL ||
                    `http://localhost:${process.env.PORT ?? 3000}`
                  absoluteUrl = `${base}${absoluteUrl.startsWith('/') ? absoluteUrl : `/${absoluteUrl}`}`
                }

                const remoteDur = await extractDurationFromUrl(absoluteUrl)
                if (remoteDur) data.duration = remoteDur
              }
            } catch (err) {
              req.payload.logger.error('Error extracting remote audio duration', err)
            }
          }
        }
        return data
      },
    ],
  },
}
