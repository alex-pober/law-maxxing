'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, X, GraduationCap, BookOpen, School } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExploreFilterSidebarProps {
    schools: string[]
    classes: string[]
    teachers: string[]
    selectedSchools: string[]
    selectedClasses: string[]
    selectedTeachers: string[]
    onSchoolChange: (schools: string[]) => void
    onClassChange: (classes: string[]) => void
    onTeacherChange: (teachers: string[]) => void
    onClearFilters: () => void
}

export function ExploreFilterSidebar({
    schools,
    classes,
    teachers,
    selectedSchools,
    selectedClasses,
    selectedTeachers,
    onSchoolChange,
    onClassChange,
    onTeacherChange,
    onClearFilters,
}: ExploreFilterSidebarProps) {
    const hasActiveFilters =
        selectedSchools.length > 0 ||
        selectedClasses.length > 0 ||
        selectedTeachers.length > 0

    const handleSchoolToggle = (school: string) => {
        if (selectedSchools.includes(school)) {
            onSchoolChange(selectedSchools.filter(s => s !== school))
        } else {
            onSchoolChange([...selectedSchools, school])
        }
    }

    const handleClassToggle = (className: string) => {
        if (selectedClasses.includes(className)) {
            onClassChange(selectedClasses.filter(c => c !== className))
        } else {
            onClassChange([...selectedClasses, className])
        }
    }

    const handleTeacherToggle = (teacher: string) => {
        if (selectedTeachers.includes(teacher)) {
            onTeacherChange(selectedTeachers.filter(t => t !== teacher))
        } else {
            onTeacherChange([...selectedTeachers, teacher])
        }
    }

    return (
        <div className="h-full flex flex-col bg-[#1a1b26] border-r border-white/10">
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-sm">Filters</h3>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearFilters}
                            className="h-7 px-2 text-xs text-[#a9b1d6] hover:text-white hover:bg-white/10"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {/* Schools Section */}
                    {schools.length > 0 && (
                        <Collapsible defaultOpen>
                            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-[#a9b1d6] hover:text-white transition-colors">
                                <span className="flex items-center gap-2">
                                    <School className="h-4 w-4" />
                                    Schools
                                </span>
                                <ChevronDown className="h-4 w-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 space-y-1">
                                {schools.map(school => (
                                    <label
                                        key={school}
                                        className={cn(
                                            "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors",
                                            selectedSchools.includes(school)
                                                ? "bg-[#7aa2f7]/20 text-white"
                                                : "text-[#a9b1d6] hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <Checkbox
                                            checked={selectedSchools.includes(school)}
                                            onCheckedChange={() => handleSchoolToggle(school)}
                                            className="border-[#565f89] data-[state=checked]:bg-[#7aa2f7] data-[state=checked]:border-[#7aa2f7]"
                                        />
                                        <span className="text-sm truncate">{school}</span>
                                    </label>
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    )}

                    {schools.length > 0 && classes.length > 0 && (
                        <Separator className="bg-white/10" />
                    )}

                    {/* Classes Section */}
                    {classes.length > 0 && (
                        <Collapsible defaultOpen>
                            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-[#a9b1d6] hover:text-white transition-colors">
                                <span className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Classes
                                </span>
                                <ChevronDown className="h-4 w-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 space-y-1">
                                {classes.map(className => (
                                    <label
                                        key={className}
                                        className={cn(
                                            "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors",
                                            selectedClasses.includes(className)
                                                ? "bg-[#7aa2f7]/20 text-white"
                                                : "text-[#a9b1d6] hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <Checkbox
                                            checked={selectedClasses.includes(className)}
                                            onCheckedChange={() => handleClassToggle(className)}
                                            className="border-[#565f89] data-[state=checked]:bg-[#7aa2f7] data-[state=checked]:border-[#7aa2f7]"
                                        />
                                        <span className="text-sm truncate">{className}</span>
                                    </label>
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    )}

                    {classes.length > 0 && teachers.length > 0 && (
                        <Separator className="bg-white/10" />
                    )}

                    {/* Teachers Section */}
                    {teachers.length > 0 && (
                        <Collapsible defaultOpen>
                            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-[#a9b1d6] hover:text-white transition-colors">
                                <span className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    Teachers
                                </span>
                                <ChevronDown className="h-4 w-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 space-y-1">
                                {teachers.map(teacher => (
                                    <label
                                        key={teacher}
                                        className={cn(
                                            "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors",
                                            selectedTeachers.includes(teacher)
                                                ? "bg-[#7aa2f7]/20 text-white"
                                                : "text-[#a9b1d6] hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <Checkbox
                                            checked={selectedTeachers.includes(teacher)}
                                            onCheckedChange={() => handleTeacherToggle(teacher)}
                                            className="border-[#565f89] data-[state=checked]:bg-[#7aa2f7] data-[state=checked]:border-[#7aa2f7]"
                                        />
                                        <span className="text-sm truncate">{teacher}</span>
                                    </label>
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    )}

                    {/* Empty state */}
                    {schools.length === 0 && classes.length === 0 && teachers.length === 0 && (
                        <div className="text-center py-8 text-[#565f89] text-sm">
                            No filters available
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
