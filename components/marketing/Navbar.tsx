import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";

export async function Navbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center border-b border-white/5 bg-[#16161e]/80 backdrop-blur-md transition-all duration-300">
            <div className="container px-4 md:px-6 flex items-center justify-between mx-auto w-full">
                <Link className="flex items-center justify-center gap-2 group" href="/">
                    <div className="relative h-8 w-40">
                        <Image
                            src="/logo.svg"
                            alt="Law Maxxing"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>
                <nav className="ml-auto flex gap-6 items-center">
                    <Link className="text-sm font-medium text-[#a9b1d6] hover:text-white transition-colors" href="/explore">
                        Explore
                    </Link>
                    {user ? (
                        <>
                            <span className="text-sm text-[#a9b1d6] hidden sm:inline-block">
                                {user.email}
                            </span>
                            <Button asChild className="bg-[#7aa2f7] text-[#1a1b26] hover:bg-[#7aa2f7]/90" size="sm">
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link className="text-sm font-medium text-[#a9b1d6] hover:text-white transition-colors" href="/login">
                                Sign In
                            </Link>
                            <Button asChild className="bg-[#7aa2f7] text-[#1a1b26] hover:bg-[#7aa2f7]/90 font-semibold" size="sm">
                                <Link href="/login">Get Started</Link>
                            </Button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
