import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
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

async function getFolderPath(folderId: string | null): Promise<Folder[]> {
    if (!folderId) return [];

    const supabase = await createClient();
    const path: Folder[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
        const { data } = await supabase
            .from('folders')
            .select('id, name, parent_id')
            .eq('id', currentId)
            .single();

        if (!data) break;
        const folder: Folder = { id: data.id, name: data.name, parent_id: data.parent_id };
        path.unshift(folder);
        currentId = folder.parent_id;
    }

    return path;
}

export default async function NotePage({ params }: NotePageProps) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: note } = await supabase
        .from('notes')
        .select('*')
        .eq('id', slug)
        .single();

    if (!note) {
        notFound();
    }

    const folderPath = await getFolderPath(note.folder_id);

    return (
        <div className="space-y-6">
            <NoteBreadcrumb folderPath={folderPath} noteTitle={note.title} />
            <NoteHeader
                noteId={note.id}
                initialTitle={note.title}
                initialDescription={note.description || note.category || ''}
            />
            <NoteEditorWrapper noteId={note.id} initialContent={note.content_markdown} />
        </div>
    );
}
