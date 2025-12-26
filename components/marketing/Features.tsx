"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    FileAudio,
    Upload,
    Sparkles,
    FileText,
    ArrowRight,
    CheckCircle2,
    BookOpen,
    Lightbulb,
    Scale,
    AlertTriangle,
    Play,
    ChevronRight
} from "lucide-react";

const vttPreview = `WEBVTT

00:00:01.000 --> 00:00:05.230
So today we're going to talk about
negligence, which is probably one of the
most tested areas on your torts exam.

00:00:05.500 --> 00:00:12.100
There are four elements you need to
establish for a negligence claim.
Duty, breach, causation, and damages.

00:00:12.400 --> 00:00:18.800
Let me repeat that because this will
definitely be on the final...`;

const parsedTranscript = `So today we're going to talk about negligence, which is probably one of the most tested areas on your torts exam.

There are four elements you need to establish for a negligence claim. Duty, breach, causation, and damages.

Let me repeat that because this will definitely be on the final...`;

export function Features() {
    const [activeStep, setActiveStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleStepClick = (step: number) => {
        if (step === activeStep) return;
        setIsAnimating(true);
        setActiveStep(step);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const steps = [
        {
            number: 1,
            title: "Upload Your VTT",
            description: "Drag and drop your Zoom lecture transcript",
            icon: Upload,
            color: "#7aa2f7"
        },
        {
            number: 2,
            title: "AI Processing",
            description: "We extract and structure your lecture content",
            icon: Sparkles,
            color: "#bb9af7"
        },
        {
            number: 3,
            title: "Study Notes Ready",
            description: "Get organized, exam-ready study notes",
            icon: FileText,
            color: "#9ece6a"
        }
    ];

    return (
        <section id="features" className="py-24 bg-[#16161e] relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] blur-[120px] rounded-full" />
            </div>

            <div className="container px-4 md:px-6 relative z-10 mx-auto">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#bb9af7]/10 text-[#bb9af7] text-sm font-medium border border-[#bb9af7]/20 mb-4">
                        <FileAudio className="w-4 h-4 mr-2" />
                        VTT Transcript Import
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">
                        Zoom Lectures → <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7]">Study Notes</span>
                    </h2>
                    <p className="text-[#a9b1d6] text-lg">
                        Turn hours of recorded lectures into organized, exam-ready notes in seconds.
                        Just upload your .vtt transcript file.
                    </p>
                </div>

                {/* Step Indicators */}
                <div className="flex justify-center gap-4 md:gap-8 mb-12">
                    {steps.map((step, index) => (
                        <button
                            key={step.number}
                            onClick={() => handleStepClick(index)}
                            className={cn(
                                "flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 rounded-xl transition-all duration-300",
                                activeStep === index
                                    ? "bg-[#24283b] border-2"
                                    : "bg-[#1a1b26] border border-white/5 hover:border-white/20"
                            )}
                            style={{
                                borderColor: activeStep === index ? step.color : undefined
                            }}
                        >
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                    activeStep === index ? "scale-110" : "opacity-60"
                                )}
                                style={{
                                    backgroundColor: activeStep === index ? `${step.color}20` : "#24283b"
                                }}
                            >
                                <step.icon
                                    className="w-4 h-4"
                                    style={{ color: activeStep === index ? step.color : "#565f89" }}
                                />
                            </div>
                            <div className="text-left hidden sm:block">
                                <div className="text-xs text-[#565f89]">Step {step.number}</div>
                                <div className={cn(
                                    "text-sm font-medium transition-colors",
                                    activeStep === index ? "text-white" : "text-[#a9b1d6]"
                                )}>
                                    {step.title}
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <ChevronRight className="w-4 h-4 text-[#565f89] hidden md:block ml-2" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Visual Area */}
                <div className="max-w-5xl mx-auto">
                    <div className={cn(
                        "relative rounded-2xl border border-white/10 bg-[#1a1b26] overflow-hidden shadow-2xl",
                        "transition-all duration-300",
                        isAnimating && "opacity-90 scale-[0.99]"
                    )}>
                        {/* Window Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#16161e]">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#f7768e]" />
                                <div className="w-3 h-3 rounded-full bg-[#e0af68]" />
                                <div className="w-3 h-3 rounded-full bg-[#9ece6a]" />
                            </div>
                            <div className="text-xs text-[#565f89]">
                                {steps[activeStep].title}
                            </div>
                            <div className="w-16" />
                        </div>

                        {/* Content Area */}
                        <div className="p-6 md:p-8 min-h-[400px]">
                            {activeStep === 0 && (
                                <div className="space-y-6">
                                    {/* Upload Zone */}
                                    <div className="border-2 border-dashed border-[#7aa2f7]/40 rounded-xl p-8 text-center bg-[#7aa2f7]/5 hover:bg-[#7aa2f7]/10 transition-colors cursor-pointer">
                                        <div className="w-16 h-16 rounded-full bg-[#7aa2f7]/20 flex items-center justify-center mx-auto mb-4">
                                            <Upload className="w-8 h-8 text-[#7aa2f7]" />
                                        </div>
                                        <p className="text-white font-medium mb-2">Drop your .vtt file here</p>
                                        <p className="text-[#565f89] text-sm">or click to browse</p>
                                    </div>

                                    {/* VTT Preview */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-[#a9b1d6]">
                                            <FileAudio className="w-4 h-4 text-[#7aa2f7]" />
                                            <span>contracts_lecture_12.vtt</span>
                                            <span className="text-[#565f89]">• 45.2 KB</span>
                                        </div>
                                        <div className="bg-[#16161e] rounded-lg p-4 font-mono text-xs text-[#a9b1d6] max-h-[180px] overflow-y-auto">
                                            <pre className="whitespace-pre-wrap">{vttPreview}</pre>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeStep === 1 && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Before - Raw VTT */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <FileAudio className="w-4 h-4 text-[#565f89]" />
                                            <span className="text-[#a9b1d6]">Raw Transcript</span>
                                        </div>
                                        <div className="bg-[#16161e] rounded-lg p-4 font-mono text-xs text-[#565f89] h-[280px] overflow-y-auto relative">
                                            <pre className="whitespace-pre-wrap line-through opacity-50">{vttPreview}</pre>
                                            <div className="absolute inset-0 flex items-center justify-center bg-[#16161e]/80">
                                                <div className="text-center">
                                                    <div className="w-12 h-12 rounded-full bg-[#bb9af7]/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
                                                        <Sparkles className="w-6 h-6 text-[#bb9af7]" />
                                                    </div>
                                                    <p className="text-[#bb9af7] text-sm font-medium">Processing with AI...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* After - Parsed */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-[#9ece6a]" />
                                            <span className="text-[#a9b1d6]">Cleaned Content</span>
                                        </div>
                                        <div className="bg-[#16161e] rounded-lg p-4 text-sm text-[#c0caf5] h-[280px] overflow-y-auto leading-relaxed">
                                            {parsedTranscript}
                                        </div>
                                    </div>

                                    {/* Processing info */}
                                    <div className="md:col-span-2 flex items-center justify-center gap-6 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-[#565f89]">
                                            <div className="w-2 h-2 rounded-full bg-[#9ece6a] animate-pulse" />
                                            Removing timestamps
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-[#565f89]">
                                            <div className="w-2 h-2 rounded-full bg-[#9ece6a] animate-pulse" />
                                            Extracting dialogue
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-[#565f89]">
                                            <div className="w-2 h-2 rounded-full bg-[#bb9af7] animate-pulse" />
                                            Generating structure
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeStep === 2 && (
                                <div className="space-y-4">
                                    {/* Generated Notes Preview */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-[#9ece6a]" />
                                            <span className="text-white font-medium">Contracts Lecture 12 - Notes</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9ece6a]/10 text-[#9ece6a] text-xs font-medium border border-[#9ece6a]/20">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Generated
                                        </div>
                                    </div>

                                    {/* Notes Content */}
                                    <div className="bg-[#16161e] rounded-lg p-6 prose prose-invert max-w-none">
                                        <div className="space-y-4 text-sm">
                                            <h2 className="text-lg font-bold text-white mt-0">Negligence Overview</h2>
                                            <p className="text-[#a9b1d6]">
                                                Negligence is one of the <span className="text-white font-semibold">most tested areas</span> on torts exams.
                                            </p>

                                            <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-[#7aa2f7]" />
                                                Four Elements of Negligence
                                            </h3>
                                            <p className="text-[#a9b1d6] text-sm">
                                                A plaintiff must prove all four elements to establish a negligence claim:
                                            </p>
                                            <ol className="list-decimal list-inside space-y-1 text-[#a9b1d6]">
                                                <li><span className="text-white font-medium">Duty</span> - Defendant owed plaintiff a legal duty of care</li>
                                                <li><span className="text-white font-medium">Breach</span> - Defendant breached that duty</li>
                                                <li><span className="text-white font-medium">Causation</span> - Breach caused plaintiff&apos;s harm</li>
                                                <li><span className="text-white font-medium">Damages</span> - Plaintiff suffered actual damages</li>
                                            </ol>

                                            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#e0af68]/10 border border-[#e0af68]/20">
                                                <AlertTriangle className="w-5 h-5 text-[#e0af68] shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[#e0af68] font-medium text-sm">Exam Alert</p>
                                                    <p className="text-[#a9b1d6] text-xs italic">&quot;This will definitely be on the final&quot; — Professor emphasis</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#7aa2f7]/10 border border-[#7aa2f7]/20">
                                                <Scale className="w-5 h-5 text-[#7aa2f7] shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[#7aa2f7] font-medium text-sm">Black Letter Law</p>
                                                    <p className="text-[#a9b1d6] text-xs">To establish negligence, plaintiff must prove existence of duty, breach of standard of care, actual and proximate causation, and compensable damages.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom Action Bar */}
                        <div className="px-6 py-4 border-t border-white/5 bg-[#16161e] flex items-center justify-between">
                            <div className="text-xs text-[#565f89]">
                                {activeStep === 0 && "Supports .vtt files from Zoom, Teams, and more"}
                                {activeStep === 1 && "Powered by AI trained on legal education content"}
                                {activeStep === 2 && "Notes saved to your library automatically"}
                            </div>
                            {activeStep < 2 && (
                                <button
                                    onClick={() => handleStepClick(activeStep + 1)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7aa2f7] text-[#1a1b26] text-sm font-medium hover:bg-[#7aa2f7]/90 transition-colors"
                                >
                                    {activeStep === 0 ? "Generate Notes" : "View Result"}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                            {activeStep === 2 && (
                                <button
                                    onClick={() => handleStepClick(0)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#24283b] text-[#a9b1d6] text-sm font-medium hover:bg-[#292e42] transition-colors border border-white/10"
                                >
                                    <Play className="w-4 h-4" />
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
                    <FeatureCard
                        icon={<Sparkles className="w-6 h-6 text-[#bb9af7]" />}
                        title="AI-Powered Extraction"
                        description="Our AI identifies key concepts, legal rules, and professor emphasis points automatically."
                    />
                    <FeatureCard
                        icon={<BookOpen className="w-6 h-6 text-[#7aa2f7]" />}
                        title="Law School Optimized"
                        description="Notes are structured with proper legal formatting, case citations, and rule statements."
                    />
                    <FeatureCard
                        icon={<Lightbulb className="w-6 h-6 text-[#e0af68]" />}
                        title="Exam Alerts Highlighted"
                        description="We detect when professors emphasize exam topics and highlight them for you."
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
