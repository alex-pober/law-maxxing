import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";
import { NoteRenderer } from "@/components/NoteRenderer";
import { SaveNoteButton } from "@/components/explore/SaveNoteButton";
import { SidebarRight } from "@/components/layout/SidebarRight";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default async function PublicNotePage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user (if logged in)
    const { data: { user } } = await supabase.auth.getUser();

    const { data: note, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .eq("is_public", true)
        .single();

    if (error || !note) {
        notFound();
    }

    // Fetch profile separately
    let profile: { display_name: string | null; username: string | null; avatar_url: string | null } | null = null;
    if (note.user_id) {
        const { data: profileData } = await supabase
            .from("profiles")
            .select("display_name, username, avatar_url")
            .eq("id", note.user_id)
            .single();
        profile = profileData;
    }

    const authorName = profile?.display_name || profile?.username || "Anonymous";
    const avatarUrl = profile?.avatar_url;
    const isAuthenticated = !!user;
    const isOwnNote = user?.id === note.user_id;

    return (
        <div className="min-h-screen bg-[#1a1b26] pt-24 pb-12">
            <div className="container px-4 md:px-6 mx-auto max-w-6xl">
                <div className="flex gap-8">
                    {/* Main content */}
                    <div className="flex-1 min-w-0 max-w-4xl">
                        {/* Back link */}
                        <Link
                            href="/explore"
                            className="inline-flex items-center gap-2 text-[#a9b1d6] hover:text-white transition-colors mb-8"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Explore
                        </Link>

                        {/* Header */}
                        <header className="mb-8">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h1 className="text-3xl md:text-4xl font-bold text-white">
                                    {note.title}
                                </h1>
                                <SaveNoteButton
                                    noteId={id}
                                    isOwnNote={isOwnNote}
                                    isAuthenticated={isAuthenticated}
                                />
                            </div>

                            {note.description && (
                                <p className="text-lg text-[#a9b1d6] mb-6">{note.description}</p>
                            )}

                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-[#565f89]">
                                {/* Author */}
                                <div className="flex items-center gap-2">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={authorName}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-[#7aa2f7]/20 flex items-center justify-center">
                                            <User className="w-4 h-4 text-[#7aa2f7]" />
                                        </div>
                                    )}
                                    <span className="text-[#a9b1d6]">{authorName}</span>
                                </div>

                                <span className="text-[#565f89]">•</span>

                                {/* Created date */}
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>Created {formatDate(note.created_at)}</span>
                                </div>

                                <span className="text-[#565f89]">•</span>

                                {/* Updated date */}
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>Updated {formatDateTime(note.updated_at)}</span>
                                </div>
                            </div>
                        </header>

                        {/* Divider */}
                        <div className="h-px bg-white/[0.06] mb-8" />

                        {/* Content */}
                        <article className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-[#a9b1d6] prose-strong:text-white prose-a:text-[#7aa2f7] prose-code:text-[#bb9af7] prose-pre:bg-[#16161e] prose-pre:border prose-pre:border-white/[0.06]">
                            <NoteRenderer content={note.content_markdown} />
                        </article>
                    </div>

                    {/* Table of Contents Sidebar - hidden on smaller screens */}
                    <aside className="hidden md:block shrink-0 self-start sticky top-28">
                        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                            <SidebarRight />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
