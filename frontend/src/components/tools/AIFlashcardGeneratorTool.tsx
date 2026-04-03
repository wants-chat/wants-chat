import React, { useState, useEffect } from 'react';
import { Layers, Loader2, Copy, Check, Sparkles, ChevronLeft, ChevronRight, RotateCcw, Download, Shuffle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface FlashcardSet {
  title: string;
  description: string;
  cards: Flashcard[];
  timestamp: Date;
}

interface AIFlashcardGeneratorToolProps {
  uiConfig?: UIConfig;
}

const cardCounts = [
  { label: '5 Cards', value: 5 },
  { label: '10 Cards', value: 10 },
  { label: '15 Cards', value: 15 },
  { label: '20 Cards', value: 20 },
  { label: '25 Cards', value: 25 },
];

const cardTypes = [
  { label: 'Term & Definition', value: 'term-definition' },
  { label: 'Question & Answer', value: 'question-answer' },
  { label: 'Concept & Explanation', value: 'concept-explanation' },
  { label: 'Fill in the Blank', value: 'fill-blank' },
];

export const AIFlashcardGeneratorTool: React.FC<AIFlashcardGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [cardCount, setCardCount] = useState(cardCounts[1]);
  const [cardType, setCardType] = useState(cardTypes[0]);
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSet, setGeneratedSet] = useState<FlashcardSet | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Flashcard study mode states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.topic || params.text || params.content) {
        setTopic(params.topic || params.text || params.content || '');
        hasChanges = true;
      }

      if (params.cardCount) {
        const matched = cardCounts.find(c => c.value === Number(params.cardCount));
        if (matched) {
          setCardCount(matched);
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
      const prompt = `Create ${cardCount.value} flashcards for studying the following topic:
Topic: ${topic}
Card Type: ${cardType.label}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Generate flashcards in JSON format:
{
  "title": "Flashcard set title",
  "description": "Brief description of the flashcard set",
  "cards": [
    {
      "id": 1,
      "front": "Front of card (term/question/concept)",
      "back": "Back of card (definition/answer/explanation)",
      "category": "Category if applicable",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

Create exactly ${cardCount.value} varied and educational flashcards. Return ONLY valid JSON.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert educator. Create effective flashcards for studying with clear terms and definitions. Return content in valid JSON format only.',
        temperature: 0.7,
        maxTokens: 3000,
      });

      // Extract content and ensure it's a string
      const rawContent = response.data?.text || response.text || response.data?.content || response.content || '';
      const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      let flashcardSet: FlashcardSet;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          flashcardSet = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        flashcardSet = {
          title: `Flashcards: ${topic}`,
          description: 'A set of flashcards to help you study.',
          cards: Array.from({ length: cardCount.value }, (_, i) => ({
            id: i + 1,
            front: `Question ${i + 1} about ${topic}`,
            back: `Answer ${i + 1}`,
            difficulty: 'medium' as const,
          })),
          timestamp: new Date(),
        };
      }

      flashcardSet.timestamp = new Date();
      flashcardSet.cards = flashcardSet.cards.map((card, idx) => ({
        ...card,
        id: idx + 1,
      }));
      setGeneratedSet(flashcardSet);
      setCurrentCardIndex(0);
      setIsFlipped(false);

      try {
        await api.post('/content', {
          content_type: 'text',
          title: `Flashcards: ${topic}`,
          content: JSON.stringify(flashcardSet),
          metadata: {
            type: 'flashcards',
            cardCount: cardCount.value,
            cardType: cardType.value,
          },
        });
      } catch (saveError) {
        console.warn('Failed to save flashcards:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatFlashcardsForCopy = () => {
    if (!generatedSet) return '';

    let text = `${generatedSet.title}\n`;
    text += `${'='.repeat(50)}\n`;
    text += `${generatedSet.description}\n\n`;

    generatedSet.cards.forEach((card, idx) => {
      text += `Card ${idx + 1}${card.category ? ` [${card.category}]` : ''}${card.difficulty ? ` (${card.difficulty})` : ''}\n`;
      text += `${'─'.repeat(30)}\n`;
      text += `Front: ${card.front}\n`;
      text += `Back: ${card.back}\n\n`;
    });

    return text;
  };

  const handleCopy = async () => {
    const text = formatFlashcardsForCopy();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreviousCard = () => {
    if (generatedSet && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNextCard = () => {
    if (generatedSet && currentCardIndex < generatedSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    if (generatedSet) {
      const shuffled = [...generatedSet.cards].sort(() => Math.random() - 0.5);
      setGeneratedSet({ ...generatedSet, cards: shuffled });
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 dark:from-gray-800 dark:to-[#0D9488]/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Layers className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('tools.aIFlashcardGenerator.aiFlashcardGenerator', 'AI Flashcard Generator')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tools.aIFlashcardGenerator.createStudyFlashcardsInstantly', 'Create study flashcards instantly')}
              </p>
            </div>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488]/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs font-medium text-[#0D9488]">{t('tools.aIFlashcardGenerator.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {!studyMode ? (
          <>
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.aIFlashcardGenerator.studyTopic', 'Study Topic')}
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t('tools.aIFlashcardGenerator.enterTheTopicForYour', 'Enter the topic for your flashcards (e.g., \'Spanish vocabulary\', \'Biology cell structure\')...')}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
              />
            </div>

            {/* Card Count & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tools.aIFlashcardGenerator.numberOfCards', 'Number of Cards')}
                </label>
                <select
                  value={cardCount.value}
                  onChange={(e) => {
                    const selected = cardCounts.find(c => c.value === Number(e.target.value));
                    if (selected) setCardCount(selected);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
                >
                  {cardCounts.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tools.aIFlashcardGenerator.cardType', 'Card Type')}
                </label>
                <select
                  value={cardType.value}
                  onChange={(e) => {
                    const selected = cardTypes.find(t => t.value === e.target.value);
                    if (selected) setCardType(selected);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
                >
                  {cardTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Context */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.aIFlashcardGenerator.additionalContextOptional', 'Additional Context (Optional)')}
              </label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder={t('tools.aIFlashcardGenerator.anySpecificTermsChaptersOr', 'Any specific terms, chapters, or focus areas...')}
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
                  {t('tools.aIFlashcardGenerator.creatingFlashcards', 'Creating Flashcards...')}
                </>
              ) : (
                <>
                  <Layers className="w-5 h-5" />
                  {t('tools.aIFlashcardGenerator.generateFlashcards', 'Generate Flashcards')}
                </>
              )}
            </button>
          </>
        ) : (
          /* Study Mode */
          generatedSet && (
            <div className="space-y-6">
              {/* Study Mode Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStudyMode(false)}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#0D9488] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('tools.aIFlashcardGenerator.backToOverview', 'Back to Overview')}
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Card {currentCardIndex + 1} of {generatedSet.cards.length}
                </span>
              </div>

              {/* Flashcard */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative min-h-[250px] cursor-pointer perspective-1000"
              >
                <div
                  className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] rounded-2xl p-6 flex flex-col items-center justify-center backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <p className="text-white text-xl font-medium text-center">
                      {generatedSet.cards[currentCardIndex]?.front}
                    </p>
                    <p className="text-white/70 text-sm mt-4">{t('tools.aIFlashcardGenerator.clickToRevealAnswer', 'Click to reveal answer')}</p>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 bg-white dark:bg-gray-900 border-2 border-[#0D9488] rounded-2xl p-6 flex flex-col items-center justify-center"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <p className="text-gray-900 dark:text-white text-lg text-center">
                      {generatedSet.cards[currentCardIndex]?.back}
                    </p>
                    <p className="text-gray-400 text-sm mt-4">{t('tools.aIFlashcardGenerator.clickToSeeQuestion', 'Click to see question')}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePreviousCard}
                  disabled={currentCardIndex === 0}
                  className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={handleRestart}
                  className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  title={t('tools.aIFlashcardGenerator.restart', 'Restart')}
                >
                  <RotateCcw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={handleShuffle}
                  className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  title={t('tools.aIFlashcardGenerator.shuffle', 'Shuffle')}
                >
                  <Shuffle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={handleNextCard}
                  disabled={currentCardIndex === generatedSet.cards.length - 1}
                  className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-[#0D9488] h-2 rounded-full transition-all"
                  style={{ width: `${((currentCardIndex + 1) / generatedSet.cards.length) * 100}%` }}
                />
              </div>
            </div>
          )
        )}

        {/* Generated Flashcards Overview */}
        {generatedSet && !studyMode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4" />
                {generatedSet.title}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStudyMode(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-[#0D9488] hover:bg-[#0D9488]/90 text-white rounded-lg transition-colors"
                >
                  {t('tools.aIFlashcardGenerator.studyNow', 'Study Now')}
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">{generatedSet.description}</p>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {generatedSet.cards.map((card, idx) => (
                <div
                  key={card.id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-[#0D9488]/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-[#0D9488]">Card {idx + 1}</span>
                    {card.difficulty && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(card.difficulty)}`}>
                        {card.difficulty}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {card.front}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.back}
                  </p>
                  {card.category && (
                    <span className="inline-block mt-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                      {card.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedSet && !isGenerating && !studyMode && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIFlashcardGenerator.yourFlashcardsWillAppearHere', 'Your flashcards will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFlashcardGeneratorTool;
