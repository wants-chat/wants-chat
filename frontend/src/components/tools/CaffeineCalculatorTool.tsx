import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Coffee, Moon, Plus, Trash2, AlertTriangle, Clock, TrendingDown, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Caffeine half-life in hours (average is 5-6 hours)
const CAFFEINE_HALF_LIFE = 5.5;
const DAILY_LIMIT_MG = 400;
const SLEEP_SAFE_THRESHOLD_MG = 50;

interface CaffeineDrink {
  id: string;
  name: string;
  caffeineAmount: number;
  consumedAt: Date;
}

interface DrinkOption {
  name: string;
  caffeine: number;
  icon: string;
}

const DRINK_OPTIONS: DrinkOption[] = [
  { name: 'Espresso Shot', caffeine: 63, icon: 'espresso' },
  { name: 'Drip Coffee (8oz)', caffeine: 95, icon: 'coffee' },
  { name: 'Drip Coffee (12oz)', caffeine: 140, icon: 'coffee' },
  { name: 'Drip Coffee (16oz)', caffeine: 190, icon: 'coffee' },
  { name: 'Latte', caffeine: 75, icon: 'latte' },
  { name: 'Cold Brew (12oz)', caffeine: 155, icon: 'cold-brew' },
  { name: 'Black Tea (8oz)', caffeine: 47, icon: 'tea' },
  { name: 'Green Tea (8oz)', caffeine: 28, icon: 'tea' },
  { name: 'Energy Drink (8oz)', caffeine: 80, icon: 'energy' },
  { name: 'Energy Drink (16oz)', caffeine: 160, icon: 'energy' },
  { name: 'Red Bull (8.4oz)', caffeine: 80, icon: 'energy' },
  { name: 'Monster (16oz)', caffeine: 160, icon: 'energy' },
  { name: 'Coca-Cola (12oz)', caffeine: 34, icon: 'soda' },
  { name: 'Diet Coke (12oz)', caffeine: 46, icon: 'soda' },
  { name: 'Mountain Dew (12oz)', caffeine: 54, icon: 'soda' },
  { name: 'Dark Chocolate (1oz)', caffeine: 12, icon: 'chocolate' },
  { name: 'Custom Amount', caffeine: 0, icon: 'custom' },
];

// Export columns configuration
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Drink', type: 'string' },
  { key: 'caffeineAmount', header: 'Caffeine (mg)', type: 'number' },
  { key: 'consumedAt', header: 'Time Consumed', type: 'date', format: (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
];

// Calculate remaining caffeine after time elapsed using half-life decay
const calculateRemainingCaffeine = (initialAmount: number, hoursElapsed: number): number => {
  if (hoursElapsed < 0) return initialAmount;
  return initialAmount * Math.pow(0.5, hoursElapsed / CAFFEINE_HALF_LIFE);
};

// Calculate time until caffeine decays to a target level
const calculateTimeToLevel = (currentAmount: number, targetLevel: number): number => {
  if (currentAmount <= targetLevel) return 0;
  // Using the formula: time = half_life * log2(current / target)
  return CAFFEINE_HALF_LIFE * Math.log2(currentAmount / targetLevel);
};

interface CaffeineCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const CaffeineCalculatorTool = ({ uiConfig }: CaffeineCalculatorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [drinks, setDrinks] = useState<CaffeineDrink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<string>(DRINK_OPTIONS[1].name);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [consumptionTime, setConsumptionTime] = useState<string>('');
  const [showInfo, setShowInfo] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        selectedDrink?: string;
        customAmount?: number | string;
      };
      if (params.selectedDrink) setSelectedDrink(params.selectedDrink);
      if (params.customAmount) setCustomAmount(String(params.customAmount));
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // Update current time every minute for accurate calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Initialize consumption time to current time
  useEffect(() => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    setConsumptionTime(timeStr);
  }, []);

  // Calculate current caffeine level in body
  const currentCaffeineLevel = useMemo(() => {
    return drinks.reduce((total, drink) => {
      const hoursElapsed = (currentTime.getTime() - drink.consumedAt.getTime()) / (1000 * 60 * 60);
      return total + calculateRemainingCaffeine(drink.caffeineAmount, hoursElapsed);
    }, 0);
  }, [drinks, currentTime]);

  // Calculate total caffeine consumed today
  const totalCaffeineToday = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return drinks
      .filter(drink => drink.consumedAt >= todayStart)
      .reduce((total, drink) => total + drink.caffeineAmount, 0);
  }, [drinks]);

  // Calculate time to be caffeine-free (below 10mg)
  const timeToCaffeineFree = useMemo(() => {
    if (currentCaffeineLevel <= 10) return 0;
    return calculateTimeToLevel(currentCaffeineLevel, 10);
  }, [currentCaffeineLevel]);

  // Calculate time until sleep-ready (below threshold)
  const timeToSleepReady = useMemo(() => {
    if (currentCaffeineLevel <= SLEEP_SAFE_THRESHOLD_MG) return 0;
    return calculateTimeToLevel(currentCaffeineLevel, SLEEP_SAFE_THRESHOLD_MG);
  }, [currentCaffeineLevel]);

  // Generate caffeine decay curve data points for graph
  const graphData = useMemo(() => {
    const points: { hour: number; level: number }[] = [];
    const hoursToShow = 24;

    for (let h = 0; h <= hoursToShow; h += 0.5) {
      const futureTime = new Date(currentTime.getTime() + h * 60 * 60 * 1000);
      let level = 0;

      drinks.forEach(drink => {
        const hoursElapsed = (futureTime.getTime() - drink.consumedAt.getTime()) / (1000 * 60 * 60);
        if (hoursElapsed >= 0) {
          level += calculateRemainingCaffeine(drink.caffeineAmount, hoursElapsed);
        }
      });

      points.push({ hour: h, level });
    }

    return points;
  }, [drinks, currentTime]);

  const addDrink = () => {
    const option = DRINK_OPTIONS.find(d => d.name === selectedDrink);
    if (!option) return;

    let caffeineAmount = option.caffeine;
    if (option.name === 'Custom Amount') {
      caffeineAmount = parseFloat(customAmount);
      if (isNaN(caffeineAmount) || caffeineAmount <= 0) {
        setValidationMessage('Please enter a valid caffeine amount');
        setTimeout(() => setValidationMessage(null), 3000);
        return;
      }
    }

    const [hours, minutes] = consumptionTime.split(':').map(Number);
    const consumedAt = new Date();
    consumedAt.setHours(hours, minutes, 0, 0);

    // If the time is in the future, assume it's from yesterday
    if (consumedAt > currentTime) {
      consumedAt.setDate(consumedAt.getDate() - 1);
    }

    const newDrink: CaffeineDrink = {
      id: Date.now().toString(),
      name: option.name === 'Custom Amount' ? `Custom (${caffeineAmount}mg)` : option.name,
      caffeineAmount,
      consumedAt,
    };

    setDrinks(prev => [...prev, newDrink]);
    setCustomAmount('');
  };

  const removeDrink = (id: string) => {
    setDrinks(prev => prev.filter(d => d.id !== id));
  };

  const clearAll = () => {
    setDrinks([]);
  };

  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(drinks, COLUMNS, { filename: 'caffeine-tracker' });
  };

  const handleExportExcel = () => {
    exportToExcel(drinks, COLUMNS, { filename: 'caffeine-tracker' });
  };

  const handleExportJSON = () => {
    exportToJSON(drinks, { filename: 'caffeine-tracker', includeMetadata: true });
  };

  const handleExportPDF = async () => {
    await exportToPDF(drinks, COLUMNS, {
      filename: 'caffeine-tracker',
      title: 'Caffeine Intake Report',
      subtitle: new Date().toLocaleDateString(),
    });
  };

  const handlePrint = () => {
    printData(drinks, COLUMNS, { title: 'Caffeine Intake Report' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(drinks, COLUMNS, 'tab');
  };

  const getSleepReadinessStatus = () => {
    if (currentCaffeineLevel <= SLEEP_SAFE_THRESHOLD_MG) {
      return { status: 'ready', color: '#10b981', text: 'Ready for Sleep' };
    } else if (currentCaffeineLevel <= 100) {
      return { status: 'caution', color: '#f59e0b', text: 'Sleep May Be Affected' };
    } else {
      return { status: 'alert', color: '#ef4444', text: 'Not Recommended to Sleep' };
    }
  };

  const sleepStatus = getSleepReadinessStatus();

  // Find max level for graph scaling
  const maxLevel = Math.max(...graphData.map(p => p.level), DAILY_LIMIT_MG);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.caffeineCalculator.caffeineCalculator', 'Caffeine Calculator')}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {drinks.length > 0 && (
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportExcel={handleExportExcel}
                  onExportJSON={handleExportJSON}
                  onExportPDF={handleExportPDF}
                  onPrint={handlePrint}
                  onCopyToClipboard={handleCopyToClipboard}
                  disabled={drinks.length === 0}
                  showImport={false}
                  theme={theme}
                />
              )}
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.caffeineCalculator.howItWorks', 'How It Works')}
              </h3>
              <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Caffeine has a half-life of approximately {CAFFEINE_HALF_LIFE} hours</li>
                <li>This means every {CAFFEINE_HALF_LIFE} hours, half the caffeine leaves your system</li>
                <li>Recommended daily limit is {DAILY_LIMIT_MG}mg for healthy adults</li>
                <li>For better sleep, aim for less than {SLEEP_SAFE_THRESHOLD_MG}mg at bedtime</li>
              </ul>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Current Level */}
            <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('tools.caffeineCalculator.currentLevel', 'Current Level')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {Math.round(currentCaffeineLevel)}mg
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.caffeineCalculator.inYourSystem', 'in your system')}
                </div>
              </CardContent>
            </Card>

            {/* Total Today */}
            <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('tools.caffeineCalculator.totalToday', 'Total Today')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${
                  totalCaffeineToday > DAILY_LIMIT_MG ? 'text-red-500' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {totalCaffeineToday}mg
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  of {DAILY_LIMIT_MG}mg limit
                </div>
              </CardContent>
            </Card>

            {/* Time to Sleep Ready */}
            <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('tools.caffeineCalculator.sleepReadyIn', 'Sleep Ready In')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold`} style={{ color: sleepStatus.color }}>
                  {timeToSleepReady === 0 ? 'Now' : formatTime(timeToSleepReady)}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  below {SLEEP_SAFE_THRESHOLD_MG}mg
                </div>
              </CardContent>
            </Card>

            {/* Caffeine Free */}
            <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('tools.caffeineCalculator.caffeineFreeIn', 'Caffeine Free In')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {timeToCaffeineFree === 0 ? 'Now' : formatTime(timeToCaffeineFree)}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.caffeineCalculator.below10mg', 'below 10mg')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Limit Warning */}
          {totalCaffeineToday > DAILY_LIMIT_MG && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <div className="font-semibold text-red-500">{t('tools.caffeineCalculator.dailyLimitExceeded', 'Daily Limit Exceeded')}</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  You've consumed {totalCaffeineToday - DAILY_LIMIT_MG}mg over the recommended {DAILY_LIMIT_MG}mg daily limit.
                </div>
              </div>
            </div>
          )}

          {/* Sleep Readiness Indicator */}
          <div
            className="mb-6 p-4 rounded-lg flex items-center gap-3"
            style={{ backgroundColor: `${sleepStatus.color}15`, borderLeft: `4px solid ${sleepStatus.color}` }}
          >
            <Moon className="w-5 h-5" style={{ color: sleepStatus.color }} />
            <div>
              <div className="font-semibold" style={{ color: sleepStatus.color }}>
                {sleepStatus.text}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentCaffeineLevel <= SLEEP_SAFE_THRESHOLD_MG
                  ? 'Your caffeine level is low enough for quality sleep.'
                  : `Wait ${formatTime(timeToSleepReady)} for optimal sleep conditions.`}
              </div>
            </div>
          </div>

          {/* Caffeine Decay Graph */}
          {drinks.length > 0 && (
            <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <TrendingDown className="w-5 h-5" />
                {t('tools.caffeineCalculator.caffeineLevelOverNext24', 'Caffeine Level Over Next 24 Hours')}
              </h3>
              <div className="relative h-48 w-full">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-xs text-right pr-2">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{Math.round(maxLevel)}mg</span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{Math.round(maxLevel / 2)}mg</span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>0mg</span>
                </div>

                {/* Graph area */}
                <div className="absolute left-12 right-0 top-0 bottom-6">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    {/* Daily limit line */}
                    <line
                      x1="0"
                      y1={100 - (DAILY_LIMIT_MG / maxLevel) * 100}
                      x2="100"
                      y2={100 - (DAILY_LIMIT_MG / maxLevel) * 100}
                      stroke="#ef4444"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />

                    {/* Sleep threshold line */}
                    <line
                      x1="0"
                      y1={100 - (SLEEP_SAFE_THRESHOLD_MG / maxLevel) * 100}
                      x2="100"
                      y2={100 - (SLEEP_SAFE_THRESHOLD_MG / maxLevel) * 100}
                      stroke="#10b981"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />

                    {/* Caffeine curve */}
                    <polyline
                      fill="none"
                      stroke="#0D9488"
                      strokeWidth="1"
                      points={graphData.map((point, i) => {
                        const x = (point.hour / 24) * 100;
                        const y = 100 - (point.level / maxLevel) * 100;
                        return `${x},${y}`;
                      }).join(' ')}
                    />

                    {/* Area fill under curve */}
                    <polygon
                      fill="#0D9488"
                      fillOpacity="0.1"
                      points={`0,100 ${graphData.map((point) => {
                        const x = (point.hour / 24) * 100;
                        const y = 100 - (point.level / maxLevel) * 100;
                        return `${x},${y}`;
                      }).join(' ')} 100,100`}
                    />
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="absolute left-12 right-0 bottom-0 flex justify-between text-xs">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.caffeineCalculator.now', 'Now')}</span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>6h</span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>12h</span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>18h</span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>24h</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-[#0D9488]"></div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.caffeineCalculator.caffeineLevel', 'Caffeine Level')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-red-500" style={{ borderStyle: 'dashed' }}></div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.caffeineCalculator.dailyLimit', 'Daily Limit')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-green-500" style={{ borderStyle: 'dashed' }}></div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.caffeineCalculator.sleepThreshold', 'Sleep Threshold')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Add Drink Form */}
          <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.caffeineCalculator.addCaffeineIntake', 'Add Caffeine Intake')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Drink Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.caffeineCalculator.drinkType', 'Drink Type')}
                </label>
                <select
                  value={selectedDrink}
                  onChange={(e) => setSelectedDrink(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {DRINK_OPTIONS.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name} {option.caffeine > 0 ? `(${option.caffeine}mg)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Amount (shown only for custom) */}
              {selectedDrink === 'Custom Amount' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.caffeineCalculator.caffeineAmountMg', 'Caffeine Amount (mg)')}
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder={t('tools.caffeineCalculator.enterMg', 'Enter mg')}
                    min="1"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              )}

              {/* Time */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.caffeineCalculator.timeConsumed', 'Time Consumed')}
                </label>
                <div className="relative">
                  <Clock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="time"
                    value={consumptionTime}
                    onChange={(e) => setConsumptionTime(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              {/* Add Button */}
              <div className={`flex items-end ${selectedDrink === 'Custom Amount' ? '' : 'md:col-span-1'}`}>
                <button
                  onClick={addDrink}
                  className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.caffeineCalculator.addDrink', 'Add Drink')}
                </button>
              </div>
            </div>
          </div>

          {/* Drinks List */}
          {drinks.length > 0 && (
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.caffeineCalculator.todaySCaffeineIntake', 'Today\'s Caffeine Intake')}
                </h3>
                <button
                  onClick={clearAll}
                  className={`text-sm px-3 py-1 rounded transition-colors ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-red-400 hover:bg-gray-600'
                      : 'text-gray-600 hover:text-red-600 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.caffeineCalculator.clearAll', 'Clear All')}
                </button>
              </div>

              <div className="space-y-2">
                {drinks.sort((a, b) => b.consumedAt.getTime() - a.consumedAt.getTime()).map((drink) => {
                  const hoursElapsed = (currentTime.getTime() - drink.consumedAt.getTime()) / (1000 * 60 * 60);
                  const remaining = calculateRemainingCaffeine(drink.caffeineAmount, hoursElapsed);

                  return (
                    <div
                      key={drink.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Coffee className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {drink.name}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDateTime(drink.consumedAt)} - {drink.caffeineAmount}mg consumed, {Math.round(remaining)}mg remaining
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeDrink(drink.id)}
                        className={`p-2 rounded transition-colors ${
                          theme === 'dark'
                            ? 'text-gray-400 hover:text-red-400 hover:bg-gray-500'
                            : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {drinks.length === 0 && (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Coffee className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">{t('tools.caffeineCalculator.noCaffeineTrackedYet', 'No caffeine tracked yet')}</p>
              <p className="text-sm">{t('tools.caffeineCalculator.addYourFirstDrinkTo', 'Add your first drink to start tracking your caffeine intake.')}</p>
            </div>
          )}

          {/* Caffeine Reference */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.caffeineCalculator.commonCaffeineAmounts', 'Common Caffeine Amounts')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {DRINK_OPTIONS.filter(d => d.caffeine > 0).slice(0, 8).map((option) => (
                <div key={option.name} className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{option.name}:</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{option.caffeine}mg</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <AlertTriangle className="w-5 h-5" />
            <span>{validationMessage}</span>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default CaffeineCalculatorTool;
