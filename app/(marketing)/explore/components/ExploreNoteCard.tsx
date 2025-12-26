import Link from 'next/link'
import { FileText, BookOpen, GraduationCap, Calendar, School, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ExploreNoteCardProps {
    note: {
        id: string
        title: string
        description: string | null
        class_name: string | null
        teacher_name: string | null
        updated_at: string
        profiles: {
            username: string | null
            display_name: string | null
            avatar_url: string | null
            school: string | null
        } | null
    }
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

export function ExploreNoteCard({ note }: ExploreNoteCardProps) {
    const displayName = note.profiles?.display_name || note.profiles?.username || 'Anonymous'

    return (
        <div className="group block p-4 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-[#7aa2f7]/30 transition-all">
            {/* Header */}
            <Link href={`/explore/${note.id}`} className="block mb-3">
                <div className="flex items-start gap-3">
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
            </Link>

            {/* Author Section */}
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                {note.profiles?.avatar_url ? (
                    <img
                        src={note.profiles.avatar_url}
                        alt={displayName}
                        className="w-6 h-6 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-[#7aa2f7]/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-[#7aa2f7]" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    {note.profiles?.username ? (
                        <Link
                            href={`/${note.profiles.username}`}
                            className="text-sm text-[#a9b1d6] hover:text-[#7aa2f7] transition-colors truncate block"
                        >
                            @{note.profiles.username}
                        </Link>
                    ) : (
                        <span className="text-sm text-[#565f89]">Anonymous</span>
                    )}
                </div>
                {note.profiles?.school && (
                    <div className="flex items-center gap-1 text-xs text-[#565f89]">
                        <School className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">{note.profiles.school}</span>
                    </div>
                )}
            </div>

            {/* Metadata */}
            <div className="space-y-2">
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
        </div>
    )
}
