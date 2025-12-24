'use client'

import { FileText, Trash2, Pencil, Globe, Lock } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu'
import { deleteNote, toggleNotePublic } from '@/app/actions'
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
}

const INDENT_SIZE = 8

export function FileItem({ note, level = 0, isMounted = false }: FileItemProps) {
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
            await deleteNote(note.id)
        }
    }

    const handleTogglePublic = async () => {
        await toggleNotePublic(note.id, !note.is_public)
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
                        className={cn(
                            "group flex items-center h-[22px] pr-2 text-[13px] leading-[22px]",
                            "hover:bg-[--sidebar-accent]",
                            isActive && "bg-[--sidebar-accent] text-sidebar-accent-foreground",
                        )}
                        style={{ paddingLeft: `${indentPadding}px` }}
                        {...(isMounted ? { ...attributes, ...listeners } : {})}
                    >
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

                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground mr-1.5" />

                        <span className={cn(
                            "truncate flex-1",
                            isActive ? "text-sidebar-foreground" : "text-sidebar-foreground/80"
                        )}>
                            {note.title}
                        </span>

                        {note.is_public && (
                            <Globe className="h-3 w-3 shrink-0 text-emerald-500 ml-1" />
                        )}
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
                <ContextMenuSeparator />
                <ContextMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
