import React, { useState, useEffect } from 'react';
import { HelpCircle, Loader2, Copy, Check, Sparkles, CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
  timestamp: Date;
}

interface AIQuizGeneratorToolProps {
  uiConfig?: UIConfig;
}

const questionCounts = [
  { label: '5 Questions', value: 5 },
  { label: '10 Questions', value: 10 },
  { label: '15 Questions', value: 15 },
  { label: '20 Questions', value: 20 },
];

const difficultyLevels = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
  { label: 'Mixed', value: 'mixed' },
];

const questionTypes = [
  { label: 'Multiple Choice (4 options)', value: 'multiple-choice-4' },
  { label: 'Multiple Choice (3 options)', value: 'multiple-choice-3' },
  { label: 'True/False', value: 'true-false' },
];

export const AIQuizGeneratorTool: React.FC<AIQuizGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(questionCounts[1]);
  const [difficulty, setDifficulty] = useState(difficultyLevels[1]);
  const [questionType, setQuestionType] = useState(questionTypes[0]);
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Quiz mode states
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.topic || params.text || params.content) {
        setTopic(params.topic || params.text || params.content || '');
        hasChanges = true;
      }

      if (params.difficulty) {
        const matched = difficultyLevels.find(d => d.value === params.difficulty?.toLowerCase());
        if (matched) {
          setDifficulty(matched);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const optionCount = questionType.value === 'true-false' ? 2 :
                          questionType.value === 'multiple-choice-3' ? 3 : 4;

      const prompt = `Create a quiz with ${questionCount.value} questions about:
Topic: ${topic}
Difficulty: ${difficulty.label}
Question Type: ${questionType.label}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Generate questions in JSON format:
{
  "title": "Quiz title",
  "description": "Brief description of the quiz",
  "questions": [
    {
      "id": 1,
      "question": "The question text?",
      "options": ${questionType.value === 'true-false' ? '["True", "False"]' : `["Option A", "Option B", "Option C"${optionCount === 4 ? ', "Option D"' : ''}]`},
      "correctAnswer": 0,
      "explanation": "Why this is the correct answer"
    }
  ]
}

Create exactly ${questionCount.value} varied questions with ${optionCount} options each. The correctAnswer should be the 0-based index of the correct option. Return ONLY valid JSON.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert quiz creator. Generate educational quizzes with varied questions and detailed explanations. Return content in valid JSON format only.',
        temperature: 0.7,
        maxTokens: 3000,
      });

      // Extract content and ensure it's a string
      const rawContent = response.data?.text || response.text || response.data?.content || response.content || '';
      const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      let quiz: Quiz;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          quiz = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        quiz = {
          title: `Quiz: ${topic}`,
          description: 'Test your knowledge with this quiz.',
          questions: Array.from({ length: questionCount.value }, (_, i) => ({
            id: i + 1,
            question: `Question ${i + 1} about ${topic}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
            explanation: 'This is the correct answer because...',
          })),
          timestamp: new Date(),
        };
      }

      quiz.timestamp = new Date();
      quiz.questions = quiz.questions.map((q, idx) => ({
        ...q,
        id: idx + 1,
      }));
      setGeneratedQuiz(quiz);
      setSelectedAnswers({});
      setShowResults(false);
      setCurrentQuestionIndex(0);

      try {
        await api.post('/content', {
          content_type: 'text',
          title: `Quiz: ${topic}`,
          content: JSON.stringify(quiz),
          metadata: {
            type: 'quiz',
            questionCount: questionCount.value,
            difficulty: difficulty.value,
          },
        });
      } catch (saveError) {
        console.warn('Failed to save quiz:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatQuizForCopy = () => {
    if (!generatedQuiz) return '';

    let text = `${generatedQuiz.title}\n`;
    text += `${'='.repeat(50)}\n`;
    text += `${generatedQuiz.description}\n\n`;

    generatedQuiz.questions.forEach((q, idx) => {
      text += `Question ${idx + 1}: ${q.question}\n`;
      q.options.forEach((opt, optIdx) => {
        const isCorrect = optIdx === q.correctAnswer;
        text += `  ${String.fromCharCode(65 + optIdx)}) ${opt}${isCorrect ? ' [CORRECT]' : ''}\n`;
      });
      text += `  Explanation: ${q.explanation}\n\n`;
    });

    return text;
  };

  const handleCopy = async () => {
    const text = formatQuizForCopy();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    if (!showResults) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: optionIndex,
      }));
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setShowExplanation(null);
  };

  const calculateScore = () => {
    if (!generatedQuiz) return { correct: 0, total: 0, percentage: 0 };

    let correct = 0;
    generatedQuiz.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    return {
      correct,
      total: generatedQuiz.questions.length,
      percentage: Math.round((correct / generatedQuiz.questions.length) * 100),
    };
  };

  const getOptionStyle = (questionId: number, optionIndex: number, correctAnswer: number) => {
    const isSelected = selectedAnswers[questionId] === optionIndex;
    const isCorrect = optionIndex === correctAnswer;

    if (!showResults) {
      return isSelected
        ? 'border-[#0D9488] bg-[#0D9488]/10'
        : 'border-gray-200 dark:border-gray-700 hover:border-[#0D9488]/50';
    }

    if (isCorrect) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    }

    if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    }

    return 'border-gray-200 dark:border-gray-700 opacity-50';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 dark:from-gray-800 dark:to-[#0D9488]/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <HelpCircle className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('tools.aIQuizGenerator.aiQuizGenerator', 'AI Quiz Generator')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tools.aIQuizGenerator.createInteractiveQuizzesInstantly', 'Create interactive quizzes instantly')}
              </p>
            </div>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488]/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs font-medium text-[#0D9488]">{t('tools.aIQuizGenerator.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {!quizMode ? (
          <>
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.aIQuizGenerator.quizTopic', 'Quiz Topic')}
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t('tools.aIQuizGenerator.enterTheTopicForYour', 'Enter the topic for your quiz (e.g., \'American Revolution\', \'Python programming basics\')...')}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
              />
            </div>

            {/* Question Count & Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tools.aIQuizGenerator.numberOfQuestions', 'Number of Questions')}
                </label>
                <select
                  value={questionCount.value}
                  onChange={(e) => {
                    const selected = questionCounts.find(c => c.value === Number(e.target.value));
                    if (selected) setQuestionCount(selected);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
                >
                  {questionCounts.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tools.aIQuizGenerator.difficulty', 'Difficulty')}
                </label>
                <select
                  value={difficulty.value}
                  onChange={(e) => {
                    const selected = difficultyLevels.find(d => d.value === e.target.value);
                    if (selected) setDifficulty(selected);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
                >
                  {difficultyLevels.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tools.aIQuizGenerator.questionType', 'Question Type')}
                </label>
                <select
                  value={questionType.value}
                  onChange={(e) => {
                    const selected = questionTypes.find(t => t.value === e.target.value);
                    if (selected) setQuestionType(selected);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
                >
                  {questionTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Context */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.aIQuizGenerator.additionalContextOptional', 'Additional Context (Optional)')}
              </label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder={t('tools.aIQuizGenerator.specificAreasToFocusOn', 'Specific areas to focus on, chapters, or concepts...')}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('tools.aIQuizGenerator.creatingQuiz', 'Creating Quiz...')}
                </>
              ) : (
                <>
                  <HelpCircle className="w-5 h-5" />
                  {t('tools.aIQuizGenerator.generateQuiz', 'Generate Quiz')}
                </>
              )}
            </button>
          </>
        ) : (
          /* Quiz Mode */
          generatedQuiz && (
            <div className="space-y-6">
              {showResults ? (
                /* Results View */
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-r from-[#0D9488]/10 to-[#2DD4BF]/10 rounded-xl">
                    <Trophy className="w-12 h-12 text-[#0D9488] mx-auto mb-3" />
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {calculateScore().percentage}%
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      You got {calculateScore().correct} out of {calculateScore().total} correct
                    </p>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {generatedQuiz.questions.map((q, idx) => {
                      const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
                      return (
                        <div key={q.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-start gap-3 mb-3">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            )}
                            <p className="text-gray-900 dark:text-white font-medium">
                              {idx + 1}. {q.question}
                            </p>
                          </div>
                          <div className="ml-8 space-y-2">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`p-2 rounded-lg text-sm ${
                                  optIdx === q.correctAnswer
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                    : selectedAnswers[q.id] === optIdx
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}) {opt}
                              </div>
                            ))}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                              {q.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleRestartQuiz}
                      className="flex-1 py-3 px-6 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      {t('tools.aIQuizGenerator.retakeQuiz', 'Retake Quiz')}
                    </button>
                    <button
                      onClick={() => setQuizMode(false)}
                      className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
                    >
                      {t('tools.aIQuizGenerator.backToOverview', 'Back to Overview')}
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Quiz */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Question {currentQuestionIndex + 1} of {generatedQuiz.questions.length}
                    </span>
                    <span className="text-sm text-[#0D9488] font-medium">
                      {Object.keys(selectedAnswers).length} answered
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-[#0D9488] h-2 rounded-full transition-all"
                      style={{ width: `${((currentQuestionIndex + 1) / generatedQuiz.questions.length) * 100}%` }}
                    />
                  </div>

                  {/* Question */}
                  <div className="space-y-4">
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {generatedQuiz.questions[currentQuestionIndex].question}
                    </p>

                    <div className="space-y-3">
                      {generatedQuiz.questions[currentQuestionIndex].options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(generatedQuiz.questions[currentQuestionIndex].id, optIdx)}
                          className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                            selectedAnswers[generatedQuiz.questions[currentQuestionIndex].id] === optIdx
                              ? t('tools.aIQuizGenerator.border0d9488Bg0d948810', 'border-[#0D9488] bg-[#0D9488]/10') : t('tools.aIQuizGenerator.borderGray200DarkBorder', 'border-gray-200 dark:border-gray-700 hover:border-[#0D9488]/50')
                          }`}
                        >
                          <span className="font-medium text-[#0D9488] mr-2">
                            {String.fromCharCode(65 + optIdx)})
                          </span>
                          <span className="text-gray-900 dark:text-white">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('tools.aIQuizGenerator.previous', 'Previous')}
                    </button>
                    {currentQuestionIndex < generatedQuiz.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        className="flex-1 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white rounded-lg transition-colors"
                      >
                        {t('tools.aIQuizGenerator.next', 'Next')}
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(selectedAnswers).length !== generatedQuiz.questions.length}
                        className="flex-1 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {t('tools.aIQuizGenerator.submitQuiz', 'Submit Quiz')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* Generated Quiz Overview */}
        {generatedQuiz && !quizMode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                {generatedQuiz.title}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuizMode(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-[#0D9488] hover:bg-[#0D9488]/90 text-white rounded-lg transition-colors"
                >
                  {t('tools.aIQuizGenerator.takeQuiz', 'Take Quiz')}
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">{generatedQuiz.description}</p>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {generatedQuiz.questions.length} questions
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedQuiz && !isGenerating && !quizMode && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIQuizGenerator.yourQuizWillAppearHere', 'Your quiz will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIQuizGeneratorTool;
