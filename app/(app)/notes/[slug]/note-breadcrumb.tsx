import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface Folder {
    id: string;
    name: string;
    parent_id: string | null;
}

interface NoteBreadcrumbProps {
    folderPath: Folder[];
    noteTitle: string;
}

export function NoteBreadcrumb({ folderPath, noteTitle }: NoteBreadcrumbProps) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard" className="flex items-center gap-1">
                            <Home className="h-3.5 w-3.5" />
                            <span className="sr-only">Dashboard</span>
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {folderPath.map((folder) => (
                    <BreadcrumbItem key={folder.id}>
                        <BreadcrumbSeparator>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </BreadcrumbSeparator>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">{folder.name}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                ))}
                <BreadcrumbItem>
                    <BreadcrumbSeparator>
                        <ChevronRight className="h-3.5 w-3.5" />
                    </BreadcrumbSeparator>
                    <BreadcrumbPage className="max-w-[200px] truncate">
                        {noteTitle}
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}
