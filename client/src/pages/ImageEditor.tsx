import { useState, useRef } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { ImageUploader } from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  RotateCcw,
  Download,
  Sun,
  Contrast,
  Aperture,
  Scissors,
  Image as ImageIcon,
  Check,
  Undo2
} from "lucide-react";
import { useImageEditor, DEFAULT_ADJUSTMENTS } from "@/hooks/use-editor";
import { cn } from "@/lib/utils";

export default function ImageEditor() {
  const {
    image,
    setImage,
    adjustments,
    updateAdjustment,
    resetAdjustments,
    getFilterString
  } = useImageEditor();

  const cropperRef = useRef<ReactCropperElement>(null);
  const [croppedData, setCroppedData] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onUpload = (file: File, preview: string) => {
    setImage(preview);
    setCroppedData(null);
    resetAdjustments();
    setIsCropping(false);
  };

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      setCroppedData(croppedCanvas.toDataURL());
      setIsCropping(false);
    }
  };

  const startCropping = () => {
    setIsCropping(true);
  };

  const handleDownload = () => {
    // We need to apply filters to the final image before downloading
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    // Use cropped data if available, otherwise original image
    img.src = croppedData || image!;
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        // Apply CSS filters to context
        // Sharpness is tricky in canvas 2d, for now we rely on brightness/contrast/grayscale
        // A true sharpness filter requires pixel manipulation (convolution matrix)
        const { brightness, contrast, grayscale, sharpness } = adjustments;
        const effectiveContrast = contrast + (sharpness * 10);
        ctx.filter = `brightness(${brightness}%) contrast(${effectiveContrast}%) grayscale(${grayscale ? 100 : 0}%) saturate(${100 + (sharpness * 5)}%)`;
        
        ctx.drawImage(img, 0, 0);
        
        const link = document.createElement("a");
        link.download = `edited-image-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };
  };

  if (!image) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Advanced Image Editor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Crop, adjust, and filter your images entirely in the browser. 
            Secure, fast, and easy to use.
          </p>
        </div>
        <ImageUploader onUpload={onUpload} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-primary" />
          Editor
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImage(null)}>
            New Image
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        {/* Main Canvas Area */}
        <Card className="lg:col-span-9 p-1 bg-muted/30 border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative rounded-2xl h-[500px] lg:h-auto">
          {isCropping ? (
            <div className="w-full h-full bg-black/90">
                <Cropper
                src={image}
                style={{ height: "100%", width: "100%" }}
                initialAspectRatio={NaN}
                guides={true}
                ref={cropperRef}
                viewMode={1}
                background={false}
                responsive={true}
                autoCrop={false}
                checkOrientation={false}
                />
            </div>
          ) : (
            <div className="relative max-w-full max-h-full flex items-center justify-center p-4">
              <img
                src={croppedData || image}
                alt="Preview"
                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm transition-all duration-200"
                style={{ filter: getFilterString() }}
              />
            </div>
          )}
          
          {isCropping && (
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/80 p-2 rounded-full border border-white/10 backdrop-blur-md">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setIsCropping(false)}>
                    <Undo2 className="w-5 h-5" />
                </Button>
                <Button size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full" onClick={handleCrop}>
                    <Check className="w-5 h-5" />
                </Button>
             </div>
          )}
        </Card>

        {/* Sidebar Tools */}
        <Card className="lg:col-span-3 h-full overflow-y-auto p-6 flex flex-col gap-8 shadow-sm border-border/60">
          {/* Crop Tool */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Composition
            </h3>
            <Button 
                variant={isCropping ? "secondary" : "outline"} 
                className="w-full justify-start gap-2 h-12 text-base"
                onClick={startCropping}
                disabled={isCropping}
            >
                <Scissors className="w-5 h-5" />
                Manual Crop
            </Button>
          </section>

          {/* Adjustment Sliders */}
          <section className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Adjustments
                </h3>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={resetAdjustments}
                >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset
                </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-orange-500" /> Brightness
                  </Label>
                  <span className="text-muted-foreground tabular-nums">{adjustments.brightness}%</span>
                </div>
                <Slider
                  value={[adjustments.brightness]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={([val]) => updateAdjustment("brightness", val)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label className="flex items-center gap-2">
                    <Contrast className="w-4 h-4 text-indigo-500" /> Contrast
                  </Label>
                  <span className="text-muted-foreground tabular-nums">{adjustments.contrast}%</span>
                </div>
                <Slider
                  value={[adjustments.contrast]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={([val]) => updateAdjustment("contrast", val)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label className="flex items-center gap-2">
                    <Aperture className="w-4 h-4 text-emerald-500" /> Sharpness
                  </Label>
                  <span className="text-muted-foreground tabular-nums">{adjustments.sharpness}</span>
                </div>
                <Slider
                  value={[adjustments.sharpness]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={([val]) => updateAdjustment("sharpness", val)}
                />
              </div>
            </div>
          </section>

          {/* Filters/Effects */}
          <section>
             <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Aperture className="w-4 h-4" />
                Filters
            </h3>
            
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <Label htmlFor="bw-mode" className="cursor-pointer">Black & White</Label>
              <Switch
                id="bw-mode"
                checked={adjustments.grayscale}
                onCheckedChange={(checked) => updateAdjustment("grayscale", checked)}
              />
            </div>
          </section>
        </Card>
      </div>
    </div>
  );
}
