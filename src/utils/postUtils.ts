import { BlogPost, Media, User } from '@/payload-types'

/**
 * Extracts an image URL from a post's layout blocks.
 * It prioritizes images from 'cover' blocks, then 'image' blocks.
 * @param layout - The layout array from a BlogPost.
 * @returns The image URL string or null if no image is found.
 */
export const getPostImageFromLayout = (layout: BlogPost['layout']): string | null => {
  if (!layout) return null

  // Look first for cover blocks with images
  for (const block of layout) {
    if (block.blockType === 'cover' && block.image) {
      const media = typeof block.image === 'string' ? null : (block.image as Media)
      return media?.url ?? null
    }
  }

  // Fall back to image blocks if no cover blocks have images
  for (const block of layout) {
    if (block.blockType === 'image' && block.image) {
      const media = typeof block.image === 'string' ? null : (block.image as Media)
      return media?.url ?? null
    }
  }

  return null
}

interface GetPostExcerptOptions {
  prioritizeCoverSubheading?: boolean
  maxLength?: number
}

/**
 * Extracts an excerpt from a post's layout blocks.
 * Can optionally prioritize a 'cover' block's subheading.
 * Falls back to the first 'richtext' block's content.
 * @param post - The BlogPost object.
 * @param options - Options to control excerpt generation.
 * @returns The excerpt string.
 */
export const getPostExcerpt = (
  post: BlogPost,
  options: GetPostExcerptOptions = { prioritizeCoverSubheading: true, maxLength: 180 },
): string => {
  const { prioritizeCoverSubheading = true, maxLength = 180 } = options
  if (!post.layout) return ''

  if (prioritizeCoverSubheading) {
    for (const block of post.layout) {
      if (block.blockType === 'cover' && block.subheading) {
        const subheading = block.subheading as string
        return subheading.length > maxLength
          ? `${subheading.substring(0, maxLength)}...`
          : subheading
      }
    }
  }

  for (const block of post.layout) {
    if (block.blockType === 'richtext' && block.content?.root?.children?.[0]?.text) {
      const text = block.content.root.children[0].text as string
      return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
    }
  }

  return ''
}

/**
 * Gets a display name for a post's author.
 * @param author - The author object or ID from a BlogPost.
 * @returns The author's display name or 'Unknown Author'.
 */
export const getAuthorDisplayName = (author: BlogPost['author']): string => {
  if (!author) return 'Unknown Author'

  if (typeof author === 'object' && author !== null) {
    // Assuming 'User' type has 'name' or 'email'
    const user = author as User
    return user.name || user.email?.split('@')[0] || 'Unknown Author'
  }
  // If author is just an ID (string or number), we can't resolve the name here
  // This utility assumes the author object is populated.
  // For more complex scenarios, you might need to fetch user details by ID.
  return 'Unknown Author' // Fallback if author is an ID or unhandled type
}
