import React, { useState, useRef, useEffect } from 'react';
import { Camera, Eye, EyeOff, Download, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

const BlankCam: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string>('');
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
      stopRecording();
    }

    return () => {
      stopCamera();
      stopRecording();
    };
  }, [isActive, facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: !isMuted,
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
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);

        // Save to localStorage
        const photos = JSON.parse(localStorage.getItem('blankCamPhotos') || '[]');
        photos.unshift({
          id: Date.now(),
          image: imageData,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('blankCamPhotos', JSON.stringify(photos.slice(0, 50)));
      }
    }
  };

  const startRecording = () => {
    if (stream && !isRecording) {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videos = JSON.parse(localStorage.getItem('blankCamVideos') || '[]');
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          videos.unshift({
            id: Date.now(),
            video: reader.result,
            timestamp: new Date().toISOString(),
          });
          localStorage.setItem('blankCamVideos', JSON.stringify(videos.slice(0, 20)));
        };
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordedChunks([]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadPhoto = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `stealth-photo-${Date.now()}.png`;
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl mb-4 border border-slate-600">
              <EyeOff className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Stealth Camera</h1>
            <p className="text-gray-400">Capture photos and videos discreetly with a black screen overlay</p>
          </div>

          {/* Camera View */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-600/50 overflow-hidden mb-6">
            <div className="aspect-video bg-black relative">
              {/* Hidden Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isMuted}
                className={`w-full h-full object-cover ${showPreview ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Black Overlay */}
              {!showPreview && isActive && (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <div className="text-center">
                    <EyeOff className="w-16 h-16 text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-700">Stealth Mode Active</p>
                    {isRecording && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                        <span className="text-red-600 text-sm">Recording</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isActive && (
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
              {/* Settings */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={!isActive}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      showPreview
                        ? 'bg-teal-500 text-white'
                        : 'bg-slate-700 text-gray-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {showPreview ? 'Preview On' : 'Preview Off'}
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      isMuted
                        ? 'bg-slate-700 text-gray-300'
                        : 'bg-teal-500 text-white'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`flex-1 min-w-[150px] px-6 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white'
                  }`}
                >
                  {isActive ? 'Stop Camera' : 'Start Camera'}
                </button>

                {isActive && (
                  <>
                    <button
                      onClick={capturePhoto}
                      disabled={isRecording}
                      className="px-6 py-3 bg-white text-slate-900 rounded-xl font-medium hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Camera className="w-5 h-5 inline mr-2" />
                      Capture
                    </button>

                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        isRecording
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white'
                      }`}
                    >
                      {isRecording ? 'Stop Recording' : 'Record'}
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
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-600/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Latest Capture</h3>
                <button
                  onClick={() => setCapturedImage(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <EyeOff className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4">
                <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
              </div>

              <button
                onClick={downloadPhoto}
                className="w-full px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl font-medium transition-all"
              >
                <Download className="w-5 h-5 inline mr-2" />
                Download Photo
              </button>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mt-6">
            <p className="text-amber-200 text-sm text-center">
              <strong>Privacy Notice:</strong> This tool is designed for legitimate privacy purposes only.
              Always respect others' privacy and follow local laws regarding recording.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlankCam;
