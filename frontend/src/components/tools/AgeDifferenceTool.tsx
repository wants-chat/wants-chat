import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, Heart, Clock, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface AgeDifferenceToolProps {
  uiConfig?: UIConfig;
}

export const AgeDifferenceTool: React.FC<AgeDifferenceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [date1, setDate1] = useState('1990-05-15');
  const [date2, setDate2] = useState('1995-08-22');
  const [name1, setName1] = useState('Person 1');
  const [name2, setName2] = useState('Person 2');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasPrefill = false;

      if (params.date) {
        setDate1(params.date);
        hasPrefill = true;
      }
      if (params.content) {
        setName1(params.content);
        hasPrefill = true;
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const now = new Date();

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      return null;
    }

    // Calculate ages
    const getAge = (birthDate: Date) => {
      let age = now.getFullYear() - birthDate.getFullYear();
      const monthDiff = now.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const age1 = getAge(d1);
    const age2 = getAge(d2);

    // Calculate difference
    const older = d1 < d2 ? d1 : d2;
    const younger = d1 < d2 ? d2 : d1;
    const olderName = d1 < d2 ? name1 : name2;
    const youngerName = d1 < d2 ? name2 : name1;

    let years = younger.getFullYear() - older.getFullYear();
    let months = younger.getMonth() - older.getMonth();
    let days = younger.getDate() - older.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(younger.getFullYear(), younger.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Total days difference
    const totalDays = Math.floor((younger.getTime() - older.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    // Fun facts
    const halfAgeRule = {
      min: Math.floor(age1 / 2) + 7,
      max: (age1 - 7) * 2,
    };

    // Same generation?
    const gen1 = getGeneration(d1.getFullYear());
    const gen2 = getGeneration(d2.getFullYear());

    return {
      age1,
      age2,
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      olderName,
      youngerName,
      halfAgeRule,
      gen1,
      gen2,
      sameGeneration: gen1.name === gen2.name,
    };
  }, [date1, date2, name1, name2]);

  function getGeneration(year: number) {
    if (year >= 2013) return { name: 'Gen Alpha', years: '2013-Present' };
    if (year >= 1997) return { name: 'Gen Z', years: '1997-2012' };
    if (year >= 1981) return { name: 'Millennial', years: '1981-1996' };
    if (year >= 1965) return { name: 'Gen X', years: '1965-1980' };
    if (year >= 1946) return { name: 'Baby Boomer', years: '1946-1964' };
    return { name: 'Silent Gen', years: '1928-1945' };
  }

  if (!calculations) return null;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg"><Users className="w-5 h-5 text-pink-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.ageDifference.ageDifferenceCalculator', 'Age Difference Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.ageDifference.compareAgesAndFindThe', 'Compare ages and find the difference')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.ageDifference.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Person 1 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.ageDifference.name', 'Name')}</label>
            <input
              type="text"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.ageDifference.birthdate', 'Birthdate')}</label>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Person 2 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.ageDifference.name2', 'Name')}</label>
            <input
              type="text"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.ageDifference.birthdate2', 'Birthdate')}</label>
            <input
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Current Ages */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{name1}</div>
            <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.age1}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.ageDifference.yearsOld', 'years old')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{name2}</div>
            <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.age2}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.ageDifference.yearsOld2', 'years old')}</div>
          </div>
        </div>

        {/* Age Difference */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {calculations.olderName} is older by
          </div>
          <div className="my-3">
            <span className="text-5xl font-bold text-pink-500">{calculations.years}</span>
            <span className={`text-2xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}> years</span>
            {calculations.months > 0 && (
              <>
                <span className="text-3xl font-bold text-pink-400 ml-2">{calculations.months}</span>
                <span className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}> months</span>
              </>
            )}
            {calculations.days > 0 && (
              <>
                <span className="text-2xl font-bold text-pink-300 ml-2">{calculations.days}</span>
                <span className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}> days</span>
              </>
            )}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Clock className="w-5 h-5 mx-auto mb-1 text-pink-500" />
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.totalDays.toLocaleString()}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.ageDifference.totalDays', 'total days')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Calendar className="w-5 h-5 mx-auto mb-1 text-pink-500" />
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.totalWeeks.toLocaleString()}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.ageDifference.totalWeeks', 'total weeks')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Calendar className="w-5 h-5 mx-auto mb-1 text-pink-500" />
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.totalMonths}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.ageDifference.totalMonths', 'total months')}</div>
          </div>
        </div>

        {/* Generations */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.ageDifference.generations', 'Generations')}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{name1}</div>
              <div className="text-pink-500">{calculations.gen1.name}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.gen1.years}</div>
            </div>
            <div>
              <div className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{name2}</div>
              <div className="text-pink-500">{calculations.gen2.name}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.gen2.years}</div>
            </div>
          </div>
          {calculations.sameGeneration && (
            <div className={`mt-3 text-sm text-center ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              {t('tools.ageDifference.sameGeneration', 'Same generation!')}
            </div>
          )}
        </div>

        {/* Fun Fact */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-pink-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.ageDifference.funFact', 'Fun Fact')}</h4>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            According to the "half your age plus 7" rule, {name1} (age {calculations.age1}) should date someone between ages {calculations.halfAgeRule.min} and {calculations.halfAgeRule.max}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeDifferenceTool;
