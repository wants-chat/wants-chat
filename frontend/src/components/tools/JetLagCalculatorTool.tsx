import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, Moon, Sun, Coffee, Clock, ArrowRight, AlertCircle, Utensils, Lightbulb, Bed, Droplets, Pill, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Timezone {
  name: string;
  offset: number;
  label: string;
}

type TravelDirection = 'east' | 'west';
type JetLagSeverity = 'mild' | 'moderate' | 'severe';

interface JetLagResult {
  timeDifference: number;
  severity: JetLagSeverity;
  recoveryDays: number;
  adjustmentStartDays: number;
  direction: TravelDirection;
}

interface ScheduleRecommendation {
  phase: string;
  timing: string;
  description: string;
}

const TIMEZONES: Timezone[] = [
  { name: 'UTC-12:00', offset: -12, label: 'Baker Island (UTC-12)' },
  { name: 'UTC-11:00', offset: -11, label: 'American Samoa (UTC-11)' },
  { name: 'UTC-10:00', offset: -10, label: 'Hawaii (UTC-10)' },
  { name: 'UTC-09:00', offset: -9, label: 'Alaska (UTC-9)' },
  { name: 'UTC-08:00', offset: -8, label: 'Los Angeles, Vancouver (UTC-8)' },
  { name: 'UTC-07:00', offset: -7, label: 'Denver, Phoenix (UTC-7)' },
  { name: 'UTC-06:00', offset: -6, label: 'Chicago, Mexico City (UTC-6)' },
  { name: 'UTC-05:00', offset: -5, label: 'New York, Toronto (UTC-5)' },
  { name: 'UTC-04:00', offset: -4, label: 'Santiago, Halifax (UTC-4)' },
  { name: 'UTC-03:00', offset: -3, label: 'Sao Paulo, Buenos Aires (UTC-3)' },
  { name: 'UTC-02:00', offset: -2, label: 'Mid-Atlantic (UTC-2)' },
  { name: 'UTC-01:00', offset: -1, label: 'Azores (UTC-1)' },
  { name: 'UTC+00:00', offset: 0, label: 'London, Lisbon (UTC)' },
  { name: 'UTC+01:00', offset: 1, label: 'Paris, Berlin, Rome (UTC+1)' },
  { name: 'UTC+02:00', offset: 2, label: 'Cairo, Athens (UTC+2)' },
  { name: 'UTC+03:00', offset: 3, label: 'Moscow, Istanbul (UTC+3)' },
  { name: 'UTC+04:00', offset: 4, label: 'Dubai, Baku (UTC+4)' },
  { name: 'UTC+05:00', offset: 5, label: 'Karachi, Tashkent (UTC+5)' },
  { name: 'UTC+05:30', offset: 5.5, label: 'Mumbai, New Delhi (UTC+5:30)' },
  { name: 'UTC+06:00', offset: 6, label: 'Dhaka, Almaty (UTC+6)' },
  { name: 'UTC+07:00', offset: 7, label: 'Bangkok, Jakarta (UTC+7)' },
  { name: 'UTC+08:00', offset: 8, label: 'Singapore, Hong Kong, Beijing (UTC+8)' },
  { name: 'UTC+09:00', offset: 9, label: 'Tokyo, Seoul (UTC+9)' },
  { name: 'UTC+10:00', offset: 10, label: 'Sydney, Melbourne (UTC+10)' },
  { name: 'UTC+11:00', offset: 11, label: 'Solomon Islands (UTC+11)' },
  { name: 'UTC+12:00', offset: 12, label: 'Auckland, Fiji (UTC+12)' },
];

interface JetLagCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const JetLagCalculatorTool: React.FC<JetLagCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [departureTimezone, setDepartureTimezone] = useState<number>(-5);
  const [arrivalTimezone, setArrivalTimezone] = useState<number>(1);
  const [flightDuration, setFlightDuration] = useState<string>('8');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.departureTimezone !== undefined) {
        setDepartureTimezone(params.departureTimezone);
        hasChanges = true;
      }
      if (params.arrivalTimezone !== undefined) {
        setArrivalTimezone(params.arrivalTimezone);
        hasChanges = true;
      }
      if (params.flightDuration) {
        setFlightDuration(String(params.flightDuration));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
        setShowResults(true);
      }
    }
  }, [uiConfig?.params]);

  const calculateJetLag = useMemo((): JetLagResult | null => {
    if (!showResults) return null;

    let timeDiff = arrivalTimezone - departureTimezone;

    if (timeDiff > 12) timeDiff -= 24;
    if (timeDiff < -12) timeDiff += 24;

    const absoluteDiff = Math.abs(timeDiff);
    const direction: TravelDirection = timeDiff > 0 ? 'east' : 'west';

    let severity: JetLagSeverity;
    if (absoluteDiff <= 3) {
      severity = 'mild';
    } else if (absoluteDiff <= 6) {
      severity = 'moderate';
    } else {
      severity = 'severe';
    }

    const recoveryMultiplier = direction === 'east' ? 1 : 0.75;
    const recoveryDays = Math.ceil(absoluteDiff * recoveryMultiplier);
    const adjustmentStartDays = Math.min(Math.ceil(absoluteDiff / 2), 7);

    return {
      timeDifference: absoluteDiff,
      severity,
      recoveryDays,
      adjustmentStartDays,
      direction,
    };
  }, [departureTimezone, arrivalTimezone, showResults]);

  const getSeverityColor = (severity: JetLagSeverity): string => {
    switch (severity) {
      case 'mild': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'severe': return '#ef4444';
    }
  };

  const getSeverityText = (severity: JetLagSeverity): string => {
    switch (severity) {
      case 'mild': return 'Mild - Minor adjustments needed';
      case 'moderate': return 'Moderate - Plan for adaptation time';
      case 'severe': return 'Severe - Significant preparation recommended';
    }
  };

  const getSleepScheduleRecommendations = (): ScheduleRecommendation[] => {
    if (!calculateJetLag) return [];

    const { direction } = calculateJetLag;
    const shiftPerDay = direction === 'east' ? 1 : 1.5;

    if (direction === 'east') {
      return [
        { phase: 'Pre-flight', timing: `${calculateJetLag.adjustmentStartDays} days before`, description: `Go to bed ${shiftPerDay} hour(s) earlier each day` },
        { phase: 'Pre-flight', timing: 'Morning', description: 'Get bright light exposure in the morning' },
        { phase: 'During flight', timing: 'On board', description: 'Set watch to destination time and try to sleep during destination night hours' },
        { phase: 'Post-arrival', timing: 'First few days', description: 'Get morning sunlight, avoid afternoon naps longer than 20 minutes' },
      ];
    } else {
      return [
        { phase: 'Pre-flight', timing: `${calculateJetLag.adjustmentStartDays} days before`, description: `Go to bed ${shiftPerDay} hour(s) later each day` },
        { phase: 'Pre-flight', timing: 'Evening', description: 'Get bright light exposure in the evening' },
        { phase: 'During flight', timing: 'On board', description: 'Stay awake if it is daytime at destination, sleep if it is night' },
        { phase: 'Post-arrival', timing: 'First few days', description: 'Get evening sunlight, stay active during the day' },
      ];
    }
  };

  const getLightExposureRecommendations = (): string[] => {
    if (!calculateJetLag) return [];

    const { direction } = calculateJetLag;

    if (direction === 'east') {
      return [
        'Seek bright morning light at destination (6-10 AM)',
        'Avoid evening light after 6 PM for the first few days',
        'Use blue light blocking glasses in the evening',
        'Consider a light therapy box for morning exposure',
        'Keep curtains open to wake naturally with sunrise',
      ];
    } else {
      return [
        'Seek bright evening light at destination (4-8 PM)',
        'Avoid morning light before 10 AM for the first few days',
        'Wear sunglasses in the morning if going outside early',
        'Delay exposure to bright light in the morning',
        'Use dim lights in the morning, bright lights in the evening',
      ];
    }
  };

  const getMealTimingRecommendations = (): string[] => {
    if (!calculateJetLag) return [];

    const { direction } = calculateJetLag;

    const baseRecs = [
      'Start eating meals at destination time before your trip',
      'Avoid heavy meals close to your new bedtime',
      'Stay hydrated - drink plenty of water before, during, and after flight',
      'Limit alcohol and caffeine during flight',
      'Eat a protein-rich breakfast at destination to help stay alert',
    ];

    if (direction === 'east') {
      return [
        ...baseRecs,
        'Eat dinner earlier in the days before departure',
        'Have a light, early meal on arrival night',
      ];
    } else {
      return [
        ...baseRecs,
        'Eat dinner later in the days before departure',
        'Delay breakfast slightly on arrival day',
      ];
    }
  };

  const getMelatoninRecommendations = (): string[] => {
    if (!calculateJetLag) return [];

    const { direction, severity, adjustmentStartDays } = calculateJetLag;

    if (severity === 'mild') {
      return [
        'Melatonin may not be necessary for short timezone changes',
        'If using, take 0.5-1mg about 30 minutes before desired sleep time',
        'Natural sleep hygiene practices may be sufficient',
      ];
    }

    const melatoninStartDays = Math.min(3, adjustmentStartDays);

    if (direction === 'east') {
      return [
        'Take 0.5-3mg melatonin 30 minutes before target bedtime at destination',
        `Start taking melatonin ${melatoninStartDays} days before departure at your planned destination bedtime`,
        'Continue for 3-5 days after arrival',
        'Combine with morning light exposure for best results',
        'Consult healthcare provider before use, especially if taking other medications',
      ];
    } else {
      return [
        'Melatonin is generally less effective for westward travel',
        'If using, take a low dose (0.5mg) in the middle of the night if you wake',
        'Focus more on light exposure therapy',
        'Avoid melatonin near your new wake time',
        'Consult healthcare provider before use',
      ];
    }
  };

  const getFlightTips = (): { pre: string[]; during: string[]; post: string[] } => {
    return {
      pre: [
        'Get plenty of rest before your flight',
        'Stay hydrated in the days leading up to travel',
        'Begin adjusting sleep schedule if crossing 4+ time zones',
        'Pack sleep essentials: eye mask, earplugs, neck pillow',
        'Avoid scheduling important meetings on arrival day',
      ],
      during: [
        'Set your watch to destination time immediately',
        'Stay hydrated - drink water every hour',
        'Move around the cabin periodically',
        'Avoid alcohol and excessive caffeine',
        'Try to sleep during destination night hours',
        'Wear compression socks for long flights',
        'Use noise-canceling headphones or earplugs',
      ],
      post: [
        'Get sunlight exposure appropriate for your travel direction',
        'Stay active during the day, even if tired',
        'Avoid long naps - keep them under 20-30 minutes',
        'Eat meals at local times',
        'Avoid heavy exercise late in the day',
        'Be patient - full adaptation takes time',
        'Consider a power nap if absolutely necessary',
      ],
    };
  };

  const handleCalculate = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setShowResults(false);
    setDepartureTimezone(-5);
    setArrivalTimezone(1);
    setFlightDuration('8');
  };

  const result = calculateJetLag;
  const flightTips = getFlightTips();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.jetLagCalculator.jetLagCalculator', 'Jet Lag Calculator')}
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.jetLagCalculator.planYourRecoveryFromJet', 'Plan your recovery from jet lag with personalized recommendations')}
              </p>
            </div>
          </div>

          {/* Prefill indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.jetLagCalculator.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.jetLagCalculator.departureTimezone', 'Departure Timezone')}
                </label>
                <select
                  value={departureTimezone}
                  onChange={(e) => setDepartureTimezone(parseFloat(e.target.value))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.name} value={tz.offset}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.jetLagCalculator.arrivalTimezone', 'Arrival Timezone')}
                </label>
                <select
                  value={arrivalTimezone}
                  onChange={(e) => setArrivalTimezone(parseFloat(e.target.value))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.name} value={tz.offset}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.jetLagCalculator.flightDurationHours', 'Flight Duration (hours)')}
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={flightDuration}
                onChange={(e) => setFlightDuration(e.target.value)}
                placeholder={t('tools.jetLagCalculator.enterFlightDuration', 'Enter flight duration')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleCalculate}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plane className="w-5 h-5" />
              {t('tools.jetLagCalculator.calculateJetLag', 'Calculate Jet Lag')}
            </button>
            <button
              onClick={handleReset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.jetLagCalculator.reset', 'Reset')}
            </button>
          </div>

          {result && (
            <div className="space-y-6">
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: `${getSeverityColor(result.severity)}15`, borderLeft: `4px solid ${getSeverityColor(result.severity)}` }}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5" style={{ color: getSeverityColor(result.severity) }} />
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.jetLagCalculator.jetLagSummary', 'Jet Lag Summary')}
                      </h3>
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-bold text-2xl" style={{ color: getSeverityColor(result.severity) }}>
                        {result.timeDifference}
                      </span>{' '}
                      hour{result.timeDifference !== 1 ? 's' : ''} time difference
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Direction: <span className="font-medium">{result.direction === 'east' ? t('tools.jetLagCalculator.eastward', 'Eastward') : t('tools.jetLagCalculator.westward', 'Westward')}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <ArrowRight className="w-4 h-4" style={{ color: getSeverityColor(result.severity), transform: result.direction === 'west' ? t('tools.jetLagCalculator.rotate180deg', 'rotate(180deg)') : 'none' }} />
                      <span className="font-medium" style={{ color: getSeverityColor(result.severity) }}>
                        {getSeverityText(result.severity)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.jetLagCalculator.estimatedRecovery', 'Estimated Recovery')}</div>
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {result.recoveryDays} day{result.recoveryDays !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.jetLagCalculator.startAdjusting', 'Start Adjusting')}</div>
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {result.adjustmentStartDays} day{result.adjustmentStartDays !== 1 ? 's' : ''} before
                    </div>
                  </div>
                </div>
              </div>

              <Card className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-[#0D9488]" />
                    <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.jetLagCalculator.sleepScheduleAdjustment', 'Sleep Schedule Adjustment')}
                    </CardTitle>
                  </div>
                  <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.jetLagCalculator.graduallyShiftYourSleepSchedule', 'Gradually shift your sleep schedule to minimize jet lag')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSleepScheduleRecommendations().map((rec, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            rec.phase === 'Pre-flight'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : rec.phase === 'During flight'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {rec.phase}
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {rec.timing}
                          </span>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {rec.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-[#0D9488]" />
                    <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.jetLagCalculator.lightExposureStrategy', 'Light Exposure Strategy')}
                    </CardTitle>
                  </div>
                  <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.jetLagCalculator.useLightExposureToReset', 'Use light exposure to reset your circadian rhythm')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {getLightExposureRecommendations().map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Lightbulb className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-[#0D9488]" />
                    <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.jetLagCalculator.mealTimingSuggestions', 'Meal Timing Suggestions')}
                    </CardTitle>
                  </div>
                  <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.jetLagCalculator.alignYourEatingScheduleWith', 'Align your eating schedule with destination time')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {getMealTimingRecommendations().map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Coffee className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-[#0D9488]" />
                    <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.jetLagCalculator.melatoninTiming', 'Melatonin Timing')}
                    </CardTitle>
                  </div>
                  <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.jetLagCalculator.whenAndHowToUse', 'When and how to use melatonin supplements')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <div className="flex items-start gap-2">
                      <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                        {t('tools.jetLagCalculator.alwaysConsultAHealthcareProvider', 'Always consult a healthcare provider before using melatonin supplements, especially if you have medical conditions or take other medications.')}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {getMelatoninRecommendations().map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Moon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-[#0D9488]" />
                    <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.jetLagCalculator.travelTips', 'Travel Tips')}
                    </CardTitle>
                  </div>
                  <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.jetLagCalculator.beforeDuringAndAfterYour', 'Before, during, and after your flight')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {t('tools.jetLagCalculator.preFlight', 'Pre-Flight')}
                      </h4>
                      <ul className="space-y-1">
                        {flightTips.pre.map((tip, index) => (
                          <li key={index} className={`text-sm flex items-start gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span className="text-[#0D9488] mt-1">-</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {t('tools.jetLagCalculator.duringFlight', 'During Flight')}
                      </h4>
                      <ul className="space-y-1">
                        {flightTips.during.map((tip, index) => (
                          <li key={index} className={`text-sm flex items-start gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span className="text-[#0D9488] mt-1">-</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {t('tools.jetLagCalculator.postFlight', 'Post-Flight')}
                      </h4>
                      <ul className="space-y-1">
                        {flightTips.post.map((tip, index) => (
                          <li key={index} className={`text-sm flex items-start gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span className="text-[#0D9488] mt-1">-</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-[#0D9488]" />
                    <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.jetLagCalculator.hydrationTips', 'Hydration Tips')}
                    </CardTitle>
                  </div>
                  <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.jetLagCalculator.stayHydratedToReduceJet', 'Stay hydrated to reduce jet lag symptoms')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Droplets className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.jetLagCalculator.drinkAtLeast8ozOf', 'Drink at least 8oz of water every hour during the flight')}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Droplets className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.jetLagCalculator.avoidAlcoholAndLimitCaffeine', 'Avoid alcohol and limit caffeine - both are dehydrating')}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Droplets className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.jetLagCalculator.useAHydratingFacialMist', 'Use a hydrating facial mist during long flights')}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Droplets className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.jetLagCalculator.continueIncreasedWaterIntakeFor', 'Continue increased water intake for 2-3 days after arrival')}
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {!showResults && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.jetLagCalculator.aboutJetLag', 'About Jet Lag')}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Jet lag occurs when your internal body clock is out of sync with the time zone you are in.
                It is typically harder to adjust when traveling east than west. This calculator provides
                personalized recommendations for sleep schedules, light exposure, meal timing, and melatonin
                use to help you minimize jet lag symptoms and recover faster.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JetLagCalculatorTool;
