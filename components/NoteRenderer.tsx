'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { HeadingWithId } from '@/lib/tiptap-extensions';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Typography from '@tiptap/extension-typography';
import { Markdown } from 'tiptap-markdown';

interface NoteRendererProps {
    content: string;
}

export function NoteRenderer({ content }: NoteRendererProps) {

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: false,
            }),
            HeadingWithId.configure({
                levels: [1, 2, 3, 4, 5, 6],
            }),
            Link.configure({
                openOnClick: true,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: false,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Typography,
            Markdown.configure({
                html: false,
            }),
        ],
        content: content,
        editable: false,
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none dark:prose-invert focus:outline-none',
            },
        },
    });

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (editor && content !== (editor.storage as any).markdown.getMarkdown()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return <EditorContent editor={editor} />;
}
