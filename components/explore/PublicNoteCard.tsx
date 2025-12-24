import Link from "next/link";
import { FileText, Clock, User } from "lucide-react";

interface Profile {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
}

interface PublicNote {
    id: string;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    user_id: string;
    profiles: Profile | Profile[] | null;
}

interface PublicNoteCardProps {
    note: PublicNote;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
        }
        return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
}

export function PublicNoteCard({ note }: PublicNoteCardProps) {
    const profile = Array.isArray(note.profiles) ? note.profiles[0] : note.profiles;
    const authorName = profile?.display_name || profile?.username || "Anonymous";
    const avatarUrl = profile?.avatar_url;

    return (
        <Link
            href={`/explore/${note.id}`}
            className="group block p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200"
        >
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#7aa2f7]/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#7aa2f7]" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate group-hover:text-[#7aa2f7] transition-colors">
                        {note.title}
                    </h3>
                    {note.description && (
                        <p className="text-sm text-[#a9b1d6] line-clamp-2 mt-1">
                            {note.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={authorName}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-[#7aa2f7]/20 flex items-center justify-center">
                            <User className="w-3 h-3 text-[#7aa2f7]" />
                        </div>
                    )}
                    <span className="text-sm text-[#a9b1d6] truncate max-w-[120px]">
                        {authorName}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#565f89]">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(note.updated_at)}</span>
                </div>
            </div>
        </Link>
    );
}
