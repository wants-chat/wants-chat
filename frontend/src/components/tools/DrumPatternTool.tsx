import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Drum, Play, Pause, RotateCcw, Volume2, Music, Grid3X3, Library, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Genre = 'rock' | 'jazz' | 'funk' | 'latin';
type TimeSignature = '4/4' | '3/4' | '6/8' | '5/4';
type Subdivision = '8th' | '16th' | 'triplet';

interface DrumPattern {
  name: string;
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
  description: string;
}

interface GenreConfig {
  name: string;
  color: string;
  patterns: DrumPattern[];
}

interface DrumPatternToolProps {
  uiConfig?: UIConfig;
}

export const DrumPatternTool: React.FC<DrumPatternToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [genre, setGenre] = useState<Genre>('rock');
  const [tempo, setTempo] = useState(120);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
  const [subdivision, setSubdivision] = useState<Subdivision>('8th');
  const [selectedPatternIndex, setSelectedPatternIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [volume, setVolume] = useState(0.7);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.genre && ['rock', 'jazz', 'funk', 'latin'].includes(data.genre as string)) {
        setGenre(data.genre as Genre);
      }
      if (data.tempo) {
        setTempo(Number(data.tempo));
      }
      if (data.timeSignature && ['4/4', '3/4', '6/8', '5/4'].includes(data.timeSignature as string)) {
        setTimeSignature(data.timeSignature as TimeSignature);
      }
      if (data.subdivision && ['8th', '16th', 'triplet'].includes(data.subdivision as string)) {
        setSubdivision(data.subdivision as Subdivision);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getStepsCount = useCallback(() => {
    const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);
    switch (subdivision) {
      case '16th':
        return beatsPerMeasure * 4;
      case 'triplet':
        return beatsPerMeasure * 3;
      case '8th':
      default:
        return beatsPerMeasure * 2;
    }
  }, [timeSignature, subdivision]);

  const genres: Record<Genre, GenreConfig> = {
    rock: {
      name: 'Rock',
      color: 'red',
      patterns: [
        {
          name: 'Basic Rock',
          kick: [true, false, false, false, true, false, false, false],
          snare: [false, false, true, false, false, false, true, false],
          hihat: [true, true, true, true, true, true, true, true],
          description: 'Classic rock beat with straight 8ths',
        },
        {
          name: 'Driving Rock',
          kick: [true, false, true, false, true, false, true, false],
          snare: [false, false, true, false, false, false, true, false],
          hihat: [true, true, true, true, true, true, true, true],
          description: 'Four-on-the-floor rock pattern',
        },
        {
          name: 'Half-Time',
          kick: [true, false, false, false, false, false, false, false],
          snare: [false, false, false, false, true, false, false, false],
          hihat: [true, true, true, true, true, true, true, true],
          description: 'Heavy half-time feel',
        },
      ],
    },
    jazz: {
      name: 'Jazz',
      color: 'blue',
      patterns: [
        {
          name: 'Swing',
          kick: [true, false, false, true, false, false],
          snare: [false, false, true, false, false, true],
          hihat: [true, false, true, true, false, true],
          description: 'Classic swing pattern with triplet feel',
        },
        {
          name: 'Bossa Nova',
          kick: [true, false, false, true, false, false, true, false],
          snare: [false, false, true, false, false, true, false, false],
          hihat: [true, true, true, true, true, true, true, true],
          description: 'Brazilian jazz-influenced groove',
        },
        {
          name: 'Jazz Waltz',
          kick: [true, false, false, false, false, false],
          snare: [false, false, true, false, false, true],
          hihat: [true, true, true, true, true, true],
          description: '3/4 jazz pattern',
        },
      ],
    },
    funk: {
      name: 'Funk',
      color: 'purple',
      patterns: [
        {
          name: 'Classic Funk',
          kick: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false],
          snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
          hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
          description: 'Syncopated funk with 16th note feel',
        },
        {
          name: 'Pocket Groove',
          kick: [true, false, false, false, false, false, true, false, true, false, false, false, false, false, false, false],
          snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
          hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
          description: 'Deep pocket funk pattern',
        },
        {
          name: 'Breakbeat',
          kick: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
          snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
          hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
          description: 'Classic breakbeat pattern',
        },
      ],
    },
    latin: {
      name: 'Latin',
      color: 'orange',
      patterns: [
        {
          name: 'Samba',
          kick: [true, false, false, true, false, false, true, false],
          snare: [false, false, true, false, false, true, false, false],
          hihat: [true, true, true, true, true, true, true, true],
          description: 'Brazilian samba groove',
        },
        {
          name: 'Son Clave',
          kick: [true, false, false, true, false, false, false, false, true, false, true, false, true, false, false, false],
          snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
          hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
          description: '3-2 Son clave pattern',
        },
        {
          name: 'Tumbao',
          kick: [false, false, false, true, false, false, true, false],
          snare: [false, false, true, false, false, false, true, false],
          hihat: [true, true, true, true, true, true, true, true],
          description: 'Cuban tumbao bass pattern',
        },
      ],
    },
  };

  const config = genres[genre];
  const currentPattern = config.patterns[selectedPatternIndex] || config.patterns[0];
  const stepsCount = getStepsCount();

  // Normalize pattern to current step count
  const normalizePattern = (pattern: boolean[]): boolean[] => {
    const result: boolean[] = [];
    for (let i = 0; i < stepsCount; i++) {
      result.push(pattern[i % pattern.length] || false);
    }
    return result;
  };

  const normalizedKick = normalizePattern(currentPattern.kick);
  const normalizedSnare = normalizePattern(currentPattern.snare);
  const normalizedHihat = normalizePattern(currentPattern.hihat);

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  const getColorTextClass = (color: string) => {
    const colors: Record<string, string> = {
      red: 'text-red-500',
      blue: 'text-blue-500',
      purple: 'text-purple-500',
      orange: 'text-orange-500',
    };
    return colors[color] || 'text-gray-500';
  };

  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [volume]);

  const playBeat = useCallback((beat: number) => {
    if (normalizedKick[beat]) {
      playSound(60, 0.1, 'sine');
    }
    if (normalizedSnare[beat]) {
      playSound(200, 0.1, 'triangle');
    }
    if (normalizedHihat[beat]) {
      playSound(800, 0.05, 'square');
    }
  }, [normalizedKick, normalizedSnare, normalizedHihat, playSound]);

  useEffect(() => {
    if (isPlaying) {
      const msPerBeat = (60000 / tempo) / (stepsCount / parseInt(timeSignature.split('/')[0]));
      intervalRef.current = setInterval(() => {
        setCurrentBeat((prev) => {
          const nextBeat = (prev + 1) % stepsCount;
          playBeat(nextBeat);
          return nextBeat;
        });
      }, msPerBeat);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, tempo, stepsCount, timeSignature, playBeat]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
  };

  const handleGenreChange = (newGenre: Genre) => {
    setGenre(newGenre);
    setSelectedPatternIndex(0);
    handleReset();
  };

  const timeSignatures: TimeSignature[] = ['4/4', '3/4', '6/8', '5/4'];
  const subdivisions: { value: Subdivision; label: string }[] = [
    { value: '8th', label: '8th Notes' },
    { value: '16th', label: '16th Notes' },
    { value: 'triplet', label: 'Triplets' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg"><Drum className="w-5 h-5 text-purple-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.drumPattern.drumPatternTool', 'Drum Pattern Tool')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.drumPattern.exploreDrumPatternsAcrossGenres', 'Explore drum patterns across genres')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Genre Selection */}
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(genres) as Genre[]).map((g) => (
            <button
              key={g}
              onClick={() => handleGenreChange(g)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                genre === g
                  ? `${getColorClass(genres[g].color)} text-white`
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {genres[g].name}
            </button>
          ))}
        </div>

        {/* Pattern Library */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
          <div className="flex items-center gap-2 mb-3">
            <Library className={`w-4 h-4 ${getColorTextClass(config.color)}`} />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.drumPattern.patternLibrary', 'Pattern Library')}</span>
          </div>
          <div className="space-y-2">
            {config.patterns.map((pattern, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedPatternIndex(index);
                  handleReset();
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedPatternIndex === index
                    ? isDark
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-white border-gray-300 shadow-sm'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                } border ${isDark ? 'border-gray-700' : 'border-transparent'}`}
              >
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{pattern.name}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{pattern.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Signature & Subdivision */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Music className="w-4 h-4" />
              {t('tools.drumPattern.timeSignature', 'Time Signature')}
            </label>
            <div className="grid grid-cols-4 gap-1">
              {timeSignatures.map((ts) => (
                <button
                  key={ts}
                  onClick={() => {
                    setTimeSignature(ts);
                    handleReset();
                  }}
                  className={`py-2 rounded-lg text-sm ${
                    timeSignature === ts
                      ? `${getColorClass(config.color)} text-white`
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {ts}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Grid3X3 className="w-4 h-4" />
              {t('tools.drumPattern.subdivision', 'Subdivision')}
            </label>
            <div className="grid grid-cols-3 gap-1">
              {subdivisions.map((sub) => (
                <button
                  key={sub.value}
                  onClick={() => {
                    setSubdivision(sub.value);
                    handleReset();
                  }}
                  className={`py-2 rounded-lg text-xs ${
                    subdivision === sub.value
                      ? `${getColorClass(config.color)} text-white`
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Beat Visualizer */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Beat Visualizer - {currentPattern.name}
          </div>
          <div className="space-y-3">
            {/* Hi-Hat Row */}
            <div className="flex items-center gap-2">
              <span className={`w-16 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.drumPattern.hiHat', 'Hi-Hat')}</span>
              <div className="flex gap-1 flex-1">
                {normalizedHihat.map((active, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded transition-all duration-100 ${
                      currentBeat === i && isPlaying
                        ? 'ring-2 ring-yellow-400 scale-110'
                        : ''
                    } ${
                      active
                        ? isDark
                          ? 'bg-yellow-500/80'
                          : 'bg-yellow-400'
                        : isDark
                        ? 'bg-gray-700'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            {/* Snare Row */}
            <div className="flex items-center gap-2">
              <span className={`w-16 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.drumPattern.snare', 'Snare')}</span>
              <div className="flex gap-1 flex-1">
                {normalizedSnare.map((active, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded transition-all duration-100 ${
                      currentBeat === i && isPlaying
                        ? 'ring-2 ring-yellow-400 scale-110'
                        : ''
                    } ${
                      active
                        ? isDark
                          ? 'bg-blue-500/80'
                          : 'bg-blue-400'
                        : isDark
                        ? 'bg-gray-700'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            {/* Kick Row */}
            <div className="flex items-center gap-2">
              <span className={`w-16 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.drumPattern.kick', 'Kick')}</span>
              <div className="flex gap-1 flex-1">
                {normalizedKick.map((active, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded transition-all duration-100 ${
                      currentBeat === i && isPlaying
                        ? 'ring-2 ring-yellow-400 scale-110'
                        : ''
                    } ${
                      active
                        ? isDark
                          ? 'bg-red-500/80'
                          : 'bg-red-400'
                        : isDark
                        ? 'bg-gray-700'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Beat Numbers */}
          <div className="flex items-center gap-2 mt-2">
            <span className="w-16"></span>
            <div className="flex gap-1 flex-1">
              {Array.from({ length: stepsCount }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 text-center text-xs ${
                    currentBeat === i && isPlaying
                      ? getColorTextClass(config.color)
                      : isDark
                      ? 'text-gray-500'
                      : 'text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tempo Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Tempo: {tempo} BPM
            </label>
            <div className="flex gap-2">
              {[80, 100, 120, 140, 160].map((t) => (
                <button
                  key={t}
                  onClick={() => setTempo(t)}
                  className={`px-2 py-1 rounded text-xs ${
                    tempo === t
                      ? `${getColorClass(config.color)} text-white`
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <input
            type="range"
            min="40"
            max="200"
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Volume2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Volume: {Math.round(volume * 100)}%
            </label>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        {/* Playback Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : `${getColorClass(config.color)} hover:opacity-90 text-white`
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                {t('tools.drumPattern.pause', 'Pause')}
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {t('tools.drumPattern.play', 'Play')}
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className={`px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
            {t('tools.drumPattern.reset', 'Reset')}
          </button>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.drumPattern.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Each genre has unique feel and timing</li>
                <li>- Adjust tempo to match your practice speed</li>
                <li>- Use subdivisions to explore different rhythmic feels</li>
                <li>- Time signatures change the pattern length</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrumPatternTool;
