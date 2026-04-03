import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Timer, ArrowUp, Check, Clock, Eye, Activity, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Progress } from '../ui/progress';
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

interface PostureCheckItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  icon: React.ReactNode;
}

interface StretchingExercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  bodyPart: string;
}

interface PostureCheckIn {
  timestamp: Date;
  score: number;
  itemsChecked: string[];
}

type ReminderType = 'eye' | 'stand' | 'posture';

interface ReminderSettings {
  eyeBreak: number; // 20-20-20 rule interval in minutes
  standUp: number; // Stand up reminder interval in minutes
  postureCheck: number; // Posture check reminder in minutes
}

interface PostureCheckerToolProps {
  uiConfig?: UIConfig;
}

// Export column configuration for posture check-ins data
const COLUMNS: ColumnConfig[] = [
  { key: 'timestamp', header: 'Timestamp', type: 'date' },
  { key: 'score', header: 'Posture Score (%)', type: 'number' },
  { key: 'itemsCheckedCount', header: 'Items Checked', type: 'number' },
  { key: 'itemsCheckedList', header: 'Items', type: 'string' },
];

export const PostureCheckerTool = ({ uiConfig }: PostureCheckerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Posture checklist state
  const [postureItems, setPostureItems] = useState<PostureCheckItem[]>([
    {
      id: 'screen-height',
      label: 'Screen at Eye Level',
      description: 'Top of monitor should be at or slightly below eye level',
      checked: false,
      icon: <Eye className="w-5 h-5" />,
    },
    {
      id: 'chair-height',
      label: 'Chair Height Adjusted',
      description: 'Feet flat on floor, thighs parallel to ground',
      checked: false,
      icon: <ArrowUp className="w-5 h-5" />,
    },
    {
      id: 'arm-position',
      label: 'Arms at 90 Degrees',
      description: 'Elbows at desk height, shoulders relaxed',
      checked: false,
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'feet-placement',
      label: 'Feet Flat on Floor',
      description: 'Use footrest if needed, no crossing legs',
      checked: false,
      icon: <Activity className="w-5 h-5" />,
    },
    {
      id: 'back-support',
      label: 'Lower Back Supported',
      description: 'Lumbar support touching lower back, spine neutral',
      checked: false,
      icon: <ArrowUp className="w-5 h-5" />,
    },
  ]);

  // Timer states
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    eyeBreak: 20, // 20-20-20 rule
    standUp: 30,
    postureCheck: 45,
  });

  const [eyeBreakTimer, setEyeBreakTimer] = useState(reminderSettings.eyeBreak * 60);
  const [standUpTimer, setStandUpTimer] = useState(reminderSettings.standUp * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeReminder, setActiveReminder] = useState<ReminderType | null>(null);

  // Tracking states
  const [checkIns, setCheckIns] = useState<PostureCheckIn[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [totalSittingTime, setTotalSittingTime] = useState(0);

  const [activeTab, setActiveTab] = useState<'checklist' | 'reminders' | 'stretches' | 'stats'>('checklist');

  const timerRef = useRef<number | null>(null);
  const sittingTimerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stretchingExercises: StretchingExercise[] = [
    {
      id: 'neck-rolls',
      name: 'Neck Rolls',
      description: 'Slowly roll your head in a circle, 5 times each direction. Keep shoulders relaxed.',
      duration: '30 seconds',
      bodyPart: 'Neck',
    },
    {
      id: 'shoulder-shrugs',
      name: 'Shoulder Shrugs',
      description: 'Raise shoulders to ears, hold for 5 seconds, then release. Repeat 10 times.',
      duration: '1 minute',
      bodyPart: 'Shoulders',
    },
    {
      id: 'wrist-stretches',
      name: 'Wrist Stretches',
      description: 'Extend arm, pull fingers back gently with other hand. Hold 15 seconds each side.',
      duration: '1 minute',
      bodyPart: 'Wrists',
    },
    {
      id: 'chest-opener',
      name: 'Chest Opener',
      description: 'Clasp hands behind back, squeeze shoulder blades together, lift chest. Hold 20 seconds.',
      duration: '30 seconds',
      bodyPart: 'Chest',
    },
    {
      id: 'seated-twist',
      name: 'Seated Spinal Twist',
      description: 'Sit tall, twist torso to one side, hold armrest. Hold 20 seconds each side.',
      duration: '1 minute',
      bodyPart: 'Spine',
    },
    {
      id: 'hip-flexor',
      name: 'Hip Flexor Stretch',
      description: 'Stand up, step forward into a lunge, keep back straight. Hold 30 seconds each leg.',
      duration: '1 minute',
      bodyPart: 'Hips',
    },
    {
      id: 'eye-exercise',
      name: 'Eye Focus Exercise',
      description: 'Look at something 20 feet away for 20 seconds. Blink frequently.',
      duration: '20 seconds',
      bodyPart: 'Eyes',
    },
    {
      id: 'calf-raises',
      name: 'Standing Calf Raises',
      description: 'Stand up, rise onto toes, hold briefly, lower. Repeat 15 times.',
      duration: '1 minute',
      bodyPart: 'Legs',
    },
  ];

  const ergonomicTips = [
    'Position your monitor an arm\'s length away from your face.',
    'Keep your keyboard and mouse at the same height as your elbows.',
    'Use a document holder next to your monitor to reduce neck strain.',
    'Adjust screen brightness to match your surroundings.',
    'Take micro-breaks every 20-30 minutes to reduce muscle fatigue.',
    'Consider a standing desk or sit-stand converter for variety.',
    'Keep frequently used items within easy reach to avoid stretching.',
    'Use a headset for phone calls to avoid neck strain.',
  ];

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.reminderSettings) setReminderSettings(params.reminderSettings);
      if (params.activeTab) setActiveTab(params.activeTab);
      if (params.checkIns) setCheckIns(params.checkIns);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSx+zPPTgjMGHm7A7+OZSA0PVKno77BdGAg+l9z0xnMpBSh5yPDajzwIDly47+mjUBELTKXk8LdmHwU2jtLzzHwvByd3xvDglEQKElyx6OypVxMLTKjm871rJAU5kdLy0H0xByJ0w/DglkUKE2Cy6vGpVxINS6ro9L1sJQU5ktPy0n4yByN1xPDhmEcLEl+y6/KqWhQMTqzo9L1tJgU6ktT00H4xByN0w/DglkUKEV6x6O6oVRMNTavm9L1sJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/Dg';

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sittingTimerRef.current) clearInterval(sittingTimerRef.current);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setEyeBreakTimer(prev => {
          if (prev <= 1) {
            triggerReminder('eye');
            return reminderSettings.eyeBreak * 60;
          }
          return prev - 1;
        });

        setStandUpTimer(prev => {
          if (prev <= 1) {
            triggerReminder('stand');
            return reminderSettings.standUp * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, reminderSettings]);

  // Sitting time tracker
  useEffect(() => {
    if (sessionStartTime) {
      sittingTimerRef.current = window.setInterval(() => {
        setTotalSittingTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (sittingTimerRef.current) clearInterval(sittingTimerRef.current);
    };
  }, [sessionStartTime]);

  const triggerReminder = (type: ReminderType) => {
    setActiveReminder(type);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      const messages = {
        eye: { title: 'Eye Break!', body: 'Look at something 20 feet away for 20 seconds.' },
        stand: { title: 'Time to Stand!', body: 'Stand up and stretch for a minute.' },
        posture: { title: 'Posture Check!', body: 'Check your sitting posture.' },
      };
      new Notification(messages[type].title, { body: messages[type].body, icon: '/favicon.ico' });
    }
  };

  const togglePostureItem = (id: string) => {
    setPostureItems(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const getPostureScore = () => {
    const checkedCount = postureItems.filter(item => item.checked).length;
    return Math.round((checkedCount / postureItems.length) * 100);
  };

  const saveCheckIn = () => {
    const checkedItems = postureItems.filter(item => item.checked).map(item => item.id);
    const newCheckIn: PostureCheckIn = {
      timestamp: new Date(),
      score: getPostureScore(),
      itemsChecked: checkedItems,
    };
    setCheckIns(prev => [...prev, newCheckIn]);

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const startSession = () => {
    setSessionStartTime(new Date());
    setIsTimerRunning(true);
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseSession = () => {
    setIsTimerRunning(false);
  };

  const resetTimers = () => {
    setEyeBreakTimer(reminderSettings.eyeBreak * 60);
    setStandUpTimer(reminderSettings.standUp * 60);
    setActiveReminder(null);
  };

  const dismissReminder = () => {
    setActiveReminder(null);
  };

  const getTodayCheckIns = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkIns.filter(checkIn => new Date(checkIn.timestamp) >= today);
  };

  const getAverageScore = () => {
    const todayCheckIns = getTodayCheckIns();
    if (todayCheckIns.length === 0) return 0;
    const total = todayCheckIns.reduce((sum, checkIn) => sum + checkIn.score, 0);
    return Math.round(total / todayCheckIns.length);
  };

  // Prepare data for export
  const getExportData = () => {
    return checkIns.map(checkIn => ({
      timestamp: checkIn.timestamp,
      score: checkIn.score,
      itemsCheckedCount: checkIn.itemsChecked.length,
      itemsCheckedList: checkIn.itemsChecked
        .map(id => postureItems.find(item => item.id === id)?.label || id)
        .join('; '),
    }));
  };

  // Export handlers
  const handleExportCSV = () => {
    const data = getExportData();
    exportToCSV(data, COLUMNS, { filename: 'posture-checker-data' });
  };

  const handleExportExcel = () => {
    const data = getExportData();
    exportToExcel(data, COLUMNS, { filename: 'posture-checker-data' });
  };

  const handleExportJSON = () => {
    const data = getExportData();
    exportToJSON(data, { filename: 'posture-checker-data' });
  };

  const handleExportPDF = async () => {
    const data = getExportData();
    await exportToPDF(data, COLUMNS, { filename: 'posture-checker-data' });
  };

  const handlePrint = () => {
    const data = getExportData();
    printData(data, COLUMNS, { filename: 'posture-checker-data' });
  };

  const handleCopyToClipboard = async () => {
    const data = getExportData();
    return copyUtil(data, COLUMNS);
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-[#0D9488]">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.postureChecker.postureChecker', 'Posture Checker')}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.postureChecker.improveYourDeskErgonomicsAnd', 'Improve your desk ergonomics and take healthy breaks')}
            </p>
          </div>
        </div>
        <ExportDropdown
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
          onExportJSON={handleExportJSON}
          onExportPDF={handleExportPDF}
          onPrint={handlePrint}
          onCopyToClipboard={handleCopyToClipboard}
          disabled={checkIns.length === 0}
          showImport={false}
          theme={theme === 'dark' ? 'dark' : 'light'}
        />
      </div>

      {/* Active Reminder Alert */}
      {activeReminder && (
        <div className="mb-6 p-4 rounded-lg bg-amber-500/20 border border-amber-500/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <div>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {activeReminder === 'eye' && 'Eye Break Time!'}
                  {activeReminder === 'stand' && 'Time to Stand Up!'}
                  {activeReminder === 'posture' && 'Check Your Posture!'}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {activeReminder === 'eye' && 'Look at something 20 feet away for 20 seconds.'}
                  {activeReminder === 'stand' && 'Stand up, stretch, and walk around for a minute.'}
                  {activeReminder === 'posture' && 'Go through the posture checklist.'}
                </p>
              </div>
            </div>
            <button
              onClick={dismissReminder}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              {t('tools.postureChecker.done', 'Done')}
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'checklist', label: 'Checklist', icon: <Check className="w-4 h-4" /> },
          { id: 'reminders', label: 'Reminders', icon: <Timer className="w-4 h-4" /> },
          { id: 'stretches', label: 'Stretches', icon: <Activity className="w-4 h-4" /> },
          { id: 'stats', label: 'Statistics', icon: <Clock className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#0D9488] text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Checklist Tab */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          {/* Posture Score */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.postureChecker.postureScore', 'Posture Score')}
              </span>
              <span className="text-2xl font-bold text-[#0D9488]">{getPostureScore()}%</span>
            </div>
            <Progress value={getPostureScore()} className="h-3" />
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            {postureItems.map(item => (
              <div
                key={item.id}
                onClick={() => togglePostureItem(item.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  item.checked
                    ? 'bg-[#0D9488]/20 border-2 border-[#0D9488]'
                    : theme === 'dark'
                    ? 'bg-gray-700 border-2 border-transparent hover:border-gray-600'
                    : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      item.checked ? 'bg-[#0D9488] text-white' : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {item.checked ? <Check className="w-5 h-5" /> : item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item.label}
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save Check-in Button */}
          <button
            onClick={saveCheckIn}
            className="w-full py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors"
          >
            {t('tools.postureChecker.savePostureCheckIn', 'Save Posture Check-in')}
          </button>

          {/* Ergonomic Tips */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.postureChecker.ergonomicTips', 'Ergonomic Tips')}
            </h3>
            <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {ergonomicTips.slice(0, 4).map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#0D9488] mt-1">&#8226;</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Reminders Tab */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          {/* Timer Controls */}
          <div className="flex gap-3 justify-center">
            {!isTimerRunning ? (
              <button
                onClick={startSession}
                className="flex items-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors"
              >
                <Play className="w-5 h-5" />
                {t('tools.postureChecker.startSession', 'Start Session')}
              </button>
            ) : (
              <button
                onClick={pauseSession}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
              >
                <Pause className="w-5 h-5" />
                {t('tools.postureChecker.pauseSession', 'Pause Session')}
              </button>
            )}
            <button
              onClick={resetTimers}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
              {t('tools.postureChecker.reset', 'Reset')}
            </button>
          </div>

          {/* 20-20-20 Eye Break Timer */}
          <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Eye className="w-5 h-5 text-blue-500" />
                {t('tools.postureChecker.202020EyeBreak', '20-20-20 Eye Break')}
              </CardTitle>
              <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.postureChecker.every20MinutesLookAt', 'Every 20 minutes, look at something 20 feet away for 20 seconds')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-mono font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(eyeBreakTimer)}
                </div>
                <Progress value={((reminderSettings.eyeBreak * 60 - eyeBreakTimer) / (reminderSettings.eyeBreak * 60)) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Stand Up Timer */}
          <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <ArrowUp className="w-5 h-5 text-green-500" />
                {t('tools.postureChecker.standUpReminder', 'Stand Up Reminder')}
              </CardTitle>
              <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.postureChecker.standUpAndMoveAround', 'Stand up and move around every 30 minutes')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-mono font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(standUpTimer)}
                </div>
                <Progress value={((reminderSettings.standUp * 60 - standUpTimer) / (reminderSettings.standUp * 60)) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.postureChecker.timerSettings', 'Timer Settings')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.postureChecker.eyeBreakIntervalMinutes', 'Eye Break Interval (minutes)')}
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={reminderSettings.eyeBreak}
                  onChange={(e) => setReminderSettings({ ...reminderSettings, eyeBreak: parseInt(e.target.value) || 20 })}
                  className={`w-20 px-3 py-1 text-center rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.postureChecker.standUpIntervalMinutes', 'Stand Up Interval (minutes)')}
                </label>
                <input
                  type="number"
                  min="15"
                  max="60"
                  value={reminderSettings.standUp}
                  onChange={(e) => setReminderSettings({ ...reminderSettings, standUp: parseInt(e.target.value) || 30 })}
                  className={`w-20 px-3 py-1 text-center rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stretches Tab */}
      {activeTab === 'stretches' && (
        <div className="space-y-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            {t('tools.postureChecker.performTheseStretchesRegularlyTo', 'Perform these stretches regularly to prevent muscle tension and improve circulation.')}
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {stretchingExercises.map(exercise => (
              <Card key={exercise.id} className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {exercise.name}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {exercise.bodyPart}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {exercise.description}
                  </p>
                  <div className="flex items-center gap-1 text-[#0D9488]">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{exercise.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
              <CardContent className="p-4 text-center">
                <div className={`text-3xl font-bold text-[#0D9488]`}>
                  {getTodayCheckIns().length}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.postureChecker.checkInsToday', 'Check-ins Today')}
                </div>
              </CardContent>
            </Card>

            <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
              <CardContent className="p-4 text-center">
                <div className={`text-3xl font-bold text-[#0D9488]`}>
                  {getAverageScore()}%
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.postureChecker.averageScore', 'Average Score')}
                </div>
              </CardContent>
            </Card>

            <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
              <CardContent className="p-4 text-center">
                <div className={`text-3xl font-bold text-[#0D9488]`}>
                  {formatDuration(totalSittingTime)}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.postureChecker.sittingTime', 'Sitting Time')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Check-in History */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.postureChecker.todaySCheckIns', 'Today\'s Check-ins')}
            </h3>
            {getTodayCheckIns().length === 0 ? (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.postureChecker.noCheckInsYetToday', 'No check-ins yet today. Complete your first posture check!')}
              </p>
            ) : (
              <div className="space-y-3">
                {getTodayCheckIns().slice().reverse().map((checkIn, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        checkIn.score >= 80
                          ? 'bg-green-500/20 text-green-500'
                          : checkIn.score >= 60
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {checkIn.score}%
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {checkIn.itemsChecked.length} of {postureItems.length} items checked
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(checkIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* More Ergonomic Tips */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.postureChecker.moreErgonomicTips', 'More Ergonomic Tips')}
            </h3>
            <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {ergonomicTips.slice(4).map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#0D9488] mt-1">&#8226;</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostureCheckerTool;
