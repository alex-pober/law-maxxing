"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppMockup } from "./AppMockup";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] blur-[100px] rounded-full mix-blend-screen" />
            </div>

            <div className="container px-4 md:px-6 relative z-10 mx-auto">
                <div className="flex flex-col items-center text-center space-y-8 mb-20">
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
                        The only note-taking app designed for law students. Transform your case briefs into active recall flashcards instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Button size="lg" className="bg-[#7aa2f7] hover:bg-[#7aa2f7]/90 text-[#1a1b26] font-semibold h-12 px-8 text-base">
                            <Link href="/login" className="flex items-center">
                                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="border-[#565f89] text-[#c0caf5] hover:bg-[#24283b] hover:text-white h-12 px-8 text-base bg-transparent">
                            <Link href="#features">
                                See How It Works
                            </Link>
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[#565f89] mt-8">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1a1b26] bg-[#24283b] flex items-center justify-center text-xs font-medium text-white">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="flex text-[#e0af68]">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                            <span className="text-[#a9b1d6]">Loved by 100+ students</span>
                        </div>
                    </div>
                </div>

                <div className="relative mx-auto max-w-6xl transform md:perspective-1000">
                    <div className="relative md:rotate-x-12 transition-transform duration-700 hover:rotate-x-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] rounded-xl blur opacity-20"></div>
                        <AppMockup className="shadow-2xl shadow-[#7aa2f7]/20" />
                    </div>
                </div>
            </div>
        </section>
    );
}
