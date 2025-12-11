'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Code, Eye, WrapText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type LineSpacing = 'compact' | 'normal' | 'relaxed' | 'loose';

const lineSpacingClasses: Record<LineSpacing, string> = {
    compact: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
};

const lineSpacingLabels: Record<LineSpacing, string> = {
    compact: 'Compact',
    normal: 'Normal',
    relaxed: 'Relaxed',
    loose: 'Loose',
};

interface Block {
    id: string;
    content: string;
}

interface BlockEditorProps {
    initialContent: string;
    noteId: string;
    onSave: (content: string) => Promise<void>;
}

function parseContentToBlocks(content: string): Block[] {
    if (!content.trim()) {
        return [{ id: crypto.randomUUID(), content: '' }];
    }

    // Split by double newlines to create blocks (paragraphs/sections)
    const sections = content.split(/\n\n+/);
    return sections.map(section => ({
        id: crypto.randomUUID(),
        content: section.trim()
    }));
}

function blocksToContent(blocks: Block[]): string {
    return blocks.map(b => b.content).join('\n\n');
}

interface SingleBlockProps {
    block: Block;
    isEditing: boolean;
    onFocus: () => void;
    onBlur: () => void;
    onChange: (content: string) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onDelete: () => void;
    canDelete: boolean;
    lineSpacing: LineSpacing;
}

function SingleBlock({
    block,
    isEditing,
    onFocus,
    onBlur,
    onChange,
    onKeyDown,
    onDelete,
    canDelete,
    lineSpacing
}: SingleBlockProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            // Move cursor to end
            const len = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(len, len);
        }
    }, [isEditing]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [block.content, isEditing]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && block.content === '' && canDelete) {
            e.preventDefault();
            onDelete();
        } else {
            onKeyDown(e);
        }
    };

    if (isEditing) {
        return (
            <Textarea
                ref={textareaRef}
                value={block.content}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
                className="min-h-10 resize-none border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 bg-muted/30 font-mono text-sm"
                placeholder="Type markdown here..."
            />
        );
    }

    // Render mode
    if (!block.content.trim()) {
        return (
            <div
                onClick={onFocus}
                className="min-h-10 py-2 px-3 text-muted-foreground cursor-text rounded hover:bg-muted/50 transition-colors"
            >
                Click to add content...
            </div>
        );
    }

    return (
        <div
            onClick={onFocus}
            className={`prose prose-slate max-w-none dark:prose-invert cursor-text rounded hover:bg-muted/30 transition-colors py-1 px-2 -mx-2 ${lineSpacingClasses[lineSpacing]}`}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
            >
                {block.content}
            </ReactMarkdown>
        </div>
    );
}

export function BlockEditor({ initialContent, noteId, onSave }: BlockEditorProps) {
    const [blocks, setBlocks] = useState<Block[]>(() => parseContentToBlocks(initialContent));
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isRawMode, setIsRawMode] = useState(false);
    const [rawContent, setRawContent] = useState(initialContent);
    const [lineSpacing, setLineSpacing] = useState<LineSpacing>('compact');
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rawTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-save with debounce
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

    // Auto-resize raw textarea
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
            // Switching from raw to block mode - parse content into blocks
            setBlocks(parseContentToBlocks(rawContent));
        } else {
            // Switching from block to raw mode - combine blocks into content
            setRawContent(blocksToContent(blocks));
        }
        setIsRawMode(!isRawMode);
        setEditingBlockId(null);
    };

    const handleBlockChange = (blockId: string, content: string) => {
        const newBlocks = blocks.map(b =>
            b.id === blockId ? { ...b, content } : b
        );
        setBlocks(newBlocks);
        debouncedSave(blocksToContent(newBlocks));
    };

    const handleBlockFocus = (blockId: string) => {
        setEditingBlockId(blockId);
    };

    const handleBlockBlur = () => {
        // Small delay to allow click events on other blocks to fire first
        setTimeout(() => {
            setEditingBlockId(null);
        }, 100);
    };

    const handleKeyDown = (blockId: string, e: React.KeyboardEvent) => {
        const blockIndex = blocks.findIndex(b => b.id === blockId);

        if (e.key === 'Enter' && e.shiftKey) {
            // Shift+Enter creates a new block
            e.preventDefault();
            const newBlock: Block = { id: crypto.randomUUID(), content: '' };
            const newBlocks = [
                ...blocks.slice(0, blockIndex + 1),
                newBlock,
                ...blocks.slice(blockIndex + 1)
            ];
            setBlocks(newBlocks);
            setEditingBlockId(newBlock.id);
        } else if (e.key === 'ArrowDown' && e.metaKey) {
            // Cmd+Down moves to next block
            e.preventDefault();
            if (blockIndex < blocks.length - 1) {
                setEditingBlockId(blocks[blockIndex + 1].id);
            }
        } else if (e.key === 'ArrowUp' && e.metaKey) {
            // Cmd+Up moves to previous block
            e.preventDefault();
            if (blockIndex > 0) {
                setEditingBlockId(blocks[blockIndex - 1].id);
            }
        }
    };

    const handleDeleteBlock = (blockId: string) => {
        const blockIndex = blocks.findIndex(b => b.id === blockId);
        const newBlocks = blocks.filter(b => b.id !== blockId);
        setBlocks(newBlocks);
        debouncedSave(blocksToContent(newBlocks));

        // Focus previous block or next if deleting first
        if (blockIndex > 0) {
            setEditingBlockId(newBlocks[blockIndex - 1].id);
        } else if (newBlocks.length > 0) {
            setEditingBlockId(newBlocks[0].id);
        }
    };

    const addBlockAtEnd = () => {
        const newBlock: Block = { id: crypto.randomUUID(), content: '' };
        setBlocks([...blocks, newBlock]);
        setEditingBlockId(newBlock.id);
    };

    // Click outside to deselect
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setEditingBlockId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="space-y-2">
            <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-muted-foreground">
                    {isSaving ? 'Saving...' : 'All changes saved'}
                </div>
                <div className="flex items-center gap-2">
                    {!isRawMode && (
                        <span className="text-xs text-muted-foreground">
                            Shift+Enter for new block
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleRawMode}
                        className="h-7 gap-1.5"
                    >
                        {isRawMode ? (
                            <>
                                <Eye className="h-3.5 w-3.5" />
                                Block View
                            </>
                        ) : (
                            <>
                                <Code className="h-3.5 w-3.5" />
                                Raw Markdown
                            </>
                        )}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 gap-1.5">
                                <WrapText className="h-3.5 w-3.5" />
                                {lineSpacingLabels[lineSpacing]}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {(Object.keys(lineSpacingLabels) as LineSpacing[]).map((spacing) => (
                                <DropdownMenuItem
                                    key={spacing}
                                    onClick={() => setLineSpacing(spacing)}
                                    className={lineSpacing === spacing ? 'bg-accent' : ''}
                                >
                                    {lineSpacingLabels[spacing]}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isRawMode ? (
                <Textarea
                    ref={rawTextareaRef}
                    value={rawContent}
                    onChange={(e) => handleRawContentChange(e.target.value)}
                    className="min-h-[400px] resize-none font-mono text-sm bg-muted/30 border-muted"
                    placeholder="Write your markdown here..."
                />
            ) : (
                <>
                    {blocks.map((block) => (
                        <SingleBlock
                            key={block.id}
                            block={block}
                            isEditing={editingBlockId === block.id}
                            onFocus={() => handleBlockFocus(block.id)}
                            onBlur={handleBlockBlur}
                            onChange={(content) => handleBlockChange(block.id, content)}
                            onKeyDown={(e) => handleKeyDown(block.id, e)}
                            onDelete={() => handleDeleteBlock(block.id)}
                            canDelete={blocks.length > 1}
                            lineSpacing={lineSpacing}
                        />
                    ))}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addBlockAtEnd}
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add block
                    </Button>
                </>
            )}
        </div>
    );
}
