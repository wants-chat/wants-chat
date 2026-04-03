import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Play, Pause, Minus, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface MetronomeToolProps {
  uiConfig?: UIConfig;
}

export const MetronomeTool: React.FC<MetronomeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [bpm, setBpm] = useState(120);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.bpm) {
        setBpm(Number(data.bpm));
      }
      if (data.beatsPerMeasure) {
        setBeatsPerMeasure(Number(data.beatsPerMeasure));
      }
      if (data.accentFirst !== undefined) {
        setAccentFirst(Boolean(data.accentFirst));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [accentFirst, setAccentFirst] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playClick = useCallback((isAccent: boolean) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = isAccent ? 1000 : 800;
    gainNode.gain.value = isAccent ? 0.5 : 0.3;

    oscillator.start(ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    oscillator.stop(ctx.currentTime + 0.1);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = (60 / bpm) * 1000;
      let beat = 0;

      const tick = () => {
        const isAccent = accentFirst && beat === 0;
        playClick(isAccent);
        setCurrentBeat(beat);
        beat = (beat + 1) % beatsPerMeasure;
      };

      tick();
      intervalRef.current = setInterval(tick, interval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, bpm, beatsPerMeasure, accentFirst, playClick]);

  const adjustBpm = (delta: number) => {
    setBpm((prev) => Math.max(20, Math.min(300, prev + delta)));
  };

  const tempoMarkings = [
    { name: 'Largo', min: 40, max: 60 },
    { name: 'Adagio', min: 66, max: 76 },
    { name: 'Andante', min: 76, max: 108 },
    { name: 'Moderato', min: 108, max: 120 },
    { name: 'Allegro', min: 120, max: 168 },
    { name: 'Presto', min: 168, max: 200 },
    { name: 'Prestissimo', min: 200, max: 300 },
  ];

  const getCurrentTempo = () => {
    for (const tempo of tempoMarkings) {
      if (bpm >= tempo.min && bpm <= tempo.max) return tempo.name;
    }
    return '';
  };

  const presetBpms = [60, 80, 100, 120, 140, 160, 180];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><Music className="w-5 h-5 text-orange-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.metronome.metronome', 'Metronome')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.metronome.keepPerfectTimeWhilePracticing', 'Keep perfect time while practicing')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* BPM Display */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-6">
            <button onClick={() => adjustBpm(-5)} className={`p-4 rounded-full ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
              <Minus className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <div className="text-center">
              <div className={`text-7xl font-bold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{bpm}</div>
              <div className="text-orange-500 font-medium">{getCurrentTempo()}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.metronome.bpm', 'BPM')}</div>
            </div>
            <button onClick={() => adjustBpm(5)} className={`p-4 rounded-full ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
              <Plus className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
          </div>
        </div>

        {/* BPM Slider */}
        <div className="px-4">
          <input type="range" min="20" max="300" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value))} className="w-full accent-orange-500" />
          <div className="flex justify-between text-xs mt-1">
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>20</span>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>300</span>
          </div>
        </div>

        {/* Beat Indicators */}
        <div className="flex justify-center gap-3">
          {Array.from({ length: beatsPerMeasure }, (_, i) => (
            <div key={i} className={`w-8 h-8 rounded-full transition-all duration-100 ${currentBeat === i && isPlaying ? (i === 0 && accentFirst ? 'bg-orange-500 scale-125' : 'bg-orange-400 scale-110') : isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          ))}
        </div>

        {/* Play Button */}
        <div className="flex justify-center">
          <button onClick={() => setIsPlaying(!isPlaying)} className={`px-12 py-4 rounded-full font-medium flex items-center gap-3 text-lg ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'} text-white transition-colors`}>
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            {isPlaying ? t('tools.metronome.stop', 'Stop') : t('tools.metronome.start', 'Start')}
          </button>
        </div>

        {/* Preset BPMs */}
        <div className="flex flex-wrap justify-center gap-2">
          {presetBpms.map((preset) => (
            <button key={preset} onClick={() => setBpm(preset)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${bpm === preset ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
              {preset}
            </button>
          ))}
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.metronome.beatsPerMeasure', 'Beats per Measure')}</label>
            <div className="flex gap-2">
              {[2, 3, 4, 6, 8].map((beats) => (
                <button key={beats} onClick={() => setBeatsPerMeasure(beats)} className={`flex-1 py-2 rounded-lg text-sm ${beatsPerMeasure === beats ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  {beats}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Options</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={accentFirst} onChange={(e) => setAccentFirst(e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.metronome.accentFirstBeat', 'Accent first beat')}</span>
            </label>
          </div>
        </div>

        {/* Tempo Guide */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.metronome.tempoGuide', 'Tempo Guide')}</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {tempoMarkings.map((tempo) => (
              <button key={tempo.name} onClick={() => setBpm(Math.floor((tempo.min + tempo.max) / 2))} className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                {tempo.name} ({tempo.min}-{tempo.max})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetronomeTool;
