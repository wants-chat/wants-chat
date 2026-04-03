import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Target, RotateCcw, Trophy, History, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface Roll {
  pins: number | null;
}

interface Frame {
  rolls: Roll[];
  score: number | null;
  isStrike: boolean;
  isSpare: boolean;
}

interface GameHistory {
  id: string;
  date: string; // ISO string for serialization
  totalScore: number;
  strikes: number;
  spares: number;
  frames: Frame[];
}

interface GameStats {
  totalScore: number;
  strikeCount: number;
  spareCount: number;
  averagePinsPerFrame: number;
}

// Helper functions
const createEmptyFrame = (isTenth: boolean = false): Frame => ({
  rolls: isTenth ? [{ pins: null }, { pins: null }, { pins: null }] : [{ pins: null }, { pins: null }],
  score: null,
  isStrike: false,
  isSpare: false,
});

const createEmptyGame = (): Frame[] => {
  return Array.from({ length: 10 }, (_, i) => createEmptyFrame(i === 9));
};

const isStrike = (roll: Roll): boolean => roll.pins === 10;
const isSpare = (roll1: Roll, roll2: Roll): boolean => {
  if (roll1.pins === null || roll2.pins === null) return false;
  return roll1.pins + roll2.pins === 10 && roll1.pins !== 10;
};

const calculateScores = (frames: Frame[]): Frame[] => {
  const newFrames = frames.map(f => ({ ...f, rolls: [...f.rolls] }));
  let runningScore = 0;

  for (let i = 0; i < 10; i++) {
    const frame = newFrames[i];
    const roll1 = frame.rolls[0].pins;
    const roll2 = frame.rolls[1].pins;

    if (roll1 === null) {
      frame.score = null;
      frame.isStrike = false;
      frame.isSpare = false;
      continue;
    }

    // 10th frame special handling
    if (i === 9) {
      const roll3 = frame.rolls[2].pins;
      frame.isStrike = roll1 === 10;
      frame.isSpare = !frame.isStrike && roll2 !== null && roll1 + roll2 === 10;

      // Check if 10th frame is complete
      if (roll1 === 10 || (roll2 !== null && roll1 + roll2 === 10)) {
        // Strike or spare - need 3rd roll
        if (roll3 === null) {
          frame.score = null;
          continue;
        }
        runningScore += roll1 + (roll2 ?? 0) + roll3;
      } else if (roll2 !== null) {
        // Open frame - no 3rd roll needed
        runningScore += roll1 + roll2;
      } else {
        frame.score = null;
        continue;
      }
      frame.score = runningScore;
      continue;
    }

    // Regular frames (1-9)
    frame.isStrike = roll1 === 10;
    frame.isSpare = roll2 !== null && roll1 + roll2 === 10 && roll1 !== 10;

    if (frame.isStrike) {
      // Strike - need next two rolls
      const nextFrame = newFrames[i + 1];
      const nextRoll1 = nextFrame?.rolls[0].pins;
      const nextRoll2 = nextFrame?.rolls[1].pins;

      if (nextRoll1 === null) {
        frame.score = null;
        continue;
      }

      if (nextRoll1 === 10 && i < 8) {
        // Next is also a strike (not 10th frame)
        const afterNextFrame = newFrames[i + 2];
        const afterNextRoll1 = afterNextFrame?.rolls[0].pins;
        if (afterNextRoll1 === null) {
          frame.score = null;
          continue;
        }
        runningScore += 10 + 10 + afterNextRoll1;
      } else if (nextRoll1 === 10 && i === 8) {
        // 9th frame strike, 10th frame starts with strike
        if (nextRoll2 === null) {
          frame.score = null;
          continue;
        }
        runningScore += 10 + 10 + nextRoll2;
      } else {
        if (nextRoll2 === null) {
          frame.score = null;
          continue;
        }
        runningScore += 10 + nextRoll1 + nextRoll2;
      }
      frame.score = runningScore;
    } else if (frame.isSpare) {
      // Spare - need next roll
      const nextFrame = newFrames[i + 1];
      const nextRoll1 = nextFrame?.rolls[0].pins;

      if (nextRoll1 === null) {
        frame.score = null;
        continue;
      }
      runningScore += 10 + nextRoll1;
      frame.score = runningScore;
    } else if (roll2 !== null) {
      // Open frame
      runningScore += roll1 + roll2;
      frame.score = runningScore;
    } else {
      frame.score = null;
    }
  }

  return newFrames;
};

const getAvailablePins = (frames: Frame[], frameIndex: number, rollIndex: number): number[] => {
  const frame = frames[frameIndex];

  if (frameIndex === 9) {
    // 10th frame special rules
    if (rollIndex === 0) {
      return Array.from({ length: 11 }, (_, i) => i);
    } else if (rollIndex === 1) {
      const roll1 = frame.rolls[0].pins;
      if (roll1 === 10) {
        // After a strike, all pins are reset
        return Array.from({ length: 11 }, (_, i) => i);
      } else if (roll1 !== null) {
        return Array.from({ length: 11 - roll1 }, (_, i) => i);
      }
    } else if (rollIndex === 2) {
      const roll1 = frame.rolls[0].pins;
      const roll2 = frame.rolls[1].pins;
      if (roll1 === 10 && roll2 === 10) {
        // Two strikes - all pins reset
        return Array.from({ length: 11 }, (_, i) => i);
      } else if (roll1 === 10 && roll2 !== null && roll2 < 10) {
        // Strike then not strike
        return Array.from({ length: 11 - roll2 }, (_, i) => i);
      } else if (roll1 !== null && roll2 !== null && roll1 + roll2 === 10) {
        // Spare - all pins reset
        return Array.from({ length: 11 }, (_, i) => i);
      }
    }
    return [];
  }

  // Regular frames
  if (rollIndex === 0) {
    return Array.from({ length: 11 }, (_, i) => i);
  } else {
    const roll1 = frame.rolls[0].pins;
    if (roll1 !== null && roll1 < 10) {
      return Array.from({ length: 11 - roll1 }, (_, i) => i);
    }
  }
  return [];
};

// Column configuration for export and sync
const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Game ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'totalScore', header: 'Total Score', type: 'number' },
  { key: 'strikes', header: 'Strikes', type: 'number' },
  { key: 'spares', header: 'Spares', type: 'number' },
];

interface BowlingScoreCalculatorToolProps {
  uiConfig?: UIConfig;
}

export function BowlingScoreCalculatorTool({ uiConfig }: BowlingScoreCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [frames, setFrames] = useState<Frame[]>(createEmptyGame());
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentRoll, setCurrentRoll] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Use the useToolData hook for backend persistence of game history
  const {
    data: gameHistory,
    setData: setGameHistory,
    addItem: addGameToHistory,
    deleteItem: deleteGameFromHistory,
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
  } = useToolData<GameHistory>('bowling-score-calculator', [], COLUMNS);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        setIsPrefilled(true);
        if (params.showHistory !== undefined) {
          setShowHistory(Boolean(params.showHistory));
        }
        // Game history is managed by useToolData hook automatically
      } else if (params.showHistory !== undefined) {
        // Bowling tool has minimal prefill - mainly for initialization
        setShowHistory(Boolean(params.showHistory));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const stats = useMemo((): GameStats => {
    const scoredFrames = calculateScores(frames);
    const lastScoredFrame = [...scoredFrames].reverse().find(f => f.score !== null);
    const totalScore = lastScoredFrame?.score ?? 0;

    let strikeCount = 0;
    let spareCount = 0;
    let totalPins = 0;
    let rollCount = 0;

    scoredFrames.forEach((frame, idx) => {
      if (frame.isStrike) strikeCount++;
      if (frame.isSpare) spareCount++;

      frame.rolls.forEach(roll => {
        if (roll.pins !== null) {
          totalPins += roll.pins;
          rollCount++;
        }
      });

      // Count additional strikes in 10th frame
      if (idx === 9) {
        if (frame.rolls[1].pins === 10 && frame.rolls[0].pins === 10) strikeCount++;
        if (frame.rolls[2].pins === 10 && (frame.rolls[1].pins === 10 || (frame.rolls[0].pins !== null && frame.rolls[1].pins !== null && frame.rolls[0].pins + frame.rolls[1].pins === 10))) strikeCount++;
      }
    });

    const framesWithRolls = scoredFrames.filter(f => f.rolls[0].pins !== null).length;
    const averagePinsPerFrame = framesWithRolls > 0 ? totalPins / framesWithRolls : 0;

    return {
      totalScore,
      strikeCount,
      spareCount,
      averagePinsPerFrame
    };
  }, [frames]);

  const handlePinClick = useCallback((pins: number) => {
    setFrames(prevFrames => {
      const newFrames = prevFrames.map(f => ({
        ...f,
        rolls: f.rolls.map(r => ({ ...r }))
      }));

      newFrames[currentFrame].rolls[currentRoll].pins = pins;

      return calculateScores(newFrames);
    });

    // Determine next position
    if (currentFrame === 9) {
      // 10th frame logic
      const frame = frames[currentFrame];
      const roll1 = currentRoll === 0 ? pins : frame.rolls[0].pins;
      const roll2 = currentRoll === 1 ? pins : frame.rolls[1].pins;

      if (currentRoll === 0) {
        setCurrentRoll(1);
      } else if (currentRoll === 1) {
        if (roll1 === 10 || (roll1 !== null && roll1 + pins === 10)) {
          // Strike or spare - get 3rd roll
          setCurrentRoll(2);
        }
        // Otherwise game is complete
      }
      // After roll 3, game is complete
    } else {
      // Regular frames
      if (currentRoll === 0 && pins === 10) {
        // Strike - move to next frame
        setCurrentFrame(prev => prev + 1);
        setCurrentRoll(0);
      } else if (currentRoll === 0) {
        setCurrentRoll(1);
      } else {
        setCurrentFrame(prev => prev + 1);
        setCurrentRoll(0);
      }
    }
  }, [currentFrame, currentRoll, frames]);

  const isGameComplete = useMemo(() => {
    const lastFrame = frames[9];
    const roll1 = lastFrame.rolls[0].pins;
    const roll2 = lastFrame.rolls[1].pins;
    const roll3 = lastFrame.rolls[2].pins;

    if (roll1 === null || roll2 === null) return false;

    // Strike or spare requires 3rd roll
    if (roll1 === 10 || roll1 + roll2 === 10) {
      return roll3 !== null;
    }

    return true;
  }, [frames]);

  const handleNewGame = useCallback(() => {
    if (frames[0].rolls[0].pins !== null) {
      // Save current game to history
      const scoredFrames = calculateScores(frames);
      const lastFrame = [...scoredFrames].reverse().find(f => f.score !== null);

      if (lastFrame) {
        const newGame: GameHistory = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          totalScore: lastFrame.score ?? 0,
          strikes: stats.strikeCount,
          spares: stats.spareCount,
          frames: scoredFrames
        };
        // Use addItem from useToolData hook - prepend to beginning and limit to 10
        setGameHistory(prev => [newGame, ...prev].slice(0, 10));
      }
    }

    setFrames(createEmptyGame());
    setCurrentFrame(0);
    setCurrentRoll(0);
  }, [frames, stats, setGameHistory]);

  const availablePins = getAvailablePins(frames, currentFrame, currentRoll);
  const scoredFrames = calculateScores(frames);

  const getRollDisplay = (frame: Frame, rollIndex: number, frameIndex: number): string => {
    const roll = frame.rolls[rollIndex];
    if (roll.pins === null) return '';
    if (roll.pins === 0) return '-';
    if (roll.pins === 10) {
      if (frameIndex === 9) {
        return 'X';
      }
      if (rollIndex === 0) return 'X';
    }
    if (rollIndex === 1 && frameIndex < 9) {
      const prevRoll = frame.rolls[0].pins;
      if (prevRoll !== null && prevRoll + roll.pins === 10) return '/';
    }
    if (rollIndex === 1 && frameIndex === 9) {
      const prevRoll = frame.rolls[0].pins;
      if (prevRoll !== 10 && prevRoll !== null && prevRoll + roll.pins === 10) return '/';
    }
    if (rollIndex === 2 && frameIndex === 9) {
      const prevRoll = frame.rolls[1].pins;
      const firstRoll = frame.rolls[0].pins;
      if (prevRoll !== 10 && firstRoll === 10 && prevRoll !== null && prevRoll + roll.pins === 10) return '/';
      if (firstRoll !== 10 && prevRoll !== null && firstRoll !== null && firstRoll + prevRoll === 10 && roll.pins === 10) return 'X';
    }
    return roll.pins.toString();
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.bowlingScoreCalculator.bowlingScoreCalculator', 'Bowling Score Calculator')}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="bowling-score-calculator" toolName="Bowling Score Calculator" />

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
                onExportCSV={() => exportCSV({ filename: 'bowling_scores' })}
                onExportExcel={() => exportExcel({ filename: 'bowling_scores' })}
                onExportJSON={() => exportJSON({ filename: 'bowling_scores' })}
                onExportPDF={() => exportPDF({
                  filename: 'bowling_scores',
                  title: 'Bowling Score History',
                  subtitle: `${gameHistory.length} game(s) recorded`
                })}
                onPrint={() => print('Bowling Score History')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                disabled={gameHistory.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <History className="w-5 h-5" />
              </button>
              <button
                onClick={handleNewGame}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                {t('tools.bowlingScoreCalculator.newGame', 'New Game')}
              </button>
            </div>
          </div>

          {/* Scorecard */}
          <div className="mb-6 overflow-x-auto">
            <div className={`min-w-[800px] border-2 rounded-lg ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              {/* Frame Headers */}
              <div className="flex">
                {scoredFrames.map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 text-center py-2 font-bold border-r last:border-r-0 ${
                      idx === 9 ? 'flex-[1.5]' : ''
                    } ${
                      currentFrame === idx && !isGameComplete
                        ? 'bg-[#0D9488] text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 border-gray-600'
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>

              {/* Roll Boxes */}
              <div className={`flex border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                {scoredFrames.map((frame, frameIdx) => (
                  <div
                    key={frameIdx}
                    className={`flex-1 flex border-r last:border-r-0 ${
                      frameIdx === 9 ? 'flex-[1.5]' : ''
                    } ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                  >
                    {/* Roll cells */}
                    {frame.rolls.map((_, rollIdx) => {
                      const display = getRollDisplay(frame, rollIdx, frameIdx);
                      const isActive = currentFrame === frameIdx && currentRoll === rollIdx && !isGameComplete;
                      return (
                        <div
                          key={rollIdx}
                          className={`flex-1 h-10 flex items-center justify-center text-lg font-bold border-r last:border-r-0 ${
                            isActive
                              ? 'bg-[#0D9488]/20 ring-2 ring-[#0D9488]'
                              : ''
                          } ${
                            display === 'X'
                              ? 'text-red-500'
                              : display === '/'
                              ? 'text-blue-500'
                              : isDark
                              ? 'text-white border-gray-600'
                              : 'text-gray-900 border-gray-300'
                          }`}
                        >
                          {display}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Frame Scores */}
              <div className={`flex border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                {scoredFrames.map((frame, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-12 flex items-center justify-center text-xl font-bold border-r last:border-r-0 ${
                      idx === 9 ? 'flex-[1.5]' : ''
                    } ${isDark ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'}`}
                  >
                    {frame.score ?? ''}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pin Selector */}
          {!isGameComplete && (
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Frame {currentFrame + 1}, Roll {currentRoll + 1} - Select pins knocked down:
              </label>
              <div className="flex flex-wrap gap-2 justify-center">
                {availablePins.map(pins => (
                  <button
                    key={pins}
                    onClick={() => handlePinClick(pins)}
                    className={`w-12 h-12 rounded-full font-bold text-lg transition-all hover:scale-110 ${
                      pins === 10
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : pins === 0
                        ? isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        : 'bg-[#0D9488] hover:bg-[#0F766E] text-white'
                    }`}
                  >
                    {pins === 0 ? '-' : pins === 10 ? 'X' : pins}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Game Complete Message */}
          {isGameComplete && (
            <div className={`mb-6 p-6 rounded-lg text-center ${
              isDark ? 'bg-gray-700' : 'bg-green-50'
            }`}>
              <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.bowlingScoreCalculator.gameComplete', 'Game Complete!')}
              </h2>
              <p className={`text-4xl font-bold text-[#0D9488]`}>
                Final Score: {stats.totalScore}
              </p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.bowlingScoreCalculator.totalScore', 'Total Score')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold text-[#0D9488]`}>
                  {stats.totalScore}
                </div>
              </CardContent>
            </Card>

            <Card className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-red-500" />
                    {t('tools.bowlingScoreCalculator.strikes', 'Strikes')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.strikeCount}
                </div>
              </CardContent>
            </Card>

            <Card className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-1">
                    <Circle className="w-4 h-4 text-blue-500" />
                    {t('tools.bowlingScoreCalculator.spares', 'Spares')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.spareCount}
                </div>
              </CardContent>
            </Card>

            <Card className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    {t('tools.bowlingScoreCalculator.avgFrame', 'Avg/Frame')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.averagePinsPerFrame.toFixed(1)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game History */}
          {showHistory && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <History className="w-5 h-5" />
                {t('tools.bowlingScoreCalculator.gameHistory', 'Game History')}
              </h3>
              {gameHistory.length === 0 ? (
                <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.bowlingScoreCalculator.noGamesPlayedYetComplete', 'No games played yet. Complete a game to see your history.')}
                </p>
              ) : (
                <div className="space-y-3">
                  {gameHistory.map((game, idx) => {
                    const gameDate = new Date(game.date);
                    return (
                      <div
                        key={game.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isDark ? 'bg-gray-600' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`text-lg font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            #{gameHistory.length - idx}
                          </div>
                          <div>
                            <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              Score: {game.totalScore}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {gameDate.toLocaleDateString()} {gameDate.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-red-500 font-medium">
                            {game.strikes}X
                          </span>
                          <span className="text-blue-500 font-medium">
                            {game.spares}/
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Scoring Guide */}
          <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.bowlingScoreCalculator.scoringRules', 'Scoring Rules')}
            </h3>
            <div className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold">X</span>
                <span><strong>{t('tools.bowlingScoreCalculator.strike', 'Strike:')}</strong> All 10 pins on first roll. Score = 10 + next 2 rolls.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">/</span>
                <span><strong>{t('tools.bowlingScoreCalculator.spare', 'Spare:')}</strong> All 10 pins in 2 rolls. Score = 10 + next 1 roll.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold">-</span>
                <span><strong>{t('tools.bowlingScoreCalculator.gutter', 'Gutter:')}</strong> {t('tools.bowlingScoreCalculator.noPinsKnockedDown', 'No pins knocked down.')}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-500">
                <strong>10th Frame:</strong> Strike or spare earns bonus roll(s). Maximum 3 rolls possible.
              </div>
              <div>
                <strong>{t('tools.bowlingScoreCalculator.perfectGame', 'Perfect Game:')}</strong> 12 strikes in a row = 300 points
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BowlingScoreCalculatorTool;
