import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, AlertCircle, ChevronRight, ChevronLeft, RotateCcw, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ToolContainer } from './ToolContainer';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useTheme } from '../../contexts/ThemeContext';

type TestType = 'snellen' | 'colorBlind' | 'astigmatism';
type VisionRating = '20/200' | '20/100' | '20/70' | '20/50' | '20/40' | '20/30' | '20/25' | '20/20';

interface SnellenLine {
  letters: string;
  size: number;
  rating: VisionRating;
  lineNumber: number;
}

interface ColorBlindPlate {
  id: number;
  backgroundColor: string;
  dotColors: { color: string; isNumber: boolean }[];
  correctAnswer: string;
  numberPattern: number[][];
}

interface TestResult {
  snellenRating: VisionRating | null;
  colorBlindResults: { plateId: number; passed: boolean }[];
  astigmatismConcern: boolean | null;
}

const SNELLEN_LINES: SnellenLine[] = [
  { letters: 'E', size: 72, rating: '20/200', lineNumber: 1 },
  { letters: 'FP', size: 60, rating: '20/100', lineNumber: 2 },
  { letters: 'TOZ', size: 48, rating: '20/70', lineNumber: 3 },
  { letters: 'LPED', size: 36, rating: '20/50', lineNumber: 4 },
  { letters: 'PECFD', size: 28, rating: '20/40', lineNumber: 5 },
  { letters: 'EDFCZP', size: 22, rating: '20/30', lineNumber: 6 },
  { letters: 'FELOPZD', size: 18, rating: '20/25', lineNumber: 7 },
  { letters: 'DEFPOTEC', size: 14, rating: '20/20', lineNumber: 8 },
];

// Simplified Ishihara-style color blind test plates
const COLOR_BLIND_PLATES: ColorBlindPlate[] = [
  {
    id: 1,
    backgroundColor: '#8B9A6C',
    dotColors: [
      { color: '#E57373', isNumber: true },
      { color: '#81C784', isNumber: false },
    ],
    correctAnswer: '12',
    numberPattern: [],
  },
  {
    id: 2,
    backgroundColor: '#A5D6A7',
    dotColors: [
      { color: '#E57373', isNumber: true },
      { color: '#81C784', isNumber: false },
    ],
    correctAnswer: '8',
    numberPattern: [],
  },
  {
    id: 3,
    backgroundColor: '#90CAF9',
    dotColors: [
      { color: '#FF8A65', isNumber: true },
      { color: '#64B5F6', isNumber: false },
    ],
    correctAnswer: '6',
    numberPattern: [],
  },
  {
    id: 4,
    backgroundColor: '#CE93D8',
    dotColors: [
      { color: '#4DB6AC', isNumber: true },
      { color: '#BA68C8', isNumber: false },
    ],
    correctAnswer: '29',
    numberPattern: [],
  },
];

interface VisionTestToolProps {
  uiConfig?: UIConfig;
}

export const VisionTestTool = ({ uiConfig }: VisionTestToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTest, setActiveTest] = useState<TestType>('snellen');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        testType?: string;
      };
      if (params.testType && ['snellen', 'colorBlind', 'astigmatism'].includes(params.testType)) {
        setActiveTest(params.testType as TestType);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);
  const [currentSnellenLine, setCurrentSnellenLine] = useState(0);
  const [currentColorPlate, setCurrentColorPlate] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [testResult, setTestResult] = useState<TestResult>({
    snellenRating: null,
    colorBlindResults: [],
    astigmatismConcern: null,
  });
  const [colorBlindAnswer, setColorBlindAnswer] = useState('');
  const [showResults, setShowResults] = useState(false);

  const resetTest = () => {
    setCurrentSnellenLine(0);
    setCurrentColorPlate(0);
    setTestStarted(false);
    setShowInstructions(true);
    setTestResult({
      snellenRating: null,
      colorBlindResults: [],
      astigmatismConcern: null,
    });
    setColorBlindAnswer('');
    setShowResults(false);
  };

  const handleSnellenCanRead = (canRead: boolean) => {
    if (canRead) {
      if (currentSnellenLine < SNELLEN_LINES.length - 1) {
        setCurrentSnellenLine(currentSnellenLine + 1);
      } else {
        // Reached the smallest line
        setTestResult((prev) => ({
          ...prev,
          snellenRating: SNELLEN_LINES[currentSnellenLine].rating,
        }));
        setShowResults(true);
      }
    } else {
      // Record the last readable line
      const rating = currentSnellenLine > 0
        ? SNELLEN_LINES[currentSnellenLine - 1].rating
        : '20/200';
      setTestResult((prev) => ({
        ...prev,
        snellenRating: rating,
      }));
      setShowResults(true);
    }
  };

  const handleColorBlindAnswer = () => {
    const isCorrect = colorBlindAnswer.trim() === COLOR_BLIND_PLATES[currentColorPlate].correctAnswer;
    const newResults = [
      ...testResult.colorBlindResults,
      { plateId: COLOR_BLIND_PLATES[currentColorPlate].id, passed: isCorrect },
    ];

    setTestResult((prev) => ({
      ...prev,
      colorBlindResults: newResults,
    }));

    setColorBlindAnswer('');

    if (currentColorPlate < COLOR_BLIND_PLATES.length - 1) {
      setCurrentColorPlate(currentColorPlate + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleAstigmatismResponse = (hasConcern: boolean) => {
    setTestResult((prev) => ({
      ...prev,
      astigmatismConcern: hasConcern,
    }));
    setShowResults(true);
  };

  const generateColorBlindDots = (plate: ColorBlindPlate) => {
    const dots = [];
    const centerX = 100;
    const centerY = 100;
    const radius = 85;

    // Generate random dots
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.sqrt(Math.random()) * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      const dotRadius = 4 + Math.random() * 6;

      // Determine if this dot should be part of the number
      const isNumberDot = isPartOfNumber(x - centerX, y - centerY, plate.correctAnswer);
      const color = isNumberDot
        ? plate.dotColors[0].color
        : plate.dotColors[1].color;

      dots.push(
        <circle
          key={i}
          cx={x}
          cy={y}
          r={dotRadius}
          fill={color}
          opacity={0.9}
        />
      );
    }

    return dots;
  };

  const isPartOfNumber = (x: number, y: number, number: string): boolean => {
    // Simplified pattern matching for numbers
    const patterns: Record<string, (x: number, y: number) => boolean> = {
      '12': (x, y) => {
        // "1" on left, "2" on right
        const inOne = x > -40 && x < -20 && y > -30 && y < 30;
        const inTwo = (x > 10 && x < 40 && y > -30 && y < -20) ||
                      (x > 25 && x < 40 && y > -25 && y < 5) ||
                      (x > 10 && x < 40 && y > -5 && y < 5) ||
                      (x > 10 && x < 25 && y > 0 && y < 25) ||
                      (x > 10 && x < 40 && y > 20 && y < 30);
        return inOne || inTwo;
      },
      '8': (x, y) => {
        // Figure 8 pattern
        const dist = Math.sqrt(x * x + y * y);
        const topCircle = Math.sqrt(x * x + (y + 25) ** 2);
        const bottomCircle = Math.sqrt(x * x + (y - 25) ** 2);
        return (topCircle > 15 && topCircle < 30) || (bottomCircle > 15 && bottomCircle < 30);
      },
      '6': (x, y) => {
        const circle = Math.sqrt(x * x + (y - 15) ** 2);
        const stem = x > -5 && x < 5 && y > -35 && y < 0;
        return (circle > 15 && circle < 30) || stem;
      },
      '29': (x, y) => {
        // "2" on left, "9" on right
        const inTwo = (x > -40 && x < -10 && y > -30 && y < -20) ||
                      (x > -25 && x < -10 && y > -25 && y < 5) ||
                      (x > -40 && x < -10 && y > -5 && y < 5) ||
                      (x > -40 && x < -25 && y > 0 && y < 25) ||
                      (x > -40 && x < -10 && y > 20 && y < 30);
        const nineCircle = Math.sqrt((x - 25) ** 2 + (y + 10) ** 2);
        const nineStem = x > 20 && x < 30 && y > -5 && y < 35;
        return inTwo || (nineCircle > 12 && nineCircle < 25) || nineStem;
      },
    };

    return patterns[number]?.(x, y) ?? false;
  };

  const renderDisclaimer = () => (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-amber-500 font-semibold mb-1">{t('tools.visionTest.importantDisclaimer', 'Important Disclaimer')}</h4>
          <p className="text-amber-400/80 text-sm">
            This is a screening tool only and is <strong>{t('tools.visionTest.notAReplacementForA', 'NOT a replacement for a professional eye exam')}</strong>.
            Results are approximate and should not be used for diagnosis. Please consult a licensed
            optometrist or ophthalmologist for accurate vision testing and any concerns about your eye health.
          </p>
        </div>
      </div>
    </div>
  );

  const renderInstructions = () => (
    <Card className={isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}>
      <CardHeader>
        <CardTitle className={`${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
          <Eye className="w-5 h-5 text-[#0D9488]" />
          {activeTest === 'snellen' && 'Snellen Chart Test Instructions'}
          {activeTest === 'colorBlind' && 'Color Blindness Test Instructions'}
          {activeTest === 'astigmatism' && 'Astigmatism Test Instructions'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeTest === 'snellen' && (
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} space-y-3`}>
            <p><strong>{t('tools.visionTest.testingDistance', 'Testing Distance:')}</strong> {t('tools.visionTest.positionYourself20Feet6', 'Position yourself 20 feet (6 meters) away from your screen, or approximately 10-14 feet for typical monitors.')}</p>
            <p><strong>{t('tools.visionTest.screenSettings', 'Screen Settings:')}</strong> {t('tools.visionTest.ensureYourScreenBrightnessIs', 'Ensure your screen brightness is at a comfortable level and there is no glare.')}</p>
            <p><strong>{t('tools.visionTest.coverOneEye', 'Cover One Eye:')}</strong> {t('tools.visionTest.testEachEyeSeparatelyBy', 'Test each eye separately by covering the other eye completely (without pressing on it).')}</p>
            <p><strong>{t('tools.visionTest.howToTakeTheTest', 'How to Take the Test:')}</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{t('tools.visionTest.readEachLineOfLetters', 'Read each line of letters starting from the largest')}</li>
              <li>{t('tools.visionTest.clickICanReadThis', 'Click "I Can Read This" if you can clearly identify all letters')}</li>
              <li>{t('tools.visionTest.clickICannotReadThis', 'Click "I Cannot Read This" when the letters become too blurry to identify')}</li>
            </ul>
          </div>
        )}
        {activeTest === 'colorBlind' && (
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} space-y-3`}>
            <p><strong>{t('tools.visionTest.lighting', 'Lighting:')}</strong> {t('tools.visionTest.viewInNaturalOrWell', 'View in natural or well-lit conditions. Avoid colored lighting.')}</p>
            <p><strong>{t('tools.visionTest.screenCalibration', 'Screen Calibration:')}</strong> {t('tools.visionTest.forAccurateResultsYourScreen', 'For accurate results, your screen should display colors correctly.')}</p>
            <p><strong>{t('tools.visionTest.howToTakeTheTest2', 'How to Take the Test:')}</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{t('tools.visionTest.lookAtEachPlateAnd', 'Look at each plate and identify the number you see')}</li>
              <li>{t('tools.visionTest.typeTheNumberIntoThe', 'Type the number into the input field')}</li>
              <li>{t('tools.visionTest.ifYouCannotSeeAny', 'If you cannot see any number, type "none"')}</li>
            </ul>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.visionTest.noteThisIsASimplified', 'Note: This is a simplified simulation. Actual Ishihara tests use specific color calibrations.')}</p>
          </div>
        )}
        {activeTest === 'astigmatism' && (
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} space-y-3`}>
            <p><strong>{t('tools.visionTest.distance', 'Distance:')}</strong> {t('tools.visionTest.viewTheWheelFromArm', 'View the wheel from arm\'s length (about 14 inches / 35 cm).')}</p>
            <p><strong>{t('tools.visionTest.focus', 'Focus:')}</strong> {t('tools.visionTest.lookAtTheCenterOf', 'Look at the center of the wheel.')}</p>
            <p><strong>{t('tools.visionTest.coverOneEye2', 'Cover One Eye:')}</strong> {t('tools.visionTest.testEachEyeSeparately', 'Test each eye separately.')}</p>
            <p><strong>{t('tools.visionTest.whatToLookFor', 'What to Look For:')}</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{t('tools.visionTest.allLinesShouldAppearEqually', 'All lines should appear equally dark and sharp')}</li>
              <li>{t('tools.visionTest.ifSomeLinesAppearDarker', 'If some lines appear darker, blacker, or more distinct than others, this may indicate astigmatism')}</li>
            </ul>
          </div>
        )}
        <button
          onClick={() => {
            setShowInstructions(false);
            setTestStarted(true);
          }}
          className="w-full mt-4 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Start Test
          <ChevronRight className="w-5 h-5" />
        </button>
      </CardContent>
    </Card>
  );

  const renderSnellenTest = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-8 min-h-[300px] flex flex-col items-center justify-center">
        <p className="text-gray-500 text-sm mb-4">Line {SNELLEN_LINES[currentSnellenLine].lineNumber} of {SNELLEN_LINES.length}</p>
        <div
          className="text-black font-bold tracking-widest text-center"
          style={{
            fontSize: `${SNELLEN_LINES[currentSnellenLine].size}px`,
            letterSpacing: `${SNELLEN_LINES[currentSnellenLine].size / 4}px`
          }}
        >
          {SNELLEN_LINES[currentSnellenLine].letters}
        </div>
        <p className="text-gray-400 text-xs mt-4">
          Vision rating if readable: {SNELLEN_LINES[currentSnellenLine].rating}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleSnellenCanRead(false)}
          className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          {t('tools.visionTest.iCannotReadThis', 'I Cannot Read This')}
        </button>
        <button
          onClick={() => handleSnellenCanRead(true)}
          className="flex-1 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          {t('tools.visionTest.iCanReadThis', 'I Can Read This')}
        </button>
      </div>

      {currentSnellenLine > 0 && (
        <button
          onClick={() => setCurrentSnellenLine(currentSnellenLine - 1)}
          className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          {t('tools.visionTest.goBackToPreviousLine', 'Go Back to Previous Line')}
        </button>
      )}
    </div>
  );

  const renderColorBlindTest = () => (
    <div className="space-y-6">
      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center`}>
        Plate {currentColorPlate + 1} of {COLOR_BLIND_PLATES.length}
      </p>

      <div className="flex justify-center">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="rounded-full"
          style={{ backgroundColor: COLOR_BLIND_PLATES[currentColorPlate].backgroundColor }}
        >
          {generateColorBlindDots(COLOR_BLIND_PLATES[currentColorPlate])}
        </svg>
      </div>

      <div className="space-y-3">
        <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('tools.visionTest.whatNumberDoYouSee', 'What number do you see? (Type "none" if you cannot see a number)')}
        </label>
        <input
          type="text"
          value={colorBlindAnswer}
          onChange={(e) => setColorBlindAnswer(e.target.value)}
          placeholder={t('tools.visionTest.enterTheNumberYouSee', 'Enter the number you see')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] ${
            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <button
          onClick={handleColorBlindAnswer}
          disabled={!colorBlindAnswer.trim()}
          className="w-full px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {t('tools.visionTest.submitAnswer', 'Submit Answer')}
        </button>
      </div>
    </div>
  );

  const renderAstigmatismTest = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-8 flex justify-center">
        <svg width="250" height="250" viewBox="0 0 250 250">
          {/* Astigmatism wheel - radial lines */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 125 + 20 * Math.cos(angle);
            const y1 = 125 + 20 * Math.sin(angle);
            const x2 = 125 + 110 * Math.cos(angle);
            const y2 = 125 + 110 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="black"
                strokeWidth="3"
              />
            );
          })}
          {/* Center circle */}
          <circle cx="125" cy="125" r="15" fill="black" />
          {/* Outer circle */}
          <circle cx="125" cy="125" r="115" fill="none" stroke="black" strokeWidth="2" />
        </svg>
      </div>

      <div className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-700'} space-y-2`}>
        <p>{t('tools.visionTest.focusOnTheCenterDot', 'Focus on the center dot. Do all lines appear equally dark and sharp?')}</p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.visionTest.ifSomeLinesAppearDarker2', 'If some lines appear darker or more distinct than others, you may have astigmatism.')}</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleAstigmatismResponse(true)}
          className="flex-1 px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 font-medium rounded-lg transition-colors"
        >
          {t('tools.visionTest.someLinesLookDifferent', 'Some Lines Look Different')}
        </button>
        <button
          onClick={() => handleAstigmatismResponse(false)}
          className="flex-1 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-medium rounded-lg transition-colors"
        >
          {t('tools.visionTest.allLinesLookTheSame', 'All Lines Look the Same')}
        </button>
      </div>
    </div>
  );

  const renderResults = () => {
    const colorBlindPassed = testResult.colorBlindResults.filter(r => r.passed).length;
    const colorBlindTotal = testResult.colorBlindResults.length;

    return (
      <div className="space-y-6">
        <Card className={isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.visionTest.yourTestResults', 'Your Test Results')}</CardTitle>
            <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {t('tools.visionTest.rememberTheseResultsAreApproximate', 'Remember: These results are approximate and for screening purposes only.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeTest === 'snellen' && testResult.snellenRating && (
              <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.visionTest.visualAcuity', 'Visual Acuity')}</h4>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-[#0D9488]">
                    {testResult.snellenRating}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {testResult.snellenRating === '20/20' && 'Excellent! You have normal visual acuity.'}
                    {testResult.snellenRating === '20/25' && 'Very good vision. Near-normal acuity.'}
                    {testResult.snellenRating === '20/30' && 'Good vision. You may benefit from corrective lenses for certain activities.'}
                    {testResult.snellenRating === '20/40' && 'Below average. Corrective lenses recommended. This is the minimum for driving in most US states.'}
                    {testResult.snellenRating === '20/50' && 'Moderate vision impairment. Corrective lenses recommended.'}
                    {testResult.snellenRating === '20/70' && 'Significant vision impairment. Professional exam strongly recommended.'}
                    {testResult.snellenRating === '20/100' && 'Poor vision. Please see an eye care professional.'}
                    {testResult.snellenRating === '20/200' && 'Severe vision impairment. Please see an eye care professional immediately.'}
                  </div>
                </div>
              </div>
            )}

            {activeTest === 'colorBlind' && colorBlindTotal > 0 && (
              <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.visionTest.colorVision', 'Color Vision')}</h4>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-[#0D9488]">
                    {colorBlindPassed}/{colorBlindTotal}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {colorBlindPassed === colorBlindTotal && 'You correctly identified all plates. Your color vision appears normal.'}
                    {colorBlindPassed < colorBlindTotal && colorBlindPassed > colorBlindTotal / 2 && 'You missed some plates. You may have mild color vision deficiency.'}
                    {colorBlindPassed <= colorBlindTotal / 2 && 'You may have color vision deficiency. Please consult an eye care professional for proper testing.'}
                  </div>
                </div>
              </div>
            )}

            {activeTest === 'astigmatism' && testResult.astigmatismConcern !== null && (
              <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.visionTest.astigmatismScreening', 'Astigmatism Screening')}</h4>
                <div className="flex items-center gap-4">
                  <div className={`text-4xl font-bold ${testResult.astigmatismConcern ? 'text-amber-500' : 'text-green-500'}`}>
                    {testResult.astigmatismConcern ? t('tools.visionTest.possible', 'Possible') : t('tools.visionTest.unlikely', 'Unlikely')}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {testResult.astigmatismConcern
                      ? t('tools.visionTest.youMayHaveAstigmatismThis', 'You may have astigmatism. This is very common and easily correctable. Please see an eye care professional for confirmation.') : t('tools.visionTest.basedOnThisScreeningAstigmatism', 'Based on this screening, astigmatism is unlikely. However, only a professional exam can confirm.')}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendation */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-semibold mb-1">{t('tools.visionTest.recommendation', 'Recommendation')}</h4>
              <p className="text-blue-300/80 text-sm">
                We strongly recommend scheduling a comprehensive eye exam with a licensed optometrist or
                ophthalmologist. Professional exams can detect conditions this screening cannot, including
                glaucoma, cataracts, macular degeneration, and other eye health issues. Adults should have
                an eye exam at least every 1-2 years.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={resetTest}
          className={`w-full px-6 py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          {t('tools.visionTest.takeAnotherTest', 'Take Another Test')}
        </button>
      </div>
    );
  };

  return (
    <ToolContainer
      title={t('tools.visionTest.visionScreeningTool', 'Vision Screening Tool')}
      description="At-home vision screening for visual acuity, color blindness, and astigmatism"
      icon={Eye}
    >
      <div className="space-y-6">
        {renderDisclaimer()}

        {/* Test Type Selector */}
        {!testStarted && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setActiveTest('snellen');
                resetTest();
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTest === 'snellen'
                  ? 'bg-[#0D9488] text-white'
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.visionTest.visualAcuity2', 'Visual Acuity')}
            </button>
            <button
              onClick={() => {
                setActiveTest('colorBlind');
                resetTest();
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTest === 'colorBlind'
                  ? 'bg-[#0D9488] text-white'
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.visionTest.colorBlindness', 'Color Blindness')}
            </button>
            <button
              onClick={() => {
                setActiveTest('astigmatism');
                resetTest();
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTest === 'astigmatism'
                  ? 'bg-[#0D9488] text-white'
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.visionTest.astigmatism', 'Astigmatism')}
            </button>
          </div>
        )}

        {/* Instructions */}
        {showInstructions && renderInstructions()}

        {/* Tests */}
        {testStarted && !showResults && (
          <>
            {activeTest === 'snellen' && renderSnellenTest()}
            {activeTest === 'colorBlind' && renderColorBlindTest()}
            {activeTest === 'astigmatism' && renderAstigmatismTest()}

            <button
              onClick={resetTest}
              className={`w-full mt-4 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              {t('tools.visionTest.resetTest', 'Reset Test')}
            </button>
          </>
        )}

        {/* Results */}
        {showResults && renderResults()}
      </div>
    </ToolContainer>
  );
};

export default VisionTestTool;
