'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
    const activeItemRef = useRef<HTMLAnchorElement>(null);

    const parseHeadings = useCallback(() => {
        const titleElement = document.querySelector('main h1:not(.prose h1)');
        if (titleElement) {
            setNoteTitle(titleElement.textContent || '');
        }

        const elements = Array.from(document.querySelectorAll('.prose h1[id], .prose h2[id], .prose h3[id], .prose h4[id], .prose h5[id], .prose h6[id]'))
            .map((element) => ({
                id: element.id,
                text: element.textContent || '',
                level: Number(element.tagName.substring(1)),
            }));
        setHeadings(elements);
        return elements;
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        const elements = parseHeadings();

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

    useEffect(() => {
        if (activeItemRef.current) {
            activeItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [activeId]);

    const displayTitle = noteTitle || 'Outline';

    if (headings.length === 0) {
        return (
            <div className="text-sm">
                <p className="font-medium text-white truncate" title={displayTitle}>{displayTitle}</p>
                <p className="text-xs text-muted-foreground mt-2">No headings found</p>
            </div>
        );
    }

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveId(id);
        }
    };

    return (
        <div className="text-sm ">
            <p className="font-medium truncate" title={displayTitle}>{displayTitle}</p>
            <ul className="m-0 list-none">
                {headings.map((item, index) => (
                    <li key={`${item.id}-${index}`} className="mt-0 pt-2">
                        <a
                            ref={item.id === activeId ? activeItemRef : null}
                            href={`#${item.id}`}
                            onClick={(e) => handleClick(e, item.id)}
                            className={cn(
                                "inline-block no-underline transition-colors hover:text-foreground cursor-pointer",
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
