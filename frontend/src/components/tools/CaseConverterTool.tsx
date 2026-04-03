import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CaseConverterToolProps {
  uiConfig?: UIConfig;
}

export const CaseConverterTool: React.FC<CaseConverterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
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
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeCase, setActiveCase] = useState<string | null>(null);

  const toUpperCase = () => {
    setActiveCase('upper');
    setOutput(input.toUpperCase());
  };

  const toLowerCase = () => {
    setActiveCase('lower');
    setOutput(input.toLowerCase());
  };

  const toTitleCase = () => {
    setActiveCase('title');
    const result = input.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    setOutput(result);
  };

  const toSentenceCase = () => {
    setActiveCase('sentence');
    const result = input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => {
      return c.toUpperCase();
    });
    setOutput(result);
  };

  const toCamelCase = () => {
    setActiveCase('camel');
    const result = input
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
    setOutput(result);
  };

  const toSnakeCase = () => {
    setActiveCase('snake');
    const result = input
      .replace(/\s+/g, '_')
      .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      .replace(/^_/, '')
      .replace(/_+/g, '_')
      .toLowerCase();
    setOutput(result);
  };

  const toKebabCase = () => {
    setActiveCase('kebab');
    const result = input
      .replace(/\s+/g, '-')
      .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      .replace(/^-/, '')
      .replace(/-+/g, '-')
      .toLowerCase();
    setOutput(result);
  };

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.caseConverter.caseConverter', 'Case Converter')}
      </h2>

      <div className="space-y-4">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.caseConverter.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.caseConverter.inputText', 'Input Text')}
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOutput('');
              setActiveCase(null);
            }}
            placeholder={t('tools.caseConverter.enterTextToConvert', 'Enter text to convert...')}
            className={`w-full h-32 p-3 rounded-lg text-sm border ${
              theme === 'dark'
                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>

        {/* Conversion Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toUpperCase}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'upper'
                ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                : theme === 'dark'
                ? 'bg-gray-600 text-white hover:bg-gray-500 border border-gray-500'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {t('tools.caseConverter.uppercase', 'UPPERCASE')}
          </button>
          <button
            onClick={toLowerCase}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'lower'
                ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                : theme === 'dark'
                ? 'bg-gray-600 text-white hover:bg-gray-500 border border-gray-500'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            lowercase
          </button>
          <button
            onClick={toTitleCase}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'title'
                ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                : theme === 'dark'
                ? 'bg-gray-600 text-white hover:bg-gray-500 border border-gray-500'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {t('tools.caseConverter.titleCase', 'Title Case')}
          </button>
          <button
            onClick={toSentenceCase}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'sentence'
                ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                : theme === 'dark'
                ? 'bg-gray-600 text-white hover:bg-gray-500 border border-gray-500'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {t('tools.caseConverter.sentenceCase', 'Sentence case')}
          </button>
          <button
            onClick={toCamelCase}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'camel'
                ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                : theme === 'dark'
                ? 'bg-gray-600 text-white hover:bg-gray-500 border border-gray-500'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {t('tools.caseConverter.camelcase', 'camelCase')}
          </button>
          <button
            onClick={toSnakeCase}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'snake'
                ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                : theme === 'dark'
                ? 'bg-gray-600 text-white hover:bg-gray-500 border border-gray-500'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {t('tools.caseConverter.snakeCase', 'snake_case')}
          </button>
          <button
            onClick={toKebabCase}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'kebab'
                ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                : theme === 'dark'
                ? 'bg-gray-600 text-white hover:bg-gray-500 border border-gray-500'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            kebab-case
          </button>
        </div>

        {/* Output */}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.caseConverter.output', 'Output')}
              </label>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.caseConverter.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.caseConverter.copy', 'Copy')}
                  </>
                )}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              className={`w-full h-32 p-3 rounded-lg text-sm border ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-50 text-gray-900 border-gray-300'
              } focus:outline-none`}
            />
          </div>
        )}
      </div>
    </div>
  );
};
