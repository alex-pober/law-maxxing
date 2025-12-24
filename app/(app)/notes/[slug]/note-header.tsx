'use client';

import { useState, useRef, useEffect, useCallback, useTransition } from 'react';
import { Star, Globe, Lock } from 'lucide-react';
import { updateNoteMetadata, toggleNoteFavorite, toggleNotePublic } from '@/app/actions';
import { cn } from '@/lib/utils';

interface NoteHeaderProps {
    noteId: string;
    initialTitle: string;
    initialDescription: string;
    initialIsFavorite: boolean;
    initialIsPublic: boolean;
    initialClassName: string;
    initialTeacherName: string;
}

export function NoteHeader({ noteId, initialTitle, initialDescription, initialIsFavorite, initialIsPublic, initialClassName, initialTeacherName }: NoteHeaderProps) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [className, setClassName] = useState(initialClassName);
    const [teacherName, setTeacherName] = useState(initialTeacherName);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [isPending, startTransition] = useTransition();
    const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
    const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleToggleFavorite = () => {
        const newValue = !isFavorite;
        setIsFavorite(newValue);
        startTransition(async () => {
            await toggleNoteFavorite(noteId, newValue);
        });
    };

    const handleTogglePublic = () => {
        const newValue = !isPublic;
        setIsPublic(newValue);
        startTransition(async () => {
            await toggleNotePublic(noteId, newValue);
        });
    };

    const autoResize = (textarea: HTMLTextAreaElement | null) => {
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const debouncedSave = useCallback((data: { title?: string; description?: string; class_name?: string; teacher_name?: string }) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            updateNoteMetadata(noteId, data);
        }, 500);
    }, [noteId]);

    const handleClassNameChange = (value: string) => {
        setClassName(value);
        debouncedSave({ class_name: value || undefined });
    };

    const handleTeacherNameChange = (value: string) => {
        setTeacherName(value);
        debouncedSave({ teacher_name: value || undefined });
    };

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
            <div className="flex items-start gap-3">
                {isEditingTitle ? (
                    <textarea
                        ref={titleTextareaRef}
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value, e.target)}
                        onBlur={() => setIsEditingTitle(false)}
                        onKeyDown={handleTitleKeyDown}
                        className="scroll-m-20 text-4xl font-bold tracking-tight bg-transparent border-none outline-none w-full focus:ring-0 resize-none overflow-hidden text-white flex-1"
                        placeholder="Untitled"
                        rows={1}
                    />
                ) : (
                    <h1
                        onClick={() => setIsEditingTitle(true)}
                        className="scroll-m-20 text-4xl font-bold tracking-tight cursor-text hover:bg-muted/30 rounded px-1 -mx-1 transition-colors whitespace-pre-wrap break-words text-white flex-1"
                    >
                        {title || 'Untitled'}
                    </h1>
                )}

                {/* Public toggle button */}
                <button
                    onClick={handleTogglePublic}
                    disabled={isPending}
                    className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl mt-1",
                        "transition-all duration-200 shrink-0",
                        isPublic
                            ? "bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.15]",
                        isPending && "opacity-50 cursor-not-allowed"
                    )}
                    aria-label={isPublic ? "Make private" : "Make public"}
                    title={isPublic ? "Public - visible on Explore page" : "Private - only you can see this"}
                >
                    {isPublic ? (
                        <Globe className="h-5 w-5 text-emerald-400" />
                    ) : (
                        <Lock className="h-5 w-5 text-muted-foreground hover:text-emerald-400 transition-colors" />
                    )}
                </button>

                {/* Favorite button */}
                <button
                    onClick={handleToggleFavorite}
                    disabled={isPending}
                    className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl mt-1",
                        "transition-all duration-200 shrink-0",
                        isFavorite
                            ? "bg-yellow-500/15 border border-yellow-500/30 hover:bg-yellow-500/25"
                            : "bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.15]",
                        isPending && "opacity-50 cursor-not-allowed"
                    )}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    <Star className={cn(
                        "h-5 w-5 transition-colors",
                        isFavorite
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground hover:text-yellow-400"
                    )} />
                </button>
            </div>

            {/* Description and Class/Teacher info on same line */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
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
                            className="text-lg text-muted-foreground cursor-text hover:bg-muted/30 rounded px-1 -mx-1 transition-colors min-h-7 whitespace-pre-wrap break-words"
                        >
                            {description || 'Add a description...'}
                        </p>
                    )}
                </div>

                {/* Class and Teacher info - stacked on right */}
                <div className="flex flex-col gap-0.5 text-xs shrink-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground/50 w-12">Class:</span>
                        <input
                            type="text"
                            value={className}
                            onChange={(e) => handleClassNameChange(e.target.value)}
                            placeholder="Add class"
                            className="bg-transparent border-none outline-none text-muted-foreground placeholder:text-muted-foreground/30 w-28 focus:text-white transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground/50 w-12">Teacher:</span>
                        <input
                            type="text"
                            value={teacherName}
                            onChange={(e) => handleTeacherNameChange(e.target.value)}
                            placeholder="Add teacher"
                            className="bg-transparent border-none outline-none text-muted-foreground placeholder:text-muted-foreground/30 w-28 focus:text-white transition-colors"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
