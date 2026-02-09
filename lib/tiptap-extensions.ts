import Heading from '@tiptap/extension-heading';
import { Extension } from '@tiptap/core';

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

// Custom extension to handle backspace in lists like a normal markdown editor
export const BackspaceListBehavior = Extension.create({
    name: 'backspaceListBehavior',

    addKeyboardShortcuts() {
        return {
            Backspace: () => {
                const { state } = this.editor;
                const { $from, empty } = state.selection;

                // Only handle if there's no selection (cursor only)
                if (!empty) return false;

                // Check if cursor is at the start of a node
                const isAtStart = $from.parentOffset === 0;
                if (!isAtStart) return false;

                // Check if we're in a list item
                const isInListItem = $from.node($from.depth)?.type.name === 'listItem' ||
                                     $from.node($from.depth - 1)?.type.name === 'listItem';

                // Check if we're in a task item
                const isInTaskItem = $from.node($from.depth)?.type.name === 'taskItem' ||
                                     $from.node($from.depth - 1)?.type.name === 'taskItem';

                if (isInListItem) {
                    // Try to lift the list item (dedent or convert to paragraph)
                    return this.editor.commands.liftListItem('listItem');
                }

                if (isInTaskItem) {
                    // Try to lift the task item (dedent or convert to paragraph)
                    return this.editor.commands.liftListItem('taskItem');
                }

                return false;
            },
        };
    },
});
