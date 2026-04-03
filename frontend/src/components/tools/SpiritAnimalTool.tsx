import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PawPrint, Sparkles, RefreshCw, Share2, Heart, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface SpiritAnimal {
  name: string;
  emoji: string;
  element: 'earth' | 'water' | 'air' | 'fire';
  traits: string[];
  description: string;
  strengths: string[];
  challenges: string[];
  advice: string;
}

const spiritAnimals: SpiritAnimal[] = [
  {
    name: 'Wolf',
    emoji: '🐺',
    element: 'earth',
    traits: ['Loyal', 'Intuitive', 'Social'],
    description: 'The wolf represents deep connection with instincts and intuition. You value loyalty and have strong ties to family and community.',
    strengths: ['Strong leadership', 'Protective nature', 'Deep intuition'],
    challenges: ['Fear of vulnerability', 'Difficulty trusting outsiders'],
    advice: 'Trust your pack, but remember that sometimes the lone wolf finds new paths.',
  },
  {
    name: 'Eagle',
    emoji: '🦅',
    element: 'air',
    traits: ['Visionary', 'Free', 'Courageous'],
    description: 'The eagle soars high above, seeing the bigger picture. You have a gift for perspective and rising above challenges.',
    strengths: ['Clear vision', 'Spiritual connection', 'Courage'],
    challenges: ['Isolation', 'Impatience with details'],
    advice: 'While you soar high, remember to stay grounded in what matters.',
  },
  {
    name: 'Bear',
    emoji: '🐻',
    element: 'earth',
    traits: ['Strong', 'Introspective', 'Nurturing'],
    description: 'The bear embodies strength and introspection. You have powerful protective instincts and value periods of rest and reflection.',
    strengths: ['Physical and emotional strength', 'Self-sufficiency', 'Healing abilities'],
    challenges: ['Tendency to hibernate from problems', 'Stubbornness'],
    advice: 'Your strength comes from within. Trust in your ability to overcome any obstacle.',
  },
  {
    name: 'Dolphin',
    emoji: '🐬',
    element: 'water',
    traits: ['Playful', 'Intelligent', 'Harmonious'],
    description: 'The dolphin brings joy and harmony. You navigate emotions with grace and bring lightness to those around you.',
    strengths: ['Communication', 'Emotional intelligence', 'Playfulness'],
    challenges: ['Avoiding conflict', 'Scattered energy'],
    advice: 'Your joy is contagious. Share it freely, but remember to dive deep when needed.',
  },
  {
    name: 'Owl',
    emoji: '🦉',
    element: 'air',
    traits: ['Wise', 'Mysterious', 'Observant'],
    description: 'The owl sees through darkness and deception. You possess deep wisdom and the ability to perceive hidden truths.',
    strengths: ['Intuition', 'Wisdom', 'Silent observation'],
    challenges: ['Overthinking', 'Difficulty expressing emotions'],
    advice: 'Your wisdom is your gift. Use it to guide others through their darkness.',
  },
  {
    name: 'Phoenix',
    emoji: '🔥',
    element: 'fire',
    traits: ['Transformative', 'Resilient', 'Powerful'],
    description: 'The phoenix represents rebirth and transformation. You have an incredible ability to rise from challenges stronger than before.',
    strengths: ['Resilience', 'Transformation', 'Eternal renewal'],
    challenges: ['Burning bridges', 'Intensity in relationships'],
    advice: 'Each ending is a new beginning. Embrace the flames of change.',
  },
  {
    name: 'Butterfly',
    emoji: '🦋',
    element: 'air',
    traits: ['Transforming', 'Beautiful', 'Sensitive'],
    description: 'The butterfly symbolizes personal transformation and the soul. You are on a journey of beautiful evolution.',
    strengths: ['Adaptability', 'Grace', 'Inner beauty'],
    challenges: ['Fragility', 'Restlessness'],
    advice: 'Trust your transformation. The most beautiful growth comes from change.',
  },
  {
    name: 'Lion',
    emoji: '🦁',
    element: 'fire',
    traits: ['Brave', 'Regal', 'Powerful'],
    description: 'The lion embodies courage, strength, and natural leadership. You command respect and protect those you love.',
    strengths: ['Courage', 'Leadership', 'Personal power'],
    challenges: ['Pride', 'Need for control'],
    advice: 'True strength lies in compassion. Lead with your heart.',
  },
  {
    name: 'Snake',
    emoji: '🐍',
    element: 'earth',
    traits: ['Mysterious', 'Healing', 'Transformative'],
    description: 'The snake represents healing, transformation, and primal energy. You have the power to shed the old and embrace renewal.',
    strengths: ['Healing abilities', 'Transformation', 'Primal wisdom'],
    challenges: ['Trust issues', 'Intensity'],
    advice: 'Shed what no longer serves you. Renewal is your birthright.',
  },
  {
    name: 'Hawk',
    emoji: '🦅',
    element: 'air',
    traits: ['Focused', 'Messenger', 'Clear-sighted'],
    description: 'The hawk is a messenger with laser-like focus. You have the gift of clarity and the ability to see opportunities others miss.',
    strengths: ['Focus', 'Clear vision', 'Quick action'],
    challenges: ['Impatience', 'Tunnel vision'],
    advice: 'Your focus is your power. Stay alert to the messages around you.',
  },
  {
    name: 'Turtle',
    emoji: '🐢',
    element: 'water',
    traits: ['Patient', 'Wise', 'Protected'],
    description: 'The turtle carries ancient wisdom and teaches patience. You understand that slow and steady progress creates lasting results.',
    strengths: ['Patience', 'Protection', 'Longevity'],
    challenges: ['Slow to act', 'Withdrawal'],
    advice: 'Your steady pace wins the race. Trust in divine timing.',
  },
  {
    name: 'Fox',
    emoji: '🦊',
    element: 'earth',
    traits: ['Clever', 'Adaptable', 'Quick-witted'],
    description: 'The fox is cunning and adaptable. You have a quick mind and the ability to navigate complex situations with grace.',
    strengths: ['Intelligence', 'Adaptability', 'Stealth'],
    challenges: ['Trickster tendencies', 'Trust issues'],
    advice: 'Use your cleverness wisely. The best solutions are often the simplest.',
  },
];

interface Question {
  id: number;
  text: string;
  options: { text: string; elements: SpiritAnimal['element'][] }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: 'When facing a challenge, you tend to:',
    options: [
      { text: 'Analyze the situation carefully', elements: ['earth', 'air'] },
      { text: 'Trust your gut feeling', elements: ['water', 'fire'] },
      { text: 'Seek advice from others', elements: ['air', 'water'] },
      { text: 'Take immediate action', elements: ['fire', 'earth'] },
    ],
  },
  {
    id: 2,
    text: 'Your ideal environment is:',
    options: [
      { text: 'Mountains or forests', elements: ['earth', 'earth'] },
      { text: 'Near water (ocean, lake, river)', elements: ['water', 'water'] },
      { text: 'Open skies and high places', elements: ['air', 'air'] },
      { text: 'Warm, sunny locations', elements: ['fire', 'fire'] },
    ],
  },
  {
    id: 3,
    text: 'In social situations, you are:',
    options: [
      { text: 'The quiet observer', elements: ['earth', 'air'] },
      { text: 'The life of the party', elements: ['fire', 'water'] },
      { text: 'The supportive friend', elements: ['water', 'earth'] },
      { text: 'The natural leader', elements: ['fire', 'air'] },
    ],
  },
  {
    id: 4,
    text: 'Your greatest strength is:',
    options: [
      { text: 'Wisdom and patience', elements: ['earth', 'water'] },
      { text: 'Creativity and vision', elements: ['air', 'fire'] },
      { text: 'Empathy and intuition', elements: ['water', 'air'] },
      { text: 'Courage and determination', elements: ['fire', 'earth'] },
    ],
  },
  {
    id: 5,
    text: 'When stressed, you prefer to:',
    options: [
      { text: 'Spend time alone in nature', elements: ['earth', 'earth'] },
      { text: 'Talk it out with someone', elements: ['air', 'water'] },
      { text: 'Exercise or move your body', elements: ['fire', 'fire'] },
      { text: 'Meditate or rest quietly', elements: ['water', 'air'] },
    ],
  },
];

interface SpiritAnimalToolProps {
  uiConfig?: UIConfig;
}

export const SpiritAnimalTool: React.FC<SpiritAnimalToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<SpiritAnimal | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const getElementColor = (element: SpiritAnimal['element']) => {
    const colors = {
      earth: isDark ? 'text-green-400 bg-green-900/30 border-green-700' : 'text-green-600 bg-green-50 border-green-200',
      water: isDark ? 'text-blue-400 bg-blue-900/30 border-blue-700' : 'text-blue-600 bg-blue-50 border-blue-200',
      air: isDark ? 'text-sky-400 bg-sky-900/30 border-sky-700' : 'text-sky-600 bg-sky-50 border-sky-200',
      fire: isDark ? 'text-orange-400 bg-orange-900/30 border-orange-700' : 'text-orange-600 bg-orange-50 border-orange-200',
    };
    return colors[element];
  };

  const handleAnswer = useCallback((optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      setIsRevealing(true);

      // Tally elements
      const elementCount: Record<SpiritAnimal['element'], number> = { earth: 0, water: 0, air: 0, fire: 0 };
      newAnswers.forEach((ansIdx, qIdx) => {
        const elements = questions[qIdx].options[ansIdx].elements;
        elements.forEach(el => elementCount[el]++);
      });

      // Find dominant element
      const dominantElement = (Object.entries(elementCount) as [SpiritAnimal['element'], number][])
        .sort((a, b) => b[1] - a[1])[0][0];

      // Filter animals by element and pick one
      const matchingAnimals = spiritAnimals.filter(a => a.element === dominantElement);
      const randomAnimal = matchingAnimals[Math.floor(Math.random() * matchingAnimals.length)];

      setTimeout(() => {
        setResult(randomAnimal);
        setIsRevealing(false);
      }, 2000);
    }
  }, [answers, currentQuestion]);

  const restart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
    setIsFavorite(false);
  };

  const shareResult = async () => {
    if (!result) return;
    const text = `My spirit animal is the ${result.name}! ${result.emoji}\n\n${result.description}`;
    try {
      await navigator.clipboard.writeText(text);
      setValidationMessage('Copied to clipboard!');
      setTimeout(() => setValidationMessage(null), 3000);
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-600'}`}>
            <PawPrint size={28} />
          </div>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.spiritAnimal.spiritAnimalFinder', 'Spirit Animal Finder')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.spiritAnimal.discoverTheAnimalSpiritThat', 'Discover the animal spirit that guides you')}
            </p>
          </div>
        </div>

        {/* Quiz Section */}
        {!result && !isRevealing && (
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {questions[currentQuestion].text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 hover:bg-teal-900/30 hover:border-teal-600'
                      : 'bg-gray-50 border-gray-200 hover:bg-teal-50 hover:border-teal-300'
                  }`}
                >
                  <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                    {option.text}
                  </span>
                  <ChevronRight
                    size={20}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                      isDark ? 'text-teal-400' : 'text-teal-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Revealing Animation */}
        {isRevealing && (
          <div className={`p-12 rounded-xl border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="text-7xl mb-6 animate-bounce">🌟</div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="text-teal-500 animate-pulse" size={24} />
              <span className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.spiritAnimal.discoveringYourSpiritAnimal', 'Discovering your spirit animal...')}
              </span>
              <Sparkles className="text-teal-500 animate-pulse" size={24} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.spiritAnimal.theSpiritsAreRevealingThemselves', 'The spirits are revealing themselves to you')}
            </p>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className="space-y-4">
            {/* Main Result Card */}
            <div className={`p-6 rounded-xl border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="text-8xl mb-4">{result.emoji}</div>
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                The {result.name}
              </h2>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getElementColor(result.element)}`}>
                {result.element.charAt(0).toUpperCase() + result.element.slice(1)} Element
              </span>

              <p className={`mt-6 text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {result.description}
              </p>

              {/* Traits */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {result.traits.map((trait, idx) => (
                  <span
                    key={idx}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Strengths & Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  {t('tools.spiritAnimal.yourStrengths', 'Your Strengths')}
                </h3>
                <ul className="space-y-2">
                  {result.strengths.map((strength, idx) => (
                    <li key={idx} className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-green-500">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                  {t('tools.spiritAnimal.growthAreas', 'Growth Areas')}
                </h3>
                <ul className="space-y-2">
                  {result.challenges.map((challenge, idx) => (
                    <li key={idx} className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-amber-500">!</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Advice */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'}`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                {t('tools.spiritAnimal.guidanceFromYourSpiritAnimal', 'Guidance from Your Spirit Animal')}
              </h3>
              <p className={`text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                "{result.advice}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={restart}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <RefreshCw size={18} />
                {t('tools.spiritAnimal.retakeQuiz', 'Retake Quiz')}
              </button>
              <button
                onClick={shareResult}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
                  isDark
                    ? 'bg-teal-900/50 text-teal-300 hover:bg-teal-900'
                    : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                }`}
              >
                <Share2 size={18} />
                {t('tools.spiritAnimal.shareResult', 'Share Result')}
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
                  isFavorite
                    ? isDark ? 'bg-pink-900/50 text-pink-300' : 'bg-pink-100 text-pink-700'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Heart size={18} fill={isFavorite ? t('tools.spiritAnimal.currentcolor', 'currentColor') : 'none'} />
                {isFavorite ? t('tools.spiritAnimal.saved', 'Saved') : t('tools.spiritAnimal.save', 'Save')}
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default SpiritAnimalTool;
