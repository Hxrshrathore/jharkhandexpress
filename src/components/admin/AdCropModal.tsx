'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crop, AlertTriangle, Check, RotateCcw, ArrowRight } from 'lucide-react';

export interface CropQueueItem {
  file: File;
  type: 'leaderboard' | 'rectangle';
  imageUrl: string;
  width: number;
  height: number;
  actualRatio: number;
  targetRatio: number;
  targetWidth: number;
  targetHeight: number;
  targetName: string;
}

interface AdCropModalProps {
  item: CropQueueItem | null;
  onCropComplete: (croppedFile: File) => void;
  onSkipCrop: () => void;
  onCancel: () => void;
}

export default function AdCropModal({
  item,
  onCropComplete,
  onSkipCrop,
  onCancel
}: AdCropModalProps) {
  const [positionPercent, setPositionPercent] = useState<number>(50); // 0 = top/left, 50 = center, 100 = bottom/right
  const [zoom, setZoom] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Reset controls when item changes
  useEffect(() => {
    setPositionPercent(50);
    setZoom(1);
    if (!item) return;

    const img = new Image();
    img.src = item.imageUrl;
    img.onload = () => {
      imageObjRef.current = img;
      drawPreview(50, 1);
    };
  }, [item]);

  const drawPreview = useCallback((pos: number, z: number) => {
    if (!item || !imageObjRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageObjRef.current;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    // Target dimensions for high-res output
    const outW = item.targetWidth * 2; // 2x retina
    const outH = item.targetHeight * 2;
    canvas.width = outW;
    canvas.height = outH;

    const targetRatio = item.targetRatio;
    const currentRatio = imgW / imgH;

    let sourceX = 0;
    let sourceY = 0;
    let sourceW = imgW;
    let sourceH = imgH;

    if (currentRatio > targetRatio) {
      // Source image is wider than target -> crop left/right
      const idealW = imgH * targetRatio;
      const zoomAdjustedW = idealW / z;
      sourceW = Math.min(imgW, zoomAdjustedW);
      sourceH = sourceW / targetRatio;
      
      const maxScrollX = imgW - sourceW;
      sourceX = (pos / 100) * maxScrollX;
      sourceY = (imgH - sourceH) / 2;
    } else {
      // Source image is taller than target -> crop top/bottom
      const idealH = imgW / targetRatio;
      const zoomAdjustedH = idealH / z;
      sourceH = Math.min(imgH, zoomAdjustedH);
      sourceW = sourceH * targetRatio;

      const maxScrollY = imgH - sourceH;
      sourceY = (pos / 100) * maxScrollY;
      sourceX = (imgW - sourceW) / 2;
    }

    ctx.clearRect(0, 0, outW, outH);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, outW, outH);
  }, [item]);

  useEffect(() => {
    drawPreview(positionPercent, zoom);
  }, [positionPercent, zoom, drawPreview]);

  const handleApplyCrop = () => {
    if (!canvasRef.current || !item) return;

    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        onSkipCrop();
        return;
      }
      const croppedFile = new File([blob], `cropped-${item.file.name.replace(/\.[^.]+$/, '')}.webp`, {
        type: 'image/webp',
        lastModified: Date.now()
      });
      onCropComplete(croppedFile);
    }, 'image/webp', 0.92);
  };

  if (!item) return null;

  const isWider = (item.width / item.height) > item.targetRatio;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl border-border bg-background p-4 sm:p-6 max-h-[92vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Adjust Aspect Ratio for {item.targetName}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                The image does not match the recommended aspect ratio for this ad slot.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Comparison Alert */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <span className="font-bold">Uploaded:</span> {item.width} × {item.height} px (Ratio {item.actualRatio.toFixed(2)}:1)
          </div>
          <ArrowRight className="w-4 h-4 shrink-0 text-muted-foreground hidden sm:block" />
          <div>
            <span className="font-bold">Required {item.targetName}:</span> {item.targetWidth} × {item.targetHeight} px (Ratio {item.targetRatio.toFixed(2)}:1)
          </div>
        </div>

        {/* Live Canvas Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Cropped Preview ({item.targetWidth} × {item.targetHeight})
            </span>
            <span className="text-[11px] text-muted-foreground">
              {isWider ? 'Pan Horizontally' : 'Pan Vertically'}
            </span>
          </div>

          <div className="relative border border-border bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-3 min-h-[120px] max-h-[240px] sm:max-h-[300px]">
            <canvas
              ref={canvasRef}
              className={`max-w-full max-h-[220px] sm:max-h-[260px] object-contain rounded shadow-lg border border-white/10 ${
                item.type === 'leaderboard' ? 'aspect-[728/90] w-full' : 'aspect-[300/250] w-[260px] sm:w-[300px]'
              }`}
            />
          </div>
        </div>

        {/* Adjustment Controls */}
        <div className="space-y-4 bg-muted/40 p-3.5 sm:p-4 rounded-xl border border-border">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="crop-position-slider" className="cursor-pointer">
                {isWider ? 'Horizontal Alignment' : 'Vertical Alignment'}
              </label>
              <span className="text-muted-foreground text-[11px]">
                {positionPercent === 0 ? (isWider ? 'Left' : 'Top') : positionPercent === 100 ? (isWider ? 'Right' : 'Bottom') : 'Center'}
              </span>
            </div>
            <input
              id="crop-position-slider"
              type="range"
              min="0"
              max="100"
              value={positionPercent}
              onChange={(e) => setPositionPercent(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer h-6 py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{isWider ? 'Left' : 'Top'}</span>
              <button 
                type="button" 
                onClick={() => setPositionPercent(50)}
                className="hover:text-primary transition-colors flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Center
              </button>
              <span>{isWider ? 'Right' : 'Bottom'}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="w-full sm:w-auto text-xs uppercase tracking-wider font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSkipCrop}
            className="w-full sm:w-auto text-xs uppercase tracking-wider font-semibold border-border"
          >
            Upload Without Cropping
          </Button>
          <Button
            type="button"
            onClick={handleApplyCrop}
            className="w-full sm:w-auto bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold gap-2"
          >
            <Check className="w-4 h-4" />
            Crop & Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
