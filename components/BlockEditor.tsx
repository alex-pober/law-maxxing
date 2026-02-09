'use client';

import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { HeadingWithId, BackspaceListBehavior } from '@/lib/tiptap-extensions';
import { Indent } from '@/lib/tiptap-indent-extension';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Typography from '@tiptap/extension-typography';
import { Markdown } from 'tiptap-markdown';
import { useCallback, useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Code, Eye } from 'lucide-react';
import {
    Bold,
    Italic,
    Strikethrough,
    Code as CodeIcon,
    List,
    ListOrdered,
    Quote,
    Minus,
    Undo,
    Redo,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Link as LinkIcon,
    CheckSquare,
    Table as TableIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockEditorProps {
    initialContent: string;
    onSave: (content: string) => Promise<void>;
}

function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
    const editorState = useEditorState({
        editor,
        selector: (ctx) => ({
            isBold: ctx.editor?.isActive('bold') ?? false,
            isItalic: ctx.editor?.isActive('italic') ?? false,
            isStrike: ctx.editor?.isActive('strike') ?? false,
            isCode: ctx.editor?.isActive('code') ?? false,
            isBulletList: ctx.editor?.isActive('bulletList') ?? false,
            isOrderedList: ctx.editor?.isActive('orderedList') ?? false,
            isTaskList: ctx.editor?.isActive('taskList') ?? false,
            isBlockquote: ctx.editor?.isActive('blockquote') ?? false,
            isCodeBlock: ctx.editor?.isActive('codeBlock') ?? false,
            isLink: ctx.editor?.isActive('link') ?? false,
            isH1: ctx.editor?.isActive('heading', { level: 1 }) ?? false,
            isH2: ctx.editor?.isActive('heading', { level: 2 }) ?? false,
            isH3: ctx.editor?.isActive('heading', { level: 3 }) ?? false,
            isH4: ctx.editor?.isActive('heading', { level: 4 }) ?? false,
            isH5: ctx.editor?.isActive('heading', { level: 5 }) ?? false,
            canUndo: ctx.editor?.can().undo() ?? false,
            canRedo: ctx.editor?.can().redo() ?? false,
        }),
    });

    if (!editor) return null;

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // Validate URL to prevent javascript: and other dangerous protocols
        try {
            const parsed = new URL(url, window.location.origin);
            if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
                alert('Only HTTP, HTTPS, and mailto links are allowed');
                return;
            }
            editor.chain().focus().extendMarkRange('link').setLink({ href: parsed.href }).run();
        } catch {
            // If URL parsing fails, check if it's a relative path
            if (url.startsWith('/') && !url.startsWith('//')) {
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            } else {
                alert('Invalid URL');
            }
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-background rounded-t-md">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn('h-8 w-8 p-0', editorState?.isH1 && 'bg-muted')}
                title="Heading 1"
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn('h-8 w-8 p-0', editorState?.isH2 && 'bg-muted')}
                title="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn('h-8 w-8 p-0', editorState?.isH3 && 'bg-muted')}
                title="Heading 3"
            >
                <Heading3 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                className={cn('h-8 w-8 p-0', editorState?.isH4 && 'bg-muted')}
                title="Heading 4"
            >
                <Heading4 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                className={cn('h-8 w-8 p-0', editorState?.isH5 && 'bg-muted')}
                title="Heading 5"
            >
                <Heading5 className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn('h-8 w-8 p-0', editorState?.isBold && 'bg-muted')}
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn('h-8 w-8 p-0', editorState?.isItalic && 'bg-muted')}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn('h-8 w-8 p-0', editorState?.isStrike && 'bg-muted')}
                title="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn('h-8 w-8 p-0', editorState?.isCode && 'bg-muted')}
                title="Inline Code"
            >
                <CodeIcon className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn('h-8 w-8 p-0', editorState?.isBulletList && 'bg-muted')}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn('h-8 w-8 p-0', editorState?.isOrderedList && 'bg-muted')}
                title="Ordered List"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={cn('h-8 w-8 p-0', editorState?.isTaskList && 'bg-muted')}
                title="Task List"
            >
                <CheckSquare className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn('h-8 w-8 p-0', editorState?.isBlockquote && 'bg-muted')}
                title="Blockquote"
            >
                <Quote className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn('h-8 w-8 p-0', editorState?.isCodeBlock && 'bg-muted')}
                title="Code Block"
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="h-8 w-8 p-0"
                title="Horizontal Rule"
            >
                <Minus className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={setLink}
                className={cn('h-8 w-8 p-0', editorState?.isLink && 'bg-muted')}
                title="Link"
            >
                <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={addTable}
                className="h-8 w-8 p-0"
                title="Insert Table"
            >
                <TableIcon className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editorState?.canUndo}
                className="h-8 w-8 p-0"
                title="Undo"
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editorState?.canRedo}
                className="h-8 w-8 p-0"
                title="Redo"
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    );
}

export function BlockEditor({ initialContent, onSave }: BlockEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [isRawMode, setIsRawMode] = useState(false);
    const [rawContent, setRawContent] = useState(initialContent);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const rawTextareaRef = useRef<HTMLTextAreaElement>(null);

    const debouncedSave = useCallback((content: string) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true);
            try {
                await onSave(content);
            } catch (error) {
                console.error('Failed to save:', error);
            } finally {
                setIsSaving(false);
            }
        }, 1000);
    }, [onSave]);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: {
                    HTMLAttributes: {
                        class: 'tiptap-code-block',
                    },
                },
            }),
            HeadingWithId.configure({
                levels: [1, 2, 3, 4, 5, 6],
            }),
            BackspaceListBehavior,
            Indent,
            Placeholder.configure({
                placeholder: 'Start writing...',
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'tiptap-link',
                },
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Typography,
            Markdown.configure({
                html: false,
                transformPastedText: true,
                transformCopiedText: true,
            }),
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                spellCheck: 'true',
                class: 'prose prose-slate max-w-none dark:prose-invert focus:outline-none min-h-[400px] px-4 py-3'
            },
            handleKeyDown: (view, event) => {
                // Handle Tab key
                if (event.key === 'Tab') {
                    const { state, dispatch } = view;
                    const { $from } = state.selection;

                    // Check if we're in a code block - insert tab character
                    const isInCodeBlock = $from.parent.type.name === 'codeBlock';
                    if (isInCodeBlock && !event.shiftKey) {
                        event.preventDefault();
                        const tr = state.tr.insertText('\t');
                        dispatch(tr);
                        return true;
                    }

                    // For lists and other content, let Indent extension handle it
                    return false;
                }
                return false;
            },
        },
        onUpdate: ({ editor }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const markdown = (editor.storage as any).markdown.getMarkdown();
            debouncedSave(markdown);
        },
    });

    useEffect(() => {
        if (isRawMode && rawTextareaRef.current) {
            rawTextareaRef.current.style.height = 'auto';
            rawTextareaRef.current.style.height = rawTextareaRef.current.scrollHeight + 'px';
        }
    }, [rawContent, isRawMode]);

    const handleRawContentChange = (content: string) => {
        setRawContent(content);
        debouncedSave(content);
    };

    const toggleRawMode = () => {
        if (isRawMode) {
            editor?.commands.setContent(rawContent);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const markdown = (editor?.storage as any)?.markdown?.getMarkdown() || '';
            setRawContent(markdown);
        }
        setIsRawMode(!isRawMode);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-muted-foreground">
                    {isSaving ? 'Saving...' : 'All changes saved'}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleRawMode}
                        className="h-7 gap-1.5"
                    >
                        {isRawMode ? (
                            <>
                                <Eye className="h-3.5 w-3.5" />
                                Editor View
                            </>
                        ) : (
                            <>
                                <Code className="h-3.5 w-3.5" />
                                Raw Markdown
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {isRawMode ? (
                <textarea
                    ref={rawTextareaRef}
                    value={rawContent}
                    onChange={(e) => handleRawContentChange(e.target.value)}
                    className="min-h-[400px] w-full resize-none bg-muted/30 border border-muted rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary/20 leading-snug text-base font-mono"
                    placeholder="Write your markdown here..."
                />
            ) : (
                <div className="border border-border rounded-md">
                    <div className="sticky -top-6 lg:-top-8 z-10">
                        <MenuBar editor={editor} />
                    </div>
                    <EditorContent editor={editor} spellCheck={true}/>
                </div>
            )}
        </div>
    );
}
