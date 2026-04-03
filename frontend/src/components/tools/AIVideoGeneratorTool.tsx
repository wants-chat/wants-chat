import React, { useState, useEffect, useRef } from 'react';
import { Video, Wand2, Download, Loader2, Play, Settings2, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { imagitarApi, VideoGenerationParams } from '../../lib/imagitarApi';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { api } from '../../lib/api';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface GeneratedVideo {
  url: string;
  prompt: string;
  timestamp: Date;
}

const aspectRatios = [
  { label: 'Landscape (16:9)', value: '16:9' as const },
  { label: 'Portrait (9:16)', value: '9:16' as const },
  { label: 'Square (1:1)', value: '1:1' as const },
];

const videoStyles = [
  { label: 'Cinematic', value: 'cinematic, film quality, professional cinematography, dramatic lighting' },
  { label: 'Animation', value: 'animated, 3d animation, smooth motion, vibrant colors' },
  { label: 'Nature', value: 'nature documentary, natural scenery, peaceful, serene' },
  { label: 'Abstract', value: 'abstract motion, artistic, creative visuals, modern art' },
  { label: 'Product', value: 'product showcase, commercial quality, professional product video' },
  { label: 'Sci-Fi', value: 'science fiction, futuristic, space, technology, neon lights' },
  { label: 'Vintage', value: 'vintage film, retro style, nostalgic, classic cinema' },
  { label: 'Minimal', value: 'minimalist, clean, simple motion, elegant transitions' },
];

const durations = [
  { label: '3 seconds', value: 3 },
  { label: '5 seconds', value: 5 },
  { label: '10 seconds', value: 10 },
];

const COLUMNS: ColumnConfig[] = [
  {
    key: 'prompt',
    header: 'Prompt',
    type: 'string',
  },
  {
    key: 'url',
    header: 'Video URL',
    type: 'string',
  },
  {
    key: 'timestamp',
    header: 'Generated At',
    type: 'date',
    format: (value: Date) => new Date(value).toLocaleString(),
  },
];

interface AIVideoGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const AIVideoGeneratorTool: React.FC<AIVideoGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [selectedAspect, setSelectedAspect] = useState(aspectRatios[0]);
  const [selectedStyle, setSelectedStyle] = useState(videoStyles[0]);
  const [selectedDuration, setSelectedDuration] = useState(durations[1]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [quality, setQuality] = useState<'standard' | 'high'>('standard');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const generatedSectionRef = useRef<HTMLDivElement>(null);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.prompt) {
          setPrompt(params.prompt);
          hasPrefill = true;
        }
        if (params.style) {
          const style = videoStyles.find(s => s.label === params.style);
          if (style) setSelectedStyle(style);
          hasPrefill = true;
        }
        if (params.aspectRatio) {
          const aspect = aspectRatios.find(a => a.label === params.aspectRatio);
          if (aspect) setSelectedAspect(aspect);
          hasPrefill = true;
        }
        if (params.duration) {
          const dur = durations.find(d => d.value === params.duration);
          if (dur) setSelectedDuration(dur);
          hasPrefill = true;
        }
        if (params.quality) {
          setQuality(params.quality);
          hasPrefill = true;
        }
        // Restore the generated video URL if available
        if (params.videoUrl) {
          setGeneratedVideos([{
            url: params.videoUrl,
            prompt: params.prompt || '',
            timestamp: new Date(),
          }]);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic
        if (params.content) {
          setPrompt(params.content);
          hasPrefill = true;
        }
        if (params.text) {
          setPrompt(params.text);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a video description');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const fullPrompt = `${prompt}, ${selectedStyle.value}`;

      const params: VideoGenerationParams = {
        prompt: fullPrompt,
        duration: selectedDuration.value,
        aspectRatio: selectedAspect.value,
        model: quality === 'high' ? 'klingai-1.0-pro' : 'bytedance-2.2',
      };

      const result = await imagitarApi.generateVideo(params);

      if (result.success && result.data?.videoUrl) {
        // Direct video URL returned
        setGeneratedVideos((prev) => [
          {
            url: result.data!.videoUrl!,
            prompt: fullPrompt,
            timestamp: new Date(),
          },
          ...prev,
        ]);
        setTimeout(() => {
          generatedSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      } else if (result.success && result.data?.taskId) {
        // Video is still processing, poll for result
        setError('Video is being processed. This may take 1-3 minutes. Please wait...');
        // Poll for video status
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const statusResult = await imagitarApi.getVideoStatus(result.data!.taskId!);
            if (statusResult.success && statusResult.data?.videoUrl) {
              clearInterval(pollInterval);
              setError(null);

              // Save video to content library
              try {
                await imagitarApi.saveVideo({
                  url: statusResult.data!.videoUrl!,
                  prompt: fullPrompt,
                  model: quality === 'high' ? 'KlingAI 1.0 Pro' : 'ByteDance 2.2',
                  width: selectedAspect.value === '16:9' ? 864 : selectedAspect.value === '9:16' ? 480 : 640,
                  height: selectedAspect.value === '16:9' ? 480 : selectedAspect.value === '9:16' ? 864 : 640,
                  duration: selectedDuration.value,
                  metadata: {
                    aspectRatio: selectedAspect.value,
                    quality,
                  },
                });
              } catch (saveErr) {
                console.warn('Failed to save video to library:', saveErr);
              }

              setGeneratedVideos((prev) => [
                {
                  url: statusResult.data!.videoUrl!,
                  prompt: fullPrompt,
                  timestamp: new Date(),
                },
                ...prev,
              ]);
              setTimeout(() => {
                generatedSectionRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center'
                });
              }, 100);
              setIsGenerating(false);
            } else if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setError('Video generation timed out. Please try again.');
              setIsGenerating(false);
            }
          } catch (pollError) {
            // Keep polling unless max attempts reached
            if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setError('Video generation failed. Please try again.');
              setIsGenerating(false);
            }
          }
        }, 5000); // Poll every 5 seconds
        return; // Don't set isGenerating to false yet
      } else {
        setError(result.error || 'Failed to generate video');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `ai-video-${Date.now()}-${index}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(generatedVideos, COLUMNS, {
      filename: 'ai-videos',
    });
  };

  const handleExportExcel = () => {
    exportToExcel(generatedVideos, COLUMNS, {
      filename: 'ai-videos',
    });
  };

  const handleExportJSON = () => {
    exportToJSON(generatedVideos, {
      filename: 'ai-videos',
    });
  };

  const handleExportPDF = async () => {
    await exportToPDF(generatedVideos, COLUMNS, {
      filename: 'ai-videos',
      title: 'AI Generated Videos',
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
    });
  };

  const handlePrint = () => {
    printData(generatedVideos, COLUMNS, {
      title: 'AI Generated Videos',
    });
  };

  const handleCopyToClipboard = async () => {
    return copyUtil(generatedVideos, COLUMNS, 'json');
  };

  const handleSave = async (videoUrl: string, videoPrompt: string) => {
    if (!videoUrl) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'video',
        url: videoUrl,
        title: `AI Video: ${videoPrompt.slice(0, 50)}${videoPrompt.length > 50 ? '...' : ''}`,
        prompt: videoPrompt,
        metadata: {
          toolId: 'ai-video-generator',
          prompt: prompt,
          style: selectedStyle.label,
          aspectRatio: selectedAspect.label,
          duration: selectedDuration.value,
          quality: quality,
          videoUrl: videoUrl,
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Video className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('tools.aIVideoGenerator.aiVideoGenerator', 'AI Video Generator')}</h3>
              <p className="text-sm text-gray-500">{t('tools.aIVideoGenerator.createStunningVideosWithAi', 'Create stunning videos with AI')}</p>
            </div>
          </div>
          {generatedVideos.length > 0 && (
            <ExportDropdown
              disabled={generatedVideos.length === 0}
              showImport={false}
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">
              {isEditFromGallery
                ? t('tools.aIVideoGenerator.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.aIVideoGenerator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}
            </span>
          </div>
        )}

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('tools.aIVideoGenerator.describeYourVideo', 'Describe your video')}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('tools.aIVideoGenerator.aDroneShotFlyingThrough', 'A drone shot flying through misty mountains at sunrise, revealing a hidden waterfall...')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* Style & Aspect Ratio Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Video Style */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t('tools.aIVideoGenerator.style', 'Style')}</label>
            <select
              value={selectedStyle.label}
              onChange={(e) => {
                const style = videoStyles.find((s) => s.label === e.target.value);
                if (style) setSelectedStyle(style);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 bg-white"
            >
              {videoStyles.map((style) => (
                <option key={style.label} value={style.label}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t('tools.aIVideoGenerator.aspectRatio', 'Aspect Ratio')}</label>
            <select
              value={selectedAspect.label}
              onChange={(e) => {
                const aspect = aspectRatios.find((a) => a.label === e.target.value);
                if (aspect) setSelectedAspect(aspect);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 bg-white"
            >
              {aspectRatios.map((aspect) => (
                <option key={aspect.label} value={aspect.label}>
                  {aspect.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('tools.aIVideoGenerator.duration', 'Duration')}</label>
          <div className="flex gap-3">
            {durations.map((dur) => (
              <button
                key={dur.value}
                onClick={() => setSelectedDuration(dur)}
                className={`flex-1 py-2.5 px-4 rounded-xl border transition-all ${
                  selectedDuration.value === dur.value
                    ? t('tools.aIVideoGenerator.border0d9488Bg0d948810', 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488] font-medium') : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0D9488] transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          {showAdvanced ? t('tools.aIVideoGenerator.hide', 'Hide') : t('tools.aIVideoGenerator.show', 'Show')} Advanced Settings
        </button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            {/* Quality Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t('tools.aIVideoGenerator.quality', 'Quality')}</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setQuality('standard')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border transition-all ${
                    quality === 'standard'
                      ? t('tools.aIVideoGenerator.border0d9488Bg0d9488102', 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488] font-medium') : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {t('tools.aIVideoGenerator.standard', 'Standard')}
                </button>
                <button
                  onClick={() => setQuality('high')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border transition-all ${
                    quality === 'high'
                      ? t('tools.aIVideoGenerator.border0d9488Bg0d9488103', 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488] font-medium') : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {t('tools.aIVideoGenerator.highQuality', 'High Quality')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.aIVideoGenerator.generatingVideo', 'Generating Video...')}
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              {t('tools.aIVideoGenerator.generateVideo', 'Generate Video')}
            </>
          )}
        </button>

        {/* Info Note */}
        <p className="text-xs text-gray-500 text-center">
          {t('tools.aIVideoGenerator.videoGenerationMayTake1', 'Video generation may take 1-3 minutes depending on duration and quality settings.')}
        </p>

        {/* Generated Videos Gallery */}
        {generatedVideos.length > 0 && (
          <div ref={generatedSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Play className="w-4 h-4" />
                {t('tools.aIVideoGenerator.generatedVideos', 'Generated Videos')}
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.aIVideoGenerator.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.aIVideoGenerator.saving', 'Saving...')}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {generatedVideos.map((video, index) => (
                <div
                  key={`${video.timestamp.getTime()}-${index}`}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900"
                >
                  <video
                    src={video.url}
                    controls
                    className="w-full aspect-video object-contain"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={() => handleDownload(video.url, index)}
                      className="p-2 bg-white rounded-lg text-gray-900 hover:bg-gray-100 transition-colors shadow-lg"
                      title={t('tools.aIVideoGenerator.download', 'Download')}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSave(video.url, video.prompt)}
                      disabled={isSaving}
                      className="p-2 bg-[#0D9488] rounded-lg text-white hover:bg-[#0D9488]/90 transition-colors shadow-lg disabled:opacity-50"
                      title={t('tools.aIVideoGenerator.saveToGallery', 'Save to Gallery')}
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600 text-xs line-clamp-2">{video.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedVideos.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIVideoGenerator.yourGeneratedVideosWillAppear', 'Your generated videos will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIVideoGeneratorTool;
