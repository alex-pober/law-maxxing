export function parseVttContent(vttContent: string): string {
    // Remove Windows line endings
    const content = vttContent.replace(/\r/g, '')

    // Split into lines
    const lines = content.split('\n')

    const dialogueLines: string[] = []

    for (const line of lines) {
        // Skip WEBVTT header
        if (line.startsWith('WEBVTT')) continue
        // Skip timestamp lines (contain -->)
        if (line.includes('-->')) continue
        // Skip numeric entry IDs (lines that are only digits)
        if (/^\d+$/.test(line.trim())) continue
        // Skip empty lines but track them for paragraph breaks
        if (line.trim() === '') {
            if (dialogueLines.length > 0 && dialogueLines[dialogueLines.length - 1] !== '') {
                dialogueLines.push('')
            }
            continue
        }

        // Clean the line: remove non-breaking spaces, escape dollar signs
        const cleanedLine = line
            .replace(/\u00A0/g, ' ')  // Replace non-breaking spaces
            .replace(/\$/g, '\\$')    // Escape dollar signs for LaTeX

        dialogueLines.push(cleanedLine)
    }

    // Remove consecutive blank lines and trim
    return dialogueLines
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}
