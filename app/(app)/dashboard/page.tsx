import { createClient } from "@/utils/supabase/server";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { NoteCard } from "@/components/dashboard/NoteCard";
import { Star, Clock, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

function SectionHeader({
    icon: Icon,
    title,
    iconClassName
}: {
    icon: React.ElementType;
    title: string;
    iconClassName?: string;
}) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg",
                "bg-gradient-to-br from-white/[0.08] to-white/[0.02]",
                "border border-white/[0.06]"
            )}>
                <Icon className={cn("h-4 w-4", iconClassName)} />
            </div>
            <h2 className="text-base font-semibold tracking-tight text-foreground/90">
                {title}
            </h2>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className={cn(
            "flex items-center justify-center py-8 px-6 rounded-xl",
            "bg-gradient-to-br from-muted/20 to-muted/5",
            "border border-dashed border-white/[0.06]"
        )}>
            <p className="text-sm text-muted-foreground/60 text-center">
                {message}
            </p>
        </div>
    );
}

export default async function DashboardPage() {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return null;
    }

    // Fetch all folders for path building (only user's own folders)
    const { data: allFolders } = await supabase
        .from('folders')
        .select('id, name, parent_id')
        .eq('user_id', user.id);

    // Build folder path lookup
    const folderMap = new Map(allFolders?.map(f => [f.id, f]) || []);

    function getFolderPath(folderId: string | null): string | null {
        if (!folderId) return null;
        const parts: string[] = [];
        let currentId: string | null = folderId;
        while (currentId) {
            const folder = folderMap.get(currentId);
            if (!folder) break;
            parts.unshift(folder.name);
            currentId = folder.parent_id;
        }
        return parts.length > 0 ? parts.join(' / ') : null;
    }

    // Fetch favorites (only user's own notes)
    const { data: favorites } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_favorite', true)
        .order('updated_at', { ascending: false })
        .limit(6);

    // Fetch last edited (by updated_at, only user's own notes)
    const { data: lastEdited } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(6);

    // Fetch latest added (by created_at, only user's own notes)
    const { data: latestAdded } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

    // Add folder paths to notes
    const addFolderPath = (notes: typeof favorites) =>
        notes?.map(note => ({
            ...note,
            folder_path: getFolderPath(note.folder_id)
        })) || [];

    const favoritesWithPath = addFolderPath(favorites);
    const lastEditedWithPath = addFolderPath(lastEdited);
    const latestAddedWithPath = addFolderPath(latestAdded);

    const hasFavorites = favorites && favorites.length > 0;
    const hasLastEdited = lastEdited && lastEdited.length > 0;
    const hasLatestAdded = latestAdded && latestAdded.length > 0;
    const hasAnyNotes = hasFavorites || hasLastEdited || hasLatestAdded;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Greeting Section */}
            <div className="mb-10">
                <DashboardGreeting />
            </div>

            {!hasAnyNotes ? (
                <div className={cn(
                    "flex flex-col items-center justify-center py-20 px-8 rounded-2xl",
                    "bg-gradient-to-br from-card/60 to-card/20",
                    "border border-white/[0.05]"
                )}>
                    <div className={cn(
                        "flex items-center justify-center w-16 h-16 rounded-2xl mb-6",
                        "bg-gradient-to-br from-primary/20 to-primary/5",
                        "border border-primary/10"
                    )}>
                        <Plus className="h-7 w-7 text-primary/70" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-foreground/90">No notes yet</h2>
                    <p className="text-muted-foreground/70 max-w-sm text-center text-sm leading-relaxed">
                        Create your first note using the file explorer on the left sidebar to get started with your study journey.
                    </p>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Favorites Section */}
                    <section>
                        <SectionHeader
                            icon={Star}
                            title="Favorites"
                            iconClassName="text-yellow-400 fill-yellow-400/30"
                        />
                        {hasFavorites ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {favoritesWithPath.map((note) => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        showDate="updated"
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="Star your favorite notes to see them here" />
                        )}
                    </section>

                    {/* Last Edited Section */}
                    {hasLastEdited && (
                        <section>
                            <SectionHeader
                                icon={Clock}
                                title="Recently Edited"
                                iconClassName="text-muted-foreground/70"
                            />
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {lastEditedWithPath.map((note) => (
                                    <NoteCard key={note.id} note={note} showDate="updated" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Latest Added Section */}
                    {hasLatestAdded && (
                        <section>
                            <SectionHeader
                                icon={Sparkles}
                                title="Newly Created"
                                iconClassName="text-primary/70"
                            />
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {latestAddedWithPath.map((note) => (
                                    <NoteCard key={note.id} note={note} showDate="created" />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
