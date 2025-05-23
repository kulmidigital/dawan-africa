'use server'

import { revalidateTag } from 'next/cache'

export async function revalidateMarketData() {
  try {
    // Revalidate all crypto-related cache tags
    revalidateTag('crypto-global')
    revalidateTag('crypto-trending')
    revalidateTag('crypto-listings')

    return { success: true }
  } catch (error) {
    console.error('Error revalidating market data:', error)
    return { success: false, error: 'Failed to revalidate cache' }
  }
}

export async function revalidateGlobalData() {
  try {
    revalidateTag('crypto-global')
    return { success: true }
  } catch (error) {
    console.error('Error revalidating global data:', error)
    return { success: false, error: 'Failed to revalidate global cache' }
  }
}

export async function revalidateTrendingData() {
  try {
    revalidateTag('crypto-trending')
    return { success: true }
  } catch (error) {
    console.error('Error revalidating trending data:', error)
    return { success: false, error: 'Failed to revalidate trending cache' }
  }
}

export async function revalidateListingsData() {
  try {
    revalidateTag('crypto-listings')
    return { success: true }
  } catch (error) {
    console.error('Error revalidating listings data:', error)
    return { success: false, error: 'Failed to revalidate listings cache' }
  }
}
