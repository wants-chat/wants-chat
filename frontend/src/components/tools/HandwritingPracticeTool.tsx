import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PenTool, Type, FileText, Download, RefreshCw, Info, Printer, Baseline, Save, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToJSON,
  copyToClipboard as copyUtil,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface HandwritingPracticeToolProps {
  uiConfig?: UIConfig;
}

type FontStyle = 'print' | 'cursive';
type LineStyle = 'solid' | 'dashed' | 'dotted' | 'guidelines';
type PracticeType = 'letters' | 'words' | 'sentences' | 'custom';

interface LineConfig {
  name: string;
  description: string;
}

interface FontConfig {
  name: string;
  fontFamily: string;
  description: string;
}

const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';

const PRACTICE_WORDS = [
  'apple', 'banana', 'cat', 'dog', 'elephant', 'flower', 'garden', 'house',
  'ice', 'jump', 'kite', 'lion', 'moon', 'night', 'orange', 'pencil',
  'queen', 'rain', 'sun', 'tree', 'umbrella', 'violin', 'water', 'xylophone',
  'yellow', 'zebra', 'book', 'chair', 'desk', 'earth', 'friend', 'green'
];

const PRACTICE_SENTENCES = [
  'The quick brown fox jumps over the lazy dog.',
  'Pack my box with five dozen liquor jugs.',
  'How vexingly quick daft zebras jump!',
  'The five boxing wizards jump quickly.',
  'Sphinx of black quartz, judge my vow.',
  'A quick brown fox leaps over a lazy dog.',
  'Be kind to everyone you meet.',
  'Practice makes perfect every day.'
];

// Column definitions for export functionality
const COLUMNS: ColumnConfig[] = [
  { key: 'index', header: 'Item #', type: 'number' },
  { key: 'content', header: 'Practice Content' },
  { key: 'fontStyle', header: 'Font Style' },
  { key: 'lineStyle', header: 'Line Style' },
];

export const HandwritingPracticeTool: React.FC<HandwritingPracticeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const worksheetRef = useRef<HTMLDivElement>(null);

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [fontStyle, setFontStyle] = useState<FontStyle>('print');

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & Record<string, any>;

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        // Restore all saved form fields
        if (params.fontStyle) setFontStyle(params.fontStyle as FontStyle);
        if (params.lineStyle) setLineStyle(params.lineStyle as LineStyle);
        if (params.practiceType) setPracticeType(params.practiceType as PracticeType);
        if (params.includeUppercase !== undefined) setIncludeUppercase(params.includeUppercase);
        if (params.includeLowercase !== undefined) setIncludeLowercase(params.includeLowercase);
        if (params.includeNumbers !== undefined) setIncludeNumbers(params.includeNumbers);
        if (params.lineCount !== undefined) setLineCount(params.lineCount);
        if (params.fontSize !== undefined) setFontSize(params.fontSize);
        if (params.customText) setCustomText(params.customText);
        if (params.showFormationGuide !== undefined) setShowFormationGuide(params.showFormationGuide);
        if (params.generatedContent) setGeneratedContent(params.generatedContent);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else {
        // Regular prefill from AI
        if (params.fontStyle) setFontStyle(params.fontStyle as FontStyle);
        if (params.practiceType) setPracticeType(params.practiceType as PracticeType);
        if (params.customText) setCustomText(params.customText as string);
        setIsPrefilled(true);
      }
    } else if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.fontStyle) setFontStyle(data.fontStyle as FontStyle);
      if (data.practiceType) setPracticeType(data.practiceType as PracticeType);
      if (data.customText) setCustomText(data.customText);
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [lineStyle, setLineStyle] = useState<LineStyle>('guidelines');
  const [practiceType, setPracticeType] = useState<PracticeType>('letters');
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [lineCount, setLineCount] = useState(6);
  const [fontSize, setFontSize] = useState(48);
  const [customText, setCustomText] = useState('');
  const [showFormationGuide, setShowFormationGuide] = useState(true);
  const [generatedContent, setGeneratedContent] = useState<string[]>([]);

  const fontConfigs: Record<FontStyle, FontConfig> = {
    print: {
      name: 'Print',
      fontFamily: "'Comic Sans MS', 'Chalkboard', cursive",
      description: 'Clear, block-style letters for beginners',
    },
    cursive: {
      name: 'Cursive',
      fontFamily: "'Brush Script MT', 'Dancing Script', cursive",
      description: 'Flowing, connected script writing',
    },
  };

  const lineConfigs: Record<LineStyle, LineConfig> = {
    solid: {
      name: 'Solid Lines',
      description: 'Simple solid baseline',
    },
    dashed: {
      name: 'Dashed Lines',
      description: 'Dashed baseline for tracing',
    },
    dotted: {
      name: 'Dotted Lines',
      description: 'Dotted guidelines',
    },
    guidelines: {
      name: 'Full Guidelines',
      description: 'Top, middle, and baseline guides',
    },
  };

  const letterFormationGuides: Record<string, string> = {
    A: 'Start at bottom left, slant up to top, slant down to bottom right, cross in middle',
    B: 'Start at top, go down, curve right at top, curve right at bottom',
    C: 'Start at top right, curve left and around to bottom right',
    D: 'Start at top, go down, curve right back to top',
    E: 'Start at top, go left, down, left at middle, down, left at bottom',
    F: 'Start at top, go left, down; add line at middle',
    G: 'Start at top right, curve left around, add horizontal line at middle',
    H: 'Two vertical lines connected by horizontal in middle',
    I: 'Vertical line with optional serifs at top and bottom',
    J: 'Start at top, go down, curve left at bottom',
    K: 'Vertical line on left, diagonal lines meeting at middle',
    L: 'Start at top, go down, then right at bottom',
    M: 'Two vertical lines with peaks meeting at top center',
    N: 'Start bottom left up, diagonal down right, up to top right',
    O: 'Start at top, curve left all around back to start',
    P: 'Start at top, go down, curve right at top half',
    Q: 'Like O with a small diagonal tail at bottom right',
    R: 'Like P with diagonal leg from middle to bottom right',
    S: 'Start at top right, curve left, then right, ending bottom left',
    T: 'Horizontal line at top, vertical line down from center',
    U: 'Start top left, down, curve right, up to top right',
    V: 'Start top left, slant down to bottom center, slant up to top right',
    W: 'Like two Vs connected side by side',
    X: 'Two diagonal lines crossing in the center',
    Y: 'Two diagonal lines meeting at center, vertical line down',
    Z: 'Horizontal at top, diagonal down left, horizontal at bottom',
  };

  const generateContent = () => {
    let content: string[] = [];

    switch (practiceType) {
      case 'letters':
        if (includeUppercase) {
          content = [...content, ...UPPERCASE_LETTERS.split('')];
        }
        if (includeLowercase) {
          content = [...content, ...LOWERCASE_LETTERS.split('')];
        }
        if (includeNumbers) {
          content = [...content, ...NUMBERS.split('')];
        }
        // Shuffle for variety
        content = content.sort(() => Math.random() - 0.5).slice(0, lineCount);
        break;
      case 'words':
        content = [...PRACTICE_WORDS].sort(() => Math.random() - 0.5).slice(0, lineCount);
        break;
      case 'sentences':
        content = [...PRACTICE_SENTENCES].sort(() => Math.random() - 0.5).slice(0, Math.min(lineCount, PRACTICE_SENTENCES.length));
        break;
      case 'custom':
        if (customText.trim()) {
          content = customText.split('\n').filter(line => line.trim()).slice(0, lineCount);
        }
        break;
    }

    setGeneratedContent(content);
  };

  // Prepare data for export
  const exportData = useMemo(() => {
    return generatedContent.map((content, index) => ({
      index: index + 1,
      content,
      fontStyle: fontConfigs[fontStyle].name,
      lineStyle: lineConfigs[lineStyle].name,
    }));
  }, [generatedContent, fontStyle, lineStyle]);

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(exportData, COLUMNS, { filename: 'handwriting-practice' });
  };

  const handleExportJSON = () => {
    exportToJSON(exportData, { filename: 'handwriting-practice' });
  };

  const handleCopyToClipboard = async () => {
    return copyUtil(exportData, COLUMNS, 'tab');
  };

  // Handle save to gallery
  const handleSave = () => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSave && typeof params.onSave === 'function') {
      params.onSave({
        toolId: 'handwriting-practice',
        fontStyle,
        lineStyle,
        practiceType,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        lineCount,
        fontSize,
        customText,
        showFormationGuide,
        generatedContent,
      });
    }
    // Call onSaveCallback if provided
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const currentFont = fontConfigs[fontStyle];

  const getLineStyles = () => {
    switch (lineStyle) {
      case 'solid':
        return 'border-b-2 border-gray-400';
      case 'dashed':
        return 'border-b-2 border-dashed border-gray-400';
      case 'dotted':
        return 'border-b-2 border-dotted border-gray-400';
      case 'guidelines':
        return '';
      default:
        return 'border-b-2 border-gray-400';
    }
  };

  const handlePrint = () => {
    const printContent = worksheetRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Handwriting Practice Worksheet</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: white;
              color: black;
            }
            .worksheet-line {
              margin-bottom: 30px;
              padding: 10px 0;
            }
            .guidelines {
              position: relative;
              height: ${fontSize + 40}px;
              margin-bottom: 10px;
            }
            .guidelines::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              border-top: 1px dashed #999;
            }
            .guidelines::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              border-bottom: 2px solid #333;
            }
            .middle-line {
              position: absolute;
              top: 50%;
              left: 0;
              right: 0;
              border-top: 1px dashed #ccc;
            }
            .practice-text {
              font-size: ${fontSize}px;
              color: #ddd;
              font-family: ${currentFont.fontFamily};
              position: relative;
              z-index: 1;
            }
            .practice-row {
              height: ${fontSize + 40}px;
              border-bottom: 1px solid #eee;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 30px;">Handwriting Practice</h1>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const worksheetLines = useMemo(() => {
    return generatedContent.map((text, index) => (
      <div key={index} className="worksheet-line mb-4">
        <div
          className={`relative ${lineStyle === 'guidelines' ? '' : getLineStyles()}`}
          style={{ height: fontSize + 40 }}
        >
          {lineStyle === 'guidelines' && (
            <>
              <div className="absolute top-0 left-0 right-0 border-t border-dashed border-gray-400" />
              <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-300" style={{ transform: 'translateY(-50%)' }} />
              <div className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-500" />
            </>
          )}
          <div
            className="absolute inset-0 flex items-center"
            style={{
              fontFamily: currentFont.fontFamily,
              fontSize: `${fontSize}px`,
              color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
            }}
          >
            {text}
          </div>
        </div>
        {/* Empty practice line below */}
        <div
          className={`relative mt-2 ${lineStyle === 'guidelines' ? '' : getLineStyles()}`}
          style={{ height: fontSize + 40 }}
        >
          {lineStyle === 'guidelines' && (
            <>
              <div className="absolute top-0 left-0 right-0 border-t border-dashed border-gray-400" />
              <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-300" style={{ transform: 'translateY(-50%)' }} />
              <div className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-500" />
            </>
          )}
        </div>
      </div>
    ));
  }, [generatedContent, lineStyle, fontSize, currentFont, isDark]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg"><PenTool className="w-5 h-5 text-indigo-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.handwritingPractice.handwritingPracticeTool', 'Handwriting Practice Tool')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.handwritingPractice.generateWorksheetsForLetterAnd', 'Generate worksheets for letter and word practice')}</p>
            </div>
          </div>
          {(uiConfig?.params as Record<string, any>)?.onSave && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              {isEditFromGallery ? t('tools.handwritingPractice.update', 'Update') : t('tools.handwritingPractice.save', 'Save')}
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-indigo-500 font-medium">
              {isEditFromGallery ? t('tools.handwritingPractice.editingSavedDataFromGallery', 'Editing saved data from gallery') : t('tools.handwritingPractice.prefilledFromAiResponse', 'Prefilled from AI response')}
            </span>
          </div>
        )}

        {/* Font Style Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Type className="w-4 h-4 inline mr-2" />
            {t('tools.handwritingPractice.fontStyle', 'Font Style')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(fontConfigs) as FontStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setFontStyle(style)}
                className={`py-3 px-4 rounded-lg text-sm ${fontStyle === style ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <div className="font-medium">{fontConfigs[style].name}</div>
                <div className={`text-xs mt-1 ${fontStyle === style ? 'text-indigo-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {fontConfigs[style].description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Practice Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <FileText className="w-4 h-4 inline mr-2" />
            {t('tools.handwritingPractice.practiceType', 'Practice Type')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['letters', 'words', 'sentences', 'custom'] as PracticeType[]).map((type) => (
              <button
                key={type}
                onClick={() => setPracticeType(type)}
                className={`py-2 px-3 rounded-lg text-sm capitalize ${practiceType === type ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Letter Options (when letters selected) */}
        {practiceType === 'letters' && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.handwritingPractice.uppercaseLettersAZ', 'Uppercase Letters (A-Z)')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.handwritingPractice.lowercaseLettersAZ', 'Lowercase Letters (a-z)')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.handwritingPractice.numbers09', 'Numbers (0-9)')}</span>
              </label>
            </div>
          </div>
        )}

        {/* Custom Text Input */}
        {practiceType === 'custom' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.handwritingPractice.enterCustomTextOneItem', 'Enter Custom Text (one item per line)')}
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={t('tools.handwritingPractice.enterLettersWordsOrSentences', 'Enter letters, words, or sentences...')}
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
            />
          </div>
        )}

        {/* Line Style Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Baseline className="w-4 h-4 inline mr-2" />
            {t('tools.handwritingPractice.lineStyle', 'Line Style')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(lineConfigs) as LineStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setLineStyle(style)}
                className={`py-2 px-3 rounded-lg text-sm ${lineStyle === style ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {lineConfigs[style].name}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.handwritingPractice.numberOfLines', 'Number of Lines')}
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={lineCount}
              onChange={(e) => setLineCount(parseInt(e.target.value) || 6)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.handwritingPractice.fontSizePx', 'Font Size (px)')}
            </label>
            <input
              type="number"
              min={24}
              max={96}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Show Formation Guide Toggle */}
        {practiceType === 'letters' && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showFormationGuide}
              onChange={(e) => setShowFormationGuide(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
            />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.handwritingPractice.showLetterFormationGuides', 'Show letter formation guides')}</span>
          </label>
        )}

        {/* Generate Button */}
        <button
          onClick={generateContent}
          className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('tools.handwritingPractice.generateWorksheet', 'Generate Worksheet')}
        </button>

        {/* Worksheet Preview */}
        {generatedContent.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.handwritingPractice.worksheetPreview', 'Worksheet Preview')}</h4>
              <div className="flex items-center gap-2">
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportJSON={handleExportJSON}
                  onPrint={handlePrint}
                  onCopyToClipboard={handleCopyToClipboard}
                  showImport={false}
                  theme={isDark ? 'dark' : 'light'}
                />
                <button
                  onClick={handlePrint}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
                >
                  <Printer className="w-4 h-4" />
                  {t('tools.handwritingPractice.print', 'Print')}
                </button>
              </div>
            </div>

            <div
              ref={worksheetRef}
              className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}
            >
              {worksheetLines}
            </div>
          </div>
        )}

        {/* Letter Formation Guide */}
        {practiceType === 'letters' && showFormationGuide && generatedContent.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} border`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Info className="w-4 h-4 inline mr-2" />
              {t('tools.handwritingPractice.letterFormationGuides', 'Letter Formation Guides')}
            </h4>
            <div className="space-y-2">
              {generatedContent.map((letter, idx) => {
                const guide = letterFormationGuides[letter.toUpperCase()];
                if (!guide) return null;
                return (
                  <div key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-bold text-indigo-500 mr-2" style={{ fontFamily: currentFont.fontFamily }}>
                      {letter}
                    </span>
                    {guide}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.handwritingPractice.tipsForBetterHandwriting', 'Tips for Better Handwriting:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Hold your pen or pencil with a relaxed grip</li>
                <li>- Sit with good posture and paper at a comfortable angle</li>
                <li>- Practice each letter slowly before increasing speed</li>
                <li>- Use the guidelines to maintain consistent letter height</li>
                <li>- Take breaks to avoid hand fatigue</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandwritingPracticeTool;
