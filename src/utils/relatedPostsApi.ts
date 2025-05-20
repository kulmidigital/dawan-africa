import { BlogPost, BlogCategory } from '@/payload-types' // Assuming your payload types are here

interface GetRelatedPostsParams {
  currentPostId: string
  currentPostCategories?: (string | BlogCategory)[] | null
  limit?: number
}

/**
 * Fetches and processes related blog posts for a given article.
 * Tries to find posts with shared categories, then fills with random posts if needed.
 */
export const getRelatedPostsForView = async ({
  currentPostId,
  currentPostCategories,
  limit = 6, // Default to 6 related posts
}: GetRelatedPostsParams): Promise<BlogPost[]> => {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append('where[id][not_equals]', currentPostId)
    // Fetch a slightly larger number to allow for better randomization and filtering
    queryParams.append('limit', String(limit * 3 > 20 ? limit * 3 : 20))
    queryParams.append('depth', '1') // Ensure categories are populated for filtering, adjust if needed

    const response = await fetch(`/api/blogPosts?${queryParams.toString()}`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Failed to fetch initial batch of posts for related content:', errorData)
      return []
    }

    const data = await response.json()
    if (!data.docs || data.docs.length === 0) {
      return []
    }

    let allFetchedPosts: BlogPost[] = data.docs
    let categoryMatches: BlogPost[] = []

    if (
      currentPostCategories &&
      Array.isArray(currentPostCategories) &&
      currentPostCategories.length > 0
    ) {
      const currentCategoryIds = currentPostCategories.map((cat) =>
        typeof cat === 'string' ? cat : (cat as BlogCategory).id,
      )

      categoryMatches = allFetchedPosts.filter((otherPost) => {
        if (
          !otherPost.categories ||
          !Array.isArray(otherPost.categories) ||
          otherPost.categories.length === 0
        ) {
          return false
        }
        const otherPostCategoryIds = otherPost.categories.map((cat) =>
          typeof cat === 'string' ? cat : (cat as BlogCategory).id,
        )
        return otherPostCategoryIds.some((catId) => currentCategoryIds.includes(catId))
      })
    }

    // Shuffle category matches
    for (let i = categoryMatches.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[categoryMatches[i], categoryMatches[j]] = [categoryMatches[j], categoryMatches[i]]
    }

    if (categoryMatches.length >= limit) {
      return categoryMatches.slice(0, limit)
    }

    // If not enough category matches, get other posts (excluding those already in categoryMatches)
    let otherPosts = allFetchedPosts.filter(
      (p) => !categoryMatches.some((match) => match.id === p.id) && p.id !== currentPostId,
    )

    // Shuffle other posts
    for (let i = otherPosts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[otherPosts[i], otherPosts[j]] = [otherPosts[j], otherPosts[i]]
    }

    const neededFromOthers = limit - categoryMatches.length
    const combinedPosts = [...categoryMatches, ...otherPosts.slice(0, neededFromOthers)]

    // Final shuffle of the combined list for good measure if desired, though often the above is sufficient
    // for (let i = combinedPosts.length - 1; i > 0; i--) {
    //   const j = Math.floor(Math.random() * (i + 1));
    //   [combinedPosts[i], combinedPosts[j]] = [combinedPosts[j], combinedPosts[i]];
    // }

    return combinedPosts.slice(0, limit)
  } catch (error) {
    console.error('Error in getRelatedPostsForView:', error)
    return []
  }
}
