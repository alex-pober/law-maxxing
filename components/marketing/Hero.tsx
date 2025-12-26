"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, FileText, Folder, Settings, MoreHorizontal, Star as StarIcon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

const outlineItems: TocItem[] = [
    { id: "black-letter-law", text: "Black letter law", level: 1 },
    { id: "intentional-torts", text: "Intentional Torts", level: 2 },
    { id: "battery", text: "Battery", level: 3 },
    { id: "assault", text: "Assault", level: 3 },
    { id: "false-imprisonment", text: "False Imprisonment", level: 3 },
    { id: "iied", text: "IIED", level: 3 },
    { id: "trespass-land", text: "Trespass to Land", level: 3 },
    { id: "trespass-chattel", text: "Trespass to Chattel", level: 3 },
    { id: "conversion", text: "Conversion", level: 3 },
    { id: "affirmative-defenses", text: "Affirmative Defenses", level: 2 },
    { id: "consent", text: "Consent", level: 3 },
    { id: "self-defense", text: "Self-Defense", level: 3 },
    { id: "necessity", text: "Necessity", level: 3 },
    { id: "negligence", text: "Negligence", level: 2 },
    { id: "duty", text: "A. Duty", level: 3 },
    { id: "three-ways", text: "Three Ways to Establish", level: 4 },
    { id: "breach", text: "B. Breach", level: 3 },
    { id: "res-ipsa", text: "Res Ipsa Loquitur", level: 4 },
    { id: "causation", text: "C. Causation", level: 3 },
    { id: "cause-in-fact", text: "Causation In Fact", level: 4 },
    { id: "proximate", text: "Proximate Cause", level: 4 },
    { id: "damages", text: "D. Damages", level: 3 },
    { id: "joint-tortfeasors", text: "Joint Tortfeasors", level: 2 },
];

export function Hero() {
    const [activeId, setActiveId] = useState("negligence");
    const [hoveredTooltip, setHoveredTooltip] = useState<"library" | "content" | "outline" | null>(null);

    return (
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] blur-[100px] rounded-full mix-blend-screen" />
            </div>

            <div className="container px-4 md:px-6 relative z-10 mx-auto">
                <div className="flex flex-col items-center text-center space-y-8 mb-16">
                    <div className="inline-flex items-center rounded-full border border-[#7aa2f7]/30 bg-[#7aa2f7]/10 px-3 py-1 text-sm font-medium text-[#7aa2f7] backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-[#7aa2f7] mr-2 animate-pulse"></span>
                        New: Live Outline Preview
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl">
                        Law School Notes, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7]">
                            Mastered.
                        </span>
                    </h1>

                    <p className="text-xl text-[#a9b1d6] max-w-[600px] leading-relaxed">
                        The only note-taking app designed for law students, with AI and Outlines in mind.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Button asChild size="lg" className="bg-[#7aa2f7] hover:bg-[#7aa2f7]/90 text-[#1a1b26] font-semibold h-12 px-8 text-base">
                            <Link href="/login">
                                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-[#565f89] text-[#c0caf5] hover:bg-[#24283b] hover:text-white h-12 px-8 text-base bg-transparent">
                            <Link href="/explore">
                                See Public Notes
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* App Mockup */}
                <div className="relative mx-auto max-w-7xl transform md:perspective-1000">
                    <div className="relative md:rotate-x-6 transition-transform duration-700 hover:rotate-x-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] rounded-xl blur opacity-20"></div>

                        {/* Library Tooltip Overlay - bottom left of mockup */}
                        <div
                            className="absolute left-4 bottom-8 lg:left-12 lg:bottom-12 z-30 flex items-center gap-2 cursor-pointer"
                            onMouseEnter={() => setHoveredTooltip("library")}
                            onMouseLeave={() => setHoveredTooltip(null)}
                        >
                            <div className={cn(
                                "bg-[#0f0f14]/95 backdrop-blur-sm border-2 rounded-xl px-4 py-3 shadow-2xl transition-all duration-300",
                                hoveredTooltip === "library"
                                    ? "border-[#7aa2f7] shadow-[#7aa2f7]/50 scale-105"
                                    : "border-[#7aa2f7]/60 shadow-[#7aa2f7]/30"
                            )}>
                                <p className="text-sm font-bold text-white mb-1">Library</p>
                                <p className="text-xs text-[#a9b1d6] leading-relaxed max-w-[140px]">Organize notes in folders for each class.</p>
                            </div>
                        </div>

                        {/* Center Content Tooltip - top center above content */}
                        <div
                            className="absolute left-1/2 -translate-x-1/2 top-4 lg:top-8 z-30 flex flex-col items-center gap-1 cursor-pointer"
                            onMouseEnter={() => setHoveredTooltip("content")}
                            onMouseLeave={() => setHoveredTooltip(null)}
                        >
                            <div className={cn(
                                "bg-[#0f0f14]/95 backdrop-blur-sm border-2 rounded-xl px-4 py-3 shadow-2xl transition-all duration-300",
                                hoveredTooltip === "content"
                                    ? "border-[#9ece6a] shadow-[#9ece6a]/50 scale-105"
                                    : "border-[#9ece6a]/60 shadow-[#9ece6a]/30"
                            )}>
                                <p className="text-sm font-bold text-white mb-1 text-center">Smart Notes</p>
                                <p className="text-xs text-[#a9b1d6] leading-relaxed max-w-[180px] text-center">In custom markdown for Outlines and copy/paste into any LLM.</p>
                            </div>
                        </div>

                        {/* Right Outline Tooltip - bottom right of mockup */}
                        <div
                            className="absolute right-4 bottom-8 lg:right-12 lg:bottom-12 z-30 flex items-center gap-2 cursor-pointer"
                            onMouseEnter={() => setHoveredTooltip("outline")}
                            onMouseLeave={() => setHoveredTooltip(null)}
                        >
                            <div className={cn(
                                "bg-[#0f0f14]/95 backdrop-blur-sm border-2 rounded-xl px-4 py-3 shadow-2xl transition-all duration-300",
                                hoveredTooltip === "outline"
                                    ? "border-[#bb9af7] shadow-[#bb9af7]/50 scale-105"
                                    : "border-[#bb9af7]/60 shadow-[#bb9af7]/30"
                            )}>
                                <p className="text-sm font-bold text-white mb-1">Live Outline</p>
                                <p className="text-xs text-[#a9b1d6] leading-relaxed max-w-[140px]">Take notes and create outline at the same time.</p>
                            </div>
                        </div>

                        <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-[#7aa2f7]/20 bg-[#1a1b26] flex w-full">
                            {/* Left Sidebar */}
                            <div className={cn(
                                "w-56 border-r border-white/5 bg-[#16161e] hidden lg:flex flex-col shrink-0 relative transition-all duration-300",
                                hoveredTooltip === "library" && "ring-2 ring-[#7aa2f7] ring-inset bg-[#7aa2f7]/5"
                            )}>
                                <div className="p-4 border-b border-white/5 flex items-center justify-start">
                                    <div className="relative h-6 w-32">
                                        <Image
                                            src="/logo.svg"
                                            alt="Law Maxxing"
                                            fill
                                            className="object-contain object-left"
                                        />
                                    </div>
                                </div>
                                <div className="p-2 space-y-1 flex-1 overflow-y-auto">
                                    <div className="px-3 py-2 text-xs font-semibold text-[#565f89] uppercase tracking-wider">
                                        Library
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#7aa2f7]/10 text-[#7aa2f7]">
                                        <Folder className="w-4 h-4" />
                                        <span className="text-sm font-medium">Torts</span>
                                    </div>
                                    <div className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#292e42] text-white">
                                        <FileText className="w-4 h-4 text-[#7aa2f7]" />
                                        <span className="text-sm">Black Letter Law</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#a9b1d6] hover:bg-[#292e42] transition-colors">
                                        <Folder className="w-4 h-4 text-[#565f89]" />
                                        <span className="text-sm font-medium">Contracts</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#a9b1d6] hover:bg-[#292e42] transition-colors">
                                        <Folder className="w-4 h-4 text-[#565f89]" />
                                        <span className="text-sm font-medium">Criminal Law</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#a9b1d6] hover:bg-[#292e42] transition-colors">
                                        <Folder className="w-4 h-4 text-[#565f89]" />
                                        <span className="text-sm font-medium">Property</span>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-white/5 space-y-2">
                                    <div className="flex items-center gap-3 text-[#a9b1d6] text-sm hover:text-white cursor-pointer">
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </div>
                                </div>

                            </div>

                            {/* Main Content */}
                            <div className="flex-1 flex flex-col min-w-0 bg-[#1a1b26]">
                                {/* Navbar */}
                                <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-[#1a1b26] shrink-0">
                                    <div className="flex items-center gap-2 md:gap-4 text-[#a9b1d6] text-sm">
                                        <span className="opacity-50">Torts</span>
                                        <span className="opacity-30">/</span>
                                        <span className="truncate">Black Letter Law</span>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#24283b] text-[#7aa2f7] text-xs font-medium border border-[#7aa2f7]/20">
                                            <span className="w-2 h-2 rounded-full bg-[#9ece6a] animate-pulse"></span>
                                            Saved
                                        </div>
                                        <MoreHorizontal className="w-4 h-4 text-[#565f89]" />
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 flex overflow-hidden">
                                    {/* Note Content */}
                                    <div className={cn(
                                        "flex-1 p-4 md:p-6 overflow-y-auto transition-all duration-300",
                                        hoveredTooltip === "content" && "ring-2 ring-[#9ece6a] ring-inset bg-[#9ece6a]/5"
                                    )}>
                                        {/* Note Header */}
                                        <div className="mb-4">
                                            <div className="flex items-start gap-2 mb-1">
                                                <h1 className="text-xl md:text-2xl font-bold text-white flex-1">Black Letter Law</h1>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                                                        <Globe className="h-3.5 w-3.5 text-emerald-400" />
                                                    </button>
                                                    <button className="flex items-center justify-center w-7 h-7 rounded-lg bg-yellow-500/15 border border-yellow-500/30">
                                                        <StarIcon className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-[#a9b1d6] text-xs md:text-sm">Comprehensive torts outline for 1L</p>
                                        </div>

                                        {/* Note Body - Prose Content */}
                                        <div className="prose prose-slate max-w-none dark:prose-invert text-xs leading-relaxed">
                                            <h2 id="negligence" className="text-sm md:text-base font-semibold text-white mt-1 mb-1.5">Negligence:</h2>

                                            <p className="text-[#a9b1d6] my-1">
                                                Elements of a cause of action. Prima facie elements for COA:
                                            </p>

                                            <h3 id="duty" className="text-xs font-semibold text-white mt-2 mb-0.5 ml-2 md:ml-3">A. Duty</h3>
                                            <p className="text-[#a9b1d6] my-0.5 ml-2 md:ml-3">
                                                Existence of a duty to conform to a specific standard of conduct to protect plaintiff against unreasonable risk of harm.
                                            </p>

                                            <h4 className="text-xs font-medium text-white mt-1.5 mb-0.5 ml-3 md:ml-5">THREE WAYS TO ESTABLISH DUTY</h4>
                                            <ul className="list-disc my-0.5 ml-5 md:ml-8 text-[#a9b1d6] space-y-0">
                                                <li><strong className="text-white">By Activity</strong> - By engaging in activity that increases risk of harm, one must act as a reasonable, prudent person. <em className="text-[#7aa2f7]">Zone of Danger</em>: Area of increased risk.</li>
                                                <li><strong className="text-white">By Statute</strong> - Violation of statute establishes duty and breach. P must be in protected class.</li>
                                                <li><strong className="text-white">By Contract</strong> - Contract relationship creates duty (e.g., Attorney-client, Landlord-tenant).</li>
                                            </ul>

                                            <h3 id="breach" className="text-xs font-semibold text-white mt-2 mb-0.5 ml-2 md:ml-3">B. Breach (fault element)</h3>
                                            <p className="text-[#a9b1d6] my-0.5 ml-2 md:ml-3">
                                                Conduct falling below the standard of care of a reasonable prudent person under the circumstances.
                                            </p>
                                            <p className="text-[#a9b1d6] my-0.5 ml-2 md:ml-3">
                                                <strong className="text-white">Res Ipsa Loquitur</strong> - &quot;The thing speaks for itself.&quot; Requires: (1) accident wouldn&apos;t normally occur without negligence, (2) instrumentality in sole control of D.
                                            </p>

                                            <h3 id="causation" className="text-xs font-semibold text-white mt-2 mb-0.5 ml-2 md:ml-3">C. Causation</h3>
                                            <ul className="list-disc my-0.5 ml-4 md:ml-6 text-[#a9b1d6] space-y-0">
                                                <li><strong className="text-white">Causation In fact</strong> - &quot;But for&quot; test: But for D&apos;s conduct, P would not be injured. Must prove more likely than not (51%).</li>
                                                <li><strong className="text-white">Proximate causation</strong> - Cuts off liability even if caused in fact. D liable for all harmful results within increased risk caused by his acts.</li>
                                            </ul>

                                            <h3 id="damages" className="text-xs font-semibold text-white mt-2 mb-0.5 ml-2 md:ml-3">D. Damages</h3>
                                            <p className="text-[#a9b1d6] my-0.5 ml-2 md:ml-3">
                                                P suffered injuries. Apportion damages for multiple tortfeasors.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Sidebar - Outline */}
                                    <div className={cn(
                                        "w-56 xl:w-64 border-l border-white/5 bg-[#16161e]/50 hidden md:block p-4 shrink-0 overflow-y-auto transition-all duration-300",
                                        hoveredTooltip === "outline" && "ring-2 ring-[#bb9af7] ring-inset bg-[#bb9af7]/5"
                                    )}>
                                        <div className="text-xs font-semibold text-[#565f89] uppercase tracking-wider mb-4">
                                            Black Letter Outline
                                        </div>
                                        <div className="space-y-1 text-xs">
                                            {outlineItems.map((item, index) => {
                                                const indent = (item.level - 1) * 0.75;
                                                const isActive = item.id === activeId;

                                                return (
                                                    <div
                                                        key={`${item.id}-${index}`}
                                                        className={cn(
                                                            "py-1 cursor-pointer transition-colors truncate",
                                                            isActive
                                                                ? "text-[#7aa2f7] border-l-2 border-[#7aa2f7] bg-[#7aa2f7]/5 rounded-r pl-2"
                                                                : "text-[#565f89] hover:text-[#a9b1d6]"
                                                        )}
                                                        style={{ paddingLeft: isActive ? '0.5rem' : `${indent}rem` }}
                                                        onClick={() => setActiveId(item.id)}
                                                        title={item.text}
                                                    >
                                                        {item.text}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
