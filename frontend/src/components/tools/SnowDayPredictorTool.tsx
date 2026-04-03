import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Snowflake, School, Share2, Copy, RefreshCw, ThumbsUp, ThumbsDown, AlertCircle, Clock, MapPin, Calendar, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type DistrictType = 'urban' | 'suburban' | 'rural';
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface PredictionResult {
  probability: number;
  factors: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  verdict: string;
  emoji: string;
}

const districtTypes: { value: DistrictType; label: string; description: string }[] = [
  { value: 'urban', label: 'Urban', description: 'City schools with more resources' },
  { value: 'suburban', label: 'Suburban', description: 'Suburban area schools' },
  { value: 'rural', label: 'Rural', description: 'Rural schools with longer bus routes' },
];

const daysOfWeek: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const snowStartTimes = [
  { value: 'overnight', label: 'Overnight (before 5 AM)' },
  { value: 'early-morning', label: 'Early Morning (5 AM - 7 AM)' },
  { value: 'morning', label: 'Morning (7 AM - 9 AM)' },
  { value: 'mid-morning', label: 'Mid-Morning (9 AM - 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (after 12 PM)' },
];

const tips = [
  "Wear your pajamas inside out - it's a classic snow day ritual!",
  "Put a spoon under your pillow before bed for good luck.",
  "Flush ice cubes down the toilet (one for each inch you're hoping for!).",
  "Do a snow dance before bedtime!",
  "Sleep with a white crayon under your pillow.",
  "Place a white paper snowflake in your freezer.",
  "Run around the dinner table 5 times before bed.",
  "Leave a penny on the windowsill.",
];

interface SnowDayPredictorToolProps {
  uiConfig?: UIConfig;
}

export const SnowDayPredictorTool: React.FC<SnowDayPredictorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [snowfall, setSnowfall] = useState('');
  const [temperature, setTemperature] = useState('');
  const [snowStartTime, setSnowStartTime] = useState(snowStartTimes[0].value);
  const [districtType, setDistrictType] = useState<DistrictType>('suburban');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('monday');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSnowAnimation, setShowSnowAnimation] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  const isDark = theme === 'dark';

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setSnowfall(String(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setSnowfall(numMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const calculateProbability = () => {
    const inches = parseFloat(snowfall);
    const temp = parseFloat(temperature);

    if (isNaN(inches) || isNaN(temp)) {
      setValidationMessage('Please enter valid numbers for snowfall and temperature');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    let probability = 0;
    const factors: PredictionResult['factors'] = [];

    // Base probability from snowfall amount
    if (inches >= 12) {
      probability += 50;
      factors.push({
        name: 'Heavy Snowfall',
        impact: 'positive',
        description: `${inches}" of snow is a blizzard! Schools almost certainly closed.`,
      });
    } else if (inches >= 8) {
      probability += 40;
      factors.push({
        name: 'Significant Snowfall',
        impact: 'positive',
        description: `${inches}" of snow creates major travel difficulties.`,
      });
    } else if (inches >= 6) {
      probability += 30;
      factors.push({
        name: 'Moderate Snowfall',
        impact: 'positive',
        description: `${inches}" is enough to cause bus route concerns.`,
      });
    } else if (inches >= 4) {
      probability += 20;
      factors.push({
        name: 'Light-Moderate Snow',
        impact: 'positive',
        description: `${inches}" may delay opening but might not close schools.`,
      });
    } else if (inches >= 2) {
      probability += 10;
      factors.push({
        name: 'Light Snow',
        impact: 'neutral',
        description: `${inches}" usually means schools stay open.`,
      });
    } else {
      factors.push({
        name: 'Minimal Snow',
        impact: 'negative',
        description: `Less than 2" rarely closes schools.`,
      });
    }

    // Temperature factor
    if (temp <= 10) {
      probability += 15;
      factors.push({
        name: 'Extreme Cold',
        impact: 'positive',
        description: `${temp}°F is dangerously cold for students waiting at bus stops.`,
      });
    } else if (temp <= 20) {
      probability += 10;
      factors.push({
        name: 'Very Cold',
        impact: 'positive',
        description: `${temp}°F makes snow stick to roads and ice form.`,
      });
    } else if (temp >= 33) {
      probability -= 10;
      factors.push({
        name: 'Above Freezing',
        impact: 'negative',
        description: `${temp}°F means snow may melt quickly on roads.`,
      });
    } else {
      factors.push({
        name: 'Cold Enough',
        impact: 'neutral',
        description: `${temp}°F will keep the snow on the ground.`,
      });
    }

    // Snow start time factor
    if (snowStartTime === 'overnight') {
      probability += 15;
      factors.push({
        name: 'Overnight Snow',
        impact: 'positive',
        description: 'Snow starting overnight gives maximum accumulation before morning.',
      });
    } else if (snowStartTime === 'early-morning') {
      probability += 10;
      factors.push({
        name: 'Early Morning Snow',
        impact: 'positive',
        description: 'Early snow catches plows off guard during decision time.',
      });
    } else if (snowStartTime === 'morning') {
      probability += 5;
      factors.push({
        name: 'Morning Snow',
        impact: 'neutral',
        description: 'Decision may already be made, but could trigger early dismissal.',
      });
    } else if (snowStartTime === 'afternoon') {
      probability -= 5;
      factors.push({
        name: 'Afternoon Snow',
        impact: 'negative',
        description: 'Too late to cancel school, maybe early release.',
      });
    }

    // District type factor
    if (districtType === 'rural') {
      probability += 15;
      factors.push({
        name: 'Rural District',
        impact: 'positive',
        description: 'Longer bus routes on back roads are more dangerous in snow.',
      });
    } else if (districtType === 'urban') {
      probability -= 10;
      factors.push({
        name: 'Urban District',
        impact: 'negative',
        description: 'Cities have better plowing and many students walk.',
      });
    } else {
      factors.push({
        name: 'Suburban District',
        impact: 'neutral',
        description: 'Suburban districts are somewhere in between.',
      });
    }

    // Day of week factor
    if (dayOfWeek === 'friday') {
      probability += 5;
      factors.push({
        name: 'Friday Bonus',
        impact: 'positive',
        description: "Administrators love a long weekend too!",
      });
    } else if (dayOfWeek === 'monday') {
      probability -= 5;
      factors.push({
        name: 'Monday Penalty',
        impact: 'negative',
        description: "No one wants to start the week with a snow day (except students).",
      });
    } else if (dayOfWeek === 'saturday' || dayOfWeek === 'sunday') {
      probability = 0;
      factors.length = 0;
      factors.push({
        name: 'Weekend',
        impact: 'negative',
        description: "It's already the weekend! No school to cancel.",
      });
    }

    // Clamp probability
    probability = Math.min(Math.max(probability, 0), 100);

    // Determine verdict
    let verdict: string;
    let emoji: string;
    if (dayOfWeek === 'saturday' || dayOfWeek === 'sunday') {
      verdict = "It's the weekend! Enjoy the snow without worrying about school.";
      emoji = '🎉';
    } else if (probability >= 80) {
      verdict = "Start celebrating! It's almost definitely a snow day!";
      emoji = '🎉';
    } else if (probability >= 60) {
      verdict = "Looking good! There's a strong chance of a snow day.";
      emoji = '❄️';
    } else if (probability >= 40) {
      verdict = "It's a toss-up. Keep your fingers crossed!";
      emoji = '🤞';
    } else if (probability >= 20) {
      verdict = "Probably not, but stranger things have happened...";
      emoji = '😬';
    } else {
      verdict = "Sorry, better do that homework. School is likely on.";
      emoji = '📚';
    }

    setResult({ probability, factors, verdict, emoji });
    setShowSnowAnimation(true);
    setTimeout(() => setShowSnowAnimation(false), 3000);
  };

  const reset = () => {
    setSnowfall('');
    setTemperature('');
    setSnowStartTime(snowStartTimes[0].value);
    setDistrictType('suburban');
    setDayOfWeek('monday');
    setResult(null);
  };

  const handleShare = async () => {
    if (!result) return;

    const shareText = `Snow Day Prediction: ${result.probability}%! ${result.emoji}\n${result.verdict}\n\nFactors:\n${result.factors.map(f => `- ${f.name}: ${f.description}`).join('\n')}\n\n(Calculated with Snow Day Predictor - just for fun!)`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Snow Day Prediction',
          text: shareText,
        });
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        handleCopy(shareText);
      }
    } else {
      handleCopy(shareText);
    }
  };

  const handleCopy = async (text?: string) => {
    if (!result && !text) return;

    const copyText = text || `Snow Day Prediction: ${result!.probability}%! ${result!.emoji}\n${result!.verdict}`;

    try {
      await navigator.clipboard.writeText(copyText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getRandomTip = () => {
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 80) return '#10b981'; // green
    if (prob >= 60) return '#3b82f6'; // blue
    if (prob >= 40) return '#f59e0b'; // amber
    if (prob >= 20) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Snow Animation Overlay */}
        {showSnowAnimation && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <Snowflake
                key={i}
                className="absolute text-blue-200 animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  opacity: 0.6 + Math.random() * 0.4,
                  width: `${16 + Math.random() * 24}px`,
                  height: `${16 + Math.random() * 24}px`,
                }}
              />
            ))}
          </div>
        )}

        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Snowflake className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                  {t('tools.snowDayPredictor.snowDayPredictor', 'Snow Day Predictor')}
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  {t('tools.snowDayPredictor.willSchoolBeCancelledFind', 'Will school be cancelled? Find out the chances!')}
                </CardDescription>

                {isPrefilled && (
                  <div className="flex items-center gap-2 px-4 py-2 mt-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
                    <Sparkles className="w-4 h-4 text-[#0D9488]" />
                    <span className="text-sm text-[#0D9488] font-medium">{t('tools.snowDayPredictor.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
                  </div>
                )}
              </div>
              <School className={`w-6 h-6 ml-auto ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Snowfall Input */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Snowflake className="w-4 h-4 text-blue-500" />
                {t('tools.snowDayPredictor.expectedSnowfallInches', 'Expected Snowfall (inches)')}
              </label>
              <input
                type="number"
                value={snowfall}
                onChange={(e) => setSnowfall(e.target.value)}
                placeholder="e.g., 6"
                step="0.5"
                min="0"
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Temperature Input */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.snowDayPredictor.currentExpectedTemperatureF', 'Current/Expected Temperature (°F)')}
              </label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="e.g., 28"
                step="1"
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Snow Start Time */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Clock className="w-4 h-4 text-blue-500" />
                {t('tools.snowDayPredictor.whenDoesSnowStart', 'When does snow start?')}
              </label>
              <select
                value={snowStartTime}
                onChange={(e) => setSnowStartTime(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                {snowStartTimes.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>

            {/* District Type */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <MapPin className="w-4 h-4 text-blue-500" />
                {t('tools.snowDayPredictor.schoolDistrictType', 'School District Type')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {districtTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setDistrictType(type.value)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all text-center ${
                      districtType === type.value
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Day of Week */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Calendar className="w-4 h-4 text-blue-500" />
                {t('tools.snowDayPredictor.dayOfTheWeek', 'Day of the Week')}
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                {daysOfWeek.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={calculateProbability}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Snowflake className="w-5 h-5" />
                {t('tools.snowDayPredictor.predictSnowDay', 'Predict Snow Day')}
              </button>
              <button
                onClick={reset}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* Result Display */}
            {result && (
              <div className="space-y-4 animate-in fade-in duration-500">
                {/* Probability Display */}
                <div
                  className="p-6 rounded-xl text-center relative overflow-hidden"
                  style={{
                    backgroundColor: `${getProbabilityColor(result.probability)}15`,
                    borderLeft: `4px solid ${getProbabilityColor(result.probability)}`,
                  }}
                >
                  <div className="absolute top-2 right-2 text-4xl">{result.emoji}</div>
                  <div
                    className="text-6xl font-bold mb-2"
                    style={{ color: getProbabilityColor(result.probability) }}
                  >
                    {result.probability}%
                  </div>
                  <div className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.snowDayPredictor.snowDayProbability', 'Snow Day Probability')}
                  </div>
                  <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {result.verdict}
                  </div>
                </div>

                {/* Factors */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.snowDayPredictor.factorsAffectingYourPrediction', 'Factors Affecting Your Prediction')}
                  </h3>
                  <div className="space-y-3">
                    {result.factors.map((factor, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          isDark ? 'bg-gray-600/50' : 'bg-white'
                        }`}
                      >
                        <div className="mt-0.5">
                          {factor.impact === 'positive' ? (
                            <ThumbsUp className="w-5 h-5 text-green-500" />
                          ) : factor.impact === 'negative' ? (
                            <ThumbsDown className="w-5 h-5 text-red-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {factor.name}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {factor.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Snow Day Tips */}
                <div className={`p-4 rounded-xl border-2 border-dashed ${
                  isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
                }`}>
                  <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Snowflake className="w-4 h-4 text-blue-500" />
                    {t('tools.snowDayPredictor.snowDaySuperstitionTip', 'Snow Day Superstition Tip')}
                  </h3>
                  <p className={`text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    "{getRandomTip()}"
                  </p>
                </div>

                {/* Share Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    {t('tools.snowDayPredictor.shareResult', 'Share Result')}
                  </button>
                  <button
                    onClick={() => handleCopy()}
                    className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                      copySuccess
                        ? 'bg-green-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Copy className="w-5 h-5" />
                    {copySuccess ? t('tools.snowDayPredictor.copied', 'Copied!') : t('tools.snowDayPredictor.copy', 'Copy')}
                  </button>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className={`p-4 rounded-xl text-center ${
              isDark ? 'bg-gray-700/50' : 'bg-gray-100'
            }`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <AlertCircle className="w-3 h-3 inline mr-1" />
                This is just for fun and entertainment! Actual school closings depend on many factors
                and are decided by school administrators. Always check official announcements from your school district.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SnowDayPredictorTool;
