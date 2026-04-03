import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Timer, Lightbulb, Key, Puzzle, AlertTriangle, Play, Pause, RotateCcw, Plus, Minus, Eye, EyeOff, Check, Lock } from 'lucide-react';
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

interface Puzzle {
  id: string;
  name: string;
  solved: boolean;
  hint?: string;
}

interface Clue {
  id: string;
  content: string;
  revealed: boolean;
}

interface EscapeRoomTimerToolProps {
  uiConfig?: UIConfig;
}

// Export columns configuration
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name' },
  { key: 'solved', header: 'Solved', type: 'boolean' },
  { key: 'hint', header: 'Hint' },
];

export const EscapeRoomTimerTool: React.FC<EscapeRoomTimerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Timer state
  const [totalMinutes, setTotalMinutes] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        hasChanges = true;
      }

      if (params.totalMinutes) {
        const mins = Number(params.totalMinutes);
        setTotalMinutes(mins);
        setTimeRemaining(mins * 60);
        hasChanges = true;
      }
      if (params.maxHints) {
        setMaxHints(Number(params.maxHints));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    } else if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.totalMinutes) {
        const mins = Number(data.totalMinutes);
        setTotalMinutes(mins);
        setTimeRemaining(mins * 60);
      }
      if (data.maxHints) {
        setMaxHints(Number(data.maxHints));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Hint counter
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(5);

  // Puzzles
  const [puzzles, setPuzzles] = useState<Puzzle[]>([
    { id: '1', name: 'Puzzle 1', solved: false, hint: 'Look under the rug' },
    { id: '2', name: 'Puzzle 2', solved: false, hint: 'The code is in the painting' },
    { id: '3', name: 'Puzzle 3', solved: false, hint: 'Count the candles' },
  ]);
  const [newPuzzleName, setNewPuzzleName] = useState('');
  const [newPuzzleHint, setNewPuzzleHint] = useState('');

  // Clues
  const [clues, setClues] = useState<Clue[]>([
    { id: '1', content: 'The treasure is hidden where shadows meet light', revealed: false },
    { id: '2', content: 'Three keys unlock the final door', revealed: false },
    { id: '3', content: 'Look for the symbol on the north wall', revealed: false },
  ]);
  const [newClueContent, setNewClueContent] = useState('');

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Timer controls
  const handleStart = () => {
    if (!hasStarted) {
      setTimeRemaining(totalMinutes * 60);
      setHasStarted(true);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setHasStarted(false);
    setTimeRemaining(totalMinutes * 60);
    setHintsUsed(0);
    setPuzzles(puzzles.map((p) => ({ ...p, solved: false })));
    setClues(clues.map((c) => ({ ...c, revealed: false })));
  };

  const adjustTime = (delta: number) => {
    if (!hasStarted) {
      const newTime = Math.max(5, Math.min(180, totalMinutes + delta));
      setTotalMinutes(newTime);
      setTimeRemaining(newTime * 60);
    }
  };

  // Hint functions
  const useHint = () => {
    if (hintsUsed < maxHints) {
      setHintsUsed((prev) => prev + 1);
    }
  };

  // Puzzle functions
  const togglePuzzleSolved = (id: string) => {
    setPuzzles(puzzles.map((p) => (p.id === id ? { ...p, solved: !p.solved } : p)));
  };

  const addPuzzle = () => {
    if (newPuzzleName.trim()) {
      setPuzzles([
        ...puzzles,
        {
          id: Date.now().toString(),
          name: newPuzzleName.trim(),
          solved: false,
          hint: newPuzzleHint.trim() || undefined,
        },
      ]);
      setNewPuzzleName('');
      setNewPuzzleHint('');
    }
  };

  const removePuzzle = (id: string) => {
    setPuzzles(puzzles.filter((p) => p.id !== id));
  };

  // Clue functions
  const toggleClueRevealed = (id: string) => {
    setClues(clues.map((c) => (c.id === id ? { ...c, revealed: !c.revealed } : c)));
  };

  const addClue = () => {
    if (newClueContent.trim()) {
      setClues([
        ...clues,
        {
          id: Date.now().toString(),
          content: newClueContent.trim(),
          revealed: false,
        },
      ]);
      setNewClueContent('');
    }
  };

  const removeClue = (id: string) => {
    setClues(clues.filter((c) => c.id !== id));
  };

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(puzzles, COLUMNS, { filename: 'escape-room-puzzles' });
  };

  const handleExportExcel = () => {
    exportToExcel(puzzles, COLUMNS, { filename: 'escape-room-puzzles' });
  };

  const handleExportJSON = () => {
    exportToJSON(puzzles, { filename: 'escape-room-puzzles', includeMetadata: true });
  };

  const handleExportPDF = async () => {
    await exportToPDF(puzzles, COLUMNS, {
      filename: 'escape-room-puzzles',
      title: 'Escape Room Puzzles',
      subtitle: new Date().toLocaleDateString(),
    });
  };

  const handlePrint = () => {
    printData(puzzles, COLUMNS, { title: 'Escape Room Puzzles' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(puzzles, COLUMNS, 'tab');
  };

  // Calculate progress
  const solvedPuzzles = puzzles.filter((p) => p.solved).length;
  const progressPercent = puzzles.length > 0 ? (solvedPuzzles / puzzles.length) * 100 : 0;

  // Dramatic countdown check (last 5 minutes)
  const isDramatic = timeRemaining <= 300 && timeRemaining > 0 && isRunning;
  const isCritical = timeRemaining <= 60 && timeRemaining > 0 && isRunning;
  const isGameOver = timeRemaining === 0 && hasStarted;
  const isVictory = solvedPuzzles === puzzles.length && puzzles.length > 0 && hasStarted;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Lock className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.escapeRoomTimer.escapeRoomTimer', 'Escape Room Timer')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.escapeRoomTimer.manageYourEscapeRoomGame', 'Manage your escape room game')}</p>
            </div>
          </div>
          {puzzles.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              disabled={puzzles.length === 0}
              showImport={false}
              theme={theme}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Timer Display */}
        <div
          className={`p-6 rounded-xl text-center ${
            isGameOver
              ? 'bg-red-500/20 border-red-500'
              : isVictory
              ? 'bg-green-500/20 border-green-500'
              : isCritical
              ? 'bg-red-500/20 border-red-500 animate-pulse'
              : isDramatic
              ? 'bg-orange-500/20 border-orange-500'
              : isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          } border-2`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className={`w-6 h-6 ${isCritical ? 'text-red-500' : isDramatic ? 'text-orange-500' : 'text-purple-500'}`} />
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.escapeRoomTimer.timeRemaining', 'Time Remaining')}</span>
          </div>
          <div
            className={`text-6xl font-bold font-mono ${
              isGameOver
                ? 'text-red-500'
                : isVictory
                ? 'text-green-500'
                : isCritical
                ? 'text-red-500'
                : isDramatic
                ? 'text-orange-500'
                : 'text-purple-500'
            }`}
          >
            {formatTime(timeRemaining)}
          </div>
          {isGameOver && (
            <div className="mt-2 text-red-500 font-bold flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t('tools.escapeRoomTimer.gameOverTimeSUp', 'GAME OVER - Time\'s Up!')}
            </div>
          )}
          {isVictory && (
            <div className="mt-2 text-green-500 font-bold flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              {t('tools.escapeRoomTimer.escapedAllPuzzlesSolved', 'ESCAPED! All puzzles solved!')}
            </div>
          )}
          {isCritical && !isGameOver && (
            <div className="mt-2 text-red-400 font-medium">{t('tools.escapeRoomTimer.finalCountdown', 'Final countdown!')}</div>
          )}
          {isDramatic && !isCritical && (
            <div className="mt-2 text-orange-400 font-medium">{t('tools.escapeRoomTimer.lessThan5MinutesRemaining', 'Less than 5 minutes remaining!')}</div>
          )}
        </div>

        {/* Time Adjustment (only before starting) */}
        {!hasStarted && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => adjustTime(-5)}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {totalMinutes} minutes
            </div>
            <button
              onClick={() => adjustTime(5)}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Timer Controls */}
        <div className="flex justify-center gap-3">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={isGameOver}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              {hasStarted ? t('tools.escapeRoomTimer.resume', 'Resume') : t('tools.escapeRoomTimer.start', 'Start')}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <Pause className="w-5 h-5" />
              {t('tools.escapeRoomTimer.pause', 'Pause')}
            </button>
          )}
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <RotateCcw className="w-5 h-5" />
            {t('tools.escapeRoomTimer.reset', 'Reset')}
          </button>
        </div>

        {/* Hint Counter */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.escapeRoomTimer.hintsUsed', 'Hints Used')}</span>
            </div>
            <span className="text-yellow-500 font-bold text-xl">
              {hintsUsed} / {maxHints}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={useHint}
              disabled={hintsUsed >= maxHints}
              className="flex-1 py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('tools.escapeRoomTimer.useHint', 'Use Hint')}
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMaxHints(Math.max(1, maxHints - 1))}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMaxHints(maxHints + 1)}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Hint bar */}
          <div className={`mt-3 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
            <div
              className="h-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${(hintsUsed / maxHints) * 100}%` }}
            />
          </div>
        </div>

        {/* Progress Overview */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.escapeRoomTimer.puzzleProgress', 'Puzzle Progress')}</span>
            <span className="text-purple-500 font-bold">
              {solvedPuzzles} / {puzzles.length}
            </span>
          </div>
          <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Puzzle Tracker */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
          <div className="flex items-center gap-2 mb-4">
            <Puzzle className="w-5 h-5 text-purple-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.escapeRoomTimer.puzzleTracker', 'Puzzle Tracker')}</span>
          </div>
          <div className="space-y-2 mb-4">
            {puzzles.map((puzzle) => (
              <div
                key={puzzle.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  puzzle.solved
                    ? isDark
                      ? 'bg-green-900/30 border-green-700'
                      : 'bg-green-100 border-green-300'
                    : isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                } border`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePuzzleSolved(puzzle.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      puzzle.solved
                        ? 'bg-green-500 border-green-500 text-white'
                        : isDark
                        ? 'border-gray-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {puzzle.solved && <Check className="w-4 h-4" />}
                  </button>
                  <span className={`${puzzle.solved ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {puzzle.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {puzzle.hint && (
                    <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                      {t('tools.escapeRoomTimer.hasHint', 'Has hint')}
                    </span>
                  )}
                  <button
                    onClick={() => removePuzzle(puzzle.id)}
                    className={`text-sm ${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    {t('tools.escapeRoomTimer.remove', 'Remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Add Puzzle */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newPuzzleName}
              onChange={(e) => setNewPuzzleName(e.target.value)}
              placeholder={t('tools.escapeRoomTimer.puzzleName', 'Puzzle name')}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
            />
            <input
              type="text"
              value={newPuzzleHint}
              onChange={(e) => setNewPuzzleHint(e.target.value)}
              placeholder={t('tools.escapeRoomTimer.hintOptional', 'Hint (optional)')}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
            />
            <button
              onClick={addPuzzle}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clue Reveal System */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-blue-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.escapeRoomTimer.clueRevealSystem', 'Clue Reveal System')}</span>
          </div>
          <div className="space-y-2 mb-4">
            {clues.map((clue) => (
              <div
                key={clue.id}
                className={`p-3 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {clue.revealed ? (
                      <p className={isDark ? 'text-white' : 'text-gray-900'}>{clue.content}</p>
                    ) : (
                      <p className={`italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {t('tools.escapeRoomTimer.clueHiddenClickToReveal', '[Clue hidden - click to reveal]')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button
                      onClick={() => toggleClueRevealed(clue.id)}
                      className={`p-2 rounded-lg ${
                        clue.revealed
                          ? 'bg-blue-500 text-white'
                          : isDark
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {clue.revealed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => removeClue(clue.id)}
                      className={`text-sm ${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                    >
                      {t('tools.escapeRoomTimer.remove2', 'Remove')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Add Clue */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newClueContent}
              onChange={(e) => setNewClueContent(e.target.value)}
              placeholder={t('tools.escapeRoomTimer.enterANewClue', 'Enter a new clue...')}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
            />
            <button
              onClick={addClue}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.escapeRoomTimer.hintsLeft', 'Hints Left')}</div>
            <div className="text-xl font-bold text-yellow-500">{maxHints - hintsUsed}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.escapeRoomTimer.puzzlesLeft', 'Puzzles Left')}</div>
            <div className="text-xl font-bold text-purple-500">{puzzles.length - solvedPuzzles}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.escapeRoomTimer.cluesHidden', 'Clues Hidden')}</div>
            <div className="text-xl font-bold text-blue-500">{clues.filter((c) => !c.revealed).length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscapeRoomTimerTool;
