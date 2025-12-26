'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileAudio, Loader2, ArrowLeft, Sparkles } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { parseVttContent } from '@/lib/vtt-parser'
import { generateNotesFromVtt, saveGeneratedNotes } from '@/app/actions'

interface VttConvertDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    targetFolderId: string | null
}

type Step = 'upload' | 'preview'

export function VttConvertDialog({ open, onOpenChange, targetFolderId }: VttConvertDialogProps) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [step, setStep] = useState<Step>('upload')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [fileContent, setFileContent] = useState<string>('')
    const [parsedTranscript, setParsedTranscript] = useState<string>('')
    const [noteTitle, setNoteTitle] = useState<string>('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            await processFile(file)
        }
    }

    const processFile = async (file: File) => {
        if (!file.name.endsWith('.vtt')) {
            setError('Please select a .vtt file')
            return
        }

        setSelectedFile(file)
        setError(null)

        // Read and parse the file
        const content = await file.text()
        setFileContent(content)

        // Parse the VTT content
        const parsed = parseVttContent(content)
        setParsedTranscript(parsed)

        // Generate title from filename
        const baseTitle = file.name.replace(/\.vtt$/i, '')
        const title = baseTitle
            .replace(/[_-]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, c => c.toUpperCase())
        setNoteTitle(title)

        // Move to preview step
        setStep('preview')
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            await processFile(file)
        }
    }

    const handleGenerateNotes = async () => {
        if (!selectedFile || !parsedTranscript) return

        setIsGenerating(true)
        setError(null)

        try {
            const result = await generateNotesFromVtt(fileContent, selectedFile.name)

            // Save the generated notes
            const saveResult = await saveGeneratedNotes(
                result.markdown,
                noteTitle,
                selectedFile.name,
                targetFolderId
            )

            resetAndClose()
            router.push(`/notes/${saveResult.noteId}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate notes')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleBack = () => {
        setStep('upload')
        setSelectedFile(null)
        setFileContent('')
        setParsedTranscript('')
        setNoteTitle('')
        setError(null)
    }

    const resetAndClose = () => {
        setStep('upload')
        setSelectedFile(null)
        setFileContent('')
        setParsedTranscript('')
        setNoteTitle('')
        setError(null)
        onOpenChange(false)
    }

    const handleClose = () => {
        if (!isGenerating) {
            resetAndClose()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={step === 'preview' ? 'max-w-4xl max-h-[90vh]' : ''}>
                <DialogHeader>
                    <DialogTitle>
                        {step === 'upload' ? 'Import VTT Transcript' : 'Preview Parsed Transcript'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'upload'
                            ? 'Upload a .vtt transcript file to convert into study notes.'
                            : 'Review the parsed transcript before generating notes with AI.'}
                    </DialogDescription>
                </DialogHeader>

                {step === 'upload' ? (
                    <>
                        <div
                            className={`
                                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                                transition-colors duration-200
                                ${isDragOver ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                                ${selectedFile ? 'bg-accent/50' : ''}
                            `}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".vtt"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <div className="flex flex-col items-center gap-2">
                                <Upload className="h-10 w-10 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Drag and drop a .vtt file here, or click to browse
                                </p>
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <FileAudio className="h-8 w-8 text-primary shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{selectedFile?.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {parsedTranscript.length.toLocaleString()} characters parsed
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Note Title</label>
                                <Input
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    placeholder="Enter note title..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Parsed Transcript Preview</label>
                                <ScrollArea className="h-[350px] rounded-md border bg-muted/30">
                                    <pre className="p-4 text-sm whitespace-pre-wrap font-mono">
                                        {parsedTranscript}
                                    </pre>
                                </ScrollArea>
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <DialogFooter className="flex justify-between sm:justify-between">
                            <Button variant="outline" onClick={handleBack} disabled={isGenerating}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleGenerateNotes}
                                    disabled={isGenerating || !noteTitle.trim() || !parsedTranscript}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Generate Notes with AI
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
