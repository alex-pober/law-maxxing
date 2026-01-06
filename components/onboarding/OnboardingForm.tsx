"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, ArrowRight } from "lucide-react";

interface OnboardingFormProps {
    userId: string;
    initialData: {
        display_name: string;
        username: string;
        school: string;
        avatar_url: string;
    };
}

export function OnboardingForm({ userId, initialData }: OnboardingFormProps) {
    const router = useRouter();
    const [displayName, setDisplayName] = useState(initialData.display_name);
    const [username, setUsername] = useState(initialData.username);
    const [school, setSchool] = useState(initialData.school);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!displayName.trim()) {
            setError("Display name is required");
            return;
        }

        if (!username.trim()) {
            setError("Username is required");
            return;
        }

        setIsSubmitting(true);

        const result = await completeOnboarding({
            display_name: displayName.trim(),
            username: username.trim(),
            school: school.trim() || undefined,
        });

        if (!result.success) {
            setError(result.error || "Failed to save profile");
            setIsSubmitting(false);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar preview */}
            <div className="flex justify-center">
                {initialData.avatar_url ? (
                    <img
                        src={initialData.avatar_url}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-[#7aa2f7]/20 flex items-center justify-center border-2 border-white/10">
                        <User className="w-10 h-10 text-[#7aa2f7]" />
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="displayName">
                    Display Name <span className="text-red-400">*</span>
                </Label>
                <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="bg-white/[0.03] border-white/[0.08] focus:border-[#7aa2f7]/50"
                    required
                />
                <p className="text-xs text-muted-foreground">
                    This is how your name will appear on public notes
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="username">
                    Username <span className="text-red-400">*</span>
                </Label>
                <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username"
                    className="bg-white/[0.03] border-white/[0.08] focus:border-[#7aa2f7]/50"
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Only lowercase letters, numbers, and underscores
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="school">
                    School / University <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                    id="school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Harvard Law School"
                    className="bg-white/[0.03] border-white/[0.08] focus:border-[#7aa2f7]/50"
                />
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#7aa2f7] text-[#1a1b26] hover:bg-[#7aa2f7]/90"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Setting up...
                    </>
                ) : (
                    <>
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                )}
            </Button>
        </form>
    );
}
