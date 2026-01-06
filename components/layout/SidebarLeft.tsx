'use client';

import Link from 'next/link';
import { Compass } from 'lucide-react';
import { FileExplorer } from '@/components/file-explorer/FileExplorer';
import { UserCard } from '@/components/file-explorer/UserCard';
import { SidebarSearch } from '@/components/search/SidebarSearch';

interface Note {
    id: string;
    title: string;
    folder_id: string | null;
    position: number;
}

interface Folder {
    id: string;
    name: string;
    parent_id: string | null;
    position: number;
}

interface SidebarLeftProps {
    folders: Folder[];
    notes: Note[];
    userEmail?: string;
}

export function SidebarLeft({ folders, notes, userEmail }: SidebarLeftProps) {
    return (
        <aside className="h-full bg-sidebar border-r border-border/50 flex flex-col">
            {/* Search */}
            <SidebarSearch />

            <div className="flex-1 overflow-hidden">
                <FileExplorer folders={folders} notes={notes}/>
            </div>
            <div className="px-2 py-1.5">
                <Link
                    href="/explore"
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                    <Compass className="h-4 w-4" />
                    <span>Explore</span>
                </Link>
            </div>
            {userEmail && <UserCard email={userEmail} />}
        </aside>
    );
}
