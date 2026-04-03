import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX, Play, Pause, Timer, Waves, CloudRain, Wind, Coffee, Trees } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface NoiseType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface WhiteNoiseToolProps {
  uiConfig?: UIConfig;
}

export const WhiteNoiseTool: React.FC<WhiteNoiseToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [selectedNoise, setSelectedNoise] = useState('white');
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const noiseTypes: NoiseType[] = [
    { id: 'white', name: 'White Noise', icon: <Waves className="w-5 h-5" />, color: 'bg-gray-500' },
    { id: 'pink', name: 'Pink Noise', icon: <Waves className="w-5 h-5" />, color: 'bg-pink-500' },
    { id: 'brown', name: 'Brown Noise', icon: <Waves className="w-5 h-5" />, color: 'bg-amber-700' },
    { id: 'rain', name: 'Rain', icon: <CloudRain className="w-5 h-5" />, color: 'bg-blue-500' },
    { id: 'wind', name: 'Wind', icon: <Wind className="w-5 h-5" />, color: 'bg-cyan-500' },
    { id: 'cafe', name: 'Café', icon: <Coffee className="w-5 h-5" />, color: 'bg-amber-600' },
    { id: 'forest', name: 'Forest', icon: <Trees className="w-5 h-5" />, color: 'bg-green-600' },
  ];

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.noiseType && noiseTypes.find(n => n.id === data.noiseType)) {
        setSelectedNoise(data.noiseType as string);
      }
      if (data.volume !== undefined) {
        setVolume(Number(data.volume));
      }
      if (data.timerMinutes !== undefined) {
        setTimerMinutes(Number(data.timerMinutes));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const generateNoise = useCallback((type: string, sampleRate: number, duration: number): Float32Array => {
    const samples = sampleRate * duration;
    const buffer = new Float32Array(samples);

    switch (type) {
      case 'white':
        for (let i = 0; i < samples; i++) {
          buffer[i] = Math.random() * 2 - 1;
        }
        break;
      case 'pink': {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < samples; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          buffer[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
        break;
      }
      case 'brown': {
        let lastOut = 0;
        for (let i = 0; i < samples; i++) {
          const white = Math.random() * 2 - 1;
          buffer[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = buffer[i];
          buffer[i] *= 3.5;
        }
        break;
      }
      case 'rain':
        for (let i = 0; i < samples; i++) {
          const base = Math.random() * 2 - 1;
          const drop = Math.random() < 0.001 ? (Math.random() - 0.5) * 2 : 0;
          buffer[i] = base * 0.3 + drop;
        }
        break;
      case 'wind':
        for (let i = 0; i < samples; i++) {
          const time = i / sampleRate;
          const modulation = Math.sin(time * 0.5) * 0.3 + 0.7;
          buffer[i] = (Math.random() * 2 - 1) * modulation * 0.5;
        }
        break;
      case 'cafe':
        for (let i = 0; i < samples; i++) {
          const base = (Math.random() * 2 - 1) * 0.15;
          const chatter = Math.sin(i * 0.001) * Math.random() * 0.1;
          buffer[i] = base + chatter;
        }
        break;
      case 'forest':
        for (let i = 0; i < samples; i++) {
          const wind = (Math.random() * 2 - 1) * 0.2;
          const bird = Math.random() < 0.0001 ? Math.sin(i * 0.1) * 0.3 : 0;
          buffer[i] = wind + bird;
        }
        break;
      default:
        for (let i = 0; i < samples; i++) {
          buffer[i] = Math.random() * 2 - 1;
        }
    }

    return buffer;
  }, []);

  const startNoise = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const duration = 4; // seconds of buffer
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const noiseData = generateNoise(selectedNoise, ctx.sampleRate, duration);
    data.set(noiseData);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume / 100;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();

    noiseNodeRef.current = source;
    gainNodeRef.current = gainNode;
  }, [selectedNoise, volume, generateNoise]);

  const stopNoise = useCallback(() => {
    if (noiseNodeRef.current) {
      noiseNodeRef.current.stop();
      noiseNodeRef.current.disconnect();
      noiseNodeRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopNoise();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else {
      startNoise();
      if (timerMinutes > 0) {
        setTimerRemaining(timerMinutes * 60);
        timerRef.current = setInterval(() => {
          setTimerRemaining((prev) => {
            if (prev <= 1) {
              stopNoise();
              setIsPlaying(false);
              if (timerRef.current) clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      stopNoise();
      startNoise();
    }
  }, [selectedNoise, isPlaying, startNoise, stopNoise]);

  useEffect(() => {
    return () => {
      stopNoise();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopNoise]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg"><Waves className="w-5 h-5 text-indigo-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.whiteNoise.whiteNoiseGenerator', 'White Noise Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.whiteNoise.ambientSoundsForFocusAnd', 'Ambient sounds for focus and relaxation')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Noise Type Selection */}
        <div className="grid grid-cols-4 gap-3">
          {noiseTypes.map((noise) => (
            <button
              key={noise.id}
              onClick={() => setSelectedNoise(noise.id)}
              className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                selectedNoise === noise.id
                  ? `${noise.color} text-white`
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {noise.icon}
              <span className="text-xs">{noise.name}</span>
            </button>
          ))}
        </div>

        {/* Play Button */}
        <div className="flex justify-center">
          <button
            onClick={togglePlay}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-indigo-500 hover:bg-indigo-600 text-white animate-pulse'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
          </button>
        </div>

        {/* Volume Control */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-4">
            <VolumeX className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="flex-1"
            />
            <Volume2 className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`w-12 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>{volume}%</span>
          </div>
        </div>

        {/* Sleep Timer */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-4 h-4 text-indigo-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.whiteNoise.sleepTimer', 'Sleep Timer')}</span>
            {timerRemaining > 0 && (
              <span className="ml-auto text-indigo-500 font-mono">{formatTime(timerRemaining)}</span>
            )}
          </div>
          <div className="flex gap-2">
            {[0, 15, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setTimerMinutes(mins);
                  setTimerRemaining(0);
                }}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  timerMinutes === mins
                    ? 'bg-indigo-500 text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {mins === 0 ? 'Off' : `${mins}m`}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.whiteNoise.tip', 'Tip:')}</strong> White noise helps mask distracting sounds. Pink noise is gentler and great for sleep. Brown noise is deeper and helps with focus.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhiteNoiseTool;
