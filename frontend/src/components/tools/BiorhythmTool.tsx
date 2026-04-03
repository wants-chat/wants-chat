import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Calendar, ChevronLeft, ChevronRight, Info, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface BiorhythmData {
  physical: number;
  emotional: number;
  intellectual: number;
  intuitive: number;
  daysSinceBirth: number;
}

interface CycleInfo {
  name: string;
  period: number;
  color: string;
  description: string;
  highMeaning: string;
  lowMeaning: string;
}

const cycles: Record<string, CycleInfo> = {
  physical: {
    name: 'Physical',
    period: 23,
    color: 'red',
    description: 'Governs coordination, strength, and physical well-being',
    highMeaning: 'Peak energy, endurance, and physical performance',
    lowMeaning: 'Rest needed, lower stamina, take it easy',
  },
  emotional: {
    name: 'Emotional',
    period: 28,
    color: 'blue',
    description: 'Influences mood, sensitivity, and creativity',
    highMeaning: 'Positive outlook, creative inspiration, social harmony',
    lowMeaning: 'Emotional sensitivity, need for reflection, mood fluctuations',
  },
  intellectual: {
    name: 'Intellectual',
    period: 33,
    color: 'green',
    description: 'Affects memory, alertness, and analytical thinking',
    highMeaning: 'Sharp thinking, good memory, optimal learning',
    lowMeaning: 'Mental fatigue, difficulty concentrating, review time',
  },
  intuitive: {
    name: 'Intuitive',
    period: 38,
    color: 'purple',
    description: 'Governs unconscious perception and instincts',
    highMeaning: 'Strong instincts, heightened awareness, trust your gut',
    lowMeaning: 'Rational thinking preferred, verify hunches',
  },
};

interface BiorhythmToolProps {
  uiConfig?: UIConfig;
}

export const BiorhythmTool: React.FC<BiorhythmToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [birthDate, setBirthDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showInfo, setShowInfo] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  const calculateBiorhythm = useCallback((daysAlive: number): BiorhythmData => {
    const physical = Math.sin((2 * Math.PI * daysAlive) / 23) * 100;
    const emotional = Math.sin((2 * Math.PI * daysAlive) / 28) * 100;
    const intellectual = Math.sin((2 * Math.PI * daysAlive) / 33) * 100;
    const intuitive = Math.sin((2 * Math.PI * daysAlive) / 38) * 100;

    return { physical, emotional, intellectual, intuitive, daysSinceBirth: daysAlive };
  }, []);

  const biorhythm = useMemo((): BiorhythmData | null => {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    const target = new Date(selectedDate);
    const diffTime = target.getTime() - birth.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null;

    return calculateBiorhythm(diffDays);
  }, [birthDate, selectedDate, calculateBiorhythm]);

  const weekData = useMemo(() => {
    if (!birthDate) return [];

    const birth = new Date(birthDate);
    const week: { date: Date; data: BiorhythmData }[] = [];

    for (let i = -3; i <= 3; i++) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + i);
      const diffDays = Math.floor((date.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) {
        week.push({ date, data: calculateBiorhythm(diffDays) });
      }
    }

    return week;
  }, [birthDate, selectedDate, calculateBiorhythm]);

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleCalculate = () => {
    if (birthDate) {
      setHasCalculated(true);
    }
  };

  const reset = () => {
    setBirthDate('');
    setSelectedDate(new Date());
    setHasCalculated(false);
  };

  const getColorClasses = (cycle: string, value: number) => {
    const colors: Record<string, { positive: string; negative: string; neutral: string }> = {
      physical: {
        positive: isDark ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-50',
        negative: isDark ? 'text-red-300 bg-red-900/20' : 'text-red-400 bg-red-50/50',
        neutral: isDark ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100',
      },
      emotional: {
        positive: isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-50',
        negative: isDark ? 'text-blue-300 bg-blue-900/20' : 'text-blue-400 bg-blue-50/50',
        neutral: isDark ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100',
      },
      intellectual: {
        positive: isDark ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-50',
        negative: isDark ? 'text-green-300 bg-green-900/20' : 'text-green-400 bg-green-50/50',
        neutral: isDark ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100',
      },
      intuitive: {
        positive: isDark ? 'text-purple-400 bg-purple-900/30' : 'text-purple-600 bg-purple-50',
        negative: isDark ? 'text-purple-300 bg-purple-900/20' : 'text-purple-400 bg-purple-50/50',
        neutral: isDark ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100',
      },
    };

    if (Math.abs(value) < 10) return colors[cycle].neutral;
    return value > 0 ? colors[cycle].positive : colors[cycle].negative;
  };

  const getStatus = (value: number): string => {
    if (value > 75) return 'Peak';
    if (value > 25) return 'High';
    if (value > -25) return 'Critical';
    if (value > -75) return 'Low';
    return 'Bottom';
  };

  const getCriticalDays = useMemo(() => {
    if (!birthDate) return [];

    const birth = new Date(birthDate);
    const criticalDays: { date: Date; cycles: string[] }[] = [];

    for (let i = 0; i <= 30; i++) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + i);
      const diffDays = Math.floor((date.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) continue;

      const criticalCycles: string[] = [];
      Object.entries(cycles).forEach(([key, cycle]) => {
        const value = Math.sin((2 * Math.PI * diffDays) / cycle.period) * 100;
        if (Math.abs(value) < 5) {
          criticalCycles.push(cycle.name);
        }
      });

      if (criticalCycles.length > 0) {
        criticalDays.push({ date, cycles: criticalCycles });
      }
    }

    return criticalDays.slice(0, 5);
  }, [birthDate, selectedDate]);

  const BiorhythmBar = ({ label, value, cycle }: { label: string; value: number; cycle: string }) => {
    const percentage = (value + 100) / 2; // Convert -100 to 100 range to 0-100%

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {label}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getColorClasses(cycle, value)}`}>
              {getStatus(value)}
            </span>
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(value)}%
            </span>
          </div>
        </div>
        <div className={`relative h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className="w-px h-full bg-current opacity-50" style={{ marginLeft: '50%' }} />
          </div>
          <div
            className={`absolute top-0 h-full transition-all duration-500 ${
              value >= 0
                ? cycle === 'physical' ? 'bg-red-500' : cycle === 'emotional' ? 'bg-blue-500' : cycle === 'intellectual' ? 'bg-green-500' : 'bg-purple-500'
                : cycle === 'physical' ? 'bg-red-300' : cycle === 'emotional' ? 'bg-blue-300' : cycle === 'intellectual' ? 'bg-green-300' : 'bg-purple-300'
            }`}
            style={{
              left: value >= 0 ? '50%' : `${percentage}%`,
              width: `${Math.abs(value) / 2}%`,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-600'}`}>
            <Activity size={28} />
          </div>
          <div className="flex-1">
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.biorhythm.biorhythmCalculator', 'Biorhythm Calculator')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.biorhythm.trackYourPhysicalEmotionalAnd', 'Track your physical, emotional, and intellectual cycles')}
            </p>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <Info size={20} />
          </button>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className={`p-4 rounded-xl border mb-6 ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'}`}>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
              {t('tools.biorhythm.whatAreBiorhythms', 'What are Biorhythms?')}
            </h3>
            <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.biorhythm.biorhythmsAreCyclesThatBegin', 'Biorhythms are cycles that begin at birth and oscillate in a sine wave pattern. Each cycle affects different aspects of your life:')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(cycles).map(([key, cycle]) => (
                <div key={key} className={`text-sm p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                  <span className="font-medium">{cycle.name}</span> ({cycle.period} days)
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className={`p-6 rounded-xl border mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
            <label className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.biorhythm.yourBirthDate', 'Your Birth Date')}
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                setHasCalculated(false);
              }}
              max={new Date().toISOString().split('T')[0]}
              className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-teal-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
            />
            <button
              onClick={handleCalculate}
              disabled={!birthDate}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                birthDate
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {t('tools.biorhythm.calculate', 'Calculate')}
            </button>
          </div>
        </div>

        {/* Results */}
        {hasCalculated && biorhythm && (
          <div className="space-y-4">
            {/* Date Navigation */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <button
                onClick={() => handleDateChange(-1)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <ChevronLeft size={24} />
              </button>
              <div className="text-center">
                <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Day {biorhythm.daysSinceBirth.toLocaleString()} of your life
                </div>
              </div>
              <button
                onClick={() => handleDateChange(1)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Today Button */}
            <button
              onClick={() => setSelectedDate(new Date())}
              className={`w-full py-2 text-sm rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-800 border border-gray-700 text-teal-400 hover:bg-gray-700'
                  : 'bg-white border border-gray-200 text-teal-600 hover:bg-gray-50'
              }`}
            >
              {t('tools.biorhythm.jumpToToday', 'Jump to Today')}
            </button>

            {/* Biorhythm Bars */}
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.biorhythm.yourBiorhythmLevels', 'Your Biorhythm Levels')}
              </h3>
              <BiorhythmBar label="Physical" value={biorhythm.physical} cycle="physical" />
              <BiorhythmBar label="Emotional" value={biorhythm.emotional} cycle="emotional" />
              <BiorhythmBar label="Intellectual" value={biorhythm.intellectual} cycle="intellectual" />
              <BiorhythmBar label="Intuitive" value={biorhythm.intuitive} cycle="intuitive" />
            </div>

            {/* Weekly Overview */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.biorhythm.7DayOverview', '7-Day Overview')}
              </h3>
              <div className="overflow-x-auto">
                <div className="flex gap-2 min-w-max pb-2">
                  {weekData.map(({ date, data }, idx) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = date.toDateString() === selectedDate.toDateString();

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`p-3 rounded-lg text-center min-w-[80px] transition-all ${
                          isSelected
                            ? isDark
                              ? 'bg-teal-900/50 border-2 border-teal-500'
                              : 'bg-teal-50 border-2 border-teal-500'
                            : isDark
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`text-xs ${isToday ? (isDark ? 'text-teal-400' : 'text-teal-600') : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {date.getDate()}
                        </div>
                        <div className="flex justify-center gap-1 mt-2">
                          <div className={`w-2 h-2 rounded-full ${data.physical > 0 ? 'bg-red-500' : 'bg-red-300'}`} />
                          <div className={`w-2 h-2 rounded-full ${data.emotional > 0 ? 'bg-blue-500' : 'bg-blue-300'}`} />
                          <div className={`w-2 h-2 rounded-full ${data.intellectual > 0 ? 'bg-green-500' : 'bg-green-300'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Critical Days */}
            {getCriticalDays.length > 0 && (
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                  {t('tools.biorhythm.upcomingCriticalDays', 'Upcoming Critical Days')}
                </h3>
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.biorhythm.criticalDaysOccurWhenCycles', 'Critical days occur when cycles cross zero and may bring instability.')}
                </p>
                <div className="space-y-2">
                  {getCriticalDays.map(({ date, cycles }, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        isDark ? 'bg-gray-800/50' : 'bg-white/50'
                      }`}
                    >
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex gap-1">
                        {cycles.map((cycle, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isDark ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {cycle}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reset */}
            <button
              onClick={reset}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw size={18} />
              {t('tools.biorhythm.startOver', 'Start Over')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!hasCalculated && (
          <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <Activity size={64} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.biorhythm.enterYourBirthDate', 'Enter your birth date')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {t('tools.biorhythm.toCalculateYourBiorhythmCycles', 'to calculate your biorhythm cycles')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiorhythmTool;
