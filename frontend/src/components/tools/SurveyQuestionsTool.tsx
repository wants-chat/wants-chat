import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SurveyQuestionsToolProps {
  uiConfig?: UIConfig;
}

const surveyTypes = [
  { value: 'customer-satisfaction', label: 'Customer Satisfaction (CSAT)' },
  { value: 'nps', label: 'Net Promoter Score (NPS)' },
  { value: 'product-feedback', label: 'Product Feedback' },
  { value: 'employee', label: 'Employee Survey' },
  { value: 'market-research', label: 'Market Research' },
  { value: 'event-feedback', label: 'Event Feedback' },
  { value: 'website-ux', label: 'Website/UX Feedback' },
  { value: 'exit', label: 'Exit Survey' },
  { value: 'onboarding', label: 'Onboarding Survey' },
  { value: 'academic', label: 'Academic Research' },
];

const questionStyles = [
  { value: 'mixed', label: 'Mixed (Multiple Choice + Open-ended)' },
  { value: 'scale', label: 'Rating Scales (1-5, 1-10)' },
  { value: 'multiple', label: 'Multiple Choice Only' },
  { value: 'open', label: 'Open-ended Only' },
  { value: 'likert', label: 'Likert Scale' },
];

export const SurveyQuestionsTool: React.FC<SurveyQuestionsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [surveyType, setSurveyType] = useState('customer-satisfaction');
  const [questionStyle, setQuestionStyle] = useState('mixed');
  const [purpose, setPurpose] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [topics, setTopics] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setPurpose(params.text || params.content || '');
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.surveyType) setSurveyType(params.formData.surveyType);
        if (params.formData.questionStyle) setQuestionStyle(params.formData.questionStyle);
        if (params.formData.purpose) setPurpose(params.formData.purpose);
        if (params.formData.targetAudience) setTargetAudience(params.formData.targetAudience);
        if (params.formData.topics) setTopics(params.formData.topics);
        if (params.formData.questionCount) setQuestionCount(params.formData.questionCount);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!purpose.trim()) {
      setError('Please describe the purpose of your survey');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const typeLabel = surveyTypes.find(t => t.value === surveyType)?.label;
      const styleLabel = questionStyles.find(s => s.value === questionStyle)?.label;

      const prompt = `Create a ${typeLabel} survey with ${questionCount} questions.

Survey Details:
- Purpose: ${purpose}
- Target Audience: ${targetAudience || 'General'}
- Topics to Cover: ${topics || 'Related to survey purpose'}
- Question Style: ${styleLabel}

Requirements:
1. Create clear, unbiased questions
2. Use ${styleLabel} format
3. Start with easier questions, progress to more specific ones
4. Include:
   - Opening/demographic questions if appropriate
   - Core topic questions
   - Summary/open feedback question at the end
5. For scale questions, provide the scale labels
6. For multiple choice, provide answer options
7. Avoid leading questions or double-barreled questions
8. Keep questions concise and easy to understand
9. Make questions actionable (answers should provide useful insights)

Format each question clearly with:
- Question number
- Question text
- Answer type/options
- (Optional) Purpose of the question`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a survey design expert who creates effective, unbiased surveys that generate actionable insights.',
        temperature: 0.7,
        maxTokens: 3000,
      });

      if (response.success && response.data?.text) {
        setQuestions(response.data.text);
      } else {
        setError(response.error || 'Failed to generate survey questions');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(questions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-emerald-900/20' : 'from-white to-emerald-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <ClipboardList className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.surveyQuestions.surveyQuestionsGenerator', 'Survey Questions Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.surveyQuestions.createEffectiveSurveyQuestions', 'Create effective survey questions')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.surveyQuestions.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.surveyQuestions.surveyType', 'Survey Type')}</label>
            <select
              value={surveyType}
              onChange={(e) => setSurveyType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {surveyTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.surveyQuestions.questionStyle', 'Question Style')}</label>
            <select
              value={questionStyle}
              onChange={(e) => setQuestionStyle(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {questionStyles.map((style) => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.surveyQuestions.surveyPurpose', 'Survey Purpose *')}</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder={t('tools.surveyQuestions.whatDoYouWantTo', 'What do you want to learn from this survey? What decisions will it inform?')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.surveyQuestions.targetAudience', 'Target Audience')}</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder={t('tools.surveyQuestions.whoWillTakeThisSurvey', 'Who will take this survey?')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.surveyQuestions.numberOfQuestions', 'Number of Questions')}</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              <option value="5">5 Questions</option>
              <option value="10">10 Questions</option>
              <option value="15">15 Questions</option>
              <option value="20">20 Questions</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.surveyQuestions.specificTopicsToCover', 'Specific Topics to Cover')}</label>
          <input
            type="text"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder={t('tools.surveyQuestions.eGPricingFeaturesSupport', 'e.g., pricing, features, support, user experience')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !purpose.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardList className="w-5 h-5" />}
          {isGenerating ? t('tools.surveyQuestions.generatingSurvey', 'Generating Survey...') : t('tools.surveyQuestions.generateSurveyQuestions', 'Generate Survey Questions')}
        </button>

        {questions && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.surveyQuestions.surveyQuestions', 'Survey Questions')}</h4>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.surveyQuestions.copied', 'Copied!') : t('tools.surveyQuestions.copyAll', 'Copy All')}
              </button>
            </div>
            <div className={`p-6 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl max-h-[500px] overflow-y-auto`}>
              <pre className={`whitespace-pre-wrap text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-sans leading-relaxed`}>{questions}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyQuestionsTool;
