# MediaForge

## Overview

MediaForge is a privacy-focused, browser-based media manipulation tool suite. It provides two main tools: an **Image Editor** (crop, brightness, contrast, sharpness, grayscale filters) and a **PDF Tool** (split PDFs, extract pages as PDF or images). All file processing happens client-side in the browser — no files are uploaded to a server. The backend is a minimal Express server that serves the React frontend and provides a basic health-check API endpoint. A PostgreSQL database with Drizzle ORM is configured but barely used (just a simple `uploads` table placeholder).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Client-Side Heavy)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight alternative to React Router) with three routes: `/` (Home), `/editor` (Image Editor), `/pdf` (PDF Tools)
- **Styling**: Tailwind CSS with Shadcn UI component library (New York style variant). CSS variables define the theme with light/dark mode support. Custom fonts: Space Grotesk (display), Inter (body)
- **State Management**: React hooks only (`useState`, `useCallback`, `useRef`, `useContext`) — no global state library
- **UI Components**: Full Shadcn UI component set lives in `client/src/components/ui/`. Custom components like `ImageUploader` and `Navigation` are in `client/src/components/`

### Image Editor (`/editor`)
- Uses `react-cropper` (wrapper around `cropperjs`) for manual cropping
- Custom `useImageEditor` hook (`client/src/hooks/use-editor.ts`) manages brightness, contrast, sharpness, and grayscale adjustments
- Filters applied via CSS `filter` property for preview, then rendered to a hidden Canvas for export/download
- Sharpness is simulated by boosting contrast and saturation values

### PDF Tool (`/pdf`)
- Uses `pdfjs-dist` with a web worker (`pdf.worker.mjs`) for rendering PDF page thumbnails
- Uses `pdf-lib` for creating new PDFs from selected pages
- Supports two extraction modes: PDF (copies selected pages into new PDF) and Images (downloads page thumbnails as PNGs)
- All processing via `Blob` and `ArrayBuffer` in the browser — no server uploads

### Backend (Minimal)
- **Runtime**: Node.js with Express, served via `tsx` in development
- **Entry**: `server/index.ts` creates an HTTP server with Express
- **Routes**: Single `/api/status` health-check endpoint defined in `server/routes.ts`
- **Static Serving**: In production, serves the built Vite output from `dist/public`
- **Dev Server**: Vite dev server with HMR is set up via `server/vite.ts` as Express middleware

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Single `uploads` table in `shared/schema.ts` with fields: `id`, `filename`, `mimeType`, `size`, `createdAt`
- **Config**: `drizzle.config.ts` reads `DATABASE_URL` env var; migrations output to `./migrations`
- **Storage**: `server/storage.ts` implements a `DatabaseStorage` class with a `createUpload` method
- **Note**: The database is mostly a placeholder. Core app functionality is entirely client-side and doesn't depend on it

### Build System
- **Client**: Vite builds to `dist/public`
- **Server**: esbuild bundles `server/index.ts` to `dist/index.cjs`, externalizing most dependencies except an allowlist of commonly used packages
- **Build script**: `script/build.ts` orchestrates both builds
- **Path aliases**: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

### Key Design Decisions
1. **Client-side processing over server-side**: All image/PDF manipulation runs in the browser for privacy and to avoid server costs. No file data leaves the user's machine.
2. **Minimal backend**: The Express server exists primarily to serve the SPA and could support future features like file tracking, but currently has near-zero API surface.
3. **Shadcn UI**: Components are copied into the project (not imported from a package), allowing full customization. Located in `client/src/components/ui/`.
4. **Drizzle + PostgreSQL**: Included in the stack for future extensibility but not critical to current functionality.

## External Dependencies

### Database
- **PostgreSQL** via `DATABASE_URL` environment variable
- **Drizzle ORM** for schema definition and queries
- **drizzle-kit** for migrations (`db:push` command)

### Key Client Libraries
- `react-cropper` / `cropperjs` — Image cropping
- `pdf-lib` — PDF creation and page extraction
- `pdfjs-dist` — PDF rendering and thumbnails (uses web worker)
- `react-dropzone` — Drag-and-drop file upload
- `framer-motion` — UI animations
- `@tanstack/react-query` — Data fetching (configured but minimally used)
- `recharts` — Charting (available via Shadcn chart component)

### UI Framework
- Radix UI primitives (full set of `@radix-ui/react-*` packages)
- `class-variance-authority` + `clsx` + `tailwind-merge` for className utilities
- `lucide-react` for icons
- `embla-carousel-react` for carousels
- `vaul` for drawer component
- `cmdk` for command palette

### Server Libraries
- `express` — HTTP server
- `connect-pg-simple` — Session store (available but not actively used)
- `nanoid` — Unique ID generation for Vite HMR cache busting

### Dev Tools
- `vite` with `@vitejs/plugin-react`
- `esbuild` for server bundling
- `typescript` / `tsx` for TypeScript execution
- Replit-specific plugins: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`