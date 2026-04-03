import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Play, Pause, Volume2, Info, Guitar, Waves } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type TuningType = 'standard' | 'dropD' | 'openG' | 'openD' | 'dadgad' | 'halfStepDown' | 'fullStepDown' | 'openE';

interface StringInfo {
  name: string;
  note: string;
  frequency: number;
  octave: number;
}

interface TuningConfig {
  name: string;
  description: string;
  strings: StringInfo[];
}

interface GuitarTunerToolProps {
  uiConfig?: UIConfig;
}

export const GuitarTunerTool: React.FC<GuitarTunerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [selectedTuning, setSelectedTuning] = useState<TuningType>('standard');
  const [selectedString, setSelectedString] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.tuningType && ['standard', 'dropD', 'openG', 'openD', 'dadgad', 'halfStepDown', 'fullStepDown', 'openE'].includes(data.tuningType as string)) {
        setSelectedTuning(data.tuningType as TuningType);
      }
      if (data.volume !== undefined) {
        setVolume(Number(data.volume));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const tunings: Record<TuningType, TuningConfig> = {
    standard: {
      name: 'Standard (EADGBE)',
      description: 'The most common guitar tuning used in rock, pop, blues, and most genres.',
      strings: [
        { name: '6th (Low E)', note: 'E2', frequency: 82.41, octave: 2 },
        { name: '5th (A)', note: 'A2', frequency: 110.00, octave: 2 },
        { name: '4th (D)', note: 'D3', frequency: 146.83, octave: 3 },
        { name: '3rd (G)', note: 'G3', frequency: 196.00, octave: 3 },
        { name: '2nd (B)', note: 'B3', frequency: 246.94, octave: 3 },
        { name: '1st (High E)', note: 'E4', frequency: 329.63, octave: 4 },
      ],
    },
    dropD: {
      name: 'Drop D (DADGBE)',
      description: 'Low E dropped to D. Popular in rock, metal, and alternative music.',
      strings: [
        { name: '6th (Low D)', note: 'D2', frequency: 73.42, octave: 2 },
        { name: '5th (A)', note: 'A2', frequency: 110.00, octave: 2 },
        { name: '4th (D)', note: 'D3', frequency: 146.83, octave: 3 },
        { name: '3rd (G)', note: 'G3', frequency: 196.00, octave: 3 },
        { name: '2nd (B)', note: 'B3', frequency: 246.94, octave: 3 },
        { name: '1st (High E)', note: 'E4', frequency: 329.63, octave: 4 },
      ],
    },
    openG: {
      name: 'Open G (DGDGBD)',
      description: 'Strumming open strings plays a G chord. Used in blues, slide guitar, and Rolling Stones songs.',
      strings: [
        { name: '6th (Low D)', note: 'D2', frequency: 73.42, octave: 2 },
        { name: '5th (G)', note: 'G2', frequency: 98.00, octave: 2 },
        { name: '4th (D)', note: 'D3', frequency: 146.83, octave: 3 },
        { name: '3rd (G)', note: 'G3', frequency: 196.00, octave: 3 },
        { name: '2nd (B)', note: 'B3', frequency: 246.94, octave: 3 },
        { name: '1st (D)', note: 'D4', frequency: 293.66, octave: 4 },
      ],
    },
    openD: {
      name: 'Open D (DADF#AD)',
      description: 'Strumming open strings plays a D chord. Great for slide guitar and folk music.',
      strings: [
        { name: '6th (Low D)', note: 'D2', frequency: 73.42, octave: 2 },
        { name: '5th (A)', note: 'A2', frequency: 110.00, octave: 2 },
        { name: '4th (D)', note: 'D3', frequency: 146.83, octave: 3 },
        { name: '3rd (F#)', note: 'F#3', frequency: 185.00, octave: 3 },
        { name: '2nd (A)', note: 'A3', frequency: 220.00, octave: 3 },
        { name: '1st (D)', note: 'D4', frequency: 293.66, octave: 4 },
      ],
    },
    dadgad: {
      name: 'DADGAD',
      description: 'A modal tuning popular in Celtic and folk music. Creates a Dsus4 chord when strummed open.',
      strings: [
        { name: '6th (Low D)', note: 'D2', frequency: 73.42, octave: 2 },
        { name: '5th (A)', note: 'A2', frequency: 110.00, octave: 2 },
        { name: '4th (D)', note: 'D3', frequency: 146.83, octave: 3 },
        { name: '3rd (G)', note: 'G3', frequency: 196.00, octave: 3 },
        { name: '2nd (A)', note: 'A3', frequency: 220.00, octave: 3 },
        { name: '1st (D)', note: 'D4', frequency: 293.66, octave: 4 },
      ],
    },
    halfStepDown: {
      name: 'Half Step Down (Eb)',
      description: 'All strings tuned down half a step. Used by Hendrix, Stevie Ray Vaughan, and many others.',
      strings: [
        { name: '6th (Eb)', note: 'Eb2', frequency: 77.78, octave: 2 },
        { name: '5th (Ab)', note: 'Ab2', frequency: 103.83, octave: 2 },
        { name: '4th (Db)', note: 'Db3', frequency: 138.59, octave: 3 },
        { name: '3rd (Gb)', note: 'Gb3', frequency: 185.00, octave: 3 },
        { name: '2nd (Bb)', note: 'Bb3', frequency: 233.08, octave: 3 },
        { name: '1st (Eb)', note: 'Eb4', frequency: 311.13, octave: 4 },
      ],
    },
    fullStepDown: {
      name: 'Full Step Down (D)',
      description: 'All strings tuned down one whole step. Creates a heavier, darker tone.',
      strings: [
        { name: '6th (D)', note: 'D2', frequency: 73.42, octave: 2 },
        { name: '5th (G)', note: 'G2', frequency: 98.00, octave: 2 },
        { name: '4th (C)', note: 'C3', frequency: 130.81, octave: 3 },
        { name: '3rd (F)', note: 'F3', frequency: 174.61, octave: 3 },
        { name: '2nd (A)', note: 'A3', frequency: 220.00, octave: 3 },
        { name: '1st (D)', note: 'D4', frequency: 293.66, octave: 4 },
      ],
    },
    openE: {
      name: 'Open E (EBEG#BE)',
      description: 'Strumming open strings plays an E chord. Popular for slide guitar in blues.',
      strings: [
        { name: '6th (E)', note: 'E2', frequency: 82.41, octave: 2 },
        { name: '5th (B)', note: 'B2', frequency: 123.47, octave: 2 },
        { name: '4th (E)', note: 'E3', frequency: 164.81, octave: 3 },
        { name: '3rd (G#)', note: 'G#3', frequency: 207.65, octave: 3 },
        { name: '2nd (B)', note: 'B3', frequency: 246.94, octave: 3 },
        { name: '1st (E)', note: 'E4', frequency: 329.63, octave: 4 },
      ],
    },
  };

  const config = tunings[selectedTuning];
  const currentString = config.strings[selectedString];

  const playTone = useCallback((frequency: number) => {
    // Stop any currently playing tone
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
    }

    // Create audio context if it doesn't exist
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;

    // Create oscillator for the fundamental frequency
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Use a sawtooth wave for a more guitar-like tone
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Create a low-pass filter to smooth the sound
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, audioContext.currentTime);
    filter.Q.setValueAtTime(1, audioContext.currentTime);

    // Set up the gain with an envelope for a more natural sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.15, audioContext.currentTime + 0.5);

    // Connect the nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    setIsPlaying(true);
  }, [volume]);

  const stopTone = useCallback(() => {
    if (oscillatorRef.current && gainNodeRef.current && audioContextRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.1);
      setTimeout(() => {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
          oscillatorRef.current = null;
        }
      }, 100);
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopTone();
    } else {
      playTone(currentString.frequency);
    }
  };

  const handleStringSelect = (index: number) => {
    stopTone();
    setSelectedString(index);
  };

  const tuningTips = [
    'Tune from low to high pitch to prevent string breakage',
    'Stretch new strings before tuning for better stability',
    'Tune in a quiet environment for better accuracy',
    'Check tuning after playing for a few minutes as strings settle',
    'Keep your guitar in a case to maintain tuning stability',
    'Use harmonics at the 12th fret to double-check your tuning',
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg"><Guitar className="w-5 h-5 text-indigo-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guitarTuner.guitarTuner', 'Guitar Tuner')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guitarTuner.referencePitchPlayerForAccurate', 'Reference pitch player for accurate tuning')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tuning Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.guitarTuner.selectTuning', 'Select Tuning')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(tunings) as TuningType[]).map((tuning) => (
              <button
                key={tuning}
                onClick={() => {
                  stopTone();
                  setSelectedTuning(tuning);
                  setSelectedString(0);
                }}
                className={`py-2 px-3 rounded-lg text-sm text-left ${selectedTuning === tuning ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {tunings[tuning].name}
              </button>
            ))}
          </div>
        </div>

        {/* Tuning Description */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} border`}>
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-4 h-4 text-indigo-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {config.description}
          </p>
        </div>

        {/* String Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.guitarTuner.selectString', 'Select String')}
          </label>
          <div className="grid grid-cols-6 gap-2">
            {config.strings.map((string, index) => (
              <button
                key={index}
                onClick={() => handleStringSelect(index)}
                className={`py-3 px-2 rounded-lg text-center ${selectedString === index ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <div className="text-lg font-bold">{string.note.replace(/[0-9]/g, '')}</div>
                <div className="text-xs opacity-75">{index + 1}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current String Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentString.name}</div>
              <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentString.note}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-indigo-500" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.guitarTuner.frequency', 'Frequency')}</span>
              </div>
              <div className="text-2xl font-bold text-indigo-500">{currentString.frequency.toFixed(2)} Hz</div>
            </div>
          </div>

          {/* Play Button */}
          <button
            onClick={togglePlay}
            className={`w-full py-4 rounded-lg flex items-center justify-center gap-3 ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'} text-white transition-colors`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6" />
                <span className="font-medium">{t('tools.guitarTuner.stopReferenceTone', 'Stop Reference Tone')}</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                <span className="font-medium">{t('tools.guitarTuner.playReferenceTone', 'Play Reference Tone')}</span>
              </>
            )}
          </button>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Volume2 className="w-4 h-4 inline mr-1" />
              {t('tools.guitarTuner.volume', 'Volume')}
            </label>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* String by String Guide */}
        <div className="space-y-2">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guitarTuner.stringGuide', 'String Guide')}</h4>
          <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-3 py-2 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>String</th>
                  <th className={`px-3 py-2 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guitarTuner.note', 'Note')}</th>
                  <th className={`px-3 py-2 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guitarTuner.frequency2', 'Frequency')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {config.strings.map((string, index) => (
                  <tr
                    key={index}
                    onClick={() => handleStringSelect(index)}
                    className={`cursor-pointer ${selectedString === index ? (isDark ? 'bg-indigo-900/30' : 'bg-indigo-50') : (isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50')}`}
                  >
                    <td className={`px-3 py-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{string.name}</td>
                    <td className={`px-3 py-2 text-sm font-medium ${selectedString === index ? 'text-indigo-500' : (isDark ? 'text-white' : 'text-gray-900')}`}>{string.note}</td>
                    <td className={`px-3 py-2 text-sm text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{string.frequency.toFixed(2)} Hz</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tuning Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.guitarTuner.tuningTips', 'Tuning Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                {tuningTips.map((tip, index) => (
                  <li key={index}>- {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuitarTunerTool;
