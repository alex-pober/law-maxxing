import Link from "next/link";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { SocialProof } from "@/components/marketing/SocialProof";
import { CTA } from "@/components/marketing/CTA";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#1a1b26]">
            <Hero />
            <Features />
            <SocialProof />
            <CTA />

            <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t border-white/5 bg-[#16161e]">
                <p className="text-xs text-[#565f89]">© 2024 Law Maxxing. All rights reserved.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-xs text-[#565f89] hover:text-[#a9b1d6] transition-colors" href="#">
                        Terms of Service
                    </Link>
                    <Link className="text-xs text-[#565f89] hover:text-[#a9b1d6] transition-colors" href="#">
                        Privacy
                    </Link>
                </nav>
            </footer>
        </div>
    );
}
