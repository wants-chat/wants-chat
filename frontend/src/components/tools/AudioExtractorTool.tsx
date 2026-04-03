import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Upload, Download, Loader2, RefreshCw, X, Volume2, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const audioFormats = [
  { value: 'mp3', label: 'MP3', description: 'Most compatible format' },
  { value: 'wav', label: 'WAV', description: 'Lossless, larger file' },
  { value: 'webm', label: 'WebM', description: 'Web optimized' },
  { value: 'ogg', label: 'OGG', description: 'Open format' },
];

const qualityOptions = [
  { value: 'high', label: 'High', bitrate: '320kbps' },
  { value: 'medium', label: 'Medium', bitrate: '192kbps' },
  { value: 'low', label: 'Low', bitrate: '128kbps' },
];

interface AudioExtractorToolProps {
  uiConfig?: UIConfig;
}

export const AudioExtractorTool: React.FC<AudioExtractorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const [outputFormat, setOutputFormat] = useState('mp3');
  const [quality, setQuality] = useState('high');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Load video from URL for prefill
  const loadVideoFromUrl = async (url: string) => {
    setError(null);
    console.log('[AudioExtractorTool] Loading video from URL:', url);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'prefilled-video.mp4', { type: blob.type || 'video/mp4' });
      setVideoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
      console.log('[AudioExtractorTool] Video loaded successfully');
    } catch (error) {
      console.log('[AudioExtractorTool] Fetch failed, using URL directly:', error);
      // Fallback: Use URL directly
      setVideoUrl(url);
      // Create placeholder File so UI shows controls
      const placeholderFile = new File([], 'prefilled-video.mp4', { type: 'video/mp4' });
      setVideoFile(placeholderFile);
    }
  };

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        outputFormat?: string;
        quality?: string;
      };
      console.log('[AudioExtractorTool] Received params:', params);

      // Check for video URL in multiple possible field names
      const videoSource = params.videoUrl || params.video || params.sourceVideo ||
                          params.sourceFile || params.inputFile || params.file;
      if (videoSource && typeof videoSource === 'string') {
        loadVideoFromUrl(videoSource);
        setIsPrefilled(true);
      }

      // Direct params for settings
      if (params.outputFormat) setOutputFormat(params.outputFormat);
      if (params.format) setOutputFormat(params.format as string);
      if (params.quality) setQuality(params.quality);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setAudioUrl(null);

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

  const handleExtractAudio = async () => {
    if (!videoFile || !videoRef.current) {
      setError('Please select a video first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // Create audio context for extraction
      const audioContext = new AudioContext();
      const video = videoRef.current;

      // Create media element source
      const source = audioContext.createMediaElementSource(video);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination);

      // Use MediaRecorder to capture audio
      const mimeType = outputFormat === 'webm' ? t('tools.audioExtractor.audioWebm', 'audio/webm') : t('tools.audioExtractor.audioWebmCodecsOpus', 'audio/webm;codecs=opus');
      const mediaRecorder = new MediaRecorder(destination.stream, { mimeType: 'audio/webm' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setIsProcessing(false);
        setProgress(100);
      };

      // Start recording and play video
      video.currentTime = 0;
      mediaRecorder.start();
      video.muted = false;
      await video.play();

      // Update progress
      const updateProgress = () => {
        if (video.currentTime < video.duration) {
          setProgress((video.currentTime / video.duration) * 100);
          requestAnimationFrame(updateProgress);
        }
      };
      updateProgress();

      // Stop when video ends
      video.onended = () => {
        mediaRecorder.stop();
        video.muted = true;
      };

    } catch (err: any) {
      setError(err.message || 'Failed to extract audio. Please try a different video.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    const a = document.createElement('a');
    a.href = audioUrl;
    const baseName = videoFile?.name.replace(/\.[^/.]+$/, '') || 'audio';
    a.download = `${baseName}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setAudioUrl(null);
    setDuration(0);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Music className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.audioExtractor.audioExtractor', 'Audio Extractor')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.audioExtractor.extractAudioFromVideoFiles', 'Extract audio from video files')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.audioExtractor.settingsHaveBeenPrefilledFrom', 'Settings have been prefilled from AI suggestions')}
            </span>
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
                ? 'border-green-500 bg-green-500/10'
                : isDark
                ? 'border-gray-600 hover:border-green-500/50 bg-gray-800/50'
                : 'border-gray-300 hover:border-green-500/50 bg-gray-50'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-2 font-medium`}>
              {t('tools.audioExtractor.clickToUploadOrDrag', 'Click to upload or drag & drop')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.audioExtractor.supportsMp4WebmMovAvi', 'Supports MP4, WebM, MOV, AVI (max 500MB)')}
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
        {videoUrl && !audioUrl && (
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
              <div className={`mt-3 flex items-center justify-between text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span><strong>{t('tools.audioExtractor.file', 'File:')}</strong> {videoFile?.name}</span>
                <span><strong>{t('tools.audioExtractor.duration', 'Duration:')}</strong> {formatTime(duration)}</span>
                <span><strong>{t('tools.audioExtractor.size', 'Size:')}</strong> {formatFileSize(videoFile?.size || 0)}</span>
              </div>
            </div>

            {/* Output Format */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.audioExtractor.outputFormat', 'Output Format')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {audioFormats.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setOutputFormat(format.value)}
                    className={`p-3 rounded-lg text-left transition-all ${
                      outputFormat === format.value
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-medium text-sm">{format.label}</p>
                    <p className={`text-xs mt-1 ${outputFormat === format.value ? 'text-green-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {format.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.audioExtractor.audioQuality', 'Audio Quality')}
              </label>
              <div className="flex gap-3">
                {qualityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setQuality(opt.value)}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                      quality === opt.value
                        ? 'bg-green-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                    <span className={`block text-xs mt-1 ${quality === opt.value ? 'text-green-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {opt.bitrate}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.audioExtractor.extractingAudio', 'Extracting audio...')}</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{Math.round(progress)}%</span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-2 rounded-full bg-green-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleExtractAudio}
                disabled={isProcessing}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.audioExtractor.extracting', 'Extracting...')}
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    {t('tools.audioExtractor.extractAudio', 'Extract Audio')}
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

        {/* Audio Result */}
        {audioUrl && (
          <div className="space-y-4">
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Music className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.audioExtractor.audioExtractedSuccessfully', 'Audio Extracted Successfully')}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Format: WebM | Duration: {formatTime(duration)}
                  </p>
                </div>
              </div>
              <audio
                src={audioUrl}
                controls
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {t('tools.audioExtractor.downloadAudio', 'Download Audio')}
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

export default AudioExtractorTool;
