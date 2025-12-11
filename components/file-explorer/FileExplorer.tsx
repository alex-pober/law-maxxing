'use client'

import { useState, useEffect } from 'react'
import { FolderItem } from './FolderItem'
import { FileItem } from './FileItem'
import { Button } from '@/components/ui/button'
import { FolderPlus, FilePlus } from 'lucide-react'
import { createFolder, reorderItems, moveNote } from '@/app/actions'
import { CreateNoteDialog } from '@/components/CreateNoteDialog'
import { Input } from '@/components/ui/input'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    DragOverEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'

interface Note {
    id: string
    title: string
    folder_id: string | null
    position: number
}

interface Folder {
    id: string
    name: string
    parent_id: string | null
    position: number
}

interface FileExplorerProps {
    folders: Folder[]
    notes: Note[]
}

export function FileExplorer({ folders, notes }: FileExplorerProps) {
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
    const [isCreatingFolder, setIsCreatingFolder] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeType, setActiveType] = useState<'note' | 'folder' | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    // Optimistic state for immediate UI updates
    const [optimisticFolders, setOptimisticFolders] = useState<Folder[]>(folders)
    const [optimisticNotes, setOptimisticNotes] = useState<Note[]>(notes)

    // Sync with server data when it changes
    useEffect(() => {
        setOptimisticFolders(folders)
    }, [folders])

    useEffect(() => {
        setOptimisticNotes(notes)
    }, [notes])

    // Prevent hydration mismatch by only rendering DndContext on client
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Sort by position using optimistic state
    const sortedFolders = [...optimisticFolders].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    const sortedNotes = [...optimisticNotes].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

    // Organize data into a tree
    const rootFolders = sortedFolders.filter(f => !f.parent_id)
    const rootNotes = sortedNotes.filter(n => !n.folder_id)

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newFolderName.trim()) {
            await createFolder(newFolderName, null)
            setNewFolderName('')
            setIsCreatingFolder(false)
        }
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const id = active.id as string

        if (notes.find(n => n.id === id)) {
            setActiveType('note')
        } else if (folders.find(f => f.id === id)) {
            setActiveType('folder')
        }
        setActiveId(id)
    }

    const handleDragOver = (event: DragOverEvent) => {
        // Can be used for visual feedback when dragging over folders
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        setActiveId(null)
        setActiveType(null)

        if (!over || active.id === over.id) return

        const dragActiveId = active.id as string
        const overId = over.id as string

        // Check if we're dragging a note
        const draggedNote = optimisticNotes.find(n => n.id === dragActiveId)
        if (draggedNote) {
            // Check if dropping onto a folder
            const targetFolder = optimisticFolders.find(f => f.id === overId)
            if (targetFolder) {
                // Optimistic update: move note into folder
                setOptimisticNotes(prev => prev.map(n =>
                    n.id === dragActiveId ? { ...n, folder_id: targetFolder.id } : n
                ))
                // Server update
                moveNote(dragActiveId, targetFolder.id)
                return
            }

            // Check if dropping onto root area or another note
            const targetNote = optimisticNotes.find(n => n.id === overId)
            if (targetNote) {
                // Get notes in same container
                const containerNotes = sortedNotes.filter(n => n.folder_id === draggedNote.folder_id)
                const oldIndex = containerNotes.findIndex(n => n.id === dragActiveId)
                const newIndex = containerNotes.findIndex(n => n.id === overId)

                if (oldIndex !== -1 && newIndex !== -1) {
                    // Reorder notes
                    const reordered = [...containerNotes]
                    const [removed] = reordered.splice(oldIndex, 1)
                    reordered.splice(newIndex, 0, removed)

                    const updates = reordered.map((note, index) => ({
                        id: note.id,
                        position: index,
                        folder_id: note.folder_id,
                    }))

                    // Optimistic update
                    setOptimisticNotes(prev => {
                        const updated = [...prev]
                        updates.forEach(u => {
                            const idx = updated.findIndex(n => n.id === u.id)
                            if (idx !== -1) {
                                updated[idx] = { ...updated[idx], position: u.position }
                            }
                        })
                        return updated
                    })

                    // Server update
                    reorderItems(updates, 'notes')
                }
            }
            return
        }

        // Check if we're dragging a folder
        const draggedFolder = optimisticFolders.find(f => f.id === dragActiveId)
        if (draggedFolder) {
            const containerFolders = sortedFolders.filter(f => f.parent_id === draggedFolder.parent_id)
            const oldIndex = containerFolders.findIndex(f => f.id === dragActiveId)
            const newIndex = containerFolders.findIndex(f => f.id === overId)

            if (oldIndex !== -1 && newIndex !== -1) {
                const reordered = [...containerFolders]
                const [removed] = reordered.splice(oldIndex, 1)
                reordered.splice(newIndex, 0, removed)

                const updates = reordered.map((folder, index) => ({
                    id: folder.id,
                    position: index,
                }))

                // Optimistic update
                setOptimisticFolders(prev => {
                    const updated = [...prev]
                    updates.forEach(u => {
                        const idx = updated.findIndex(f => f.id === u.id)
                        if (idx !== -1) {
                            updated[idx] = { ...updated[idx], position: u.position }
                        }
                    })
                    return updated
                })

                // Server update
                reorderItems(updates, 'folders')
            }
        }
    }

    const activeNote = activeId ? notes.find(n => n.id === activeId) : null
    const activeFolder = activeId ? folders.find(f => f.id === activeId) : null

    // Combine IDs for sortable context
    const rootItemIds = [...rootFolders.map(f => f.id), ...rootNotes.map(n => n.id)]

    const content = (
        <div className="flex flex-col h-full bg-muted/10 overflow-hidden">
            <div className="p-3 border-b flex items-center justify-between">
                <span className="font-semibold text-sm">Explorer</span>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsCreatingFolder(true)}
                        title="New Folder"
                    >
                        <FolderPlus className="h-4 w-4" />
                    </Button>
                    <CreateNoteDialog
                        variant="icon"
                        folderId={selectedFolderId}
                        trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="New Note">
                                <FilePlus className="h-4 w-4" />
                            </Button>
                        }
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-1">
                    {isCreatingFolder && (
                        <form onSubmit={handleCreateFolder} className="px-2 py-1">
                            <Input
                                autoFocus
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Folder name..."
                                className="h-8 text-sm"
                                onBlur={() => {
                                    if (!newFolderName.trim()) setIsCreatingFolder(false)
                                }}
                            />
                        </form>
                    )}
                    {isMounted ? (
                        <SortableContext items={rootItemIds} strategy={verticalListSortingStrategy}>
                            {rootFolders.map(folder => (
                                <FolderItem
                                    key={folder.id}
                                    folder={folder}
                                    allFolders={sortedFolders}
                                    allNotes={sortedNotes}
                                    isMounted={isMounted}
                                    selectedFolderId={selectedFolderId}
                                    onSelect={setSelectedFolderId}
                                />
                            ))}
                            {rootNotes.map(note => (
                                <FileItem key={note.id} note={note} isMounted={isMounted} />
                            ))}
                        </SortableContext>
                    ) : (
                        <>
                            {rootFolders.map(folder => (
                                <FolderItem
                                    key={folder.id}
                                    folder={folder}
                                    allFolders={sortedFolders}
                                    allNotes={sortedNotes}
                                    isMounted={isMounted}
                                    selectedFolderId={selectedFolderId}
                                    onSelect={setSelectedFolderId}
                                />
                            ))}
                            {rootNotes.map(note => (
                                <FileItem key={note.id} note={note} isMounted={isMounted} />
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    )

    if (!isMounted) {
        return content
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            {content}

            <DragOverlay>
                {activeNote ? (
                    <div className="flex items-center gap-2 px-2 py-1.5 text-sm bg-accent rounded-md shadow-lg">
                        <span className="truncate">{activeNote.title}</span>
                    </div>
                ) : activeFolder ? (
                    <div className="flex items-center gap-2 px-2 py-1.5 text-sm bg-accent rounded-md shadow-lg">
                        <span className="truncate">{activeFolder.name}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
