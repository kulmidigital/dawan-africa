import { CollectionConfig } from "payload";

export const BlogCategories: CollectionConfig = {
  slug: "blog-categories",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
  ],
};
