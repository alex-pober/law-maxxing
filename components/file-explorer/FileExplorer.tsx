'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { FolderItem } from './FolderItem'
import { FileItem } from './FileItem'
import { VttConvertDialog } from './VttConvertDialog'
import { createFolder, createNoteInline, reorderItems, moveNote, moveFolder, getNotesForDownload } from '@/app/actions'
import JSZip from 'jszip'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Ellipsis, FilePlus, FolderPlus, FileText, Folder, CheckSquare, Download, X, FileAudio } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    DndContext,
    closestCenter,
    pointerWithin,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    DragOverEvent,
    CollisionDetection,
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
    const router = useRouter()
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
    const [isCreatingFolder, setIsCreatingFolder] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [isCreatingNote, setIsCreatingNote] = useState(false)
    const [newNoteTitle, setNewNoteTitle] = useState('')
    const [isSubmittingNote, setIsSubmittingNote] = useState(false)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    const [isOverRootZone, setIsOverRootZone] = useState(false)
    const rootDropRef = useRef<HTMLDivElement>(null)
    const [isSelectMode, setIsSelectMode] = useState(false)
    const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set())
    const [isVttDialogOpen, setIsVttDialogOpen] = useState(false)

    const [optimisticFolders, setOptimisticFolders] = useState<Folder[]>(folders)
    const [optimisticNotes, setOptimisticNotes] = useState<Note[]>(notes)

    useEffect(() => {
        setOptimisticFolders(folders)
    }, [folders])

    useEffect(() => {
        setOptimisticNotes(notes)
    }, [notes])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Custom collision detection: prioritize folder drops, then sortable reordering
    const customCollisionDetection: CollisionDetection = (args) => {
        // Check for folder droppables using pointerWithin
        const pointerCollisions = pointerWithin(args)
        const folderCollision = pointerCollisions.find(c =>
            String(c.id).startsWith('folder-drop-')
        )
        if (folderCollision) {
            return [folderCollision]
        }

        // Use closestCenter for sortable reordering
        return closestCenter(args)
    }

    const sortedFolders = [...optimisticFolders].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    const sortedNotes = [...optimisticNotes].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

    const rootFolders = sortedFolders.filter(f => !f.parent_id)
    const rootNotes = sortedNotes.filter(n => !n.folder_id)

    // Helper to check if targetFolderId is a descendant of folderId (would create circular reference)
    const isDescendantOf = (targetFolderId: string, folderId: string): boolean => {
        let currentId: string | null = targetFolderId
        const visited = new Set<string>()
        while (currentId && !visited.has(currentId)) {
            visited.add(currentId)
            if (currentId === folderId) return true
            const folder = optimisticFolders.find(f => f.id === currentId)
            currentId = folder?.parent_id ?? null
        }
        return false
    }

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newFolderName.trim()) {
            await createFolder(newFolderName, null)
            setNewFolderName('')
            setIsCreatingFolder(false)
        }
    }

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newNoteTitle.trim() && !isSubmittingNote) {
            setIsSubmittingNote(true)
            try {
                const noteId = await createNoteInline(newNoteTitle, selectedFolderId)
                setNewNoteTitle('')
                setIsCreatingNote(false)
                router.push(`/notes/${noteId}`)
            } finally {
                setIsSubmittingNote(false)
            }
        }
    }

    const handleToggleSelectMode = () => {
        if (isSelectMode) {
            setSelectedNoteIds(new Set())
        }
        setIsSelectMode(!isSelectMode)
    }

    const handleToggleNoteSelection = (noteId: string) => {
        setSelectedNoteIds(prev => {
            const next = new Set(prev)
            if (next.has(noteId)) {
                next.delete(noteId)
            } else {
                next.add(noteId)
            }
            return next
        })
    }

    const handleDownloadSelected = async () => {
        if (selectedNoteIds.size === 0) return

        const notesData = await getNotesForDownload(Array.from(selectedNoteIds))

        // Helper to build markdown content for a single note
        const buildNoteMarkdown = (note: { title: string; description: string | null; content_markdown: string | null }) => {
            let content = `# ${note.title}\n\n`
            if (note.description) {
                content += `> ${note.description}\n\n`
            }
            content += '---\n\n'
            content += note.content_markdown || ''
            return content
        }

        // Helper to sanitize filename
        const sanitizeFilename = (name: string) => {
            return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100)
        }

        if (notesData.length === 1) {
            // Single note: download directly as .md
            const note = notesData[0]
            const content = buildNoteMarkdown(note)
            const blob = new Blob([content], { type: 'text/markdown' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${sanitizeFilename(note.title)}.md`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } else {
            // Multiple notes: create a zip file
            const zip = new JSZip()

            notesData.forEach(note => {
                const content = buildNoteMarkdown(note)
                zip.file(`${sanitizeFilename(note.title)}.md`, content)
            })

            const zipBlob = await zip.generateAsync({ type: 'blob' })
            const url = URL.createObjectURL(zipBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = `notes-${new Date().toISOString().split('T')[0]}.zip`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }

        // Exit select mode after download
        setIsSelectMode(false)
        setSelectedNoteIds(new Set())
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(active.id as string)
    }

    const handleDragOver = (event: DragOverEvent) => {
        // Manually check if pointer is over the root drop zone using collision rect
        if (rootDropRef.current) {
            const dropZoneRect = rootDropRef.current.getBoundingClientRect()

            // Also try using activatorEvent + delta as fallback
            const activatorEvent = event.activatorEvent as PointerEvent
            const currentX = activatorEvent?.clientX + (event.delta?.x || 0)
            const currentY = activatorEvent?.clientY + (event.delta?.y || 0)

            const isOver = currentX >= dropZoneRect.left &&
                          currentX <= dropZoneRect.right &&
                          currentY >= dropZoneRect.top &&
                          currentY <= dropZoneRect.bottom

            setIsOverRootZone(isOver)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        setActiveId(null)
        setIsOverRootZone(false)

        const dragActiveId = active.id as string
        const draggedNote = optimisticNotes.find(n => n.id === dragActiveId)

        // Check position at drag end as well
        let droppedOnRootZone = isOverRootZone
        if (rootDropRef.current && !droppedOnRootZone) {
            const dropZoneRect = rootDropRef.current.getBoundingClientRect()
            const activatorEvent = event.activatorEvent as PointerEvent
            const currentX = activatorEvent?.clientX + (event.delta?.x || 0)
            const currentY = activatorEvent?.clientY + (event.delta?.y || 0)

            droppedOnRootZone = currentX >= dropZoneRect.left &&
                               currentX <= dropZoneRect.right &&
                               currentY >= dropZoneRect.top &&
                               currentY <= dropZoneRect.bottom
        }

        // FIRST: Check if we dropped on the root drop zone
        if (droppedOnRootZone) {
            // Handle note being moved to root
            if (draggedNote && draggedNote.folder_id) {
                setOptimisticNotes(prev => prev.map(n =>
                    n.id === dragActiveId ? { ...n, folder_id: null } : n
                ))
                moveNote(dragActiveId, null)
                return
            }
            // Handle folder being moved to root
            const draggedFolderForRoot = optimisticFolders.find(f => f.id === dragActiveId)
            if (draggedFolderForRoot && draggedFolderForRoot.parent_id) {
                setOptimisticFolders(prev => prev.map(f =>
                    f.id === dragActiveId ? { ...f, parent_id: null } : f
                ))
                moveFolder(dragActiveId, null)
                return
            }
        }

        if (!over || active.id === over.id) return

        const overId = over.id as string

        if (draggedNote) {
            // Check if dropped on root zone (moving note out of folder)
            if (overId === 'root-drop-zone') {
                // Only move if the note is currently in a folder
                if (draggedNote.folder_id) {
                    setOptimisticNotes(prev => prev.map(n =>
                        n.id === dragActiveId ? { ...n, folder_id: null } : n
                    ))
                    moveNote(dragActiveId, null)
                }
                return
            }

            // Check if dropped on a folder (either by sortable id or droppable id)
            const folderDropId = overId.startsWith('folder-drop-') ? overId.replace('folder-drop-', '') : null
            const targetFolder = optimisticFolders.find(f => f.id === overId || f.id === folderDropId)
            if (targetFolder) {
                // Don't move if already in this folder
                if (draggedNote.folder_id === targetFolder.id) return

                setOptimisticNotes(prev => prev.map(n =>
                    n.id === dragActiveId ? { ...n, folder_id: targetFolder.id } : n
                ))
                moveNote(dragActiveId, targetFolder.id)
                return
            }

            const targetNote = optimisticNotes.find(n => n.id === overId)
            if (targetNote) {
                // If dropping a note from a folder onto a root note, move to root
                if (draggedNote.folder_id && targetNote.folder_id === null) {
                    setOptimisticNotes(prev => prev.map(n =>
                        n.id === dragActiveId ? { ...n, folder_id: null } : n
                    ))
                    moveNote(dragActiveId, null)
                    return
                }

                const containerNotes = sortedNotes.filter(n => n.folder_id === draggedNote.folder_id)
                const oldIndex = containerNotes.findIndex(n => n.id === dragActiveId)
                const newIndex = containerNotes.findIndex(n => n.id === overId)

                if (oldIndex !== -1 && newIndex !== -1) {
                    const reordered = [...containerNotes]
                    const [removed] = reordered.splice(oldIndex, 1)
                    reordered.splice(newIndex, 0, removed)

                    const updates = reordered.map((note, index) => ({
                        id: note.id,
                        position: index,
                        folder_id: note.folder_id,
                    }))

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

                    reorderItems(updates, 'notes')
                }
            }
            return
        }

        const draggedFolder = optimisticFolders.find(f => f.id === dragActiveId)
        if (draggedFolder) {
            // Check if dropped on a folder droppable zone (folder-into-folder)
            const folderDropId = overId.startsWith('folder-drop-') ? overId.replace('folder-drop-', '') : null
            const targetFolder = folderDropId ? optimisticFolders.find(f => f.id === folderDropId) : null

            if (targetFolder) {
                // Don't move if already in this folder or if it would create circular reference
                if (draggedFolder.parent_id === targetFolder.id) return
                if (draggedFolder.id === targetFolder.id) return
                if (isDescendantOf(targetFolder.id, draggedFolder.id)) return

                setOptimisticFolders(prev => prev.map(f =>
                    f.id === dragActiveId ? { ...f, parent_id: targetFolder.id } : f
                ))
                moveFolder(dragActiveId, targetFolder.id)
                return
            }

            // Regular folder reordering (same parent level)
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

                reorderItems(updates, 'folders')
            }
        }
    }

    const activeNote = activeId ? notes.find(n => n.id === activeId) : null
    const activeFolder = activeId ? folders.find(f => f.id === activeId) : null

    const rootItemIds = [...rootFolders.map(f => f.id), ...rootNotes.map(n => n.id)]

    // Check if currently dragging a note that's inside a folder OR a folder that has a parent
    const isDraggingFromFolder = (activeNote && activeNote.folder_id !== null) ||
                                  (activeFolder && activeFolder.parent_id !== null)

    const content = (
        <div className="flex flex-col h-full bg-sidebar select-none overflow-hidden m-1 mt-3">
            <div className="flex justify-between gap-0.5">
                <div className='flex ml-2 items-center gap-1.5'>
                    <span>Notes</span>
                </div>
                <div>
                    <button
                        className="p-1 hover:bg-accent rounded"
                        title="New note"
                        onClick={() => setIsCreatingNote(true)}
                    >
                        <FilePlus className="h-4 w-4" />
                    </button>
                    <button
                        className="p-1 hover:bg-accent rounded"
                        title="New Folder"
                        onClick={() => setIsCreatingFolder(true)}
                    >
                        <FolderPlus className="h-4 w-4" />
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-accent rounded" title="More Actions">
                                <Ellipsis className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsCreatingFolder(true)}>
                                <FolderPlus className="h-4 w-4 mr-2" />
                                New Folder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsVttDialogOpen(true)}>
                                <FileAudio className="h-4 w-4 mr-2" />
                                Import VTT Transcript
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleToggleSelectMode}>
                                <CheckSquare className="h-4 w-4 mr-2" />
                                Select
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isSelectMode && (
                <div className="flex items-center justify-between px-2 py-1.5 bg-primary/10 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">
                        {selectedNoteIds.size} selected
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleDownloadSelected}
                            disabled={selectedNoteIds.size === 0}
                            className="p-1 hover:bg-accent rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Download as Markdown"
                        >
                            <Download className="h-4 w-4" />
                        </button>
                        <button
                            onClick={handleToggleSelectMode}
                            className="p-1 hover:bg-accent rounded"
                            title="Cancel Selection"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            <div
                className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll"
                onClick={(e) => {
                    // Deselect folder when clicking on empty space
                    if (e.target === e.currentTarget) {
                        setSelectedFolderId(null)
                    }
                }}
            >
                <div className="py-0.5">
                    {isCreatingNote && (
                        <form onSubmit={handleCreateNote} className="px-2 py-0.5">
                            <Input
                                autoFocus
                                value={newNoteTitle}
                                onChange={(e) => setNewNoteTitle(e.target.value)}
                                placeholder={isSubmittingNote ? "Creating..." : "Note title..."}
                                disabled={isSubmittingNote}
                                className="h-[22px] text-[13px] rounded-none border-primary bg-background disabled:opacity-50"
                                onBlur={() => {
                                    if (!newNoteTitle.trim() && !isSubmittingNote) setIsCreatingNote(false)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape' && !isSubmittingNote) setIsCreatingNote(false)
                                }}
                            />
                        </form>
                    )}
                    {isCreatingFolder && (
                        <form onSubmit={handleCreateFolder} className="px-2 py-0.5">
                            <Input
                                autoFocus
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Folder name..."
                                className="h-[22px] text-[13px] rounded-none border-primary bg-background"
                                onBlur={() => {
                                    if (!newFolderName.trim()) setIsCreatingFolder(false)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') setIsCreatingFolder(false)
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
                                    isSelectMode={isSelectMode}
                                    selectedNoteIds={selectedNoteIds}
                                    onToggleNoteSelection={handleToggleNoteSelection}
                                />
                            ))}
                            {rootNotes.map(note => (
                                <FileItem
                                    key={note.id}
                                    note={note}
                                    isMounted={isMounted}
                                    isSelectMode={isSelectMode}
                                    isSelected={selectedNoteIds.has(note.id)}
                                    onToggleSelection={handleToggleNoteSelection}
                                />
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
                                    isSelectMode={isSelectMode}
                                    selectedNoteIds={selectedNoteIds}
                                    onToggleNoteSelection={handleToggleNoteSelection}
                                />
                            ))}
                            {rootNotes.map(note => (
                                <FileItem
                                    key={note.id}
                                    note={note}
                                    isMounted={isMounted}
                                    isSelectMode={isSelectMode}
                                    isSelected={selectedNoteIds.has(note.id)}
                                    onToggleSelection={handleToggleNoteSelection}
                                />
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* Drop zone OUTSIDE scroll area - always visible at bottom */}
            <div
                ref={rootDropRef}
                className={cn(
                    "mx-2 mb-2 px-3 py-3 rounded-md text-xs transition-all flex items-center justify-center shrink-0",
                    isDraggingFromFolder
                        ? isOverRootZone
                            ? "border-2 border-dashed border-primary bg-primary/20 text-foreground"
                            : "border-2 border-dashed border-border/60 text-muted-foreground"
                        : "h-0 py-0 mb-0 overflow-hidden opacity-0"
                )}
            >
                {isDraggingFromFolder ? "Drop here to move to root" : ""}
            </div>
        </div>
    )

    if (!isMounted) {
        return content
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            {content}

            <DragOverlay>
                {activeNote ? (
                    <div className="flex items-center gap-1.5 h-[22px] px-2 text-[13px] bg-accent/90 backdrop-blur-sm border border-primary/50 shadow-lg">
                        <FileText className="h-4 w-4 shrink-0 opacity-80" />
                        <span className="truncate">{activeNote.title}</span>
                    </div>
                ) : activeFolder ? (
                    <div className="flex items-center gap-1.5 h-[22px] px-2 text-[13px] bg-accent/90 backdrop-blur-sm border border-primary/50 shadow-lg">
                        <Folder className="h-4 w-4 shrink-0 text-blue-400" />
                        <span className="truncate">{activeFolder.name}</span>
                    </div>
                ) : null}
            </DragOverlay>

            <VttConvertDialog
                open={isVttDialogOpen}
                onOpenChange={setIsVttDialogOpen}
                targetFolderId={selectedFolderId}
            />
        </DndContext>
    )
}
