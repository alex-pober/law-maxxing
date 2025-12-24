import { createClient } from "@/utils/supabase/server";
import { Search } from "lucide-react";
import { PublicNoteCard } from "@/components/explore/PublicNoteCard";
import { ExploreSearch } from "@/components/explore/ExploreSearch";

interface SearchParams {
    q?: string;
    page?: string;
}

export default async function ExplorePage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const query = params.q || "";
    const page = parseInt(params.page || "1", 10);
    const limit = 12;
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // First try with profiles join, fall back to without if it fails
    let dbQuery = supabase
        .from("notes")
        .select(
            `
            id,
            title,
            description,
            created_at,
            updated_at,
            user_id
        `
        )
        .eq("is_public", true)
        .order("updated_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (query) {
        dbQuery = dbQuery.ilike("title", `%${query}%`);
    }

    const { data: notesData, error } = await dbQuery;

    // Try to fetch profiles separately if notes loaded successfully
    let notes = notesData?.map(note => ({ ...note, profiles: null as { display_name: string | null; username: string | null; avatar_url: string | null } | null })) || null;

    if (notesData && notesData.length > 0) {
        const userIds = [...new Set(notesData.map(n => n.user_id).filter(Boolean))];
        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, display_name, username, avatar_url")
                .in("id", userIds);

            if (profiles) {
                const profileMap = new Map(profiles.map(p => [p.id, p]));
                notes = notesData.map(note => ({
                    ...note,
                    profiles: note.user_id ? profileMap.get(note.user_id) || null : null
                }));
            }
        }
    }

    if (error) {
        console.error("Error fetching public notes:", error);
    }

    // Get total count for pagination
    let countQuery = supabase
        .from("notes")
        .select("id", { count: "exact", head: true })
        .eq("is_public", true);

    if (query) {
        countQuery = countQuery.ilike("title", `%${query}%`);
    }

    const { count } = await countQuery;
    const totalPages = Math.ceil((count || 0) / limit);

    return (
        <div className="min-h-screen bg-[#1a1b26] pt-24 pb-12">
            <div className="container px-4 md:px-6 mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Explore Public Notes
                    </h1>
                    <p className="text-lg text-[#a9b1d6] max-w-2xl mx-auto">
                        Discover study notes shared by the community. Learn from others and find new perspectives on legal topics.
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-xl mx-auto mb-12">
                    <ExploreSearch initialQuery={query} />
                </div>

                {/* Results */}
                {error ? (
                    <div className="text-center py-12">
                        <p className="text-red-400">Failed to load notes. Please try again.</p>
                    </div>
                ) : notes && notes.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {notes.map((note) => (
                                <PublicNoteCard key={note.id} note={note} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                {page > 1 && (
                                    <a
                                        href={`/explore?${query ? `q=${encodeURIComponent(query)}&` : ""}page=${page - 1}`}
                                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[#a9b1d6] hover:bg-white/10 transition-colors"
                                    >
                                        Previous
                                    </a>
                                )}
                                <span className="px-4 py-2 text-[#a9b1d6]">
                                    Page {page} of {totalPages}
                                </span>
                                {page < totalPages && (
                                    <a
                                        href={`/explore?${query ? `q=${encodeURIComponent(query)}&` : ""}page=${page + 1}`}
                                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[#a9b1d6] hover:bg-white/10 transition-colors"
                                    >
                                        Next
                                    </a>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-[#a9b1d6]" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {query ? "No notes found" : "No public notes yet"}
                        </h3>
                        <p className="text-[#a9b1d6]">
                            {query
                                ? `No notes match "${query}". Try a different search term.`
                                : "Be the first to share your study notes with the community!"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
