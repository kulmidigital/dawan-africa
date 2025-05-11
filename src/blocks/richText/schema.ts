import { Block } from "payload";

export const RichText: Block = {
    slug: "richText",
    fields: [
        {
            name: "content",
            type: "richText",
            label: "Content",
        }
    ],
};

