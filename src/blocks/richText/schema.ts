import { Block } from "payload";

export const RichText: Block = {
    slug: "richtext",
    fields: [
        {
            name: "content",
            type: "richText",
            label: "Content",
        }
    ],
};

