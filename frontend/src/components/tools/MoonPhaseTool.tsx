import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, ChevronLeft, ChevronRight, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface MoonPhaseData {
  phaseName: string;
  illumination: number;
  moonAge: number;
  daysUntilFullMoon: number;
  daysUntilNewMoon: number;
  emoji: string;
}

interface PhaseInfo {
  name: string;
  description: string;
  significance: string;
}

const MOON_PHASES: PhaseInfo[] = [
  {
    name: 'New Moon',
    description: 'The Moon is between Earth and the Sun, so the side facing Earth is not illuminated.',
    significance: 'A time for new beginnings, setting intentions, and planting seeds for future growth.',
  },
  {
    name: 'Waxing Crescent',
    description: 'A sliver of the Moon becomes visible as it moves away from alignment with the Sun.',
    significance: 'A time for setting goals, gathering information, and making plans.',
  },
  {
    name: 'First Quarter',
    description: 'Half of the Moon is illuminated. The Moon is 90 degrees from the Sun.',
    significance: 'A time for taking action, making decisions, and overcoming obstacles.',
  },
  {
    name: 'Waxing Gibbous',
    description: 'More than half of the Moon is illuminated, growing toward full.',
    significance: 'A time for refining, adjusting, and preparing for culmination.',
  },
  {
    name: 'Full Moon',
    description: 'The Moon is fully illuminated, opposite the Sun from Earth.',
    significance: 'A time of heightened energy, completion, celebration, and revelation.',
  },
  {
    name: 'Waning Gibbous',
    description: 'The illumination begins to decrease after the full moon.',
    significance: 'A time for gratitude, sharing knowledge, and introspection.',
  },
  {
    name: 'Last Quarter',
    description: 'Half of the Moon is illuminated, but the opposite half from the first quarter.',
    significance: 'A time for release, letting go, and forgiveness.',
  },
  {
    name: 'Waning Crescent',
    description: 'Only a thin crescent of the Moon is visible before the new moon.',
    significance: 'A time for rest, reflection, and preparation for a new cycle.',
  },
];

const SYNODIC_MONTH = 29.53059; // Average lunar month in days

// Calculate moon phase data for a given date
const calculateMoonPhase = (date: Date): MoonPhaseData => {
  // Known new moon date: January 6, 2000 at 18:14 UTC
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));

  const daysSinceKnown = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const moonAge = ((daysSinceKnown % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;

  // Calculate illumination (approximate)
  const illumination = (1 - Math.cos((moonAge / SYNODIC_MONTH) * 2 * Math.PI)) / 2 * 100;

  // Determine phase name and emoji
  let phaseName: string;
  let emoji: string;

  if (moonAge < 1.85) {
    phaseName = 'New Moon';
    emoji = '\uD83C\uDF11'; // New moon emoji
  } else if (moonAge < 7.38) {
    phaseName = 'Waxing Crescent';
    emoji = '\uD83C\uDF12'; // Waxing crescent emoji
  } else if (moonAge < 9.23) {
    phaseName = 'First Quarter';
    emoji = '\uD83C\uDF13'; // First quarter emoji
  } else if (moonAge < 14.77) {
    phaseName = 'Waxing Gibbous';
    emoji = '\uD83C\uDF14'; // Waxing gibbous emoji
  } else if (moonAge < 16.61) {
    phaseName = 'Full Moon';
    emoji = '\uD83C\uDF15'; // Full moon emoji
  } else if (moonAge < 22.15) {
    phaseName = 'Waning Gibbous';
    emoji = '\uD83C\uDF16'; // Waning gibbous emoji
  } else if (moonAge < 24.00) {
    phaseName = 'Last Quarter';
    emoji = '\uD83C\uDF17'; // Last quarter emoji
  } else {
    phaseName = 'Waning Crescent';
    emoji = '\uD83C\uDF18'; // Waning crescent emoji
  }

  // Calculate days until next full moon (around day 14.77 of cycle)
  let daysUntilFullMoon = 14.77 - moonAge;
  if (daysUntilFullMoon < 0) {
    daysUntilFullMoon += SYNODIC_MONTH;
  }

  // Calculate days until next new moon (around day 0 / 29.53 of cycle)
  let daysUntilNewMoon = SYNODIC_MONTH - moonAge;
  if (daysUntilNewMoon >= SYNODIC_MONTH) {
    daysUntilNewMoon = 0;
  }

  return {
    phaseName,
    illumination: Math.round(illumination * 10) / 10,
    moonAge: Math.round(moonAge * 10) / 10,
    daysUntilFullMoon: Math.round(daysUntilFullMoon * 10) / 10,
    daysUntilNewMoon: Math.round(daysUntilNewMoon * 10) / 10,
    emoji,
  };
};

// Visual moon representation using SVG
const MoonVisual = ({ illumination, moonAge, theme }: { illumination: number; moonAge: number; theme: string }) => {
  // Determine if waxing (illumination increasing) or waning
  const isWaxing = moonAge <= SYNODIC_MONTH / 2;

  // Calculate the position of the terminator
  const normalizedIllumination = illumination / 100;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Moon background (dark side) */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill={theme === 'dark' ? '#1f2937' : '#374151'}
          stroke={theme === 'dark' ? '#4b5563' : '#6b7280'}
          strokeWidth="2"
        />

        {/* Illuminated portion */}
        {illumination > 0 && illumination < 100 && (
          <path
            d={(() => {
              const r = 45;
              const cx = 50;
              const cy = 50;

              // For waxing phases, illumination grows from right
              // For waning phases, illumination shrinks from right
              const phase = normalizedIllumination;

              // Calculate the x-radius of the inner ellipse for the terminator
              const innerRx = Math.abs(1 - 2 * phase) * r;

              if (isWaxing) {
                // Waxing: right side is lit
                if (phase < 0.5) {
                  // Less than half lit - crescent on right
                  return `M ${cx} ${cy - r}
                          A ${r} ${r} 0 0 1 ${cx} ${cy + r}
                          A ${innerRx} ${r} 0 0 0 ${cx} ${cy - r}`;
                } else {
                  // More than half lit - gibbous on right
                  return `M ${cx} ${cy - r}
                          A ${r} ${r} 0 0 1 ${cx} ${cy + r}
                          A ${innerRx} ${r} 0 0 1 ${cx} ${cy - r}`;
                }
              } else {
                // Waning: left side is lit
                if (phase > 0.5) {
                  // More than half lit - gibbous on left
                  return `M ${cx} ${cy - r}
                          A ${r} ${r} 0 0 0 ${cx} ${cy + r}
                          A ${innerRx} ${r} 0 0 0 ${cx} ${cy - r}`;
                } else {
                  // Less than half lit - crescent on left
                  return `M ${cx} ${cy - r}
                          A ${r} ${r} 0 0 0 ${cx} ${cy + r}
                          A ${innerRx} ${r} 0 0 1 ${cx} ${cy - r}`;
                }
              }
            })()}
            fill="#fef3c7"
          />
        )}

        {/* Full moon */}
        {illumination >= 100 && (
          <circle cx="50" cy="50" r="45" fill="#fef3c7" />
        )}

        {/* Crater details for realism */}
        <circle cx="35" cy="35" r="6" fill={theme === 'dark' ? '#374151' : '#4b5563'} opacity="0.3" />
        <circle cx="60" cy="45" r="8" fill={theme === 'dark' ? '#374151' : '#4b5563'} opacity="0.25" />
        <circle cx="45" cy="65" r="5" fill={theme === 'dark' ? '#374151' : '#4b5563'} opacity="0.2" />
        <circle cx="70" cy="30" r="4" fill={theme === 'dark' ? '#374151' : '#4b5563'} opacity="0.3" />
      </svg>
    </div>
  );
};

interface MoonPhaseToolProps {
  uiConfig?: UIConfig;
}

export const MoonPhaseTool: React.FC<MoonPhaseToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || '';
      if (textContent) {
        // Try to parse a date from the text
        const dateMatch = textContent.match(/\d{4}-\d{2}-\d{2}/) || textContent.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
        if (dateMatch) {
          const parsedDate = new Date(dateMatch[0]);
          if (!isNaN(parsedDate.getTime())) {
            setSelectedDate(parsedDate);
            setCalendarMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
            setIsPrefilled(true);
          }
        }
      }
    }
  }, [uiConfig?.params]);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [showMeanings, setShowMeanings] = useState(false);

  // Calculate moon phase for selected date
  const moonPhase = useMemo(() => calculateMoonPhase(selectedDate), [selectedDate]);

  // Get current phase info
  const currentPhaseInfo = useMemo(() => {
    return MOON_PHASES.find(p => p.name === moonPhase.phaseName) || MOON_PHASES[0];
  }, [moonPhase.phaseName]);

  // Generate calendar days for the month
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days: { date: Date; phase: MoonPhaseData; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        phase: calculateMoonPhase(date),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        phase: calculateMoonPhase(date),
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        phase: calculateMoonPhase(date),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [calendarMonth]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const handleCalendarDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCalendarMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInputDateValue = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isSelectedDate = (date: Date): boolean => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date): boolean => {
    return date.toDateString() === new Date().toDateString();
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.moonPhase.moonPhaseTracker', 'Moon Phase Tracker')}
            </h1>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.moonPhase.dateLoadedFromAiResponse', 'Date loaded from AI response')}</span>
            </div>
          )}

          {/* Date Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.moonPhase.selectDate', 'Select Date')}
            </label>
            <div className="flex gap-3">
              <input
                type="date"
                value={getInputDateValue(selectedDate)}
                onChange={handleDateChange}
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <button
                onClick={goToToday}
                className="px-4 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
              >
                {t('tools.moonPhase.today', 'Today')}
              </button>
            </div>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatDate(selectedDate)}
            </p>
          </div>

          {/* Main Moon Phase Display */}
          <div className={`p-6 rounded-lg mb-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600'
              : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200'
          }`}>
            <div className="text-center mb-6">
              <MoonVisual
                illumination={moonPhase.illumination}
                moonAge={moonPhase.moonAge}
                theme={theme}
              />
              <div className="text-5xl mt-4">{moonPhase.emoji}</div>
              <h2 className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {moonPhase.phaseName}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <div className={`text-2xl font-bold text-[#0D9488]`}>
                  {moonPhase.illumination}%
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('tools.moonPhase.illumination', 'Illumination')}
                </div>
              </div>
              <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <div className={`text-2xl font-bold text-[#0D9488]`}>
                  {moonPhase.moonAge}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('tools.moonPhase.moonAgeDays', 'Moon Age (days)')}
                </div>
              </div>
              <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <div className={`text-2xl font-bold text-[#0D9488]`}>
                  {moonPhase.daysUntilFullMoon}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('tools.moonPhase.daysToFullMoon', 'Days to Full Moon')}
                </div>
              </div>
              <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <div className={`text-2xl font-bold text-[#0D9488]`}>
                  {moonPhase.daysUntilNewMoon}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('tools.moonPhase.daysToNewMoon', 'Days to New Moon')}
                </div>
              </div>
            </div>
          </div>

          {/* Current Phase Description */}
          <div className={`p-4 rounded-lg mb-6 border-l-4 border-[#0D9488] ${
            theme === 'dark' ? 'bg-gray-700' : t('tools.moonPhase.bg0d948810', 'bg-[#0D9488]/10')
          }`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              About {currentPhaseInfo.name}
            </h3>
            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {currentPhaseInfo.description}
            </p>
            <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentPhaseInfo.significance}
            </p>
          </div>

          {/* Lunar Calendar */}
          <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-600 text-gray-300'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => navigateMonth('next')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-600 text-gray-300'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  className={`text-center text-xs font-medium py-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleCalendarDayClick(day.date)}
                  className={`p-2 rounded-lg text-center transition-colors ${
                    isSelectedDate(day.date)
                      ? 'bg-[#0D9488] text-white'
                      : isToday(day.date)
                        ? theme === 'dark'
                          ? t('tools.moonPhase.bgGray600TextWhite', 'bg-gray-600 text-white ring-2 ring-[#0D9488]') : t('tools.moonPhase.bgGray200TextGray', 'bg-gray-200 text-gray-900 ring-2 ring-[#0D9488]')
                        : day.isCurrentMonth
                          ? theme === 'dark'
                            ? 'hover:bg-gray-600 text-white'
                            : 'hover:bg-gray-200 text-gray-900'
                          : theme === 'dark'
                            ? 'text-gray-500 hover:bg-gray-600'
                            : 'text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-sm">{day.date.getDate()}</div>
                  <div className="text-lg leading-none">{day.phase.emoji}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Phase Meanings Toggle */}
          <button
            onClick={() => setShowMeanings(!showMeanings)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors mb-4 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            <Info className="w-5 h-5" />
            {showMeanings ? t('tools.moonPhase.hide', 'Hide') : t('tools.moonPhase.show', 'Show')} All Moon Phase Meanings
          </button>

          {/* All Phase Meanings */}
          {showMeanings && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {MOON_PHASES.map((phase, index) => (
                <div
                  key={phase.name}
                  className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  } ${phase.name === moonPhase.phaseName ? 'ring-2 ring-[#0D9488]' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {['\uD83C\uDF11', '\uD83C\uDF12', '\uD83C\uDF13', '\uD83C\uDF14', '\uD83C\uDF15', '\uD83C\uDF16', '\uD83C\uDF17', '\uD83C\uDF18'][index]}
                    </span>
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {phase.name}
                    </h4>
                  </div>
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {phase.description}
                  </p>
                  <p className={`text-xs italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {phase.significance}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Info Note */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.moonPhase.aboutMoonPhaseTracker', 'About Moon Phase Tracker')}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              This tool calculates the lunar phase for any date based on the synodic month (average 29.53 days).
              The moon phase is calculated using the known new moon date of January 6, 2000 as a reference point.
              Illumination percentages and phase transitions are approximations based on the lunar cycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoonPhaseTool;
