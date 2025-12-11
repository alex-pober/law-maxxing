'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { updateNoteMetadata } from '@/app/actions';

interface NoteHeaderProps {
    noteId: string;
    initialTitle: string;
    initialDescription: string;
}

export function NoteHeader({ noteId, initialTitle, initialDescription }: NoteHeaderProps) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
    const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const autoResize = (textarea: HTMLTextAreaElement | null) => {
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const debouncedSave = useCallback((data: { title?: string; description?: string }) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            updateNoteMetadata(noteId, data);
        }, 500);
    }, [noteId]);

    useEffect(() => {
        if (isEditingTitle && titleTextareaRef.current) {
            const textarea = titleTextareaRef.current;
            textarea.focus();
            autoResize(textarea);
            // Place cursor at end
            const len = textarea.value.length;
            textarea.setSelectionRange(len, len);
        }
    }, [isEditingTitle]);

    useEffect(() => {
        if (isEditingDescription && descriptionTextareaRef.current) {
            const textarea = descriptionTextareaRef.current;
            textarea.focus();
            autoResize(textarea);
            // Place cursor at end
            const len = textarea.value.length;
            textarea.setSelectionRange(len, len);
        }
    }, [isEditingDescription]);

    const handleTitleChange = (value: string, textarea: HTMLTextAreaElement | null) => {
        setTitle(value);
        autoResize(textarea);
        if (value.trim()) {
            debouncedSave({ title: value });
        }
    };

    const handleDescriptionChange = (value: string, textarea: HTMLTextAreaElement | null) => {
        setDescription(value);
        autoResize(textarea);
        debouncedSave({ description: value || undefined });
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsEditingTitle(false);
        }
    };

    const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsEditingDescription(false);
        }
    };

    return (
        <div className="space-y-1">
            {isEditingTitle ? (
                <textarea
                    ref={titleTextareaRef}
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value, e.target)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={handleTitleKeyDown}
                    className="scroll-m-20 text-4xl font-bold tracking-tight bg-transparent border-none outline-none w-full focus:ring-0 resize-none overflow-hidden text-white"
                    placeholder="Untitled"
                    rows={1}
                />
            ) : (
                <h1
                    onClick={() => setIsEditingTitle(true)}
                    className="scroll-m-20 text-4xl font-bold tracking-tight cursor-text hover:bg-muted/30 rounded px-1 -mx-1 transition-colors whitespace-pre-wrap break-words text-white"
                >
                    {title || 'Untitled'}
                </h1>
            )}

            {isEditingDescription ? (
                <textarea
                    ref={descriptionTextareaRef}
                    value={description}
                    onChange={(e) => handleDescriptionChange(e.target.value, e.target)}
                    onBlur={() => setIsEditingDescription(false)}
                    onKeyDown={handleDescriptionKeyDown}
                    className="text-lg text-muted-foreground bg-transparent border-none outline-none w-full focus:ring-0 resize-none overflow-hidden"
                    placeholder="Add a description..."
                    rows={1}
                />
            ) : (
                <p
                    onClick={() => setIsEditingDescription(true)}
                    className="text-lg text-muted-foreground cursor-text hover:bg-muted/30 rounded px-1 -mx-1 transition-colors min-h-[28px] whitespace-pre-wrap break-words"
                >
                    {description || 'Add a description...'}
                </p>
            )}
        </div>
    );
}
