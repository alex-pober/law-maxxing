'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { HeadingWithId } from '@/lib/tiptap-extensions';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Typography from '@tiptap/extension-typography';
import { Markdown } from 'tiptap-markdown';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface NoteRendererProps {
    content: string;
}

export function NoteRenderer({ content }: NoteRendererProps) {
    const [isMemorizeMode, setIsMemorizeMode] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (!isMemorizeMode || !contentRef.current) return;

        const walk = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || '';
                const regex = /\b([a-zA-Z])([a-zA-Z]+)\b/g;
                let match;
                let lastIndex = 0;

                if (!regex.test(text)) return;
                regex.lastIndex = 0; // Reset after test

                const fragment = document.createDocumentFragment();

                while ((match = regex.exec(text)) !== null) {
                    if (match.index > lastIndex) {
                        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
                    }

                    fragment.appendChild(document.createTextNode(match[1]));

                    const span = document.createElement('span');
                    span.style.visibility = 'hidden';
                    span.textContent = match[2];
                    fragment.appendChild(span);

                    lastIndex = regex.lastIndex;
                }

                if (lastIndex < text.length) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
                }

                node.parentNode?.replaceChild(fragment, node);
            } else {
                Array.from(node.childNodes).forEach(walk);
            }
        };

        walk(contentRef.current);

    }, [isMemorizeMode, content]);

    return (
        <div className="relative">
            <div className="flex justify-end mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMemorizeMode(!isMemorizeMode)}
                    className="gap-2"
                >
                    {isMemorizeMode ? (
                        <>
                            <Eye className="h-4 w-4" />
                            Show Full Text
                        </>
                    ) : (
                        <>
                            <EyeOff className="h-4 w-4" />
                            Memorize Mode
                        </>
                    )}
                </Button>
            </div>

            <div
                ref={contentRef}
                key={isMemorizeMode ? 'memorize' : 'normal'}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
