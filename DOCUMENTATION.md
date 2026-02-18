# MediaForge - Technical Summary

This website is a client-side media manipulation tool suite for Images and PDFs. It is built using React, Vite, Tailwind CSS, and several specialized libraries for browser-based file processing.

## Project Architecture

The project follows a standard React full-stack structure but emphasizes client-side logic to ensure data privacy and performance.

- **Frontend**: React with Wouter for routing.
- **Styling**: Tailwind CSS with Shadcn UI components.
- **State Management**: React Hooks (`useState`, `useCallback`, `useRef`, `useContext`).
- **File Processing**: Browser-based libraries (`cropperjs`, `pdf-lib`, `pdf.js`).

## Key Sections & Functions

### 1. Image Editor (`client/src/pages/ImageEditor.tsx`)
A comprehensive tool for basic photo editing.

- **Manual Cropping**: Uses `react-cropper` (wrapper for `cropperjs`). The `autoCrop` is disabled to allow users to draw their own crop boxes. 
- **Adjustments Hook (`client/src/hooks/use-editor.ts`)**: Manages state for brightness, contrast, and sharpness.
- **Filters**: 
    - **Brightness/Contrast**: Applied via CSS `filter` in the preview and a Canvas `ctx.filter` during export.
    - **Sharpness**: Simulated by dynamically boosting contrast and saturation to create a "sharper" look.
    - **Black & White**: Applies a 100% grayscale filter.
- **Download Logic**: Renders the final processed image (including crop and filters) onto a hidden Canvas element before triggering a browser download.

### 2. PDF Tool (`client/src/pages/PDFTool.tsx`)
A tool for splitting and converting PDF documents.

- **PDF Rendering**: Uses `pdfjs-dist` to render thumbnails of each page. A specialized worker (`pdf.worker.mjs`) is configured to handle the heavy rendering tasks in a background thread.
- **Page Selection**: A grid-based UI allowing users to toggle page selection.
- **Extraction Modes**:
    - **PDF Extraction**: Uses `pdf-lib` to create a new PDF document and copy the selected pages into it.
    - **Image Extraction**: Triggers individual downloads of the generated page thumbnails as PNG files.
- **Local Processing**: No PDF data is ever sent to a server; all bytes are handled via `Blob` and `ArrayBuffer` in the browser.

### 3. Navigation & Layout
- **App Sidebar/Navigation**: Provides easy access between tools.
- **Theme Provider**: Supports Light and Dark modes.
- **Toaster**: Provides feedback for successful downloads or errors.

## Dependencies
- `react-cropper` / `cropperjs`: Image manipulation.
- `pdf-lib`: PDF modification.
- `pdfjs-dist`: PDF rendering.
- `react-dropzone`: File upload interaction.
- `lucide-react`: Icons.
- `framer-motion`: Smooth UI transitions.
- `shadcn/ui`: Pre-built accessible components.
