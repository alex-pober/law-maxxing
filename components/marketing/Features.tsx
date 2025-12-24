"use client";

import { AppMockup } from "./AppMockup";
import { BookOpen, Share2, Sparkles, Zap } from "lucide-react";

export function Features() {
    return (
        <section id="features" className="py-24 bg-[#16161e] relative overflow-hidden">
            <div className="container px-4 md:px-6 relative z-10 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white">
                        Built for the <span className="text-[#7aa2f7]">Gunner</span> in you.
                    </h2>
                    <p className="text-[#a9b1d6] text-lg">
                        Forget messy Google Docs. Law Maxxing gives you the structure you need to crush your finals.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
                    <div className="space-y-8 order-2 md:order-1">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#7aa2f7]/10 text-[#7aa2f7] text-sm font-medium border border-[#7aa2f7]/20">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Active Recall
                        </div>
                        <h3 className="text-3xl font-bold text-white">Memorize Mode</h3>
                        <p className="text-[#a9b1d6] text-lg leading-relaxed">
                            Toggle "Memorize Mode" to instantly turn your notes into fill-in-the-blank flashcards. We dynamically redact words while keeping the first letter, forcing your brain to reconstruct the sentence.
                        </p>
                        <ul className="space-y-3">
                            {[
                                "Science-backed 'Active Recall' method",
                                "Perfect for black letter law rules",
                                "Toggle instantly with one click"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center text-[#c0caf5]">
                                    <div className="mr-3 h-6 w-6 rounded-full bg-[#9ece6a]/20 flex items-center justify-center">
                                        <Zap className="h-3.5 w-3.5 text-[#9ece6a]" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="order-1 md:order-2 relative">
                        <div className="absolute inset-0 bg-[#7aa2f7] blur-[80px] opacity-10 rounded-full" />
                        <div className="relative transform md:scale-110 md:-rotate-2 transition-transform hover:rotate-0 duration-500">
                            <AppMockup activeFeature="memorize" className="!aspect-[4/3] max-w-lg mx-auto md:mr-0 border-[#7aa2f7]/30" />
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Zap className="w-6 h-6 text-[#e0af68]" />}
                        title="Developer Inspired Outlines"
                        description="Your outline is always visible on the right. Click any heading to jump instantly. Never get lost in outline again."
                    />
                    <FeatureCard
                        icon={<Share2 className="w-6 h-6 text-[#bb9af7]" />}
                        title="Shared Libraries"
                        description="Create a shared folder with your study group. Everyone contributes, everyone wins. Real-time updates for the whole squad."
                    />
                    <FeatureCard
                        icon={<BookOpen className="w-6 h-6 text-[#7aa2f7]" />}
                        title="Case Brief Integration"
                        description="Link cases directly to your notes. Hover over a case name to see your brief summary without leaving the page."
                    />
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-[#1a1b26] border border-white/5 hover:border-[#7aa2f7]/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-lg bg-[#24283b] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#7aa2f7] transition-colors">{title}</h3>
            <p className="text-[#a9b1d6] leading-relaxed">
                {description}
            </p>
        </div>
    )
}
