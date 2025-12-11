'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Trash2, GripVertical } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { FileItem } from './FileItem'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { createFolder, deleteFolder } from '@/app/actions'
import { Input } from '@/components/ui/input'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

interface Folder {
    id: string
    name: string
    parent_id: string | null
    position: number
}

interface Note {
    id: string
    title: string
    folder_id: string | null
    position: number
}

interface FolderItemProps {
    folder: Folder
    allFolders: Folder[]
    allNotes: Note[]
    level?: number
    isMounted?: boolean
    selectedFolderId?: string | null
    onSelect?: (id: string | null) => void
}

export function FolderItem({ folder, allFolders, allNotes, level = 0, isMounted = false, selectedFolderId, onSelect }: FolderItemProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isCreatingSubFolder, setIsCreatingSubFolder] = useState(false)
    const [newSubFolderName, setNewSubFolderName] = useState('')

    const sortable = useSortable({ id: folder.id, disabled: !isMounted })
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
    }

    const childFolders = allFolders.filter(f => f.parent_id === folder.id)
    const childNotes = allNotes.filter(n => n.folder_id === folder.id)
    const childItemIds = [...childFolders.map(f => f.id), ...childNotes.map(n => n.id)]

    const handleCreateSubFolder = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (newSubFolderName.trim()) {
            await createFolder(newSubFolderName, folder.id)
            setNewSubFolderName('')
            setIsCreatingSubFolder(false)
            setIsOpen(true)
        }
    }

    const handleDelete = async () => {
        if (confirm(`Delete folder "${folder.name}" and all its contents?`)) {
            await deleteFolder(folder.id)
        }
    }

    const isSelected = selectedFolderId === folder.id

    const handleClick = () => {
        if (isOpen) {
            // Closing folder - deselect if this folder was selected
            setIsOpen(false)
            if (isSelected) {
                onSelect?.(null)
            }
        } else {
            // Opening folder - select it
            setIsOpen(true)
            onSelect?.(folder.id)
        }
    }

    const childContent = (
        <>
            {childFolders.map(child => (
                <FolderItem
                    key={child.id}
                    folder={child}
                    allFolders={allFolders}
                    allNotes={allNotes}
                    level={level + 1}
                    isMounted={isMounted}
                    selectedFolderId={selectedFolderId}
                    onSelect={onSelect}
                />
            ))}
            {childNotes.map(note => (
                <FileItem key={note.id} note={note} level={level + 1} isMounted={isMounted} />
            ))}
        </>
    )

    return (
        <div ref={isMounted ? setNodeRef : undefined} style={style} className={cn(isDragging && "opacity-50")}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <ContextMenu>
                    <ContextMenuTrigger>
                        <div
                            className={cn(
                                "flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer group",
                                isSelected && "bg-accent/50"
                            )}
                            style={{ paddingLeft: `${level * 12 + 8}px` }}
                            onClick={handleClick}
                        >
                            {isMounted && (
                                <div
                                    {...attributes}
                                    {...listeners}
                                    className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                            )}
                            <CollapsibleTrigger asChild>
                                <div
                                    className="p-1 hover:bg-muted rounded-sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsOpen(!isOpen)
                                    }}
                                >
                                    {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                                </div>
                            </CollapsibleTrigger>
                            {isOpen ? <FolderOpen className="h-4 w-4 shrink-0 text-blue-500" /> : <Folder className="h-4 w-4 shrink-0 text-blue-500" />}
                            <span className="truncate flex-1">{folder.name}</span>
                        </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem onClick={() => {
                            setIsCreatingSubFolder(true)
                            setIsOpen(true)
                        }}>
                            <Plus className="mr-2 h-4 w-4" /> New Folder
                        </ContextMenuItem>
                        <ContextMenuItem onClick={handleDelete} className="text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>

                <CollapsibleContent>
                    {isCreatingSubFolder && (
                        <div style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }} className="pr-2 py-1">
                            <form onSubmit={handleCreateSubFolder}>
                                <Input
                                    autoFocus
                                    value={newSubFolderName}
                                    onChange={(e) => setNewSubFolderName(e.target.value)}
                                    placeholder="Folder name..."
                                    className="h-8 text-sm"
                                    onBlur={() => {
                                        if (!newSubFolderName.trim()) setIsCreatingSubFolder(false)
                                    }}
                                />
                            </form>
                        </div>
                    )}
                    {isMounted ? (
                        <SortableContext items={childItemIds} strategy={verticalListSortingStrategy}>
                            {childContent}
                        </SortableContext>
                    ) : (
                        childContent
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}
