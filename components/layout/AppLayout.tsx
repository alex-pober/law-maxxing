'use client';

import { SidebarLeft } from './SidebarLeft';
import { SidebarRight } from './SidebarRight';
import { AppNavbar } from './AppNavbar';
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@/components/ui/resizable';

interface AppLayoutProps {
    children: React.ReactNode;
    notes: any[];
    folders: any[];
    user: any;
}

export function AppLayout({ children, notes, folders, user }: AppLayoutProps) {
    return (
        <div className="flex h-screen flex-col">
            <AppNavbar user={user} />
            <div className="flex flex-1 overflow-hidden">
                <SidebarLeft folders={folders} notes={notes} />
                <ResizablePanelGroup direction="horizontal" className="flex-1">
                    <ResizablePanel defaultSize={75} minSize={50}>
                        <main className="h-full py-6 lg:py-8 px-6 overflow-y-auto">
                            <div className="max-w-3xl mx-auto">
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
        </div>
    );
}
