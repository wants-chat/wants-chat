import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Play, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface TapData {
  timestamps: number[];
  bpm: number;
  tapCount: number;
}

const getTempoMarking = (bpm: number): string => {
  if (bpm < 40) return 'Grave';
  if (bpm < 60) return 'Largo';
  if (bpm < 66) return 'Larghetto';
  if (bpm < 76) return 'Adagio';
  if (bpm < 108) return 'Andante';
  if (bpm < 120) return 'Moderato';
  if (bpm < 156) return 'Allegro';
  if (bpm < 176) return 'Vivace';
  return 'Presto';
};

const getBPMCategory = (bpm: number): { label: string; color: string } => {
  if (bpm < 60) return { label: 'Slow', color: 'text-blue-500' };
  if (bpm < 100) return { label: 'Moderate', color: 'text-green-500' };
  if (bpm < 140) return { label: 'Fast', color: 'text-orange-500' };
  return { label: 'Very Fast', color: 'text-red-500' };
};

interface BPMTapperToolProps {
  uiConfig?: UIConfig;
}

export const BPMTapperTool: React.FC<BPMTapperToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [tapData, setTapData] = useState<TapData>({
    timestamps: [],
    bpm: 0,
    tapCount: 0,
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        metronomeEnabled?: boolean;
      };
      if (params.metronomeEnabled !== undefined) setMetronomeEnabled(params.metronomeEnabled);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const playClickSound = useCallback(() => {
    if (!metronomeEnabled) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }, [metronomeEnabled]);

  const calculateBPM = useCallback((timestamps: number[]): number => {
    if (timestamps.length < 2) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }

    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = 60000 / averageInterval;

    return Math.round(bpm);
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();

    // Clear existing reset timeout
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }

    // Set new reset timeout for 3 seconds
    resetTimeoutRef.current = setTimeout(() => {
      setTapData({
        timestamps: [],
        bpm: 0,
        tapCount: 0,
      });
    }, 3000);

    setTapData((prev) => {
      // Keep only last 8 taps for more accurate recent BPM
      const newTimestamps = [...prev.timestamps, now].slice(-8);
      const newBpm = calculateBPM(newTimestamps);

      return {
        timestamps: newTimestamps,
        bpm: newBpm,
        tapCount: prev.tapCount + 1,
      };
    });

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 100);

    // Play click sound
    playClickSound();
  }, [calculateBPM, playClickSound]);

  const handleReset = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    setTapData({
      timestamps: [],
      bpm: 0,
      tapCount: 0,
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleTap();
      }
    },
    [handleTap]
  );

  const bpmCategory = getBPMCategory(tapData.bpm);
  const tempoMarking = getTempoMarking(tapData.bpm);

  return (
    <div
      className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Music className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.bPMTapper.bpmTapper', 'BPM Tapper')}
          </h1>
        </div>

        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-2 justify-center">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.bPMTapper.settingsHaveBeenPrefilledFrom', 'Settings have been prefilled from AI suggestions')}
            </span>
          </div>
        )}

        {/* Main Card */}
        <div
          className={`rounded-2xl p-8 shadow-xl ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          {/* BPM Display */}
          <div className="text-center mb-8">
            <div
              className={`text-8xl font-bold mb-2 transition-all duration-200 ${
                isAnimating ? 'scale-110' : 'scale-100'
              } ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {tapData.bpm || '--'}
            </div>
            <div className={`text-2xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bPMTapper.bpm', 'BPM')}</div>

            {/* BPM Category */}
            {tapData.bpm > 0 && (
              <div className="mt-4 space-y-2">
                <span className={`text-xl font-semibold ${bpmCategory.color}`}>
                  {bpmCategory.label}
                </span>
                <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tempoMarking}
                </div>
              </div>
            )}
          </div>

          {/* Tap Button */}
          <button
            onClick={handleTap}
            className={`w-full py-16 rounded-2xl text-2xl font-bold transition-all duration-100 transform
              ${isAnimating ? 'scale-95' : 'scale-100'}
              ${
                isDark
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white shadow-lg shadow-purple-900/30'
                  : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30'
              }
              active:scale-95 focus:outline-none focus:ring-4 ${
                isDark ? 'focus:ring-purple-500/50' : 'focus:ring-purple-400/50'
              }`}
          >
            <div className="flex flex-col items-center gap-3">
              <Play className="w-12 h-12" />
              <span>{t('tools.bPMTapper.tap', 'TAP')}</span>
              <span className={`text-sm font-normal ${isDark ? 'text-purple-200' : 'text-purple-100'}`}>
                {t('tools.bPMTapper.orPressSpacebar', 'or press Spacebar')}
              </span>
            </div>
          </button>

          {/* Stats Row */}
          <div className="flex justify-between items-center mt-8">
            {/* Tap Count */}
            <div
              className={`px-6 py-3 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-100'
              }`}
            >
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Taps:{' '}
              </span>
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {tapData.tapCount}
              </span>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              {/* Metronome Toggle */}
              <button
                onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                className={`p-3 rounded-xl transition-all ${
                  metronomeEnabled
                    ? isDark
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-500 text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title={metronomeEnabled ? t('tools.bPMTapper.disableSound', 'Disable sound') : t('tools.bPMTapper.enableSound', 'Enable sound')}
              >
                <Volume2 className="w-6 h-6" />
              </button>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className={`p-3 rounded-xl transition-all ${
                  isDark
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-900'
                }`}
                title={t('tools.bPMTapper.reset', 'Reset')}
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Auto-reset notice */}
          <p
            className={`text-center text-sm mt-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          >
            {t('tools.bPMTapper.autoResetsAfter3Seconds', 'Auto-resets after 3 seconds of inactivity')}
          </p>
        </div>

        {/* Tempo Reference */}
        <div
          className={`mt-8 rounded-2xl p-6 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {t('tools.bPMTapper.commonTempoMarkings', 'Common Tempo Markings')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'Largo', range: '40-60' },
              { name: 'Adagio', range: '66-76' },
              { name: 'Andante', range: '76-108' },
              { name: 'Moderato', range: '108-120' },
              { name: 'Allegro', range: '120-156' },
              { name: 'Presto', range: '168-200' },
            ].map((tempo) => (
              <div
                key={tempo.name}
                className={`px-4 py-3 rounded-lg ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-100'
                }`}
              >
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {tempo.name}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {tempo.range} BPM
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div
          className={`mt-6 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
        >
          {t('tools.bPMTapper.tapTheButtonOrPress', 'Tap the button or press spacebar in rhythm with your music to calculate the BPM')}
        </div>
      </div>
    </div>
  );
};

export default BPMTapperTool;
