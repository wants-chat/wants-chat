import React, { useState, useCallback } from 'react';
import { Brain, Sparkles, RefreshCw, Share2, ChevronRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';

interface PersonalityType {
  type: string;
  title: string;
  emoji: string;
  color: string;
  description: string;
  strengths: string[];
  challenges: string[];
  careers: string[];
  famousPeople: string[];
  compatibleTypes: string[];
}

const personalityTypes: Record<string, PersonalityType> = {
  INTJ: {
    type: 'INTJ',
    title: 'The Architect',
    emoji: '🏛️',
    color: 'purple',
    description: 'Strategic thinkers with a plan for everything. You see life as a grand chessboard, constantly analyzing and optimizing.',
    strengths: ['Strategic thinking', 'Independence', 'Determination', 'High standards'],
    challenges: ['Perfectionism', 'Emotional expression', 'Patience with others'],
    careers: ['Scientist', 'Engineer', 'Judge', 'Professor', 'Strategist'],
    famousPeople: ['Elon Musk', 'Isaac Newton', 'Nikola Tesla'],
    compatibleTypes: ['ENFP', 'ENTP'],
  },
  ENFP: {
    type: 'ENFP',
    title: 'The Campaigner',
    emoji: '🎭',
    color: 'orange',
    description: 'Enthusiastic, creative, and sociable free spirits. You find possibilities everywhere and inspire others with your vision.',
    strengths: ['Creativity', 'Enthusiasm', 'Communication', 'Empathy'],
    challenges: ['Follow-through', 'Overthinking', 'Focusing on one thing'],
    careers: ['Actor', 'Counselor', 'Writer', 'Entrepreneur', 'Journalist'],
    famousPeople: ['Robin Williams', 'Robert Downey Jr.', 'Ellen DeGeneres'],
    compatibleTypes: ['INTJ', 'INFJ'],
  },
  ISTJ: {
    type: 'ISTJ',
    title: 'The Logistician',
    emoji: '📋',
    color: 'blue',
    description: 'Practical and fact-minded individuals. You value integrity, tradition, and dedication to duty above all else.',
    strengths: ['Reliability', 'Organization', 'Patience', 'Dedication'],
    challenges: ['Flexibility', 'Emotional awareness', 'Accepting new ideas'],
    careers: ['Accountant', 'Lawyer', 'Military Officer', 'Doctor', 'Manager'],
    famousPeople: ['George Washington', 'Warren Buffett', 'Angela Merkel'],
    compatibleTypes: ['ESFP', 'ESTP'],
  },
  ESFP: {
    type: 'ESFP',
    title: 'The Entertainer',
    emoji: '🎉',
    color: 'pink',
    description: 'Spontaneous, energetic, and enthusiastic. You live in the moment and make every gathering more exciting.',
    strengths: ['Enthusiasm', 'Practicality', 'Observant', 'Social skills'],
    challenges: ['Long-term planning', 'Sensitivity to criticism', 'Focus'],
    careers: ['Performer', 'Sales', 'Event Planner', 'Designer', 'Chef'],
    famousPeople: ['Marilyn Monroe', 'Elvis Presley', 'Jamie Oliver'],
    compatibleTypes: ['ISTJ', 'ISFJ'],
  },
  INFJ: {
    type: 'INFJ',
    title: 'The Advocate',
    emoji: '🕊️',
    color: 'teal',
    description: 'Quiet and mystical, yet inspiring idealists. You have a deep sense of intuition and seek to help others realize their potential.',
    strengths: ['Insightfulness', 'Principled', 'Passionate', 'Altruistic'],
    challenges: ['Perfectionism', 'Burnout', 'Opening up'],
    careers: ['Counselor', 'Author', 'Humanitarian', 'Teacher', 'Psychologist'],
    famousPeople: ['Martin Luther King Jr.', 'Mother Teresa', 'Nelson Mandela'],
    compatibleTypes: ['ENFP', 'ENTP'],
  },
  ESTP: {
    type: 'ESTP',
    title: 'The Entrepreneur',
    emoji: '🚀',
    color: 'red',
    description: 'Smart, energetic, and perceptive. You thrive on action and live by your own rules, always ready for the next adventure.',
    strengths: ['Bold', 'Practical', 'Direct', 'Perceptive'],
    challenges: ['Impatience', 'Risk-taking', 'Long-term planning'],
    careers: ['Entrepreneur', 'Athlete', 'Paramedic', 'Detective', 'Pilot'],
    famousPeople: ['Ernest Hemingway', 'Jack Nicholson', 'Eddie Murphy'],
    compatibleTypes: ['ISFJ', 'ISTJ'],
  },
};

interface Question {
  id: number;
  text: string;
  optionA: { text: string; trait: string };
  optionB: { text: string; trait: string };
}

const questions: Question[] = [
  {
    id: 1,
    text: 'At a party, you typically:',
    optionA: { text: 'Mingle with many people, including strangers', trait: 'E' },
    optionB: { text: 'Stay with a few close friends', trait: 'I' },
  },
  {
    id: 2,
    text: 'When making decisions, you rely more on:',
    optionA: { text: 'Facts and logical analysis', trait: 'T' },
    optionB: { text: 'Feelings and how others will be affected', trait: 'F' },
  },
  {
    id: 3,
    text: 'You prefer work that is:',
    optionA: { text: 'Structured with clear expectations', trait: 'J' },
    optionB: { text: 'Flexible and spontaneous', trait: 'P' },
  },
  {
    id: 4,
    text: 'You are more interested in:',
    optionA: { text: 'What is real and actual', trait: 'S' },
    optionB: { text: 'What is possible and theoretical', trait: 'N' },
  },
  {
    id: 5,
    text: 'After socializing, you feel:',
    optionA: { text: 'Energized and excited', trait: 'E' },
    optionB: { text: 'Drained and need alone time', trait: 'I' },
  },
  {
    id: 6,
    text: 'You prefer to:',
    optionA: { text: 'Focus on concrete details', trait: 'S' },
    optionB: { text: 'See the big picture first', trait: 'N' },
  },
  {
    id: 7,
    text: 'When someone is upset, you first:',
    optionA: { text: 'Try to solve their problem', trait: 'T' },
    optionB: { text: 'Offer emotional support', trait: 'F' },
  },
  {
    id: 8,
    text: 'You prefer your days to be:',
    optionA: { text: 'Planned in advance', trait: 'J' },
    optionB: { text: 'Open to whatever happens', trait: 'P' },
  },
  {
    id: 9,
    text: 'You are more comfortable with:',
    optionA: { text: 'Known and proven methods', trait: 'S' },
    optionB: { text: 'New and innovative approaches', trait: 'N' },
  },
  {
    id: 10,
    text: 'You consider yourself more:',
    optionA: { text: 'Tough-minded and objective', trait: 'T' },
    optionB: { text: 'Tender-hearted and subjective', trait: 'F' },
  },
  {
    id: 11,
    text: 'Meeting new people is:',
    optionA: { text: 'Easy and enjoyable', trait: 'E' },
    optionB: { text: 'Sometimes exhausting', trait: 'I' },
  },
  {
    id: 12,
    text: 'Deadlines make you feel:',
    optionA: { text: 'Motivated and focused', trait: 'J' },
    optionB: { text: 'Pressured and stressed', trait: 'P' },
  },
];

interface PersonalityQuizToolProps {
  uiConfig?: UIConfig;
}

export const PersonalityQuizTool: React.FC<PersonalityQuizToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  const [result, setResult] = useState<PersonalityType | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleAnswer = useCallback((trait: string) => {
    const newAnswers = { ...answers, [trait]: answers[trait] + 1 };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCalculating(true);

      setTimeout(() => {
        // Calculate personality type
        const type =
          (newAnswers.E > newAnswers.I ? 'E' : 'I') +
          (newAnswers.S > newAnswers.N ? 'S' : 'N') +
          (newAnswers.T > newAnswers.F ? 'T' : 'F') +
          (newAnswers.J > newAnswers.P ? 'J' : 'P');

        const personality = personalityTypes[type] || personalityTypes['ENFP'];
        setResult(personality);
        setIsCalculating(false);
      }, 1500);
    }
  }, [answers, currentQuestion]);

  const restart = () => {
    setCurrentQuestion(0);
    setAnswers({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setResult(null);
  };

  const shareResult = async () => {
    if (!result) return;
    const text = `My personality type is ${result.type} - ${result.title}! ${result.emoji}\n\n${result.description}`;
    try {
      await navigator.clipboard.writeText(text);
      setValidationMessage('Copied to clipboard!');
      setTimeout(() => setValidationMessage(null), 3000);
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: isDark ? 'bg-purple-900/30 border-purple-700 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700',
      orange: isDark ? 'bg-orange-900/30 border-orange-700 text-orange-300' : 'bg-orange-50 border-orange-200 text-orange-700',
      blue: isDark ? 'bg-blue-900/30 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700',
      pink: isDark ? 'bg-pink-900/30 border-pink-700 text-pink-300' : 'bg-pink-50 border-pink-200 text-pink-700',
      teal: isDark ? 'bg-teal-900/30 border-teal-700 text-teal-300' : 'bg-teal-50 border-teal-200 text-teal-700',
      red: isDark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700',
    };
    return colors[color] || colors.teal;
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-600'}`}>
            <Brain size={28} />
          </div>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.personalityQuiz.personalityQuiz', 'Personality Quiz')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.personalityQuiz.discoverYourPersonalityTypeIn', 'Discover your personality type in minutes')}
            </p>
          </div>
        </div>

        {/* Quiz Section */}
        {!result && !isCalculating && (
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
              <button
                onClick={() => handleAnswer(questions[currentQuestion].optionA.trait)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 hover:bg-teal-900/30 hover:border-teal-600'
                    : 'bg-gray-50 border-gray-200 hover:bg-teal-50 hover:border-teal-300'
                }`}
              >
                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {questions[currentQuestion].optionA.text}
                </span>
                <ChevronRight
                  size={20}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                    isDark ? 'text-teal-400' : 'text-teal-600'
                  }`}
                />
              </button>
              <button
                onClick={() => handleAnswer(questions[currentQuestion].optionB.trait)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 hover:bg-teal-900/30 hover:border-teal-600'
                    : 'bg-gray-50 border-gray-200 hover:bg-teal-50 hover:border-teal-300'
                }`}
              >
                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {questions[currentQuestion].optionB.text}
                </span>
                <ChevronRight
                  size={20}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                    isDark ? 'text-teal-400' : 'text-teal-600'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Calculating Animation */}
        {isCalculating && (
          <div className={`p-12 rounded-xl border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="text-7xl mb-6 animate-pulse">🧠</div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="text-teal-500 animate-spin" size={24} />
              <span className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.personalityQuiz.analyzingYourPersonality', 'Analyzing your personality...')}
              </span>
              <Sparkles className="text-teal-500 animate-spin" size={24} />
            </div>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className="space-y-4">
            {/* Main Result Card */}
            <div className={`p-6 rounded-xl border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="text-7xl mb-4">{result.emoji}</div>
              <div className={`inline-block px-4 py-2 rounded-xl mb-3 border ${getColorClasses(result.color)}`}>
                <span className="text-2xl font-bold">{result.type}</span>
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {result.title}
              </h2>
              <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {result.description}
              </p>
            </div>

            {/* Strengths */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                {t('tools.personalityQuiz.yourStrengths', 'Your Strengths')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.strengths.map((strength, idx) => (
                  <span
                    key={idx}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                      isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    <Check size={14} />
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            {/* Challenges */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                {t('tools.personalityQuiz.growthAreas', 'Growth Areas')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.challenges.map((challenge, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm ${
                      isDark ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {challenge}
                  </span>
                ))}
              </div>
            </div>

            {/* Career Paths */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'}`}>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                {t('tools.personalityQuiz.idealCareerPaths', 'Ideal Career Paths')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.careers.map((career, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm ${
                      isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {career}
                  </span>
                ))}
              </div>
            </div>

            {/* Famous People */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'}`}>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                Famous {result.type}s
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {result.famousPeople.join(' • ')}
              </p>
            </div>

            {/* Compatible Types */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'}`}>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>
                {t('tools.personalityQuiz.mostCompatibleWith', 'Most Compatible With')}
              </h3>
              <div className="flex gap-2">
                {result.compatibleTypes.map((type, idx) => (
                  <span
                    key={idx}
                    className={`px-4 py-2 rounded-lg text-sm font-bold ${
                      isDark ? 'bg-pink-900/50 text-pink-300' : 'bg-pink-100 text-pink-700'
                    }`}
                  >
                    {type}
                  </span>
                ))}
              </div>
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
                {t('tools.personalityQuiz.retakeQuiz', 'Retake Quiz')}
              </button>
              <button
                onClick={shareResult}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 transition-colors"
              >
                <Share2 size={18} />
                {t('tools.personalityQuiz.shareResult', 'Share Result')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalityQuizTool;
