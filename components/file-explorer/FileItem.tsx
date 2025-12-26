'use client'

import { useState } from 'react'
import { FileText, Trash2, Pencil, Globe, Lock, Square, CheckSquare, Download, Loader2 } from 'lucide-react'
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
        "hover:bg-[--sidebar-accent]",
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
                <ContextMenuSeparator />
                <ContextMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
