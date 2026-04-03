import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Volume2, Shield, AlertTriangle, Clock, Plus, Trash2, Info, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ExposureResult {
  safeExposureTime: string;
  safeExposureMinutes: number;
  riskLevel: 'safe' | 'moderate' | 'high' | 'extreme';
  riskText: string;
  riskColor: string;
  protection: string[];
}

interface NoiseExposure {
  id: string;
  decibels: number;
  durationMinutes: number;
}

interface DailyDoseResult {
  totalDose: number;
  isOverExposed: boolean;
  remainingDose: number;
  riskLevel: 'safe' | 'moderate' | 'high' | 'extreme';
}

const COMMON_NOISE_LEVELS = [
  { name: 'Whisper', decibels: 30, icon: 'quiet' },
  { name: 'Normal Conversation', decibels: 60, icon: 'normal' },
  { name: 'Vacuum Cleaner', decibels: 75, icon: 'moderate' },
  { name: 'City Traffic', decibels: 85, icon: 'moderate' },
  { name: 'Lawn Mower', decibels: 90, icon: 'loud' },
  { name: 'Motorcycle', decibels: 95, icon: 'loud' },
  { name: 'Power Tools', decibels: 100, icon: 'very-loud' },
  { name: 'Rock Concert', decibels: 110, icon: 'extreme' },
  { name: 'Chainsaw', decibels: 115, icon: 'extreme' },
  { name: 'Jet Engine (100ft)', decibels: 130, icon: 'dangerous' },
  { name: 'Fireworks', decibels: 140, icon: 'dangerous' },
];

const HEARING_PROTECTION_TIPS = [
  'Use earplugs or earmuffs in noisy environments',
  'Take regular breaks from loud noise exposure',
  'Keep personal audio device volume at 60% or below',
  'Maintain distance from loud noise sources when possible',
  'Get regular hearing check-ups if exposed to loud noise frequently',
  'Use noise-canceling headphones to avoid turning volume up too high',
  'Wear hearing protection when using power tools or lawn equipment',
];

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'decibels', header: 'Noise Level (dB)', type: 'number' },
  { key: 'durationMinutes', header: 'Duration (Minutes)', type: 'number' },
];

interface NoiseExposureCalculatorToolProps {
  uiConfig?: UIConfig;
}

export function NoiseExposureCalculatorTool({ uiConfig }: NoiseExposureCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [decibels, setDecibels] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setDecibels(String(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setDecibels(numMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);
  const [result, setResult] = useState<ExposureResult | null>(null);
  const [exposures, setExposures] = useState<NoiseExposure[]>([]);
  const [newExposureDb, setNewExposureDb] = useState('');
  const [newExposureDuration, setNewExposureDuration] = useState('');
  const [dailyDoseResult, setDailyDoseResult] = useState<DailyDoseResult | null>(null);
  const [showTips, setShowTips] = useState(false);

  // NIOSH formula: Safe exposure time (hours) = 8 / (2^((dB-85)/3))
  // Exposure time doubles for every 3dB decrease
  const calculateSafeExposureTime = (db: number): number => {
    if (db < 85) return Infinity;
    const hours = 8 / Math.pow(2, (db - 85) / 3);
    return hours * 60; // Return in minutes
  };

  const formatExposureTime = (minutes: number): string => {
    if (minutes === Infinity || minutes > 480) return '8+ hours (safe for extended periods)';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
    }
    if (minutes >= 1) return `${Math.round(minutes)} minute${Math.round(minutes) > 1 ? 's' : ''}`;
    const seconds = Math.round(minutes * 60);
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  };

  const getRiskLevel = (db: number): { level: ExposureResult['riskLevel']; text: string; color: string } => {
    if (db < 85) return { level: 'safe', text: 'Safe', color: '#10b981' };
    if (db < 95) return { level: 'moderate', text: 'Moderate Risk', color: '#f59e0b' };
    if (db < 110) return { level: 'high', text: 'High Risk', color: '#f97316' };
    return { level: 'extreme', text: 'Extreme Risk - Immediate Damage Possible', color: '#ef4444' };
  };

  const getProtectionRecommendations = (db: number): string[] => {
    if (db < 85) return ['No hearing protection required for normal exposure'];
    if (db < 95) return [
      'Foam earplugs (NRR 22-33)',
      'Take 15-minute breaks every hour',
    ];
    if (db < 105) return [
      'High-quality earplugs (NRR 25+)',
      'Over-ear earmuffs (NRR 20-30)',
      'Limit exposure time strictly',
    ];
    if (db < 115) return [
      'Dual protection: earplugs + earmuffs',
      'Minimize exposure time',
      'Consider avoiding if possible',
    ];
    return [
      'Maximum protection: dual earplugs + earmuffs',
      'Extreme caution - avoid if possible',
      'Even brief exposure can cause permanent damage',
      'Seek professional-grade hearing protection',
    ];
  };

  const calculateExposure = () => {
    const db = parseFloat(decibels);
    if (isNaN(db) || db < 0 || db > 200) {
      setValidationMessage('Please enter a valid decibel level (0-200)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const safeMinutes = calculateSafeExposureTime(db);
    const risk = getRiskLevel(db);
    const protection = getProtectionRecommendations(db);

    setResult({
      safeExposureTime: formatExposureTime(safeMinutes),
      safeExposureMinutes: safeMinutes,
      riskLevel: risk.level,
      riskText: risk.text,
      riskColor: risk.color,
      protection,
    });
  };

  const setQuickDecibel = (db: number) => {
    setDecibels(db.toString());
  };

  const addExposure = () => {
    const db = parseFloat(newExposureDb);
    const duration = parseFloat(newExposureDuration);

    if (isNaN(db) || db < 0 || db > 200) {
      setValidationMessage('Please enter a valid decibel level (0-200)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (isNaN(duration) || duration <= 0) {
      setValidationMessage('Please enter a valid duration in minutes');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newExposure: NoiseExposure = {
      id: Date.now().toString(),
      decibels: db,
      durationMinutes: duration,
    };

    setExposures([...exposures, newExposure]);
    setNewExposureDb('');
    setNewExposureDuration('');
  };

  const removeExposure = (id: string) => {
    setExposures(exposures.filter((e) => e.id !== id));
  };

  const calculateDailyDose = () => {
    if (exposures.length === 0) {
      setValidationMessage('Please add at least one exposure to calculate daily dose');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Daily dose = sum of (actual exposure time / allowed exposure time) for each exposure
    let totalDose = 0;

    exposures.forEach((exposure) => {
      const allowedMinutes = calculateSafeExposureTime(exposure.decibels);
      if (allowedMinutes !== Infinity) {
        totalDose += exposure.durationMinutes / allowedMinutes;
      }
    });

    // Convert to percentage
    const dosePercent = totalDose * 100;
    const remainingDose = Math.max(0, 100 - dosePercent);

    let riskLevel: DailyDoseResult['riskLevel'] = 'safe';
    if (dosePercent >= 100) riskLevel = 'extreme';
    else if (dosePercent >= 75) riskLevel = 'high';
    else if (dosePercent >= 50) riskLevel = 'moderate';

    setDailyDoseResult({
      totalDose: dosePercent,
      isOverExposed: dosePercent >= 100,
      remainingDose,
      riskLevel,
    });
  };

  const reset = () => {
    setDecibels('');
    setResult(null);
  };

  const resetDailyDose = () => {
    setExposures([]);
    setDailyDoseResult(null);
    setNewExposureDb('');
    setNewExposureDuration('');
  };

  const getDoseColor = (dose: number): string => {
    if (dose >= 100) return '#ef4444';
    if (dose >= 75) return '#f97316';
    if (dose >= 50) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.noiseExposureCalculator.noiseExposureCalculator', 'Noise Exposure Calculator')}
            </h1>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.noiseExposureCalculator.calculateSafeNoiseExposureTimes', 'Calculate safe noise exposure times and assess hearing damage risk based on decibel levels')}
          </p>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mt-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.noiseExposureCalculator.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}
        </div>

        {/* Main Calculator */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.noiseExposureCalculator.singleExposureCalculator', 'Single Exposure Calculator')}
          </h2>

          {/* Decibel Input */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.noiseExposureCalculator.noiseLevelDb', 'Noise Level (dB)')}
            </label>
            <input
              type="number"
              value={decibels}
              onChange={(e) => setDecibels(e.target.value)}
              placeholder={t('tools.noiseExposureCalculator.enterDecibelLevelEG', 'Enter decibel level (e.g., 85)')}
              min="0"
              max="200"
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          {/* Quick Select Common Noise Levels */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.noiseExposureCalculator.quickSelect', 'Quick Select')}
            </label>
            <div className="flex flex-wrap gap-2">
              {[85, 90, 100, 110, 120].map((db) => (
                <button
                  key={db}
                  onClick={() => setQuickDecibel(db)}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    decibels === db.toString()
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {db} dB
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateExposure}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5" />
              {t('tools.noiseExposureCalculator.calculateSafeExposure', 'Calculate Safe Exposure')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.noiseExposureCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              {/* Risk Level Banner */}
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: `${result.riskColor}15`, borderLeft: `4px solid ${result.riskColor}` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  {result.riskLevel === 'safe' ? (
                    <Shield className="w-8 h-8" style={{ color: result.riskColor }} />
                  ) : (
                    <AlertTriangle className="w-8 h-8" style={{ color: result.riskColor }} />
                  )}
                  <div>
                    <div className="text-2xl font-bold" style={{ color: result.riskColor }}>
                      {result.riskText}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      at {decibels} dB
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                  <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.noiseExposureCalculator.maximumSafeExposureTime', 'Maximum Safe Exposure Time')}
                  </div>
                  <div className="text-3xl font-bold" style={{ color: result.riskColor }}>
                    {result.safeExposureTime}
                  </div>
                </div>
              </div>

              {/* Protection Recommendations */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-[#0D9488]" />
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.noiseExposureCalculator.recommendedProtection', 'Recommended Protection')}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {result.protection.map((rec, index) => (
                    <li key={index} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-[#0D9488] mt-0.5">-</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Daily Dose Calculator */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.noiseExposureCalculator.dailyNoiseDoseCalculator', 'Daily Noise Dose Calculator')}
          </h2>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.noiseExposureCalculator.trackMultipleNoiseExposuresThroughout', 'Track multiple noise exposures throughout the day to calculate your total noise dose')}
          </p>

          {/* Add Exposure Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.noiseExposureCalculator.decibelsDb', 'Decibels (dB)')}
              </label>
              <input
                type="number"
                value={newExposureDb}
                onChange={(e) => setNewExposureDb(e.target.value)}
                placeholder="e.g., 90"
                min="0"
                max="200"
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.noiseExposureCalculator.durationMinutes', 'Duration (minutes)')}
              </label>
              <input
                type="number"
                value={newExposureDuration}
                onChange={(e) => setNewExposureDuration(e.target.value)}
                placeholder="e.g., 60"
                min="0"
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addExposure}
                className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.noiseExposureCalculator.add', 'Add')}
              </button>
            </div>
          </div>

          {/* Exposures List */}
          {exposures.length > 0 && (
            <div className="mb-4">
              <div className={`rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`grid grid-cols-3 gap-4 p-3 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.noiseExposureCalculator.noiseLevel', 'Noise Level')}</div>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.noiseExposureCalculator.duration', 'Duration')}</div>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.noiseExposureCalculator.action', 'Action')}</div>
                </div>
                {exposures.map((exposure) => (
                  <div key={exposure.id} className={`grid grid-cols-3 gap-4 p-3 border-b last:border-b-0 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{exposure.decibels} dB</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{exposure.durationMinutes} min</div>
                    <button
                      onClick={() => removeExposure(exposure.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calculate Daily Dose Button */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={calculateDailyDose}
              disabled={exposures.length === 0}
              className={`flex-1 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                exposures.length === 0
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200' : t('tools.noiseExposureCalculator.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
              }`}
            >
              {t('tools.noiseExposureCalculator.calculateDailyDose', 'Calculate Daily Dose')}
            </button>
            <ExportDropdown
              onExportCSV={() => exportToCSV(exposures, COLUMNS, { filename: 'noise-exposures' })}
              onExportExcel={() => exportToExcel(exposures, COLUMNS, { filename: 'noise-exposures' })}
              onExportJSON={() => exportToJSON(exposures, { filename: 'noise-exposures' })}
              onExportPDF={() => exportToPDF(exposures, COLUMNS, { filename: 'noise-exposures', title: 'Noise Exposure Report' })}
              onPrint={() => printData(exposures, COLUMNS, { title: 'Noise Exposure Report' })}
              onCopyToClipboard={() => copyUtil(exposures, COLUMNS)}
              disabled={exposures.length === 0}
              showImport={false}
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
            <button
              onClick={resetDailyDose}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.noiseExposureCalculator.clearAll', 'Clear All')}
            </button>
          </div>

          {/* Daily Dose Result */}
          {dailyDoseResult && (
            <div
              className="p-6 rounded-lg"
              style={{ backgroundColor: `${getDoseColor(dailyDoseResult.totalDose)}15`, borderLeft: `4px solid ${getDoseColor(dailyDoseResult.totalDose)}` }}
            >
              <div className="text-center mb-4">
                <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.noiseExposureCalculator.dailyNoiseDose', 'Daily Noise Dose')}
                </div>
                <div className="text-5xl font-bold" style={{ color: getDoseColor(dailyDoseResult.totalDose) }}>
                  {dailyDoseResult.totalDose.toFixed(1)}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className={`h-4 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(dailyDoseResult.totalDose, 100)}%`,
                      backgroundColor: getDoseColor(dailyDoseResult.totalDose),
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>0%</span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>100% (Daily Limit)</span>
                </div>
              </div>

              {dailyDoseResult.isOverExposed ? (
                <div className="flex items-center gap-2 p-3 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                    {t('tools.noiseExposureCalculator.warningDailyNoiseExposureLimit', 'Warning: Daily noise exposure limit exceeded! Take immediate precautions.')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-green-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    Remaining safe exposure capacity: {dailyDoseResult.remainingDose.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Common Noise Levels Reference */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.noiseExposureCalculator.commonNoiseLevelReference', 'Common Noise Level Reference')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COMMON_NOISE_LEVELS.map((noise, index) => {
              const risk = getRiskLevel(noise.decibels);
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setQuickDecibel(noise.decibels)}
                >
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5" style={{ color: risk.color }} />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {noise.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ color: risk.color }}>
                      {noise.decibels} dB
                    </span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: risk.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hearing Protection Tips */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
          <button
            onClick={() => setShowTips(!showTips)}
            className={`w-full flex items-center justify-between p-6 ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            } transition-colors`}
          >
            <div className="flex items-center gap-3">
              <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.noiseExposureCalculator.hearingProtectionTips', 'Hearing Protection Tips')}
              </span>
            </div>
            <span className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {showTips ? '-' : '+'}
            </span>
          </button>

          {showTips && (
            <div className={`px-6 pb-6 ${theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
              <ul className="space-y-3 mt-4">
                {HEARING_PROTECTION_TIPS.map((tip, index) => (
                  <li key={index} className={`flex items-start gap-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Shield className="w-4 h-4 text-[#0D9488] mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* NIOSH Standard Info */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.noiseExposureCalculator.note', 'Note:')}</strong> Calculations are based on NIOSH (National Institute for Occupational Safety and Health)
            recommended exposure limits. The 85 dB threshold with 3 dB exchange rate is used. This tool is for informational
            purposes only. Consult a hearing professional for personalized advice.
          </p>
        </div>
      </div>
    </div>
  );
}

export default NoiseExposureCalculatorTool;
