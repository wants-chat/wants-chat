import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Loader2, Copy, CheckCircle, Save, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface TranslationResult {
  original: string;
  translated: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: Date;
}

const languages = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
];

const commonPairs = [
  { from: 'en', to: 'es', label: 'English → Spanish' },
  { from: 'en', to: 'fr', label: 'English → French' },
  { from: 'en', to: 'de', label: 'English → German' },
  { from: 'es', to: 'en', label: 'Spanish → English' },
  { from: 'fr', to: 'en', label: 'French → English' },
  { from: 'zh', to: 'en', label: 'Chinese → English' },
];

interface TranslatorToolProps {
  uiConfig?: UIConfig;
}

const TranslatorTool = ({ uiConfig }: TranslatorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedTranslation, setCopiedTranslation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle prefill from uiConfig or gallery edit
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.originalText) {
          setInputText(params.originalText);
          hasPrefill = true;
        } else if (params.inputText) {
          setInputText(params.inputText);
          hasPrefill = true;
        }
        if (params.sourceLanguage) {
          setSourceLanguage(params.sourceLanguage);
          hasPrefill = true;
        }
        if (params.targetLanguage) {
          setTargetLanguage(params.targetLanguage);
          hasPrefill = true;
        }
        if (params.preserveFormatting !== undefined) {
          setPreserveFormatting(params.preserveFormatting);
          hasPrefill = true;
        }
        // Restore the translation result
        if (params.text) {
          const sourceLang = params.sourceLanguage === 'auto'
            ? 'Auto-detected'
            : languages.find(l => l.code === params.sourceLanguage)?.name || params.sourceLanguage;
          const targetLang = languages.find(l => l.code === params.targetLanguage)?.name || params.targetLanguage;
          setResult({
            original: params.originalText || params.inputText || '',
            translated: params.text,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
            timestamp: new Date(),
          });
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.text || params.inputText) {
          setInputText(params.text || params.inputText);
          hasPrefill = true;
        }
        if (params.sourceLanguage) {
          setSourceLanguage(params.sourceLanguage);
          hasPrefill = true;
        }
        if (params.targetLanguage) {
          setTargetLanguage(params.targetLanguage);
          hasPrefill = true;
        }
        if (params.preserveFormatting !== undefined) {
          setPreserveFormatting(params.preserveFormatting);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig]);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    if (targetLanguage === 'auto') {
      setError('Please select a target language');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const sourceLang = sourceLanguage === 'auto'
        ? 'the source language (auto-detect)'
        : languages.find(l => l.code === sourceLanguage)?.name || sourceLanguage;
      const targetLang = languages.find(l => l.code === targetLanguage)?.name || targetLanguage;

      const prompt = `Translate the following text from ${sourceLang} to ${targetLang}.
${preserveFormatting ? 'Preserve the original formatting, line breaks, and structure.' : 'Translate naturally without strict formatting.'}

Text to translate:
${inputText}

Provide only the translation, without any explanations or additional text.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        context: 'translator',
        options: {
          sourceLanguage,
          targetLanguage,
          preserveFormatting,
        },
      });

      const translation = response.data?.text || response.data?.content || response.text || '';

      if (!translation) {
        throw new Error('No translation generated');
      }

      setResult({
        original: inputText,
        translated: translation.trim(),
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        timestamp: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to translate text');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopyTranslation = async () => {
    if (result?.translated) {
      try {
        await navigator.clipboard.writeText(result.translated);
        setCopiedTranslation(true);
        setTimeout(() => setCopiedTranslation(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleSave = async () => {
    if (!result?.translated) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `Translation: ${result.sourceLanguage} → ${result.targetLanguage}`,
        prompt: `Translation from ${result.sourceLanguage} to ${result.targetLanguage}`,
        metadata: {
          text: result.translated,
          toolId: 'translator',
          originalText: result.original,
          inputText: inputText,
          sourceLanguage,
          targetLanguage,
          preserveFormatting,
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

  const handleQuickTranslate = (fromLang: string, toLang: string) => {
    setSourceLanguage(fromLang);
    setTargetLanguage(toLang);
  };

  const handleSwapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      const temp = sourceLanguage;
      setSourceLanguage(targetLanguage);
      setTargetLanguage(temp);

      // Also swap the text if we have a result
      if (result) {
        setInputText(result.translated);
        setResult(null);
      }
    }
  };

  const resetTool = () => {
    setInputText('');
    setResult(null);
    setError(null);
    setCopiedTranslation(false);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <Languages className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{t('tools.translator.aiTranslator', 'AI Translator')}</h2>
            <p className="text-teal-50 text-sm mt-1">{t('tools.translator.translateTextBetween25Languages', 'Translate text between 25+ languages with AI precision')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-white/80">
                <Sparkles className="w-3 h-3" />
                <span>
                  {isEditFromGallery
                    ? t('tools.translator.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.translator.preFilledFromYourRequest', 'Pre-filled from your request')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Quick Language Pairs */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.translator.quickSelect', 'Quick select:')}
          </span>
          {commonPairs.map((pair) => (
            <button
              key={pair.label}
              onClick={() => handleQuickTranslate(pair.from, pair.to)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sourceLanguage === pair.from && targetLanguage === pair.to
                  ? 'bg-teal-600 text-white'
                  : isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {pair.label}
            </button>
          ))}
        </div>

        {/* Language Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.translator.sourceLanguage', 'Source Language')}
            </label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSwapLanguages}
              disabled={sourceLanguage === 'auto'}
              className={`p-2 rounded-lg transition-colors ${
                sourceLanguage === 'auto'
                  ? 'opacity-50 cursor-not-allowed'
                  : isDark
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={t('tools.translator.swapLanguages', 'Swap languages')}
            >
              <ArrowRight className="w-5 h-5 transform rotate-180" />
            </button>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.translator.targetLanguage', 'Target Language')}
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {languages.filter(l => l.code !== 'auto').map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.translator.textToTranslate', 'Text to Translate')}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('tools.translator.enterTextToTranslate', 'Enter text to translate...')}
              rows={8}
              className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Preserve Formatting Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="preserve-formatting"
              checked={preserveFormatting}
              onChange={(e) => setPreserveFormatting(e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="preserve-formatting" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.translator.preserveOriginalFormattingAndLine', 'Preserve original formatting and line breaks')}
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !inputText.trim()}
              className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('tools.translator.translating', 'Translating...')}</span>
                </>
              ) : (
                <>
                  <Languages className="w-5 h-5" />
                  <span>{t('tools.translator.translate', 'Translate')}</span>
                </>
              )}
            </button>

            {result && (
              <button
                onClick={resetTool}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.translator.newTranslation', 'New Translation')}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className={`border rounded-lg p-6 space-y-4 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} flex items-center gap-2`}>
                Translation Result
                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                  {t('tools.translator.editable', 'Editable')}
                </span>
              </h3>
              <div className="flex space-x-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <Check className="w-4 h-4" />
                    {t('tools.translator.saved', 'Saved!')}
                  </span>
                )}
                <button
                  onClick={handleCopyTranslation}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    copiedTranslation
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : isDark
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-100'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  {copiedTranslation ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('tools.translator.copied', 'Copied!')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{t('tools.translator.copy', 'Copy')}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('tools.translator.saving', 'Saving...')}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{t('tools.translator.save', 'Save')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Translation Display */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-semibold mb-2 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                {result.sourceLanguage} → {result.targetLanguage}
              </div>
              <textarea
                value={result.translated}
                onChange={(e) => setResult({ ...result, translated: e.target.value })}
                rows={6}
                className={`w-full bg-transparent border-0 outline-none resize-y whitespace-pre-wrap leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
                placeholder={t('tools.translator.translatedText', 'Translated text...')}
              />
            </div>

            {/* Original Text Reference */}
            <details className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <summary className="cursor-pointer text-sm font-medium hover:text-teal-600 transition-colors">
                {t('tools.translator.viewOriginalText', 'View original text')}
              </summary>
              <div className={`mt-3 p-4 rounded-lg text-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{result.original}</p>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslatorTool;
