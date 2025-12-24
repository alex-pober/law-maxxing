'use client';

import { SidebarLeft } from './SidebarLeft';
import { SidebarRight } from './SidebarRight';
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@/components/ui/resizable';

interface AppLayoutProps {
    children: React.ReactNode;
    notes: any[];
    folders: any[];
    userEmail?: string;
}

export function AppLayout({ children, notes, folders, userEmail }: AppLayoutProps) {
    return (
        <div className="flex h-screen flex-col">
            <ResizablePanelGroup
                direction="horizontal"
                className="flex-1 overflow-hidden"
                autoSaveId="app-layout-panels"
            >
                <ResizablePanel defaultSize={5} minSize={9} maxSize={30} className="hidden md:block">
                    <SidebarLeft folders={folders} notes={notes} userEmail={userEmail} />
                </ResizablePanel>
                <ResizableHandle withHandle className="hidden md:flex" />
                <ResizablePanel defaultSize={60} minSize={40}>
                    <main className="h-full py-6 lg:py-8 px-6 overflow-y-auto">
                        <div className="max-w-6xl mx-auto">
                            {children}
                        </div>
                    </main>
                </ResizablePanel>
                <ResizableHandle withHandle className="hidden xl:flex" />
                <ResizablePanel defaultSize={25} minSize={15} maxSize={40} className="hidden xl:block">
                    <aside className="h-full py-6 lg:py-8 px-4 overflow-y-auto">
                        <SidebarRight />
                    </aside>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
