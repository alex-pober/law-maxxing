'use client'

import { useState } from 'react'
import { ChevronRight, Folder, FolderOpen, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface FolderData {
    id: string
    name: string
    parent_id: string | null
}

interface FolderTreeFilterProps {
    folders: FolderData[]
    noteCounts: Record<string, number> // folder_id -> count of notes
    selectedFolderId: string | null
    onSelectFolder: (folderId: string | null) => void
    totalNotes: number
}

interface FolderNodeProps {
    folder: FolderData
    allFolders: FolderData[]
    noteCounts: Record<string, number>
    selectedFolderId: string | null
    onSelectFolder: (folderId: string | null) => void
    depth: number
}

function FolderNode({
    folder,
    allFolders,
    noteCounts,
    selectedFolderId,
    onSelectFolder,
    depth,
}: FolderNodeProps) {
    const [isOpen, setIsOpen] = useState(false)

    const childFolders = allFolders.filter(f => f.parent_id === folder.id)
    const hasChildren = childFolders.length > 0
    const noteCount = noteCounts[folder.id] || 0
    const isSelected = selectedFolderId === folder.id

    // Calculate total notes including subfolders
    const getTotalNotesInFolder = (folderId: string): number => {
        let total = noteCounts[folderId] || 0
        const children = allFolders.filter(f => f.parent_id === folderId)
        for (const child of children) {
            total += getTotalNotesInFolder(child.id)
        }
        return total
    }
    const totalInFolder = getTotalNotesInFolder(folder.id)

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div
                className={cn(
                    "flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors group",
                    isSelected
                        ? "bg-[#7aa2f7]/20 text-white"
                        : "text-[#a9b1d6] hover:bg-white/5 hover:text-white"
                )}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={() => onSelectFolder(folder.id)}
            >
                {hasChildren ? (
                    <CollapsibleTrigger
                        asChild
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                    >
                        <button className="p-0.5 hover:bg-white/10 rounded">
                            <ChevronRight
                                className={cn(
                                    "h-3.5 w-3.5 transition-transform",
                                    isOpen && "rotate-90"
                                )}
                            />
                        </button>
                    </CollapsibleTrigger>
                ) : (
                    <span className="w-4" />
                )}
                {isOpen ? (
                    <FolderOpen className="h-4 w-4 text-[#7aa2f7] shrink-0" />
                ) : (
                    <Folder className="h-4 w-4 text-[#7aa2f7] shrink-0" />
                )}
                <span className="truncate text-sm flex-1">{folder.name}</span>
                {totalInFolder > 0 && (
                    <span className="text-xs text-[#565f89]">{totalInFolder}</span>
                )}
            </div>
            {hasChildren && (
                <CollapsibleContent>
                    {childFolders.map(child => (
                        <FolderNode
                            key={child.id}
                            folder={child}
                            allFolders={allFolders}
                            noteCounts={noteCounts}
                            selectedFolderId={selectedFolderId}
                            onSelectFolder={onSelectFolder}
                            depth={depth + 1}
                        />
                    ))}
                </CollapsibleContent>
            )}
        </Collapsible>
    )
}

export function FolderTreeFilter({
    folders,
    noteCounts,
    selectedFolderId,
    onSelectFolder,
    totalNotes,
}: FolderTreeFilterProps) {
    const rootFolders = folders.filter(f => !f.parent_id)

    return (
        <div className="space-y-1">
            {/* All Notes option */}
            <div
                className={cn(
                    "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors",
                    selectedFolderId === null
                        ? "bg-[#7aa2f7]/20 text-white"
                        : "text-[#a9b1d6] hover:bg-white/5 hover:text-white"
                )}
                onClick={() => onSelectFolder(null)}
            >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="text-sm flex-1">All Notes</span>
                <span className="text-xs text-[#565f89]">{totalNotes}</span>
            </div>

            {/* Folder tree */}
            {rootFolders.map(folder => (
                <FolderNode
                    key={folder.id}
                    folder={folder}
                    allFolders={folders}
                    noteCounts={noteCounts}
                    selectedFolderId={selectedFolderId}
                    onSelectFolder={onSelectFolder}
                    depth={0}
                />
            ))}
        </div>
    )
}
