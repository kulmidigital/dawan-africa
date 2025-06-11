import { Podcast, Media } from '@/payload-types'

/**
 * Formats duration from seconds to human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "1h 23m 45s", "23m 45s", "45s")
 */
export const formatDuration = (seconds: number | null | undefined): string => {
  if (!seconds || seconds <= 0) return '0s'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  const parts: string[] = []

  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`)

  return parts.join(' ')
}

/**
 * Formats duration from seconds to MM:SS or HH:MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "1:23:45", "23:45")
 */
export const formatDurationClock = (seconds: number | null | undefined): string => {
  if (!seconds || seconds <= 0) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Gets the podcast display title including series information
 * @param podcast - The podcast object
 * @returns Formatted title string
 */
export const getPodcastDisplayTitle = (podcast: Podcast): string => {
  if (!podcast.series) return podcast.title

  const seriesName = typeof podcast.series === 'string' ? '' : (podcast.series as any)?.name || ''
  const episode = podcast.episodeNumber

  const parts: string[] = []
  if (seriesName) parts.push(seriesName)
  if (episode) parts.push(`Ep. ${episode}`)

  if (parts.length === 0) return podcast.title

  return `${parts.join(' ')}: ${podcast.title}`
}

/**
 * Gets a short series identifier for display
 * @param podcast - The podcast object
 * @returns Short series string (e.g., "S1E5", "Ep. 5", or empty string)
 */
export const getPodcastSeriesLabel = (podcast: Podcast): string => {
  if (!podcast.series) return ''
  const episode = podcast.episodeNumber
  if (episode) return `Ep. ${episode}`
  return ''
}

/**
 * Gets the podcast cover image URL
 * @param podcast - The podcast object
 * @returns Image URL or null if no image
 */
export const getPodcastCoverImage = (podcast: Podcast): string | null => {
  if (!podcast.coverImage) return null

  if (typeof podcast.coverImage === 'string') return null

  const media = podcast.coverImage as Media
  return media.url || null
}

/**
 * Gets the podcast audio file URL
 * @param podcast - The podcast object
 * @returns Audio URL or null if no audio file
 */
export const getPodcastAudioUrl = (podcast: Podcast): string | null => {
  if (!podcast.audioFile) return null

  if (typeof podcast.audioFile === 'string') return null

  const media = podcast.audioFile as Media
  return media.url || null
}

/**
 * Formats the people involved in a podcast for display
 * @param peopleInvolved - Array of people involved
 * @returns Formatted string of people and their roles
 */
export const formatPeopleInvolved = (peopleInvolved: Podcast['peopleInvolved']): string => {
  if (!peopleInvolved || peopleInvolved.length === 0) {
    return 'Unknown'
  }

  // Group people by role
  const roleGroups: Record<string, string[]> = {}

  peopleInvolved.forEach((person) => {
    const role = formatPersonRole(person.role)
    if (!roleGroups[role]) {
      roleGroups[role] = []
    }
    roleGroups[role].push(person.name)
  })

  // Format each role group
  const roleStrings = Object.entries(roleGroups).map(([role, names]) => {
    if (names.length === 1) {
      return `${names[0]} (${role})`
    }
    return `${names.join(', ')} (${role}s)`
  })

  return roleStrings.join(' • ')
}

/**
 * Gets the primary hosts from people involved
 * @param peopleInvolved - Array of people involved
 * @returns Array of host names
 */
export const getPodcastHosts = (peopleInvolved: Podcast['peopleInvolved']): string[] => {
  if (!peopleInvolved || peopleInvolved.length === 0) {
    return []
  }

  return peopleInvolved
    .filter((person) => person.role === 'host' || person.role === 'co-host')
    .map((person) => person.name)
}

/**
 * Formats a person's role for display
 * @param role - The role value from the database
 * @returns Formatted role label
 */
export const formatPersonRole = (role: string): string => {
  const roleMapping: Record<string, string> = {
    host: 'Host',
    'co-host': 'Co-Host',
    guest: 'Guest',
    interviewer: 'Interviewer',
    producer: 'Producer',
    editor: 'Editor',
    'sound-engineer': 'Sound Engineer',
    moderator: 'Moderator',
  }

  return roleMapping[role] || role
}

/**
 * Gets a podcast excerpt from its description
 * @param podcast - The podcast object
 * @param maxLength - Maximum length of the excerpt
 * @returns Truncated description
 */
export const getPodcastExcerpt = (podcast: Podcast, maxLength: number = 150): string => {
  if (!podcast.description) return ''

  if (podcast.description.length <= maxLength) {
    return podcast.description
  }

  // Find the last complete word within the limit
  const truncated = podcast.description.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')

  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...'
  }

  return truncated + '...'
}

/**
 * Groups podcasts by series name
 * @param podcasts - Array of podcasts
 * @returns Object with series names as keys and podcast arrays as values
 */
export const groupPodcastsBySeries = (podcasts: Podcast[]): Record<string, Podcast[]> => {
  const groups: Record<string, Podcast[]> = {
    Standalone: [],
  }

  podcasts.forEach((podcast) => {
    if (podcast.series) {
      const seriesName =
        typeof podcast.series === 'string'
          ? 'Unknown Series'
          : (podcast.series as any)?.name || 'Unknown Series'
      if (!groups[seriesName]) {
        groups[seriesName] = []
      }
      groups[seriesName].push(podcast)
    } else {
      groups['Standalone'].push(podcast)
    }
  })

  return groups
}

/**
 * Sorts podcasts within a series by episode and season number
 * @param podcasts - Array of podcasts from the same series
 * @returns Sorted array of podcasts
 */
export const sortPodcastsBySeries = (podcasts: Podcast[]): Podcast[] => {
  return [...podcasts].sort((a, b) => {
    const episodeA = a.episodeNumber || 0
    const episodeB = b.episodeNumber || 0

    if (episodeA !== episodeB) {
      return episodeA - episodeB
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

/**
 * Checks if a podcast is part of a series
 * @param podcast - The podcast object
 * @returns Boolean indicating if podcast is part of a series
 */
export const isPodcastInSeries = (podcast: Podcast): boolean => {
  return Boolean(podcast.series)
}

/**
 * Gets unique series names from an array of podcasts
 * @param podcasts - Array of podcasts
 * @returns Array of unique series objects with id and name
 */
export const getUniqueSeriesNames = (podcasts: Podcast[]): { id: string; name: string }[] => {
  const seriesMap = new Map<string, { id: string; name: string }>()

  podcasts.forEach((podcast) => {
    if (podcast.series && typeof podcast.series === 'object') {
      const series = podcast.series as any
      if (series.id && series.name) {
        seriesMap.set(series.id, { id: series.id, name: series.name })
      }
    }
  })

  return Array.from(seriesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}
