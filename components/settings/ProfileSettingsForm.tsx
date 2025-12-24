"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, User } from "lucide-react";

interface Profile {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    school: string | null;
}

interface ProfileSettingsFormProps {
    userId: string;
    initialProfile: Profile;
    userEmail: string;
}

export function ProfileSettingsForm({ userId, initialProfile, userEmail }: ProfileSettingsFormProps) {
    const [displayName, setDisplayName] = useState(initialProfile.display_name || "");
    const [username, setUsername] = useState(initialProfile.username || "");
    const [school, setSchool] = useState(initialProfile.school || "");
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaved(false);

        startTransition(async () => {
            try {
                await updateProfile({
                    display_name: displayName || undefined,
                    username: username || undefined,
                    school: school || undefined,
                });
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to save profile");
            }
        });
    };

    const avatarUrl = initialProfile.avatar_url;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-[#7aa2f7]/20 flex items-center justify-center border-2 border-white/10">
                        <User className="w-8 h-8 text-[#7aa2f7]" />
                    </div>
                )}
                <div>
                    <p className="text-sm text-muted-foreground">
                        Profile picture is synced from your login provider
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="bg-white/[0.03] border-white/[0.08] focus:border-[#7aa2f7]/50"
                />
                <p className="text-xs text-muted-foreground">
                    This is the name that will be displayed on your public notes
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username"
                    className="bg-white/[0.03] border-white/[0.08] focus:border-[#7aa2f7]/50"
                />
                <p className="text-xs text-muted-foreground">
                    Only lowercase letters, numbers, and underscores. This may be used for your public profile URL.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="school">School / University</Label>
                <Input
                    id="school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Harvard Law School"
                    className="bg-white/[0.03] border-white/[0.08] focus:border-[#7aa2f7]/50"
                />
                <p className="text-xs text-muted-foreground">
                    Your school or university name will be shown on your public notes
                </p>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="flex items-center gap-3">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#7aa2f7] text-[#1a1b26] hover:bg-[#7aa2f7]/90"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
                {saved && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                        <Check className="w-4 h-4" />
                        Saved
                    </span>
                )}
            </div>
        </form>
    );
}
