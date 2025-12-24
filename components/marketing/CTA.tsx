"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#7aa2f7] opacity-5"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#bb9af7] blur-[120px] rounded-full opacity-20 pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10 text-center mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Ready to <span className="text-[#7aa2f7]">max</span> your grades?
                </h2>
                <p className="text-xl text-[#a9b1d6] max-w-2xl mx-auto mb-10">
                    Join thousands of law students who are studying smarter, not harder. Start your free trial today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-[#7aa2f7] hover:bg-[#7aa2f7]/90 text-[#1a1b26] font-semibold h-12 px-8 text-base">
                        <Link href="/login" className="flex items-center">
                            Start Learning Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
