"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { savePublicNote } from "@/app/actions";

interface SaveNoteButtonProps {
    noteId: string;
    isOwnNote: boolean;
    isAuthenticated: boolean;
}

export function SaveNoteButton({ noteId, isOwnNote, isAuthenticated }: SaveNoteButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        if (isOwnNote) {
            setError("You already own this note");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await savePublicNote(noteId);
            setIsSaved(true);

            setTimeout(() => {
                router.push(`/notes/${result.noteId}`);
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save note");
            setIsLoading(false);
        }
    };

    if (isOwnNote) {
        return null;
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <Button
                onClick={handleSave}
                disabled={isLoading || isSaved}
                className={`gap-2 ${
                    isSaved
                        ? "bg-green-600 hover:bg-green-600"
                        : "bg-[#7aa2f7] hover:bg-[#7aa2f7]/90"
                } text-white`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                    </>
                ) : isSaved ? (
                    <>
                        <Check className="w-4 h-4" />
                        Saved!
                    </>
                ) : (
                    <>
                        <Download className="w-4 h-4" />
                        {isAuthenticated ? "Save to My Notes" : "Sign in to Save"}
                    </>
                )}
            </Button>
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
}
