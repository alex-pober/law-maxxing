'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { GoogleGenAI } from '@google/genai'
import { parseVttContent } from '@/lib/vtt-parser'

// Helper to sanitize search queries by escaping LIKE pattern special characters
function sanitizeSearchQuery(query: string): string {
    return query.replace(/[%_\\]/g, '\\$&')
}

export async function createNoteInline(title: string, folderId: string | null) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // Get the max position of existing notes in the target folder
    let maxPositionQuery = supabase
        .from('notes')
        .select('position')
        .eq('user_id', user.id)
        .order('position', { ascending: false })
        .limit(1)

    if (folderId) {
        maxPositionQuery = maxPositionQuery.eq('folder_id', folderId)
    } else {
        maxPositionQuery = maxPositionQuery.is('folder_id', null)
    }

    const { data: maxPositionData } = await maxPositionQuery

    const newPosition = maxPositionData && maxPositionData.length > 0
        ? (maxPositionData[0].position ?? 0) + 1
        : 0

    const { data, error } = await supabase.from('notes').insert({
        title,
        description: null,
        content_markdown: '',
        user_id: user.id,
        folder_id: folderId || null,
        position: newPosition
    }).select('id').single()

    if (error) {
        console.error('Error creating note:', error)
        throw new Error('Failed to create note')
    }

    revalidatePath('/dashboard')
    revalidatePath('/notes')

    return data.id
}

export async function deleteNote(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting folder:', error)
        throw new Error('Failed to delete folder (ensure it is empty)')
    }

    revalidatePath('/dashboard')
}

export async function renameFolder(id: string, name: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase
        .from('folders')
        .update({ name })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error renaming folder:', error)
        throw new Error('Failed to rename folder')
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
        .eq('user_id', user.id)

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

    // Explicitly extract and validate allowed fields to prevent field injection
    const allowedData: Record<string, string> = {}
    if (data.title !== undefined) allowedData.title = String(data.title).slice(0, 500)
    if (data.description !== undefined) allowedData.description = String(data.description).slice(0, 2000)
    if (data.class_name !== undefined) allowedData.class_name = String(data.class_name).slice(0, 200)
    if (data.teacher_name !== undefined) allowedData.teacher_name = String(data.teacher_name).slice(0, 200)

    const { error } = await supabase
        .from('notes')
        .update(allowedData)
        .eq('id', noteId)
        .eq('user_id', user.id)

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
                .eq('user_id', user.id)

            if (error) {
                console.error('Error reordering note:', error)
                throw new Error('Failed to reorder note')
            }
        } else {
            const { error } = await supabase
                .from('folders')
                .update({ position: item.position })
                .eq('id', item.id)
                .eq('user_id', user.id)

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
        .eq('user_id', user.id)

    if (error) {
        console.error('Error moving note:', error)
        throw new Error('Failed to move note')
    }

    revalidatePath('/dashboard')
}

export async function moveFolder(folderId: string, newParentId: string | null) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    // Prevent moving folder into itself
    if (folderId === newParentId) {
        throw new Error('Cannot move folder into itself')
    }

    // Check for circular reference - ensure newParentId is not a descendant of folderId
    if (newParentId) {
        const { data: allFolders } = await supabase
            .from('folders')
            .select('id, parent_id')
            .eq('user_id', user.id)

        if (allFolders) {
            const isDescendant = (parentId: string | null, targetId: string): boolean => {
                if (!parentId) return false
                if (parentId === targetId) return true
                const parent = allFolders.find(f => f.id === parentId)
                return parent ? isDescendant(parent.parent_id, targetId) : false
            }

            if (isDescendant(newParentId, folderId)) {
                throw new Error('Cannot move folder into its own descendant')
            }
        }
    }

    const { error } = await supabase
        .from('folders')
        .update({ parent_id: newParentId })
        .eq('id', folderId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error moving folder:', error)
        throw new Error('Failed to move folder')
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
        .eq('user_id', user.id)

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
        .eq('user_id', user.id)

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

    // Update the folder itself
    const { error: folderError } = await supabase
        .from('folders')
        .update({ is_public: isPublic })
        .eq('id', folderId)
        .eq('user_id', user.id)

    if (folderError) {
        console.error('Error toggling folder visibility:', folderError)
        throw new Error('Failed to update folder visibility')
    }

    // Get all folder IDs (including nested subfolders) to update their notes
    const getAllFolderIds = async (parentId: string): Promise<string[]> => {
        const { data: subfolders } = await supabase
            .from('folders')
            .select('id')
            .eq('parent_id', parentId)
            .eq('user_id', user.id)

        const ids = [parentId]
        if (subfolders) {
            for (const subfolder of subfolders) {
                const nestedIds = await getAllFolderIds(subfolder.id)
                ids.push(...nestedIds)
            }
        }
        return ids
    }

    const allFolderIds = await getAllFolderIds(folderId)

    // Update all notes in this folder and its subfolders
    const { error: notesError } = await supabase
        .from('notes')
        .update({ is_public: isPublic })
        .in('folder_id', allFolderIds)
        .eq('user_id', user.id)

    if (notesError) {
        console.error('Error toggling notes visibility:', notesError)
        throw new Error('Failed to update notes visibility')
    }

    // Also update all subfolders to match
    if (allFolderIds.length > 1) {
        const { error: subfoldersError } = await supabase
            .from('folders')
            .update({ is_public: isPublic })
            .in('id', allFolderIds)
            .eq('user_id', user.id)

        if (subfoldersError) {
            console.error('Error toggling subfolders visibility:', subfoldersError)
        }
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
        query = query.ilike('title', `%${sanitizeSearchQuery(searchQuery)}%`)
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

export async function completeOnboarding(data: {
    display_name: string
    username: string
    school?: string
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'User not authenticated' }
    }

    // Validate required fields
    if (!data.display_name?.trim()) {
        return { success: false, error: 'Display name is required' }
    }
    if (!data.username?.trim()) {
        return { success: false, error: 'Username is required' }
    }

    const username = data.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')

    if (!username) {
        return { success: false, error: 'Username must contain letters or numbers' }
    }

    // Check if username is taken by another user
    const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .single()

    if (existingUser) {
        return { success: false, error: 'Username is already taken' }
    }

    // Get existing profile to preserve avatar_url
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

    // Upsert profile (handles both missing and existing profiles)
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            display_name: data.display_name.trim().slice(0, 100),
            username: username.slice(0, 50),
            school: data.school?.trim().slice(0, 200) || null,
            avatar_url: existingProfile?.avatar_url || user.user_metadata?.avatar_url || null,
        }, {
            onConflict: 'id'
        })

    if (error) {
        console.error('Error completing onboarding:', error)
        if (error.code === '23505') {
            return { success: false, error: 'Username is already taken' }
        }
        return { success: false, error: 'Failed to save profile' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/onboarding')
    return { success: true }
}

export async function updateProfile(data: {
    display_name?: string
    username?: string
    school?: string
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'User not authenticated' }
    }

    // Explicitly extract and validate allowed fields to prevent field injection
    const allowedData: Record<string, string> = {}
    if (data.display_name !== undefined) allowedData.display_name = String(data.display_name).slice(0, 100)
    if (data.username !== undefined) allowedData.username = String(data.username).slice(0, 50).toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (data.school !== undefined) allowedData.school = String(data.school).slice(0, 200)

    if (allowedData.username) {
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', allowedData.username)
            .neq('id', user.id)
            .single()

        if (existingUser) {
            return { success: false, error: 'Username is already taken' }
        }
    }

    const { error } = await supabase
        .from('profiles')
        .update(allowedData)
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        if (error.code === '23505') {
            return { success: false, error: 'Username is already taken' }
        }
        return { success: false, error: 'Failed to update profile' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/explore')
    revalidatePath('/settings')
    return { success: true }
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

export async function getProfileByUsername(username: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

    if (error) {
        console.error('Error fetching profile by username:', error)
        return null
    }

    return data
}

export async function getUserPublicNotes(userId: string, options?: {
    limit?: number
    offset?: number
}) {
    const supabase = await createClient()
    const { limit = 20, offset = 0 } = options || {}

    const { data, error } = await supabase
        .from('notes')
        .select(`
            id,
            title,
            description,
            created_at,
            updated_at,
            class_name,
            teacher_name,
            folder_id
        `)
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('Error fetching user public notes:', error)
        return []
    }

    return data
}

export async function getUserPublicFolders(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('folders')
        .select('id, name, parent_id')
        .eq('user_id', userId)

    if (error) {
        console.error('Error fetching user public folders:', error)
        return []
    }

    return data
}

export async function getUserPublicNotesCount(userId: string) {
    const supabase = await createClient()

    const { count, error } = await supabase
        .from('notes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_public', true)

    if (error) {
        console.error('Error counting user public notes:', error)
        return 0
    }

    return count || 0
}

export async function getAllUserPublicNotes(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('notes')
        .select(`
            id,
            title,
            description,
            created_at,
            updated_at,
            class_name,
            teacher_name,
            folder_id
        `)
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching all user public notes:', error)
        return []
    }

    return data
}

export async function getNotesForDownload(noteIds: string[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
        .from('notes')
        .select('id, title, description, content_markdown')
        .in('id', noteIds)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error fetching notes for download:', error)
        throw new Error('Failed to fetch notes')
    }

    return data || []
}

// ============================================
// Explore Page Actions
// ============================================

export interface ExploreFilterOptions {
    schools: string[]
    classes: string[]
    teachers: string[]
}

export async function getExploreFilterOptions(): Promise<ExploreFilterOptions> {
    const supabase = await createClient()

    // Get unique schools from profiles that have public notes
    const { data: schoolsData } = await supabase
        .from('profiles')
        .select('school')
        .not('school', 'is', null)
        .not('school', 'eq', '')

    // Get unique class names from public notes
    const { data: classesData } = await supabase
        .from('notes')
        .select('class_name')
        .eq('is_public', true)
        .not('class_name', 'is', null)
        .not('class_name', 'eq', '')

    // Get unique teacher names from public notes
    const { data: teachersData } = await supabase
        .from('notes')
        .select('teacher_name')
        .eq('is_public', true)
        .not('teacher_name', 'is', null)
        .not('teacher_name', 'eq', '')

    const schools = [...new Set(schoolsData?.map(s => s.school).filter(Boolean) as string[])].sort()
    const classes = [...new Set(classesData?.map(c => c.class_name).filter(Boolean) as string[])].sort()
    const teachers = [...new Set(teachersData?.map(t => t.teacher_name).filter(Boolean) as string[])].sort()

    return { schools, classes, teachers }
}

export interface ExploreNotesParams {
    search?: string
    schools?: string[]
    classes?: string[]
    teachers?: string[]
    page?: number
    limit?: number
}

export interface ExploreNote {
    id: string
    title: string
    description: string | null
    class_name: string | null
    teacher_name: string | null
    created_at: string
    updated_at: string
    user_id: string
    folder_path: string | null
    profiles: {
        username: string | null
        display_name: string | null
        avatar_url: string | null
        school: string | null
    } | null
}

export interface ExploreNotesResult {
    notes: ExploreNote[]
    totalCount: number
    page: number
    totalPages: number
}

export async function getExploreNotes(params: ExploreNotesParams): Promise<ExploreNotesResult> {
    const supabase = await createClient()
    const { search, schools, classes, teachers, page = 1, limit = 20 } = params
    const offset = (page - 1) * limit

    // Build the query for notes
    let query = supabase
        .from('notes')
        .select(`
            id,
            title,
            description,
            class_name,
            teacher_name,
            created_at,
            updated_at,
            user_id,
            folder_id
        `)
        .eq('is_public', true)
        .order('updated_at', { ascending: false })

    // Apply search filter
    if (search && search.trim()) {
        query = query.ilike('title', `%${sanitizeSearchQuery(search.trim())}%`)
    }

    // Apply class filter
    if (classes && classes.length > 0) {
        query = query.in('class_name', classes)
    }

    // Apply teacher filter
    if (teachers && teachers.length > 0) {
        query = query.in('teacher_name', teachers)
    }

    // Get total count with same filters (but without pagination)
    let countQuery = supabase
        .from('notes')
        .select('id', { count: 'exact', head: true })
        .eq('is_public', true)

    if (search && search.trim()) {
        countQuery = countQuery.ilike('title', `%${sanitizeSearchQuery(search.trim())}%`)
    }
    if (classes && classes.length > 0) {
        countQuery = countQuery.in('class_name', classes)
    }
    if (teachers && teachers.length > 0) {
        countQuery = countQuery.in('teacher_name', teachers)
    }

    // Execute both queries
    const [notesResult, countResult] = await Promise.all([
        query.range(offset, offset + limit - 1),
        countQuery
    ])

    const notesData = notesResult.data || []
    let totalCount = countResult.count || 0

    // Fetch profiles and folders for the notes
    let notesWithProfiles: ExploreNote[] = []

    if (notesData.length > 0) {
        const userIds = [...new Set(notesData.map(n => n.user_id).filter(Boolean))]
        const folderIds = [...new Set(notesData.map(n => n.folder_id).filter(Boolean))]

        // Fetch profiles
        let profilesQuery = supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url, school')
            .in('id', userIds)

        // If school filter is applied, filter profiles
        if (schools && schools.length > 0) {
            profilesQuery = profilesQuery.in('school', schools)
        }

        // Fetch folders
        const foldersPromise = folderIds.length > 0
            ? supabase.from('folders').select('id, name, parent_id, user_id').or(`id.in.(${folderIds.join(',')}),user_id.in.(${userIds.join(',')})`)
            : Promise.resolve({ data: [] })

        const [{ data: profiles }, { data: folders }] = await Promise.all([profilesQuery, foldersPromise])

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
        const folderMap = new Map(folders?.map(f => [f.id, f]) || [])

        // Build folder path helper
        const buildFolderPath = (folderId: string | null): string | null => {
            if (!folderId) return null
            const pathParts: string[] = []
            let currentId: string | null = folderId
            const visited = new Set<string>()
            while (currentId && !visited.has(currentId)) {
                visited.add(currentId)
                const folder = folderMap.get(currentId)
                if (folder) {
                    pathParts.unshift(folder.name)
                    currentId = folder.parent_id
                } else {
                    break
                }
            }
            return pathParts.length > 0 ? pathParts.join(' / ') : null
        }

        // Filter notes to only include those from matching profiles (if school filter applied)
        notesWithProfiles = notesData
            .map(note => ({
                ...note,
                folder_path: buildFolderPath(note.folder_id),
                profiles: note.user_id ? profileMap.get(note.user_id) || null : null
            }))
            .filter(note => {
                // If school filter is applied, only include notes from users with matching schools
                if (schools && schools.length > 0) {
                    return note.profiles !== null
                }
                return true
            })

        // Adjust count if school filter removed some notes
        if (schools && schools.length > 0) {
            totalCount = notesWithProfiles.length
        }
    }

    // If school filter and we have fewer notes than expected, we need better counting
    if (schools && schools.length > 0 && notesWithProfiles.length === 0 && page === 1) {
        totalCount = 0
    }

    const totalPages = Math.ceil(totalCount / limit)

    return {
        notes: notesWithProfiles,
        totalCount,
        page,
        totalPages
    }
}

// Optimized version that filters by school at database level
export async function getExploreNotesWithSchoolFilter(params: ExploreNotesParams): Promise<ExploreNotesResult> {
    const supabase = await createClient()
    const { search, schools, classes, teachers, page = 1, limit = 20 } = params
    const offset = (page - 1) * limit

    // If school filter is applied, we need to get user IDs first
    let userIdsWithSchool: string[] | null = null
    if (schools && schools.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .in('school', schools)

        userIdsWithSchool = profiles?.map(p => p.id) || []

        if (userIdsWithSchool.length === 0) {
            return { notes: [], totalCount: 0, page, totalPages: 0 }
        }
    }

    // Build the query for notes
    let query = supabase
        .from('notes')
        .select(`
            id,
            title,
            description,
            class_name,
            teacher_name,
            created_at,
            updated_at,
            user_id,
            folder_id
        `)
        .eq('is_public', true)
        .order('updated_at', { ascending: false })

    // Apply user filter (for school filtering)
    if (userIdsWithSchool) {
        query = query.in('user_id', userIdsWithSchool)
    }

    // Apply search filter
    if (search && search.trim()) {
        query = query.ilike('title', `%${sanitizeSearchQuery(search.trim())}%`)
    }

    // Apply class filter
    if (classes && classes.length > 0) {
        query = query.in('class_name', classes)
    }

    // Apply teacher filter
    if (teachers && teachers.length > 0) {
        query = query.in('teacher_name', teachers)
    }

    // Build count query with same filters
    let countQuery = supabase
        .from('notes')
        .select('id', { count: 'exact', head: true })
        .eq('is_public', true)

    if (userIdsWithSchool) {
        countQuery = countQuery.in('user_id', userIdsWithSchool)
    }
    if (search && search.trim()) {
        countQuery = countQuery.ilike('title', `%${sanitizeSearchQuery(search.trim())}%`)
    }
    if (classes && classes.length > 0) {
        countQuery = countQuery.in('class_name', classes)
    }
    if (teachers && teachers.length > 0) {
        countQuery = countQuery.in('teacher_name', teachers)
    }

    // Execute queries
    const [notesResult, countResult] = await Promise.all([
        query.range(offset, offset + limit - 1),
        countQuery
    ])

    const notesData = notesResult.data || []
    const totalCount = countResult.count || 0

    // Fetch profiles and folders for the notes
    let notesWithProfiles: ExploreNote[] = []

    if (notesData.length > 0) {
        const userIds = [...new Set(notesData.map(n => n.user_id).filter(Boolean))]
        const folderIds = [...new Set(notesData.map(n => n.folder_id).filter(Boolean))]

        // Fetch profiles
        const profilesPromise = userIds.length > 0
            ? supabase.from('profiles').select('id, username, display_name, avatar_url, school').in('id', userIds)
            : Promise.resolve({ data: [] })

        // Fetch folders (we need all folders for the user to build paths)
        const foldersPromise = folderIds.length > 0
            ? supabase.from('folders').select('id, name, parent_id, user_id').or(`id.in.(${folderIds.join(',')}),user_id.in.(${userIds.join(',')})`)
            : Promise.resolve({ data: [] })

        const [{ data: profiles }, { data: folders }] = await Promise.all([profilesPromise, foldersPromise])

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
        const folderMap = new Map(folders?.map(f => [f.id, f]) || [])

        // Build folder path helper
        const buildFolderPath = (folderId: string | null): string | null => {
            if (!folderId) return null
            const pathParts: string[] = []
            let currentId: string | null = folderId
            const visited = new Set<string>() // Prevent infinite loops
            while (currentId && !visited.has(currentId)) {
                visited.add(currentId)
                const folder = folderMap.get(currentId)
                if (folder) {
                    pathParts.unshift(folder.name)
                    currentId = folder.parent_id
                } else {
                    break
                }
            }
            return pathParts.length > 0 ? pathParts.join(' / ') : null
        }

        notesWithProfiles = notesData.map(note => ({
            ...note,
            folder_path: buildFolderPath(note.folder_id),
            profiles: note.user_id ? profileMap.get(note.user_id) || null : null
        }))
    }

    const totalPages = Math.ceil(totalCount / limit)

    return {
        notes: notesWithProfiles,
        totalCount,
        page,
        totalPages
    }
}

// ============================================
// VTT to Notes Conversion
// ============================================

export async function generateNotesFromVtt(
    vttContent: string,
    fileName: string
): Promise<{ markdown: string; title: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    // Check for Gemini API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your .env.local file.')
    }

    // Parse VTT content to extract dialogue
    const transcript = parseVttContent(vttContent)

    if (!transcript || transcript.length < 50) {
        throw new Error('VTT file appears to be empty or too short')
    }

    // Initialize the new Gemini SDK
    const ai = new GoogleGenAI({ apiKey })

    // Generate study notes from transcript
    const prompt = `You are an expert at creating comprehensive law school study notes from lecture transcripts.

Convert the following lecture transcript into well-organized study notes in Markdown format optimized for legal education.

## Markdown Structure Requirements:

### Heading Hierarchy (CRITICAL - follow this exactly):
- Use # (h1) ONLY for the main title at the very top
- Use ## (h2) for major topics/sections (e.g., "## Elements of the Offense", "## Key Cases")
- Use ### (h3) for subtopics within sections (e.g., "### Mens Rea", "### Actus Reus")
- Use #### (h4) for sub-subtopics or case breakdowns (e.g., "#### Facts", "#### Holding")
- Use ##### (h5) for fine-grained details when needed

### Content Formatting:
- Use **bold** for critical legal terms, case names, and key concepts that students must memorize
- Use bullet points (-) for lists of elements, factors, or related items
- Use numbered lists (1.) for sequential steps or ranked factors
- Use > blockquotes for important quotes, rules, or holdings that should stand out
- Use \`inline code\` sparingly for statutory citations or section numbers

### Legal Note-Taking Conventions:
- Case names should be **bolded** (e.g., **Miranda v. Arizona**)
- When breaking down cases, use this structure:
  #### Case Name
  - **Facts**: Brief relevant facts
  - **Issue**: Legal question presented
  - **Holding**: Court's decision
  - **Reasoning**: Key rationale
  - **Rule**: Extractable legal rule

### 🎯 HIGH-PRIORITY Content Detection:
Pay special attention to and prominently feature:
- **Definitions** - When teacher defines a term, format as: 📚 **Term**: Definition
- **Black Letter Law** - Core legal rules/doctrines should be in blockquotes with ⚖️
- **Repeated Concepts** - If teacher repeats something multiple times, it's important - mark with 🔁
- **Exam Signals** - When teacher says "this will be on the exam", "this is important", "make sure you know this", "I always test this", "you need to know this", etc. - mark with ⚠️ **EXAM ALERT**
- **Teacher Emphasis** - Anything the teacher stresses, emphasizes, or spends extra time on - mark with ⭐

### Emoji Usage Guide:
- 📚 = Definitions and key terms
- ⚖️ = Black letter law / legal rules
- ⚠️ = Exam alerts / "this will be tested"
- ⭐ = Teacher emphasized this point
- 🔁 = Repeated concept (teacher said it multiple times)
- 💡 = Helpful tips or memory aids mentioned
- ⚡ = Quick distinction or comparison between concepts

### Organization:
- Start with a brief ## Overview or ## Introduction if the lecture covers multiple topics
- Group related concepts under appropriate headings
- If there are exam alerts, consider adding a ## ⚠️ Exam Focus section collecting all tested items
- End with a ## Summary section with key takeaways
- Include a ## 📚 Key Terms section if many definitions were covered

### What NOT to do:
- Do not use h1 (#) except for the main title
- Do not skip heading levels (e.g., don't go from ## to ####)
- Do not include timestamps or speaker labels from the transcript
- Do not add meta-commentary about the notes
- Do not overuse emojis - use them strategically only for the categories listed above
- Do not use excessive formatting - keep it clean and scannable

Transcript:
${transcript}

Generate comprehensive law school study notes following the above structure, paying special attention to definitions, black letter law, repeated concepts, and anything the teacher signals will be tested:`

    const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            temperature: 0.3,
        }
    })

    const studyNotes = result.text

    if (!studyNotes) {
        throw new Error('Failed to generate study notes from Gemini')
    }

    // Extract title from filename (remove .vtt extension)
    const baseTitle = fileName.replace(/\.vtt$/i, '')
    // Format title nicely
    const title = baseTitle
        .replace(/[_-]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, c => c.toUpperCase())

    return { markdown: studyNotes, title }
}

export async function saveGeneratedNotes(
    markdown: string,
    title: string,
    fileName: string,
    folderId: string | null
): Promise<{ noteId: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    // Get the max position for notes in the target folder
    let maxPositionQuery = supabase
        .from('notes')
        .select('position')
        .eq('user_id', user.id)
        .order('position', { ascending: false })
        .limit(1)

    if (folderId) {
        maxPositionQuery = maxPositionQuery.eq('folder_id', folderId)
    } else {
        maxPositionQuery = maxPositionQuery.is('folder_id', null)
    }

    const { data: maxPositionData } = await maxPositionQuery
    const newPosition = maxPositionData && maxPositionData.length > 0
        ? (maxPositionData[0].position ?? 0) + 1
        : 0

    // Create the note
    const { data, error } = await supabase.from('notes').insert({
        title,
        description: `Study notes generated from ${fileName}`,
        content_markdown: markdown,
        user_id: user.id,
        folder_id: folderId || null,
        position: newPosition
    }).select('id').single()

    if (error) {
        console.error('Error creating note:', error)
        throw new Error('Failed to create note')
    }

    revalidatePath('/dashboard')
    revalidatePath('/notes')

    return { noteId: data.id }
}

// ============================================
// Full Text Search
// ============================================

export interface SearchResult {
    id: string
    title: string
    description: string | null
    content_markdown: string
    folder_id: string | null
    folder_path: string | null
    updated_at: string
    is_favorite: boolean
}

export async function searchNotes(query: string): Promise<SearchResult[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    if (!query.trim()) {
        return []
    }

    // Format query for websearch - this handles natural language queries
    const formattedQuery = query.trim()

    // Use textSearch with the fts column
    const { data: notes, error } = await supabase
        .from('notes')
        .select('id, title, description, content_markdown, folder_id, updated_at, is_favorite')
        .eq('user_id', user.id)
        .textSearch('fts', formattedQuery, {
            type: 'websearch',
            config: 'english'
        })
        .limit(50)

    if (error) {
        console.error('Error searching notes:', error)
        // Fallback to ilike search if FTS column doesn't exist yet
        const { data: fallbackNotes, error: fallbackError } = await supabase
            .from('notes')
            .select('id, title, description, content_markdown, folder_id, updated_at, is_favorite')
            .eq('user_id', user.id)
            .or(`title.ilike.%${sanitizeSearchQuery(query)}%,content_markdown.ilike.%${sanitizeSearchQuery(query)}%`)
            .order('updated_at', { ascending: false })
            .limit(50)

        if (fallbackError) {
            throw new Error('Failed to search notes')
        }

        return addFolderPathsToNotes(supabase, user.id, fallbackNotes || [])
    }

    return addFolderPathsToNotes(supabase, user.id, notes || [])
}

// Helper to add folder paths to search results
async function addFolderPathsToNotes(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    notes: Array<{
        id: string
        title: string
        description: string | null
        content_markdown: string
        folder_id: string | null
        updated_at: string
        is_favorite: boolean
    }>
): Promise<SearchResult[]> {
    if (notes.length === 0) return []

    // Fetch all folders for the user to build paths
    const { data: folders } = await supabase
        .from('folders')
        .select('id, name, parent_id')
        .eq('user_id', userId)

    const folderMap = new Map(folders?.map(f => [f.id, f]) || [])

    function getFolderPath(folderId: string | null): string | null {
        if (!folderId) return null
        const parts: string[] = []
        let currentId: string | null = folderId
        const visited = new Set<string>()
        while (currentId && !visited.has(currentId)) {
            visited.add(currentId)
            const folder = folderMap.get(currentId)
            if (!folder) break
            parts.unshift(folder.name)
            currentId = folder.parent_id
        }
        return parts.length > 0 ? parts.join(' / ') : null
    }

    return notes.map(note => ({
        ...note,
        folder_path: getFolderPath(note.folder_id)
    }))
}

export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        return { success: false, error: 'User not authenticated' }
    }

    // Call the edge function to delete the account
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
        return { success: false, error: 'Server configuration error' }
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
    })

    const result = await response.json()

    if (!response.ok) {
        console.error('Error deleting account:', result.error)
        return { success: false, error: result.error || 'Failed to delete account' }
    }

    return { success: true }
}
