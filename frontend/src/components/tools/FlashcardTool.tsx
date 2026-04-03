import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Plus, Trash2, RotateCcw, ChevronLeft, ChevronRight, Shuffle, Check, X, Download, Upload } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface FlashcardToolProps {
  uiConfig?: UIConfig;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  known: boolean;
}

// Column configuration for export
const flashcardColumns: ColumnConfig[] = [
  { key: 'front', header: 'Question (Front)', type: 'string' },
  { key: 'back', header: 'Answer (Back)', type: 'string' },
  { key: 'known', header: 'Mastered', type: 'boolean' },
];

const defaultFlashcards: Flashcard[] = [
  { id: '1', front: 'What is React?', back: 'A JavaScript library for building user interfaces', known: false },
  { id: '2', front: 'What is JSX?', back: 'A syntax extension for JavaScript that looks similar to HTML', known: false },
  { id: '3', front: 'What is a Hook?', back: 'Functions that let you use state and other React features in functional components', known: false },
];

export const FlashcardTool: React.FC<FlashcardToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [studyMode, setStudyMode] = useState<'all' | 'unknown'>('all');

  // Use useToolData hook for backend sync
  const {
    data: cards,
    setData: setCards,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importJSON,
    copyToClipboard,
    print,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    isLoading,
  } = useToolData<Flashcard>('flashcard-tool', defaultFlashcards, flashcardColumns);

  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.cards && Array.isArray(data.cards)) {
        const prefillCards = data.cards.map((c: any, idx: number) => ({
          id: String(idx + 1),
          front: c.front || c.question || '',
          back: c.back || c.answer || '',
          known: false,
        }));
        setCards(prefillCards);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled, setCards]);

  const filteredCards = studyMode === 'unknown' ? cards.filter(c => !c.known) : cards;
  const currentCard = filteredCards[currentIndex];

  // Prepare export data
  const exportData = useMemo(() => cards, [cards]);

  const addCard = () => {
    if (!newFront.trim() || !newBack.trim()) return;

    addItem({
      id: Date.now().toString(),
      front: newFront,
      back: newBack,
      known: false,
    });
    setNewFront('');
    setNewBack('');
  };

  const removeCard = (id: string) => {
    deleteItem(id);
    if (currentIndex >= filteredCards.length - 1) {
      setCurrentIndex(Math.max(0, filteredCards.length - 2));
    }
  };

  const toggleKnown = (id: string) => {
    const card = cards.find(c => c.id === id);
    if (card) {
      updateItem(id, { known: !card.known });
    }
  };

  const markCurrentKnown = (known: boolean) => {
    if (currentCard) {
      toggleKnown(currentCard.id);
      if (known && currentIndex < filteredCards.length - 1) {
        nextCard();
      }
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }, 150);
  };

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const resetProgress = () => {
    setCards(cards.map(c => ({ ...c, known: false })));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const knownCount = cards.filter(c => c.known).length;
  const progress = cards.length > 0 ? (knownCount / cards.length) * 100 : 0;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.flashcard.flashcardMaker', 'Flashcard Maker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.flashcard.createAndStudyFlashcards', 'Create and study flashcards')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="flashcard" toolName="Flashcard" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'flashcards' })}
              onExportExcel={() => exportExcel({ filename: 'flashcards' })}
              onExportJSON={() => exportJSON({ filename: 'flashcards' })}
              onExportPDF={() => exportPDF({ filename: 'flashcards', title: 'Flashcards' })}
              onPrint={() => copyToClipboard('tab')}
              onCopyToClipboard={() => copyToClipboard()}
              disabled={cards.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => setShowEditor(!showEditor)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showEditor
                  ? 'bg-pink-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {showEditor ? t('tools.flashcard.study', 'Study') : t('tools.flashcard.editCards', 'Edit Cards')}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex justify-between mb-2">
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Progress: {knownCount}/{cards.length} cards mastered
            </span>
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {showEditor ? (
          /* Editor Mode */
          <div className="space-y-4">
            {/* Add New Card */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.flashcard.addNewCard', 'Add New Card')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.flashcard.frontQuestion', 'Front (Question)')}</label>
                  <textarea
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder={t('tools.flashcard.enterQuestion', 'Enter question...')}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border resize-none ${
                      isDark
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.flashcard.backAnswer', 'Back (Answer)')}</label>
                  <textarea
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder={t('tools.flashcard.enterAnswer', 'Enter answer...')}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border resize-none ${
                      isDark
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
              <button
                onClick={addCard}
                className="mt-3 w-full py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.flashcard.addCard', 'Add Card')}
              </button>
            </div>

            {/* Card List */}
            <div className="space-y-2">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className={`p-4 rounded-lg border flex justify-between items-start ${
                    card.known
                      ? isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                      : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {index + 1}. {card.front}
                    </p>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {card.back}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleKnown(card.id)}
                      className={`p-1.5 rounded ${
                        card.known
                          ? 'text-green-500 hover:bg-green-500/20'
                          : isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeCard(card.id)}
                      className={`p-1.5 rounded ${isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-500 hover:bg-red-50'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Import/Export */}
            <div className="flex gap-3">
              <button
                onClick={() => exportJSON({ filename: 'flashcards' })}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Download className="w-4 h-4" />
                {t('tools.flashcard.export', 'Export')}
              </button>
              <label className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      void importJSON && importJSON(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          /* Study Mode */
          <>
            {/* Study Mode Toggle */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => { setStudyMode('all'); setCurrentIndex(0); setIsFlipped(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  studyMode === 'all'
                    ? 'bg-pink-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                All Cards ({cards.length})
              </button>
              <button
                onClick={() => { setStudyMode('unknown'); setCurrentIndex(0); setIsFlipped(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  studyMode === 'unknown'
                    ? 'bg-pink-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Still Learning ({cards.length - knownCount})
              </button>
            </div>

            {filteredCards.length > 0 ? (
              <>
                {/* Flashcard */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`relative h-64 cursor-pointer perspective-1000`}
                >
                  <div
                    className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? t('tools.flashcard.rotatey180deg', 'rotateY(180deg)') : t('tools.flashcard.rotatey0deg', 'rotateY(0deg)'),
                    }}
                  >
                    {/* Front */}
                    <div
                      className={`absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col items-center justify-center text-center backface-hidden ${
                        isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-gray-50'
                      } shadow-xl border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <p className={`text-sm mb-2 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{t('tools.flashcard.question', 'Question')}</p>
                      <p className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currentCard?.front}
                      </p>
                      <p className={`text-sm mt-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {t('tools.flashcard.clickToFlip', 'Click to flip')}
                      </p>
                    </div>

                    {/* Back */}
                    <div
                      className={`absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col items-center justify-center text-center ${
                        isDark ? 'bg-gradient-to-br from-pink-900/50 to-purple-900/50' : 'bg-gradient-to-br from-pink-50 to-purple-50'
                      } shadow-xl border ${isDark ? 'border-pink-700' : 'border-pink-200'}`}
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <p className={`text-sm mb-2 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>{t('tools.flashcard.answer', 'Answer')}</p>
                      <p className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currentCard?.back}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Counter */}
                <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Card {currentIndex + 1} of {filteredCards.length}
                </p>

                {/* Navigation */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={prevCard}
                    className={`p-3 rounded-xl ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <ChevronLeft className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                  </button>

                  <button
                    onClick={() => markCurrentKnown(false)}
                    className="p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-500"
                    title={t('tools.flashcard.stillLearning', 'Still learning')}
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => markCurrentKnown(true)}
                    className="p-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-500"
                    title={t('tools.flashcard.gotIt', 'Got it!')}
                  >
                    <Check className="w-6 h-6" />
                  </button>

                  <button
                    onClick={nextCard}
                    className={`p-3 rounded-xl ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <ChevronRight className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-3">
                  <button
                    onClick={shuffleCards}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
                      isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Shuffle className="w-4 h-4" />
                    {t('tools.flashcard.shuffle', 'Shuffle')}
                  </button>
                  <button
                    onClick={resetProgress}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
                      isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('tools.flashcard.resetProgress', 'Reset Progress')}
                  </button>
                </div>
              </>
            ) : (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.flashcard.noCardsToStudy', 'No cards to study!')}</p>
                <p className="text-sm mt-1">
                  {studyMode === 'unknown' ? t('tools.flashcard.allCardsMasteredSwitchTo', 'All cards mastered! Switch to "All Cards" or reset progress.') : t('tools.flashcard.addSomeFlashcardsToGet', 'Add some flashcards to get started.')}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FlashcardTool;
