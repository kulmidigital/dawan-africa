import { CollectionConfig } from "payload";

export const BlogPost: CollectionConfig = {
  slug: "blog-posts",
    fields: [
      {
        name: "title",
        type: "text",
        required: true,
      },
      {
        name: "content",
        type: "richText",
        required: true,
      },
      {
        name: "author",
        type: "relationship",
        relationTo: "users",
        required: true,
      },
  ],
};

