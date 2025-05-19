import type { CollectionConfig } from 'payload'

// Assuming you have a BlogPost type defined in payload-types.ts
import { BlogPost, Media } from '../payload-types' // Corrected import path, added Media

// Added interface to extend the User type
interface UserWithRoles {
  id?: string
  name?: string
  email?: string
  roles?: string[]
  subscriptionTier?: string
  isEmailVerified?: boolean
  profilePicture?: string | Media // Can be ID or populated Media object
  favoritedPosts?: (string | BlogPost)[] // Can be array of IDs or populated BlogPosts
  likedPosts?: (string | BlogPost)[]
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    listSearchableFields: ['name', 'email'],
  },
  auth: {
    tokenExpiration: 7200, // 2 hours in seconds
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 min in ms
    forgotPassword: {
      // SMTP needed for email sending
    },
    cookies: {
      sameSite: 'None',
      secure: true,
    },
    // Ensure relationships like profilePicture, favoritedPosts, likedPosts are populated on login/me requests
    // This might require custom hooks or verifying default population depth. For now, we assume `depth` in API calls will handle it.
  },
  access: {
    admin: ({ req }) => {
      const user = req.user as UserWithRoles | null
      return Boolean(user?.roles?.includes('admin'))
    },
    create: () => true,
    read: ({ req }) => {
      const user = req.user as UserWithRoles | null
      if (user?.roles?.includes('admin')) return true
      return { id: { equals: user?.id } }
    },
    update: ({ req }) => {
      const user = req.user as UserWithRoles | null
      if (user?.roles?.includes('admin')) return true
      return { id: { equals: user?.id } }
    },
    delete: ({ req }) => {
      const user = req.user as UserWithRoles | null
      return Boolean(user?.roles?.includes('admin'))
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      saveToJWT: true, // Make name available in user object from `useAuth` or `req.user` easily
    },
    {
      name: 'profilePicture',
      label: 'Profile Picture',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: "User's profile picture.",
      },
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['user'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'User', value: 'user' },
      ],
      access: {
        update: ({ req }) => {
          const user = req.user as UserWithRoles | null
          return Boolean(user?.roles?.includes('admin'))
        },
      },
      saveToJWT: true,
    },
    {
      name: 'subscriptionTier',
      type: 'select',
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Premium', value: 'premium' },
      ],
      access: {
        update: ({ req }) => {
          const user = req.user as UserWithRoles | null
          return Boolean(user?.roles?.includes('admin'))
        },
      },
      saveToJWT: true,
    },
    {
      name: 'isEmailVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Has the user verified their email address?',
        position: 'sidebar',
      },
      access: {
        update: ({ req }) => {
          const user = req.user as UserWithRoles | null
          return Boolean(user?.roles?.includes('admin'))
        },
      },
      saveToJWT: true,
    },
    {
      name: 'favoritedPosts',
      type: 'relationship',
      relationTo: 'blogPosts',
      hasMany: true,
      admin: {
        description: 'Posts the user has favorited.',
      },
    },
    {
      name: 'likedPosts',
      type: 'relationship',
      relationTo: 'blogPosts',
      hasMany: true,
      admin: {
        description: 'Posts the user has liked.',
      },
    },
  ],
}
