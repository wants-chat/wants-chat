import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shuffle, Plus, X, Sparkles, RotateCcw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface DecisionMakerToolProps {
  uiConfig?: UIConfig;
}

export const DecisionMakerTool: React.FC<DecisionMakerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [options, setOptions] = useState<string[]>(['', '']);
  const [result, setResult] = useState<string | null>(null);
  const [isChoosing, setIsChoosing] = useState(false);
  const [eliminatedIndex, setEliminatedIndex] = useState<number | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        options?: string[];
      };
      if (params.options && Array.isArray(params.options)) {
        setOptions(params.options);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.options) setOptions(params.options);
      if (params.result) setResult(params.result);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  const addOption = () => {
    if (options.length < 20) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validOptions = options.filter(opt => opt.trim() !== '');

  const makeDecision = () => {
    if (validOptions.length < 2) return;

    setIsChoosing(true);
    setResult(null);

    // Animate through options
    let cycles = 0;
    const maxCycles = 20;
    let currentIdx = 0;

    const interval = setInterval(() => {
      setEliminatedIndex(currentIdx % validOptions.length);
      currentIdx++;
      cycles++;

      if (cycles >= maxCycles) {
        clearInterval(interval);
        setIsChoosing(false);
        const randomIndex = Math.floor(Math.random() * validOptions.length);
        setResult(validOptions[randomIndex]);
        setEliminatedIndex(null);

        // Call onSaveCallback if editing from gallery
        const params = uiConfig?.params as Record<string, any>;
        if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
          params.onSaveCallback();
        }
      }
    }, 100);
  };

  const presets = [
    {
      label: 'Where to Eat',
      options: ['Pizza', 'Sushi', 'Mexican', 'Chinese', 'Indian', 'Thai']
    },
    {
      label: 'What to Watch',
      options: ['Movie', 'TV Show', 'Documentary', 'YouTube', 'Nothing']
    },
    {
      label: 'Weekend Activity',
      options: ['Hiking', 'Movies', 'Shopping', 'Stay Home', 'Beach', 'Museum']
    },
  ];

  // Column configuration for exports
  const COLUMNS: ColumnConfig[] = [
    { key: 'index', header: 'Index', type: 'number' },
    { key: 'option', header: 'Option', type: 'string' },
    { key: 'selected', header: 'Selected', type: 'boolean' },
  ];

  // Export handlers
  const getExportData = () => {
    return validOptions.map((option, idx) => ({
      index: idx + 1,
      option,
      selected: result === option,
    }));
  };

  const handleExportCSV = () => {
    const data = getExportData();
    exportToCSV(data, COLUMNS, { filename: 'decision-maker' });
  };

  const handleExportExcel = () => {
    const data = getExportData();
    exportToExcel(data, COLUMNS, { filename: 'decision-maker' });
  };

  const handleExportJSON = () => {
    const data = {
      options: validOptions,
      result,
      totalOptions: validOptions.length,
      exportDate: new Date().toISOString(),
    };
    exportToJSON([data], { filename: 'decision-maker' });
  };

  const handleExportPDF = async () => {
    const data = getExportData();
    await exportToPDF(data, COLUMNS, {
      filename: 'decision-maker',
      title: 'Decision Maker Report',
      subtitle: `${validOptions.length} Options Analysis`,
    });
  };

  const handlePrint = () => {
    const data = getExportData();
    printData(data, COLUMNS, { title: 'Decision Maker Report' });
  };

  const handleCopyToClipboard = async () => {
    const data = getExportData();
    return await copyUtil(data, COLUMNS, 'tab');
  };

  const applyPreset = (preset: { options: string[] }) => {
    setOptions([...preset.options]);
    setResult(null);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Shuffle className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.decisionMaker.decisionMaker', 'Decision Maker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.decisionMaker.letFateDecideForYou', 'Let fate decide for you')}</p>
            </div>
          </div>
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            disabled={validOptions.length === 0}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.decisionMaker.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Presets */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.decisionMaker.quickPresets', 'Quick Presets')}
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Your Options ({validOptions.length} valid)
            </label>
            <button
              onClick={() => setOptions(['', ''])}
              className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <RotateCcw className="w-3 h-3" />
              {t('tools.decisionMaker.clear', 'Clear')}
            </button>
          </div>

          <div className="space-y-2">
            {options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 ${
                  isChoosing && eliminatedIndex === index ? 'animate-pulse' : ''
                }`}
              >
                <span className={`w-6 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className={`flex-1 px-4 py-2.5 rounded-lg border transition-all ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${
                    result === option ? 'ring-2 ring-pink-500 border-pink-500' : ''
                  } ${
                    isChoosing && eliminatedIndex === index ? 'bg-pink-500/20' : ''
                  }`}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark
                        ? 'hover:bg-gray-800 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 20 && (
            <button
              onClick={addOption}
              className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'border-gray-700 hover:border-gray-600 text-gray-400'
                  : 'border-gray-300 hover:border-gray-400 text-gray-500'
              }`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.decisionMaker.addOption', 'Add Option')}
            </button>
          )}
        </div>

        {/* Decision Button */}
        <button
          onClick={makeDecision}
          disabled={validOptions.length < 2 || isChoosing}
          className={`w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xl rounded-xl transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed ${
            isChoosing ? 'animate-pulse' : ''
          }`}
        >
          {isChoosing ? t('tools.decisionMaker.choosing', '✨ Choosing...') : t('tools.decisionMaker.makeADecision', '🎲 Make a Decision')}
        </button>

        {/* Result */}
        {result && !isChoosing && (
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-100'} border`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>
                {t('tools.decisionMaker.theDecisionIs', 'The Decision Is...')}
              </span>
              <Sparkles className="w-5 h-5 text-pink-500" />
            </div>
            <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {result}
            </div>
            <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Trust the process! This was randomly chosen from {validOptions.length} options.
            </p>
          </div>
        )}

        {/* Wheel Animation Placeholder */}
        {validOptions.length >= 2 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex flex-wrap gap-2 justify-center">
              {validOptions.map((opt, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    result === opt
                      ? 'bg-pink-500 text-white scale-110'
                      : isDark
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {opt}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.decisionMaker.tip', 'Tip:')}</strong> Can't decide? Let randomness help! Add all your options and let the
            Decision Maker pick one for you. Sometimes the best choice is the one you don't make!
          </p>
        </div>
      </div>
    </div>
  );
};

export default DecisionMakerTool;
