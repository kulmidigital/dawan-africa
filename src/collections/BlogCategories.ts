import { CollectionConfig } from "payload";

export const BlogCategories: CollectionConfig = {
  slug: "blogCategories",
  fields: [
    {
      name: "name",
      type: "text",
      label: "Name",
      required: true,
    },
  ],
};
