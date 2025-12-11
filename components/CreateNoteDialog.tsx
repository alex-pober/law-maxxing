'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createNote } from "@/app/actions"
import { useState } from "react"
import { Plus, FilePlus } from "lucide-react"

interface CreateNoteDialogProps {
    variant?: 'default' | 'icon'
    folderId?: string | null
    trigger?: React.ReactNode
}

export function CreateNoteDialog({ variant = 'default', folderId, trigger }: CreateNoteDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    variant === 'icon' ? (
                        <Button variant="ghost" size="icon" title="Create Note">
                            <FilePlus className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Note
                        </Button>
                    )
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={async (formData) => {
                    if (folderId) {
                        formData.append('folderId', folderId)
                    }
                    await createNote(formData);
                    setOpen(false);
                }}>
                    <DialogHeader>
                        <DialogTitle>Create Note</DialogTitle>
                        <DialogDescription>
                            {folderId ? 'Add a new note to the selected folder.' : 'Add a new note to your collection.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input id="title" name="title" className="col-span-3" required placeholder="e.g. My Note" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input id="description" name="description" className="col-span-3" placeholder="Optional description" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
