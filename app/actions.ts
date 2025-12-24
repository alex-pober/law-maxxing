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

export async function updateNoteMetadata(noteId: string, data: { title?: string; description?: string; class_name?: string; teacher_name?: string }) {
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

export async function toggleNoteFavorite(noteId: string, isFavorite: boolean) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase
        .from('notes')
        .update({ is_favorite: isFavorite })
        .eq('id', noteId)

    if (error) {
        console.error('Error toggling favorite:', error)
        throw new Error('Failed to toggle favorite')
    }

    revalidatePath('/dashboard')
    revalidatePath(`/notes/${noteId}`)
}

export async function toggleNotePublic(noteId: string, isPublic: boolean) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase
        .from('notes')
        .update({ is_public: isPublic })
        .eq('id', noteId)

    if (error) {
        console.error('Error toggling note visibility:', error)
        throw new Error('Failed to update note visibility')
    }

    revalidatePath('/dashboard')
    revalidatePath(`/notes/${noteId}`)
    revalidatePath('/explore')
}

export async function toggleFolderPublic(folderId: string, isPublic: boolean) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase
        .from('folders')
        .update({ is_public: isPublic })
        .eq('id', folderId)

    if (error) {
        console.error('Error toggling folder visibility:', error)
        throw new Error('Failed to update folder visibility')
    }

    revalidatePath('/dashboard')
    revalidatePath('/explore')
}

export async function getPublicNotes(options?: {
    limit?: number
    offset?: number
    searchQuery?: string
}) {
    const supabase = await createClient()
    const { limit = 20, offset = 0, searchQuery } = options || {}

    let query = supabase
        .from('notes')
        .select(`
            id,
            title,
            description,
            created_at,
            updated_at,
            user_id,
            folder_id,
            profiles:user_id (
                display_name,
                username,
                avatar_url
            )
        `)
        .eq('is_public', true)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching public notes:', error)
        throw new Error('Failed to fetch public notes')
    }

    return data
}

export async function getPublicFolders(options?: {
    limit?: number
    offset?: number
    parentId?: string | null
}) {
    const supabase = await createClient()
    const { limit = 20, offset = 0, parentId = null } = options || {}

    let query = supabase
        .from('folders')
        .select(`
            id,
            name,
            parent_id,
            created_at,
            user_id,
            profiles:user_id (
                display_name,
                username,
                avatar_url
            )
        `)
        .eq('is_public', true)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1)

    if (parentId === null) {
        query = query.is('parent_id', null)
    } else {
        query = query.eq('parent_id', parentId)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching public folders:', error)
        throw new Error('Failed to fetch public folders')
    }

    return data
}

export async function getPublicNote(noteId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('notes')
        .select(`
            *,
            profiles:user_id (
                display_name,
                username,
                avatar_url
            )
        `)
        .eq('id', noteId)
        .eq('is_public', true)
        .single()

    if (error) {
        console.error('Error fetching public note:', error)
        return null
    }

    return data
}

export async function savePublicNote(publicNoteId: string, targetFolderId?: string | null) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    const { data: publicNote, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', publicNoteId)
        .eq('is_public', true)
        .single()

    if (fetchError || !publicNote) {
        console.error('Error fetching public note:', fetchError)
        throw new Error('Note not found or is not public')
    }

    if (publicNote.user_id === user.id) {
        throw new Error('You already own this note')
    }

    const { data: newNote, error: insertError } = await supabase
        .from('notes')
        .insert({
            title: publicNote.title,
            description: publicNote.description,
            content_markdown: publicNote.content_markdown,
            class_name: publicNote.class_name,
            teacher_name: publicNote.teacher_name,
            user_id: user.id,
            folder_id: targetFolderId || null,
            is_favorite: false,
            is_public: false, // User's copy starts as private
            forked_from: publicNoteId // Track the original note
        })
        .select('id')
        .single()

    if (insertError || !newNote) {
        console.error('Error saving note:', insertError)
        throw new Error('Failed to save note to your library')
    }

    revalidatePath('/dashboard')
    revalidatePath('/notes')

    return { noteId: newNote.id }
}

export async function updateProfile(data: {
    display_name?: string
    username?: string
    school?: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    if (data.username) {
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', data.username)
            .neq('id', user.id)
            .single()

        if (existingUser) {
            throw new Error('Username is already taken')
        }
    }

    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        if (error.code === '23505') {
            throw new Error('Username is already taken')
        }
        throw new Error('Failed to update profile')
    }

    revalidatePath('/dashboard')
    revalidatePath('/explore')
    revalidatePath('/settings')
}

export async function getProfile() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return null
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }

    return data
}
