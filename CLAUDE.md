# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 law study notes application with Supabase authentication and database.

### Route Groups
- `app/(marketing)/` - Public pages (landing, login) with marketing Navbar
- `app/(app)/` - Protected authenticated routes with AppLayout (left sidebar, right sidebar, navbar)

### Authentication Flow
- Supabase Auth with cookie-based sessions via `@supabase/ssr`
- `middleware.ts` refreshes sessions on all routes
- `app/(app)/layout.tsx` protects routes by redirecting unauthenticated users to `/login`
- Auth callback handled at `app/auth/callback/route.ts`

### Supabase Client Usage
- **Server Components/Actions**: Use `createClient()` from `@/utils/supabase/server`
- **Client Components**: Use `createClient()` from `@/utils/supabase/client`
- **Middleware**: Use `updateSession()` from `@/utils/supabase/middleware`
- `lib/supabase.ts` contains a mock client fallback for development without env vars

### Server Actions
All database mutations are in `app/actions.ts`:
- `createNote()`, `deleteNote()` - Note CRUD
- `createFolder()`, `deleteFolder()` - Folder CRUD

### Database Schema (supabase/schema.sql)
- `notes`: id, title, category, content_markdown, user_id, folder_id
- `folders`: id, name, parent_id (self-referential for nesting), user_id
- Row Level Security enabled - users only see their own data

### UI Components
- `components/ui/` - shadcn/ui components (Radix UI primitives)
- `components/layout/` - AppLayout, AppNavbar, SidebarLeft, SidebarRight
- `components/file-explorer/` - FileExplorer, FolderItem, FileItem for note navigation
- `components/BlockEditor.tsx` - Tiptap rich text editor with markdown support
- `components/NoteRenderer.tsx` - Read-only Tiptap renderer
- `lib/tiptap-extensions.ts` - Custom Tiptap extensions (HeadingWithId for TOC support)

### Key Patterns
- Notes use markdown content (`content_markdown` field) edited and rendered via Tiptap with tiptap-markdown extension
- Tiptap editor supports: headings, bold, italic, strikethrough, lists, task lists, blockquotes, code blocks, tables, links
- HeadingWithId extension auto-generates slug IDs for headings (enables TOC navigation in SidebarRight)
- Folders support nesting via `parent_id` self-reference
- React Compiler enabled via babel-plugin-react-compiler
- Resizable panels using react-resizable-panels (shadcn resizable component)

### Adding UI Components
Always use shadcn CLI to add components - never hardcode them:
```bash
npx shadcn@latest add <component-name>
```
