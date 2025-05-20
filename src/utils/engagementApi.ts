import { User, BlogPost } from '@/payload-types' // Assuming your payload types are here

interface UpdateEngagementParams {
  userId: string
  postId: string
  userEngagementField: keyof Pick<User, 'likedPosts' | 'favoritedPosts'> // 'likedPosts' | 'favoritedPosts'
  updatedUserEngagementArray: string[] // Array of post IDs
  postCountField: keyof Pick<BlogPost, 'likes' | 'favoritesCount'> // 'likes' | 'favoritesCount'
  newPostCount: number
}

interface UpdateEngagementResult {
  userUpdateOk: boolean
  postUpdateOk: boolean
  userUpdateError?: any
  postUpdateError?: any
}

/**
 * Updates user engagement (e.g., likedPosts, favoritedPosts) and the corresponding count on a blog post.
 */
export const updateUserAndPostEngagement = async ({
  userId,
  postId,
  userEngagementField,
  updatedUserEngagementArray,
  postCountField,
  newPostCount,
}: UpdateEngagementParams): Promise<UpdateEngagementResult> => {
  let userUpdateOk = false
  let postUpdateOk = false
  let userUpdateError: any = null
  let postUpdateError: any = null

  // 1. Update User's engagement array (likedPosts or favoritedPosts)
  try {
    const userResponse = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [userEngagementField]: updatedUserEngagementArray }),
    })
    if (userResponse.ok) {
      userUpdateOk = true
    } else {
      userUpdateError = await userResponse.json()
      console.error(`Failed to update user's ${userEngagementField}:`, userUpdateError)
    }
  } catch (error) {
    userUpdateError = error
    console.error(`Error during user's ${userEngagementField} update:`, error)
  }

  // 2. Update Post's count (likes or favoritesCount)
  //    Only proceed if user update was successful or if you want to allow partial success.
  //    For now, let's proceed regardless to report both statuses.
  try {
    const postResponse = await fetch(`/api/blogPosts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [postCountField]: newPostCount }),
    })
    if (postResponse.ok) {
      postUpdateOk = true
    } else {
      postUpdateError = await postResponse.json()
      console.error(`Failed to update post's ${postCountField}:`, postUpdateError)
    }
  } catch (error) {
    postUpdateError = error
    console.error(`Error during post's ${postCountField} update:`, error)
  }

  return {
    userUpdateOk,
    postUpdateOk,
    userUpdateError,
    postUpdateError,
  }
}
