import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scissors, Upload, Download, Loader2, RefreshCw, X, Play, Pause, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface TimeRange {
  start: number;
  end: number;
}

interface VideoTrimmerToolProps {
  uiConfig?: UIConfig;
}

export const VideoTrimmerTool: React.FC<VideoTrimmerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);

  const [timeRange, setTimeRange] = useState<TimeRange>({ start: 0, end: 0 });
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Load video from URL for prefill
  const loadVideoFromUrl = async (url: string) => {
    setError(null);
    console.log('[VideoTrimmerTool] Loading video from URL:', url);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'prefilled-video.mp4', { type: blob.type || 'video/mp4' });
      setVideoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
      console.log('[VideoTrimmerTool] Video loaded successfully');
    } catch (error) {
      console.log('[VideoTrimmerTool] Fetch failed, using URL directly:', error);
      // Fallback: Use URL directly
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
      console.log('[VideoTrimmerTool] Received params:', params);

      // Check for video URL in multiple possible field names
      const videoSource = params.videoUrl || params.video || params.sourceVideo ||
                          params.sourceFile || params.inputFile || params.file;
      if (videoSource && typeof videoSource === 'string') {
        loadVideoFromUrl(videoSource);
        setIsPrefilled(true);
      }

      // Handle form data settings
      if (params.formData) {
        if (params.formData.startTime !== undefined) {
          setTimeRange(prev => ({ ...prev, start: Number(params.formData.startTime) }));
        }
        if (params.formData.endTime !== undefined) {
          setTimeRange(prev => ({ ...prev, end: Number(params.formData.endTime) }));
        }
        setIsPrefilled(true);
      }

      // Handle numbers array for time range
      if (params.numbers && params.numbers.length >= 2) {
        setTimeRange({ start: params.numbers[0], end: params.numbers[1] });
        setIsPrefilled(true);
      }

      // Direct params for times
      if (params.startTime !== undefined) {
        setTimeRange(prev => ({ ...prev, start: Number(params.startTime) }));
        setIsPrefilled(true);
      }
      if (params.endTime !== undefined) {
        setTimeRange(prev => ({ ...prev, end: Number(params.endTime) }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const [mins, secsMs] = parts;
      const [secs, ms] = secsMs.split('.');
      return parseInt(mins) * 60 + parseInt(secs) + (parseInt(ms || '0') / 100);
    }
    return 0;
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setTrimmedUrl(null);

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
      const dur = videoRef.current.duration;
      setDuration(dur);
      setTimeRange({ start: 0, end: dur });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.currentTime = timeRange.start;
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTrimVideo = async () => {
    if (!videoFile) {
      setError('Please select a video first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Client-side video trimming using MediaRecorder API
      // Note: For production, this would use FFmpeg.wasm or backend processing

      const video = document.createElement('video');
      video.src = videoUrl!;
      video.muted = true;

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
      });

      video.currentTime = timeRange.start;

      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;

      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setTrimmedUrl(url);
        setIsProcessing(false);
      };

      mediaRecorder.start();
      video.play();

      const drawFrame = () => {
        if (video.currentTime >= timeRange.end || video.ended) {
          mediaRecorder.stop();
          video.pause();
          return;
        }
        ctx.drawImage(video, 0, 0);
        requestAnimationFrame(drawFrame);
      };

      drawFrame();

    } catch (err: any) {
      setError(err.message || 'Failed to trim video. Try a shorter clip or different format.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!trimmedUrl) return;

    const a = document.createElement('a');
    a.href = trimmedUrl;
    a.download = `trimmed-${videoFile?.name || 'video.webm'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (trimmedUrl) URL.revokeObjectURL(trimmedUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setTrimmedUrl(null);
    setDuration(0);
    setCurrentTime(0);
    setTimeRange({ start: 0, end: 0 });
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const setStartToCurrentTime = () => {
    if (videoRef.current) {
      setTimeRange(prev => ({ ...prev, start: videoRef.current!.currentTime }));
    }
  };

  const setEndToCurrentTime = () => {
    if (videoRef.current) {
      setTimeRange(prev => ({ ...prev, end: videoRef.current!.currentTime }));
    }
  };

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (trimmedUrl) URL.revokeObjectURL(trimmedUrl);
    };
  }, []);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Scissors className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.videoTrimmer.videoTrimmer', 'Video Trimmer')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.videoTrimmer.cutAndTrimVideosTo', 'Cut and trim videos to specific timestamps')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.videoTrimmer.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
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
                ? 'border-orange-500 bg-orange-500/10'
                : isDark
                ? 'border-gray-600 hover:border-orange-500/50 bg-gray-800/50'
                : 'border-gray-300 hover:border-orange-500/50 bg-gray-50'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-2 font-medium`}>
              {t('tools.videoTrimmer.clickToUploadOrDrag', 'Click to upload or drag & drop')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.videoTrimmer.supportsMp4WebmMovMax', 'Supports MP4, WebM, MOV (max 500MB)')}
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

        {/* Video Player & Controls */}
        {videoUrl && !trimmedUrl && (
          <div className="space-y-6">
            {/* Video Preview */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <video
                ref={videoRef}
                src={videoUrl}
                onLoadedMetadata={handleVideoLoad}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="w-full max-h-80 rounded-lg"
                controls={false}
              />

              {/* Play Controls */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={togglePlayPause}
                  className={`p-3 rounded-full ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <span className={`font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Timeline Slider */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.videoTrimmer.videoTimeline', 'Video Timeline')}
              </label>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={(e) => {
                  const time = parseFloat(e.target.value);
                  setCurrentTime(time);
                  if (videoRef.current) videoRef.current.currentTime = time;
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Trim Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.videoTrimmer.startTime', 'Start Time')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formatTime(timeRange.start)}
                    onChange={(e) => {
                      const time = parseTime(e.target.value);
                      if (!isNaN(time) && time >= 0 && time < timeRange.end) {
                        setTimeRange(prev => ({ ...prev, start: time }));
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border font-mono text-sm ${
                      isDark
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <button
                    onClick={setStartToCurrentTime}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    {t('tools.videoTrimmer.set', 'Set')}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.videoTrimmer.endTime', 'End Time')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formatTime(timeRange.end)}
                    onChange={(e) => {
                      const time = parseTime(e.target.value);
                      if (!isNaN(time) && time > timeRange.start && time <= duration) {
                        setTimeRange(prev => ({ ...prev, end: time }));
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border font-mono text-sm ${
                      isDark
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <button
                    onClick={setEndToCurrentTime}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    {t('tools.videoTrimmer.set2', 'Set')}
                  </button>
                </div>
              </div>
            </div>

            {/* Clip Duration */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-orange-50 border-orange-100'} border`}>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-orange-800'}`}>
                <strong>{t('tools.videoTrimmer.clipDuration', 'Clip Duration:')}</strong> {formatTime(timeRange.end - timeRange.start)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleTrimVideo}
                disabled={isProcessing || timeRange.end <= timeRange.start}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.videoTrimmer.trimmingVideo', 'Trimming Video...')}
                  </>
                ) : (
                  <>
                    <Scissors className="w-5 h-5" />
                    {t('tools.videoTrimmer.trimVideo', 'Trim Video')}
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

        {/* Trimmed Result */}
        {trimmedUrl && (
          <div className="space-y-4">
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.videoTrimmer.trimmedVideo', 'Trimmed Video')}</p>
              <video
                src={trimmedUrl}
                controls
                className="w-full max-h-80 rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {t('tools.videoTrimmer.downloadTrimmedVideo', 'Download Trimmed Video')}
              </button>
              <button
                onClick={() => setTrimmedUrl(null)}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                {t('tools.videoTrimmer.trimAgain', 'Trim Again')}
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

export default VideoTrimmerTool;
