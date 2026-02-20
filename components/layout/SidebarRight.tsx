'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TocNode {
    item: TocItem;
    children: TocNode[];
}

function buildTree(headings: TocItem[]): TocNode[] {
    const root: TocNode[] = [];
    const stack: { node: TocNode; level: number }[] = [];

    for (const item of headings) {
        const node: TocNode = { item, children: [] };
        while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
            stack.pop();
        }
        if (stack.length === 0) {
            root.push(node);
        } else {
            stack[stack.length - 1].node.children.push(node);
        }
        stack.push({ node, level: item.level });
    }

    return root;
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

    const renderTocNodes = (nodes: TocNode[], depth: number = 0): React.ReactNode => (
        <ul
            className={cn(
                "list-none m-0",
                depth > 0 && "border-l border-border/25 ml-[7px] pl-[10px] mt-0"
            )}
        >
            {nodes.map(({ item, children }, index) => {
                const isActive = item.id === activeId;

                return (
                    <li key={`${item.id}-${index}`} className="mt-0 pt-1.5">
                        <a
                            ref={isActive ? activeItemRef : null}
                            href={`#${item.id}`}
                            onClick={(e) => handleClick(e, item.id)}
                            tabIndex={-1}
                            className={cn(
                                "flex items-center gap-1.5 no-underline transition-colors cursor-pointer",
                                depth === 0 && "text-[15px] font-medium",
                                depth === 1 && "text-[13px]",
                                depth >= 2 && "text-[12px]",
                                isActive
                                    ? "text-foreground"
                                    : depth === 0
                                        ? "text-foreground/75 hover:text-foreground"
                                        : depth === 1
                                            ? "text-muted-foreground hover:text-foreground"
                                            : "text-muted-foreground/70 hover:text-muted-foreground",
                            )}
                        >
                            <span
                                className={cn(
                                    "shrink-0 rounded-full transition-colors",
                                    depth === 0 && "w-[5px] h-[5px]",
                                    depth === 1 && "w-[4px] h-[4px]",
                                    depth >= 2 && "w-[3px] h-[3px]",
                                    isActive
                                        ? "bg-primary"
                                        : depth === 0
                                            ? "bg-foreground/40"
                                            : "bg-muted-foreground/40"
                                )}
                            />
                            <span className="truncate leading-snug">{item.text}</span>
                        </a>
                        {children.length > 0 && renderTocNodes(children, depth + 1)}
                    </li>
                );
            })}
        </ul>
    );

    return (
        <div className="text-sm">
            <p className="font-medium truncate" title={displayTitle}>{displayTitle}</p>
            {renderTocNodes(buildTree(headings))}
        </div>
    );
}
