"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteAccountSection() {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmText, setConfirmText] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        setError(null);
        setIsDeleting(true);

        const result = await deleteAccount();

        if (!result.success) {
            setError(result.error || "Failed to delete account");
            setIsDeleting(false);
            return;
        }

        // Sign out on client side and redirect
        const supabase = createClient();
        await supabase.auth.signOut();

        router.push("/");
        router.refresh();
    };

    const isConfirmed = confirmText === "DELETE";

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. All your notes,
                folders, and profile data will be permanently deleted.
            </p>

            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <AlertDialog open={isOpen} onOpenChange={(open) => !isDeleting && setIsOpen(open)}>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="destructive"
                        className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#1a1b26] border-white/[0.08]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            This action cannot be undone. This will permanently delete your
                            account and remove all your data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>All your notes</li>
                        <li>All your folders</li>
                        <li>Your profile information</li>
                    </ul>
                    <div className="py-4">
                        <label className="text-sm text-muted-foreground">
                            Type <span className="font-mono text-white">DELETE</span> to confirm
                        </label>
                        <Input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="DELETE"
                            disabled={isDeleting}
                            className="mt-2 bg-white/[0.03] border-white/[0.08] focus:border-red-500/50"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-white/[0.03] border-white/[0.08] text-white hover:bg-white/[0.06]"
                            onClick={() => setConfirmText("")}
                            disabled={isDeleting}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            onClick={handleDelete}
                            disabled={!isConfirmed || isDeleting}
                            className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Account"
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
