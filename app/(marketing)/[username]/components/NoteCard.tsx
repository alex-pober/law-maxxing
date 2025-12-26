import Link from 'next/link'
import { FileText, Folder, BookOpen, GraduationCap, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface NoteCardProps {
    note: {
        id: string
        title: string
        description: string | null
        class_name: string | null
        teacher_name: string | null
        updated_at: string
        folder_id: string | null
    }
    folderPath: string
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

export function NoteCard({ note, folderPath }: NoteCardProps) {
    return (
        <Link
            href={`/explore/${note.id}`}
            className="group block p-4 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-[#7aa2f7]/30 transition-all"
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-md bg-[#7aa2f7]/10 text-[#7aa2f7] shrink-0">
                    <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white group-hover:text-[#7aa2f7] transition-colors truncate">
                        {note.title}
                    </h3>
                    {note.description && (
                        <p className="text-sm text-[#a9b1d6] line-clamp-2 mt-1">
                            {note.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Metadata */}
            <div className="space-y-2">
                {folderPath && (
                    <div className="flex items-center gap-1.5 text-xs text-[#a9b1d6]">
                        <Folder className="h-3 w-3 text-[#7aa2f7] shrink-0" />
                        <span className="truncate">{folderPath}</span>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {note.class_name && (
                        <Badge variant="secondary" className="bg-[#7aa2f7]/10 text-[#7aa2f7] border-0 text-xs">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {note.class_name}
                        </Badge>
                    )}
                    {note.teacher_name && (
                        <Badge variant="secondary" className="bg-[#9ece6a]/10 text-[#9ece6a] border-0 text-xs">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            {note.teacher_name}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#565f89]">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(note.updated_at)}</span>
                </div>
            </div>
        </Link>
    )
}
