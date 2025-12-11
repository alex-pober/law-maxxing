'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

export function SidebarRight() {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [noteTitle, setNoteTitle] = useState<string>('');

    const parseHeadings = useCallback(() => {
        // Get the note title from the main h1 (not in prose/markdown)
        const titleElement = document.querySelector('main h1:not(.prose h1)');
        if (titleElement) {
            setNoteTitle(titleElement.textContent || '');
        }

        // Parse headings from the rendered markdown content
        const elements = Array.from(document.querySelectorAll('.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6'))
            .filter((element) => element.id)
            .map((element) => ({
                id: element.id,
                text: element.textContent || '',
                level: Number(element.tagName.substring(1)),
            }));
        setHeadings(elements);
        return elements;
    }, []);

    useEffect(() => {
        // Initial parse
        // eslint-disable-next-line react-hooks/set-state-in-effect
        const elements = parseHeadings();

        // Set up MutationObserver to detect content changes
        const mutationObserver = new MutationObserver(() => {
            parseHeadings();
        });

        const mainContent = document.querySelector('main');
        if (mainContent) {
            mutationObserver.observe(mainContent, {
                childList: true,
                subtree: true,
                characterData: true,
            });
        }

        // Intersection observer for active heading
        const intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '0% 0% -80% 0%' }
        );

        elements.forEach((element) => {
            const el = document.getElementById(element.id);
            if (el) intersectionObserver.observe(el);
        });

        return () => {
            mutationObserver.disconnect();
            intersectionObserver.disconnect();
        };
    }, [parseHeadings]);

    // Re-observe headings when they change
    useEffect(() => {
        const intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '0% 0% -80% 0%' }
        );

        headings.forEach((heading) => {
            const el = document.getElementById(heading.id);
            if (el) intersectionObserver.observe(el);
        });

        return () => intersectionObserver.disconnect();
    }, [headings]);

    const displayTitle = noteTitle || 'Outline';

    if (headings.length === 0) {
        return (
            <div className="text-sm">
                <p className="font-medium text-white truncate" title={displayTitle}>{displayTitle}</p>
                <p className="text-xs text-muted-foreground mt-2">No headings found</p>
            </div>
        );
    }

    return (
        <div className="text-sm ">
            <p className="font-medium truncate" title={displayTitle}>{displayTitle}</p>
            <ul className="m-0 list-none">
                {headings.map((item) => (
                    <li key={item.id} className="mt-0 pt-2">
                        <a
                            href={`#${item.id}`}
                            className={cn(
                                "inline-block no-underline transition-colors hover:text-foreground",
                                item.id === activeId
                                    ? "font-medium text-foreground"
                                    : "text-muted-foreground"
                            )}
                            style={{ paddingLeft: `${(item.level - 1) * 1}rem` }}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
