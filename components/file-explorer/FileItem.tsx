'use client'

import { FileText, Trash2, GripVertical } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { deleteNote } from '@/app/actions'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Note {
    id: string
    title: string
    folder_id: string | null
    position: number
}

interface FileItemProps {
    note: Note
    level?: number
    isMounted?: boolean
}

export function FileItem({ note, level = 0, isMounted = false }: FileItemProps) {
    const pathname = usePathname()
    const isActive = pathname === `/notes/${note.id}`

    const sortable = useSortable({ id: note.id, disabled: !isMounted })
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = sortable

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        paddingLeft: `${level * 12 + 32}px`,
    }

    const handleDelete = async () => {
        if (confirm(`Delete note "${note.title}"?`)) {
            await deleteNote(note.id)
        }
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div
                    ref={isMounted ? setNodeRef : undefined}
                    style={style}
                    className={cn(
                        "flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground group",
                        isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
                        isDragging && "opacity-50"
                    )}
                >
                    {isMounted && (
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                    )}
                    <Link
                        href={`/notes/${note.id}`}
                        className="flex items-start gap-2 flex-1 min-w-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="wrap-break-word text-xs">{note.title}</span>
                    </Link>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={handleDelete} className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
