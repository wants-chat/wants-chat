import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Trophy, TrendingUp, RotateCcw, Minus, Info, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type TargetFace = '10-ring' | '5-ring';
type RoundType = 'practice' | 'portsmouth' | 'vegas' | 'wa720' | 'fita' | 'national';

interface RoundConfig {
  name: string;
  arrowsPerEnd: number;
  totalEnds: number;
  description: string;
  maxScore: number;
}

interface EndScore {
  arrows: number[];
}

interface PersonalBest {
  id: string;
  roundType: RoundType;
  score: number;
  date: string;
}

interface ArcheryScoreToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for personal bests export
const PB_COLUMNS: ColumnConfig[] = [
  { key: 'roundType', header: 'Round Type', type: 'string' },
  { key: 'score', header: 'Score', type: 'number' },
  { key: 'date', header: 'Date', type: 'string' },
];

export const ArcheryScoreTool: React.FC<ArcheryScoreToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [targetFace, setTargetFace] = useState<TargetFace>('10-ring');
  const [roundType, setRoundType] = useState<RoundType>('practice');
  const [ends, setEnds] = useState<EndScore[]>([{ arrows: [] }]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Use the useToolData hook for backend persistence of personal bests
  const {
    data: personalBests,
    addItem,
    updateItem,
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
  } = useToolData<PersonalBest>('archery-score', [], PB_COLUMNS);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.targetFace) {
          setTargetFace(params.targetFace as TargetFace);
        }
        if (params.roundType) {
          setRoundType(params.roundType as RoundType);
        }
        setIsPrefilled(true);
      } else {
        if (params.targetFace) {
          setTargetFace(params.targetFace as TargetFace);
          setIsPrefilled(true);
        }
        if (params.roundType) {
          setRoundType(params.roundType as RoundType);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const rounds: Record<RoundType, RoundConfig> = {
    practice: {
      name: 'Practice',
      arrowsPerEnd: 6,
      totalEnds: 10,
      description: 'Free practice session',
      maxScore: 600,
    },
    portsmouth: {
      name: 'Portsmouth',
      arrowsPerEnd: 3,
      totalEnds: 20,
      description: 'Indoor 20yd, 60 arrows',
      maxScore: 600,
    },
    vegas: {
      name: 'Vegas 300',
      arrowsPerEnd: 3,
      totalEnds: 10,
      description: 'Indoor 18m, 30 arrows',
      maxScore: 300,
    },
    wa720: {
      name: 'WA 720',
      arrowsPerEnd: 6,
      totalEnds: 12,
      description: 'Outdoor 70m, 72 arrows',
      maxScore: 720,
    },
    fita: {
      name: 'FITA 1440',
      arrowsPerEnd: 6,
      totalEnds: 24,
      description: 'Full outdoor round',
      maxScore: 1440,
    },
    national: {
      name: 'National',
      arrowsPerEnd: 6,
      totalEnds: 12,
      description: 'National round format',
      maxScore: 720,
    },
  };

  const config = rounds[roundType];
  const maxArrowScore = targetFace === '10-ring' ? 10 : 5;
  const arrowValues = targetFace === '10-ring'
    ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'X']
    : [0, 1, 2, 3, 4, 5];

  const calculations = useMemo(() => {
    let totalScore = 0;
    let totalArrows = 0;
    let xCount = 0;
    let tensCount = 0;
    const endTotals: number[] = [];

    ends.forEach((end) => {
      let endTotal = 0;
      end.arrows.forEach((arrow) => {
        if (arrow === 11) { // X = 11 internally
          endTotal += 10;
          xCount++;
          tensCount++;
        } else {
          endTotal += arrow;
          if (arrow === 10) tensCount++;
        }
        totalArrows++;
      });
      endTotals.push(endTotal);
      totalScore += endTotal;
    });

    const average = totalArrows > 0 ? totalScore / totalArrows : 0;
    const maxPossible = config.arrowsPerEnd * config.totalEnds * maxArrowScore;
    const percentage = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;

    return {
      totalScore,
      totalArrows,
      xCount,
      tensCount,
      endTotals,
      average: average.toFixed(2),
      percentage: percentage.toFixed(1),
      maxPossible,
    };
  }, [ends, config, maxArrowScore]);

  const getCurrentEndIndex = () => ends.length - 1;
  const currentEnd = ends[getCurrentEndIndex()];
  const isEndComplete = currentEnd.arrows.length >= config.arrowsPerEnd;
  const isRoundComplete = ends.length >= config.totalEnds && isEndComplete;

  const addArrow = (value: number | 'X') => {
    if (isRoundComplete) return;

    const arrowValue = value === 'X' ? 11 : value;

    setEnds((prev) => {
      const newEnds = [...prev];
      const currentEndIdx = newEnds.length - 1;

      if (newEnds[currentEndIdx].arrows.length < config.arrowsPerEnd) {
        newEnds[currentEndIdx] = {
          arrows: [...newEnds[currentEndIdx].arrows, arrowValue],
        };
      }

      // If end is now complete and more ends remaining, start new end
      if (
        newEnds[currentEndIdx].arrows.length >= config.arrowsPerEnd &&
        newEnds.length < config.totalEnds
      ) {
        newEnds.push({ arrows: [] });
      }

      return newEnds;
    });
  };

  const removeLastArrow = () => {
    setEnds((prev) => {
      const newEnds = [...prev];
      let currentEndIdx = newEnds.length - 1;

      // If current end is empty and there are previous ends, go back
      if (newEnds[currentEndIdx].arrows.length === 0 && currentEndIdx > 0) {
        newEnds.pop();
        currentEndIdx = newEnds.length - 1;
      }

      if (newEnds[currentEndIdx].arrows.length > 0) {
        newEnds[currentEndIdx] = {
          arrows: newEnds[currentEndIdx].arrows.slice(0, -1),
        };
      }

      return newEnds;
    });
  };

  const resetRound = () => {
    setEnds([{ arrows: [] }]);
  };

  const savePersonalBest = () => {
    const existingBest = personalBests.find(
      (pb) => pb.roundType === roundType
    );

    if (existingBest) {
      if (calculations.totalScore > existingBest.score) {
        updateItem(existingBest.id, {
          score: calculations.totalScore,
          date: new Date().toLocaleDateString(),
        });
      }
      // If not a new best, do nothing
    } else {
      const newBest: PersonalBest = {
        id: `pb-${roundType}-${Date.now()}`,
        roundType,
        score: calculations.totalScore,
        date: new Date().toLocaleDateString(),
      };
      addItem(newBest);
    }
  };

  const getCurrentPersonalBest = () => {
    return personalBests.find((pb) => pb.roundType === roundType);
  };

  const getArrowDisplay = (value: number) => {
    if (value === 11) return 'X';
    return value.toString();
  };

  const getArrowColor = (value: number) => {
    if (value === 11 || value === 10) return 'text-yellow-500';
    if (value >= 8) return 'text-red-500';
    if (value >= 6) return 'text-blue-500';
    if (value >= 4) return 'text-black dark:text-white';
    return 'text-gray-500';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg"><Target className="w-5 h-5 text-green-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.archeryScore.archeryScoreTracker', 'Archery Score Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.archeryScore.trackScoresEndsAndPersonal', 'Track scores, ends, and personal bests')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="archery-score" toolName="Archery Score" />

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
              onExportCSV={() => exportCSV({ filename: `archery-personal-bests` })}
              onExportExcel={() => exportExcel({ filename: `archery-personal-bests` })}
              onExportJSON={() => exportJSON({ filename: `archery-personal-bests` })}
              onExportPDF={() => exportPDF({
                filename: `archery-personal-bests`,
                title: 'Archery Personal Bests',
                subtitle: `${personalBests.length} personal bests recorded`
              })}
              onPrint={() => print('Archery Personal Bests')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
              disabled={personalBests.length === 0}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Target Face Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.archeryScore.targetFace', 'Target Face')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setTargetFace('10-ring')}
              className={`flex-1 py-2 px-4 rounded-lg ${targetFace === '10-ring' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.archeryScore.10Ring010X', '10-Ring (0-10, X)')}
            </button>
            <button
              onClick={() => setTargetFace('5-ring')}
              className={`flex-1 py-2 px-4 rounded-lg ${targetFace === '5-ring' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.archeryScore.5Ring05', '5-Ring (0-5)')}
            </button>
          </div>
        </div>

        {/* Round Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.archeryScore.roundType', 'Round Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(rounds) as RoundType[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRoundType(r);
                  resetRound();
                }}
                className={`py-2 px-3 rounded-lg text-sm ${roundType === r ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {rounds[r].name}
              </button>
            ))}
          </div>
        </div>

        {/* Round Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-green-500 font-bold">Max: {config.maxScore}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.archeryScore.arrowsEnd', 'Arrows/End:')}</span> {config.arrowsPerEnd}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.archeryScore.totalEnds', 'Total Ends:')}</span> {config.totalEnds}
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {config.description}
          </p>
        </div>

        {/* Current End Status */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              End {Math.min(ends.length, config.totalEnds)} of {config.totalEnds}
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Arrow {currentEnd.arrows.length + 1} of {config.arrowsPerEnd}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {currentEnd.arrows.map((arrow, idx) => (
              <div
                key={idx}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'} ${getArrowColor(arrow)}`}
              >
                {getArrowDisplay(arrow)}
              </div>
            ))}
            {Array.from({ length: config.arrowsPerEnd - currentEnd.arrows.length }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
              />
            ))}
          </div>
        </div>

        {/* Arrow Score Entry */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.archeryScore.enterArrowScore', 'Enter Arrow Score')}
          </label>
          <div className="grid grid-cols-6 gap-2">
            {arrowValues.map((value) => (
              <button
                key={value}
                onClick={() => addArrow(value as number | 'X')}
                disabled={isRoundComplete}
                className={`py-3 rounded-lg font-bold text-lg ${
                  isRoundComplete
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : value === 'X' || value === 10
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={removeLastArrow}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Minus className="w-4 h-4" />
            {t('tools.archeryScore.undo', 'Undo')}
          </button>
          <button
            onClick={resetRound}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <RotateCcw className="w-4 h-4" />
            {t('tools.archeryScore.reset', 'Reset')}
          </button>
        </div>

        {/* End Totals */}
        {calculations.endTotals.length > 0 && calculations.endTotals.some(t => t > 0 || ends[0].arrows.length > 0) && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.archeryScore.endTotals', 'End Totals')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {ends.map((end, idx) => {
                if (end.arrows.length === 0 && idx > 0) return null;
                const endTotal = calculations.endTotals[idx] || 0;
                const maxEndScore = config.arrowsPerEnd * maxArrowScore;
                const isPerfect = endTotal === maxEndScore;
                return (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-lg text-center min-w-[60px] ${
                      isPerfect
                        ? 'bg-yellow-500 text-white'
                        : isDark
                          ? 'bg-gray-800 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="text-xs opacity-70">E{idx + 1}</div>
                    <div className="font-bold">{endTotal}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.archeryScore.totalScore', 'Total Score')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.totalScore}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.percentage}% of max
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.archeryScore.average', 'Average')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.average}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              per arrow ({calculations.totalArrows} arrows)
            </div>
          </div>
        </div>

        {/* X and 10s Count */}
        {targetFace === '10-ring' && (
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.archeryScore.xCount', 'X Count')}</div>
              <div className="text-2xl font-bold text-yellow-500">{calculations.xCount}</div>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>10s + Xs</div>
              <div className="text-2xl font-bold text-yellow-500">{calculations.tensCount}</div>
            </div>
          </div>
        )}

        {/* Personal Best */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Personal Best ({config.name})
              </span>
            </div>
            {isRoundComplete && (
              <button
                onClick={savePersonalBest}
                className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
              >
                {t('tools.archeryScore.saveAsPb', 'Save as PB')}
              </button>
            )}
          </div>
          {getCurrentPersonalBest() ? (
            <div className="mt-2">
              <div className="text-2xl font-bold text-yellow-500">
                {getCurrentPersonalBest()?.score}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Set on {getCurrentPersonalBest()?.date}
              </div>
            </div>
          ) : (
            <div className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.archeryScore.noPersonalBestRecordedFor', 'No personal best recorded for this round type yet')}
            </div>
          )}
        </div>

        {/* Round Complete Message */}
        {isRoundComplete && (
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border`}>
            <div className="text-green-500 font-bold text-lg">{t('tools.archeryScore.roundComplete', 'Round Complete!')}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Final Score: {calculations.totalScore} / {calculations.maxPossible}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.archeryScore.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• X counts as 10 points but is tracked separately for tiebreakers</li>
                <li>• End totals help identify consistency patterns</li>
                <li>• Personal bests are automatically synced to the cloud</li>
                <li>• Use Reset to start a new round with the same settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArcheryScoreTool;
