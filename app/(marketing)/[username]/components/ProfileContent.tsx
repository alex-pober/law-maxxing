'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterSidebar } from './FilterSidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Search,
    FileText,
    Folder,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
} from 'lucide-react'
import Link from 'next/link'

interface Note {
    id: string
    title: string
    description: string | null
    class_name: string | null
    teacher_name: string | null
    updated_at: string
    folder_id: string | null
}

interface FolderData {
    id: string
    name: string
    parent_id: string | null
}

interface ProfileContentProps {
    notes: Note[]
    folders: FolderData[]
    totalCount: number
    username: string
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

function buildFolderPath(folderId: string | null, folders: FolderData[]): string {
    if (!folderId) return ""

    const folderMap = new Map(folders.map(f => [f.id, f]))
    const pathParts: string[] = []
    let currentId: string | null = folderId

    while (currentId) {
        const folder = folderMap.get(currentId)
        if (!folder) break
        pathParts.unshift(folder.name)
        currentId = folder.parent_id
    }

    return pathParts.join(" / ")
}

export function ProfileContent({
    notes,
    folders,
    totalCount,
    username,
}: ProfileContentProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Parse URL params
    const initialFolder = searchParams.get('folder')
    const initialClasses = searchParams.get('classes')?.split(',').filter(Boolean) || []
    const initialTeachers = searchParams.get('teachers')?.split(',').filter(Boolean) || []
    const initialSearch = searchParams.get('q') || ''
    const initialPage = parseInt(searchParams.get('page') || '1', 10)

    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initialFolder)
    const [selectedClasses, setSelectedClasses] = useState<string[]>(initialClasses)
    const [selectedTeachers, setSelectedTeachers] = useState<string[]>(initialTeachers)
    const [searchQuery, setSearchQuery] = useState(initialSearch)
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    // Extract unique classes and teachers from notes
    const uniqueClasses = useMemo(() => {
        const classes = notes
            .map(n => n.class_name)
            .filter((c): c is string => c !== null && c.trim() !== '')
        return [...new Set(classes)].sort()
    }, [notes])

    const uniqueTeachers = useMemo(() => {
        const teachers = notes
            .map(n => n.teacher_name)
            .filter((t): t is string => t !== null && t.trim() !== '')
        return [...new Set(teachers)].sort()
    }, [notes])

    // Calculate note counts per folder
    const noteCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        notes.forEach(note => {
            if (note.folder_id) {
                counts[note.folder_id] = (counts[note.folder_id] || 0) + 1
            }
        })
        return counts
    }, [notes])

    // Get all folder IDs that are descendants of a folder
    const getFolderDescendants = (folderId: string): string[] => {
        const descendants: string[] = [folderId]
        const children = folders.filter(f => f.parent_id === folderId)
        for (const child of children) {
            descendants.push(...getFolderDescendants(child.id))
        }
        return descendants
    }

    // Filter notes
    const filteredNotes = useMemo(() => {
        let result = [...notes]

        // Filter by folder (include subfolders)
        if (selectedFolderId) {
            const folderIds = getFolderDescendants(selectedFolderId)
            result = result.filter(n => n.folder_id && folderIds.includes(n.folder_id))
        }

        // Filter by classes
        if (selectedClasses.length > 0) {
            result = result.filter(n => n.class_name && selectedClasses.includes(n.class_name))
        }

        // Filter by teachers
        if (selectedTeachers.length > 0) {
            result = result.filter(n => n.teacher_name && selectedTeachers.includes(n.teacher_name))
        }

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.description?.toLowerCase().includes(query)
            )
        }

        return result
    }, [notes, selectedFolderId, selectedClasses, selectedTeachers, searchQuery, folders])

    // Pagination
    const itemsPerPage = 12
    const totalPages = Math.ceil(filteredNotes.length / itemsPerPage)
    const currentPage = Math.min(initialPage, totalPages || 1)
    const paginatedNotes = filteredNotes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Update URL when filters change
    const updateUrl = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key)
            } else {
                params.set(key, value)
            }
        })

        // Reset to page 1 when filters change (except page changes)
        if (!('page' in updates)) {
            params.delete('page')
        }

        const queryString = params.toString()
        router.push(`/${username}${queryString ? `?${queryString}` : ''}`, { scroll: false })
    }

    const handleFolderChange = (folderId: string | null) => {
        setSelectedFolderId(folderId)
        updateUrl({ folder: folderId })
    }

    const handleClassChange = (classes: string[]) => {
        setSelectedClasses(classes)
        updateUrl({ classes: classes.length > 0 ? classes.join(',') : null })
    }

    const handleTeacherChange = (teachers: string[]) => {
        setSelectedTeachers(teachers)
        updateUrl({ teachers: teachers.length > 0 ? teachers.join(',') : null })
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
        // Debounce URL update for search
        updateUrl({ q: value || null })
    }

    const handleClearFilters = () => {
        setSelectedFolderId(null)
        setSelectedClasses([])
        setSelectedTeachers([])
        setSearchQuery('')
        router.push(`/${username}`, { scroll: false })
    }

    const handlePageChange = (page: number) => {
        updateUrl({ page: page > 1 ? String(page) : null })
    }

    const hasActiveFilters =
        selectedFolderId !== null ||
        selectedClasses.length > 0 ||
        selectedTeachers.length > 0 ||
        searchQuery.trim() !== ''

    return (
        <div className="flex h-[calc(100vh-200px)] min-h-[500px]">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 shrink-0">
                <FilterSidebar
                    folders={folders}
                    noteCounts={noteCounts}
                    totalNotes={totalCount}
                    classes={uniqueClasses}
                    teachers={uniqueTeachers}
                    selectedFolderId={selectedFolderId}
                    selectedClasses={selectedClasses}
                    selectedTeachers={selectedTeachers}
                    onFolderChange={handleFolderChange}
                    onClassChange={handleClassChange}
                    onTeacherChange={handleTeacherChange}
                    onClearFilters={handleClearFilters}
                />
            </div>

            {/* Mobile Filter Overlay */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowMobileFilters(false)}
                    />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#1a1b26]">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="font-semibold text-white">Filters</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowMobileFilters(false)}
                                className="text-[#a9b1d6] hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <FilterSidebar
                            folders={folders}
                            noteCounts={noteCounts}
                            totalNotes={totalCount}
                            classes={uniqueClasses}
                            teachers={uniqueTeachers}
                            selectedFolderId={selectedFolderId}
                            selectedClasses={selectedClasses}
                            selectedTeachers={selectedTeachers}
                            onFolderChange={(id) => {
                                handleFolderChange(id)
                                setShowMobileFilters(false)
                            }}
                            onClassChange={handleClassChange}
                            onTeacherChange={handleTeacherChange}
                            onClearFilters={() => {
                                handleClearFilters()
                                setShowMobileFilters(false)
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/10">
                    {/* Mobile Filter Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMobileFilters(true)}
                        className="lg:hidden border-white/10 text-[#a9b1d6] hover:bg-white/5"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-[#7aa2f7] text-white rounded-full">
                                {(selectedFolderId ? 1 : 0) + selectedClasses.length + selectedTeachers.length}
                            </span>
                        )}
                    </Button>

                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#565f89]" />
                        <Input
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-[#565f89] focus-visible:ring-[#7aa2f7]"
                        />
                    </div>

                    {/* Results count */}
                    <span className="text-sm text-[#565f89] ml-auto">
                        {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {paginatedNotes.length > 0 ? (
                        <>
                            <div className="rounded-lg border border-white/10 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-white/10 hover:bg-transparent">
                                            <TableHead className="text-[#a9b1d6]">Title</TableHead>
                                            <TableHead className="text-[#a9b1d6] hidden md:table-cell">Folder</TableHead>
                                            <TableHead className="text-[#a9b1d6] hidden lg:table-cell">Class</TableHead>
                                            <TableHead className="text-[#a9b1d6] hidden xl:table-cell">Teacher</TableHead>
                                            <TableHead className="text-[#a9b1d6] hidden sm:table-cell text-right">Updated</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedNotes.map(note => {
                                            const folderPath = buildFolderPath(note.folder_id, folders)
                                            return (
                                                <TableRow key={note.id} className="border-white/10 hover:bg-white/5">
                                                    <TableCell>
                                                        <Link
                                                            href={`/explore/${note.id}`}
                                                            className="flex items-center gap-3 text-white hover:text-[#7aa2f7] transition-colors"
                                                        >
                                                            <FileText className="h-4 w-4 text-[#a9b1d6] shrink-0" />
                                                            <div className="min-w-0">
                                                                <div className="font-medium truncate">{note.title}</div>
                                                                {note.description && (
                                                                    <div className="text-sm text-[#a9b1d6] truncate max-w-[300px]">
                                                                        {note.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-[#a9b1d6]">
                                                        {folderPath ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <Folder className="h-3.5 w-3.5 text-[#bb9af7] shrink-0" />
                                                                <span className="truncate max-w-[180px] text-sm">{folderPath}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[#565f89]">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell text-[#a9b1d6]">
                                                        {note.class_name || <span className="text-[#565f89]">—</span>}
                                                    </TableCell>
                                                    <TableCell className="hidden xl:table-cell text-[#a9b1d6]">
                                                        {note.teacher_name || <span className="text-[#565f89]">—</span>}
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell text-[#a9b1d6] whitespace-nowrap text-right">
                                                        {formatDate(note.updated_at)}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage <= 1}
                                        className="border-white/10 text-[#a9b1d6] hover:bg-white/10 disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <span className="px-4 py-2 text-[#a9b1d6]">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages}
                                        className="border-white/10 text-[#a9b1d6] hover:bg-white/10 disabled:opacity-50"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-[#a9b1d6]" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {hasActiveFilters ? "No matching notes" : "No public notes yet"}
                            </h3>
                            <p className="text-[#a9b1d6] text-center max-w-md">
                                {hasActiveFilters
                                    ? "Try adjusting your filters or search query"
                                    : "This user hasn't shared any notes publicly."
                                }
                            </p>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    onClick={handleClearFilters}
                                    className="mt-4 border-white/10 text-[#a9b1d6] hover:bg-white/10"
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
