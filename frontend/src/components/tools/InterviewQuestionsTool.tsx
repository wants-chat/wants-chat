import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Loader2, Copy, Check, Briefcase, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const interviewTypes = [
  { value: 'behavioral', label: 'Behavioral Interview' },
  { value: 'technical', label: 'Technical Interview' },
  { value: 'case', label: 'Case Study Interview' },
  { value: 'culture-fit', label: 'Culture Fit Interview' },
  { value: 'competency', label: 'Competency-Based' },
  { value: 'stress', label: 'Stress Interview' },
  { value: 'panel', label: 'Panel Interview' },
  { value: 'exit', label: 'Exit Interview' },
  { value: 'informational', label: 'Informational Interview' },
];

const roles = [
  { value: 'software-engineer', label: 'Software Engineer' },
  { value: 'product-manager', label: 'Product Manager' },
  { value: 'designer', label: 'Designer (UI/UX)' },
  { value: 'data-scientist', label: 'Data Scientist' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance/Accounting' },
  { value: 'operations', label: 'Operations' },
  { value: 'executive', label: 'Executive/Leadership' },
  { value: 'customer-service', label: 'Customer Service' },
  { value: 'custom', label: 'Custom Role' },
];

const experienceLevels = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior Level (6-10 years)' },
  { value: 'lead', label: 'Lead/Principal (10+ years)' },
  { value: 'executive', label: 'Executive/C-Level' },
];

interface InterviewQuestionsToolProps {
  uiConfig?: UIConfig;
}

export const InterviewQuestionsTool: React.FC<InterviewQuestionsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [interviewType, setInterviewType] = useState('behavioral');
  const [role, setRole] = useState('software-engineer');
  const [customRole, setCustomRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [skills, setSkills] = useState('');
  const [companyContext, setCompanyContext] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setSkills(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (role === 'custom' && !customRole.trim()) {
      setError('Please enter the custom role');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const typeLabel = interviewTypes.find(t => t.value === interviewType)?.label;
      const roleLabel = role === 'custom' ? customRole : roles.find(r => r.value === role)?.label;
      const levelLabel = experienceLevels.find(l => l.value === experienceLevel)?.label;

      const prompt = `Generate ${questionCount} ${typeLabel} interview questions for a ${roleLabel} position at the ${levelLabel} level.

${skills ? `Key skills to assess: ${skills}` : ''}
${companyContext ? `Company/Role context: ${companyContext}` : ''}

Requirements:
1. Questions should be appropriate for ${typeLabel} format
2. Difficulty should match ${levelLabel} expectations
3. Include a mix of:
   - Questions about past experiences
   - Situational/hypothetical scenarios
   - ${interviewType === 'technical' ? 'Technical problem-solving questions' : 'Soft skills assessment'}
4. For each question, provide:
   - The question itself
   - What you're looking to assess
   - Good answer indicators (what to look for)
5. Questions should help evaluate fit for ${roleLabel} role
6. Make questions specific and actionable

Format each question with clear numbering and structure.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an experienced HR professional and hiring manager who creates insightful interview questions that effectively assess candidates.',
        temperature: 0.7,
        maxTokens: 3000,
      });

      if (response.success && response.data?.text) {
        setQuestions(response.data.text);
      } else {
        setError(response.error || 'Failed to generate questions');
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
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-teal-900/20' : 'from-white to-teal-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Users className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.interviewQuestions.interviewQuestionsGenerator', 'Interview Questions Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.interviewQuestions.createEffectiveInterviewQuestionsFor', 'Create effective interview questions for any role')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.interviewQuestions.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.interviewQuestions.interviewType', 'Interview Type')}</label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {interviewTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.interviewQuestions.experienceLevel', 'Experience Level')}</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {experienceLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Briefcase className="w-4 h-4 inline mr-1" /> Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.interviewQuestions.numberOfQuestions', 'Number of Questions')}</label>
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

        {role === 'custom' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.interviewQuestions.customRole', 'Custom Role *')}</label>
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder={t('tools.interviewQuestions.enterTheJobTitleRole', 'Enter the job title/role')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.interviewQuestions.keySkillsToAssess', 'Key Skills to Assess')}</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder={t('tools.interviewQuestions.eGLeadershipProblemSolving', 'e.g., leadership, problem-solving, React, Python, communication')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.interviewQuestions.companyRoleContextOptional', 'Company/Role Context (Optional)')}</label>
          <textarea
            value={companyContext}
            onChange={(e) => setCompanyContext(e.target.value)}
            placeholder={t('tools.interviewQuestions.anySpecificContextAboutThe', 'Any specific context about the company, team, or role requirements...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-6 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
          {isGenerating ? t('tools.interviewQuestions.generatingQuestions', 'Generating Questions...') : t('tools.interviewQuestions.generateQuestions', 'Generate Questions')}
        </button>

        {questions && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.interviewQuestions.interviewQuestions', 'Interview Questions')}</h4>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.interviewQuestions.copied', 'Copied!') : t('tools.interviewQuestions.copyAll', 'Copy All')}
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

export default InterviewQuestionsTool;
