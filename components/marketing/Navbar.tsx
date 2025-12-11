import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export async function Navbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <Link className="flex items-center justify-center" href="/">
                <BookOpen className="h-6 w-6 mr-2" />
                <span className="font-bold">Law Maxxing</span>
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
                {user ? (
                    <>
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">
                            {user.email}
                        </span>
                        <Button asChild variant="default" size="sm">
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    </>
                ) : (
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
                        Sign In
                    </Link>
                )}
            </nav>
        </header>
    );
}
