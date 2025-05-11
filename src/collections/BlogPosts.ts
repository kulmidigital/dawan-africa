import { CollectionConfig } from "payload";
import { RichText } from "../blocks/richText/schema.ts";
import { Cover } from "../blocks/cover/schema.ts";
import { Image } from "../blocks/image/schema.ts";
import { RecentBlogPosts } from "../blocks/recentBlogPosts/schema.ts";

export const BlogPost: CollectionConfig = {
  slug: "blogPosts",
    fields: [
      {
        name: "name",
        type: "text",
        label: "Name",
        required: true,
      },
      {
        name: "slug",
        type: "text",
        label: "Slug",
        admin: {
          position: "sidebar",
        },
        required: true,
      },
      {
        name: "layout",
        type: "blocks",
        label: "Layout",
        blocks: [RichText, Cover, Image, RecentBlogPosts],
      },
      {
        name: "author",
        type: "relationship",
        relationTo: "users",
        label: "Author",
        required: true,
      },
  ],
};

