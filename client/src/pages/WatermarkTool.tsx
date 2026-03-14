import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Stamp, 
  Upload, 
  Image as ImageIcon, 
  Type, 
  Download, 
  RefreshCcw, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaStore } from "@/lib/media-store";

// Set worker source for PDF.js
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Helper to build a watermark tile for repeating patterns
function buildWatermarkTile(opts: any, tileScale: number) {
  const { watermarkType, text, fontSize, color, opacity, rotation, logoImg } = opts;
  const sc = tileScale || 1;
  const tile = document.createElement("canvas");
  const tc = tile.getContext("2d");
  if (!tc) return null;

  const rad = (rotation * Math.PI) / 180;
  const absCos = Math.abs(Math.cos(rad));
  const absSin = Math.abs(Math.sin(rad));

  if (watermarkType === "text" && text) {
    const sf = Math.round(fontSize * sc);
    tc.font = `bold ${sf}px sans-serif`;
    const tw = tc.measureText(text).width;
    const th = sf;
    
    // Rotated bounding box for tile size
    const pad = 20; // Internal padding
    tile.width = Math.ceil(tw * absCos + th * absSin) + pad;
    tile.height = Math.ceil(tw * absSin + th * absCos) + pad;
    
    tc.font = `bold ${sf}px sans-serif`;
    tc.textBaseline = "middle";
    tc.textAlign = "center";
    tc.fillStyle = color;
    tc.globalAlpha = opacity / 100;
    
    tc.save();
    tc.translate(tile.width / 2, tile.height / 2);
    tc.rotate(rad);
    tc.fillText(text, 0, 0);
    tc.restore();
    return tile;
  } else if (watermarkType === "image" && logoImg && logoImg.complete) {
    const base = 80 * sc;
    const ls = Math.min(base / logoImg.naturalWidth, base / logoImg.naturalHeight);
    const lw = logoImg.naturalWidth * ls;
    const lh = logoImg.naturalHeight * ls;
    
    const pad = 20;
    tile.width = Math.ceil(lw * absCos + lh * absSin) + pad;
    tile.height = Math.ceil(lw * absSin + lh * absCos) + pad;
    
    tc.globalAlpha = opacity / 100;
    tc.save();
    tc.translate(tile.width / 2, tile.height / 2);
    tc.rotate(rad);
    tc.drawImage(logoImg, -lw / 2, -lh / 2, lw, lh);
    tc.restore();
    return tile;
  }
  return null;
}

function applyWatermarkToCanvas(canvas: HTMLCanvasElement, sourceImg: HTMLImageElement, opts: any) {
  const { watermarkType, text, fontSize, color, opacity, rotation, position, repeat, logoImg } = opts;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const MAX_W = 800;
  const scale = Math.min(1, MAX_W / sourceImg.width);
  canvas.width = Math.round(sourceImg.width * scale);
  canvas.height = Math.round(sourceImg.height * scale);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);

  if (repeat) {
    const tile = buildWatermarkTile(opts, scale);
    if (!tile) return;
    const pattern = ctx.createPattern(tile, "repeat");
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    ctx.globalAlpha = opacity / 100;
    if (watermarkType === "text" && text) {
      const sf = Math.round(fontSize * scale);
      ctx.fillStyle = color;
      ctx.font = `bold ${sf}px sans-serif`;
      ctx.textBaseline = "middle";
      const tw = ctx.measureText(text).width;
      const th = sf;
      const p: Record<string, [number, number]> = {
        "top-left":      [tw/2+16,             th/2+16],
        "top-right":     [canvas.width-tw/2-16, th/2+16],
        "bottom-left":   [tw/2+16,             canvas.height-th/2-16],
        "bottom-right":  [canvas.width-tw/2-16, canvas.height-th/2-16],
        "center":        [canvas.width/2,        canvas.height/2],
      };
      const [px, py] = p[position] || [canvas.width/2, canvas.height/2];
      ctx.save(); ctx.translate(px, py); ctx.rotate((rotation*Math.PI)/180);
      ctx.fillText(text, -tw/2, 0); ctx.restore();
    } else if (watermarkType === "image" && logoImg && logoImg.complete) {
      const ls = Math.min((canvas.width*0.25)/logoImg.naturalWidth, (canvas.height*0.25)/logoImg.naturalHeight);
      const lw = logoImg.naturalWidth * ls, lh = logoImg.naturalHeight * ls;
      const p: Record<string, [number, number]> = {
        "top-left":     [16,16], "top-right":    [canvas.width-lw-16,16],
        "bottom-left":  [16,canvas.height-lh-16], "bottom-right": [canvas.width-lw-16,canvas.height-lh-16],
        "center":       [canvas.width/2-lw/2, canvas.height/2-lh/2],
      };
      const [px,py] = p[position] || [canvas.width/2-lw/2, canvas.height/2-lh/2];
      ctx.save(); ctx.translate(px+lw/2,py+lh/2); ctx.rotate((rotation*Math.PI)/180);
      ctx.drawImage(logoImg,-lw/2,-lh/2,lw,lh); ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}

export default function WatermarkTool() {
  const { sharedFile, clearSharedFile } = useMediaStore();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"image" | "pdf" | null>(null);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(10);
  const [opacity, setOpacity] = useState(30);
  const [color, setColor] = useState("#000000");
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState("center");
  const [repeat, setRepeat] = useState(true);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{url: string, name: string, size: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = async (f: File) => {
    if (!f) return;
    setError(null); 
    setResult(null);
    
    if (f.type === "application/pdf") {
      setFileType("pdf"); 
      setFile(f); 
      setSourceImg(null);
      setPdfPreviewLoading(true);
      
      try {
        const arrayBuffer = await f.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const offscreen = document.createElement("canvas");
        const context = offscreen.getContext("2d");
        
        if (context) {
          offscreen.width = viewport.width;
          offscreen.height = viewport.height;
          await page.render({ canvasContext: context, viewport, canvas: offscreen as any }).promise;
          const img = new Image();
          img.onload = () => setSourceImg(img);
          img.src = offscreen.toDataURL();
        }
      } catch(err: any) {
        setError("PDF preview failed: " + err.message);
      } finally {
        setPdfPreviewLoading(false);
      }
      return;
    }
    
    if (!f.type.startsWith("image/")) { 
      setError("Unsupported file format. Please upload a PDF or an image."); 
      return; 
    }
    
    setFileType("image"); 
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => setSourceImg(img);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(f);
  };

  const handleLogoFile = (f: File) => {
    if (!f || !f.type.startsWith("image/")) return;
    setLogoFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => setLogoImg(img);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(f);
  };
  // Build a File object from dataUrl
  const dataUrlToFile = async (dataUrl: string, fileName: string, mimeType: string): Promise<File | null> => {
    try {
      if (!dataUrl || !dataUrl.startsWith("data:")) return null;
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return new File([blob], fileName, { type: mimeType });
    } catch (err) {
      console.error("Error converting shared file:", err);
      return null;
    }
  };

  // Load shared file on mount or hydration
  useEffect(() => {
    if (sharedFile?.dataUrl) {
      dataUrlToFile(sharedFile.dataUrl, sharedFile.name, sharedFile.type).then(f => {
        if (f) handleFile(f);
      });
    }
    return () => {
      clearSharedFile();
    };
  }, [sharedFile, clearSharedFile]);

  useEffect(() => {
    if (!previewCanvasRef.current || !sourceImg) return;
    applyWatermarkToCanvas(previewCanvasRef.current, sourceImg, {
      watermarkType, text, fontSize, color, opacity, rotation, position, repeat,
      logoImg: watermarkType === "image" ? logoImg : null,
    });
  }, [sourceImg, watermarkType, text, fontSize, color, opacity, rotation, position, repeat, logoImg]);

  const exportFullRes = (): Promise<{url: string, name: string, size: string}> => new Promise((resolve) => {
    if (!sourceImg || !file) return;
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = sourceImg.naturalWidth || sourceImg.width;
    canvas.height = sourceImg.naturalHeight || sourceImg.height;
    ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);
    
    const opts = { watermarkType, text, fontSize, color, opacity, rotation, position, repeat, logoImg: watermarkType==="image"?logoImg:null };
    
    if (repeat) {
      const tile = buildWatermarkTile(opts, 1);
      if (tile) { 
        const pattern = ctx.createPattern(tile, "repeat");
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    } else {
      ctx.globalAlpha = opacity / 100;
      if (watermarkType === "text" && text) {
        ctx.fillStyle = color; 
        ctx.font = `bold ${fontSize}px sans-serif`; 
        ctx.textBaseline = "middle";
        const tw = ctx.measureText(text).width;
        const th = fontSize;
        const p: any = {
          "top-left":      [tw/2+40, th/2+40],
          "top-right":     [canvas.width-tw/2-40, th/2+40],
          "bottom-left":   [tw/2+40, canvas.height-th/2-40],
          "bottom-right":  [canvas.width-tw/2-40, canvas.height-th/2-40],
          "center":        [canvas.width/2, canvas.height/2]
        };
        const [px,py] = p[position] || [canvas.width/2, canvas.height/2];
        ctx.save(); ctx.translate(px,py); ctx.rotate((rotation*Math.PI)/180); ctx.fillText(text,-tw/2,0); ctx.restore();
      } else if (watermarkType==="image" && logoImg) {
        const ls = Math.min((canvas.width*0.25)/logoImg.naturalWidth,(canvas.height*0.25)/logoImg.naturalHeight);
        const lw = logoImg.naturalWidth*ls, lh = logoImg.naturalHeight*ls;
        const p: any = {
          "top-left":     [40,40],
          "top-right":    [canvas.width-lw-40,40],
          "bottom-left":  [40,canvas.height-lh-40],
          "bottom-right": [canvas.width-lw-40,canvas.height-lh-40],
          "center":       [canvas.width/2-lw/2, canvas.height/2-lh/2]
        };
        const [px,py] = p[position] || [canvas.width/2-lw/2, canvas.height/2-lh/2];
        ctx.save(); ctx.translate(px+lw/2,py+lh/2); ctx.rotate((rotation*Math.PI)/180); ctx.drawImage(logoImg,-lw/2,-lh/2,lw,lh); ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    
    const mime = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
    const ext = mime === "image/jpeg" ? "jpg" : "png";
    const dataUrl = canvas.toDataURL(mime, 0.92);
    const sizeKB = Math.round(dataUrl.length * 0.75 / 1024);
    resolve({ url: dataUrl, name: file.name.replace(/\.[^.]+$/, `_watermarked.${ext}`), size: sizeKB + " KB" });
  });

  const applyWatermark = async () => {
    if (!file) return;
    setProcessing(true); 
    setError(null); 
    setResult(null);
    
    try {
      if (fileType === "pdf") {
        const fileBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBytes);
        
        // Convert hex color to rgb
        const r = parseInt(color.slice(1,3), 16) / 255;
        const g = parseInt(color.slice(3,5), 16) / 255;
        const b = parseInt(color.slice(5,7), 16) / 255;
        
        for (const page of pdfDoc.getPages()) {
          const { width, height } = page.getSize();
          
          if (watermarkType === "text") {
            const drawT = (x: number, y: number) => page.drawText(text, {
              x, y, size: fontSize, color: rgb(r,g,b), opacity: opacity/100, rotate: degrees(rotation)
            });
            
            if (repeat) {
              const sX = fontSize * text.length * 0.6 + 5;
              const sY = fontSize + 5;
              for (let x = -width; x < width * 2; x += sX) {
                for (let y = -height; y < height * 2; y += sY) {
                  drawT(x, y);
                }
              }
            } else {
              const aW = text.length * fontSize * 0.55;
              const p: any = {
                "top-left":     [40, height-fontSize-40],
                "top-right":    [width-aW-40, height-fontSize-40],
                "bottom-left":  [40, 40+fontSize],
                "bottom-right": [width-aW-40, 40+fontSize],
                "center":       [width/2-aW/2, height/2]
              };
              const [px, py] = p[position] || [width/2-aW/2, height/2];
              drawT(px, py);
            }
          } else if (watermarkType === "image" && logoFile) {
            const lb = await logoFile.arrayBuffer();
            const img = logoFile.type === "image/png" ? await pdfDoc.embedPng(lb) : await pdfDoc.embedJpg(lb);
            const ls = Math.min(width*0.25/img.width, height*0.25/img.height);
            const lw = img.width*ls, lh = img.height*ls;
            const drawI = (x: number, y: number) => page.drawImage(img, {
              x, y, width: lw, height: lh, opacity: opacity/100, rotate: degrees(rotation)
            });
            
            if (repeat) {
              for (let x = 0; x < width; x += lw + 5) {
                for (let y = 0; y < height; y += lh + 5) {
                  drawI(x, y);
                }
              }
            } else {
              const p: any = {
                "top-left":     [40, height-lh-40],
                "top-right":    [width-lw-40, height-lh-40],
                "bottom-left":  [40, 40],
                "bottom-right": [width-lw-40, 40],
                "center":       [width/2-lw/2, height/2-lh/2]
              };
              const [px, py] = p[position] || [width/2-lw/2, height/2-lh/2];
              drawI(px, py);
            }
          }
        }
        
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setResult({ url, name: file.name.replace(/\.pdf$/i, "_watermarked.pdf"), size: (blob.size/1024).toFixed(1) + " KB" });
      } else {
        const res = await exportFullRes();
        setResult(res);
      }
    } catch(err: any) {
      console.error(err);
      setError("Process failed: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-64px)] flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Side: Upload & Preview */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!file && (
            <Card className="p-6 border-dashed border-2 bg-muted/30 relative group transition-colors hover:border-primary/50">
              <input 
                type="file" 
                id="main-upload" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                accept=".pdf,image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Upload File</h3>
                  <p className="text-sm text-muted-foreground">Drag & drop or click to upload PDF or Image</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-1 bg-black/5 min-h-[600px] flex items-center justify-center relative overflow-hidden rounded-2xl border-border/40 shadow-inner">
            {sourceImg ? (
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <canvas ref={previewCanvasRef} className="max-w-full max-h-[600px] shadow-2xl rounded-sm object-contain" />
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur px-2 py-1 rounded border border-border text-[10px] font-bold uppercase tracking-tighter">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live Preview
                </div>
              </div>
            ) : pdfPreviewLoading ? (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <RefreshCcw className="w-8 h-8 animate-spin" />
                <p>Generating PDF preview...</p>
              </div>
            ) : (
              <div className="text-center p-12 text-muted-foreground space-y-2">
                <ImageIcon className="w-12 h-12 mx-auto opacity-20" />
                <p>Upload a file to see preview</p>
              </div>
            )}
          </Card>

          {file && (
            <Card className="p-4 border-dashed border bg-muted/20 relative group transition-colors hover:border-primary/50">
              <input 
                type="file" 
                id="replace-upload" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                accept=".pdf,image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold">Replace Current File</h3>
                    <div className="flex items-center gap-2 text-xs text-primary font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      {file.name} ({(file.size/1024).toFixed(1)} KB)
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="relative z-20 pointer-events-none">
                  Change File
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Side: Settings */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-8 shadow-lg border-border/60">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <Stamp className="w-4 h-4 text-primary" />
                Settings
              </div>

              <div className="space-y-2">
                <Label>Watermark Type</Label>
                <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
                  <Button 
                    variant={watermarkType === "text" ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setWatermarkType("text")}
                    className="gap-2"
                  >
                    <Type className="w-4 h-4" /> Text
                  </Button>
                  <Button 
                    variant={watermarkType === "image" ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setWatermarkType("image")}
                    className="gap-2"
                  >
                    <ImageIcon className="w-4 h-4" /> Logo
                  </Button>
                </div>
              </div>

              {watermarkType === "text" ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-2">
                    <Label>Watermark Text</Label>
                    <Input 
                      value={text} 
                      onChange={(e) => setText(e.target.value)} 
                      placeholder="e.g. DRAFT" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Size ({fontSize}px)</Label>
                      <Slider 
                        value={[fontSize]} 
                        min={10} max={100} 
                        onValueChange={([v]) => setFontSize(v)}
                        onDoubleClick={() => setFontSize(10)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={color} 
                          onChange={(e) => setColor(e.target.value)} 
                          className="w-12 p-1 h-9 cursor-pointer"
                        />
                        <Input 
                          type="text" 
                          value={color} 
                          onChange={(e) => setColor(e.target.value)}
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                  <Label>Logo Image</Label>
                  <div className="relative border-2 border-dashed rounded-lg p-4 transition-colors hover:bg-muted/50 text-center">
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleLogoFile(e.target.files[0])}
                    />
                    {logoImg ? (
                      <div className="flex items-center justify-center gap-4">
                        <img src={logoImg.src} className="h-16 w-auto object-contain rounded border bg-white" alt="Logo" />
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">{logoFile?.name}</span>
                      </div>
                    ) : (
                      <div className="py-4 space-y-2">
                        <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Click to upload brand logo</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    Opacity <span>{opacity}%</span>
                  </Label>
                  <Slider 
                    value={[opacity]} 
                    min={1} max={100} 
                    onValueChange={([v]) => setOpacity(v)}
                    onDoubleClick={() => setOpacity(30)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    Rotation <span>{rotation}°</span>
                  </Label>
                  <Slider 
                    value={[rotation]} 
                    min={0} max={180} 
                    onValueChange={([v]) => setRotation(v)}
                    onDoubleClick={() => setRotation(0)}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <Label>Repeat Pattern</Label>
                  <Switch checked={repeat} onCheckedChange={setRepeat} />
                </div>
                
                {!repeat && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-left-1">
                    <Label>Position</Label>
                    <Select value={position} onValueChange={setPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <Button 
                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                size="lg"
                disabled={!file || processing || (watermarkType === "image" && !logoImg)}
                onClick={applyWatermark}
              >
                {processing ? (
                  <RefreshCcw className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Download className="w-5 h-5 mr-2" />
                )}
                {processing ? "Processing..." : `Download Result`}
              </Button>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-start gap-2 animate-in shake-1">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {result && (
                <Card className="p-4 bg-green-500/10 border-green-500/20 animate-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-green-600 uppercase tracking-tighter">Ready for download!</p>
                      <p className="text-sm font-medium truncate max-w-[200px]">{result.name}</p>
                    </div>
                    <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                      <a href={result.url} download={result.name}>
                        <Download className="w-4 h-4 mr-2" /> Save
                      </a>
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
