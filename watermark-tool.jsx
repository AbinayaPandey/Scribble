import { useState, useRef, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;800&family=DM+Mono:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0f;
    font-family: 'DM Mono', monospace;
    color: #e8e6f0;
    min-height: 100vh;
  }

  .app {
    min-height: 100vh;
    background: #0a0a0f;
    background-image: 
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 80, 255, 0.15), transparent),
      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0, 200, 180, 0.08), transparent);
    padding: 40px 20px;
  }

  .header { text-align: center; margin-bottom: 48px; }

  .header h1 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(2rem, 5vw, 3.5rem);
    letter-spacing: -2px;
    background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 50%, #34d399 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
  }

  .header p { margin-top: 12px; color: #6b7280; font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; }

  .layout {
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
  }

  @media (max-width: 768px) { .layout { grid-template-columns: 1fr; } }

  .left-col, .right-col { display: flex; flex-direction: column; gap: 20px; }

  .card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 24px;
  }

  .card-title {
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: 0.72rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-title::before {
    content: '';
    display: block;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #a78bfa;
    flex-shrink: 0;
  }

  .drop-zone {
    border: 2px dashed rgba(167, 139, 250, 0.3);
    border-radius: 12px;
    padding: 36px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: rgba(167, 139, 250, 0.03);
    display: block;
  }

  .drop-zone:hover, .drop-zone.drag-over {
    border-color: rgba(167, 139, 250, 0.7);
    background: rgba(167, 139, 250, 0.07);
  }

  .drop-zone input { display: none; }
  .drop-icon { font-size: 2rem; margin-bottom: 10px; }
  .drop-zone h3 { font-family: 'Syne', sans-serif; font-size: 0.95rem; color: #c4b5fd; margin-bottom: 4px; }
  .drop-zone p { font-size: 0.75rem; color: #4b5563; }

  .file-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.25);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 0.75rem;
    color: #34d399;
    margin-top: 12px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-wrap {
    position: relative;
    background: repeating-conic-gradient(#1a1a2e 0% 25%, #12121f 0% 50%) 0 0 / 16px 16px;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }

  .preview-wrap canvas { max-width: 100%; max-height: 400px; display: block; }

  .preview-placeholder { color: #374151; font-size: 0.8rem; letter-spacing: 1px; padding: 40px; text-align: center; line-height: 1.8; }

  .live-badge {
    position: absolute;
    top: 8px; right: 8px;
    background: rgba(167,139,250,0.15);
    border: 1px solid rgba(167,139,250,0.3);
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 0.65rem;
    letter-spacing: 1px;
    color: #a78bfa;
    text-transform: uppercase;
  }

  .controls-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  @media (max-width: 500px) { .controls-grid { grid-template-columns: 1fr; } }

  .field { display: flex; flex-direction: column; gap: 7px; }
  .field.full { grid-column: 1 / -1; }

  label { font-size: 0.68rem; letter-spacing: 1.5px; text-transform: uppercase; color: #6b7280; }

  input[type="text"], select {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 9px 12px;
    color: #e8e6f0;
    font-family: 'DM Mono', monospace;
    font-size: 0.82rem;
    outline: none;
    width: 100%;
    transition: border-color 0.2s;
  }

  input[type="text"]:focus, select:focus { border-color: rgba(167, 139, 250, 0.6); }
  select option { background: #1a1a2e; }



  .color-row { display: flex; gap: 8px; align-items: center; }
  .color-row input[type="color"] {
    width: 38px; height: 36px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.1);
    background: none;
    cursor: pointer;
    padding: 2px;
    flex-shrink: 0;
  }

  .slider-row { display: flex; align-items: center; gap: 10px; }

  input[type="range"] {
    flex: 1;
    -webkit-appearance: none;
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    outline: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 15px; height: 15px;
    border-radius: 50%;
    background: #a78bfa;
    cursor: pointer;
  }

  .slider-val { font-size: 0.75rem; color: #a78bfa; min-width: 38px; text-align: right; }

  .type-toggle {
    display: flex;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 3px;
    gap: 3px;
  }

  .type-btn {
    flex: 1; padding: 7px; border: none; border-radius: 7px;
    font-family: 'DM Mono', monospace; font-size: 0.72rem; letter-spacing: 1px;
    text-transform: uppercase; cursor: pointer; transition: all 0.2s;
    background: transparent; color: #6b7280;
  }

  .type-btn.active {
    background: rgba(167, 139, 250, 0.2);
    color: #c4b5fd;
    border: 1px solid rgba(167, 139, 250, 0.3);
  }

  .btn-apply {
    width: 100%; padding: 13px; border: none; border-radius: 10px;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 0.88rem;
    letter-spacing: 1px; cursor: pointer; transition: all 0.2s;
    background: linear-gradient(135deg, #7c3aed, #2563eb);
    color: white; position: relative; overflow: hidden;
  }

  .btn-apply:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4); }
  .btn-apply:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-apply.loading::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    animation: shimmer 1.2s infinite;
  }

  @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

  .result-card {
    display: flex; align-items: center; gap: 14px;
    background: rgba(52, 211, 153, 0.06);
    border: 1px solid rgba(52, 211, 153, 0.2);
    border-radius: 12px; padding: 16px 20px;
  }

  .result-icon { font-size: 1.8rem; }
  .result-info h3 { font-family: 'Syne', sans-serif; color: #34d399; font-size: 0.9rem; margin-bottom: 3px; }
  .result-info p { font-size: 0.72rem; color: #6b7280; }

  .btn-download {
    margin-left: auto; padding: 9px 16px;
    border: 1px solid rgba(52, 211, 153, 0.4);
    border-radius: 8px; background: rgba(52, 211, 153, 0.1);
    color: #34d399; font-family: 'DM Mono', monospace;
    font-size: 0.75rem; cursor: pointer; text-decoration: none;
    transition: all 0.2s; white-space: nowrap;
  }

  .btn-download:hover { background: rgba(52, 211, 153, 0.2); }

  .error-card {
    background: rgba(239, 68, 68, 0.06);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 10px; padding: 12px 16px;
    font-size: 0.8rem; color: #f87171;
  }

  .status-dot {
    display: inline-block; width: 7px; height: 7px;
    border-radius: 50%; background: #34d399;
    box-shadow: 0 0 6px #34d399; flex-shrink: 0;
  }
`;

// Build a small tile canvas with just the watermark drawn on it
function buildWatermarkTile(opts, tileScale) {
  const { watermarkType, text, fontSize, color, opacity, rotation, logoImg } = opts;
  const sc = tileScale || 1;
  const tile = document.createElement("canvas");
  const tc = tile.getContext("2d");

  if (watermarkType === "text" && text) {
    const sf = Math.round(fontSize * sc);
    tc.font = `bold ${sf}px sans-serif`;
    tc.textBaseline = "middle";
    const tw = tc.measureText(text).width;
    const th = sf;
    const pad = 5;
    tile.width = Math.ceil(tw + pad);
    tile.height = Math.ceil(th + pad);
    tc.font = `bold ${sf}px sans-serif`;
    tc.textBaseline = "middle";
    tc.fillStyle = color;
    tc.globalAlpha = opacity / 100;
    tc.save();
    tc.translate(tile.width / 2, tile.height / 2);
    tc.rotate((rotation * Math.PI) / 180);
    tc.fillText(text, -tw / 2, 0);
    tc.restore();
    return tile;
  } else if (watermarkType === "image" && logoImg && logoImg.complete) {
    const base = 80 * sc;
    const ls = Math.min(base / logoImg.naturalWidth, base / logoImg.naturalHeight);
    const lw = Math.ceil(logoImg.naturalWidth * ls);
    const lh = Math.ceil(logoImg.naturalHeight * ls);
    const pad = 5;
    tile.width = lw + pad;
    tile.height = lh + pad;
    tc.globalAlpha = opacity / 100;
    tc.save();
    tc.translate(tile.width / 2, tile.height / 2);
    tc.rotate((rotation * Math.PI) / 180);
    tc.drawImage(logoImg, -lw / 2, -lh / 2, lw, lh);
    tc.restore();
    return tile;
  }
  return null;
}

function applyWatermarkToCanvas(canvas, sourceImg, opts) {
  const { watermarkType, text, fontSize, color, opacity, rotation, position, repeat, logoImg } = opts;
  const ctx = canvas.getContext("2d");

  const MAX_W = 560;
  const scale = Math.min(1, MAX_W / sourceImg.width);
  canvas.width = Math.round(sourceImg.width * scale);
  canvas.height = Math.round(sourceImg.height * scale);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);

  if (repeat) {
    // Draw watermark tile once, fill with createPattern — very fast
    const tile = buildWatermarkTile(opts, scale);
    if (!tile) return;
    const pattern = ctx.createPattern(tile, "repeat");
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // Single placement
    ctx.globalAlpha = opacity / 100;
    if (watermarkType === "text" && text) {
      const sf = Math.round(fontSize * scale);
      ctx.fillStyle = color;
      ctx.font = `bold ${sf}px sans-serif`;
      ctx.textBaseline = "middle";
      const tw = ctx.measureText(text).width;
      const th = sf;
      const p = {
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
      const p = {
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
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [sourceImg, setSourceImg] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [watermarkType, setWatermarkType] = useState("text");
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(10);
  const [opacity, setOpacity] = useState(10);
  const [color, setColor] = useState("#000000");
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState("top-left");
  const [repeat, setRepeat] = useState(true);
  const [logoImg, setLogoImg] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false);

  const previewCanvasRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setError(null); setResult(null);
    if (f.type === "application/pdf") {
      setFileType("pdf"); setFile(f); setSourceImg(null);
      setPdfPreviewLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Load pdfjs via script tag if not already loaded
          await new Promise((res, rej) => {
            if (window.pdfjsLib) { res(); return; }
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
          });
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(e.target.result) }).promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1.5 });
          const offscreen = document.createElement("canvas");
          offscreen.width = viewport.width;
          offscreen.height = viewport.height;
          await page.render({ canvasContext: offscreen.getContext("2d"), viewport }).promise;
          const img = new Image();
          img.onload = () => setSourceImg(img);
          img.src = offscreen.toDataURL();
        } catch(err) {
          setError("PDF preview failed: " + err.message);
        } finally {
          setPdfPreviewLoading(false);
        }
      };
      reader.readAsArrayBuffer(f);
      return;
    }
    if (!f.type.startsWith("image/")) { setError("Unsupported file. Upload a PDF or image."); return; }
    setFileType("image"); setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => setSourceImg(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  };

  const handleLogoFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setLogoFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => setLogoImg(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  };

  // *** Live preview: re-draw every time any setting changes ***
  useEffect(() => {
    if (!previewCanvasRef.current || !sourceImg) return;
    applyWatermarkToCanvas(previewCanvasRef.current, sourceImg, {
      watermarkType, text, fontSize, color, opacity, rotation, position, repeat,
      logoImg: watermarkType === "image" ? logoImg : null,
    });
  }, [sourceImg, watermarkType, text, fontSize, color, opacity, rotation, position, repeat, logoImg]);

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };

  const exportFullRes = () => new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = sourceImg.naturalWidth > 0 ? sourceImg.naturalWidth : sourceImg.width;
    canvas.height = sourceImg.naturalHeight > 0 ? sourceImg.naturalHeight : sourceImg.height;
    ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);
    const opts = { watermarkType, text, fontSize, color, opacity, rotation, position, repeat, logoImg: watermarkType==="image"?logoImg:null };
    if (repeat) {
      const tile = buildWatermarkTile(opts, 1);
      if (tile) { ctx.fillStyle = ctx.createPattern(tile, "repeat"); ctx.fillRect(0,0,canvas.width,canvas.height); }
    } else {
      ctx.globalAlpha = opacity / 100;
      if (watermarkType === "text" && text) {
        ctx.fillStyle = color; ctx.font = `bold ${fontSize}px sans-serif`; ctx.textBaseline = "middle";
        const tw = ctx.measureText(text).width, th = fontSize;
        const p={"top-left":[tw/2+16,th/2+16],"top-right":[canvas.width-tw/2-16,th/2+16],"bottom-left":[tw/2+16,canvas.height-th/2-16],"bottom-right":[canvas.width-tw/2-16,canvas.height-th/2-16],"center":[canvas.width/2,canvas.height/2]};
        const [px,py]=p[position]||[canvas.width/2,canvas.height/2];
        ctx.save(); ctx.translate(px,py); ctx.rotate((rotation*Math.PI)/180); ctx.fillText(text,-tw/2,0); ctx.restore();
      } else if (watermarkType==="image" && logoImg) {
        const ls=Math.min((canvas.width*0.25)/logoImg.naturalWidth,(canvas.height*0.25)/logoImg.naturalHeight);
        const lw=logoImg.naturalWidth*ls, lh=logoImg.naturalHeight*ls;
        const p={"top-left":[16,16],"top-right":[canvas.width-lw-16,16],"bottom-left":[16,canvas.height-lh-16],"bottom-right":[canvas.width-lw-16,canvas.height-lh-16],"center":[canvas.width/2-lw/2,canvas.height/2-lh/2]};
        const [px,py]=p[position]||[canvas.width/2-lw/2,canvas.height/2-lh/2];
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
    setProcessing(true); setError(null); setResult(null);
    try {
      if (fileType === "pdf") {
        // Load pdf-lib via script tag if not already loaded
        await new Promise((res, rej) => {
          if (window.PDFLib) { res(); return; }
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
        const { PDFDocument, rgb, degrees } = window.PDFLib;
        const fileBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBytes);
        const r=parseInt(color.slice(1,3),16)/255, g=parseInt(color.slice(3,5),16)/255, b=parseInt(color.slice(5,7),16)/255;
        for (const page of pdfDoc.getPages()) {
          const { width, height } = page.getSize();
          if (watermarkType === "text") {
            const drawT=(x,y)=>page.drawText(text,{x,y,size:fontSize,color:rgb(r,g,b),opacity:opacity/100,rotate:degrees(rotation)});
            if(repeat){const sX=fontSize*text.length*0.6+5,sY=fontSize+5;for(let x=-width;x<width*2;x+=sX)for(let y=-height;y<height*2;y+=sY)drawT(x,y);}
            else{const aW=text.length*fontSize*0.55;const p={"top-left":[16,height-fontSize-16],"top-center":[width/2-aW/2,height-fontSize-16],"top-right":[width-aW-16,height-fontSize-16],"center-left":[16,height/2],"center":[width/2-aW/2,height/2],"center-right":[width-aW-16,height/2],"bottom-left":[16,16+fontSize],"bottom-center":[width/2-aW/2,16+fontSize],"bottom-right":[width-aW-16,16+fontSize]};const[px,py]=p[position]||[width/2-aW/2,height/2];drawT(px,py);}
          } else if (watermarkType==="image" && logoFile) {
            const lb=await logoFile.arrayBuffer();
            const img=logoFile.type==="image/png"?await pdfDoc.embedPng(lb):await pdfDoc.embedJpg(lb);
            const ls=Math.min(width*0.25/img.width,height*0.25/img.height);
            const lw=img.width*ls,lh=img.height*ls;
            const drawI=(x,y)=>page.drawImage(img,{x,y,width:lw,height:lh,opacity:opacity/100,rotate:degrees(rotation)});
            if(repeat){for(let x=0;x<width;x+=lw+5)for(let y=0;y<height;y+=lh+5)drawI(x,y);}
            else{const p={"top-left":[16,height-lh-16],"top-right":[width-lw-16,height-lh-16],"bottom-left":[16,16],"bottom-right":[width-lw-16,16],"center":[width/2-lw/2,height/2-lh/2]};const[px,py]=p[position]||[width/2-lw/2,height/2-lh/2];drawI(px,py);}
          }
        }
        const pdfBytes=await pdfDoc.save();
        const blob=new Blob([pdfBytes],{type:"application/pdf"});
        const url = URL.createObjectURL(blob);
        setResult({url, name:file.name.replace(/\.pdf$/i,"_watermarked.pdf"), size:(blob.size/1024).toFixed(1)+" KB"});
      } else {
        const res = await exportFullRes();
        setResult(res);
      }
    } catch(err) { console.error(err); setError("Error: "+err.message); }
    finally { setProcessing(false); }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <h1>Watermark Studio</h1>
          <p>PDF · Images · Real-time Preview</p>
        </div>

        <div className="layout">
          {/* LEFT */}
          <div className="left-col">
            <div className="card">
              <div className="card-title">Upload File</div>
              <label htmlFor="main-file-input" className={`drop-zone ${dragOver?"drag-over":""}`}
                onDragOver={(e)=>{e.preventDefault();setDragOver(true);}}
                onDragLeave={()=>setDragOver(false)} onDrop={handleDrop}>
                <input id="main-file-input" type="file" accept=".pdf,image/*" onChange={(e)=>handleFile(e.target.files[0])} />
                <div className="drop-icon">📄</div>
                <h3>{file?"Click to replace file":"Drop your file here"}</h3>
                <p>PDF or image (PNG, JPG, WEBP)</p>
              </label>
              {file && (
                <div className="file-badge">
                  <span className="status-dot" />
                  {file.name} · {(file.size/1024).toFixed(1)} KB · {fileType?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-title">Live Preview</div>
              <div className="preview-wrap">
                {sourceImg ? (
                  <>
                    <canvas ref={previewCanvasRef} />
                    <div className="live-badge">⚡ live</div>
                  </>
                ) : pdfPreviewLoading ? (
                  <div className="preview-placeholder">⏳ Rendering PDF preview…</div>
                ) : fileType === "pdf" && !sourceImg ? (
                  <div className="preview-placeholder">📄 PDF preview failed<br/>Watermark will still be applied on export</div>
                ) : (
                  <div className="preview-placeholder">Upload an image to see<br/>real-time watermark preview</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="right-col">
            <div className="card">
              <div className="card-title">Watermark Settings</div>

              <div style={{marginBottom:16}}>
                <label style={{marginBottom:8,display:'block'}}>Type</label>
                <div className="type-toggle">
                  <button className={`type-btn ${watermarkType==="text"?"active":""}`} onClick={()=>setWatermarkType("text")}>✏️ Text</button>
                  <button className={`type-btn ${watermarkType==="image"?"active":""}`} onClick={()=>setWatermarkType("image")}>🖼 Logo</button>
                </div>
              </div>

              <div className="controls-grid">
                {watermarkType === "text" ? (
                  <>
                    <div className="field full">
                      <label>Watermark Text</label>
                      <input type="text" value={text} onChange={(e)=>setText(e.target.value)} placeholder="e.g. CONFIDENTIAL" />
                    </div>
                    <div className="field">
                      <label>Font Size — {fontSize}px</label>
                      <div className="slider-row">
                        <input type="range" min={10} max={200} value={fontSize} onChange={(e)=>setFontSize(+e.target.value)} onDoubleClick={()=>setFontSize(10)} />
                        <span className="slider-val">{fontSize}</span>
                      </div>
                    </div>
                    <div className="field">
                      <label>Color</label>
                      <div className="color-row">
                        <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} />
                        <input type="text" value={color} onChange={(e)=>setColor(e.target.value)} style={{flex:1}} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="field full">
                    <label>Logo Image</label>
                    <label htmlFor="logo-file-input" className="drop-zone" style={{padding:'16px',display:'block'}}>
                      <input id="logo-file-input" type="file" accept="image/*" onChange={(e)=>handleLogoFile(e.target.files[0])} />
                      {logoImg
                        ? <img src={logoImg.src} alt="Logo" style={{maxHeight:70,borderRadius:6}} />
                        : <><div className="drop-icon" style={{fontSize:'1.5rem'}}>🖼</div><p>Click to upload logo</p></>
                      }
                    </label>
                  </div>
                )}

                <div className="field">
                  <label>Opacity — {opacity}%</label>
                  <div className="slider-row">
                    <input type="range" min={5} max={100} value={opacity} onChange={(e)=>setOpacity(+e.target.value)} onDoubleClick={()=>setOpacity(10)} />
                    <span className="slider-val">{opacity}%</span>
                  </div>
                </div>

                <div className="field">
                  <label>Rotation — {rotation}°</label>
                  <div className="slider-row">
                    <input type="range" min={-180} max={180} value={rotation} onChange={(e)=>setRotation(+e.target.value)} onDoubleClick={()=>setRotation(0)} />
                    <span className="slider-val">{rotation}°</span>
                  </div>
                </div>

                {!repeat && (
                  <div className="field">
                    <label>Position</label>
                    <select value={position} onChange={(e)=>setPosition(e.target.value)}>
                      {["top-left","top-right","bottom-left","bottom-right"].map(p=>(
                        <option key={p} value={p}>{p.replace(/-/g," ")}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="field">
                  <label>Pattern</label>
                  <div className="type-toggle">
                    <button className={`type-btn ${!repeat?"active":""}`} onClick={()=>setRepeat(false)}>Single</button>
                    <button className={`type-btn ${repeat?"active":""}`} onClick={()=>setRepeat(true)}>Repeat</button>
                  </div>
                </div>
              </div>

              <div style={{marginTop:20}}>
                <button className={`btn-apply ${processing?"loading":""}`} onClick={applyWatermark}
                  disabled={!file||processing||(watermarkType==="image"&&!logoImg)}>
                  {processing?"Processing…":`⬇ Export Watermarked ${fileType==="pdf"?"PDF (all pages)":"Image"}`}
                </button>
              </div>
            </div>

            {error && <div className="error-card">⚠ {error}</div>}

            {result && (
              <div className="result-card">
                <div className="result-icon">✅</div>
                <div className="result-info">
                  <h3>Ready to download!</h3>
                  <p>{result.name} · {result.size}</p>
                </div>
                <a href={result.url} download={result.name} className="btn-download">↓ Download</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
