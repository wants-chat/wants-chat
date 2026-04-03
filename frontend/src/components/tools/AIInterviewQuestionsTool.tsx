import React, { useState, useEffect } from 'react';
import { Users, Copy, Check, RefreshCw, Sparkles, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

type QuestionType = 'behavioral' | 'technical' | 'situational' | 'competency' | 'culture' | 'general';
type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';
type Industry = 'technology' | 'finance' | 'healthcare' | 'marketing' | 'sales' | 'hr' | 'operations' | 'general';

interface InterviewQuestion {
  question: string;
  type: QuestionType;
  purpose: string;
  followUp?: string;
}

interface QuestionTemplate {
  question: string;
  type: QuestionType;
  purpose: string;
  followUp?: string;
  levels: ExperienceLevel[];
  industries: Industry[];
}

const questionTemplates: QuestionTemplate[] = [
  // Behavioral Questions
  { question: "Tell me about a time when you had to meet a tight deadline. How did you manage your time and priorities?", type: 'behavioral', purpose: "Assesses time management and prioritization skills", followUp: "What would you do differently next time?", levels: ['entry', 'mid', 'senior', 'executive'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
  { question: "Describe a situation where you had to work with a difficult colleague. How did you handle it?", type: 'behavioral', purpose: "Evaluates interpersonal and conflict resolution skills", followUp: "What did you learn from that experience?", levels: ['entry', 'mid', 'senior', 'executive'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
  { question: "Give an example of when you had to quickly learn a new skill or technology. What was your approach?", type: 'behavioral', purpose: "Measures adaptability and learning agility", followUp: "How do you stay current with industry developments?", levels: ['entry', 'mid', 'senior'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
  { question: "Tell me about a project you're most proud of. What was your role and what made it successful?", type: 'behavioral', purpose: "Reveals achievements and self-motivation", followUp: "What challenges did you face along the way?", levels: ['mid', 'senior', 'executive'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
  { question: "Describe a time when you received constructive criticism. How did you respond?", type: 'behavioral', purpose: "Assesses openness to feedback and growth mindset", followUp: "How has that feedback influenced your work since?", levels: ['entry', 'mid', 'senior'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },

  // Situational Questions
  { question: "If you were assigned to a project with unclear requirements, how would you proceed?", type: 'situational', purpose: "Tests problem-solving and initiative", followUp: "How would you communicate uncertainties to stakeholders?", levels: ['entry', 'mid', 'senior'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
  { question: "How would you handle a situation where you disagreed with your manager's decision?", type: 'situational', purpose: "Evaluates professionalism and communication skills", followUp: "What if your concerns were dismissed?", levels: ['entry', 'mid', 'senior', 'executive'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
  { question: "What would you do if you discovered a significant error in your work after it had been delivered?", type: 'situational', purpose: "Measures accountability and integrity", followUp: "How would you prevent similar errors in the future?", levels: ['entry', 'mid', 'senior'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
  { question: "How would you prioritize multiple high-priority tasks with competing deadlines?", type: 'situational', purpose: "Tests prioritization and decision-making skills", followUp: "What criteria would you use to make those decisions?", levels: ['mid', 'senior', 'executive'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },

  // Technical - Technology
  { question: "Walk me through your approach to debugging a complex production issue.", type: 'technical', purpose: "Assesses problem-solving methodology", followUp: "How do you ensure the fix doesn't introduce new issues?", levels: ['mid', 'senior'], industries: ['technology'] },
  { question: "How do you approach system design for scalability and reliability?", type: 'technical', purpose: "Evaluates architectural thinking", followUp: "Can you give a specific example from your experience?", levels: ['senior', 'executive'], industries: ['technology'] },
  { question: "Explain your experience with agile methodologies and how you've implemented them.", type: 'technical', purpose: "Measures process knowledge and adaptability", followUp: "What challenges have you faced with agile adoption?", levels: ['mid', 'senior'], industries: ['technology'] },

  // Technical - Finance
  { question: "How do you approach financial modeling for new business initiatives?", type: 'technical', purpose: "Assesses analytical and forecasting skills", followUp: "How do you validate your assumptions?", levels: ['mid', 'senior'], industries: ['finance'] },
  { question: "Describe your experience with risk assessment and mitigation strategies.", type: 'technical', purpose: "Evaluates risk management capabilities", followUp: "Can you share a specific example?", levels: ['senior', 'executive'], industries: ['finance'] },

  // Technical - Marketing
  { question: "How do you measure the success of a marketing campaign?", type: 'technical', purpose: "Tests analytical and metrics-driven thinking", followUp: "What KPIs do you prioritize and why?", levels: ['mid', 'senior'], industries: ['marketing'] },
  { question: "Describe your approach to developing a content strategy.", type: 'technical', purpose: "Assesses strategic planning abilities", followUp: "How do you adapt strategy based on performance data?", levels: ['mid', 'senior'], industries: ['marketing'] },

  // Technical - Sales
  { question: "Walk me through your sales process from prospecting to close.", type: 'technical', purpose: "Evaluates sales methodology and discipline", followUp: "How do you handle objections during this process?", levels: ['mid', 'senior'], industries: ['sales'] },
  { question: "How do you approach building relationships with enterprise clients?", type: 'technical', purpose: "Tests relationship-building and strategic selling skills", followUp: "Can you share a success story?", levels: ['senior', 'executive'], industries: ['sales'] },

  // Competency Questions
  { question: "How do you ensure quality in your work while meeting deadlines?", type: 'competency', purpose: "Assesses quality orientation and efficiency", followUp: "What systems or processes do you use?", levels: ['entry', 'mid', 'senior'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
  { question: "Describe your approach to mentoring and developing team members.", type: 'competency', purpose: "Evaluates leadership and development skills", followUp: "Can you share a specific success story?", levels: ['senior', 'executive'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
  { question: "How do you stay motivated when working on long-term projects?", type: 'competency', purpose: "Tests self-motivation and persistence", followUp: "How do you maintain team morale?", levels: ['mid', 'senior'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },

  // Culture Fit Questions
  { question: "What type of work environment helps you do your best work?", type: 'culture', purpose: "Assesses culture fit and self-awareness", followUp: "How do you adapt to different environments?", levels: ['entry', 'mid', 'senior', 'executive'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
  { question: "How do you balance collaboration with individual work?", type: 'culture', purpose: "Evaluates teamwork and autonomy preferences", followUp: "What's your ideal balance?", levels: ['entry', 'mid', 'senior'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
  { question: "What values are most important to you in a workplace?", type: 'culture', purpose: "Tests alignment with organizational values", followUp: "How have you demonstrated these values?", levels: ['entry', 'mid', 'senior', 'executive'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },

  // General Questions
  { question: "Why are you interested in this role at our company?", type: 'general', purpose: "Assesses motivation and research about the company", followUp: "What specifically attracted you to this position?", levels: ['entry', 'mid', 'senior', 'executive'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
  { question: "Where do you see yourself in 5 years?", type: 'general', purpose: "Evaluates career goals and ambition", followUp: "How does this role fit into that plan?", levels: ['entry', 'mid', 'senior'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
  { question: "What questions do you have for me about the role or company?", type: 'general', purpose: "Tests preparation and genuine interest", levels: ['entry', 'mid', 'senior', 'executive'], industries: ['technology', 'finance', 'healthcare', 'marketing', 'sales', 'hr', 'operations', 'general'] },
];

interface AIInterviewQuestionsToolProps {
  uiConfig?: UIConfig;
}

export const AIInterviewQuestionsTool: React.FC<AIInterviewQuestionsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<InterviewQuestion[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    jobTitle: '',
    industry: 'general' as Industry,
    experienceLevel: 'mid' as ExperienceLevel,
    skills: '',
  });

  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['behavioral', 'situational', 'competency']);
  const [questionCount, setQuestionCount] = useState(8);

  const toggleType = (type: QuestionType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const generateQuestions = () => {
    const applicableQuestions = questionTemplates.filter(
      q => q.levels.includes(formData.experienceLevel) &&
           q.industries.includes(formData.industry) &&
           selectedTypes.includes(q.type)
    );

    const shuffled = [...applicableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    const questions = selected.map(template => ({
      question: template.question,
      type: template.type,
      purpose: template.purpose,
      followUp: template.followUp,
    }));

    setGeneratedQuestions(questions);
    setExpandedIndex(null);
  };

  const handleCopyAll = () => {
    const text = generatedQuestions
      .map((q, i) => {
        let content = `${i + 1}. [${q.type.toUpperCase()}] ${q.question}\n   Purpose: ${q.purpose}`;
        if (q.followUp) content += `\n   Follow-up: ${q.followUp}`;
        return content;
      })
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.jobTitle) setFormData(prev => ({ ...prev, jobTitle: params.jobTitle }));
      if (params.industry) setFormData(prev => ({ ...prev, industry: params.industry }));
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  const industries: { value: Industry; label: string }[] = [
    { value: 'general', label: 'General' },
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'operations', label: 'Operations' },
  ];

  const experienceLevels: { value: ExperienceLevel; label: string }[] = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' },
  ];

  const questionTypes: { value: QuestionType; label: string; desc: string }[] = [
    { value: 'behavioral', label: 'Behavioral', desc: 'Past experiences' },
    { value: 'situational', label: 'Situational', desc: 'Hypothetical scenarios' },
    { value: 'technical', label: 'Technical', desc: 'Skills & knowledge' },
    { value: 'competency', label: 'Competency', desc: 'Core abilities' },
    { value: 'culture', label: 'Culture Fit', desc: 'Values alignment' },
    { value: 'general', label: 'General', desc: 'Standard questions' },
  ];

  const getTypeColor = (type: QuestionType) => {
    const colors: Record<QuestionType, string> = {
      behavioral: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      situational: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      technical: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      competency: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      culture: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      general: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[type];
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Users className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aIInterviewQuestions.aiInterviewQuestionsGenerator', 'AI Interview Questions Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aIInterviewQuestions.generateTailoredInterviewQuestionsFor', 'Generate tailored interview questions for any role')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.aIInterviewQuestions.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Job Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIInterviewQuestions.jobTitle', 'Job Title')}</label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              placeholder={t('tools.aIInterviewQuestions.eGSoftwareEngineer', 'e.g., Software Engineer')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIInterviewQuestions.industry', 'Industry')}</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value as Industry })}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            >
              {industries.map((ind) => (
                <option key={ind.value} value={ind.value}>{ind.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIInterviewQuestions.experienceLevel', 'Experience Level')}</label>
          <div className="flex flex-wrap gap-2">
            {experienceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setFormData({ ...formData, experienceLevel: level.value })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  formData.experienceLevel === level.value
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Types */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIInterviewQuestions.questionTypes', 'Question Types')}</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {questionTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => toggleType(type.value)}
                className={`p-3 rounded-xl text-left transition-all ${
                  selectedTypes.includes(type.value)
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{type.label}</div>
                <div className={`text-xs ${selectedTypes.includes(type.value) ? 'text-teal-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Number of Questions: {questionCount}</label>
          <input
            type="range"
            min="5"
            max="15"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateQuestions}
          disabled={selectedTypes.length === 0}
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          {t('tools.aIInterviewQuestions.generateInterviewQuestions', 'Generate Interview Questions')}
        </button>

        {/* Generated Questions */}
        {generatedQuestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                Generated Questions ({generatedQuestions.length})
              </span>
              <button
                onClick={handleCopyAll}
                className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? t('tools.aIInterviewQuestions.copied', 'Copied!') : t('tools.aIInterviewQuestions.copyAll', 'Copy All')}
              </button>
            </div>

            <div className="space-y-3">
              {generatedQuestions.map((q, index) => (
                <div
                  key={index}
                  className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div
                    className={`p-4 cursor-pointer flex items-start justify-between gap-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(q.type)}`}>
                          {q.type}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          #{index + 1}
                        </span>
                      </div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {q.question}
                      </p>
                    </div>
                    {expandedIndex === index ? (
                      <ChevronUp className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    )}
                  </div>
                  {expandedIndex === index && (
                    <div className={`px-4 pb-4 pt-0 space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div>
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aIInterviewQuestions.purpose', 'Purpose:')}</span>
                        <p className="text-sm mt-1">{q.purpose}</p>
                      </div>
                      {q.followUp && (
                        <div>
                          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aIInterviewQuestions.followUpQuestion', 'Follow-up Question:')}</span>
                          <p className="text-sm mt-1 italic">{q.followUp}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={generateQuestions}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {t('tools.aIInterviewQuestions.generateNewQuestions', 'Generate New Questions')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {generatedQuestions.length === 0 && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIInterviewQuestions.configureYourInterviewParametersAnd', 'Configure your interview parameters and generate questions')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInterviewQuestionsTool;
