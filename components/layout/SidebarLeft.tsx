'use client';

import { FileExplorer } from '@/components/file-explorer/FileExplorer';
import { UserCard } from '@/components/file-explorer/UserCard';

interface SidebarLeftProps {
    folders: any[];
    notes: any[];
    userEmail?: string;
}

export function SidebarLeft({ folders, notes, userEmail }: SidebarLeftProps) {
    return (
        <aside className="h-full bg-sidebar border-r border-border/50 flex flex-col">
            <div className="flex-1 overflow-hidden">
                <FileExplorer folders={folders} notes={notes}/>
            </div>
            {userEmail && <UserCard email={userEmail} />}
        </aside>
    );
}
