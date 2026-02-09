import { Extension } from '@tiptap/core';

// Extend the Commands interface to include our custom commands
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

export const Indent = Extension.create({
  name: 'indent',

  // Add indent attribute to block nodes
  addGlobalAttributes() {
    return [{
      types: ['paragraph', 'heading', 'blockquote', 'codeBlock'],
      attributes: {
        indent: {
          default: 0,
          parseHTML: element => parseInt(element.getAttribute('data-indent') || '0'),
          renderHTML: attributes => {
            if (!attributes.indent) return {};
            return { 'data-indent': attributes.indent };
          },
        },
      },
    }];
  },

  // Add indent/outdent commands
  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        const { $from } = selection;
        const node = $from.node();

        // Get current indent, increase by 1 (max 8)
        const currentIndent = node.attrs.indent || 0;
        if (currentIndent >= 8) return false;

        if (dispatch) {
          tr.setNodeMarkup($from.before(), null, {
            ...node.attrs,
            indent: currentIndent + 1,
          });
        }
        return true;
      },

      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        const { $from } = selection;
        const node = $from.node();

        // Get current indent, decrease by 1 (min 0)
        const currentIndent = node.attrs.indent || 0;
        if (currentIndent <= 0) return false;

        if (dispatch) {
          tr.setNodeMarkup($from.before(), null, {
            ...node.attrs,
            indent: currentIndent - 1,
          });
        }
        return true;
      },
    };
  },

  // Add keyboard shortcuts
  addKeyboardShortcuts() {
    return {
      'Tab': () => {
        // Check if in list or table - skip indent
        const { state } = this.editor;
        const { $from } = state.selection;
        const isInList = $from.node($from.depth)?.type.name === 'listItem' ||
                        $from.node($from.depth - 1)?.type.name === 'listItem' ||
                        $from.node($from.depth)?.type.name === 'taskItem' ||
                        $from.node($from.depth - 1)?.type.name === 'taskItem';

        if (isInList) return false;

        return this.editor.commands.indent();
      },
      'Shift-Tab': () => {
        const { state } = this.editor;
        const { $from } = state.selection;
        const isInList = $from.node($from.depth)?.type.name === 'listItem' ||
                        $from.node($from.depth - 1)?.type.name === 'listItem' ||
                        $from.node($from.depth)?.type.name === 'taskItem' ||
                        $from.node($from.depth - 1)?.type.name === 'taskItem';

        if (isInList) return false;

        return this.editor.commands.outdent();
      },
    };
  },
});
