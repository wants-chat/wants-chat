import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Loader2, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

const contexts = [
  { value: 'dating', label: 'Dating/Romantic' },
  { value: 'networking', label: 'Professional Networking' },
  { value: 'party', label: 'Party/Social Event' },
  { value: 'workplace', label: 'Workplace/Colleagues' },
  { value: 'new-friends', label: 'Making New Friends' },
  { value: 'family', label: 'Family Gathering' },
  { value: 'online', label: 'Online/DMs' },
  { value: 'icebreaker', label: 'Group Ice Breaker' },
];

const styles = [
  { value: 'funny', label: 'Funny & Playful' },
  { value: 'thoughtful', label: 'Thoughtful & Deep' },
  { value: 'casual', label: 'Casual & Easy' },
  { value: 'flirty', label: 'Flirty & Charming' },
  { value: 'professional', label: 'Professional' },
  { value: 'creative', label: 'Creative & Unique' },
];

interface ConversationStartersToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS: ColumnConfig[] = [
  {
    key: 'number',
    header: 'No.',
    type: 'number',
  },
  {
    key: 'starter',
    header: 'Conversation Starter',
    type: 'string',
  },
];

export const ConversationStartersTool: React.FC<ConversationStartersToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [context, setContext] = useState('networking');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        context?: string;
        style?: string;
        aboutThem?: string;
        sharedInterest?: string;
        count?: string;
      };
      if (params.context) setContext(params.context);
      if (params.style) setStyle(params.style);
      if (params.aboutThem) setAboutThem(params.aboutThem);
      if (params.sharedInterest) setSharedInterest(params.sharedInterest);
      if (params.count) setCount(params.count);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);
  const [style, setStyle] = useState('casual');
  const [aboutThem, setAboutThem] = useState('');
  const [sharedInterest, setSharedInterest] = useState('');
  const [count, setCount] = useState('5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starters, setStarters] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const contextLabel = contexts.find(c => c.value === context)?.label;
      const styleLabel = styles.find(s => s.value === style)?.label;

      const prompt = `Generate ${count} conversation starters for a ${contextLabel} context.

Style: ${styleLabel}
${aboutThem ? `About the person: ${aboutThem}` : ''}
${sharedInterest ? `Shared interest/common ground: ${sharedInterest}` : ''}

Requirements:
1. Create ${count} unique, ${styleLabel.toLowerCase()} conversation starters
2. Appropriate for ${contextLabel} situations
3. Each should be natural and easy to use
4. Avoid clichés and overused lines
5. Include a mix of:
   - Questions that invite responses
   - Observations that open dialogue
   - ${style === 'funny' ? 'Witty or humorous openers' : 'Genuine conversation starters'}
6. Make them feel authentic, not scripted
7. ${context === 'dating' || context === 'online' ? 'Not creepy or too forward' : ''}

Format: Number each starter (1. 2. 3. etc.)`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a social communication expert who creates natural, engaging conversation starters that help people connect.',
        temperature: 0.9,
        maxTokens: 1500,
      });

      if (response.success && response.data?.text) {
        const parsed = response.data.text
          .split('\n')
          .filter((line: string) => /^\d+[\.\)]/.test(line.trim()))
          .map((line: string) => line.replace(/^\d+[\.\)]\s*/, '').trim());
        setStarters(parsed.length > 0 ? parsed : [response.data.text]);
      } else {
        setError(response.error || 'Failed to generate starters');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Prepare data for export
  const exportData = starters.map((starter, index) => ({
    number: index + 1,
    starter,
  }));

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(exportData, COLUMNS, { filename: 'conversation-starters' });
  };

  const handleExportExcel = () => {
    exportToExcel(exportData, COLUMNS, { filename: 'conversation-starters' });
  };

  const handleExportJSON = () => {
    exportToJSON(exportData, { filename: 'conversation-starters' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(exportData, COLUMNS, {
      filename: 'conversation-starters',
      title: 'Conversation Starters',
      subtitle: `Context: ${contexts.find(c => c.value === context)?.label} | Style: ${styles.find(s => s.value === style)?.label}`,
    });
  };

  const handlePrint = () => {
    printData(exportData, COLUMNS, {
      title: 'Conversation Starters Report',
    });
  };

  const handleCopyToClipboard = async () => {
    return copyUtil(exportData, COLUMNS, 'tab');
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-blue-900/20' : 'from-white to-blue-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.conversationStarters.conversationStarters', 'Conversation Starters')}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.conversationStarters.generateEngagingWaysToStart', 'Generate engaging ways to start conversations')}</p>
            </div>
          </div>
          {starters.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              disabled={starters.length === 0}
              showImport={false}
              theme={theme}
            />
          )}
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.conversationStarters.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.conversationStarters.context', 'Context')}</label>
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {contexts.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.conversationStarters.style', 'Style')}</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {styles.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.conversationStarters.aboutThemOptional', 'About Them (Optional)')}</label>
          <input
            type="text"
            value={aboutThem}
            onChange={(e) => setAboutThem(e.target.value)}
            placeholder={t('tools.conversationStarters.whatDoYouKnowAbout', 'What do you know about this person? (job, hobby, etc.)')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.conversationStarters.sharedInterestOptional', 'Shared Interest (Optional)')}</label>
          <input
            type="text"
            value={sharedInterest}
            onChange={(e) => setSharedInterest(e.target.value)}
            placeholder={t('tools.conversationStarters.anyCommonGroundEventLocation', 'Any common ground? (event, location, mutual connection)')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.conversationStarters.numberOfStarters', 'Number of Starters')}</label>
          <select
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          >
            <option value="3">3 Starters</option>
            <option value="5">5 Starters</option>
            <option value="7">7 Starters</option>
            <option value="10">10 Starters</option>
          </select>
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
          {isGenerating ? t('tools.conversationStarters.generating', 'Generating...') : t('tools.conversationStarters.generateStarters', 'Generate Starters')}
        </button>

        {starters.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.conversationStarters.conversationStarters2', 'Conversation Starters')}</h4>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {t('tools.conversationStarters.regenerate', 'Regenerate')}
              </button>
            </div>
            <div className="space-y-3">
              {starters.map((starter, index) => (
                <div
                  key={index}
                  className={`p-4 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl flex items-start justify-between gap-4`}
                >
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} flex-1`}>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mr-2`}>{index + 1}.</span>
                    {starter}
                  </p>
                  <button
                    onClick={() => handleCopy(starter, index)}
                    className={`flex-shrink-0 p-2 ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'} rounded-lg`}
                  >
                    {copiedIndex === index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationStartersTool;
