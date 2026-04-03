import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Type, Copy, Check, RefreshCw, Sparkles, Save, CheckCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { api } from '../../lib/api';

interface AcronymGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const AcronymGeneratorTool: React.FC<AcronymGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [phrase, setPhrase] = useState('');
  const [style, setStyle] = useState<'first' | 'capital' | 'custom'>('first');
  const [separator, setSeparator] = useState('');
  const [copied, setCopied] = useState(false);

  const acronym = useMemo(() => {
    if (!phrase.trim()) return '';

    switch (style) {
      case 'first':
        return phrase
          .split(/\s+/)
          .filter(word => word.length > 0)
          .map(word => word[0])
          .join(separator)
          .toUpperCase();
      case 'capital':
        return phrase
          .split('')
          .filter(char => char >= 'A' && char <= 'Z')
          .join(separator);
      case 'custom':
        return phrase
          .split(/\s+/)
          .filter(word => word.length > 0 && /^[a-zA-Z]/.test(word))
          .map(word => word[0])
          .join(separator)
          .toUpperCase();
      default:
        return '';
    }
  }, [phrase, style, separator]);

  const handleCopy = () => {
    navigator.clipboard.writeText(acronym);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!acronym) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `Acronym: ${acronym}`,
        prompt: `Acronym from "${phrase}"`,
        metadata: {
          text: acronym,
          toolId: 'acronym-generator',
          phrase,
          style,
          separator,
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

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.phrase || params.text || params.content || params.title) {
          setPhrase(params.phrase || params.text || params.content || params.title || '');
          hasPrefill = true;
        }
        if (params.style) {
          setStyle(params.style);
          hasPrefill = true;
        }
        if (params.separator !== undefined) {
          setSeparator(params.separator);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        const textContent = params.text || params.content || params.title || '';
        if (textContent) {
          setPhrase(textContent);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const examples = [
    { phrase: 'As Soon As Possible', acronym: 'ASAP' },
    { phrase: 'Frequently Asked Questions', acronym: 'FAQ' },
    { phrase: 'Do It Yourself', acronym: 'DIY' },
    { phrase: 'For Your Information', acronym: 'FYI' },
    { phrase: 'Application Programming Interface', acronym: 'API' },
    { phrase: 'User Experience', acronym: 'UX' },
  ];

  const presetPhrases = [
    'Search Engine Optimization',
    'Customer Relationship Management',
    'Return On Investment',
    'Key Performance Indicator',
    'Content Management System',
    'Artificial Intelligence',
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Type className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.acronymGenerator.acronymGenerator', 'Acronym Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.acronymGenerator.createAcronymsFromPhrases', 'Create acronyms from phrases')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Enter Phrase
            {isPrefilled && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-purple-500">
                <Sparkles className="w-3 h-3" />
                {isEditFromGallery ? t('tools.acronymGenerator.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.acronymGenerator.prefilledFromAi', 'Prefilled from AI')}
              </span>
            )}
          </label>
          <textarea
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder={t('tools.acronymGenerator.enterAPhraseToCreate', 'Enter a phrase to create an acronym...')}
            rows={3}
            className={`w-full px-4 py-3 rounded-lg border resize-none ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
        </div>

        {/* Quick Examples */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.acronymGenerator.tryThese', 'Try These')}
          </label>
          <div className="flex flex-wrap gap-2">
            {presetPhrases.map((preset) => (
              <button
                key={preset}
                onClick={() => setPhrase(preset)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.acronymGenerator.style', 'Style')}
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="first">{t('tools.acronymGenerator.firstLetterOfEachWord', 'First Letter of Each Word')}</option>
              <option value="capital">{t('tools.acronymGenerator.capitalLettersOnly', 'Capital Letters Only')}</option>
              <option value="custom">{t('tools.acronymGenerator.wordsStartingWithLetters', 'Words Starting with Letters')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.acronymGenerator.separator', 'Separator')}
            </label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">None</option>
              <option value=".">{t('tools.acronymGenerator.dotsABC', 'Dots (A.B.C)')}</option>
              <option value="-">{t('tools.acronymGenerator.dashesABC', 'Dashes (A-B-C)')}</option>
              <option value=" ">{t('tools.acronymGenerator.spacesABC', 'Spaces (A B C)')}</option>
            </select>
          </div>
        </div>

        {/* Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-100'} border`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
              {t('tools.acronymGenerator.yourAcronym', 'Your Acronym')}
            </span>
          </div>
          <div className={`text-5xl font-bold tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {acronym || '...'}
          </div>
          {acronym && (
            <button
              onClick={handleCopy}
              className={`mt-4 px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.acronymGenerator.copied', 'Copied!') : t('tools.acronymGenerator.copyAcronym', 'Copy Acronym')}
            </button>
          )}
        </div>

        {/* Common Acronyms Reference */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.acronymGenerator.commonAcronymsReference', 'Common Acronyms Reference')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {examples.map((ex) => (
              <div
                key={ex.acronym}
                className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <div className={`font-bold text-purple-500`}>{ex.acronym}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {ex.phrase}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.acronymGenerator.tip', 'Tip:')}</strong> Acronyms are great for creating memorable abbreviations for
            projects, organizations, or concepts. Make sure it's easy to pronounce!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcronymGeneratorTool;
