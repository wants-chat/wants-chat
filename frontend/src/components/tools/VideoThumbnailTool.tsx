import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Upload, Download, Loader2, RefreshCw, X, Grid3X3, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import ExportDropdown from '../ui/ExportDropdown';
import { exportToCSV, exportToJSON, ColumnConfig } from '../../lib/toolDataUtils';

interface Thumbnail {
  time: number;
  dataUrl: string;
}

const thumbnailCounts = [
  { value: 4, label: '4 Thumbnails' },
  { value: 9, label: '9 Thumbnails' },
  { value: 16, label: '16 Thumbnails' },
];

const thumbnailSizes = [
  { value: 'small', label: 'Small', width: 320, height: 180 },
  { value: 'medium', label: 'Medium', width: 640, height: 360 },
  { value: 'large', label: 'Large', width: 1280, height: 720 },
];

const COLUMNS: ColumnConfig[] = [
  { key: 'time', header: 'Time (seconds)', type: 'number' },
  { key: 'dataUrl', header: 'Image Data', type: 'string' },
];

interface VideoThumbnailToolProps {
  uiConfig?: UIConfig;
}

export const VideoThumbnailTool: React.FC<VideoThumbnailToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<Thumbnail | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const [thumbnailCount, setThumbnailCount] = useState(9);
  const [thumbnailSize, setThumbnailSize] = useState('medium');
  const [customTime, setCustomTime] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Load video from URL for prefill
  const loadVideoFromUrl = async (url: string) => {
    setError(null);
    console.log('[VideoThumbnailTool] Loading video from URL:', url);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'prefilled-video.mp4', { type: blob.type || 'video/mp4' });
      setVideoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
      console.log('[VideoThumbnailTool] Video loaded successfully');
    } catch (error) {
      console.log('[VideoThumbnailTool] Fetch failed, using URL directly:', error);
      // Fallback: Use URL directly (CORS may still block playback but try anyway)
      setVideoUrl(url);
      // Create placeholder File so UI shows controls
      const placeholderFile = new File([], 'prefilled-video.mp4', { type: 'video/mp4' });
      setVideoFile(placeholderFile);
    }
  };

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      console.log('[VideoThumbnailTool] Received params:', params);

      // Check for video URL in multiple possible field names
      const videoSource = params.videoUrl || params.video || params.sourceVideo ||
                          params.sourceFile || params.inputFile || params.file;
      if (videoSource && typeof videoSource === 'string') {
        loadVideoFromUrl(videoSource);
        setIsPrefilled(true);
      }

      // Handle form data settings
      if (params.formData) {
        if (params.formData.thumbnailCount) setThumbnailCount(Number(params.formData.thumbnailCount));
        if (params.formData.thumbnailSize) setThumbnailSize(params.formData.thumbnailSize);
        if (params.formData.customTime) setCustomTime(params.formData.customTime);
        setIsPrefilled(true);
      }

      // Direct params for settings
      if (params.thumbnailCount) setThumbnailCount(Number(params.thumbnailCount));
      if (params.thumbnailSize) setThumbnailSize(params.thumbnailSize as string);
      if (params.count) setThumbnailCount(Number(params.count));
    }
  }, [uiConfig?.params]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setThumbnails([]);
    setSelectedThumbnail(null);

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setError('Video size must be less than 500MB');
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const captureFrame = (time: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        reject('Video or canvas not available');
        return;
      }

      const sizeConfig = thumbnailSizes.find(s => s.value === thumbnailSize)!;
      canvas.width = sizeConfig.width;
      canvas.height = sizeConfig.height;
      const ctx = canvas.getContext('2d')!;

      video.currentTime = time;

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      };

      video.onerror = () => reject('Error seeking video');
    });
  };

  const handleGenerateThumbnails = async () => {
    if (!videoFile || !videoRef.current) {
      setError('Please select a video first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setThumbnails([]);
    setProgress(0);

    try {
      const newThumbnails: Thumbnail[] = [];
      const interval = duration / (thumbnailCount + 1);

      for (let i = 1; i <= thumbnailCount; i++) {
        const time = interval * i;
        const dataUrl = await captureFrame(time);
        newThumbnails.push({ time, dataUrl });
        setProgress((i / thumbnailCount) * 100);
      }

      setThumbnails(newThumbnails);
    } catch (err: any) {
      setError(err.message || 'Failed to generate thumbnails');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCaptureCustomFrame = async () => {
    if (!videoFile || !videoRef.current) {
      setError('Please select a video first');
      return;
    }

    const timeParts = customTime.split(':');
    let seconds = 0;
    if (timeParts.length === 2) {
      seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
    } else if (timeParts.length === 1) {
      seconds = parseInt(timeParts[0]);
    }

    if (isNaN(seconds) || seconds < 0 || seconds > duration) {
      setError(`Please enter a valid time between 0 and ${formatTime(duration)}`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const dataUrl = await captureFrame(seconds);
      setSelectedThumbnail({ time: seconds, dataUrl });
    } catch (err: any) {
      setError(err.message || 'Failed to capture frame');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (thumbnail: Thumbnail) => {
    const a = document.createElement('a');
    a.href = thumbnail.dataUrl;
    const baseName = videoFile?.name.replace(/\.[^/.]+$/, '') || 'thumbnail';
    a.download = `${baseName}-${formatTime(thumbnail.time).replace(':', '-')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    thumbnails.forEach((thumb, index) => {
      setTimeout(() => handleDownload(thumb), index * 100);
    });
  };

  const handleReset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setThumbnails([]);
    setSelectedThumbnail(null);
    setDuration(0);
    setProgress(0);
    setError(null);
    setCustomTime('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, []);

  const handleExportCSV = () => {
    const exportData = thumbnails.map((thumb) => ({
      time: thumb.time,
      dataUrl: thumb.dataUrl,
    }));
    exportToCSV(exportData, COLUMNS, { filename: 'video-thumbnails' });
  };

  const handleExportJSON = () => {
    const exportData = thumbnails.map((thumb) => ({
      time: thumb.time,
      dataUrl: thumb.dataUrl,
    }));
    exportToJSON(exportData, { filename: 'video-thumbnails' });
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Hidden elements for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <Image className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.videoThumbnail.videoThumbnailGenerator', 'Video Thumbnail Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.videoThumbnail.generateThumbnailsFromVideoFrames', 'Generate thumbnails from video frames')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.videoThumbnail.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Upload Area */}
        {!videoFile && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-pink-500 bg-pink-500/10'
                : isDark
                ? 'border-gray-600 hover:border-pink-500/50 bg-gray-800/50'
                : 'border-gray-300 hover:border-pink-500/50 bg-gray-50'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-2 font-medium`}>
              {t('tools.videoThumbnail.clickToUploadOrDrag', 'Click to upload or drag & drop')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.videoThumbnail.supportsMp4WebmMovMax', 'Supports MP4, WebM, MOV (max 500MB)')}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}

        {/* Video Preview & Options */}
        {videoUrl && thumbnails.length === 0 && !selectedThumbnail && (
          <div className="space-y-6">
            {/* Video Preview */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <video
                ref={videoRef}
                src={videoUrl}
                onLoadedMetadata={handleVideoLoad}
                className="w-full max-h-60 rounded-lg"
                muted
              />
              <p className={`mt-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>{t('tools.videoThumbnail.duration', 'Duration:')}</strong> {formatTime(duration)} | <strong>{t('tools.videoThumbnail.file', 'File:')}</strong> {videoFile?.name}
              </p>
            </div>

            {/* Thumbnail Count */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.videoThumbnail.numberOfThumbnails', 'Number of Thumbnails')}
              </label>
              <div className="flex gap-3">
                {thumbnailCounts.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setThumbnailCount(opt.value)}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                      thumbnailCount === opt.value
                        ? 'bg-pink-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thumbnail Size */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.videoThumbnail.thumbnailSize', 'Thumbnail Size')}
              </label>
              <div className="flex gap-3">
                {thumbnailSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setThumbnailSize(size.value)}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                      thumbnailSize === size.value
                        ? 'bg-pink-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size.label}
                    <span className={`block text-xs mt-1 ${thumbnailSize === size.value ? 'text-pink-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {size.width}x{size.height}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Time Capture */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-pink-50 border-pink-100'} border`}>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.videoThumbnail.orCaptureASpecificFrame', 'Or capture a specific frame')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  placeholder={t('tools.videoThumbnail.eG130Or', 'e.g., 1:30 or 90')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  onClick={handleCaptureCustomFrame}
                  disabled={isProcessing || !customTime}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50'
                      : 'bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-50'
                  }`}
                >
                  {t('tools.videoThumbnail.capture', 'Capture')}
                </button>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.videoThumbnail.generatingThumbnails', 'Generating thumbnails...')}</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{Math.round(progress)}%</span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-2 rounded-full bg-pink-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerateThumbnails}
                disabled={isProcessing}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.videoThumbnail.generating', 'Generating...')}
                  </>
                ) : (
                  <>
                    <Grid3X3 className="w-5 h-5" />
                    {t('tools.videoThumbnail.generateThumbnails', 'Generate Thumbnails')}
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Thumbnails Grid */}
        {thumbnails.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.videoThumbnail.generatedThumbnails', 'Generated Thumbnails')}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadAll}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDark
                      ? 'bg-pink-600 hover:bg-pink-700 text-white'
                      : 'bg-pink-500 hover:bg-pink-600 text-white'
                  }`}
                >
                  {t('tools.videoThumbnail.downloadAll', 'Download All')}
                </button>
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportJSON={handleExportJSON}
                  showImport={false}
                  theme={isDark ? 'dark' : 'light'}
                  disabled={thumbnails.length === 0}
                />
              </div>
            </div>

            <div className={`grid gap-4 ${thumbnailCount === 4 ? 'grid-cols-2' : thumbnailCount === 9 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {thumbnails.map((thumb, index) => (
                <div
                  key={index}
                  className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-2 border group relative`}
                >
                  <img
                    src={thumb.dataUrl}
                    alt={`Thumbnail at ${formatTime(thumb.time)}`}
                    className="w-full rounded-lg"
                  />
                  <p className={`text-xs text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatTime(thumb.time)}
                  </p>
                  <button
                    onClick={() => handleDownload(thumb)}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setThumbnails([])}
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                {t('tools.videoThumbnail.generateNewSet', 'Generate New Set')}
              </button>
              <button
                onClick={handleReset}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Single Thumbnail Result */}
        {selectedThumbnail && thumbnails.length === 0 && (
          <div className="space-y-4">
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Frame at {formatTime(selectedThumbnail.time)}
              </p>
              <img
                src={selectedThumbnail.dataUrl}
                alt="Captured thumbnail"
                className="w-full max-h-80 object-contain rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDownload(selectedThumbnail)}
                className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {t('tools.videoThumbnail.downloadThumbnail', 'Download Thumbnail')}
              </button>
              <button
                onClick={() => setSelectedThumbnail(null)}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                {t('tools.videoThumbnail.captureAnother', 'Capture Another')}
              </button>
              <button
                onClick={handleReset}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoThumbnailTool;
