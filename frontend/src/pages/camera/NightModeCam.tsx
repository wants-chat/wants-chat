import React, { useState, useRef, useEffect } from 'react';
import { Camera, Moon, Sun, Download, RefreshCw, X } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

const NightModeCam: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please grant permission.');
      setIsActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Apply filters before drawing
        context.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);

        // Save to localStorage
        const photos = JSON.parse(localStorage.getItem('nightModePhotos') || '[]');
        photos.unshift({
          id: Date.now(),
          image: imageData,
          timestamp: new Date().toISOString(),
          brightness,
          contrast,
        });
        localStorage.setItem('nightModePhotos', JSON.stringify(photos.slice(0, 50)));
      }
    }
  };

  const downloadPhoto = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `night-mode-${Date.now()}.png`;
      link.click();
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl mb-4">
              <Moon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Night Mode Camera</h1>
            <p className="text-gray-400">Enhanced low-light photography with brightness and contrast controls</p>
          </div>

          {/* Camera View */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-teal-500/30 overflow-hidden mb-6">
            <div className="aspect-video bg-black relative">
              {isActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    style={{
                      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                    }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">Camera is off</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center text-red-400">
                    <p>{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-6 space-y-4">
              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Brightness
                    </label>
                    <span className="text-sm text-teal-400">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">Contrast</label>
                    <span className="text-sm text-teal-400">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`flex-1 min-w-[150px] px-6 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white'
                  }`}
                >
                  {isActive ? 'Stop Camera' : 'Start Camera'}
                </button>

                {isActive && (
                  <>
                    <button
                      onClick={capturePhoto}
                      className="px-6 py-3 bg-white text-slate-900 rounded-xl font-medium hover:bg-gray-100 transition-all"
                    >
                      <Camera className="w-5 h-5 inline mr-2" />
                      Capture
                    </button>

                    <button
                      onClick={switchCamera}
                      className="px-6 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-all"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-teal-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Captured Photo</h3>
                <button
                  onClick={() => setCapturedImage(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4">
                <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
              </div>

              <button
                onClick={downloadPhoto}
                className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all"
              >
                <Download className="w-5 h-5 inline mr-2" />
                Download Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NightModeCam;
