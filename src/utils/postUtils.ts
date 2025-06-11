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
    const user = author as User
    // Use the actual name field if available, fallback to email username
    return user.name || user.email?.split('@')[0] || 'Unknown Author'
  }
  // If author is just an ID (string or number), we can't resolve the name here
  return 'Unknown Author'
}

/**
 * Gets the author's full name from a BlogPost.
 * @param author - The author object or ID from a BlogPost.
 * @returns The author's full name or 'Unknown Author'.
 */
export const getAuthorName = (author: BlogPost['author']): string => {
  if (!author) return 'Unknown Author'

  if (typeof author === 'object' && author !== null) {
    const user = author as User
    return user.name || 'Unknown Author'
  }
  return 'Unknown Author'
}

/**
 * Gets the author's primary role with proper formatting.
 * Prioritizes content creator roles over admin for display purposes.
 * @param author - The author object or ID from a BlogPost.
 * @returns The author's primary role with proper capitalization.
 */
export const getAuthorRole = (author: BlogPost['author']): string => {
  if (!author) return 'Contributor'

  if (typeof author === 'object' && author !== null) {
    const user = author as User
    if (user.roles && user.roles.length > 0) {
      // Prioritize content creator roles for display (more specific than admin)
      const contentCreatorRoles = ['analyst', 'columnist', 'reporter', 'contributor']
      const contentCreatorRole = user.roles.find((role) => contentCreatorRoles.includes(role))

      // Use content creator role if found, otherwise use the first non-'user' role
      const primaryRole =
        contentCreatorRole || user.roles.find((role) => role !== 'user') || user.roles[0]

      // Format role names for display
      switch (primaryRole) {
        case 'admin':
          return 'Admin'
        case 'analyst':
          return 'Analyst'
        case 'columnist':
          return 'Columnist'
        case 'reporter':
          return 'Reporter'
        case 'contributor':
          return 'Contributor'
        default:
          return 'Contributor'
      }
    }
  }
  return 'Contributor'
}

/**
 * Gets the post author's full name, prioritizing manual reporter if enabled.
 * @param post - The complete BlogPost object.
 * @returns The author's full name or 'Unknown Author'.
 */
export const getPostAuthorName = (post: BlogPost): string => {
  // Check for manual reporter first
  if (post.useManualReporter && post.manualReporter?.name) {
    return post.manualReporter.name
  }

  // Fall back to regular author
  return getAuthorName(post.author)
}

/**
 * Gets the post author's role, prioritizing manual reporter if enabled.
 * @param post - The complete BlogPost object.
 * @returns The author's role with proper capitalization.
 */
export const getPostAuthorRole = (post: BlogPost): string => {
  // Check for manual reporter first
  if (post.useManualReporter && post.manualReporter?.role) {
    // Map manual reporter role values to display labels
    const roleMapping: Record<string, string> = {
      reporter: 'Reporter',
      correspondent: 'Correspondent',
      freelance: 'Freelance Journalist',
      contributor: 'Contributing Writer',
      'special-correspondent': 'Special Correspondent',
      'field-reporter': 'Field Reporter',
      investigative: 'Investigative Journalist',
      analyst: 'News Analyst',
    }

    return roleMapping[post.manualReporter.role] || post.manualReporter.role
  }

  // Fall back to regular author
  return getAuthorRole(post.author)
}

/**
 * Gets the post author's display name, prioritizing manual reporter if enabled.
 * Similar to getAuthorDisplayName but works with the full post object.
 * @param post - The complete BlogPost object.
 * @returns The author's display name.
 */
export const getPostAuthorDisplayName = (post: BlogPost): string => {
  // Check for manual reporter first
  if (post.useManualReporter && post.manualReporter?.name) {
    return post.manualReporter.name
  }

  // Fall back to regular author
  return getAuthorDisplayName(post.author)
}
