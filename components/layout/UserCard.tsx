'use client';

import { LogOut, Settings, MoreVertical } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserCardProps {
    email: string;
}

export function UserCard({ email }: UserCardProps) {
    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <div className="flex items-center gap-2 p-2 border-t border-border/50 m-2">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">
                    {email}
                </p>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="w-48">
                    <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} variant="destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
