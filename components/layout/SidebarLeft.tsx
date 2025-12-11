'use client';

import { FileExplorer } from '@/components/file-explorer/FileExplorer';

interface SidebarLeftProps {
    folders: any[];
    notes: any[];
}

export function SidebarLeft({ folders, notes }: SidebarLeftProps) {
    return (
        <aside className="hidden md:block w-60 shrink-0 h-full border-r overflow-y-auto">
            <FileExplorer folders={folders} notes={notes} />
        </aside>
    );
}
