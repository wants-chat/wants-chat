import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid2X2, Loader2, Download, RefreshCw, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PatternGeneratorToolProps {
  config?: UIConfig;
  prefillData?: ToolPrefillData;
}

const patternTypes = [
  { value: 'geometric', label: 'Geometric' },
  { value: 'floral', label: 'Floral' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'tribal', label: 'Tribal/Ethnic' },
  { value: 'art-deco', label: 'Art Deco' },
  { value: 'memphis', label: 'Memphis Style' },
  { value: 'nature', label: 'Nature/Organic' },
  { value: 'minimal', label: 'Minimalist' },
  { value: 'retro', label: 'Retro/Vintage' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'moroccan', label: 'Moroccan' },
  { value: 'polka-dot', label: 'Polka Dots' },
  { value: 'stripes', label: 'Stripes' },
  { value: 'chevron', label: 'Chevron/Zigzag' },
];

const useCases = [
  { value: 'fabric', label: 'Fabric/Textile' },
  { value: 'wallpaper', label: 'Wallpaper' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'web', label: 'Website Background' },
  { value: 'print', label: 'Print Design' },
  { value: 'stationery', label: 'Stationery' },
];

export const PatternGeneratorTool: React.FC<PatternGeneratorToolProps> = ({ config, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [patternType, setPatternType] = useState('geometric');
  const [useCase, setUseCase] = useState('web');
  const [colors, setColors] = useState('');
  const [elements, setElements] = useState('');
  const [seamless, setSeamless] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pattern, setPattern] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config?.params) {
      const params = config.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.patternType) {
          setPatternType(params.patternType);
          hasPrefill = true;
        }
        if (params.useCase) {
          setUseCase(params.useCase);
          hasPrefill = true;
        }
        if (params.colors) {
          setColors(params.colors);
          hasPrefill = true;
        }
        if (params.elements) {
          setElements(params.elements);
          hasPrefill = true;
        }
        if (params.seamless !== undefined) {
          setSeamless(params.seamless);
          hasPrefill = true;
        }
        // Restore the generated image URL if available
        if (params.imageUrl) {
          setPattern(params.imageUrl);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
      }

      setIsPrefilled(hasPrefill);
    } else if (prefillData?.data) {
      if (prefillData.data.patternType) setPatternType(prefillData.data.patternType);
      if (prefillData.data.useCase) setUseCase(prefillData.data.useCase);
      if (prefillData.data.colors) setColors(prefillData.data.colors);
      if (prefillData.data.elements) setElements(prefillData.data.elements);
      if (prefillData.data.seamless !== undefined) setSeamless(prefillData.data.seamless);
      setIsPrefilled(true);
    }
  }, [config, prefillData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const typeLabel = patternTypes.find(t => t.value === patternType)?.label;
      const useCaseLabel = useCases.find(u => u.value === useCase)?.label;

      const prompt = `Create a ${seamless ? 'seamless, tileable' : ''} ${typeLabel} pattern suitable for ${useCaseLabel}. ${colors ? `Color palette: ${colors}.` : ''} ${elements ? `Include these elements: ${elements}.` : ''} The pattern should be:
- Visually balanced and aesthetically pleasing
- ${seamless ? 'Perfectly seamless/tileable' : 'Stand-alone design'}
- High quality and professional
- Suitable for ${useCaseLabel} applications
Style: ${typeLabel} pattern design, clean execution.`;

      const response = await api.post('/ai/image/generate', {
        prompt,
        style: 'pattern',
        aspectRatio: '1:1',
      });

      if (response.success && response.data?.url) {
        setPattern(response.data.url);
      } else {
        setError(response.error || 'Failed to generate pattern');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!pattern) return;

    try {
      const response = await fetch(pattern);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pattern-${patternType}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleSave = async () => {
    if (!pattern) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: pattern,
        title: `Pattern: ${patternTypes.find(t => t.value === patternType)?.label || patternType}`,
        prompt: patternType,
        metadata: {
          toolId: 'pattern-generator',
          patternType: patternType,
          useCase: useCase,
          colors: colors,
          elements: elements,
          seamless: seamless,
          imageUrl: pattern,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Call the save callback to refresh the gallery if provided
      const params = config?.params as Record<string, any>;
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
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-indigo-900/20' : 'from-white to-indigo-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Grid2X2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.patternGenerator.patternGenerator', 'Pattern Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patternGenerator.createSeamlessPatternsForAny', 'Create seamless patterns for any use')}</p>
          </div>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
          <Sparkles className="w-4 h-4" />
          <span>{isEditFromGallery ? t('tools.patternGenerator.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.patternGenerator.formPreFilledFromYour', 'Form pre-filled from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.patternGenerator.patternStyle', 'Pattern Style')}</label>
            <select
              value={patternType}
              onChange={(e) => setPatternType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {patternTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.patternGenerator.useCase', 'Use Case')}</label>
            <select
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {useCases.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.patternGenerator.colorPalette', 'Color Palette')}</label>
          <input
            type="text"
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder={t('tools.patternGenerator.eGNavyAndGold', 'e.g., navy and gold, pastel rainbow, earth tones')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.patternGenerator.specificElementsOptional', 'Specific Elements (Optional)')}</label>
          <input
            type="text"
            value={elements}
            onChange={(e) => setElements(e.target.value)}
            placeholder={t('tools.patternGenerator.eGTrianglesRosesLeaves', 'e.g., triangles, roses, leaves, circles')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={seamless}
            onChange={(e) => setSeamless(e.target.checked)}
            className="w-4 h-4 accent-indigo-500"
          />
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.patternGenerator.seamlessTileablePattern', 'Seamless/Tileable Pattern')}</span>
        </label>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Grid2X2 className="w-5 h-5" />}
          {isGenerating ? t('tools.patternGenerator.creatingPattern', 'Creating Pattern...') : t('tools.patternGenerator.generatePattern', 'Generate Pattern')}
        </button>

        {pattern && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.patternGenerator.yourPattern', 'Your Pattern')}</h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.patternGenerator.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.patternGenerator.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {t('tools.patternGenerator.regenerate', 'Regenerate')}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm"
                >
                  <Download className="w-4 h-4" />
                  {t('tools.patternGenerator.download', 'Download')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.patternGenerator.save', 'Save')}
                </button>
              </div>
            </div>
            <div className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} rounded-xl overflow-hidden`}>
              <img src={pattern} alt="Generated pattern" className="w-full h-auto" />
            </div>
            {seamless && (
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                {t('tools.patternGenerator.thisPatternIsDesignedTo', 'This pattern is designed to be seamlessly tileable')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternGeneratorTool;
