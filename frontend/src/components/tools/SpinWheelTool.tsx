import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCw, Plus, X, Sparkles, Volume2, VolumeX, Download, Settings, Palette } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface WheelOption {
  id: string;
  text: string;
  color: string;
}

interface SpinResult {
  option: string;
  timestamp: string;
}

const DEFAULT_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#14B8A6', // teal
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#F43F5E', // rose
  '#06B6D4', // cyan
];

interface SpinWheelToolProps {
  uiConfig?: UIConfig;
}

export const SpinWheelTool: React.FC<SpinWheelToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [options, setOptions] = useState<WheelOption[]>([
    { id: '1', text: 'Option 1', color: DEFAULT_COLORS[0] },
    { id: '2', text: 'Option 2', color: DEFAULT_COLORS[1] },
    { id: '3', text: 'Option 3', color: DEFAULT_COLORS[2] },
    { id: '4', text: 'Option 4', color: DEFAULT_COLORS[3] },
  ]);
  const [newOptionText, setNewOptionText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<SpinResult[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [spinDuration, setSpinDuration] = useState(5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        options?: string[];
      };
      if (params.options && params.options.length > 0) {
        setOptions(params.options.map((text, idx) => ({
          id: `p-${idx}`,
          text,
          color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        })));
      }
      if (params.text) {
        const items = params.text.split(/[,\n]/).map(t => t.trim()).filter(t => t);
        if (items.length > 0) {
          setOptions(items.map((text, idx) => ({
            id: `p-${idx}`,
            text,
            color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
          })));
        }
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || options.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    const anglePerSegment = (2 * Math.PI) / options.length;

    options.forEach((option, index) => {
      const startAngle = index * anglePerSegment - Math.PI / 2;
      const endAngle = startAngle + anglePerSegment;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = option.color;
      ctx.fill();

      // Draw border
      ctx.strokeStyle = isDark ? '#374151' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 2;

      const text = option.text.length > 15 ? option.text.substring(0, 15) + '...' : option.text;
      ctx.fillText(text, radius - 20, 5);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = isDark ? '#1F2937' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = isDark ? '#4B5563' : '#E5E7EB';
    ctx.lineWidth = 3;
    ctx.stroke();

  }, [options, isDark]);

  const playTickSound = useCallback(() => {
    if (!soundEnabled) return;
    // Create a simple tick sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
      // Audio not supported
    }
  }, [soundEnabled]);

  const spinWheel = useCallback(() => {
    if (isSpinning || options.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    // Calculate random rotation (multiple full spins + random position)
    const fullSpins = 5 + Math.floor(Math.random() * 5);
    const extraDegrees = Math.random() * 360;
    const totalRotation = fullSpins * 360 + extraDegrees;

    // Determine winner based on final rotation
    const normalizedRotation = (rotation + totalRotation) % 360;
    const segmentAngle = 360 / options.length;
    // The pointer is at the top (0 degrees), so we need to find which segment is there
    const winningIndex = Math.floor((360 - normalizedRotation + segmentAngle / 2) % 360 / segmentAngle) % options.length;

    setRotation(prev => prev + totalRotation);

    // Play tick sounds during spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      playTickSound();
      tickCount++;
      if (tickCount > 30) {
        clearInterval(tickInterval);
      }
    }, 100);

    // Announce winner after spin
    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const winningOption = options[winningIndex];
      setWinner(winningOption.text);

      // Add to history
      setHistory(prev => [{
        option: winningOption.text,
        timestamp: new Date().toISOString(),
      }, ...prev].slice(0, 20));

      // Play winner sound
      if (soundEnabled) {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = 523.25; // C5
          oscillator.type = 'sine';
          gainNode.gain.value = 0.2;

          oscillator.start();
          setTimeout(() => {
            oscillator.frequency.value = 659.25; // E5
          }, 100);
          setTimeout(() => {
            oscillator.frequency.value = 783.99; // G5
          }, 200);
          oscillator.stop(audioContext.currentTime + 0.4);
        } catch (e) {
          // Audio not supported
        }
      }
    }, spinDuration * 1000);
  }, [isSpinning, options, rotation, playTickSound, soundEnabled, spinDuration]);

  const addOption = useCallback(() => {
    if (newOptionText.trim() && options.length < 20) {
      setOptions(prev => [...prev, {
        id: `opt-${Date.now()}`,
        text: newOptionText.trim(),
        color: DEFAULT_COLORS[prev.length % DEFAULT_COLORS.length],
      }]);
      setNewOptionText('');
    }
  }, [newOptionText, options.length]);

  const removeOption = useCallback((id: string) => {
    setOptions(prev => prev.filter(o => o.id !== id));
  }, []);

  const updateOptionText = useCallback((id: string, text: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, text } : o));
  }, []);

  const updateOptionColor = useCallback((id: string, color: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, color } : o));
  }, []);

  const shuffleColors = useCallback(() => {
    const shuffledColors = [...DEFAULT_COLORS].sort(() => Math.random() - 0.5);
    setOptions(prev => prev.map((o, idx) => ({
      ...o,
      color: shuffledColors[idx % shuffledColors.length],
    })));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const exportResults = useCallback(() => {
    let text = 'Spin Wheel Results\n==================\n\n';
    history.forEach((result, idx) => {
      text += `${idx + 1}. ${result.option} (${new Date(result.timestamp).toLocaleString()})\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spin-wheel-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [history]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <RotateCw className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.spinWheel.spinTheWheel', 'Spin the Wheel')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.spinWheel.makeRandomDecisionsTheFun', 'Make random decisions the fun way')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
              title={soundEnabled ? t('tools.spinWheel.muteSounds', 'Mute sounds') : t('tools.spinWheel.enableSounds', 'Enable sounds')}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.spinWheel.optionsLoadedFromYourConversation', 'Options loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Settings Panel */}
        {showSettings && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.spinWheel.settings', 'Settings')}</h4>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Spin Duration: {spinDuration}s
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={spinDuration}
                  onChange={(e) => setSpinDuration(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <button
                onClick={shuffleColors}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Palette className="w-4 h-4" />
                {t('tools.spinWheel.shuffleColors', 'Shuffle Colors')}
              </button>
            </div>
          </div>
        )}

        {/* Wheel Container */}
        <div className="relative flex justify-center">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-purple-500 drop-shadow-lg" />
          </div>

          {/* Wheel */}
          <div
            className="relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? `transform ${spinDuration}s cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none',
            }}
          >
            <canvas
              ref={canvasRef}
              width={320}
              height={320}
              className="drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Winner Display */}
        {winner && !isSpinning && (
          <div className={`p-6 rounded-xl text-center ${
            isDark ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50 border border-purple-200'
          }`}>
            <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>{t('tools.spinWheel.theWheelHasSpoken', 'The wheel has spoken:')}</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{winner}</p>
          </div>
        )}

        {/* Spin Button */}
        <button
          onClick={spinWheel}
          disabled={isSpinning || options.length < 2}
          className={`w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl rounded-xl transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 ${
            isSpinning || options.length < 2 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <RotateCw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
          {isSpinning ? t('tools.spinWheel.spinning', 'Spinning...') : t('tools.spinWheel.spin', 'SPIN!')}
        </button>

        {/* Options Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Wheel Options ({options.length}/20)
            </label>
          </div>

          {/* Add Option */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newOptionText}
              onChange={(e) => setNewOptionText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addOption()}
              placeholder={t('tools.spinWheel.addAnOption', 'Add an option...')}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
            <button
              onClick={addOption}
              disabled={!newOptionText.trim() || options.length >= 20}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                newOptionText.trim() && options.length < 20
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Options List */}
          <div className={`max-h-60 overflow-y-auto space-y-2 ${isDark ? 'scrollbar-dark' : ''}`}>
            {options.map((option, idx) => (
              <div
                key={option.id}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                }`}
              >
                <input
                  type="color"
                  value={option.color}
                  onChange={(e) => updateOptionColor(option.id, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOptionText(option.id, e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                <button
                  onClick={() => removeOption(option.id)}
                  disabled={options.length <= 2}
                  className={`p-2 rounded-lg transition-colors ${
                    options.length <= 2
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:text-red-500'
                  } ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Spin History ({history.length})
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={exportResults}
                  className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={clearHistory}
                  className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t('tools.spinWheel.clear', 'Clear')}
                </button>
              </div>
            </div>
            <div className={`max-h-32 overflow-y-auto space-y-1 ${isDark ? 'scrollbar-dark' : ''}`}>
              {history.map((result, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                    isDark ? 'bg-gray-800' : 'bg-gray-50'
                  }`}
                >
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {result.option}
                  </span>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.spinWheel.tip', 'Tip:')}</strong> Add at least 2 options to spin the wheel. Click the color square to customize each option's color. The wheel uses a true random algorithm for fair results!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpinWheelTool;
