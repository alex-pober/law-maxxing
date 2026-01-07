'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FileText, Folder, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchNotes, SearchResult } from '@/app/actions';

function getContentPreview(content: string, query: string, maxLength: number = 200): string {
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

    const lowerText = cleaned.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return cleaned.slice(0, maxLength) + (cleaned.length > maxLength ? '…' : '');

    // Show more context around the match
    const start = Math.max(0, index - 60);
    const end = Math.min(cleaned.length, index + query.length + 120);

    let snippet = cleaned.slice(start, end);
    if (start > 0) snippet = '…' + snippet;
    if (end < cleaned.length) snippet = snippet + '…';

    return snippet;
}

export function SidebarSearch() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, startSearch] = useTransition();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            startSearch(async () => {
                try {
                    const searchResults = await searchNotes(query);
                    setResults(searchResults);
                    setSelectedIndex(0);
                } catch (error) {
                    console.error('Search error:', error);
                    setResults([]);
                }
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) {
                // Cmd/Ctrl + K to open
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    setIsOpen(true);
                }
                return;
            }

            switch (e.key) {
                case 'Escape':
                    setIsOpen(false);
                    setQuery('');
                    setResults([]);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(i => Math.min(i + 1, results.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(i => Math.max(i - 1, 0));
                    break;
                case 'Enter':
                    if (results[selectedIndex]) {
                        router.push(`/notes/${results[selectedIndex].id}`);
                        setIsOpen(false);
                        setQuery('');
                        setResults([]);
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex, router]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Click outside to close
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setQuery('');
                setResults([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleResultClick = useCallback((noteId: string) => {
        router.push(`/notes/${noteId}`);
        setIsOpen(false);
        setQuery('');
        setResults([]);
    }, [router]);

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 mx-2 mt-2 mb-1 rounded-lg",
                    "bg-muted/30 hover:bg-muted/50",
                    "border border-white/4 hover:border-white/8",
                    "text-muted-foreground/60 hover:text-muted-foreground/80",
                    "transition-all duration-200",
                    "text-sm"
                )}
                style={{ width: 'calc(100% - 16px)' }}
            >
                <Search className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left truncate">Search notes...</span>
                <kbd className={cn(
                    "hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded",
                    "bg-black/20 border border-white/6",
                    "text-[10px] font-medium text-muted-foreground/50"
                )}>
                    <span className="text-[11px]">⌘</span>K
                </kbd>
            </button>

            {/* Search Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal */}
                    <div
                        ref={containerRef}
                        className={cn(
                            "relative w-full max-w-2xl mx-4 rounded-xl overflow-hidden",
                            "bg-linear-to-br from-card to-card/95",
                            "border border-white/8",
                            "shadow-2xl shadow-black/40"
                        )}
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6">
                            {isSearching ? (
                                <Loader2 className="h-5 w-5 text-muted-foreground/50 animate-spin shrink-0" />
                            ) : (
                                <Search className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                            )}
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search your notes..."
                                className={cn(
                                    "flex-1 bg-transparent border-none outline-none",
                                    "text-foreground placeholder:text-muted-foreground/40",
                                    "text-[15px]"
                                )}
                            />
                            {query && (
                                <button
                                    onClick={() => {
                                        setQuery('');
                                        setResults([]);
                                        inputRef.current?.focus();
                                    }}
                                    className={cn(
                                        "p-1 rounded-md",
                                        "text-muted-foreground/50 hover:text-muted-foreground",
                                        "hover:bg-white/5",
                                        "transition-colors"
                                    )}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Results */}
                        <div className="max-h-[50vh] overflow-y-auto">
                            {query && results.length === 0 && !isSearching && (
                                <div className="flex flex-col items-center justify-center py-10 px-4">
                                    <Search className="h-8 w-8 text-muted-foreground/20 mb-2" />
                                    <p className="text-sm text-muted-foreground/50">
                                        No notes found
                                    </p>
                                </div>
                            )}

                            {results.length > 0 && (
                                <div className="py-2">
                                    {results.map((result, index) => (
                                        <button
                                            key={result.id}
                                            onClick={() => handleResultClick(result.id)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={cn(
                                                "w-full text-left px-4 py-4",
                                                "transition-colors duration-75",
                                                index === selectedIndex
                                                    ? "bg-primary/10"
                                                    : "hover:bg-white/3"
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <FileText className={cn(
                                                    "h-4 w-4 mt-0.5 shrink-0",
                                                    index === selectedIndex
                                                        ? "text-primary"
                                                        : "text-muted-foreground/40"
                                                )} />
                                                <div className="flex-1 min-w-0">
                                                    <div className={cn(
                                                        "font-medium text-[14px] truncate",
                                                        index === selectedIndex
                                                            ? "text-foreground"
                                                            : "text-foreground/80"
                                                    )}>
                                                        {result.title}
                                                    </div>
                                                    <div className="text-[12px] text-muted-foreground/50 line-clamp-3 mt-1 leading-relaxed">
                                                        {getContentPreview(result.content_markdown, query)}
                                                    </div>
                                                    {result.folder_path && (
                                                        <div className="flex items-center gap-1 mt-1 text-muted-foreground/30">
                                                            <Folder className="h-3 w-3" />
                                                            <span className="text-[11px] truncate">
                                                                {result.folder_path}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!query && (
                                <div className="py-8 px-4 text-center">
                                    <p className="text-sm text-muted-foreground/40">
                                        Start typing to search
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer hints */}
                        <div className={cn(
                            "flex items-center justify-end gap-4 px-4 py-2",
                            "border-t border-white/4",
                            "text-[11px] text-muted-foreground/30"
                        )}>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded bg-white/5">↑↓</kbd>
                                navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded bg-white/5">↵</kbd>
                                open
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded bg-white/5">esc</kbd>
                                close
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
