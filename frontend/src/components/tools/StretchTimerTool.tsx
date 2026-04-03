import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Timer, Activity, Play, Pause, SkipForward, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToJSON,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Types
interface Stretch {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  emoji: string;
  muscles: string[];
}

interface Routine {
  id: string;
  name: string;
  description: string;
  duration: number; // total minutes
  emoji: string;
  stretches: Stretch[];
}

type ViewMode = 'routines' | 'active' | 'custom';

// Export columns configuration
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Stretch Name', type: 'string' },
  { key: 'duration', header: 'Duration (seconds)', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'muscles', header: 'Target Muscles', type: 'string' },
];

// Pre-built stretch routines
const prebuiltRoutines: Routine[] = [
  {
    id: 'morning',
    name: 'Morning Wake-up',
    description: 'Gentle stretches to start your day with energy',
    duration: 5,
    emoji: '🌅',
    stretches: [
      {
        id: 'morning-1',
        name: 'Neck Rolls',
        description: 'Slowly roll your head in circles, first clockwise then counter-clockwise',
        duration: 30,
        emoji: '🔄',
        muscles: ['Neck', 'Upper Trapezius']
      },
      {
        id: 'morning-2',
        name: 'Shoulder Shrugs',
        description: 'Raise shoulders to ears, hold briefly, then release',
        duration: 30,
        emoji: '⬆️',
        muscles: ['Shoulders', 'Trapezius']
      },
      {
        id: 'morning-3',
        name: 'Cat-Cow Stretch',
        description: 'On hands and knees, alternate between arching and rounding your back',
        duration: 60,
        emoji: '🐱',
        muscles: ['Spine', 'Core', 'Chest']
      },
      {
        id: 'morning-4',
        name: 'Standing Side Stretch',
        description: 'Reach one arm overhead and lean to the opposite side',
        duration: 60,
        emoji: '🌊',
        muscles: ['Obliques', 'Lats', 'Intercostals']
      },
      {
        id: 'morning-5',
        name: 'Forward Fold',
        description: 'Bend forward from hips, let arms hang down, relax neck',
        duration: 60,
        emoji: '🙇',
        muscles: ['Hamstrings', 'Lower Back', 'Calves']
      },
      {
        id: 'morning-6',
        name: 'Gentle Twist',
        description: 'Seated or standing, rotate torso side to side',
        duration: 60,
        emoji: '🔃',
        muscles: ['Spine', 'Obliques', 'Lower Back']
      }
    ]
  },
  {
    id: 'desk',
    name: 'Desk Break',
    description: 'Quick stretches you can do at your desk',
    duration: 3,
    emoji: '💼',
    stretches: [
      {
        id: 'desk-1',
        name: 'Chin Tucks',
        description: 'Pull chin back to create a double chin, hold, then release',
        duration: 30,
        emoji: '😐',
        muscles: ['Neck', 'Deep Cervical Flexors']
      },
      {
        id: 'desk-2',
        name: 'Wrist Circles',
        description: 'Rotate wrists in circles, both directions',
        duration: 30,
        emoji: '🤲',
        muscles: ['Wrists', 'Forearms']
      },
      {
        id: 'desk-3',
        name: 'Seated Spinal Twist',
        description: 'While seated, twist torso to one side, hold, repeat other side',
        duration: 45,
        emoji: '🪑',
        muscles: ['Spine', 'Obliques']
      },
      {
        id: 'desk-4',
        name: 'Chest Opener',
        description: 'Clasp hands behind back, squeeze shoulder blades together',
        duration: 45,
        emoji: '🦅',
        muscles: ['Chest', 'Shoulders', 'Biceps']
      },
      {
        id: 'desk-5',
        name: 'Seated Figure Four',
        description: 'Cross ankle over knee, gently press down on raised knee',
        duration: 30,
        emoji: '4️⃣',
        muscles: ['Glutes', 'Hip Flexors', 'Piriformis']
      }
    ]
  },
  {
    id: 'pre-workout',
    name: 'Pre-Workout',
    description: 'Dynamic stretches to prepare your body for exercise',
    duration: 10,
    emoji: '🏃',
    stretches: [
      {
        id: 'pre-1',
        name: 'Arm Circles',
        description: 'Extend arms and make large circles, forward then backward',
        duration: 45,
        emoji: '⭕',
        muscles: ['Shoulders', 'Rotator Cuff']
      },
      {
        id: 'pre-2',
        name: 'Leg Swings',
        description: 'Hold onto something, swing one leg forward and back',
        duration: 60,
        emoji: '🦵',
        muscles: ['Hip Flexors', 'Hamstrings', 'Glutes']
      },
      {
        id: 'pre-3',
        name: 'Walking Lunges',
        description: 'Step forward into lunge position, alternate legs',
        duration: 60,
        emoji: '🚶',
        muscles: ['Quadriceps', 'Glutes', 'Hip Flexors']
      },
      {
        id: 'pre-4',
        name: 'High Knees',
        description: 'March in place, bringing knees up high',
        duration: 45,
        emoji: '🦶',
        muscles: ['Hip Flexors', 'Core', 'Quadriceps']
      },
      {
        id: 'pre-5',
        name: 'Torso Rotations',
        description: 'Feet planted, rotate upper body side to side',
        duration: 45,
        emoji: '🔄',
        muscles: ['Obliques', 'Spine', 'Core']
      },
      {
        id: 'pre-6',
        name: 'Hip Circles',
        description: 'Hands on hips, make large circles with hips',
        duration: 45,
        emoji: '💫',
        muscles: ['Hips', 'Lower Back', 'Core']
      },
      {
        id: 'pre-7',
        name: 'Ankle Circles',
        description: 'Rotate each ankle in circles, both directions',
        duration: 45,
        emoji: '🔘',
        muscles: ['Ankles', 'Calves']
      },
      {
        id: 'pre-8',
        name: 'Butt Kicks',
        description: 'Jog in place, kicking heels up toward glutes',
        duration: 45,
        emoji: '🏃‍♂️',
        muscles: ['Quadriceps', 'Hamstrings']
      },
      {
        id: 'pre-9',
        name: 'Arm Crossovers',
        description: 'Swing arms across body, alternating which arm is on top',
        duration: 45,
        emoji: '✖️',
        muscles: ['Chest', 'Shoulders', 'Upper Back']
      },
      {
        id: 'pre-10',
        name: 'Squat to Stand',
        description: 'From standing, fold down, grab toes, then straighten legs',
        duration: 60,
        emoji: '🏋️',
        muscles: ['Hamstrings', 'Calves', 'Lower Back']
      }
    ]
  },
  {
    id: 'post-workout',
    name: 'Post-Workout',
    description: 'Static stretches for recovery and flexibility',
    duration: 10,
    emoji: '🧘',
    stretches: [
      {
        id: 'post-1',
        name: 'Quad Stretch',
        description: 'Standing, pull one foot toward glutes, keep knees together',
        duration: 60,
        emoji: '🦿',
        muscles: ['Quadriceps', 'Hip Flexors']
      },
      {
        id: 'post-2',
        name: 'Hamstring Stretch',
        description: 'Seated or standing, reach toward toes with straight legs',
        duration: 60,
        emoji: '🙆',
        muscles: ['Hamstrings', 'Calves', 'Lower Back']
      },
      {
        id: 'post-3',
        name: 'Hip Flexor Stretch',
        description: 'Kneeling lunge position, push hips forward',
        duration: 60,
        emoji: '🧎',
        muscles: ['Hip Flexors', 'Quadriceps']
      },
      {
        id: 'post-4',
        name: 'Pigeon Pose',
        description: 'One leg bent in front, other extended behind, fold forward',
        duration: 60,
        emoji: '🐦',
        muscles: ['Glutes', 'Hip Flexors', 'Piriformis']
      },
      {
        id: 'post-5',
        name: 'Chest Stretch',
        description: 'Arm against wall or doorframe, turn body away',
        duration: 45,
        emoji: '💪',
        muscles: ['Chest', 'Front Deltoids']
      },
      {
        id: 'post-6',
        name: 'Tricep Stretch',
        description: 'Reach one arm overhead, bend elbow, use other hand to press',
        duration: 45,
        emoji: '💎',
        muscles: ['Triceps', 'Shoulders']
      },
      {
        id: 'post-7',
        name: "Child's Pose",
        description: 'Kneel, sit back on heels, reach arms forward on floor',
        duration: 60,
        emoji: '🙏',
        muscles: ['Lower Back', 'Lats', 'Hips']
      },
      {
        id: 'post-8',
        name: 'Figure Four Stretch',
        description: 'Lying down, cross ankle over knee, pull thigh toward chest',
        duration: 60,
        emoji: '4️⃣',
        muscles: ['Glutes', 'Piriformis', 'Hip Rotators']
      },
      {
        id: 'post-9',
        name: 'Lying Spinal Twist',
        description: 'Lying down, bring one knee across body, look opposite direction',
        duration: 60,
        emoji: '🔃',
        muscles: ['Spine', 'Lower Back', 'Glutes']
      },
      {
        id: 'post-10',
        name: 'Corpse Pose',
        description: 'Lie flat on back, arms at sides, breathe deeply and relax',
        duration: 60,
        emoji: '😌',
        muscles: ['Full Body Relaxation']
      }
    ]
  },
  {
    id: 'bedtime',
    name: 'Before Bed',
    description: 'Relaxing stretches to help you unwind and sleep better',
    duration: 5,
    emoji: '🌙',
    stretches: [
      {
        id: 'bed-1',
        name: 'Neck Release',
        description: 'Gently tilt head to each side, holding each position',
        duration: 45,
        emoji: '😊',
        muscles: ['Neck', 'Upper Trapezius']
      },
      {
        id: 'bed-2',
        name: 'Seated Forward Fold',
        description: 'Sit with legs extended, fold forward from hips',
        duration: 60,
        emoji: '🙇',
        muscles: ['Hamstrings', 'Lower Back', 'Spine']
      },
      {
        id: 'bed-3',
        name: 'Butterfly Stretch',
        description: 'Sit with soles of feet together, gently press knees down',
        duration: 60,
        emoji: '🦋',
        muscles: ['Inner Thighs', 'Hips', 'Groin']
      },
      {
        id: 'bed-4',
        name: 'Supine Twist',
        description: 'Lying on back, bring knees to chest and let them fall to one side',
        duration: 60,
        emoji: '🔄',
        muscles: ['Spine', 'Lower Back', 'Obliques']
      },
      {
        id: 'bed-5',
        name: 'Legs Up the Wall',
        description: 'Lie on back with legs extended up against a wall',
        duration: 75,
        emoji: '🧘‍♀️',
        muscles: ['Hamstrings', 'Lower Back', 'Circulation']
      }
    ]
  }
];

// Custom stretch template
const customStretchTemplate: Stretch = {
  id: '',
  name: '',
  description: '',
  duration: 30,
  emoji: '💪',
  muscles: []
};

interface StretchTimerToolProps {
  uiConfig?: UIConfig;
}

export const StretchTimerTool = ({ uiConfig }: StretchTimerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('routines');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [currentStretchIndex, setCurrentStretchIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedStretches, setCompletedStretches] = useState<string[]>([]);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [customRoutine, setCustomRoutine] = useState<Routine>({
    id: 'custom',
    name: 'My Custom Routine',
    description: 'Your personalized stretch routine',
    duration: 0,
    emoji: '✨',
    stretches: []
  });
  const [newStretch, setNewStretch] = useState<Stretch>({ ...customStretchTemplate, id: crypto.randomUUID() });
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        routineId?: string;
      };
      if (params.routineId) {
        const routine = prebuiltRoutines.find(r => r.id === params.routineId);
        if (routine) {
          setSelectedRoutine(routine);
          setViewMode('active');
        }
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.viewMode) setViewMode(params.viewMode);
      if (params.selectedRoutine) setSelectedRoutine(params.selectedRoutine);
      if (params.customRoutine) setCustomRoutine(params.customRoutine);
      if (params.completedStretches) setCompletedStretches(params.completedStretches);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSx+zPPTgjMGHm7A7+OZSA0PVKno77BdGAg+l9z0xnMpBSh5yPDajzwIDly47+mjUBELTKXk8LdmHwU2jtLzzHwvByd3xvDglEQKElyx6OypVxMLTKjm871rJAU5kdLy0H0xByJ0w/DglkUKE2Cy6vGpVxINS6ro9L1sJQU5ktPy0n4yByN1xPDhmEcLEl+y6/KqWhQMTqzo9L1tJgU6ktT00H4xByN0w/DglkUKEV6x6O6oVRMNTavm9L1sJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/Dg';

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused && remainingSeconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleStretchComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, remainingSeconds]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleStretchComplete = () => {
    playSound();

    if (selectedRoutine) {
      const currentStretch = selectedRoutine.stretches[currentStretchIndex];
      setCompletedStretches((prev) => [...prev, currentStretch.id]);

      // Auto-advance to next stretch
      if (currentStretchIndex < selectedRoutine.stretches.length - 1) {
        const nextIndex = currentStretchIndex + 1;
        setCurrentStretchIndex(nextIndex);
        setRemainingSeconds(selectedRoutine.stretches[nextIndex].duration);
      } else {
        // Routine complete
        setIsRunning(false);
        setViewMode('routines');

        // Call onSaveCallback if editing from gallery
        const params = uiConfig?.params as Record<string, any>;
        if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
          params.onSaveCallback();
        }
      }
    }
  };

  const startRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setCurrentStretchIndex(0);
    setRemainingSeconds(routine.stretches[0].duration);
    setCompletedStretches([]);
    setIsRunning(true);
    setIsPaused(false);
    setViewMode('active');
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const skipStretch = () => {
    if (selectedRoutine && currentStretchIndex < selectedRoutine.stretches.length - 1) {
      const nextIndex = currentStretchIndex + 1;
      setCurrentStretchIndex(nextIndex);
      setRemainingSeconds(selectedRoutine.stretches[nextIndex].duration);
    } else {
      // End routine
      setIsRunning(false);
      setViewMode('routines');
    }
  };

  const resetRoutine = () => {
    if (selectedRoutine) {
      setCurrentStretchIndex(0);
      setRemainingSeconds(selectedRoutine.stretches[0].duration);
      setCompletedStretches([]);
      setIsRunning(false);
      setIsPaused(false);
    }
  };

  const exitRoutine = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSelectedRoutine(null);
    setViewMode('routines');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (!selectedRoutine || selectedRoutine.stretches.length === 0) return 0;
    const currentStretch = selectedRoutine.stretches[currentStretchIndex];
    return ((currentStretch.duration - remainingSeconds) / currentStretch.duration) * 100;
  };

  const getTotalProgress = (): number => {
    if (!selectedRoutine) return 0;
    return ((completedStretches.length + (getProgress() / 100)) / selectedRoutine.stretches.length) * 100;
  };

  // Custom routine builder functions
  const addCustomStretch = () => {
    if (newStretch.name.trim() === '') return;

    const stretchToAdd = {
      ...newStretch,
      id: crypto.randomUUID(),
      muscles: newStretch.muscles.length > 0 ? newStretch.muscles : ['General']
    };

    setCustomRoutine((prev) => ({
      ...prev,
      stretches: [...prev.stretches, stretchToAdd],
      duration: Math.ceil((prev.stretches.reduce((acc, s) => acc + s.duration, 0) + stretchToAdd.duration) / 60)
    }));

    setNewStretch({ ...customStretchTemplate, id: crypto.randomUUID() });
  };

  const removeCustomStretch = (stretchId: string) => {
    setCustomRoutine((prev) => {
      const newStretches = prev.stretches.filter((s) => s.id !== stretchId);
      return {
        ...prev,
        stretches: newStretches,
        duration: Math.ceil(newStretches.reduce((acc, s) => acc + s.duration, 0) / 60)
      };
    });
  };

  const toggleRoutineExpand = (routineId: string) => {
    setExpandedRoutine(expandedRoutine === routineId ? null : routineId);
  };

  // Render routine selection view
  const renderRoutineSelection = () => (
    <div className="space-y-6">
      {/* Pre-built Routines */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.stretchTimer.preBuiltRoutines', 'Pre-built Routines')}
          </h3>
          {prebuiltRoutines.length > 0 && (
            <ExportDropdown
              onExportCSV={() => exportToCSV(prebuiltRoutines.flatMap(routine =>
                routine.stretches.map(stretch => ({
                  routineName: routine.name,
                  name: stretch.name,
                  duration: stretch.duration.toString(),
                  description: stretch.description,
                  muscles: stretch.muscles.join(', '),
                }))
              ), COLUMNS, { filename: 'stretch-routines' })}
              onExportJSON={() => exportToJSON(prebuiltRoutines.flatMap(routine =>
                routine.stretches.map(stretch => ({
                  routineName: routine.name,
                  name: stretch.name,
                  duration: stretch.duration,
                  description: stretch.description,
                  muscles: stretch.muscles,
                }))
              ), { filename: 'stretch-routines' })}
              showImport={false}
              theme={theme}
            />
          )}
        </div>
        <div className="space-y-3">
          {prebuiltRoutines.map((routine) => (
            <div
              key={routine.id}
              className={`rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{routine.emoji}</span>
                    <div>
                      <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {routine.name}
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {routine.description}
                      </p>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {routine.duration} min | {routine.stretches.length} stretches
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRoutineExpand(routine.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-gray-600 text-gray-400'
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {expandedRoutine === routine.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => startRoutine(routine)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
                    >
                      <Play className="w-4 h-4" />
                      {t('tools.stretchTimer.start', 'Start')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded stretch list */}
              {expandedRoutine === routine.id && (
                <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} p-4`}>
                  <div className="space-y-2">
                    {routine.stretches.map((stretch, index) => (
                      <div
                        key={stretch.id}
                        className={`flex items-center gap-3 p-2 rounded ${
                          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        }`}
                      >
                        <span className={`text-sm font-medium w-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {index + 1}
                        </span>
                        <span className="text-xl">{stretch.emoji}</span>
                        <div className="flex-1">
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {stretch.name}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {stretch.muscles.join(', ')}
                          </p>
                        </div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatTime(stretch.duration)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Routine Builder Button */}
      <button
        onClick={() => setShowCustomBuilder(!showCustomBuilder)}
        className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
          theme === 'dark'
            ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <Settings className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.stretchTimer.customRoutineBuilder', 'Custom Routine Builder')}
          </span>
        </div>
        {showCustomBuilder ? (
          <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
        ) : (
          <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
        )}
      </button>

      {/* Custom Routine Builder */}
      {showCustomBuilder && (
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.stretchTimer.buildYourCustomRoutine', 'Build Your Custom Routine')}
          </h3>

          {/* Add new stretch form */}
          <div className="space-y-3 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.stretchTimer.stretchName', 'Stretch Name')}
              </label>
              <input
                type="text"
                value={newStretch.name}
                onChange={(e) => setNewStretch({ ...newStretch, name: e.target.value })}
                placeholder={t('tools.stretchTimer.eGHamstringStretch', 'e.g., Hamstring Stretch')}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.stretchTimer.description', 'Description')}
              </label>
              <input
                type="text"
                value={newStretch.description}
                onChange={(e) => setNewStretch({ ...newStretch, description: e.target.value })}
                placeholder={t('tools.stretchTimer.briefInstructionsForTheStretch', 'Brief instructions for the stretch')}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.stretchTimer.durationSeconds', 'Duration (seconds)')}
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={newStretch.duration}
                  onChange={(e) => setNewStretch({ ...newStretch, duration: parseInt(e.target.value) || 30 })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="flex-1">
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.stretchTimer.targetMuscles', 'Target Muscles')}
                </label>
                <input
                  type="text"
                  value={newStretch.muscles.join(', ')}
                  onChange={(e) => setNewStretch({ ...newStretch, muscles: e.target.value.split(',').map(m => m.trim()).filter(m => m) })}
                  placeholder={t('tools.stretchTimer.eGHamstringsCalves', 'e.g., Hamstrings, Calves')}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
            <button
              onClick={addCustomStretch}
              disabled={!newStretch.name.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                newStretch.name.trim()
                  ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white'
                  : theme === 'dark'
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.stretchTimer.addStretch', 'Add Stretch')}
            </button>
          </div>

          {/* Custom routine stretches list */}
          {customRoutine.stretches.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Your Stretches ({customRoutine.stretches.length})
              </h4>
              {customRoutine.stretches.map((stretch, index) => (
                <div
                  key={stretch.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <span className={`text-sm font-medium w-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stretch.name}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatTime(stretch.duration)} | {stretch.muscles.join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => removeCustomStretch(stretch.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700 text-red-400'
                        : 'hover:bg-gray-100 text-red-500'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Start custom routine button */}
          {customRoutine.stretches.length > 0 && (
            <button
              onClick={() => startRoutine(customRoutine)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
            >
              <Play className="w-5 h-5" />
              Start Custom Routine ({customRoutine.duration} min)
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Render active routine view
  const renderActiveRoutine = () => {
    if (!selectedRoutine) return null;

    const currentStretch = selectedRoutine.stretches[currentStretchIndex];

    return (
      <div className="space-y-6">
        {/* Overall progress */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.stretchTimer.overallProgress', 'Overall Progress')}
            </span>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {completedStretches.length + 1} / {selectedRoutine.stretches.length}
            </span>
          </div>
          <Progress value={getTotalProgress()} className="h-2" />
        </div>

        {/* Current stretch card */}
        <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Stretch {currentStretchIndex + 1} of {selectedRoutine.stretches.length}
              </span>
              <span className="text-5xl">{currentStretch.emoji}</span>
            </div>
            <CardTitle className={`text-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {currentStretch.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentStretch.description}
            </p>

            {/* Muscles targeted */}
            <div className="flex flex-wrap gap-2 mb-6">
              {currentStretch.muscles.map((muscle) => (
                <span
                  key={muscle}
                  className={`px-3 py-1 text-xs rounded-full ${
                    theme === 'dark'
                      ? t('tools.stretchTimer.bg0d948820Text5eead4', 'bg-[#0D9488]/20 text-[#5EEAD4]') : t('tools.stretchTimer.bg0d948810Text0d9488', 'bg-[#0D9488]/10 text-[#0D9488]')
                  }`}
                >
                  {muscle}
                </span>
              ))}
            </div>

            {/* Timer display */}
            <div className={`text-center py-8 rounded-lg relative overflow-hidden ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              {/* Progress bar at top */}
              <div
                className="absolute top-0 left-0 h-1 bg-[#0D9488] transition-all duration-1000"
                style={{ width: `${getProgress()}%` }}
              />

              <div className={`text-7xl font-mono font-bold mb-2 ${
                remainingSeconds <= 5
                  ? 'text-[#0D9488] animate-pulse'
                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {formatTime(remainingSeconds)}
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {isPaused ? t('tools.stretchTimer.paused', 'Paused') : 'remaining'}
              </p>
            </div>

            {/* Control buttons */}
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={togglePause}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                  isPaused
                    ? t('tools.stretchTimer.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white') : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-5 h-5" />
                    {t('tools.stretchTimer.resume', 'Resume')}
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" />
                    {t('tools.stretchTimer.pause', 'Pause')}
                  </>
                )}
              </button>

              <button
                onClick={skipStretch}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <SkipForward className="w-5 h-5" />
                {t('tools.stretchTimer.skip', 'Skip')}
              </button>

              <button
                onClick={resetRoutine}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <RotateCcw className="w-5 h-5" />
                {t('tools.stretchTimer.restart', 'Restart')}
              </button>
            </div>

            {/* Exit button */}
            <button
              onClick={exitRoutine}
              className={`w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('tools.stretchTimer.exitRoutine', 'Exit Routine')}
            </button>
          </CardContent>
        </Card>

        {/* Up next preview */}
        {currentStretchIndex < selectedRoutine.stretches.length - 1 && (
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.stretchTimer.upNext', 'Up Next')}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedRoutine.stretches[currentStretchIndex + 1].emoji}</span>
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRoutine.stretches[currentStretchIndex + 1].name}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatTime(selectedRoutine.stretches[currentStretchIndex + 1].duration)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#0D9488] rounded-lg">
          {viewMode === 'active' ? (
            <Activity className="w-6 h-6 text-white" />
          ) : (
            <Timer className="w-6 h-6 text-white" />
          )}
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.stretchTimer.stretchTimer', 'Stretch Timer')}
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {viewMode === 'active' && selectedRoutine
              ? selectedRoutine.name
              : 'Guided stretching routines with timers'}
          </p>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'active' ? renderActiveRoutine() : renderRoutineSelection()}
    </div>
  );
};

export default StretchTimerTool;
