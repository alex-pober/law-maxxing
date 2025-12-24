"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface ExploreSearchProps {
    initialQuery: string;
}

export function ExploreSearch({ initialQuery }: ExploreSearchProps) {
    const [query, setQuery] = useState(initialQuery);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
        } else {
            router.push("/explore");
        }
    };

    const handleClear = () => {
        setQuery("");
        router.push("/explore");
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565f89]" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search public notes..."
                    className="w-full h-12 pl-12 pr-12 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-[#565f89] focus:outline-none focus:border-[#7aa2f7]/50 focus:ring-1 focus:ring-[#7aa2f7]/50 transition-all"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <X className="w-3 h-3 text-[#a9b1d6]" />
                    </button>
                )}
            </div>
        </form>
    );
}
