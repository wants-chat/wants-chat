import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid3X3, Shuffle, Plus, Trash2, Printer, List, Download, Info, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { ValidationToast } from '../ui/ValidationToast';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface BingoCard {
  id: string;
  cells: (string | number)[][];
}

type CardMode = 'numbers' | 'words';

interface BingoCardGeneratorToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for export functionality
const COLUMNS: ColumnConfig[] = [
  { key: 'cardNumber', header: 'Card #', type: 'number' },
  { key: 'content', header: 'Card Content', type: 'string' },
];

interface ExportableCard {
  cardNumber: number;
  content: string;
}

export const BingoCardGeneratorTool: React.FC<BingoCardGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const [cardMode, setCardMode] = useState<CardMode>('numbers');
  const [wordInput, setWordInput] = useState('');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.cardMode && ['numbers', 'words'].includes(data.cardMode as string)) {
        setCardMode(data.cardMode as CardMode);
      }
      if (data.minNumber) {
        setMinNumber(String(data.minNumber));
      }
      if (data.maxNumber) {
        setMaxNumber(String(data.maxNumber));
      }
      if (data.cardCount) {
        setCardCount(String(data.cardCount));
      }
      if (data.freeSpace !== undefined) {
        setFreeSpace(Boolean(data.freeSpace));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [wordList, setWordList] = useState<string[]>([]);
  const [minNumber, setMinNumber] = useState('1');
  const [maxNumber, setMaxNumber] = useState('75');
  const [cardCount, setCardCount] = useState('1');
  const [freeSpace, setFreeSpace] = useState(true);
  const [cards, setCards] = useState<BingoCard[]>([]);
  const [callList, setCallList] = useState<(string | number)[]>([]);
  const [showCallList, setShowCallList] = useState(false);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  const gridSize = 5;

  const addWord = useCallback(() => {
    const trimmed = wordInput.trim();
    if (trimmed && !wordList.includes(trimmed)) {
      setWordList([...wordList, trimmed]);
      setWordInput('');
    }
  }, [wordInput, wordList]);

  const addMultipleWords = useCallback(() => {
    const words = wordInput
      .split(/[,\n]/)
      .map((w) => w.trim())
      .filter((w) => w && !wordList.includes(w));
    if (words.length > 0) {
      setWordList([...wordList, ...words]);
      setWordInput('');
    }
  }, [wordInput, wordList]);

  const removeWord = useCallback((word: string) => {
    setWordList(wordList.filter((w) => w !== word));
  }, [wordList]);

  const clearWords = useCallback(() => {
    setWordList([]);
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateCards = useCallback(() => {
    const count = Math.min(Math.max(parseInt(cardCount) || 1, 1), 20);
    const cellsNeeded = gridSize * gridSize - (freeSpace ? 1 : 0);

    let pool: (string | number)[] = [];

    if (cardMode === 'numbers') {
      const min = parseInt(minNumber) || 1;
      const max = parseInt(maxNumber) || 75;
      for (let i = min; i <= max; i++) {
        pool.push(i);
      }
    } else {
      pool = [...wordList];
    }

    if (pool.length < cellsNeeded) {
      setValidationMessage(`Need at least ${cellsNeeded} items. You have ${pool.length}.`);
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newCards: BingoCard[] = [];

    for (let c = 0; c < count; c++) {
      const shuffled = shuffleArray(pool);
      const selected = shuffled.slice(0, cellsNeeded);
      const cells: (string | number)[][] = [];
      let idx = 0;

      for (let row = 0; row < gridSize; row++) {
        const rowCells: (string | number)[] = [];
        for (let col = 0; col < gridSize; col++) {
          if (freeSpace && row === 2 && col === 2) {
            rowCells.push('FREE');
          } else {
            rowCells.push(selected[idx]);
            idx++;
          }
        }
        cells.push(rowCells);
      }

      newCards.push({
        id: `card-${Date.now()}-${c}`,
        cells,
      });
    }

    setCards(newCards);
    setCallList([]);
    setShowCallList(false);
  }, [cardMode, cardCount, freeSpace, minNumber, maxNumber, wordList]);

  const generateCallList = useCallback(() => {
    let pool: (string | number)[] = [];

    if (cardMode === 'numbers') {
      const min = parseInt(minNumber) || 1;
      const max = parseInt(maxNumber) || 75;
      for (let i = min; i <= max; i++) {
        pool.push(i);
      }
    } else {
      pool = [...wordList];
    }

    setCallList(shuffleArray(pool));
    setShowCallList(true);
  }, [cardMode, minNumber, maxNumber, wordList]);

  const copyCardToClipboard = useCallback((card: BingoCard) => {
    const text = card.cells.map((row) => row.join('\t')).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedCardId(card.id);
    setTimeout(() => setCopiedCardId(null), 2000);
  }, []);

  const printCards = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cardsHtml = cards
      .map(
        (card) => `
      <div style="page-break-inside: avoid; margin-bottom: 20px;">
        <table style="border-collapse: collapse; width: 300px; margin: 0 auto;">
          <thead>
            <tr>
              ${['B', 'I', 'N', 'G', 'O']
                .map(
                  (letter) =>
                    `<th style="border: 2px solid #333; padding: 10px; text-align: center; font-size: 20px; font-weight: bold; background: #f0f0f0;">${letter}</th>`
                )
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${card.cells
              .map(
                (row) => `
              <tr>
                ${row
                  .map(
                    (cell) =>
                      `<td style="border: 2px solid #333; padding: 10px; text-align: center; font-size: ${
                        cell === 'FREE' ? '12px' : '16px'
                      }; width: 60px; height: 60px; ${
                        cell === 'FREE' ? 'background: #e0e0e0; font-weight: bold;' : ''
                      }">${cell}</td>`
                  )
                  .join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bingo Cards</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">Bingo Cards</h1>
          ${cardsHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  }, [cards]);

  // Convert bingo cards to exportable format
  const getExportableData = useCallback((): ExportableCard[] => {
    return cards.map((card, idx) => ({
      cardNumber: idx + 1,
      content: card.cells.map((row) => row.join('\t')).join(' | '),
    }));
  }, [cards]);

  // Export handlers
  const handleExportCSV = useCallback(() => {
    const data = getExportableData();
    exportToCSV(data, COLUMNS, { filename: 'bingo-cards' });
  }, [getExportableData]);

  const handleExportExcel = useCallback(() => {
    const data = getExportableData();
    exportToExcel(data, COLUMNS, { filename: 'bingo-cards' });
  }, [getExportableData]);

  const handleExportJSON = useCallback(() => {
    const data = getExportableData();
    exportToJSON(data, { filename: 'bingo-cards', includeMetadata: true });
  }, [getExportableData]);

  const handleExportPDF = useCallback(async () => {
    const data = getExportableData();
    await exportToPDF(data, COLUMNS, {
      filename: 'bingo-cards',
      title: 'Bingo Cards Export',
      orientation: 'landscape',
    });
  }, [getExportableData]);

  const handlePrint = useCallback(() => {
    const data = getExportableData();
    printData(data, COLUMNS, { title: 'Bingo Cards' });
  }, [getExportableData]);

  const handleCopyToClipboard = useCallback(async () => {
    const data = getExportableData();
    return await copyUtil(data, COLUMNS, 'tab');
  }, [getExportableData]);

  const minItemsNeeded = useMemo(() => {
    return gridSize * gridSize - (freeSpace ? 1 : 0);
  }, [freeSpace]);

  return (
    <div
      className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}
    >
      <div
        className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Grid3X3 className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.bingoCardGenerator.bingoCardGenerator', 'Bingo Card Generator')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.bingoCardGenerator.createCustomBingoCardsWith', 'Create custom bingo cards with numbers or words')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.bingoCardGenerator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Card Mode Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setCardMode('numbers')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium ${
              cardMode === 'numbers'
                ? 'bg-purple-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t('tools.bingoCardGenerator.numbers', 'Numbers')}
          </button>
          <button
            onClick={() => setCardMode('words')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium ${
              cardMode === 'words'
                ? 'bg-purple-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t('tools.bingoCardGenerator.wordsCustom', 'Words/Custom')}
          </button>
        </div>

        {/* Number Range Input */}
        {cardMode === 'numbers' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.bingoCardGenerator.minNumber', 'Min Number')}
              </label>
              <input
                type="number"
                value={minNumber}
                onChange={(e) => setMinNumber(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.bingoCardGenerator.maxNumber', 'Max Number')}
              </label>
              <input
                type="number"
                value={maxNumber}
                onChange={(e) => setMaxNumber(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        )}

        {/* Word List Input */}
        {cardMode === 'words' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.bingoCardGenerator.addWordsSeparateByComma', 'Add Words (separate by comma or new line)')}
              </label>
              <div className="flex gap-2">
                <textarea
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value)}
                  placeholder={t('tools.bingoCardGenerator.enterWordsHere', 'Enter words here...')}
                  rows={3}
                  className={`flex-1 px-4 py-2 rounded-lg border resize-none ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addMultipleWords();
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addMultipleWords}
                  className="flex-1 py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.bingoCardGenerator.addWords', 'Add Words')}
                </button>
                <button
                  onClick={clearWords}
                  className={`py-2 px-4 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Word List Display */}
            {wordList.length > 0 && (
              <div
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Word List ({wordList.length} words)
                  </span>
                  <span className={`text-xs ${wordList.length >= minItemsNeeded ? 'text-green-500' : 'text-amber-500'}`}>
                    Need at least {minItemsNeeded}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {wordList.map((word, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {word}
                      <button
                        onClick={() => removeWord(word)}
                        className="hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.bingoCardGenerator.numberOfCards', 'Number of Cards')}
            </label>
            <select
              value={cardCount}
              onChange={(e) => setCardCount(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {[1, 2, 4, 6, 8, 10, 12, 16, 20].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? t('tools.bingoCardGenerator.card', 'Card') : t('tools.bingoCardGenerator.cards', 'Cards')}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.bingoCardGenerator.freeSpace', 'Free Space')}
            </label>
            <button
              onClick={() => setFreeSpace(!freeSpace)}
              className={`w-full py-2 px-4 rounded-lg font-medium ${
                freeSpace
                  ? 'bg-purple-500 text-white'
                  : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {freeSpace ? t('tools.bingoCardGenerator.enabled', 'Enabled') : t('tools.bingoCardGenerator.disabled', 'Disabled')}
            </button>
          </div>
        </div>

        {/* Generate Buttons */}
        <div className="flex gap-2">
          <button
            onClick={generateCards}
            className="flex-1 py-3 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2 font-medium"
          >
            <Shuffle className="w-4 h-4" />
            {t('tools.bingoCardGenerator.generateCards', 'Generate Cards')}
          </button>
          <button
            onClick={generateCallList}
            className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            title={t('tools.bingoCardGenerator.generateCallList', 'Generate Call List')}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Export Dropdown */}
        {cards.length > 0 && (
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        )}

        {/* Generated Cards */}
        {cards.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Generated Cards ({cards.length})
              </h4>
              <button
                onClick={printCards}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
              >
                <Printer className="w-4 h-4" />
                {t('tools.bingoCardGenerator.printAll', 'Print All')}
              </button>
            </div>

            <div className="grid gap-4">
              {cards.map((card, cardIdx) => (
                <div
                  key={card.id}
                  className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Card #{cardIdx + 1}
                    </span>
                    <button
                      onClick={() => copyCardToClipboard(card)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                      {copiedCardId === card.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          {t('tools.bingoCardGenerator.copied', 'Copied')}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          {t('tools.bingoCardGenerator.copy', 'Copy')}
                        </>
                      )}
                    </button>
                  </div>

                  {/* BINGO Header */}
                  <div className="grid grid-cols-5 gap-1 mb-1">
                    {['B', 'I', 'N', 'G', 'O'].map((letter) => (
                      <div
                        key={letter}
                        className="text-center py-2 font-bold text-lg bg-purple-500 text-white rounded"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>

                  {/* Card Grid */}
                  <div className="grid grid-cols-5 gap-1">
                    {card.cells.flat().map((cell, cellIdx) => (
                      <div
                        key={cellIdx}
                        className={`aspect-square flex items-center justify-center rounded text-sm font-medium ${
                          cell === 'FREE'
                            ? 'bg-purple-200 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                            : isDark
                              ? 'bg-gray-700 text-gray-200'
                              : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <span className={`${typeof cell === 'string' && cell.length > 8 ? 'text-xs' : ''} text-center px-1 break-words`}>
                          {cell}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call List */}
        {showCallList && callList.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.bingoCardGenerator.callListRandomizedOrder', 'Call List (Randomized Order)')}
              </h4>
              <button
                onClick={generateCallList}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-purple-500 text-white hover:bg-purple-600"
              >
                <Shuffle className="w-3 h-3" />
                {t('tools.bingoCardGenerator.reshuffle', 'Reshuffle')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {callList.map((item, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded text-sm font-medium ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700 border border-gray-200'}`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.bingoCardGenerator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>* Standard bingo uses numbers 1-75</li>
                <li>* For word bingo, add at least 24 words (25 if no free space)</li>
                <li>* Use the call list for fair random drawing</li>
                <li>* Print multiple cards for group games</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog />
      {validationMessage && <ValidationToast message={validationMessage} type="error" />}
    </div>
  );
};

export default BingoCardGeneratorTool;
