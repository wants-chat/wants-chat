import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, Wind, Heart, Volume2, VolumeX, Clock, Trophy, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'holdAfterExhale' | 'idle';

interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  phases: {
    inhale: number;
    hold: number;
    exhale: number;
    holdAfterExhale: number;
  };
  color: string;
}

interface SessionHistory {
  id: string;
  date: string;
  pattern: string;
  duration: number;
  breaths: number;
}

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: '4-7-8',
    name: '4-7-8 Relaxation',
    description: 'A calming technique developed by Dr. Andrew Weil for relaxation and sleep.',
    benefits: [
      'Reduces anxiety and stress',
      'Helps fall asleep faster',
      'Manages cravings and anger',
      'Lowers heart rate and blood pressure',
    ],
    phases: { inhale: 4, hold: 7, exhale: 8, holdAfterExhale: 0 },
    color: '#6366f1', // Indigo
  },
  {
    id: 'box',
    name: 'Box Breathing (4-4-4-4)',
    description: 'Used by Navy SEALs for focus and stress relief in high-pressure situations.',
    benefits: [
      'Improves focus and concentration',
      'Reduces stress response',
      'Regulates autonomic nervous system',
      'Enhances performance under pressure',
    ],
    phases: { inhale: 4, hold: 4, exhale: 4, holdAfterExhale: 4 },
    color: '#0D9488', // Teal
  },
  {
    id: 'wim-hof',
    name: 'Wim Hof Style',
    description: 'Power breathing for energy and immune system boost. Quick inhales, relaxed exhales.',
    benefits: [
      'Increases energy and alertness',
      'Boosts immune response',
      'Reduces inflammation',
      'Improves cold tolerance',
    ],
    phases: { inhale: 2, hold: 0, exhale: 2, holdAfterExhale: 0 },
    color: '#ef4444', // Red
  },
  {
    id: 'deep',
    name: 'Simple Deep Breathing',
    description: 'Classic deep breathing for beginners and general relaxation.',
    benefits: [
      'Easy to learn and practice',
      'Calms the nervous system',
      'Increases oxygen flow',
      'Great for daily mindfulness',
    ],
    phases: { inhale: 4, hold: 2, exhale: 6, holdAfterExhale: 0 },
    color: '#10b981', // Emerald
  },
];

const SESSION_DURATIONS = [
  { value: 60, label: '1 minute' },
  { value: 120, label: '2 minutes' },
  { value: 180, label: '3 minutes' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 900, label: '15 minutes' },
];

const COLUMNS: ColumnConfig[] = [
  {
    key: 'date',
    header: 'Date',
    type: 'date',
    format: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    key: 'pattern',
    header: 'Breathing Pattern',
    type: 'string',
  },
  {
    key: 'duration',
    header: 'Duration (seconds)',
    type: 'number',
  },
  {
    key: 'breaths',
    header: 'Number of Breaths',
    type: 'number',
  },
];

interface BreathingExerciseToolProps {
  uiConfig?: UIConfig;
}

export const BreathingExerciseTool = ({ uiConfig }: BreathingExerciseToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[1]); // Box breathing default
  const [sessionDuration, setSessionDuration] = useState(180); // 3 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('idle');
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(0);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showBenefits, setShowBenefits] = useState(false);
  const [animationScale, setAnimationScale] = useState(1);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Use useToolData hook for backend persistence with localStorage fallback
  const {
    data: sessionHistory,
    setData: setSessionHistory,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    print,
    copyToClipboard,
  } = useToolData<SessionHistory>(
    'breathing-exercise-history',
    [],
    COLUMNS,
    { autoSave: true }
  );

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        patternId?: string;
        sessionDuration?: number;
      };
      if (params.patternId) {
        const pattern = BREATHING_PATTERNS.find(p => p.id === params.patternId);
        if (pattern) setSelectedPattern(pattern);
      }
      if (params.sessionDuration) setSessionDuration(params.sessionDuration);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.patternId) {
        const pattern = BREATHING_PATTERNS.find(p => p.id === params.patternId);
        if (pattern) setSelectedPattern(pattern);
      }
      if (params.sessionDuration) setSessionDuration(params.sessionDuration);
      if (params.audioEnabled !== undefined) setAudioEnabled(params.audioEnabled);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Save session using the useToolData hook
  const saveSession = useCallback((pattern: string, duration: number, breaths: number) => {
    const newSession: SessionHistory = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      pattern,
      duration,
      breaths,
    };
    // Add new session to the beginning and keep last 30 sessions
    setSessionHistory(prev => [newSession, ...prev].slice(0, 30));

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  }, [setSessionHistory, uiConfig?.params]);

  // Calculate current streak
  const calculateStreak = useCallback(() => {
    if (sessionHistory.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const hasSession = sessionHistory.some((session) => {
        const sessionDate = new Date(session.date).toISOString().split('T')[0];
        return sessionDate === dateStr;
      });

      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }, [sessionHistory]);

  // Play audio cue
  const playChime = useCallback((frequency: number = 440, duration: number = 200) => {
    if (!audioEnabled) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch {
      // Audio not supported, continue silently
    }
  }, [audioEnabled]);

  // Get next phase
  const getNextPhase = useCallback((current: BreathingPhase): BreathingPhase => {
    const phases = selectedPattern.phases;
    switch (current) {
      case 'inhale':
        return phases.hold > 0 ? 'hold' : (phases.exhale > 0 ? 'exhale' : 'inhale');
      case 'hold':
        return phases.exhale > 0 ? 'exhale' : 'inhale';
      case 'exhale':
        return phases.holdAfterExhale > 0 ? 'holdAfterExhale' : 'inhale';
      case 'holdAfterExhale':
        return 'inhale';
      default:
        return 'inhale';
    }
  }, [selectedPattern]);

  // Get phase duration
  const getPhaseDuration = useCallback((phase: BreathingPhase): number => {
    switch (phase) {
      case 'inhale':
        return selectedPattern.phases.inhale;
      case 'hold':
        return selectedPattern.phases.hold;
      case 'exhale':
        return selectedPattern.phases.exhale;
      case 'holdAfterExhale':
        return selectedPattern.phases.holdAfterExhale;
      default:
        return 0;
    }
  }, [selectedPattern]);

  // Main timer effect
  useEffect(() => {
    if (isRunning && !isPaused && totalTimeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setPhaseTimeRemaining((prev) => {
          if (prev <= 1) {
            // Phase complete
            const nextPhase = getNextPhase(currentPhase);
            const nextDuration = getPhaseDuration(nextPhase);

            if (nextPhase === 'inhale' && currentPhase !== 'idle') {
              setBreathCount((b) => b + 1);
            }

            // Play chime on phase transition
            if (nextPhase === 'inhale') {
              playChime(523, 150); // C5 for inhale
            } else if (nextPhase === 'exhale') {
              playChime(392, 150); // G4 for exhale
            } else {
              playChime(440, 100); // A4 for hold
            }

            setCurrentPhase(nextPhase);
            return nextDuration;
          }
          return prev - 1;
        });

        setTotalTimeRemaining((prev) => {
          if (prev <= 1) {
            // Session complete
            setIsRunning(false);
            setCurrentPhase('idle');
            playChime(659, 300); // E5 completion sound
            saveSession(selectedPattern.name, sessionDuration, breathCount + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, totalTimeRemaining, currentPhase, getNextPhase, getPhaseDuration, playChime, saveSession, selectedPattern, sessionDuration, breathCount]);

  // Animation effect
  useEffect(() => {
    if (!isRunning || isPaused) {
      setAnimationScale(1);
      return;
    }

    const phaseDuration = getPhaseDuration(currentPhase);
    if (phaseDuration === 0) return;

    const progress = 1 - phaseTimeRemaining / phaseDuration;

    if (currentPhase === 'inhale') {
      setAnimationScale(1 + progress * 0.5); // Grow from 1 to 1.5
    } else if (currentPhase === 'exhale') {
      setAnimationScale(1.5 - progress * 0.5); // Shrink from 1.5 to 1
    } else {
      // Hold phases - maintain current size
      setAnimationScale(currentPhase === 'hold' ? 1.5 : 1);
    }
  }, [isRunning, isPaused, currentPhase, phaseTimeRemaining, getPhaseDuration]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setTotalTimeRemaining(sessionDuration);
    setBreathCount(0);
    setCurrentPhase('inhale');
    setPhaseTimeRemaining(selectedPattern.phases.inhale);
    playChime(523, 150);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentPhase('idle');
    setPhaseTimeRemaining(0);
    setTotalTimeRemaining(0);
    setBreathCount(0);
    setAnimationScale(1);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Export handlers using hook methods
  const handleExportCSV = () => {
    exportCSV({
      filename: 'breathing-exercise-sessions',
    });
  };

  const handleExportExcel = () => {
    exportExcel({
      filename: 'breathing-exercise-sessions',
    });
  };

  const handleExportJSON = () => {
    exportJSON({
      filename: 'breathing-exercise-sessions',
    });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'breathing-exercise-sessions',
      title: 'Breathing Exercise Sessions Report',
      subtitle: `Total Sessions: ${sessionHistory.length}`,
    });
  };

  const handlePrint = () => {
    print('Breathing Exercise Sessions');
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard('tab');
  };

  const getPhaseLabel = (phase: BreathingPhase): string => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'holdAfterExhale':
        return 'Hold';
      default:
        return 'Ready';
    }
  };

  const getPhaseColor = (phase: BreathingPhase): string => {
    switch (phase) {
      case 'inhale':
        return '#10b981'; // Green
      case 'hold':
        return '#f59e0b'; // Amber
      case 'exhale':
        return '#3b82f6'; // Blue
      case 'holdAfterExhale':
        return '#f59e0b'; // Amber
      default:
        return selectedPattern.color;
    }
  };

  const streak = calculateStreak();
  const todaySessions = sessionHistory.filter((s) => {
    const today = new Date().toISOString().split('T')[0];
    return s.date.split('T')[0] === today;
  }).length;

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.breathingExercise.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: selectedPattern.color }}>
            <Wind className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.breathingExercise.breathingExercise', 'Breathing Exercise')}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.breathingExercise.guidedBreathingForRelaxationAnd', 'Guided breathing for relaxation and focus')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Sync Status */}
          <WidgetEmbedButton toolSlug="breathing-exercise" toolName="Breathing Exercise" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme}
            size="sm"
          />
          {/* Export Dropdown */}
          {sessionHistory.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              theme={theme}
            />
          )}
          {/* Streak Badge */}
          {streak > 0 && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">{streak} day streak</span>
            </div>
          )}
          {/* Audio Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
            title={audioEnabled ? t('tools.breathingExercise.muteAudioCues', 'Mute audio cues') : t('tools.breathingExercise.enableAudioCues', 'Enable audio cues')}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-4">
          {/* Pattern Selector */}
          <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.breathingExercise.breathingPattern', 'Breathing Pattern')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Select
                value={selectedPattern.id}
                onValueChange={(value) => {
                  const pattern = BREATHING_PATTERNS.find((p) => p.id === value);
                  if (pattern && !isRunning) {
                    setSelectedPattern(pattern);
                  }
                }}
              >
                <SelectTrigger className={`w-full ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                  <SelectValue placeholder={t('tools.breathingExercise.selectPattern', 'Select pattern')} />
                </SelectTrigger>
                <SelectContent>
                  {BREATHING_PATTERNS.map((pattern) => (
                    <SelectItem key={pattern.id} value={pattern.id}>
                      {pattern.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {selectedPattern.description}
              </p>
            </CardContent>
          </Card>

          {/* Duration Selector */}
          <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                <Clock className="w-4 h-4" />
                {t('tools.breathingExercise.sessionDuration', 'Session Duration')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Select
                value={sessionDuration.toString()}
                onValueChange={(value) => {
                  if (!isRunning) {
                    setSessionDuration(parseInt(value));
                  }
                }}
              >
                <SelectTrigger className={`w-full ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                  <SelectValue placeholder={t('tools.breathingExercise.selectDuration', 'Select duration')} />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value.toString()}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Pattern Info */}
          <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.breathingExercise.patternDetails', 'Pattern Details')}
                </CardTitle>
                <button
                  onClick={() => setShowBenefits(!showBenefits)}
                  className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded text-xs font-medium ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                  Inhale: {selectedPattern.phases.inhale}s
                </span>
                {selectedPattern.phases.hold > 0 && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${theme === 'dark' ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                    Hold: {selectedPattern.phases.hold}s
                  </span>
                )}
                <span className={`px-2 py-1 rounded text-xs font-medium ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                  Exhale: {selectedPattern.phases.exhale}s
                </span>
                {selectedPattern.phases.holdAfterExhale > 0 && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${theme === 'dark' ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                    Hold: {selectedPattern.phases.holdAfterExhale}s
                  </span>
                )}
              </div>

              {showBenefits && (
                <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                  <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('tools.breathingExercise.benefits', 'Benefits:')}
                  </p>
                  <ul className="space-y-1">
                    {selectedPattern.benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className={`text-xs flex items-start gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        <Heart className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: selectedPattern.color }} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Animation & Timer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Animation Circle */}
          <div
            className={`relative flex items-center justify-center py-16 rounded-2xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
          >
            {/* Background pulse rings */}
            {isRunning && !isPaused && (
              <>
                <div
                  className="absolute rounded-full opacity-20 animate-ping"
                  style={{
                    width: '220px',
                    height: '220px',
                    backgroundColor: getPhaseColor(currentPhase),
                    animationDuration: '2s',
                  }}
                />
                <div
                  className="absolute rounded-full opacity-10"
                  style={{
                    width: '280px',
                    height: '280px',
                    backgroundColor: getPhaseColor(currentPhase),
                  }}
                />
              </>
            )}

            {/* Main breathing circle */}
            <div
              className="relative flex items-center justify-center rounded-full transition-all duration-1000 ease-in-out"
              style={{
                width: `${180 * animationScale}px`,
                height: `${180 * animationScale}px`,
                backgroundColor: getPhaseColor(currentPhase),
                boxShadow: isRunning ? `0 0 60px ${getPhaseColor(currentPhase)}40` : 'none',
              }}
            >
              <div className="text-center text-white">
                <div className="text-3xl font-bold mb-1">
                  {isRunning ? phaseTimeRemaining : '--'}
                </div>
                <div className="text-sm font-medium opacity-90">
                  {getPhaseLabel(currentPhase)}
                </div>
              </div>
            </div>

            {/* Session Timer */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="text-2xl font-mono font-bold">
                  {formatTime(totalTimeRemaining)}
                </div>
                <div className="text-xs">remaining</div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`text-center p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {breathCount}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.breathingExercise.breaths', 'Breaths')}
              </div>
            </div>
            <div className={`text-center p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {todaySessions}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.breathingExercise.todaySSessions', 'Today\'s Sessions')}
              </div>
            </div>
            <div className={`text-center p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {sessionHistory.length}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.breathingExercise.totalSessions', 'Total Sessions')}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-8 py-4 rounded-xl transition-colors font-medium text-white text-lg"
                style={{ backgroundColor: selectedPattern.color }}
              >
                <Play className="w-6 h-6" />
                {t('tools.breathingExercise.startSession', 'Start Session')}
              </button>
            ) : (
              <>
                <button
                  onClick={handlePause}
                  className={`flex items-center gap-2 px-6 py-4 rounded-xl transition-colors font-medium text-white ${isPaused ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'}`}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5" />
                      {t('tools.breathingExercise.resume', 'Resume')}
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5" />
                      {t('tools.breathingExercise.pause', 'Pause')}
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className={`flex items-center gap-2 px-6 py-4 rounded-xl transition-colors font-medium ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  <RotateCcw className="w-5 h-5" />
                  {t('tools.breathingExercise.stop', 'Stop')}
                </button>
              </>
            )}
          </div>

          {/* Recent Sessions */}
          {sessionHistory.length > 0 && (
            <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.breathingExercise.recentSessions', 'Recent Sessions')}
                </CardTitle>
                <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  {t('tools.breathingExercise.yourLast5BreathingSessions', 'Your last 5 breathing sessions')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {sessionHistory.slice(0, 5).map((session, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
                    >
                      <div>
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {session.pattern}
                        </span>
                        <span className={`text-xs ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTime(session.duration)} | {session.breaths} breaths
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreathingExerciseTool;
