import { useState, useCallback } from 'react';

export interface ImageAdjustments {
  brightness: number; // 0 to 200, default 100
  contrast: number;   // 0 to 200, default 100
  sharpness: number;  // 0 to 10, default 0 (simulated via CSS/Canvas)
  grayscale: boolean;
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  sharpness: 0,
  grayscale: false,
};

export function useImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);

  const resetAdjustments = useCallback(() => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
  }, []);

  const updateAdjustment = useCallback(<K extends keyof ImageAdjustments>(key: K, value: ImageAdjustments[K]) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  }, []);

  // Filter string for CSS preview
  const getFilterString = useCallback(() => {
    const { brightness, contrast, grayscale, sharpness } = adjustments;
    // We simulate sharpness with a combination of contrast and a subtle SVG filter or just contrast/brightness for now
    // True sharpness is hard with pure CSS filter: contrast helps, but let's add a custom one if needed.
    // For simplicity, we'll use contrast as a proxy or just keep it for the canvas logic.
    return `brightness(${brightness}%) contrast(${contrast + sharpness * 5}%) grayscale(${grayscale ? 100 : 0}%)`;
  }, [adjustments]);

  return {
    image,
    setImage,
    adjustments,
    updateAdjustment,
    resetAdjustments,
    getFilterString
  };
}
