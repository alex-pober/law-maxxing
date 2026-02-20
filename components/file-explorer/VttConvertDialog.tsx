'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileAudio, ArrowLeft, Sparkles, Check, Circle, Loader2, Bot } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { parseVttContent } from '@/lib/vtt-parser'
import { generateNotesFromVtt, saveGeneratedNotes } from '@/app/actions'

interface VttConvertDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    targetFolderId: string | null
}

type Step = 'upload' | 'preview' | 'generating'

const AI_MODEL = 'gemini-3.1-pro-preview'

type GenStep = {
    id: number
    label: string
    description: string
    status: 'pending' | 'active' | 'complete' | 'error'
}

const initialGenSteps: GenStep[] = [
    { id: 1, label: 'Transcript parsed', description: 'VTT cleaned and ready', status: 'complete' },
    { id: 2, label: 'Sending to Gemini AI', description: 'Uploading transcript for analysis', status: 'pending' },
    { id: 3, label: 'Generating study notes', description: 'AI structuring your notes', status: 'pending' },
    { id: 4, label: 'Saving to library', description: 'Writing notes to your account', status: 'pending' },
]

export function VttConvertDialog({ open, onOpenChange, targetFolderId }: VttConvertDialogProps) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [step, setStep] = useState<Step>('upload')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [fileContent, setFileContent] = useState<string>('')
    const [parsedTranscript, setParsedTranscript] = useState<string>('')
    const [noteTitle, setNoteTitle] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [genSteps, setGenSteps] = useState<GenStep[]>(initialGenSteps)

    const updateGenStep = (id: number, status: GenStep['status']) => {
        setGenSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) await processFile(file)
    }

    const processFile = async (file: File) => {
        if (!file.name.endsWith('.vtt')) {
            setError('Please select a .vtt file')
            return
        }

        setSelectedFile(file)
        setError(null)

        const content = await file.text()
        setFileContent(content)

        const parsed = parseVttContent(content)
        setParsedTranscript(parsed)

        const baseTitle = file.name.replace(/\.vtt$/i, '')
        const title = baseTitle
            .replace(/[_-]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, c => c.toUpperCase())
        setNoteTitle(title)

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
        if (file) await processFile(file)
    }

    const handleGenerateNotes = async () => {
        if (!selectedFile || !parsedTranscript) return

        setError(null)
        setGenSteps(initialGenSteps)
        setStep('generating')

        let currentStepId = 1

        try {
            // Step 2: Send to AI
            currentStepId = 2
            updateGenStep(2, 'active')
            const result = await generateNotesFromVtt(fileContent, selectedFile.name)
            updateGenStep(2, 'complete')

            // Step 3: Generating (visual beat)
            currentStepId = 3
            updateGenStep(3, 'active')
            await new Promise(res => setTimeout(res, 400))
            updateGenStep(3, 'complete')

            // Step 4: Save
            currentStepId = 4
            updateGenStep(4, 'active')
            const saveResult = await saveGeneratedNotes(
                result.markdown,
                noteTitle,
                selectedFile.name,
                targetFolderId
            )
            updateGenStep(4, 'complete')

            await new Promise(res => setTimeout(res, 500))
            resetAndClose()
            router.push(`/notes/${saveResult.noteId}`)
        } catch (err) {
            updateGenStep(currentStepId, 'error')
            setError(err instanceof Error ? err.message : 'Failed to generate notes')
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
        setGenSteps(initialGenSteps)
        onOpenChange(false)
    }

    const handleClose = () => {
        if (step !== 'generating') resetAndClose()
    }

    const isGenerating = step === 'generating'

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={step === 'preview' ? 'max-w-4xl max-h-[90vh]' : ''}>
                <DialogHeader>
                    <DialogTitle>
                        {step === 'upload' && 'Import VTT Transcript'}
                        {step === 'preview' && 'Preview Parsed Transcript'}
                        {step === 'generating' && 'Generating Your Notes'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'upload' && 'Upload a .vtt transcript file to convert into study notes.'}
                        {step === 'preview' && 'Review the parsed transcript before generating notes with AI.'}
                        {step === 'generating' && 'Please wait while AI processes your transcript.'}
                    </DialogDescription>
                </DialogHeader>

                {step === 'upload' && (
                    <>
                        <div
                            className={`
                                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                                transition-colors duration-200
                                ${isDragOver ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
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

                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                        </DialogFooter>
                    </>
                )}

                {step === 'preview' && (
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

                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <DialogFooter className="flex justify-between sm:justify-between">
                            <Button variant="outline" onClick={handleBack}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                                <Button
                                    onClick={handleGenerateNotes}
                                    disabled={!noteTitle.trim() || !parsedTranscript}
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate Notes with AI
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                )}

                {step === 'generating' && (
                    <div className="space-y-6 py-2">
                        {/* File + Model info */}
                        <div className="rounded-lg border bg-muted/30 px-4 py-3 space-y-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <FileAudio className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-sm font-medium truncate">{selectedFile?.name}</span>
                            </div>
                            <Badge variant="secondary" className="flex items-center gap-1.5 w-fit">
                                <Bot className="h-3 w-3" />
                                {AI_MODEL}
                            </Badge>
                        </div>

                        {/* Steps */}
                        <div className="space-y-1">
                            {genSteps.map((s, i) => {
                                const isActive = s.status === 'active'
                                const isDone = s.status === 'complete'
                                const isError = s.status === 'error'
                                const isPending = s.status === 'pending'

                                return (
                                    <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg transition-colors duration-300">
                                        {/* Icon */}
                                        <div className="mt-0.5 shrink-0">
                                            {isDone && (
                                                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-primary-foreground" />
                                                </div>
                                            )}
                                            {isActive && (
                                                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                            )}
                                            {isError && (
                                                <div className="h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
                                                    <span className="text-[10px] text-destructive-foreground font-bold">!</span>
                                                </div>
                                            )}
                                            {isPending && (
                                                <Circle className="h-5 w-5 text-muted-foreground/40" />
                                            )}
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium leading-none ${
                                                isDone ? 'text-foreground' :
                                                isActive ? 'text-foreground' :
                                                isError ? 'text-destructive' :
                                                'text-muted-foreground'
                                            }`}>
                                                {s.label}
                                            </p>
                                            <p className={`text-xs mt-1 ${
                                                isActive ? 'text-muted-foreground' : 'text-muted-foreground/60'
                                            }`}>
                                                {s.description}
                                            </p>
                                        </div>

                                        {/* Connector line (not for last) */}
                                    </div>
                                )
                            })}
                        </div>

                        {error && (
                            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
                                <p className="text-sm text-destructive">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => {
                                        setGenSteps(initialGenSteps)
                                        setStep('preview')
                                        setError(null)
                                    }}
                                >
                                    <ArrowLeft className="h-3 w-3 mr-1.5" />
                                    Go back and retry
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
