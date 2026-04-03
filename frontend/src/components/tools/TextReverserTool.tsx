import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Copy, Check, ArrowDownUp, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type ReverseMode = 'characters' | 'words' | 'lines' | 'sentences';

interface TextReverserToolProps {
  uiConfig?: UIConfig;
}

export const TextReverserTool: React.FC<TextReverserToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [input, setInput] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.sourceText || '';
      if (textContent) {
        setInput(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);
  const [mode, setMode] = useState<ReverseMode>('characters');
  const [copied, setCopied] = useState(false);

  const reversed = useMemo(() => {
    if (!input) return '';

    switch (mode) {
      case 'characters':
        return input.split('').reverse().join('');
      case 'words':
        return input.split(/(\s+)/).map(part =>
          /\s+/.test(part) ? part : part.split('').reverse().join('')
        ).join('');
      case 'lines':
        return input.split('\n').reverse().join('\n');
      case 'sentences':
        return input.split(/([.!?]+\s*)/).reduce((acc, part, i, arr) => {
          if (i % 2 === 0 && part) {
            acc.push(part + (arr[i + 1] || ''));
          }
          return acc;
        }, [] as string[]).reverse().join('');
      default:
        return input;
    }
  }, [input, mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reversed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modes: { value: ReverseMode; label: string; example: string }[] = [
    { value: 'characters', label: 'All Characters', example: 'abc → cba' },
    { value: 'words', label: 'Each Word', example: 'hello world → olleh dlrow' },
    { value: 'lines', label: 'Line Order', example: 'Line 1\\nLine 2 → Line 2\\nLine 1' },
    { value: 'sentences', label: 'Sentence Order', example: 'First. Second. → Second. First.' },
  ];

  const examples = [
    'Hello World!',
    'The quick brown fox jumps over the lazy dog.',
    'First line\nSecond line\nThird line',
    'I am happy. You are great. We succeed.',
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <RotateCcw className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.textReverser.textReverser', 'Text Reverser')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.textReverser.reverseTextInVariousWays', 'Reverse text in various ways')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.textReverser.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Mode Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.textReverser.reverseMode', 'Reverse Mode')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {modes.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  mode === m.value
                    ? 'bg-cyan-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{m.label}</div>
                <div className={`text-xs mt-1 ${mode === m.value ? 'opacity-75' : 'opacity-60'}`}>
                  {m.example}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.textReverser.tryExamples', 'Try Examples')}
          </label>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => setInput(ex)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {ex.length > 20 ? ex.substring(0, 20) + '...' : ex}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.textReverser.inputText', 'Input Text')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('tools.textReverser.enterTextToReverse', 'Enter text to reverse...')}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border resize-none ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowDownUp className={`w-6 h-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.textReverser.reversedText', 'Reversed Text')}
            </label>
            <button
              onClick={handleCopy}
              disabled={!reversed}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 ${
                copied
                  ? 'bg-green-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.textReverser.copied', 'Copied!') : t('tools.textReverser.copy', 'Copy')}
            </button>
          </div>
          <div className={`min-h-[100px] p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-100'} border`}>
            <pre className={`whitespace-pre-wrap break-words font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {reversed || <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.textReverser.reversedTextWillAppearHere', 'Reversed text will appear here...')}</span>}
            </pre>
          </div>
        </div>

        {/* Stats */}
        {input && (
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {input.length}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.textReverser.characters', 'Characters')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {input.trim().split(/\s+/).filter(Boolean).length}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.textReverser.words', 'Words')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {input.split('\n').length}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.textReverser.lines', 'Lines')}</div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.textReverser.useCases', 'Use cases:')}</strong> Creating mirror text, checking palindromes,
            reversing log files, or just having fun with text!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextReverserTool;
