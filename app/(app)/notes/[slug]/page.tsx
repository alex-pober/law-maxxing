import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { NoteEditorWrapper } from "./note-editor-wrapper";
import { NoteHeader } from "./note-header";
import { NoteBreadcrumb } from "./note-breadcrumb";

interface NotePageProps {
    params: Promise<{
        slug: string;
    }>;
}

interface Folder {
    id: string;
    name: string;
    parent_id: string | null;
}

async function getFolderPath(folderId: string | null, userId: string): Promise<Folder[]> {
    if (!folderId) return [];

    const supabase = await createClient();

    // Fetch all user folders in one query instead of one per level
    const { data: allFolders } = await supabase
        .from('folders')
        .select('id, name, parent_id')
        .eq('user_id', userId);

    if (!allFolders) return [];

    const folderMap = new Map(allFolders.map(f => [f.id, f as Folder]));
    const path: Folder[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
        const folder = folderMap.get(currentId);
        if (!folder) break;
        path.unshift(folder);
        currentId = folder.parent_id;
    }

    return path;
}

export default async function NotePage({ params }: NotePageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // Fetch the note - only if it belongs to the current user
    const { data: note } = await supabase
        .from('notes')
        .select('*')
        .eq('id', slug)
        .eq('user_id', user.id)
        .single();

    // If note doesn't exist or doesn't belong to user, check if it's a public note
    if (!note) {
        // Check if it's a public note (to redirect to explore)
        const { data: publicNote } = await supabase
            .from('notes')
            .select('id, is_public')
            .eq('id', slug)
            .eq('is_public', true)
            .single();

        if (publicNote) {
            // Redirect to the public view instead of showing edit UI
            redirect(`/explore/${slug}`);
        }

        notFound();
    }

    const folderPath = await getFolderPath(note.folder_id, user.id);

    return (
        <div className="space-y-6">
            <NoteBreadcrumb folderPath={folderPath} noteTitle={note.title} />
            <NoteHeader
                noteId={note.id}
                initialTitle={note.title}
                initialDescription={note.description || note.category || ''}
                initialIsFavorite={note.is_favorite || false}
                initialIsPublic={note.is_public || false}
                initialClassName={note.class_name || ''}
                initialTeacherName={note.teacher_name || ''}
            />
            <NoteEditorWrapper noteId={note.id} initialContent={note.content_markdown} />
        </div>
    );
}
