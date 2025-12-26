'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Trash2, Pencil, Globe, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FileItem } from './FileItem'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu'
import { createFolder, deleteFolder, toggleFolderPublic, renameFolder } from '@/app/actions'
import { Input } from '@/components/ui/input'
import { useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

interface Folder {
    id: string
    name: string
    parent_id: string | null
    position: number
    is_public?: boolean
}

interface Note {
    id: string
    title: string
    folder_id: string | null
    position: number
    is_public?: boolean
}

interface FolderItemProps {
    folder: Folder
    allFolders: Folder[]
    allNotes: Note[]
    level?: number
    isMounted?: boolean
    selectedFolderId?: string | null
    onSelect?: (id: string | null) => void
    isSelectMode?: boolean
    selectedNoteIds?: Set<string>
    onToggleNoteSelection?: (noteId: string) => void
}

const INDENT_SIZE = 8 // pixels per indent level

export function FolderItem({ folder, allFolders, allNotes, level = 0, isMounted = false, selectedFolderId, onSelect, isSelectMode, selectedNoteIds, onToggleNoteSelection }: FolderItemProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isCreatingSubFolder, setIsCreatingSubFolder] = useState(false)
    const [newSubFolderName, setNewSubFolderName] = useState('')
    const [isRenaming, setIsRenaming] = useState(false)
    const [renamingValue, setRenamingValue] = useState(folder.name)

    const {
        attributes,
        listeners,
        setNodeRef: setSortableRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: folder.id, disabled: !isMounted })

    // Separate droppable for the folder row only (not the expanded content)
    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: `folder-drop-${folder.id}`,
        data: { type: 'folder', folderId: folder.id },
        disabled: !isMounted,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const childFolders = allFolders.filter(f => f.parent_id === folder.id)
    const childNotes = allNotes.filter(n => n.folder_id === folder.id)
    const childItemIds = [...childFolders.map(f => f.id), ...childNotes.map(n => n.id)]
    const hasChildren = childFolders.length > 0 || childNotes.length > 0

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

    const handleTogglePublic = async () => {
        await toggleFolderPublic(folder.id, !folder.is_public)
    }

    const handleRename = async (e?: React.FormEvent) => {
        e?.preventDefault()
        e?.stopPropagation()
        if (renamingValue.trim() && renamingValue !== folder.name) {
            await renameFolder(folder.id, renamingValue.trim())
        }
        setIsRenaming(false)
    }

    const handleStartRename = () => {
        setRenamingValue(folder.name)
        setIsRenaming(true)
    }

    const isSelected = selectedFolderId === folder.id
    const indentPadding = level * INDENT_SIZE + 4

    const handleRowClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsOpen(!isOpen)
        onSelect?.(folder.id)
    }

    const handleChevronClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsOpen(!isOpen)
    }

    return (
        <div ref={isMounted ? setSortableRef : undefined} style={style} className={cn(isDragging && "opacity-50")}>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div
                        ref={isMounted ? setDroppableRef : undefined}
                        className={cn(
                            "group flex items-center h-[22px] pr-2 cursor-pointer text-[13px] leading-[22px] relative",
                            "hover:bg-[--sidebar-accent]",
                            isSelected && "bg-primary/15 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-primary",
                            isDragging && "opacity-50",
                            isOver && "bg-primary/20 ring-1 ring-primary/50"
                        )}
                        style={{ paddingLeft: `${indentPadding}px` }}
                        onClick={handleRowClick}
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

                        <div
                            className="flex items-center justify-center w-4 h-4 shrink-0"
                            onClick={handleChevronClick}
                        >
                            {hasChildren || true ? (
                                isOpen ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )
                            ) : (
                                <span className="w-4" />
                            )}
                        </div>

                        {isOpen ? (
                            <FolderOpen className="h-4 w-4 shrink-0 text-[#dcb67a] mr-1.5" />
                        ) : (
                            <Folder className="h-4 w-4 shrink-0 text-[#dcb67a] mr-1.5" />
                        )}

                        {isRenaming ? (
                            <form onSubmit={handleRename} className="flex-1 mr-1">
                                <Input
                                    autoFocus
                                    value={renamingValue}
                                    onChange={(e) => setRenamingValue(e.target.value)}
                                    className="h-[18px] text-[13px] rounded-sm border-primary bg-background px-1"
                                    onFocus={(e) => e.target.select()}
                                    onBlur={() => handleRename()}
                                    onKeyDown={(e) => {
                                        e.stopPropagation()
                                        if (e.key === 'Escape') {
                                            e.preventDefault()
                                            setRenamingValue(folder.name)
                                            setIsRenaming(false)
                                        } else if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleRename()
                                        }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </form>
                        ) : (
                            <span className="truncate flex-1 text-sidebar-foreground">{folder.name}</span>
                        )}

                        {folder.is_public && !isRenaming && (
                            <Globe className="h-3 w-3 shrink-0 text-emerald-500 ml-1" />
                        )}
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => {
                        setIsCreatingSubFolder(true)
                        setIsOpen(true)
                    }}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Folder
                    </ContextMenuItem>
                    <ContextMenuItem onClick={handleTogglePublic}>
                        {folder.is_public ? (
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
                    <ContextMenuItem onClick={handleStartRename}>
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

            {isOpen && (
                <div className="relative">
                    <div
                        className="absolute top-0 bottom-0 w-px bg-border/30"
                        style={{ left: `${indentPadding + INDENT_SIZE + 4}px` }}
                    />

                    {isCreatingSubFolder && (
                        <div className="flex items-center h-[22px]" style={{ paddingLeft: `${(level + 1) * INDENT_SIZE + 4 + 20}px` }}>
                            <form onSubmit={handleCreateSubFolder} className="flex-1 pr-2">
                                <Input
                                    autoFocus
                                    value={newSubFolderName}
                                    onChange={(e) => setNewSubFolderName(e.target.value)}
                                    placeholder="Folder name..."
                                    className="h-[20px] text-[13px] rounded-sm border-primary bg-background px-1"
                                    onBlur={() => {
                                        if (!newSubFolderName.trim()) setIsCreatingSubFolder(false)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') setIsCreatingSubFolder(false)
                                    }}
                                />
                            </form>
                        </div>
                    )}

                    {isMounted ? (
                        <SortableContext items={childItemIds} strategy={verticalListSortingStrategy}>
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
                                    isSelectMode={isSelectMode}
                                    selectedNoteIds={selectedNoteIds}
                                    onToggleNoteSelection={onToggleNoteSelection}
                                />
                            ))}
                            {childNotes.map(note => (
                                <FileItem
                                    key={note.id}
                                    note={note}
                                    level={level + 1}
                                    isMounted={isMounted}
                                    isSelectMode={isSelectMode}
                                    isSelected={selectedNoteIds?.has(note.id)}
                                    onToggleSelection={onToggleNoteSelection}
                                />
                            ))}
                        </SortableContext>
                    ) : (
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
                                    isSelectMode={isSelectMode}
                                    selectedNoteIds={selectedNoteIds}
                                    onToggleNoteSelection={onToggleNoteSelection}
                                />
                            ))}
                            {childNotes.map(note => (
                                <FileItem
                                    key={note.id}
                                    note={note}
                                    level={level + 1}
                                    isMounted={isMounted}
                                    isSelectMode={isSelectMode}
                                    isSelected={selectedNoteIds?.has(note.id)}
                                    onToggleSelection={onToggleNoteSelection}
                                />
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
