import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Flag, Calculator, Plus, Trash2, TrendingUp, TrendingDown, Info, Target, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface GolfRound {
  id: string;
  score: number;
  courseRating: number;
  slopeRating: number;
  date: string;
  differential: number;
}

interface HandicapResult {
  handicapIndex: number;
  trend: 'improving' | 'declining' | 'stable';
  usedDifferentials: number[];
  averageDifferential: number;
}

interface TargetScoreResult {
  targetScore: number;
  playingHandicap: number;
  courseRating: number;
  slopeRating: number;
}

interface GolfHandicapCalculatorToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'string' },
  { key: 'score', header: 'Score', type: 'number' },
  { key: 'courseRating', header: 'Course Rating', type: 'number' },
  { key: 'slopeRating', header: 'Slope Rating', type: 'number' },
  { key: 'differential', header: 'Differential', type: 'number' },
];

export const GolfHandicapCalculatorTool: React.FC<GolfHandicapCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: rounds,
    addItem,
    deleteItem,
    clearData,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<GolfRound>('golf-handicap-calculator', [], COLUMNS);

  const [score, setScore] = useState('');
  const [courseRating, setCourseRating] = useState('');
  const [slopeRating, setSlopeRating] = useState('');
  const [result, setResult] = useState<HandicapResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Target score calculator state
  const [targetCourseRating, setTargetCourseRating] = useState('');
  const [targetSlopeRating, setTargetSlopeRating] = useState('');
  const [targetScoreResult, setTargetScoreResult] = useState<TargetScoreResult | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.score !== undefined) {
        setScore(String(params.score));
        setIsPrefilled(true);
      }
      if (params.courseRating !== undefined) {
        setCourseRating(String(params.courseRating));
        setIsPrefilled(true);
      }
      if (params.slopeRating !== undefined) {
        setSlopeRating(String(params.slopeRating));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Recalculate handicap whenever rounds change
  useEffect(() => {
    if (rounds.length >= 3) {
      calculateHandicap(rounds);
    } else {
      setResult(null);
    }
  }, [rounds]);

  const calculateDifferential = (score: number, courseRating: number, slopeRating: number): number => {
    // Handicap Differential = (Score - Course Rating) x 113 / Slope Rating
    return ((score - courseRating) * 113) / slopeRating;
  };

  const addRound = () => {
    const scoreNum = parseFloat(score);
    const ratingNum = parseFloat(courseRating);
    const slopeNum = parseFloat(slopeRating);

    if (isNaN(scoreNum) || isNaN(ratingNum) || isNaN(slopeNum)) {
      setValidationMessage('Please enter valid numbers for all fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (scoreNum < 50 || scoreNum > 150) {
      setValidationMessage('Please enter a valid golf score (50-150)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (ratingNum < 60 || ratingNum > 80) {
      setValidationMessage('Course rating should be between 60 and 80');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (slopeNum < 55 || slopeNum > 155) {
      setValidationMessage('Slope rating should be between 55 and 155');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const differential = calculateDifferential(scoreNum, ratingNum, slopeNum);

    const newRound: GolfRound = {
      id: Date.now().toString(),
      score: scoreNum,
      courseRating: ratingNum,
      slopeRating: slopeNum,
      date: new Date().toLocaleDateString(),
      differential: parseFloat(differential.toFixed(1)),
    };

    // Use addItem from useToolData hook - limit to 20 most recent rounds
    addItem(newRound);

    // Reset inputs
    setScore('');
    setCourseRating('');
    setSlopeRating('');
  };

  const removeRound = (id: string) => {
    deleteItem(id);
  };

  const getUsedDifferentialsCount = (roundCount: number): number => {
    // Number of differentials to use based on rounds available
    if (roundCount <= 3) return 1;
    if (roundCount <= 4) return 1;
    if (roundCount <= 5) return 1;
    if (roundCount <= 6) return 2;
    if (roundCount <= 8) return 2;
    if (roundCount <= 11) return 3;
    if (roundCount <= 14) return 4;
    if (roundCount <= 16) return 5;
    if (roundCount <= 18) return 6;
    if (roundCount <= 19) return 7;
    return 8; // 20 rounds = best 8
  };

  const calculateHandicap = (roundsToUse: GolfRound[]) => {
    if (roundsToUse.length < 3) {
      setResult(null);
      return;
    }

    const differentials = roundsToUse.map((r) => r.differential);
    const sortedDifferentials = [...differentials].sort((a, b) => a - b);
    const countToUse = getUsedDifferentialsCount(roundsToUse.length);
    const usedDifferentials = sortedDifferentials.slice(0, countToUse);
    const averageDifferential = usedDifferentials.reduce((a, b) => a + b, 0) / usedDifferentials.length;

    // Handicap Index = Average of lowest differentials x 0.96
    const handicapIndex = averageDifferential * 0.96;

    // Determine trend (compare last 5 rounds to previous 5)
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (roundsToUse.length >= 10) {
      const recent5Avg = roundsToUse.slice(0, 5).reduce((a, b) => a + b.differential, 0) / 5;
      const previous5Avg = roundsToUse.slice(5, 10).reduce((a, b) => a + b.differential, 0) / 5;
      if (recent5Avg < previous5Avg - 1) {
        trend = 'improving';
      } else if (recent5Avg > previous5Avg + 1) {
        trend = 'declining';
      }
    } else if (roundsToUse.length >= 6) {
      const half = Math.floor(roundsToUse.length / 2);
      const recentAvg = roundsToUse.slice(0, half).reduce((a, b) => a + b.differential, 0) / half;
      const previousAvg = roundsToUse.slice(half).reduce((a, b) => a + b.differential, 0) / (roundsToUse.length - half);
      if (recentAvg < previousAvg - 1) {
        trend = 'improving';
      } else if (recentAvg > previousAvg + 1) {
        trend = 'declining';
      }
    }

    setResult({
      handicapIndex: parseFloat(handicapIndex.toFixed(1)),
      trend,
      usedDifferentials,
      averageDifferential: parseFloat(averageDifferential.toFixed(1)),
    });
  };

  const calculateTargetScore = () => {
    if (!result) {
      setValidationMessage('Please add at least 3 rounds to calculate your handicap first');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const ratingNum = parseFloat(targetCourseRating);
    const slopeNum = parseFloat(targetSlopeRating);

    if (isNaN(ratingNum) || isNaN(slopeNum)) {
      setValidationMessage('Please enter valid course rating and slope rating');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Playing Handicap = Handicap Index x (Slope Rating / 113)
    const playingHandicap = Math.round(result.handicapIndex * (slopeNum / 113));

    // Target Score = Course Rating + Playing Handicap
    const targetScore = Math.round(ratingNum + playingHandicap);

    setTargetScoreResult({
      targetScore,
      playingHandicap,
      courseRating: ratingNum,
      slopeRating: slopeNum,
    });
  };

  const reset = () => {
    clearData();
    setResult(null);
    setScore('');
    setCourseRating('');
    setSlopeRating('');
    setTargetCourseRating('');
    setTargetSlopeRating('');
    setTargetScoreResult(null);
  };

  const getTrendColor = (trend: 'improving' | 'declining' | 'stable'): string => {
    switch (trend) {
      case 'improving':
        return '#10b981';
      case 'declining':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="w-5 h-5" style={{ color: '#10b981' }} />;
      case 'declining':
        return <TrendingUp className="w-5 h-5" style={{ color: '#ef4444' }} />;
      default:
        return <Circle className="w-5 h-5" style={{ color: '#f59e0b' }} />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Flag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.golfHandicapCalculator.golfHandicapCalculator', 'Golf Handicap Calculator')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.golfHandicapCalculator.calculateYourUsgaHandicapIndex', 'Calculate your USGA Handicap Index')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="golf-handicap-calculator" toolName="Golf Handicap Calculator" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'golf-handicap-rounds' })}
                onExportExcel={() => exportExcel({ filename: 'golf-handicap-rounds' })}
                onExportJSON={() => exportJSON({ filename: 'golf-handicap-rounds' })}
                onExportPDF={() => exportPDF({ filename: 'golf-handicap-rounds', title: 'Golf Handicap Rounds' })}
                onPrint={() => print('Golf Handicap Rounds')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>

          {/* Add New Round */}
          <Card className={`mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <CardHeader className="pb-4">
              <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.golfHandicapCalculator.addNewRound', 'Add New Round')}
              </CardTitle>
              <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.golfHandicapCalculator.enterYourScoreAndCourse', 'Enter your score and course details')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.golfHandicapCalculator.score', 'Score')}
                  </label>
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g., 85"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.golfHandicapCalculator.courseRating', 'Course Rating')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={courseRating}
                    onChange={(e) => setCourseRating(e.target.value)}
                    placeholder="e.g., 72.4"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.golfHandicapCalculator.slopeRating', 'Slope Rating')}
                  </label>
                  <input
                    type="number"
                    value={slopeRating}
                    onChange={(e) => setSlopeRating(e.target.value)}
                    placeholder="e.g., 125"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addRound}
                  className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.golfHandicapCalculator.addRound', 'Add Round')}
                </button>
                <button
                  onClick={reset}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.golfHandicapCalculator.resetAll', 'Reset All')}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Handicap Result */}
          {result && (
            <div className={`p-6 rounded-lg mb-6 border-l-4 border-[#0D9488] ${
              isDark ? 'bg-gray-700' : t('tools.golfHandicapCalculator.bg0d948810', 'bg-[#0D9488]/10')
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.golfHandicapCalculator.handicapIndex', 'Handicap Index')}
                  </div>
                  <div className="text-5xl font-bold text-[#0D9488]">
                    {result.handicapIndex}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.golfHandicapCalculator.trend', 'Trend')}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {getTrendIcon(result.trend)}
                    <span className="text-2xl font-bold capitalize" style={{ color: getTrendColor(result.trend) }}>
                      {result.trend}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.golfHandicapCalculator.roundsUsed', 'Rounds Used')}
                  </div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {result.usedDifferentials.length} of {rounds.length}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.golfHandicapCalculator.bestDifferentials', 'Best differentials')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Score Differentials List */}
          {rounds.length > 0 && (
            <Card className={`mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <CardHeader className="pb-4">
                <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Score Differentials ({rounds.length}/20)
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {t('tools.golfHandicapCalculator.yourRecentRoundsAndCalculated', 'Your recent rounds and calculated differentials')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {rounds.map((round, index) => {
                    const isUsed = result?.usedDifferentials.includes(round.differential);
                    return (
                      <div
                        key={round.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isUsed
                            ? isDark
                              ? t('tools.golfHandicapCalculator.bg0d948820BorderBorder', 'bg-[#0D9488]/20 border border-[#0D9488]/50') : t('tools.golfHandicapCalculator.bg0d948810BorderBorder', 'bg-[#0D9488]/10 border border-[#0D9488]/30')
                            : isDark
                            ? 'bg-gray-600'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            #{index + 1}
                          </div>
                          <div>
                            <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              Score: {round.score}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              CR: {round.courseRating} | SR: {round.slopeRating} | {round.date}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`font-bold ${isUsed ? 'text-[#0D9488]' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {round.differential}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.golfHandicapCalculator.differential', 'Differential')}
                            </div>
                          </div>
                          <button
                            onClick={() => removeRound(round.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-gray-500 text-gray-400 hover:text-red-400'
                                : 'hover:bg-gray-200 text-gray-500 hover:text-red-500'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {rounds.length < 3 && (
                  <div className={`mt-4 p-3 rounded-lg text-center ${
                    isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    Add at least {3 - rounds.length} more round(s) to calculate your handicap
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Target Score Calculator */}
          {result && (
            <Card className={`mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <CardHeader className="pb-4">
                <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Target className="w-5 h-5" />
                  {t('tools.golfHandicapCalculator.targetScoreCalculator', 'Target Score Calculator')}
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {t('tools.golfHandicapCalculator.calculateYourTargetScoreFor', 'Calculate your target score for any course')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.golfHandicapCalculator.courseRating2', 'Course Rating')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={targetCourseRating}
                      onChange={(e) => setTargetCourseRating(e.target.value)}
                      placeholder="e.g., 72.4"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDark
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.golfHandicapCalculator.slopeRating2', 'Slope Rating')}
                    </label>
                    <input
                      type="number"
                      value={targetSlopeRating}
                      onChange={(e) => setTargetSlopeRating(e.target.value)}
                      placeholder="e.g., 125"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDark
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <button
                  onClick={calculateTargetScore}
                  className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Calculator className="w-5 h-5" />
                  {t('tools.golfHandicapCalculator.calculateTargetScore', 'Calculate Target Score')}
                </button>

                {targetScoreResult && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    isDark ? 'bg-gray-600' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.golfHandicapCalculator.playingHandicap', 'Playing Handicap')}
                        </div>
                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {targetScoreResult.playingHandicap}
                        </div>
                      </div>
                      <div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.golfHandicapCalculator.targetScore', 'Target Score')}
                        </div>
                        <div className="text-2xl font-bold text-[#0D9488]">
                          {targetScoreResult.targetScore}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Handicap Explanation */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`w-full flex items-center justify-between p-4 rounded-lg ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            <div className="flex items-center gap-2">
              <Info className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.golfHandicapCalculator.howHandicapIsCalculated', 'How Handicap is Calculated')}
              </span>
            </div>
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {showExplanation ? '-' : '+'}
            </span>
          </button>

          {showExplanation && (
            <div className={`mt-2 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`space-y-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <div>
                  <p className="font-semibold mb-2">1. Score Differential Formula:</p>
                  <p className="font-mono bg-gray-800 text-gray-200 p-2 rounded text-xs">
                    Differential = (Score - Course Rating) x 113 / Slope Rating
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-2">2. Number of Differentials Used:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>3-5 rounds: Best 1</div>
                    <div className={`p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>6-8 rounds: Best 2</div>
                    <div className={`p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>9-11 rounds: Best 3</div>
                    <div className={`p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>12-14 rounds: Best 4</div>
                    <div className={`p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>15-16 rounds: Best 5</div>
                    <div className={`p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>17-18 rounds: Best 6</div>
                    <div className={`p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>19 rounds: Best 7</div>
                    <div className={`p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>20 rounds: Best 8</div>
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-2">3. Handicap Index Formula:</p>
                  <p className="font-mono bg-gray-800 text-gray-200 p-2 rounded text-xs">
                    Handicap Index = Average of Best Differentials x 0.96
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-2">4. Playing Handicap Formula:</p>
                  <p className="font-mono bg-gray-800 text-gray-200 p-2 rounded text-xs">
                    Playing Handicap = Handicap Index x (Slope Rating / 113)
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-2">5. Target Score:</p>
                  <p className="font-mono bg-gray-800 text-gray-200 p-2 rounded text-xs">
                    Target Score = Course Rating + Playing Handicap
                  </p>
                </div>

                <p className="text-xs mt-4 italic">
                  Note: This calculator uses the simplified USGA World Handicap System formula.
                  Official handicaps may include additional adjustments such as Exceptional Score Reduction (ESR)
                  and soft/hard caps.
                </p>
              </div>
            </div>
          )}

          {/* Validation Toast Message */}
          {validationMessage && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4">
              {validationMessage}
            </div>
          )}

          <ConfirmDialog />
        </div>
      </div>
    </div>
  );
};

export default GolfHandicapCalculatorTool;
