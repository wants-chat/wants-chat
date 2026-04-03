import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Share2, ChevronDown, ChevronUp, Users, Star, Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface LifePathResult {
  number: number;
  ismaster: boolean;
  meaning: string;
  traits: string[];
  compatibleNumbers: number[];
  famousPeople: string[];
  calculationSteps: CalculationStep[];
}

interface CalculationStep {
  label: string;
  value: string;
  result: number;
}

const LIFE_PATH_DATA: Record<number, {
  meaning: string;
  traits: string[];
  compatibleNumbers: number[];
  famousPeople: string[];
}> = {
  1: {
    meaning: 'The Leader - You are independent, ambitious, and a natural-born leader. You have strong willpower and the drive to achieve your goals. Innovation and originality are your strengths.',
    traits: ['Independent', 'Ambitious', 'Pioneering', 'Courageous', 'Self-reliant', 'Innovative'],
    compatibleNumbers: [3, 5, 6],
    famousPeople: ['Martin Luther King Jr.', 'Steve Jobs', 'Lady Gaga', 'Tom Hanks', 'Scarlett Johansson']
  },
  2: {
    meaning: 'The Peacemaker - You are diplomatic, sensitive, and cooperative. You excel at bringing harmony to relationships and situations. Partnership and collaboration are your natural domains.',
    traits: ['Diplomatic', 'Intuitive', 'Cooperative', 'Sensitive', 'Patient', 'Supportive'],
    compatibleNumbers: [4, 6, 8],
    famousPeople: ['Barack Obama', 'Jennifer Aniston', 'Kim Kardashian', 'Kanye West', 'Emma Watson']
  },
  3: {
    meaning: 'The Communicator - You are creative, expressive, and socially gifted. You have a natural talent for inspiring others through art, writing, or speaking. Joy and optimism define your path.',
    traits: ['Creative', 'Expressive', 'Optimistic', 'Artistic', 'Sociable', 'Inspiring'],
    compatibleNumbers: [1, 5, 9],
    famousPeople: ['David Bowie', 'Christina Aguilera', 'John Travolta', 'Snoop Dogg', 'Hillary Clinton']
  },
  4: {
    meaning: 'The Builder - You are practical, hardworking, and dependable. You excel at creating stable foundations and bringing ideas into reality. Discipline and determination are your hallmarks.',
    traits: ['Practical', 'Reliable', 'Organized', 'Hardworking', 'Loyal', 'Disciplined'],
    compatibleNumbers: [2, 6, 8],
    famousPeople: ['Oprah Winfrey', 'Elton John', 'Bill Gates', 'Usher', 'Adam Sandler']
  },
  5: {
    meaning: 'The Freedom Seeker - You are adventurous, versatile, and dynamic. Change and variety energize you. You thrive on new experiences and have a magnetic personality.',
    traits: ['Adventurous', 'Versatile', 'Dynamic', 'Curious', 'Progressive', 'Freedom-loving'],
    compatibleNumbers: [1, 3, 7],
    famousPeople: ['Beyonce', 'Angelina Jolie', 'Steven Spielberg', 'Mick Jagger', 'Vincent van Gogh']
  },
  6: {
    meaning: 'The Nurturer - You are caring, responsible, and family-oriented. You have a strong sense of duty and excel at creating harmony in your home and community. Love and service guide you.',
    traits: ['Nurturing', 'Responsible', 'Compassionate', 'Protective', 'Harmonious', 'Generous'],
    compatibleNumbers: [1, 2, 4, 9],
    famousPeople: ['John Lennon', 'Michael Jackson', 'Albert Einstein', 'Robert De Niro', 'Meryl Streep']
  },
  7: {
    meaning: 'The Seeker - You are introspective, analytical, and spiritually inclined. You have a deep desire for knowledge and truth. Wisdom and understanding are your lifelong pursuits.',
    traits: ['Analytical', 'Introspective', 'Spiritual', 'Wise', 'Intuitive', 'Philosophical'],
    compatibleNumbers: [5, 7, 9],
    famousPeople: ['Princess Diana', 'Leonardo DiCaprio', 'Johnny Depp', 'Julia Roberts', 'Muhammad Ali']
  },
  8: {
    meaning: 'The Powerhouse - You are ambitious, authoritative, and business-minded. You have natural leadership abilities and a talent for material success. Power and achievement drive you.',
    traits: ['Ambitious', 'Authoritative', 'Successful', 'Strategic', 'Confident', 'Powerful'],
    compatibleNumbers: [2, 4, 6],
    famousPeople: ['Sandra Bullock', 'Nelson Mandela', 'Pablo Picasso', 'Matt Damon', 'Halle Berry']
  },
  9: {
    meaning: 'The Humanitarian - You are compassionate, generous, and globally conscious. You have a deep desire to make the world a better place. Service to humanity defines your purpose.',
    traits: ['Humanitarian', 'Compassionate', 'Generous', 'Idealistic', 'Artistic', 'Wise'],
    compatibleNumbers: [3, 6, 7],
    famousPeople: ['Mother Teresa', 'Mahatma Gandhi', 'Elvis Presley', 'Jim Carrey', 'Dustin Hoffman']
  },
  11: {
    meaning: 'The Master Intuitive - You possess heightened intuition and spiritual insight. You are a visionary who can inspire others with your ideals. You have the potential to achieve illumination and enlightenment.',
    traits: ['Visionary', 'Intuitive', 'Inspiring', 'Idealistic', 'Spiritual', 'Charismatic'],
    compatibleNumbers: [2, 4, 6],
    famousPeople: ['Barack Obama', 'Michael Jordan', 'Bill Clinton', 'Prince William', 'Orlando Bloom']
  },
  22: {
    meaning: 'The Master Builder - You have the ability to turn dreams into reality on a grand scale. You combine vision with practical ability. You can achieve remarkable things that benefit humanity.',
    traits: ['Visionary', 'Practical', 'Ambitious', 'Powerful', 'Disciplined', 'Masterful'],
    compatibleNumbers: [4, 6, 8],
    famousPeople: ['Paul McCartney', 'Will Smith', 'Richard Branson', 'Bryan Adams', 'Tina Turner']
  },
  33: {
    meaning: 'The Master Teacher - You are the most spiritually evolved life path. You have a profound ability to uplift and heal others. Your purpose is to serve humanity through compassion and wisdom.',
    traits: ['Compassionate', 'Wise', 'Healing', 'Selfless', 'Nurturing', 'Enlightened'],
    compatibleNumbers: [6, 9, 11],
    famousPeople: ['Albert Einstein', 'Stephen King', 'Robert De Niro', 'Meryl Streep', 'Francis Ford Coppola']
  }
};

interface LifePathNumberToolProps {
  uiConfig?: UIConfig;
}

export const LifePathNumberTool: React.FC<LifePathNumberToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [result, setResult] = useState<LifePathResult | null>(null);
  const [showCalculation, setShowCalculation] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 3) {
        // Expect numbers as [month, day, year]
        setMonth(String(params.numbers[0]));
        setDay(String(params.numbers[1]));
        setYear(String(params.numbers[2]));
        setIsPrefilled(true);
      } else if (params.text || params.content) {
        // Try to parse a date string like "1990-05-15" or "May 15, 1990"
        const dateStr = params.text || params.content || '';
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          setDay(String(parsedDate.getDate()));
          setMonth(String(parsedDate.getMonth() + 1));
          setYear(String(parsedDate.getFullYear()));
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const reduceToSingleDigit = (num: number): { result: number; isMaster: boolean } => {
    // Check for master numbers
    if (num === 11 || num === 22 || num === 33) {
      return { result: num, isMaster: true };
    }

    let current = num;
    while (current > 9) {
      current = String(current)
        .split('')
        .reduce((sum, digit) => sum + parseInt(digit, 10), 0);

      // Check for master numbers after reduction
      if (current === 11 || current === 22 || current === 33) {
        return { result: current, isMaster: true };
      }
    }

    return { result: current, isMaster: false };
  };

  const calculateLifePath = () => {
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (!dayNum || !monthNum || !yearNum) {
      setValidationMessage('Please enter a valid birth date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (dayNum < 1 || dayNum > 31) {
      setValidationMessage('Please enter a valid day (1-31)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (monthNum < 1 || monthNum > 12) {
      setValidationMessage('Please enter a valid month (1-12)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setValidationMessage('Please enter a valid year');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const calculationSteps: CalculationStep[] = [];

    // Reduce day
    const daySum = String(dayNum).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
    const reducedDay = reduceToSingleDigit(daySum);
    calculationSteps.push({
      label: 'Day',
      value: `${dayNum} -> ${String(dayNum).split('').join(' + ')} = ${daySum}${daySum !== reducedDay.result ? ` -> ${reducedDay.result}` : ''}`,
      result: reducedDay.result
    });

    // Reduce month
    const monthSum = String(monthNum).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
    const reducedMonth = reduceToSingleDigit(monthSum);
    calculationSteps.push({
      label: 'Month',
      value: `${monthNum} -> ${String(monthNum).split('').join(' + ')} = ${monthSum}${monthSum !== reducedMonth.result ? ` -> ${reducedMonth.result}` : ''}`,
      result: reducedMonth.result
    });

    // Reduce year
    const yearSum = String(yearNum).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
    const reducedYear = reduceToSingleDigit(yearSum);
    calculationSteps.push({
      label: 'Year',
      value: `${yearNum} -> ${String(yearNum).split('').join(' + ')} = ${yearSum}${yearSum !== reducedYear.result ? ` -> ${reducedYear.result}` : ''}`,
      result: reducedYear.result
    });

    // Final calculation
    const totalSum = reducedDay.result + reducedMonth.result + reducedYear.result;
    const finalResult = reduceToSingleDigit(totalSum);
    calculationSteps.push({
      label: 'Life Path',
      value: `${reducedDay.result} + ${reducedMonth.result} + ${reducedYear.result} = ${totalSum}${totalSum !== finalResult.result ? ` -> ${finalResult.result}` : ''}`,
      result: finalResult.result
    });

    const lifePathNumber = finalResult.result;
    const data = LIFE_PATH_DATA[lifePathNumber];

    if (data) {
      setResult({
        number: lifePathNumber,
        ismaster: finalResult.isMaster,
        meaning: data.meaning,
        traits: data.traits,
        compatibleNumbers: data.compatibleNumbers,
        famousPeople: data.famousPeople,
        calculationSteps
      });
    }
  };

  const reset = () => {
    setDay('');
    setMonth('');
    setYear('');
    setResult(null);
    setShowCalculation(false);
  };

  const shareResult = async () => {
    if (!result) return;

    const shareText = `My Life Path Number is ${result.number}${result.ismaster ? ' (Master Number)' : ''}! ${result.meaning.split(' - ')[0]} - ${result.meaning.split(' - ')[1]?.split('.')[0] || ''}.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Life Path Number',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled or share failed
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setValidationMessage('Result copied to clipboard!');
      setTimeout(() => setValidationMessage(null), 3000);
    }).catch(() => {
      setValidationMessage('Failed to copy to clipboard');
      setTimeout(() => setValidationMessage(null), 3000);
    });
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.lifePathNumber.lifePathNumberCalculator', 'Life Path Number Calculator')}
            </h1>
            {isPrefilled && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                <span className="text-xs text-[#0D9488] font-medium">{t('tools.lifePathNumber.prefilled', 'Prefilled')}</span>
              </div>
            )}
          </div>

          {/* Date Inputs */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.lifePathNumber.enterYourBirthDate', 'Enter Your Birth Date')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.lifePathNumber.day2', 'Day')}
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="">{t('tools.lifePathNumber.day', 'Day')}</option>
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.lifePathNumber.month2', 'Month')}
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="">{t('tools.lifePathNumber.month', 'Month')}</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.lifePathNumber.year', 'Year')}
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder={t('tools.lifePathNumber.yyyy', 'YYYY')}
                  min="1900"
                  max={new Date().getFullYear()}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateLifePath}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.lifePathNumber.calculateLifePath', 'Calculate Life Path')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.lifePathNumber.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              {/* Main Number Display */}
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.lifePathNumber.bg0d948810', 'bg-[#0D9488]/10')
              }`}>
                <div className="text-center mb-4">
                  <div className="text-6xl font-bold text-[#0D9488] mb-2">
                    {result.number}
                  </div>
                  {result.ismaster && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full text-sm font-medium mb-2">
                      <Star className="w-4 h-4" />
                      {t('tools.lifePathNumber.masterNumber', 'Master Number')}
                    </div>
                  )}
                  <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {result.meaning.split(' - ')[0]}
                  </div>
                </div>

                <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {result.meaning.split(' - ').slice(1).join(' - ')}
                </p>
              </div>

              {/* Traits */}
              <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.lifePathNumber.keyTraits', 'Key Traits')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.traits.map((trait, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${
                          theme === 'dark'
                            ? t('tools.lifePathNumber.bg0d948820Text0d9488', 'bg-[#0D9488]/20 text-[#0D9488]') : t('tools.lifePathNumber.bg0d948810Text0d9488', 'bg-[#0D9488]/10 text-[#0D9488]')
                        }`}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Compatible Numbers */}
              <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Users className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.lifePathNumber.compatibleLifePaths', 'Compatible Life Paths')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {result.compatibleNumbers.map((num) => (
                      <div
                        key={num}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                          theme === 'dark'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-purple-100 text-purple-600'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Famous People */}
              <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Star className="w-5 h-5 text-amber-500" />
                    Famous People with Life Path {result.number}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.famousPeople.map((person, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-600 text-gray-200'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {person}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Calculation Breakdown */}
              <button
                onClick={() => setShowCalculation(!showCalculation)}
                className={`w-full flex items-center justify-between p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <Calculator className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.lifePathNumber.stepByStepCalculation', 'Step-by-Step Calculation')}
                  </span>
                </div>
                {showCalculation ? (
                  <ChevronUp className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                ) : (
                  <ChevronDown className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                )}
              </button>

              {showCalculation && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="space-y-3">
                    {result.calculationSteps.map((step, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {step.label}:
                        </span>
                        <div className="text-right">
                          <span className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {step.value}
                          </span>
                          <span className={`ml-2 font-bold ${
                            index === result.calculationSteps.length - 1
                              ? 'text-[#0D9488] text-lg'
                              : theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            = {step.result}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Button */}
              <button
                onClick={shareResult}
                className={`w-full flex items-center justify-center gap-2 p-4 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <Share2 className="w-5 h-5" />
                {t('tools.lifePathNumber.shareYourLifePathNumber', 'Share Your Life Path Number')}
              </button>
            </div>
          )}

          {/* Info Note */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              In numerology, your Life Path Number reveals your life's purpose and the path you are destined to walk.
              It is calculated by reducing your birth date to a single digit (1-9) or a Master Number (11, 22, 33).
            </p>
          </div>

          {/* Validation Toast */}
          {validationMessage && (
            <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg animate-fade-in ${
              validationMessage.includes('Failed') || validationMessage.includes('invalid')
                ? theme === 'dark' ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700'
                : theme === 'dark' ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-700'
            }`}>
              {validationMessage}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
}

export default LifePathNumberTool;
