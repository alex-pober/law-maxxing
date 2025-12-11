'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface NoteRendererProps {
    content: string;
}

export function NoteRenderer({ content }: NoteRendererProps) {
    const [isMemorizeMode, setIsMemorizeMode] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isMemorizeMode || !contentRef.current) return;

        const walk = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || '';
                const regex = /\b([a-zA-Z])([a-zA-Z]+)\b/g;
                let match;
                let lastIndex = 0;

                // If no matches, don't do anything to avoid unnecessary DOM manipulation
                if (!regex.test(text)) return;
                regex.lastIndex = 0; // Reset after test

                const fragment = document.createDocumentFragment();

                while ((match = regex.exec(text)) !== null) {
                    // Append text before the match
                    if (match.index > lastIndex) {
                        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
                    }

                    // Append first letter
                    fragment.appendChild(document.createTextNode(match[1]));

                    // Append hidden part
                    const span = document.createElement('span');
                    span.style.visibility = 'hidden';
                    span.textContent = match[2];
                    fragment.appendChild(span);

                    lastIndex = regex.lastIndex;
                }

                // Append remaining text
                if (lastIndex < text.length) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
                }

                node.parentNode?.replaceChild(fragment, node);
            } else {
                Array.from(node.childNodes).forEach(walk);
            }
        };

        // We need to wait for the render to complete? 
        // useEffect runs after render.
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
                // Changing the key forces a re-render when mode toggles, 
                // resetting the DOM to the original markdown before the effect runs.
                key={isMemorizeMode ? 'memorize' : 'normal'}
                className="prose prose-slate max-w-none dark:prose-invert"
            >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSlug]}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}
