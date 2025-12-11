'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createNote(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const folderId = formData.get('folderId') as string | null

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { data, error } = await supabase.from('notes').insert({
        title,
        description: description || null,
        content_markdown: '',
        user_id: user.id,
        folder_id: folderId || null
    }).select('id').single()

    if (error) {
        console.error('Error creating note:', error)
        throw new Error('Failed to create note')
    }

    revalidatePath('/dashboard')
    revalidatePath('/notes')
    redirect(`/notes/${data.id}`)
}

export async function deleteNote(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('notes').delete().eq('id', id)

    if (error) {
        console.error('Error deleting note:', error)
        throw new Error('Failed to delete note')
    }

    revalidatePath('/dashboard')
    revalidatePath('/notes')
}

export async function createFolder(name: string, parentId: string | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase.from('folders').insert({
        name,
        parent_id: parentId,
        user_id: user.id
    })

    if (error) {
        console.error('Error creating folder:', error)
        throw new Error('Failed to create folder')
    }

    revalidatePath('/dashboard')
}

export async function deleteFolder(id: string) {
    const supabase = await createClient()

    // Note: This might fail if there are foreign key constraints and we don't cascade.
    // Ideally we should delete children first or set cascade in DB.
    // For now, let's assume the user empties it or we handle it.
    // Actually, let's try to delete.
    const { error } = await supabase.from('folders').delete().eq('id', id)

    if (error) {
        console.error('Error deleting folder:', error)
        throw new Error('Failed to delete folder (ensure it is empty)')
    }

    revalidatePath('/dashboard')
}

export async function updateNoteContent(noteId: string, content: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase
        .from('notes')
        .update({ content_markdown: content })
        .eq('id', noteId)

    if (error) {
        console.error('Error updating note:', error)
        throw new Error('Failed to update note')
    }

    revalidatePath(`/notes/${noteId}`)
}

export async function updateNoteMetadata(noteId: string, data: { title?: string; description?: string }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase
        .from('notes')
        .update(data)
        .eq('id', noteId)

    if (error) {
        console.error('Error updating note metadata:', error)
        throw new Error('Failed to update note')
    }

    revalidatePath(`/notes/${noteId}`)
    revalidatePath('/dashboard')
}

export async function reorderItems(
    items: { id: string; position: number; folder_id?: string | null }[],
    type: 'notes' | 'folders'
) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    // Update each item's position
    for (const item of items) {
        if (type === 'notes') {
            const { error } = await supabase
                .from('notes')
                .update({ position: item.position, folder_id: item.folder_id })
                .eq('id', item.id)

            if (error) {
                console.error('Error reordering note:', error)
                throw new Error('Failed to reorder note')
            }
        } else {
            const { error } = await supabase
                .from('folders')
                .update({ position: item.position })
                .eq('id', item.id)

            if (error) {
                console.error('Error reordering folder:', error)
                throw new Error('Failed to reorder folder')
            }
        }
    }

    revalidatePath('/dashboard')
}

export async function moveNote(noteId: string, folderId: string | null) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase
        .from('notes')
        .update({ folder_id: folderId })
        .eq('id', noteId)

    if (error) {
        console.error('Error moving note:', error)
        throw new Error('Failed to move note')
    }

    revalidatePath('/dashboard')
}
