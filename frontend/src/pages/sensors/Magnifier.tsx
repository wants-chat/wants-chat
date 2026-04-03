import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, Camera, Plus, Minus, RotateCcw } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

const Magnifier: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setError('');
      }
    } catch (err) {
      setError('Unable to access camera. Please grant camera permissions.');
      console.error('Camera error:', err);
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

  const resetZoom = () => {
    setZoom(1);
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
            <ZoomIn className="w-10 h-10 text-cyan-400" />
            Magnifier
          </h1>
          <p className="text-teal-200">Use your camera as a digital magnifying glass</p>
        </motion.div>

        {/* Main Magnifier Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 backdrop-blur-xl border border-teal-400/30 rounded-2xl p-8 shadow-2xl"
        >
          {/* Camera View */}
          <div className="relative bg-black rounded-xl overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
            {isStreaming ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: `scale(${zoom})` }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-900/30 to-cyan-900/30">
                <div className="text-center">
                  <Camera className="w-24 h-24 text-teal-400/50 mx-auto mb-4" />
                  <p className="text-teal-200 text-lg">Camera is not active</p>
                  <p className="text-teal-300 text-sm mt-2">Click "Start Camera" to begin</p>
                </div>
              </div>
            )}

            {/* Zoom Level Indicator */}
            {isStreaming && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-teal-400/30"
              >
                <div className="text-white font-semibold">{zoom.toFixed(1)}x</div>
              </motion.div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Zoom Slider */}
            {isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="text-teal-200 font-medium">Zoom Level</label>
                  <button
                    onClick={resetZoom}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-teal-200 text-sm transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setZoom(Math.max(1, zoom - 0.5))}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    disabled={zoom <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-teal-900/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-teal-500 [&::-webkit-slider-thumb]:to-cyan-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-teal-500 [&::-moz-range-thumb]:to-cyan-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-0"
                  />

                  <button
                    onClick={() => setZoom(Math.min(5, zoom + 0.5))}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    disabled={zoom >= 5}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Zoom Markers */}
                <div className="flex justify-between text-xs text-teal-300 px-1">
                  <span>1x</span>
                  <span>2x</span>
                  <span>3x</span>
                  <span>4x</span>
                  <span>5x</span>
                </div>
              </motion.div>
            )}

            {/* Camera Toggle Button */}
            <button
              onClick={isStreaming ? stopCamera : startCamera}
              className={`w-full px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                isStreaming
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
              } shadow-lg hover:shadow-xl transform hover:scale-105`}
            >
              {isStreaming ? 'Stop Camera' : 'Start Camera'}
            </button>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-red-900/30 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm"
          >
            <p className="text-red-200 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Features Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 backdrop-blur-sm border border-teal-400/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <ZoomIn className="w-5 h-5 text-teal-400" />
              <h3 className="text-white font-semibold">5x Magnification</h3>
            </div>
            <p className="text-teal-200 text-sm">Zoom in up to 5 times for detailed viewing</p>
          </div>

          <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 backdrop-blur-sm border border-teal-400/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Live Camera</h3>
            </div>
            <p className="text-teal-200 text-sm">Real-time camera feed with smooth zooming</p>
          </div>

          <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 backdrop-blur-sm border border-teal-400/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <RotateCcw className="w-5 h-5 text-teal-400" />
              <h3 className="text-white font-semibold">Easy Controls</h3>
            </div>
            <p className="text-teal-200 text-sm">Simple slider and button controls</p>
          </div>
        </motion.div>

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-900/20 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            How to Use
          </h3>
          <ul className="space-y-2 text-teal-200 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">1.</span>
              <span>Click "Start Camera" to activate your device's camera</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">2.</span>
              <span>Use the slider or +/- buttons to adjust zoom level (1x to 5x)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">3.</span>
              <span>Point your camera at any object to magnify it in real-time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">4.</span>
              <span>Click "Reset" to return to normal zoom level</span>
            </li>
          </ul>
        </motion.div>
      </main>
    </div>
  );
};

export default Magnifier;
