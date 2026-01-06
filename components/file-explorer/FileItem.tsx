'use client'

import { useState } from 'react'
import { FileText, Trash2, Pencil, Globe, Lock, Square, CheckSquare, Download, Loader2, Printer } from 'lucide-react'
import { marked } from 'marked'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu'
import { deleteNote, toggleNotePublic, getNotesForDownload } from '@/app/actions'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Note {
    id: string
    title: string
    folder_id: string | null
    position: number
    is_public?: boolean
}

interface FileItemProps {
    note: Note
    level?: number
    isMounted?: boolean
    isSelectMode?: boolean
    isSelected?: boolean
    onToggleSelection?: (noteId: string) => void
}

const INDENT_SIZE = 8

export function FileItem({ note, level = 0, isMounted = false, isSelectMode = false, isSelected = false, onToggleSelection }: FileItemProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const pathname = usePathname()
    const isActive = pathname === `/notes/${note.id}`

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: note.id, disabled: !isMounted })

    const indentPadding = level * INDENT_SIZE + 4 + 20 // +20 for chevron space alignment with folders

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const handleDelete = async () => {
        if (confirm(`Delete note "${note.title}"?`)) {
            setIsDeleting(true)
            try {
                await deleteNote(note.id)
            } finally {
                setIsDeleting(false)
            }
        }
    }

    const handleTogglePublic = async () => {
        await toggleNotePublic(note.id, !note.is_public)
    }

    const handleDownload = async () => {
        const notesData = await getNotesForDownload([note.id])
        if (notesData.length === 0) return

        const noteData = notesData[0]
        let content = `# ${noteData.title}\n\n`
        if (noteData.description) {
            content += `> ${noteData.description}\n\n`
        }
        content += '---\n\n'
        content += noteData.content_markdown || ''

        const sanitizeFilename = (name: string) => {
            return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100)
        }

        const blob = new Blob([content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${sanitizeFilename(noteData.title)}.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handlePrint = async () => {
        const notesData = await getNotesForDownload([note.id])
        if (notesData.length === 0) return

        const noteData = notesData[0]

        // Configure marked for GFM (GitHub Flavored Markdown)
        marked.setOptions({
            gfm: true,
            breaks: true,
        })

        // Convert markdown to HTML using marked
        const contentHtml = marked.parse(noteData.content_markdown || '') as string

        // Print-optimized styles matching the app's prose styling
        const printStyles = `
            * { box-sizing: border-box; margin: 0; padding: 0; }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 20px;
                color: #1a1a1a;
            }

            /* Title styles */
            .note-title {
                font-size: 2rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid #e5e5e5;
            }

            .note-description {
                color: #666;
                font-style: italic;
                margin-bottom: 1.5rem;
                padding: 12px 16px;
                background: #f9f9f9;
                border-left: 3px solid #ddd;
            }

            .note-divider {
                border: none;
                border-top: 1px solid #e5e5e5;
                margin: 1.5rem 0;
            }

            /* Heading hierarchy with indentation (matching app styles) */
            h1 { font-size: 1.875rem; font-weight: bold; margin: 1.5rem 0 0.5rem 0; line-height: 1.3; }
            h2 { font-size: 1.5rem; font-weight: 600; margin: 1.25rem 0 0.5rem 1rem; line-height: 1.3; }
            h3 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem 2rem; line-height: 1.3; }
            h4 { font-size: 1.125rem; font-weight: 500; margin: 0.75rem 0 0.5rem 3rem; line-height: 1.3; }
            h5 { font-size: 1rem; font-weight: 500; margin: 0.5rem 0 0.5rem 4rem; line-height: 1.3; }
            h6 { font-size: 0.875rem; font-weight: 500; margin: 0.5rem 0 0.5rem 4rem; color: #666; line-height: 1.3; }

            /* Paragraphs */
            p { margin: 0.5rem 0; line-height: 1.7; }

            /* Lists */
            ul, ol {
                margin: 0.5rem 0;
                padding-left: 1.5rem;
            }

            ul { list-style-type: disc; }
            ol { list-style-type: decimal; }

            ul ul { list-style-type: circle; }
            ul ul ul { list-style-type: square; }

            li {
                margin: 0.25rem 0;
                padding-left: 0.25rem;
                line-height: 1.5;
            }

            /* Task lists (marked uses contains-task-list class) */
            .contains-task-list {
                list-style: none;
                padding-left: 0;
            }

            .task-list-item {
                display: flex;
                align-items: flex-start;
                gap: 0.5rem;
                list-style: none;
            }

            .task-list-item input[type="checkbox"] {
                margin-top: 0.25rem;
                width: 1rem;
                height: 1rem;
            }

            /* Checked task items */
            .task-list-item input[type="checkbox"]:checked + * {
                text-decoration: line-through;
                opacity: 0.6;
            }

            li:has(> input[type="checkbox"]:checked) {
                text-decoration: line-through;
                opacity: 0.6;
            }

            /* Blockquotes */
            blockquote {
                border-left: 4px solid #3b82f6;
                padding-left: 1rem;
                margin: 0.5rem 0;
                color: #666;
                font-style: italic;
            }

            blockquote blockquote {
                margin-left: 1.5rem;
                margin-top: 0.5rem;
            }

            /* Code */
            code {
                background: #f5f5f5;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                font-size: 0.875rem;
            }

            pre {
                background: #f5f5f5;
                padding: 1rem;
                border-radius: 8px;
                overflow-x: auto;
                margin: 1rem 0;
            }

            pre code {
                background: none;
                padding: 0;
                font-size: 0.875rem;
            }

            /* Tables */
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 1rem 0;
            }

            th, td {
                border: 1px solid #ddd;
                padding: 0.5rem 0.75rem;
                text-align: left;
            }

            th {
                background: #f5f5f5;
                font-weight: 600;
            }

            /* Links */
            a {
                color: #3b82f6;
                text-decoration: underline;
                text-underline-offset: 2px;
            }

            /* Horizontal rule */
            hr {
                border: none;
                border-top: 1px solid #e5e5e5;
                margin: 2rem 0;
            }

            /* Strong and emphasis */
            strong { font-weight: 600; }
            em { font-style: italic; }
            del { text-decoration: line-through; }

            /* Page margins for all pages */
            @page {
                margin: 0.75in 0.5in;
            }

            /* Print-specific */
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    max-width: none;
                }
                a { color: inherit; }
                pre, blockquote { page-break-inside: avoid; }
                h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
            }
        `

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${noteData.title}</title>
                <style>${printStyles}</style>
            </head>
            <body>
                <h1 class="note-title">${noteData.title}</h1>
                ${noteData.description ? `<div class="note-description">${noteData.description}</div>` : ''}
                <hr class="note-divider">
                <div class="content">
                    ${contentHtml}
                </div>
            </body>
            </html>
        `

        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(printContent)
            printWindow.document.close()
            printWindow.onload = () => {
                printWindow.print()
            }
        }
    }

    const handleSelectionClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onToggleSelection?.(note.id)
    }

    const itemContent = (
        <>
            {level > 0 && (
                <div className="absolute left-0 top-0 bottom-0 pointer-events-none" style={{ width: `${indentPadding}px` }}>
                    {Array.from({ length: level }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute top-0 bottom-0 w-px bg-border/40 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: `${(i + 1) * INDENT_SIZE + 8}px` }}
                        />
                    ))}
                </div>
            )}

            {isDeleting ? (
                <Loader2 className="h-4 w-4 shrink-0 text-muted-foreground mr-1.5 animate-spin" />
            ) : isSelectMode ? (
                isSelected ? (
                    <CheckSquare className="h-4 w-4 shrink-0 text-primary mr-1.5" />
                ) : (
                    <Square className="h-4 w-4 shrink-0 text-muted-foreground mr-1.5" />
                )
            ) : (
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground mr-1.5" />
            )}

            <span className={cn(
                "truncate flex-1",
                isActive ? "text-sidebar-foreground" : "text-sidebar-foreground/80"
            )}>
                {note.title}
            </span>

            {note.is_public && (
                <Globe className="h-3 w-3 shrink-0 text-emerald-500 ml-1" />
            )}
        </>
    )

    const itemClassName = cn(
        "group flex items-center h-[22px] pr-2 text-[13px] leading-[22px] relative",
        "hover:bg-accent/80",
        isActive && !isSelectMode && "bg-primary/15 text-sidebar-foreground before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary",
        isSelected && isSelectMode && "bg-primary/15",
        isDeleting && "opacity-50 pointer-events-none",
    )

    // In select mode, render as a clickable div instead of a link
    if (isSelectMode) {
        return (
            <div
                ref={isMounted ? setNodeRef : undefined}
                style={style}
                className={cn(isDragging && "opacity-50")}
            >
                <div
                    className={cn(itemClassName, "cursor-pointer")}
                    style={{ paddingLeft: `${indentPadding}px` }}
                    onClick={handleSelectionClick}
                >
                    {itemContent}
                </div>
            </div>
        )
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div
                    ref={isMounted ? setNodeRef : undefined}
                    style={style}
                    className={cn(isDragging && "opacity-50")}
                >
                    <Link
                        href={`/notes/${note.id}`}
                        className={itemClassName}
                        style={{ paddingLeft: `${indentPadding}px` }}
                        {...(isMounted ? { ...attributes, ...listeners } : {})}
                    >
                        {itemContent}
                    </Link>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
                <ContextMenuItem onClick={handleTogglePublic}>
                    {note.is_public ? (
                        <>
                            <Lock className="mr-2 h-4 w-4" />
                            Make Private
                        </>
                    ) : (
                        <>
                            <Globe className="mr-2 h-4 w-4" />
                            Make Public
                        </>
                    )}
                </ContextMenuItem>
                <ContextMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                </ContextMenuItem>
                <ContextMenuItem onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download as Markdown
                </ContextMenuItem>
                <ContextMenuItem onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
