"use client";

import { Quote } from "lucide-react";

export function SocialProof() {
    return (
        <section className="py-24 bg-[#1a1b26] border-t border-white/5">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Trusted by students at</h2>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-xl font-serif text-[#c0caf5]/80">HARVARD LAW</span>
                        <span className="text-xl font-serif text-[#c0caf5]/80">YALE</span>
                        <span className="text-xl font-serif text-[#c0caf5]/80">STANFORD</span>
                        <span className="text-xl font-serif text-[#c0caf5]/80">COLUMBIA</span>
                        <span className="text-xl font-serif text-[#c0caf5]/80">NYU LAW</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <TestimonialCard
                        quote="I stopped making paper flashcards completely. The active recall mode just works."
                        author="Alex C."
                        role="1L at Harvard"
                    />
                    <TestimonialCard
                        quote="The outline view is a game changer. I can finally see the big picture while typing."
                        author="Sarah M."
                        role="2L at Yale"
                    />
                    <TestimonialCard
                        quote="My study group uses this exclusively now. Sharing outlines has never been this clean."
                        author="James R."
                        role="3L at Stanford"
                    />
                </div>
            </div>
        </section>
    );
}

function TestimonialCard({ quote, author, role }: { quote: string, author: string, role: string }) {
    return (
        <div className="p-6 rounded-xl bg-[#24283b]/50 border border-white/5 relative">
            <Quote className="absolute top-6 right-6 w-8 h-8 text-[#7aa2f7]/20" />
            <p className="text-[#c0caf5] text-lg mb-6 leading-relaxed relative z-10">
                "{quote}"
            </p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7aa2f7] to-[#bb9af7]" />
                <div>
                    <div className="font-bold text-white">{author}</div>
                    <div className="text-sm text-[#565f89]">{role}</div>
                </div>
            </div>
        </div>
    )
}
