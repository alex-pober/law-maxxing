'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileImage, Loader2, Sparkles, Bot, FileText, Wand2, Save } from 'lucide-react'
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
import { generateNotesFromPpt, saveGeneratedNotes } from '@/app/actions'

type ProcessingStep = 'idle' | 'converting' | 'uploading' | 'analyzing' | 'saving'

const STEP_CONFIG: Record<ProcessingStep, { label: string; icon: React.ElementType; messages: string[] }> = {
    idle: { label: '', icon: Loader2, messages: [] },
    converting: {
        label: 'Converting PowerPoint to PDF...',
        icon: FileText,
        messages: [
            'Preparing your slides for analysis...',
            'Converting those beautiful slides...',
            'Making your PowerPoint AI-readable...',
            'Transforming slides into magic...',
        ]
    },
    uploading: {
        label: 'Uploading to AI...',
        icon: Upload,
        messages: [
            'Sending your slides to our AI friends...',
            'Uploading to the cloud...',
            'Beaming your content to AI robots...',
        ]
    },
    analyzing: {
        label: 'AI is reading your slides...',
        icon: Bot,
        messages: [
            'AI robots are studying your slides...',
            'Extracting the important stuff...',
            'Finding the key concepts...',
            'Organizing your notes perfectly...',
            'Almost there, creating awesome notes...',
            'The AI is working hard for you...',
            'Turning slides into study gold...',
        ]
    },
    saving: {
        label: 'Saving your notes...',
        icon: Save,
        messages: [
            'Saving your freshly generated notes...',
            'Almost done!',
        ]
    }
}

interface PptConvertDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    targetFolderId: string | null
}

export function PptConvertDialog({ open, onOpenChange, targetFolderId }: PptConvertDialogProps) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [noteTitle, setNoteTitle] = useState<string>('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle')
    const [currentMessage, setCurrentMessage] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    // Rotate through fun messages while processing
    useEffect(() => {
        if (processingStep === 'idle') return

        const messages = STEP_CONFIG[processingStep].messages
        if (messages.length === 0) return

        setCurrentMessage(messages[0])
        let index = 0

        const interval = setInterval(() => {
            index = (index + 1) % messages.length
            setCurrentMessage(messages[index])
        }, 3000)

        return () => clearInterval(interval)
    }, [processingStep])

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            processFile(file)
        }
    }

    const processFile = (file: File) => {
        const validExtensions = ['.ppt', '.pptx']
        const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))

        if (!validExtensions.includes(fileExtension)) {
            setError('Please select a .ppt or .pptx file')
            return
        }

        setSelectedFile(file)
        setError(null)

        // Generate title from filename
        const baseTitle = file.name.replace(/\.(pptx?|PPTX?)$/i, '')
        const title = baseTitle
            .replace(/[_-]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, c => c.toUpperCase())
        setNoteTitle(title)
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
            processFile(file)
        }
    }

    const handleGenerateNotes = async () => {
        if (!selectedFile) return

        setIsGenerating(true)
        setError(null)
        setProcessingStep('converting')

        try {
            // Create FormData to send file to server action
            const formData = new FormData()
            formData.append('file', selectedFile)

            // Simulate step progression (actual steps happen server-side)
            // We'll move through steps on a timer since we can't get real-time updates from server actions
            const stepTimer = setTimeout(() => setProcessingStep('uploading'), 5000)
            const stepTimer2 = setTimeout(() => setProcessingStep('analyzing'), 12000)

            const result = await generateNotesFromPpt(formData)

            clearTimeout(stepTimer)
            clearTimeout(stepTimer2)
            setProcessingStep('saving')

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
            setProcessingStep('idle')
        } finally {
            setIsGenerating(false)
        }
    }

    const resetAndClose = () => {
        setSelectedFile(null)
        setNoteTitle('')
        setError(null)
        setProcessingStep('idle')
        setCurrentMessage('')
        onOpenChange(false)
    }

    const handleClose = () => {
        if (!isGenerating) {
            resetAndClose()
        }
    }

    const StepIcon = processingStep !== 'idle' ? STEP_CONFIG[processingStep].icon : Loader2

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={isGenerating ? 'sm:max-w-md' : undefined}>
                <DialogHeader>
                    <DialogTitle>
                        {isGenerating ? 'Generating Your Notes' : 'Import PowerPoint Slides'}
                    </DialogTitle>
                    <DialogDescription>
                        {isGenerating
                            ? 'Please wait while our AI creates study notes from your slides.'
                            : 'Upload a PowerPoint file to convert into study notes using AI.'
                        }
                    </DialogDescription>
                </DialogHeader>

                {isGenerating ? (
                    <div className="py-8">
                        {/* Progress indicator */}
                        <div className="flex flex-col items-center gap-6">
                            {/* Animated icon */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                                <div className="relative bg-primary/10 rounded-full p-4">
                                    <StepIcon className="h-8 w-8 text-primary animate-pulse" />
                                </div>
                            </div>

                            {/* Step label */}
                            <div className="text-center space-y-2">
                                <p className="font-medium text-foreground">
                                    {STEP_CONFIG[processingStep].label}
                                </p>
                                <p className="text-sm text-muted-foreground animate-pulse">
                                    {currentMessage}
                                </p>
                            </div>

                            {/* Progress steps */}
                            <div className="flex items-center gap-2 mt-2">
                                {(['converting', 'uploading', 'analyzing', 'saving'] as const).map((step, idx) => (
                                    <div key={step} className="flex items-center gap-2">
                                        <div
                                            className={`h-2 w-2 rounded-full transition-colors ${
                                                processingStep === step
                                                    ? 'bg-primary animate-pulse'
                                                    : ['converting', 'uploading', 'analyzing', 'saving'].indexOf(processingStep) > idx
                                                        ? 'bg-primary'
                                                        : 'bg-muted'
                                            }`}
                                        />
                                        {idx < 3 && <div className="h-px w-4 bg-muted" />}
                                    </div>
                                ))}
                            </div>

                            {/* Warning message */}
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mt-4">
                                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                                    <span className="font-medium">Please don&apos;t close this window!</span>
                                    <br />
                                    This may take few minutes depending on your slides.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
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
                                accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {selectedFile ? (
                                <div className="flex flex-col items-center gap-2">
                                    <FileImage className="h-10 w-10 text-primary" />
                                    <p className="text-sm font-medium">{selectedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-10 w-10 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Drag and drop a PowerPoint file here, or click to browse
                                    </p>
                                    <p className="text-xs text-muted-foreground/60">
                                        Supports .ppt and .pptx files
                                    </p>
                                </div>
                            )}
                        </div>

                        {selectedFile && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Note Title</label>
                                <Input
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    placeholder="Enter note title..."
                                />
                            </div>
                        )}

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
                                Cancel
                            </Button>
                            {selectedFile && (
                                <Button
                                    onClick={handleGenerateNotes}
                                    disabled={isGenerating || !noteTitle.trim()}
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate Notes with AI
                                </Button>
                            )}
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
