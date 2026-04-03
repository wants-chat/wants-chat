import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pipette, Camera, Upload, Copy, Check } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface ColorData {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

const ColorDetector: React.FC = () => {
  const { alert } = useConfirm();
  const [selectedColor, setSelectedColor] = useState<ColorData>({
    hex: '#14b8a6',
    rgb: { r: 20, g: 184, b: 166 },
    hsl: { h: 174, s: 80, l: 40 }
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedField, setCopiedField] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      await alert({
        title: 'Camera Access Error',
        message: 'Unable to access camera. Please grant camera permissions.',
        variant: 'warning'
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const pickColorFromVideo = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = video.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * video.videoWidth;
    const y = ((e.clientY - rect.top) / rect.height) * video.videoHeight;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b] = imageData.data;

    updateColor(r, g, b);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Get center pixel color
        const centerX = Math.floor(img.width / 2);
        const centerY = Math.floor(img.height / 2);
        const imageData = ctx.getImageData(centerX, centerY, 1, 1);
        const [r, g, b] = imageData.data;

        updateColor(r, g, b);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const updateColor = (r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    setSelectedColor({ hex, rgb: { r, g, b }, hsl });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      <BackgroundEffects variant="subtle" />
      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Pipette className="w-10 h-10 text-cyan-400" />
            Color Detector
          </h1>
          <p className="text-teal-200">Pick colors from your camera or uploaded images</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera/Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 backdrop-blur-xl border border-teal-400/30 rounded-2xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Camera className="w-6 h-6 text-cyan-400" />
              Color Source
            </h2>

            {/* Camera View */}
            <div className="relative bg-black rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
              {isStreaming ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  onClick={pickColorFromVideo}
                  className="w-full h-full object-cover cursor-crosshair"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-900/30 to-cyan-900/30">
                  <div className="text-center">
                    <Pipette className="w-24 h-24 text-teal-400/50 mx-auto mb-4" />
                    <p className="text-teal-200 text-lg">Start camera or upload image</p>
                  </div>
                </div>
              )}

              {isStreaming && (
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm">
                  Click anywhere to pick color
                </div>
              )}
            </div>

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="space-y-3">
              <button
                onClick={isStreaming ? stopCamera : startCamera}
                className={`w-full px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
                  isStreaming
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                } shadow-lg hover:shadow-xl transform hover:scale-105`}
              >
                {isStreaming ? 'Stop Camera' : 'Start Camera'}
              </button>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-teal-400/30 transition-all"
                >
                  <Upload className="w-5 h-5 inline mr-2" />
                  Upload Image
                </button>
              </div>
            </div>
          </motion.div>

          {/* Color Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 backdrop-blur-xl border border-teal-400/30 rounded-2xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Selected Color</h2>

            {/* Color Preview */}
            <motion.div
              className="w-full h-48 rounded-xl mb-6 shadow-2xl border-4 border-white/20"
              style={{ backgroundColor: selectedColor.hex }}
              animate={{ backgroundColor: selectedColor.hex }}
            />

            {/* Color Values */}
            <div className="space-y-4">
              {/* HEX */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-teal-200 text-sm font-medium">HEX</span>
                  <button
                    onClick={() => copyToClipboard(selectedColor.hex, 'hex')}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  >
                    {copiedField === 'hex' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-teal-400" />
                    )}
                  </button>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{selectedColor.hex}</div>
              </div>

              {/* RGB */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-teal-200 text-sm font-medium">RGB</span>
                  <button
                    onClick={() => copyToClipboard(`rgb(${selectedColor.rgb.r}, ${selectedColor.rgb.g}, ${selectedColor.rgb.b})`, 'rgb')}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  >
                    {copiedField === 'rgb' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-teal-400" />
                    )}
                  </button>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {selectedColor.rgb.r}, {selectedColor.rgb.g}, {selectedColor.rgb.b}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div>
                    <div className="text-xs text-teal-300">R</div>
                    <div className="text-lg font-semibold text-white">{selectedColor.rgb.r}</div>
                  </div>
                  <div>
                    <div className="text-xs text-teal-300">G</div>
                    <div className="text-lg font-semibold text-white">{selectedColor.rgb.g}</div>
                  </div>
                  <div>
                    <div className="text-xs text-teal-300">B</div>
                    <div className="text-lg font-semibold text-white">{selectedColor.rgb.b}</div>
                  </div>
                </div>
              </div>

              {/* HSL */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-teal-200 text-sm font-medium">HSL</span>
                  <button
                    onClick={() => copyToClipboard(`hsl(${selectedColor.hsl.h}, ${selectedColor.hsl.s}%, ${selectedColor.hsl.l}%)`, 'hsl')}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  >
                    {copiedField === 'hsl' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-teal-400" />
                    )}
                  </button>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {selectedColor.hsl.h}°, {selectedColor.hsl.s}%, {selectedColor.hsl.l}%
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div>
                    <div className="text-xs text-teal-300">Hue</div>
                    <div className="text-lg font-semibold text-white">{selectedColor.hsl.h}°</div>
                  </div>
                  <div>
                    <div className="text-xs text-teal-300">Sat</div>
                    <div className="text-lg font-semibold text-white">{selectedColor.hsl.s}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-teal-300">Light</div>
                    <div className="text-lg font-semibold text-white">{selectedColor.hsl.l}%</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-blue-900/20 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Pipette className="w-5 h-5 text-blue-400" />
            How to Use
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-teal-200 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-2">From Camera:</h4>
              <ol className="space-y-1 ml-4">
                <li>1. Click "Start Camera" to activate your device camera</li>
                <li>2. Point camera at any colored object</li>
                <li>3. Click on the video to pick the color at that point</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">From Image:</h4>
              <ol className="space-y-1 ml-4">
                <li>1. Click "Upload Image" to select a photo</li>
                <li>2. The center pixel color will be automatically detected</li>
                <li>3. Click any copy button to copy color values</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ColorDetector;
