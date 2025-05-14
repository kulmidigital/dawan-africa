import { formatDistanceToNow } from 'date-fns'

/**
 * Formats a date string into a human-readable "time ago" format using date-fns.
 * (e.g., "about 2 hours ago", "over 1 year ago").
 * @param dateString - The date string to format.
 * @returns A string representing the time elapsed since the date.
 */
export const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return '' // Handle null or empty dateString

  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid dateString provided to formatTimeAgo:', dateString)
      return 'Invalid date'
    }

    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    console.error('Error in formatTimeAgo:', error)
    return 'Date unavailable' 
  }
}
