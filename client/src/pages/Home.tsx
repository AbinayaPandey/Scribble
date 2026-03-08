import { Link } from "wouter";
import { Image, FileText, ArrowRight, Wand2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
        {/* theme toggle switch inserted before wand icon */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Wand2 className="w-4 h-4" />
          <span>No Login Required</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight">
          Powerful Media Tools, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Right in Your Browser
          </span>
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Edit images and manage PDFs without uploading files to a server.
          Privacy-focused, fast, and free forever.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Link href="/editor">
          <Card className="group relative overflow-hidden p-8 h-full border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer">
            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Image className="w-8 h-8 text-primary" />
              </div>

              <h2 className="text-2xl font-display font-bold mb-3">
                Image Editor
              </h2>
              <p className="text-muted-foreground mb-8 flex-1">
                Crop, resize, adjust brightness/contrast, and apply filters to
                your photos. Perfect for quick social media edits.
              </p>

              <div className="flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                Open Editor <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/pdf">
          <Card className="group relative overflow-hidden p-8 h-full border-border hover:border-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 cursor-pointer">
            <div className="absolute top-0 right-0 p-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-accent" />
              </div>

              <h2 className="text-2xl font-display font-bold mb-3">
                PDF Extractor
              </h2>
              <p className="text-muted-foreground mb-8 flex-1">
                Separate important pages from large PDF documents. Extract,
                reorder, and save exactly what you need.
              </p>

              <div className="flex items-center text-accent font-medium group-hover:translate-x-1 transition-transform">
                Open PDF Tools <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="mt-24 border-t border-border pt-12">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center shadow-sm">
              <Layers className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Local Processing</h3>
            <p className="text-sm text-muted-foreground">
              Files never leave your device.
            </p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center shadow-sm">
              <Wand2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Instant Results</h3>
            <p className="text-sm text-muted-foreground">
              No waiting for server uploads.
            </p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center shadow-sm">
              <Image className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">High Quality</h3>
            <p className="text-sm text-muted-foreground">
              Full resolution export.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
