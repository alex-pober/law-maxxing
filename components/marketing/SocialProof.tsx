"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Globe,
    Search,
    Filter,
    Users,
    BookOpen,
    GraduationCap,
    School,
    FileText,
    User,
    ArrowRight,
    Eye,
    Share2,
    Lock,
    Unlock,
} from "lucide-react";
import Link from "next/link";

const mockNotes = [
    {
        id: "1",
        title: "Torts - Negligence Elements",
        description: "Complete breakdown of duty, breach, causation, damages",
        class_name: "Torts I",
        teacher_name: "Prof. Chen",
        author: "alex_law",
        school: "Harvard Law",
        avatar: null,
    },
    {
        id: "2",
        title: "Contracts - Consideration",
        description: "Bargained-for exchange and legal detriment analysis",
        class_name: "Contracts",
        teacher_name: "Prof. Martinez",
        author: "studyqueen",
        school: "Yale Law",
        avatar: null,
    },
    {
        id: "3",
        title: "Crim Law - Mens Rea",
        description: "Intent levels from purposely to negligently",
        class_name: "Criminal Law",
        teacher_name: "Prof. Williams",
        author: "lawbro99",
        school: "Stanford Law",
        avatar: null,
    },
    {
        id: "4",
        title: "Property - Adverse Possession",
        description: "OCEAN elements and statutory periods by state",
        class_name: "Property",
        teacher_name: "Prof. Kim",
        author: "outlinequeen",
        school: "Columbia Law",
        avatar: null,
    },
];

export function SocialProof() {
    const [activeTab, setActiveTab] = useState<"share" | "explore">("share");
    const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
    const [isPublic, setIsPublic] = useState(false);

    return (
        <section className="py-24 bg-[#1a1b26] border-t border-white/5 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-linear-to-bl from-[#9ece6a] to-transparent blur-[100px] rounded-full" />
            </div>

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#9ece6a]/10 text-[#9ece6a] text-sm font-medium border border-[#9ece6a]/20 mb-4">
                        <Users className="w-4 h-4 mr-2" />
                        Community Library
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Share & Discover <span className="text-transparent bg-clip-text bg-linear-to-r from-[#9ece6a] to-[#7aa2f7]">Together</span>
                    </h2>
                    <p className="text-[#a9b1d6] text-lg">
                        Make your notes public to help others, or explore thousands of outlines from students at top law schools.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex rounded-xl border border-white/10 p-1 bg-[#16161e]">
                        <button
                            onClick={() => setActiveTab("share")}
                            className={cn(
                                "px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === "share"
                                    ? "bg-[#9ece6a] text-[#1a1b26]"
                                    : "text-[#a9b1d6] hover:text-white"
                            )}
                        >
                            <Share2 className="w-4 h-4" />
                            Share Your Notes
                        </button>
                        <button
                            onClick={() => setActiveTab("explore")}
                            className={cn(
                                "px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === "explore"
                                    ? "bg-[#7aa2f7] text-[#1a1b26]"
                                    : "text-[#a9b1d6] hover:text-white"
                            )}
                        >
                            <Search className="w-4 h-4" />
                            Explore Notes
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="max-w-6xl mx-auto">
                    {activeTab === "share" ? (
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            {/* Left: Explanation */}
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-white">
                                    One click to share with the world
                                </h3>
                                <p className="text-[#a9b1d6] leading-relaxed">
                                    Toggle any note to public and it becomes discoverable by students everywhere.
                                    Add your school, class, and professor to help others find exactly what they need.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[#9ece6a]/10 flex items-center justify-center shrink-0">
                                            <Globe className="w-5 h-5 text-[#9ece6a]" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Public Profile</h4>
                                            <p className="text-sm text-[#a9b1d6]">
                                                Build your reputation as students view and bookmark your outlines
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[#7aa2f7]/10 flex items-center justify-center shrink-0">
                                            <School className="w-5 h-5 text-[#7aa2f7]" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">School Tagging</h4>
                                            <p className="text-sm text-[#a9b1d6]">
                                                Tag your school so classmates can easily find your work
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[#bb9af7]/10 flex items-center justify-center shrink-0">
                                            <GraduationCap className="w-5 h-5 text-[#bb9af7]" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Professor Matching</h4>
                                            <p className="text-sm text-[#a9b1d6]">
                                                Students with the same professor get the most relevant notes
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Interactive Demo */}
                            <div className="rounded-2xl border border-white/10 bg-[#16161e] overflow-hidden">
                                {/* Mock Note Header */}
                                <div className="p-4 border-b border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-[#7aa2f7]/10">
                                                <FileText className="w-4 h-4 text-[#7aa2f7]" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white">Torts - Negligence Outline</h4>
                                                <p className="text-xs text-[#565f89]">Last edited 2 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visibility Toggle */}
                                <div className="p-4 space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1b26] border border-white/5">
                                        <div className="flex items-center gap-3">
                                            {isPublic ? (
                                                <Unlock className="w-5 h-5 text-[#9ece6a]" />
                                            ) : (
                                                <Lock className="w-5 h-5 text-[#565f89]" />
                                            )}
                                            <div>
                                                <span className="text-sm font-medium text-white">
                                                    {isPublic ? "Public" : "Private"}
                                                </span>
                                                <p className="text-xs text-[#565f89]">
                                                    {isPublic ? "Anyone can discover this note" : "Only you can see this"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsPublic(!isPublic)}
                                            className={cn(
                                                "relative w-12 h-6 rounded-full transition-colors",
                                                isPublic ? "bg-[#9ece6a]" : "bg-[#24283b]"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                                    isPublic ? "left-7" : "left-1"
                                                )}
                                            />
                                        </button>
                                    </div>

                                    {/* Metadata Fields - only show when public */}
                                    <div className={cn(
                                        "space-y-3 transition-all duration-300",
                                        isPublic ? "opacity-100" : "opacity-40 pointer-events-none"
                                    )}>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-lg bg-[#1a1b26] border border-white/5">
                                                <label className="text-xs text-[#565f89] mb-1 block">Class</label>
                                                <div className="flex items-center gap-2 text-sm text-white">
                                                    <BookOpen className="w-4 h-4 text-[#7aa2f7]" />
                                                    Torts I
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-[#1a1b26] border border-white/5">
                                                <label className="text-xs text-[#565f89] mb-1 block">Teacher</label>
                                                <div className="flex items-center gap-2 text-sm text-white">
                                                    <GraduationCap className="w-4 h-4 text-[#9ece6a]" />
                                                    Prof. Chen
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-[#1a1b26] border border-white/5">
                                            <label className="text-xs text-[#565f89] mb-1 block">School</label>
                                            <div className="flex items-center gap-2 text-sm text-white">
                                                <School className="w-4 h-4 text-[#bb9af7]" />
                                                Harvard Law School
                                            </div>
                                        </div>
                                    </div>

                                    {isPublic && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#9ece6a]/10 border border-[#9ece6a]/20">
                                            <Eye className="w-4 h-4 text-[#9ece6a]" />
                                            <span className="text-sm text-[#9ece6a]">
                                                Now visible on your profile and in Explore
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Explore Mock UI */}
                            <div className="rounded-2xl border border-white/10 bg-[#16161e] overflow-hidden">
                                {/* Toolbar */}
                                <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/5">
                                    {/* Search */}
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#565f89]" />
                                        <input
                                            type="text"
                                            placeholder="Search notes..."
                                            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-[#565f89] text-sm focus:outline-none focus:border-[#7aa2f7]"
                                        />
                                    </div>

                                    {/* Filter Chips */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={() => setSelectedSchool(selectedSchool === "Harvard Law" ? null : "Harvard Law")}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                                                selectedSchool === "Harvard Law"
                                                    ? "bg-[#7aa2f7] text-white"
                                                    : "bg-white/5 text-[#a9b1d6] hover:bg-white/10 border border-white/10"
                                            )}
                                        >
                                            <School className="w-3 h-3" />
                                            Harvard Law
                                        </button>
                                        <button className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-[#a9b1d6] hover:bg-white/10 border border-white/10 flex items-center gap-1.5">
                                            <School className="w-3 h-3" />
                                            Yale Law
                                        </button>
                                        <button className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-[#a9b1d6] hover:bg-white/10 border border-white/10 flex items-center gap-1.5">
                                            <Filter className="w-3 h-3" />
                                            More Filters
                                        </button>
                                    </div>

                                    <span className="text-xs text-[#565f89] ml-auto">
                                        2,847 notes
                                    </span>
                                </div>

                                {/* Notes Grid */}
                                <div className="p-4">
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {mockNotes
                                            .filter(note => !selectedSchool || note.school === selectedSchool)
                                            .map((note) => (
                                                <div
                                                    key={note.id}
                                                    className="p-4 rounded-lg border border-white/10 bg-white/2 hover:bg-white/5 hover:border-[#7aa2f7]/30 transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="p-2 rounded-md bg-[#7aa2f7]/10 text-[#7aa2f7] shrink-0">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-medium text-white group-hover:text-[#7aa2f7] transition-colors truncate text-sm">
                                                                {note.title}
                                                            </h4>
                                                            <p className="text-xs text-[#a9b1d6] line-clamp-1 mt-0.5">
                                                                {note.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                                                        <div className="w-5 h-5 rounded-full bg-[#7aa2f7]/20 flex items-center justify-center">
                                                            <User className="w-3 h-3 text-[#7aa2f7]" />
                                                        </div>
                                                        <span className="text-xs text-[#a9b1d6]">@{note.author}</span>
                                                        <div className="flex items-center gap-1 text-xs text-[#565f89] ml-auto">
                                                            <School className="h-3 w-3" />
                                                            <span className="truncate max-w-[60px]">{note.school.replace(" Law", "")}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-1.5">
                                                        <span className="px-2 py-0.5 rounded text-xs bg-[#7aa2f7]/10 text-[#7aa2f7]">
                                                            {note.class_name}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded text-xs bg-[#9ece6a]/10 text-[#9ece6a]">
                                                            {note.teacher_name}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
                                    <p className="text-xs text-[#565f89]">
                                        Filter by school, class, or professor to find the perfect notes
                                    </p>
                                    <Link
                                        href="/explore"
                                        className="flex items-center gap-2 text-sm text-[#7aa2f7] hover:text-[#7aa2f7]/80 transition-colors font-medium"
                                    >
                                        Browse All Notes
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-xl bg-[#16161e] border border-white/5 text-center">
                                    <div className="text-3xl font-bold text-white mb-1">50+</div>
                                    <div className="text-sm text-[#565f89]">Law Schools</div>
                                    <div className="text-sm text-[#565f89]">(hopefully)</div>
                                </div>
                                <div className="p-4 rounded-xl bg-[#16161e] border border-white/5 text-center">
                                    <div className="text-3xl font-bold text-white mb-1">2.8K+</div>
                                    <div className="text-sm text-[#565f89]">Public Notes</div>
                                    <div className="text-sm text-[#565f89]">(hopefully)</div>
                                </div>
                                <div className="p-4 rounded-xl bg-[#16161e] border border-white/5 text-center">
                                    <div className="text-3xl font-bold text-white mb-1">500+</div>
                                    <div className="text-sm text-[#565f89]">Professors</div>
                                    <div className="text-sm text-[#565f89]">(hopefully)</div>
                                </div>
                                <div className="p-4 rounded-xl bg-[#16161e] border border-white/5 text-center">
                                    <div className="text-3xl font-bold text-white mb-1">12K+</div>
                                    <div className="text-sm text-[#565f89]">Students</div>
                                    <div className="text-sm text-[#565f89]">(hopefully)</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
