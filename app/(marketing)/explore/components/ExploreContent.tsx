'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ExploreFilterSidebar } from './ExploreFilterSidebar'
import { ExploreNoteCard } from './ExploreNoteCard'
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
    LayoutGrid,
    List,
    Search,
    FileText,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    User,
    School,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { ExploreNote, ExploreFilterOptions } from '@/app/actions'

interface ExploreContentProps {
    notes: ExploreNote[]
    totalCount: number
    currentPage: number
    totalPages: number
    filterOptions: ExploreFilterOptions
    initialFilters: {
        search: string
        schools: string[]
        classes: string[]
        teachers: string[]
        view: 'grid' | 'list'
    }
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

export function ExploreContent({
    notes,
    totalCount,
    currentPage,
    totalPages,
    filterOptions,
    initialFilters,
}: ExploreContentProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [view, setView] = useState<'grid' | 'list'>(initialFilters.view)
    const [selectedSchools, setSelectedSchools] = useState<string[]>(initialFilters.schools)
    const [selectedClasses, setSelectedClasses] = useState<string[]>(initialFilters.classes)
    const [selectedTeachers, setSelectedTeachers] = useState<string[]>(initialFilters.teachers)
    const [searchQuery, setSearchQuery] = useState(initialFilters.search)
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    // Build URL with current filters
    const buildUrl = (updates: Record<string, string | string[] | null>) => {
        const params = new URLSearchParams()

        const newSearch = 'q' in updates ? updates.q : searchQuery
        const newSchools = 'schools' in updates ? updates.schools : selectedSchools
        const newClasses = 'classes' in updates ? updates.classes : selectedClasses
        const newTeachers = 'teachers' in updates ? updates.teachers : selectedTeachers
        const newView = 'view' in updates ? updates.view : view
        const newPage = 'page' in updates ? updates.page : null

        if (newSearch && typeof newSearch === 'string' && newSearch.trim()) {
            params.set('q', newSearch.trim())
        }
        if (Array.isArray(newSchools) && newSchools.length > 0) {
            params.set('schools', newSchools.join(','))
        }
        if (Array.isArray(newClasses) && newClasses.length > 0) {
            params.set('classes', newClasses.join(','))
        }
        if (Array.isArray(newTeachers) && newTeachers.length > 0) {
            params.set('teachers', newTeachers.join(','))
        }
        if (newView && newView !== 'grid') {
            params.set('view', newView as string)
        }
        if (newPage && typeof newPage === 'string' && newPage !== '1') {
            params.set('page', newPage)
        }

        const queryString = params.toString()
        return `/explore${queryString ? `?${queryString}` : ''}`
    }

    const handleViewChange = (newView: 'grid' | 'list') => {
        setView(newView)
        router.push(buildUrl({ view: newView }))
    }

    const handleSchoolChange = (schools: string[]) => {
        setSelectedSchools(schools)
        router.push(buildUrl({ schools, page: null }))
    }

    const handleClassChange = (classes: string[]) => {
        setSelectedClasses(classes)
        router.push(buildUrl({ classes, page: null }))
    }

    const handleTeacherChange = (teachers: string[]) => {
        setSelectedTeachers(teachers)
        router.push(buildUrl({ teachers, page: null }))
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(buildUrl({ q: searchQuery, page: null }))
    }

    const handleClearFilters = () => {
        setSelectedSchools([])
        setSelectedClasses([])
        setSelectedTeachers([])
        setSearchQuery('')
        router.push('/explore')
    }

    const handlePageChange = (page: number) => {
        router.push(buildUrl({ page: String(page) }))
    }

    const hasActiveFilters =
        selectedSchools.length > 0 ||
        selectedClasses.length > 0 ||
        selectedTeachers.length > 0 ||
        searchQuery.trim() !== ''

    const activeFilterCount =
        selectedSchools.length +
        selectedClasses.length +
        selectedTeachers.length

    return (
        <div className="flex h-[calc(100vh-280px)] min-h-[500px]">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 shrink-0">
                <ExploreFilterSidebar
                    schools={filterOptions.schools}
                    classes={filterOptions.classes}
                    teachers={filterOptions.teachers}
                    selectedSchools={selectedSchools}
                    selectedClasses={selectedClasses}
                    selectedTeachers={selectedTeachers}
                    onSchoolChange={handleSchoolChange}
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
                        <ExploreFilterSidebar
                            schools={filterOptions.schools}
                            classes={filterOptions.classes}
                            teachers={filterOptions.teachers}
                            selectedSchools={selectedSchools}
                            selectedClasses={selectedClasses}
                            selectedTeachers={selectedTeachers}
                            onSchoolChange={(schools) => {
                                handleSchoolChange(schools)
                                setShowMobileFilters(false)
                            }}
                            onClassChange={(classes) => {
                                handleClassChange(classes)
                                setShowMobileFilters(false)
                            }}
                            onTeacherChange={(teachers) => {
                                handleTeacherChange(teachers)
                                setShowMobileFilters(false)
                            }}
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
                        {activeFilterCount > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-[#7aa2f7] text-white rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>

                    {/* Search */}
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#565f89]" />
                        <Input
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-[#565f89] focus-visible:ring-[#7aa2f7]"
                        />
                    </form>

                    {/* View Toggle */}
                    <div className="flex items-center rounded-lg border border-white/10 p-1">
                        <button
                            onClick={() => handleViewChange('grid')}
                            className={cn(
                                "p-1.5 rounded transition-colors",
                                view === 'grid'
                                    ? "bg-[#7aa2f7] text-white"
                                    : "text-[#a9b1d6] hover:text-white"
                            )}
                            title="Grid view"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleViewChange('list')}
                            className={cn(
                                "p-1.5 rounded transition-colors",
                                view === 'list'
                                    ? "bg-[#7aa2f7] text-white"
                                    : "text-[#a9b1d6] hover:text-white"
                            )}
                            title="List view"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Results count */}
                    <span className="text-sm text-[#565f89]">
                        {totalCount} {totalCount === 1 ? 'note' : 'notes'}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {notes.length > 0 ? (
                        <>
                            {view === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {notes.map(note => (
                                        <ExploreNoteCard key={note.id} note={note} />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-white/10 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-white/10 hover:bg-transparent">
                                                <TableHead className="text-[#a9b1d6]">Title</TableHead>
                                                <TableHead className="text-[#a9b1d6] hidden lg:table-cell">Class</TableHead>
                                                <TableHead className="text-[#a9b1d6] hidden lg:table-cell">Teacher</TableHead>
                                                <TableHead className="text-[#a9b1d6] hidden md:table-cell">Author</TableHead>
                                                <TableHead className="text-[#a9b1d6] hidden xl:table-cell">School</TableHead>
                                                <TableHead className="text-[#a9b1d6] hidden sm:table-cell">Updated</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {notes.map(note => (
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
                                                                    <div className="text-sm text-[#a9b1d6] truncate">
                                                                        {note.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell text-[#a9b1d6]">
                                                        {note.class_name || "—"}
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell text-[#a9b1d6]">
                                                        {note.teacher_name || "—"}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {note.profiles?.username ? (
                                                            <Link
                                                                href={`/${note.profiles.username}`}
                                                                className="inline-flex items-center gap-1.5 text-[#a9b1d6] hover:text-[#7aa2f7] transition-colors text-sm"
                                                            >
                                                                {note.profiles.avatar_url ? (
                                                                    <img
                                                                        src={note.profiles.avatar_url}
                                                                        alt=""
                                                                        className="w-5 h-5 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <User className="w-4 h-4" />
                                                                )}
                                                                @{note.profiles.username}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-[#565f89]">Anonymous</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="hidden xl:table-cell text-[#a9b1d6]">
                                                        {note.profiles?.school ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <School className="h-3.5 w-3.5 text-[#7aa2f7] shrink-0" />
                                                                <span className="truncate max-w-[150px]">{note.profiles.school}</span>
                                                            </div>
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell text-[#a9b1d6] whitespace-nowrap">
                                                        {formatDate(note.updated_at)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

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
                                <Search className="w-8 h-8 text-[#a9b1d6]" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {hasActiveFilters ? "No matching notes" : "No public notes yet"}
                            </h3>
                            <p className="text-[#a9b1d6] text-center max-w-md">
                                {hasActiveFilters
                                    ? "Try adjusting your filters or search query"
                                    : "Be the first to share your study notes with the community!"
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
