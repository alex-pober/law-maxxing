"use client";

import { cn } from "@/lib/utils";
import { BookOpen, FileText, Folder, Hash, MoreHorizontal, Search, Settings, Sidebar } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface AppMockupProps {
  className?: string;
  activeFeature?: "live-preview" | "memorize" | "default";
}

export function AppMockup({ className, activeFeature = "default" }: AppMockupProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#1a1b26] flex w-full aspect-video max-w-[1200px] mx-auto",
        className
      )}
    >
      <div className="w-64 border-r border-white/5 bg-[#16161e] hidden md:flex flex-col">
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
          <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#a9b1d6] hover:bg-[#292e42] transition-colors">
            <Folder className="w-4 h-4 text-[#565f89]" />
            <span className="text-sm font-medium">Torts</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#7aa2f7]/10 text-[#7aa2f7]">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Contracts Overview</span>
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

      <div className="flex-1 flex flex-col min-w-0 bg-[#1a1b26]">
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#1a1b26]">
          <div className="flex items-center gap-4 text-[#a9b1d6] text-sm">
            <span className="opacity-50">Torts</span>
            <span className="opacity-30">/</span>
            <span>Negligence Elements</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#24283b] text-[#7aa2f7] text-xs font-medium border border-[#7aa2f7]/20">
              <span className="w-2 h-2 rounded-full bg-[#9ece6a] animate-pulse"></span>
              Saved
            </div>
            <MoreHorizontal className="w-4 h-4 text-[#565f89]" />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-8 overflow-y-auto w-full max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-[#c0caf5] mb-6">Negligence: Duty of Care</h1>
            <div className="space-y-4 text-[#a9b1d6] leading-relaxed">
              <p>
                <span className="text-[#7aa2f7] font-medium">Duty</span> is the first element of a negligence claim. The plaintiff must show that the defendant owed them a legal duty to act with a certain standard of care.
              </p>
              {activeFeature === 'memorize' ? (
                <div className="p-4 rounded-lg bg-[#24283b] border border-[#7aa2f7]/20">
                  <p className="font-mono text-[#bb9af7] text-sm opacity-80">
                    G... r... i... that a d... owes a d... of c... to all f... p... for any r... f... h... caused by their a...
                  </p>
                  <div className="mt-2 text-xs text-[#565f89] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#e0af68]"></span>
                    Memorize Mode Active
                  </div>
                </div>
              ) : (
                <p>
                  General rule is that a defendant owes a <span className="text-[#bb9af7]">duty of care</span> to all foreseeable plaintiffs for any reasonably foreseeable harm caused by their acts.
                </p>
              )}
              <h2 className="text-xl font-semibold text-[#c0caf5] mt-8 mb-4">Standard of Care</h2>
              <p>
                The default standard is that of a <span className="bg-[#7aa2f7]/10 px-1 rounded text-[#7aa2f7]">reasonably prudent person</span> under similar circumstances.
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-4 text-[#9aa5ce]">
                <li>Objective standard (mental deficiencies usually ignored)</li>
                <li>Physical disabilities are taken into account (blind person standard)</li>
                <li>Superior knowledge raises the standard</li>
              </ul>
            </div>
          </div>

          <div className="w-64 border-l border-white/5 bg-[#16161e]/50 hidden lg:block p-4">
            <div className="text-xs font-semibold text-[#565f89] uppercase tracking-wider mb-4">
              Outline
            </div>
            <div className="space-y-3 text-sm">
              <div className="text-[#7aa2f7] border-l-2 border-[#7aa2f7] pl-3 py-1 bg-[#7aa2f7]/5 rounded-r">
                Duty of Care
              </div>
              <div className="text-[#565f89] hover:text-[#a9b1d6] pl-3.5 transition-colors cursor-pointer">
                General Rule
              </div>
              <div className="text-[#565f89] hover:text-[#a9b1d6] pl-3.5 transition-colors cursor-pointer">
                Foreseeable Plaintiff
              </div>
              <div className="text-[#565f89] hover:text-[#a9b1d6] pl-3 transition-colors cursor-pointer">
                Standard of Care
              </div>
              <div className="text-[#565f89] hover:text-[#a9b1d6] pl-3.5 transition-colors cursor-pointer">
                Reasonable Person
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
