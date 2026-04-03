import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Cake, Calendar, Gift, PartyPopper } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface BirthdayCountdownToolProps {
  uiConfig?: UIConfig;
}

export const BirthdayCountdownTool: React.FC<BirthdayCountdownToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        // Try to parse date from content
        const parsedDate = new Date(params.content);
        if (!isNaN(parsedDate.getTime())) {
          setBirthMonth(parsedDate.getMonth() + 1);
          setBirthDay(parsedDate.getDate());
          setIsPrefilled(true);
        }
      } else if (params.text) {
        // Try to parse date from text (e.g., "January 15", "1/15")
        const dateMatch = params.text.match(/(\d{1,2})[\/\-](\d{1,2})/);
        if (dateMatch) {
          setBirthMonth(parseInt(dateMatch[1]));
          setBirthDay(parseInt(dateMatch[2]));
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const countdown = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Set birthday this year
    let nextBirthday = new Date(currentYear, birthMonth - 1, birthDay);

    // If birthday has passed this year, use next year
    if (nextBirthday < now) {
      nextBirthday = new Date(currentYear + 1, birthMonth - 1, birthDay);
    }

    const diff = nextBirthday.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Calculate age
    const birthYear = currentYear - (nextBirthday.getFullYear() === currentYear ? 0 : 1);
    const age = currentYear - birthYear + (nextBirthday.getFullYear() === currentYear + 1 ? 1 : 0);

    // Zodiac sign
    const zodiacSigns = [
      { name: 'Capricorn', dates: '12/22 - 1/19', emoji: '♑' },
      { name: 'Aquarius', dates: '1/20 - 2/18', emoji: '♒' },
      { name: 'Pisces', dates: '2/19 - 3/20', emoji: '♓' },
      { name: 'Aries', dates: '3/21 - 4/19', emoji: '♈' },
      { name: 'Taurus', dates: '4/20 - 5/20', emoji: '♉' },
      { name: 'Gemini', dates: '5/21 - 6/20', emoji: '♊' },
      { name: 'Cancer', dates: '6/21 - 7/22', emoji: '♋' },
      { name: 'Leo', dates: '7/23 - 8/22', emoji: '♌' },
      { name: 'Virgo', dates: '8/23 - 9/22', emoji: '♍' },
      { name: 'Libra', dates: '9/23 - 10/22', emoji: '♎' },
      { name: 'Scorpio', dates: '10/23 - 11/21', emoji: '♏' },
      { name: 'Sagittarius', dates: '11/22 - 12/21', emoji: '♐' },
    ];

    const getZodiac = () => {
      const zodiacs = [
        [20, 'Aquarius'], [19, 'Pisces'], [21, 'Aries'], [20, 'Taurus'],
        [21, 'Gemini'], [21, 'Cancer'], [23, 'Leo'], [23, 'Virgo'],
        [23, 'Libra'], [23, 'Scorpio'], [22, 'Sagittarius'], [22, 'Capricorn']
      ];
      const month = birthMonth - 1;
      return birthDay < (zodiacs[month][0] as number)
        ? zodiacs[(month + 11) % 12][1]
        : zodiacs[month][1];
    };

    const zodiac = zodiacSigns.find(z => z.name === getZodiac());

    // Day of week for birthday
    const dayOfWeek = nextBirthday.toLocaleDateString('en-US', { weekday: 'long' });

    const isBirthdayToday = days === 0 && hours < 24;

    return {
      days,
      hours,
      minutes,
      seconds,
      turningAge: age,
      zodiac,
      dayOfWeek,
      isBirthdayToday,
      nextBirthday,
    };
  }, [birthMonth, birthDay]);

  const funFacts = useMemo(() => {
    const facts = [
      `Your birthday falls on a ${countdown.dayOfWeek} this year!`,
      `You share your birthday with about 20 million other people.`,
      `${months[birthMonth - 1]} is a great month to be born!`,
      countdown.zodiac ? `Your zodiac sign is ${countdown.zodiac.name} ${countdown.zodiac.emoji}` : '',
    ];
    return facts.filter(Boolean);
  }, [countdown, birthMonth]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg"><Cake className="w-5 h-5 text-pink-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.birthdayCountdown.birthdayCountdown', 'Birthday Countdown')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.birthdayCountdown.countDownToYourSpecial', 'Count down to your special day')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.birthdayCountdown.month', 'Month')}</label>
            <select
              value={birthMonth}
              onChange={(e) => setBirthMonth(parseInt(e.target.value))}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {months.map((month, idx) => (
                <option key={month} value={idx + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.birthdayCountdown.day', 'Day')}</label>
            <select
              value={birthDay}
              onChange={(e) => setBirthDay(parseInt(e.target.value))}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {Array.from({ length: getDaysInMonth(birthMonth, new Date().getFullYear()) }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Birthday Today Message */}
        {countdown.isBirthdayToday ? (
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-gradient-to-r from-pink-900/30 to-purple-900/30' : 'bg-gradient-to-r from-pink-50 to-purple-50'}`}>
            <div className="text-6xl mb-3">🎂</div>
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.birthdayCountdown.happyBirthday', 'Happy Birthday! 🎉')}
            </h2>
            <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('tools.birthdayCountdown.haveAnAmazingDay', 'Have an amazing day!')}
            </p>
            <div className="flex justify-center gap-4 mt-4 text-3xl">
              <PartyPopper /> <Gift /> <Cake />
            </div>
          </div>
        ) : (
          <>
            {/* Countdown */}
            <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                {t('tools.birthdayCountdown.yourNextBirthdayIsOn', 'Your next birthday is on')}
              </div>
              <div className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                {countdown.nextBirthday.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-4xl font-bold text-pink-500">{countdown.days}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.birthdayCountdown.days', 'Days')}</div>
                </div>
                <div>
                  <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{countdown.hours}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.birthdayCountdown.hours', 'Hours')}</div>
                </div>
                <div>
                  <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{countdown.minutes}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.birthdayCountdown.minutes', 'Minutes')}</div>
                </div>
                <div>
                  <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{countdown.seconds}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.birthdayCountdown.seconds', 'Seconds')}</div>
                </div>
              </div>
            </div>

            {/* Zodiac & Info */}
            <div className="grid grid-cols-2 gap-4">
              {countdown.zodiac && (
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="text-4xl mb-1">{countdown.zodiac.emoji}</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{countdown.zodiac.name}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{countdown.zodiac.dates}</div>
                </div>
              )}
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="text-4xl mb-1">🎁</div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Turning {countdown.turningAge}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.birthdayCountdown.onYourNextBirthday', 'on your next birthday')}</div>
              </div>
            </div>
          </>
        )}

        {/* Fun Facts */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-pink-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.birthdayCountdown.funFacts', 'Fun Facts')}</h4>
          </div>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {funFacts.map((fact, idx) => (
              <li key={idx}>• {fact}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BirthdayCountdownTool;
