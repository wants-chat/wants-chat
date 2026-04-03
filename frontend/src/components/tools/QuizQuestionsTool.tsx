import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Loader2, Copy, Check, BookOpen, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface QuizQuestionsToolProps {
  uiConfig?: UIConfig;
}

const quizTypes = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'true-false', label: 'True/False' },
  { value: 'fill-blank', label: 'Fill in the Blank' },
  { value: 'short-answer', label: 'Short Answer' },
  { value: 'matching', label: 'Matching' },
  { value: 'mixed', label: 'Mixed Format' },
];

const difficultyLevels = [
  { value: 'easy', label: 'Easy (Recall/Recognition)' },
  { value: 'medium', label: 'Medium (Understanding/Application)' },
  { value: 'hard', label: 'Hard (Analysis/Evaluation)' },
  { value: 'mixed', label: 'Mixed Difficulty' },
];

const subjects = [
  { value: 'general', label: 'General Knowledge' },
  { value: 'science', label: 'Science' },
  { value: 'math', label: 'Mathematics' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'literature', label: 'Literature' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'health', label: 'Health & Medicine' },
  { value: 'custom', label: 'Custom Topic' },
];

export const QuizQuestionsTool: React.FC<QuizQuestionsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [quizType, setQuizType] = useState('multiple-choice');
  const [difficulty, setDifficulty] = useState('medium');
  const [subject, setSubject] = useState('general');
  const [customTopic, setCustomTopic] = useState('');
  const [specificContent, setSpecificContent] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setCustomTopic(params.text || params.content || '');
        setSubject('custom');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (subject === 'custom' && !customTopic.trim()) {
      setError('Please enter a custom topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const typeLabel = quizTypes.find(t => t.value === quizType)?.label;
      const difficultyLabel = difficultyLevels.find(d => d.value === difficulty)?.label;
      const subjectLabel = subject === 'custom' ? customTopic : subjects.find(s => s.value === subject)?.label;

      const prompt = `Create a ${typeLabel} quiz with ${questionCount} questions about ${subjectLabel}.

Quiz Details:
- Question Format: ${typeLabel}
- Difficulty: ${difficultyLabel}
- Topic: ${subjectLabel}
${specificContent ? `- Specific Content to Cover: ${specificContent}` : ''}

Requirements:
1. Create ${questionCount} ${typeLabel} questions
2. Match the ${difficultyLabel} difficulty level
3. ${quizType === 'multiple-choice' ? 'Provide 4 answer choices (A, B, C, D) per question' : ''}
4. ${quizType === 'true-false' ? 'Create clear, unambiguous true/false statements' : ''}
5. ${quizType === 'fill-blank' ? 'Clearly indicate blank with _____' : ''}
6. Questions should progressively get harder if mixed difficulty
7. Ensure questions are factually accurate
8. Make distractors (wrong answers) plausible but clearly incorrect
9. Avoid trick questions or ambiguous wording
${includeAnswers ? '10. Include an ANSWER KEY at the end with explanations' : '10. Do NOT include answers'}

Format:
- Number each question
- ${quizType === 'multiple-choice' ? 'List choices A through D' : ''}
- ${includeAnswers ? 'Provide answer key at the end' : ''}`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an educational content creator who designs effective, well-structured quiz questions that accurately test knowledge.',
        temperature: 0.7,
        maxTokens: 3500,
      });

      if (response.success && response.data?.text) {
        setQuiz(response.data.text);
      } else {
        setError(response.error || 'Failed to generate quiz');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(quiz);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-blue-900/20' : 'from-white to-blue-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <HelpCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.quizQuestions.quizQuestionsGenerator', 'Quiz Questions Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.quizQuestions.createEducationalQuizzesOnAny', 'Create educational quizzes on any topic')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.quizQuestions.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.quizQuestions.questionFormat', 'Question Format')}</label>
            <select
              value={quizType}
              onChange={(e) => setQuizType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {quizTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.quizQuestions.difficultyLevel', 'Difficulty Level')}</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {difficultyLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <BookOpen className="w-4 h-4 inline mr-1" /> Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {subjects.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.quizQuestions.numberOfQuestions', 'Number of Questions')}</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              <option value="5">5 Questions</option>
              <option value="10">10 Questions</option>
              <option value="15">15 Questions</option>
              <option value="20">20 Questions</option>
              <option value="25">25 Questions</option>
            </select>
          </div>
        </div>

        {subject === 'custom' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.quizQuestions.customTopic', 'Custom Topic *')}</label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder={t('tools.quizQuestions.enterYourQuizTopic', 'Enter your quiz topic')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.quizQuestions.specificContentSubtopics', 'Specific Content/Subtopics')}</label>
          <textarea
            value={specificContent}
            onChange={(e) => setSpecificContent(e.target.value)}
            placeholder={t('tools.quizQuestions.anySpecificAreasOrConcepts', 'Any specific areas or concepts to focus on...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeAnswers}
            onChange={(e) => setIncludeAnswers(e.target.checked)}
            className="w-4 h-4 accent-blue-500"
          />
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.quizQuestions.includeAnswerKey', 'Include Answer Key')}</span>
        </label>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <HelpCircle className="w-5 h-5" />}
          {isGenerating ? t('tools.quizQuestions.generatingQuiz', 'Generating Quiz...') : t('tools.quizQuestions.generateQuiz', 'Generate Quiz')}
        </button>

        {quiz && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.quizQuestions.yourQuiz', 'Your Quiz')}</h4>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.quizQuestions.copied', 'Copied!') : t('tools.quizQuestions.copyAll', 'Copy All')}
              </button>
            </div>
            <div className={`p-6 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl max-h-[500px] overflow-y-auto`}>
              <pre className={`whitespace-pre-wrap text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-sans leading-relaxed`}>{quiz}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizQuestionsTool;
