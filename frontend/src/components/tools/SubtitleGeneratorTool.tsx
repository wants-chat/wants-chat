import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Subtitles, Upload, Download, Loader2, RefreshCw, X, Copy, Check, FileText, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SubtitleGeneratorToolProps {
  uiConfig?: UIConfig;
}

const outputFormats = [
  { value: 'srt', label: 'SRT', description: 'Most compatible format' },
  { value: 'vtt', label: 'VTT', description: 'Web Video Text Tracks' },
  { value: 'txt', label: 'Plain Text', description: 'Simple transcript' },
  { value: 'json', label: 'JSON', description: 'Structured data format' },
];

const languageOptions = [
  { value: 'auto', label: 'Auto Detect' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
];

export const SubtitleGeneratorTool: React.FC<SubtitleGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  const [outputFormat, setOutputFormat] = useState('srt');
  const [language, setLanguage] = useState('auto');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [speakerLabels, setSpeakerLabels] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load video/audio from URL for prefill
  const loadMediaFromUrl = async (url: string) => {
    setError(null);
    console.log('[SubtitleGeneratorTool] Loading media from URL:', url);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.includes('audio') ? 'prefilled-audio.mp3' : 'prefilled-video.mp4';
      const file = new File([blob], fileName, { type: blob.type || 'video/mp4' });
      setVideoFile(file);
      console.log('[SubtitleGeneratorTool] Media loaded successfully');
    } catch (error) {
      console.log('[SubtitleGeneratorTool] Fetch failed, using placeholder:', error);
      // Fallback: Create placeholder File so UI shows controls
      const fileName = url.includes('audio') ? 'prefilled-audio.mp3' : 'prefilled-video.mp4';
      const placeholderFile = new File([], fileName, { type: 'video/mp4' });
      setVideoFile(placeholderFile);
    }
  };

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      console.log('[SubtitleGeneratorTool] Received params:', params);
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.outputFormat) {
          setOutputFormat(params.outputFormat);
          hasPrefill = true;
        }
        if (params.language) {
          setLanguage(params.language);
          hasPrefill = true;
        }
        if (params.includeTimestamps !== undefined) {
          setIncludeTimestamps(params.includeTimestamps);
          hasPrefill = true;
        }
        if (params.speakerLabels !== undefined) {
          setSpeakerLabels(params.speakerLabels);
          hasPrefill = true;
        }
        // Restore the generated subtitles if available
        if (params.subtitles) {
          setSubtitles(params.subtitles);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Check for video/audio URL in multiple possible field names
        const mediaSource = params.videoUrl || params.video || params.audioUrl || params.audio ||
                            params.sourceVideo || params.sourceFile || params.inputFile || params.file;
        if (mediaSource && typeof mediaSource === 'string') {
          loadMediaFromUrl(mediaSource);
          hasPrefill = true;
        }

        // Handle form data settings
        if (params.formData) {
          if (params.formData.outputFormat) setOutputFormat(params.formData.outputFormat);
          if (params.formData.language) setLanguage(params.formData.language);
          if (params.formData.includeTimestamps !== undefined) setIncludeTimestamps(params.formData.includeTimestamps);
          if (params.formData.speakerLabels !== undefined) setSpeakerLabels(params.formData.speakerLabels);
          hasPrefill = true;
        }

        // Direct params for settings
        if (params.outputFormat) setOutputFormat(params.outputFormat as string);
        if (params.format) setOutputFormat(params.format as string);
        if (params.language) setLanguage(params.language as string);
        hasPrefill = hasPrefill || params.outputFormat || params.format || params.language;
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleSave = async () => {
    if (!subtitles) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'text',
        content: subtitles,
        title: `Subtitles: ${videoFile?.name || 'Untitled'}`,
        prompt: `Subtitle generation in ${outputFormat.toUpperCase()} format`,
        metadata: {
          toolId: 'subtitle-generator',
          outputFormat: outputFormat,
          language: language,
          includeTimestamps: includeTimestamps,
          speakerLabels: speakerLabels,
          subtitles: subtitles,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Call the save callback to refresh the gallery if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setError(null);

    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
      setError('Please select a valid video or audio file (MP4, WebM, MOV, MP3, WAV)');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File size must be less than 25MB (Whisper API limit)');
      return;
    }

    setVideoFile(file);
    setSubtitles(null);
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

  const handleGenerate = async () => {
    if (!videoFile) {
      setError('Please select a video or audio file first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('format', outputFormat);
      formData.append('language', language);
      formData.append('includeTimestamps', includeTimestamps.toString());
      formData.append('speakerLabels', speakerLabels.toString());

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      const response = await api.post('/ai/video/generate-subtitles', formData);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success && response.data?.content) {
        setSubtitles(response.data.content);
      } else if (response.success && response.data?.text) {
        // Fallback to plain text if content is not available
        setSubtitles(response.data.text);
      } else {
        const errorMsg = response.error || 'Failed to generate subtitles';
        setError(errorMsg);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating subtitles');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleCopy = async () => {
    if (subtitles) {
      await navigator.clipboard.writeText(subtitles);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!subtitles) return;

    const extension = outputFormat === 'txt' ? 'txt' : outputFormat;
    const mimeType = outputFormat === 'json' ? 'application/json' : 'text/plain';

    const blob = new Blob([subtitles], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitles-${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setVideoFile(null);
    setSubtitles(null);
    setError(null);
    setProgress(0);
    setOutputFormat('srt');
    setLanguage('auto');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Subtitles className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.subtitleGenerator.subtitleGenerator', 'Subtitle Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.subtitleGenerator.generateSubtitlesFromVideoOr', 'Generate subtitles from video or audio files')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{isEditFromGallery ? t('tools.subtitleGenerator.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.subtitleGenerator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Upload Area */}
        {!subtitles && (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : isDark
                  ? 'border-gray-600 hover:border-blue-500/50 bg-gray-800/50'
                  : 'border-gray-300 hover:border-blue-500/50 bg-gray-50'
              }`}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-2 font-medium`}>
                {videoFile ? videoFile.name : 'Click to upload or drag & drop'}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {videoFile
                  ? formatFileSize(videoFile.size)
                  : 'Supports MP4, WebM, MOV, MP3, WAV (max 25MB)'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,audio/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Options */}
            {videoFile && (
              <div className="space-y-4">
                {/* Output Format */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.subtitleGenerator.outputFormat', 'Output Format')}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {outputFormats.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setOutputFormat(format.value)}
                        className={`p-3 rounded-lg text-left transition-all ${
                          outputFormat === format.value
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                            : isDark
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <p className="font-medium text-sm">{format.label}</p>
                        <p className={`text-xs mt-1 ${outputFormat === format.value ? 'text-blue-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {format.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.subtitleGenerator.audioLanguage', 'Audio Language')}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${
                      isDark
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Options Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="includeTimestamps"
                      checked={includeTimestamps}
                      onChange={(e) => setIncludeTimestamps(e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="includeTimestamps" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.subtitleGenerator.includeTimestamps', 'Include timestamps')}
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="speakerLabels"
                      checked={speakerLabels}
                      onChange={(e) => setSpeakerLabels(e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="speakerLabels" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.subtitleGenerator.identifyDifferentSpeakers', 'Identify different speakers')}
                    </label>
                  </div>
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Processing... {progress}%
                    </p>
                  </div>
                )}

                {/* Generate Button */}
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerate}
                    disabled={isProcessing}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('tools.subtitleGenerator.generatingSubtitles', 'Generating Subtitles...')}
                      </>
                    ) : (
                      <>
                        <Subtitles className="w-5 h-5" />
                        {t('tools.subtitleGenerator.generateSubtitles', 'Generate Subtitles')}
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
          </>
        )}

        {/* Result View */}
        {subtitles && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <FileText className="w-4 h-4" />
                Generated Subtitles ({outputFormat.toUpperCase()})
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('tools.subtitleGenerator.copied', 'Copied!') : t('tools.subtitleGenerator.copy', 'Copy')}
                </button>
              </div>
            </div>

            {/* Subtitle Preview */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border max-h-96 overflow-auto`}>
              <pre className={`text-sm font-mono whitespace-pre-wrap ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {subtitles}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 items-center">
              {saveSuccess && (
                <span className="flex items-center gap-1 text-green-500 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {t('tools.subtitleGenerator.saved', 'Saved!')}
                </span>
              )}
              <button
                onClick={handleDownload}
                className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download {outputFormat.toUpperCase()} File
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="py-3 px-6 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save
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

        {/* Info */}
        {!videoFile && (
          <div className={`${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.subtitleGenerator.subtitleFormats', 'Subtitle Formats')}</h4>
            <ul className={`text-sm space-y-1 list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><strong>{t('tools.subtitleGenerator.srt', 'SRT:')}</strong> {t('tools.subtitleGenerator.mostWidelySupportedFormatFor', 'Most widely supported format for video players')}</li>
              <li><strong>{t('tools.subtitleGenerator.vtt', 'VTT:')}</strong> {t('tools.subtitleGenerator.bestForWebBrowsersAnd', 'Best for web browsers and HTML5 video')}</li>
              <li><strong>{t('tools.subtitleGenerator.plainText', 'Plain Text:')}</strong> {t('tools.subtitleGenerator.simpleTranscriptWithoutTiming', 'Simple transcript without timing')}</li>
              <li><strong>{t('tools.subtitleGenerator.json', 'JSON:')}</strong> {t('tools.subtitleGenerator.structuredDataForDevelopers', 'Structured data for developers')}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtitleGeneratorTool;
