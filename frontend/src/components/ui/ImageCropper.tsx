import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { cn } from '../../lib/utils';
import { ZoomIn, ZoomOut, RotateCcw, Check, X } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  image: string;
  open: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob) => void;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  title?: string;
}

// Helper function to create image element
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// Helper function to get cropped image as blob
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg', 0.95);
  });
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const DEFAULT_ZOOM = 1;

export function ImageCropper({
  image,
  open,
  onClose,
  onCropComplete,
  aspectRatio = 1,
  cropShape = 'round',
  title = 'Crop Image'
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onRotationChange = useCallback((newRotation: number) => {
    setRotation(newRotation);
  }, []);

  const onCropCompleteHandler = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, image, rotation, onCropComplete, onClose]);

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(DEFAULT_ZOOM);
    setRotation(0);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[500px] mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>

        {/* Crop Area */}
        <div className="px-6 py-4">
          <div className="relative h-[300px] bg-black/50 rounded-lg overflow-hidden">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              rotation={rotation}
              aspect={aspectRatio}
              cropShape={cropShape}
              showGrid={false}
              objectFit="contain"
              restrictPosition={false}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onRotationChange={onRotationChange}
              onCropComplete={onCropCompleteHandler}
            />
          </div>

          {/* Controls */}
          <div className="mt-4 space-y-4">
            {/* Zoom Control */}
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <ZoomIn className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>

            {/* Rotation Control */}
            <div className="flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                {rotation}°
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
