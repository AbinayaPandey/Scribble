import { useState, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Upload, CheckCircle2, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFPage {
  pageNumber: number;
  thumbnail: string;
}

export default function PDFTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractMode, setExtractMode] = useState<"pdf" | "images">("pdf");
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles[0];
    if (pdfFile && pdfFile.type === "application/pdf") {
      setFile(pdfFile);
      setPages([]);
      setSelectedPages(new Set());
      setIsProcessing(true);
      
      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        const newPages: PDFPage[] = [];
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 }); // Thumbnail scale
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (context) {
            await page.render({ canvasContext: context, viewport, canvas }).promise;
            newPages.push({
              pageNumber: i,
              thumbnail: canvas.toDataURL(),
            });
          }
        }
        
        setPages(newPages);
      } catch (error) {
        console.error("Error processing PDF:", error);
        toast({
            title: "Error reading PDF",
            description: "Could not process the file. Please try another PDF.",
            variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const togglePageSelection = (pageNumber: number) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageNumber)) {
      newSelected.delete(pageNumber);
    } else {
      newSelected.add(pageNumber);
    }
    setSelectedPages(newSelected);
  };

  const handleExtract = async () => {
    if (!file || selectedPages.size === 0) return;

    try {
      setIsProcessing(true);
      
      if (extractMode === "pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const newPdf = await PDFDocument.create();
        
        const pageIndices = Array.from(selectedPages.values())
          .map(p => p - 1)
          .sort((a, b) => a - b);
        
        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        downloadBlob(blob, `extracted-pages-${Date.now()}.pdf`);
      } else {
        // Extract as images
        const selectedPageNumbers = Array.from(selectedPages.values());
        for (const pageNumber of selectedPageNumbers) {
          const page = pages.find(p => p.pageNumber === pageNumber);
          if (page) {
            const link = document.createElement("a");
            link.href = page.thumbnail;
            link.download = `page-${pageNumber}-${Date.now()}.png`;
            link.click();
            // Small delay to prevent browser download blocking
            await new Promise(r => setTimeout(r, 100));
          }
        }
      }
      
      toast({
        title: "Success!",
        description: `Your ${extractMode === "pdf" ? "PDF" : "images"} have been downloaded.`,
      });
    } catch (error) {
      console.error("Error extracting:", error);
      toast({
        title: "Extraction Failed",
        description: "Something went wrong during the process.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setFile(null);
    setPages([]);
    setSelectedPages(new Set());
  };

  if (!file) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            PDF Page Extractor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload a PDF, select the pages you want to keep, and download a new file instantly. 
            All processing happens locally on your device.
          </p>
        </div>

        <div
          {...getRootProps()}
          className={cn(
            "relative group cursor-pointer flex flex-col items-center justify-center w-full h-80 rounded-2xl border-2 border-dashed transition-all duration-300 ease-out",
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4 text-center p-6">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
              isDragActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              <FileText className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-xl text-foreground">
                {isDragActive ? "Drop PDF here" : "Upload PDF"}
              </h3>
              <p className="text-muted-foreground text-sm">
                Drag & drop or click to browse
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            PDF Extractor
            </h1>
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {file.name}
            </span>
        </div>
        
        <div className="flex gap-2">
          <div className="flex items-center gap-2 mr-4 bg-muted p-1 rounded-lg border border-border">
            <Button
              variant={extractMode === "pdf" ? "default" : "ghost"}
              size="sm"
              onClick={() => setExtractMode("pdf")}
              className="h-8"
            >
              Export as PDF
            </Button>
            <Button
              variant={extractMode === "images" ? "default" : "ghost"}
              size="sm"
              onClick={() => setExtractMode("images")}
              className="h-8"
            >
              Export as Images
            </Button>
          </div>
          <Button variant="outline" onClick={clearFile} className="gap-2">
            <Trash2 className="w-4 h-4 text-destructive" />
            Clear
          </Button>
          <Button 
            onClick={handleExtract} 
            disabled={selectedPages.size === 0 || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
                "Processing..."
            ) : (
                <>
                <Download className="w-4 h-4" />
                Extract {selectedPages.size} Page{selectedPages.size !== 1 && 's'}
                </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-muted/30 border border-border rounded-xl p-6 overflow-y-auto">
        {pages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Generating page previews...
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {pages.map((page) => (
                <div 
                    key={page.pageNumber}
                    onClick={() => togglePageSelection(page.pageNumber)}
                    className={cn(
                        "relative group cursor-pointer transition-all duration-200",
                        selectedPages.has(page.pageNumber) ? "scale-105" : "hover:scale-[1.02]"
                    )}
                >
                    <div className={cn(
                        "rounded-lg overflow-hidden border-2 shadow-md transition-all",
                        selectedPages.has(page.pageNumber) 
                            ? "border-primary ring-4 ring-primary/20 shadow-xl" 
                            : "border-transparent group-hover:border-primary/50"
                    )}>
                        <img 
                            src={page.thumbnail} 
                            alt={`Page ${page.pageNumber}`} 
                            className="w-full h-auto object-contain bg-white"
                        />
                        
                        {/* Overlay for selection */}
                        <div className={cn(
                            "absolute inset-0 bg-primary/10 transition-opacity duration-200 flex items-center justify-center",
                            selectedPages.has(page.pageNumber) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                            {selectedPages.has(page.pageNumber) && (
                                <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg scale-110">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-2 text-center text-sm font-medium text-muted-foreground">
                        Page {page.pageNumber}
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <p>{pages.length} pages total</p>
        <p>{selectedPages.size} selected for extraction</p>
      </div>
    </div>
  );
}
