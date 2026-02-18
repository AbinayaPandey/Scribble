import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onUpload: (file: File, preview: string) => void;
  className?: string;
  accept?: Record<string, string[]>;
  title?: string;
  description?: string;
}

export function ImageUploader({ 
  onUpload, 
  className, 
  accept = { 'image/*': [] },
  title = "Upload an image",
  description = "Drag & drop or click to select"
}: ImageUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.[0]) {
        const file = acceptedFiles[0];
        const previewUrl = URL.createObjectURL(file);
        onUpload(file, previewUrl);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group cursor-pointer flex flex-col items-center justify-center w-full h-80 rounded-2xl border-2 border-dashed transition-all duration-300 ease-out",
        isDragActive
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4 text-center p-6">
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
          isDragActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          {isDragActive ? (
            <Upload className="w-10 h-10 animate-bounce" />
          ) : (
            <ImageIcon className="w-10 h-10" />
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-semibold text-xl text-foreground">
            {isDragActive ? "Drop it here!" : title}
          </h3>
          <p className="text-muted-foreground text-sm max-w-[240px]">
            {description}
          </p>
        </div>
      </div>
      
      {/* Decorative gradient corners */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent blur-xl rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-accent/20 to-transparent blur-xl rounded-full translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
}
