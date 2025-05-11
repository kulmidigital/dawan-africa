import { CollectionConfig } from 'payload'

export const BlogCategories: CollectionConfig = {
  slug: 'blogCategories',
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
  ],
}
