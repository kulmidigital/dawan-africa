import { CollectionConfig } from "payload";
import { RichText } from "../blocks/richText/schema.ts";
import { Cover } from "../blocks/cover/schema.ts";
import { Image } from "../blocks/image/schema.ts";
import { RecentBlogPosts } from "../blocks/recentBlogPosts/schema.ts";


export const Pages: CollectionConfig = {
    slug: "pages",
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
            required: true,
        },
        {
            name: "layout",
            type: "blocks",
            label: "Layout",
            blocks: [RichText, Cover, Image, RecentBlogPosts],
        },
    ],
};