import Heading from '@tiptap/extension-heading';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export const HeadingWithId = Heading.extend({
    renderHTML({ node, HTMLAttributes }) {
        const level = node.attrs.level;
        const text = node.textContent;
        const id = slugify(text);

        return [
            `h${level}`,
            { ...HTMLAttributes, id },
            0,
        ];
    },
});
