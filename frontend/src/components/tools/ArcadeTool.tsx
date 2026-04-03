import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Gamepad2, Trophy, RotateCcw, Play, Pause, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 15;
const INITIAL_SPEED = 150;

interface ArcadeToolProps {
  uiConfig?: UIConfig;
}

interface GameSession {
  id: string;
  score: number;
  snakeLength: number;
  duration: number; // in seconds
  playedAt: string;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'score', header: 'Score', type: 'number' },
  { key: 'snakeLength', header: 'Snake Length', type: 'number' },
  { key: 'duration', header: 'Duration (s)', type: 'number' },
  { key: 'playedAt', header: 'Played At', type: 'date' },
];

export const ArcadeTool: React.FC<ArcadeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  // Use the useToolData hook for backend persistence
  const {
    data: gameSessions,
    addItem,
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
  } = useToolData<GameSession>('arcade-game', [], COLUMNS);

  // Calculate high score from game sessions
  const highScore = gameSessions.length > 0
    ? Math.max(...gameSessions.map(s => s.score))
    : 0;

  // Save game session when game ends
  const saveGameSession = useCallback(() => {
    if (score > 0 && gameStartTime) {
      const duration = Math.round((Date.now() - gameStartTime) / 1000);
      const newSession: GameSession = {
        id: Date.now().toString(),
        score,
        snakeLength: snake.length,
        duration,
        playedAt: new Date().toISOString(),
      };
      addItem(newSession);
    }
  }, [score, snake.length, gameStartTime, addItem]);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        setIsPrefilled(true);
        // Note: Game state is managed by useToolData hook automatically
      } else if (params) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    // Save the previous game session if there was one
    if (gameOver && score > 0) {
      saveGameSession();
    }
    setSnake([{ x: 7, y: 7 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setIsPaused(true);
    setGameStartTime(null);
  };

  // Start tracking game time when game starts
  useEffect(() => {
    if (!isPaused && !gameOver && !gameStartTime) {
      setGameStartTime(Date.now());
    }
  }, [isPaused, gameOver, gameStartTime]);

  // Save game session when game ends
  useEffect(() => {
    if (gameOver && score > 0 && gameStartTime) {
      saveGameSession();
    }
  }, [gameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver]);

  useEffect(() => {
    if (isPaused || gameOver) return;

    const moveSnake = () => {
      setSnake(prev => {
        const head = { ...prev[0] };
        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE ||
            prev.some(s => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood());
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [direction, food, isPaused, gameOver, generateFood]);

  const cardClass = `p-4 rounded-lg ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">
            {isEditFromGallery ? t('tools.arcade.dataRestoredFromYourSaved', 'Data restored from your saved gallery') : t('tools.arcade.dataLoadedFromAiResponse', 'Data loaded from AI response')}
          </span>
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] mb-4">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.arcade.snakeArcade', 'Snake Arcade')}
          </h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {t('tools.arcade.useArrowKeysToPlay', 'Use arrow keys to play, Space to pause')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="arcade" toolName="Arcade" />

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
            onExportCSV={() => exportCSV({ filename: 'arcade-stats' })}
            onExportExcel={() => exportExcel({ filename: 'arcade-stats' })}
            onExportJSON={() => exportJSON({ filename: 'arcade-stats' })}
            onExportPDF={() => exportPDF({
              filename: 'arcade-stats',
              title: 'Arcade Game Statistics',
              subtitle: `${gameSessions.length} games played - High Score: ${highScore}`
            })}
            onPrint={() => print('Arcade Game Statistics')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      <div className="flex justify-center gap-6 mb-4">
        <div className={`${cardClass} flex items-center gap-2`}>
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className={isDark ? 'text-white' : 'text-gray-900'}>
            Score: {score}
          </span>
        </div>
        <div className={`${cardClass} flex items-center gap-2`}>
          <Trophy className="w-5 h-5 text-[#0D9488]" />
          <span className={isDark ? 'text-white' : 'text-gray-900'}>
            High: {highScore}
          </span>
        </div>
        <div className={`${cardClass} flex items-center gap-2`}>
          <Gamepad2 className="w-5 h-5 text-purple-500" />
          <span className={isDark ? 'text-white' : 'text-gray-900'}>
            Games: {gameSessions.length}
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          className={`grid gap-[1px] p-2 rounded-lg ${isDark ? 'bg-[#333]' : 'bg-gray-300'}`}
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnake = snake.some(s => s.x === x && s.y === y);
            const isHead = snake[0]?.x === x && snake[0]?.y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={i}
                className={`w-5 h-5 rounded-sm ${
                  isHead ? 'bg-[#0D9488]' :
                  isSnake ? 'bg-[#14B8A6]' :
                  isFood ? 'bg-red-500' :
                  isDark ? 'bg-[#1a1a1a]' : 'bg-white'
                }`}
              />
            );
          })}
        </div>
      </div>

      {gameOver && (
        <div className="text-center">
          <p className="text-xl font-bold text-red-500 mb-4">{t('tools.arcade.gameOver', 'Game Over!')}</p>
        </div>
      )}

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsPaused(p => !p)}
          disabled={gameOver}
          className="flex items-center gap-2 px-6 py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50"
        >
          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          {isPaused ? t('tools.arcade.play', 'Play') : t('tools.arcade.pause', 'Pause')}
        </button>
        <button
          onClick={resetGame}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg ${
            isDark ? 'bg-[#333] text-white hover:bg-[#444]' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          {t('tools.arcade.reset', 'Reset')}
        </button>
      </div>
    </div>
  );
};

export default ArcadeTool;
