import { CollectionConfig } from 'payload'
import { RichText } from '../blocks/richText/schema.ts'
import { Cover } from '../blocks/cover/schema.ts'
import { Image } from '../blocks/image/schema.ts'
import { RecentBlogPosts } from '../blocks/recentBlogPosts/schema.ts'

export const BlogPost: CollectionConfig = {
  slug: 'blogPosts',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      admin: {
        position: 'sidebar',
      },
      required: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Layout',
      blocks: [RichText, Cover, Image, RecentBlogPosts],
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
        readOnly: true, // Usually, likes are updated programmatically, not manually in admin
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
  ],
}
