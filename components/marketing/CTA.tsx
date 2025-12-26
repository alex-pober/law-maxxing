"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    ArrowRight,
    Download,
    FileText,
    CheckSquare,
    FolderArchive,
    Sparkles,
    Brain,
    MessageSquare,
    Zap,
    FileCode,
    Check,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockNotes = [
    { id: "1", title: "Torts - Negligence", selected: true },
    { id: "2", title: "Torts - Strict Liability", selected: true },
    { id: "3", title: "Torts - Intentional Torts", selected: true },
    { id: "4", title: "Contracts - Formation", selected: false },
    { id: "5", title: "Contracts - Consideration", selected: false },
];

const markdownPreview = `# Torts - Negligence

> Complete breakdown of duty, breach, causation, damages

---

## Elements of Negligence

A plaintiff must prove **four elements**:

1. **Duty** - Defendant owed a legal duty
2. **Breach** - Defendant breached that duty
3. **Causation** - Breach caused harm
4. **Damages** - Actual damages occurred

### ⚖️ Black Letter Law

The standard of care is that of a
**reasonably prudent person** under
similar circumstances.`;

const llmTools = [
    {
        name: "Google NotebookLM",
        description: "Upload your notes and generate study podcasts, FAQs, and summaries",
        icon: "🎧",
        color: "#4285f4",
    },
    {
        name: "ChatGPT",
        description: "Ask questions about your outlines and get instant explanations",
        icon: "💬",
        color: "#10a37f",
    },
    {
        name: "Claude",
        description: "Build comprehensive outlines by combining multiple note files",
        icon: "🧠",
        color: "#bb9af7",
    },
];

export function CTA() {
    const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set(["1", "2", "3"]));
    const [downloadStep, setDownloadStep] = useState<0 | 1 | 2>(0);

    const toggleNote = (id: string) => {
        setSelectedNotes(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const simulateDownload = () => {
        setDownloadStep(1);
        setTimeout(() => setDownloadStep(2), 1500);
        setTimeout(() => setDownloadStep(0), 4000);
    };

    return (
        <section className="py-24 relative overflow-hidden bg-[#16161e]">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[#7aa2f7] opacity-[0.02]" />
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#7aa2f7] blur-[150px] rounded-full opacity-10 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#bb9af7] blur-[120px] rounded-full opacity-10 pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10 mx-auto">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#7aa2f7]/10 text-[#7aa2f7] text-sm font-medium border border-[#7aa2f7]/20 mb-4">
                        <Download className="w-4 h-4 mr-2" />
                        Export to Markdown
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Your Notes, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7]">AI-Ready</span>
                    </h2>
                    <p className="text-[#a9b1d6] text-lg">
                        Download your notes as Markdown files — the universal format that LLMs understand best.
                        Then supercharge your studying with any AI tool.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
                    {/* Left: Download Demo */}
                    <div className="rounded-2xl border border-white/10 bg-[#1a1b26] overflow-hidden">
                        {/* Header Bar */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#16161e]">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 text-[#7aa2f7]" />
                                <span className="text-sm text-white font-medium">Select & Export</span>
                            </div>
                            <span className="text-xs text-[#565f89]">
                                {selectedNotes.size} selected
                            </span>
                        </div>

                        {/* Notes List */}
                        <div className="p-4 space-y-2">
                            {mockNotes.map((note) => (
                                <button
                                    key={note.id}
                                    onClick={() => toggleNote(note.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                                        selectedNotes.has(note.id)
                                            ? "bg-[#7aa2f7]/10 border border-[#7aa2f7]/30"
                                            : "bg-white/[0.02] border border-white/5 hover:bg-white/5"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                        selectedNotes.has(note.id)
                                            ? "bg-[#7aa2f7] border-[#7aa2f7]"
                                            : "border-[#565f89]"
                                    )}>
                                        {selectedNotes.has(note.id) && (
                                            <Check className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                    <FileText className={cn(
                                        "w-4 h-4",
                                        selectedNotes.has(note.id) ? "text-[#7aa2f7]" : "text-[#565f89]"
                                    )} />
                                    <span className={cn(
                                        "text-sm",
                                        selectedNotes.has(note.id) ? "text-white" : "text-[#a9b1d6]"
                                    )}>
                                        {note.title}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Download Button */}
                        <div className="p-4 border-t border-white/5">
                            <button
                                onClick={simulateDownload}
                                disabled={selectedNotes.size === 0 || downloadStep !== 0}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
                                    downloadStep === 0
                                        ? "bg-[#7aa2f7] text-[#1a1b26] hover:bg-[#7aa2f7]/90"
                                        : downloadStep === 1
                                            ? "bg-[#e0af68] text-[#1a1b26]"
                                            : "bg-[#9ece6a] text-[#1a1b26]"
                                )}
                            >
                                {downloadStep === 0 && (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Download as Markdown
                                    </>
                                )}
                                {downloadStep === 1 && (
                                    <>
                                        <FolderArchive className="w-4 h-4 animate-pulse" />
                                        Creating ZIP...
                                    </>
                                )}
                                {downloadStep === 2 && (
                                    <>
                                        <Check className="w-4 h-4" />
                                        notes-2024-12-25.zip Downloaded!
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-[#565f89] text-center mt-2">
                                {selectedNotes.size === 1
                                    ? "Single file downloads as .md"
                                    : "Multiple files bundled as .zip"
                                }
                            </p>
                        </div>
                    </div>

                    {/* Right: Markdown Preview */}
                    <div className="rounded-2xl border border-white/10 bg-[#1a1b26] overflow-hidden">
                        {/* Header Bar */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#16161e]">
                            <div className="flex items-center gap-2">
                                <FileCode className="w-4 h-4 text-[#9ece6a]" />
                                <span className="text-sm text-white font-medium">torts-negligence.md</span>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded bg-[#9ece6a]/10 text-[#9ece6a]">
                                Markdown
                            </span>
                        </div>

                        {/* Markdown Content */}
                        <div className="p-4 font-mono text-xs text-[#a9b1d6] leading-relaxed max-h-[320px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap">{markdownPreview}</pre>
                        </div>

                        {/* Why Markdown */}
                        <div className="p-4 border-t border-white/5 bg-[#16161e]/50">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#bb9af7]/10 flex items-center justify-center shrink-0">
                                    <Brain className="w-4 h-4 text-[#bb9af7]" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-white mb-1">Why Markdown?</h4>
                                    <p className="text-xs text-[#a9b1d6] leading-relaxed">
                                        Markdown is plain text with simple formatting. LLMs can read it perfectly — no parsing errors, no lost formatting. It&apos;s the ideal format for AI-powered study sessions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LLM Integration Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Use your notes with any AI
                        </h3>
                        <p className="text-[#a9b1d6]">
                            Upload your markdown files and let AI help you study smarter
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-12">
                        {llmTools.map((tool) => (
                            <div
                                key={tool.name}
                                className="p-5 rounded-xl bg-[#1a1b26] border border-white/5 hover:border-white/20 transition-all group"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">{tool.icon}</span>
                                    <h4 className="font-semibold text-white">{tool.name}</h4>
                                </div>
                                <p className="text-sm text-[#a9b1d6] leading-relaxed">
                                    {tool.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Use Cases */}
                    <div className="grid md:grid-cols-2 gap-4 mb-12">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-[#1a1b26] border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-[#7aa2f7]/10 flex items-center justify-center shrink-0">
                                <MessageSquare className="w-5 h-5 text-[#7aa2f7]" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Quiz Yourself</h4>
                                <p className="text-sm text-[#a9b1d6]">
                                    &quot;Based on my notes, ask me 10 practice questions about negligence elements&quot;
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-[#1a1b26] border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-[#9ece6a]/10 flex items-center justify-center shrink-0">
                                <Zap className="w-5 h-5 text-[#9ece6a]" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Build Master Outlines</h4>
                                <p className="text-sm text-[#a9b1d6]">
                                    &quot;Combine these 5 note files into one comprehensive exam outline&quot;
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-[#1a1b26] border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-[#bb9af7]/10 flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5 text-[#bb9af7]" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Generate Flashcards</h4>
                                <p className="text-sm text-[#a9b1d6]">
                                    &quot;Create Anki flashcards from the black letter law rules in these notes&quot;
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-[#1a1b26] border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-[#e0af68]/10 flex items-center justify-center shrink-0">
                                <Brain className="w-5 h-5 text-[#e0af68]" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Explain Concepts</h4>
                                <p className="text-sm text-[#a9b1d6]">
                                    &quot;Explain proximate cause like I&apos;m a 1L who just bombed the midterm&quot;
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center max-w-2xl mx-auto pt-8 border-t border-white/5">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        I think this is enough convincing.
                    </h3>
                    <p className="text-[#a9b1d6] mb-8">
                        I made this for myself — if you use this or not, I could care less.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="bg-[#7aa2f7] hover:bg-[#7aa2f7]/90 text-[#1a1b26] font-semibold h-12 px-8 text-base">
                            <Link href="/login">
                                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-[#565f89] text-[#c0caf5] hover:bg-[#24283b] hover:text-white h-12 px-8 text-base bg-transparent">
                            <Link href="/explore">
                                Explore Notes <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
