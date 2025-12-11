'use client';

import { BlockEditor } from "@/components/BlockEditor";
import { updateNoteContent } from "@/app/actions";

interface NoteEditorWrapperProps {
    noteId: string;
    initialContent: string;
}

export function NoteEditorWrapper({ noteId, initialContent }: NoteEditorWrapperProps) {
    const handleSave = async (content: string) => {
        await updateNoteContent(noteId, content);
    };

    return (
        <BlockEditor
            noteId={noteId}
            initialContent={initialContent}
            onSave={handleSave}
        />
    );
}
