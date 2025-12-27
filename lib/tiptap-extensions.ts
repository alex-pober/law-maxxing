import Heading from '@tiptap/extension-heading';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Track slug counts per render cycle to generate unique IDs
// Uses a WeakMap keyed by render key object for auto-cleanup
const slugCounters = new WeakMap<object, Map<string, number>>();
let currentRenderKey: object | null = null;

function getUniqueSlug(text: string, renderKey: object): string {
    const baseSlug = slugify(text);
    if (!baseSlug) return '';

    let counters = slugCounters.get(renderKey);
    if (!counters) {
        counters = new Map();
        slugCounters.set(renderKey, counters);
    }

    const count = counters.get(baseSlug) || 0;
    counters.set(baseSlug, count + 1);

    // First occurrence gets the base slug, subsequent ones get -1, -2, etc.
    return count === 0 ? baseSlug : `${baseSlug}-${count}`;
}

export const HeadingWithId = Heading.extend({
    renderHTML({ node, HTMLAttributes }) {
        const level = node.attrs.level;
        const text = node.textContent;

        // Create a new render key for each render cycle
        // This resets counters when the document re-renders
        if (!currentRenderKey) {
            currentRenderKey = {};
            // Reset after this event loop (after all nodes rendered)
            queueMicrotask(() => { currentRenderKey = null; });
        }

        const id = getUniqueSlug(text, currentRenderKey);

        return [
            `h${level}`,
            { ...HTMLAttributes, id },
            0,
        ];
    },
});
