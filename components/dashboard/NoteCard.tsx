'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { FileText, Star, ArrowUpRight, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleNoteFavorite } from '@/app/actions';

interface NoteCardProps {
    note: {
        id: string;
        title: string;
        description?: string | null;
        content_markdown: string;
        is_favorite?: boolean;
        created_at: string;
        updated_at?: string;
        folder_path?: string | null;
    };
    showDate?: 'created' | 'updated';
    variant?: 'default' | 'featured';
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

function getPreview(content: string, maxLength: number = 100): string {
    const cleaned = content
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .replace(/\n+/g, ' ')
        .trim();

    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength).trim() + '…';
}

export function NoteCard({ note, showDate = 'updated', variant = 'default' }: NoteCardProps) {
    const [isPending, startTransition] = useTransition();
    const dateString = showDate === 'updated' && note.updated_at
        ? note.updated_at
        : note.created_at;

    const preview = getPreview(note.content_markdown);

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
            await toggleNoteFavorite(note.id, !note.is_favorite);
        });
    };

    return (
        <Link
            href={`/notes/${note.id}`}
            className={cn(
                "group relative block overflow-hidden rounded-xl transition-all duration-300",
                "bg-gradient-to-br from-card/80 to-card/40",
                "border border-white/[0.05]",
                "hover:border-primary/30 hover:shadow-[0_0_30px_-5px] hover:shadow-primary/20",
                "hover:-translate-y-0.5",
                "backdrop-blur-sm",
                variant === 'featured' && "md:col-span-2"
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            <div className="relative p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className={cn(
                            "flex items-center justify-center w-9 h-9 rounded-lg",
                            "bg-gradient-to-br from-primary/20 to-primary/5",
                            "border border-primary/10",
                            "group-hover:from-primary/30 group-hover:to-primary/10",
                            "group-hover:border-primary/20",
                            "transition-all duration-300"
                        )}>
                            <FileText className="h-4 w-4 text-primary/80 group-hover:text-primary transition-colors duration-300" />
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleToggleFavorite}
                            disabled={isPending}
                            className={cn(
                                "flex items-center justify-center w-7 h-7 rounded-full",
                                "transition-all duration-200",
                                note.is_favorite
                                    ? "bg-yellow-500/15 border border-yellow-500/30 hover:bg-yellow-500/25"
                                    : "bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] opacity-0 group-hover:opacity-100",
                                isPending && "opacity-50 cursor-not-allowed"
                            )}
                            aria-label={note.is_favorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            <Star className={cn(
                                "h-3.5 w-3.5 transition-colors",
                                note.is_favorite
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/60 hover:text-yellow-400"
                            )} />
                        </button>

                        <div className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-full",
                            "bg-white/[0.03] border border-white/[0.05]",
                            "opacity-0 group-hover:opacity-100",
                            "translate-x-1 group-hover:translate-x-0",
                            "transition-all duration-300"
                        )}>
                            <ArrowUpRight className="h-3.5 w-3.5 text-primary/70" />
                        </div>
                    </div>
                </div>

                <h3 className={cn(
                    "font-semibold text-[15px] leading-snug mb-2",
                    "text-foreground/90 group-hover:text-white",
                    "transition-colors duration-300",
                    "line-clamp-2"
                )}>
                    {note.title}
                </h3>

                {preview && (
                    <p className={cn(
                        "text-[13px] leading-relaxed",
                        "text-muted-foreground/70 group-hover:text-muted-foreground/90",
                        "transition-colors duration-300",
                        "line-clamp-2 mb-4"
                    )}>
                        {preview}
                    </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.03]">
                    {note.folder_path ? (
                        <div className={cn(
                            "flex items-center gap-1.5 min-w-0 flex-1",
                            "text-muted-foreground/40 group-hover:text-muted-foreground/60",
                            "transition-colors duration-300"
                        )}>
                            <Folder className="h-3 w-3 shrink-0" />
                            <span className="text-[11px] truncate">
                                {note.folder_path}
                            </span>
                        </div>
                    ) : (
                        <div />
                    )}
                    <span className={cn(
                        "text-[11px] font-medium uppercase tracking-wider shrink-0",
                        "text-muted-foreground/50 group-hover:text-muted-foreground/70",
                        "transition-colors duration-300"
                    )}>
                        {formatRelativeTime(dateString)}
                    </span>
                </div>
            </div>

            <div className={cn(
                "absolute bottom-0 left-0 right-0 h-[2px]",
                "bg-gradient-to-r from-transparent via-primary/50 to-transparent",
                "opacity-0 group-hover:opacity-100",
                "transition-opacity duration-500"
            )} />
        </Link>
    );
}

export function NoteCardSkeleton() {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl",
            "bg-gradient-to-br from-card/80 to-card/40",
            "border border-white/[0.05]",
            "backdrop-blur-sm"
        )}>
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-muted/30 animate-pulse" />
                </div>
                <div className="h-5 w-3/4 bg-muted/20 rounded animate-pulse mb-2" />
                <div className="space-y-1.5 mb-4">
                    <div className="h-3.5 w-full bg-muted/15 rounded animate-pulse" />
                    <div className="h-3.5 w-2/3 bg-muted/15 rounded animate-pulse" />
                </div>
                <div className="pt-3 border-t border-white/[0.03]">
                    <div className="h-3 w-16 bg-muted/10 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}
