import React, { useState, useEffect } from 'react';
import { Briefcase, Copy, Check, RefreshCw, Sparkles, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
type Industry = 'technology' | 'finance' | 'healthcare' | 'marketing' | 'sales' | 'education' | 'manufacturing' | 'general';

interface JobPostingSection {
  title: string;
  content: string;
}

const industryResponsibilities: Record<Industry, string[]> = {
  technology: [
    'Design, develop, and maintain scalable software solutions',
    'Collaborate with cross-functional teams to define and implement new features',
    'Write clean, maintainable, and well-documented code',
    'Participate in code reviews and contribute to team best practices',
    'Troubleshoot, debug, and optimize application performance',
    'Stay current with emerging technologies and industry trends',
    'Mentor junior team members and contribute to knowledge sharing',
  ],
  finance: [
    'Analyze financial data and prepare detailed reports',
    'Develop financial models and forecasts',
    'Monitor market trends and provide strategic recommendations',
    'Ensure compliance with financial regulations and policies',
    'Collaborate with stakeholders to support business decisions',
    'Manage budgets and track financial performance',
    'Identify opportunities for cost optimization and revenue growth',
  ],
  healthcare: [
    'Provide high-quality patient care and support',
    'Maintain accurate patient records and documentation',
    'Collaborate with healthcare team members',
    'Ensure compliance with healthcare regulations and standards',
    'Participate in continuous education and training',
    'Support quality improvement initiatives',
    'Communicate effectively with patients and families',
  ],
  marketing: [
    'Develop and execute comprehensive marketing strategies',
    'Manage multi-channel marketing campaigns',
    'Analyze campaign performance and optimize for ROI',
    'Create compelling content across various platforms',
    'Conduct market research and competitive analysis',
    'Collaborate with sales and product teams',
    'Manage marketing budgets and vendor relationships',
  ],
  sales: [
    'Identify and pursue new business opportunities',
    'Build and maintain strong client relationships',
    'Meet or exceed sales targets and KPIs',
    'Conduct product demonstrations and presentations',
    'Negotiate contracts and close deals',
    'Maintain accurate CRM records and sales forecasts',
    'Collaborate with marketing and customer success teams',
  ],
  education: [
    'Develop and deliver engaging curriculum content',
    'Assess student progress and provide feedback',
    'Create inclusive and supportive learning environments',
    'Collaborate with colleagues on educational initiatives',
    'Participate in professional development activities',
    'Communicate with students, parents, and stakeholders',
    'Utilize technology to enhance learning outcomes',
  ],
  manufacturing: [
    'Oversee production processes and ensure quality standards',
    'Implement and maintain safety protocols',
    'Optimize production efficiency and reduce waste',
    'Manage equipment maintenance and troubleshooting',
    'Train and supervise production team members',
    'Monitor inventory and supply chain operations',
    'Ensure compliance with industry regulations',
  ],
  general: [
    'Execute tasks efficiently and meet deadlines',
    'Collaborate with team members and stakeholders',
    'Contribute to process improvements and best practices',
    'Maintain accurate records and documentation',
    'Communicate effectively across all levels',
    'Adapt to changing priorities and requirements',
    'Support organizational goals and initiatives',
  ],
};

const qualificationTemplates = {
  entry: [
    "Bachelor's degree in relevant field or equivalent experience",
    '0-2 years of relevant experience',
    'Strong communication and interpersonal skills',
    'Eagerness to learn and grow professionally',
    'Basic proficiency in relevant tools and technologies',
    'Ability to work in a fast-paced environment',
  ],
  mid: [
    "Bachelor's degree in relevant field or equivalent experience",
    '3-5 years of relevant experience',
    'Proven track record of successful project delivery',
    'Strong analytical and problem-solving skills',
    'Excellent communication and collaboration abilities',
    'Experience with industry-standard tools and methodologies',
  ],
  senior: [
    "Bachelor's degree required; Master's degree preferred",
    '5-8 years of progressive experience',
    'Demonstrated leadership and mentoring abilities',
    'Expert-level knowledge in core competency areas',
    'Strategic thinking and decision-making skills',
    'Track record of driving significant business impact',
  ],
  lead: [
    "Bachelor's degree required; Master's degree preferred",
    '8+ years of experience with leadership responsibilities',
    'Proven ability to lead and develop high-performing teams',
    'Strategic vision and execution capabilities',
    'Strong stakeholder management skills',
    'Experience with budget and resource management',
  ],
  executive: [
    "Advanced degree (MBA, MS, PhD) strongly preferred",
    '10+ years of progressive leadership experience',
    'C-level or senior executive experience',
    'Proven track record of organizational transformation',
    'Board-level communication and presentation skills',
    'Deep industry knowledge and network',
  ],
};

const benefitsTemplates = [
  'Competitive salary and performance bonuses',
  'Comprehensive health, dental, and vision insurance',
  'Generous paid time off and holidays',
  'Flexible work arrangements',
  '401(k) with company match',
  'Professional development and learning opportunities',
  'Career growth and advancement paths',
  'Collaborative and inclusive work environment',
  'Modern office space and equipment',
  'Team building events and activities',
  'Mental health and wellness programs',
  'Parental leave and family support',
];

interface AIJobPostingToolProps {
  uiConfig?: UIConfig;
}

export const AIJobPostingTool: React.FC<AIJobPostingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedPosting, setGeneratedPosting] = useState<JobPostingSection[]>([]);

  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    industry: 'general' as Industry,
    jobType: 'full-time' as JobType,
    experienceLevel: 'mid' as ExperienceLevel,
    location: '',
    salaryRange: '',
    department: '',
    reportsTo: '',
    skills: '',
  });

  const generateJobPosting = () => {
    const sections: JobPostingSection[] = [];

    // Job Title & Company Header
    const title = formData.jobTitle || 'Professional';
    const company = formData.company || 'Our Company';
    const location = formData.location || 'Flexible Location';
    const jobType = formData.jobType.charAt(0).toUpperCase() + formData.jobType.slice(1).replace('-', ' ');

    // About the Company
    sections.push({
      title: 'About Us',
      content: `${company} is a dynamic and innovative organization in the ${formData.industry} industry. We are committed to excellence, fostering a culture of collaboration, innovation, and continuous growth. Our team is passionate about making a difference and we're looking for talented individuals to join us on this journey.`,
    });

    // Job Overview
    sections.push({
      title: 'The Opportunity',
      content: `We are seeking a talented ${title} to join our ${formData.department || 'growing'} team. This ${jobType} position offers an exciting opportunity to make a significant impact while working alongside a collaborative and supportive team. ${formData.reportsTo ? `This role reports to the ${formData.reportsTo}.` : ''} Based in ${location}, this role offers ${formData.jobType === 'remote' ? 'full remote flexibility' : 'the chance to be part of our dynamic workplace'}.`,
    });

    // Responsibilities
    const responsibilities = industryResponsibilities[formData.industry] || industryResponsibilities.general;
    const selectedResponsibilities = [...responsibilities]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    sections.push({
      title: 'Key Responsibilities',
      content: selectedResponsibilities.map(r => `- ${r}`).join('\n'),
    });

    // Qualifications
    const qualifications = qualificationTemplates[formData.experienceLevel];
    const skillsList = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

    let qualContent = qualifications.map(q => `- ${q}`).join('\n');
    if (skillsList.length > 0) {
      qualContent += '\n- Proficiency in: ' + skillsList.join(', ');
    }

    sections.push({
      title: 'Qualifications',
      content: qualContent,
    });

    // Benefits
    const selectedBenefits = [...benefitsTemplates]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    let benefitsContent = selectedBenefits.map(b => `- ${b}`).join('\n');
    if (formData.salaryRange) {
      benefitsContent = `- Salary Range: ${formData.salaryRange}\n` + benefitsContent;
    }

    sections.push({
      title: 'What We Offer',
      content: benefitsContent,
    });

    // How to Apply
    sections.push({
      title: 'How to Apply',
      content: `Ready to take the next step in your career? We'd love to hear from you! Please submit your resume and a cover letter explaining why you're the perfect fit for this role.\n\n${company} is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.`,
    });

    setGeneratedPosting(sections);
  };

  const getFullPostingText = () => {
    const title = formData.jobTitle || 'Job Title';
    const header = `${title}\n${'='.repeat(title.length)}\n\n`;
    const body = generatedPosting.map(s => `${s.title}\n${'-'.repeat(s.title.length)}\n${s.content}`).join('\n\n');
    return header + body;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullPostingText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.jobTitle) setFormData(prev => ({ ...prev, jobTitle: params.jobTitle }));
      if (params.company) setFormData(prev => ({ ...prev, company: params.company }));
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
    { value: 'education', label: 'Education' },
    { value: 'manufacturing', label: 'Manufacturing' },
  ];

  const jobTypes: { value: JobType; label: string }[] = [
    { value: 'full-time', label: 'Full-Time' },
    { value: 'part-time', label: 'Part-Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'remote', label: 'Remote' },
  ];

  const experienceLevels: { value: ExperienceLevel; label: string }[] = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead/Manager' },
    { value: 'executive', label: 'Executive' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Briefcase className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aIJobPosting.aiJobPostingGenerator', 'AI Job Posting Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aIJobPosting.createProfessionalJobPostingsThat', 'Create professional job postings that attract top talent')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.aIJobPosting.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIJobPosting.jobTitle', 'Job Title *')}</label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              placeholder={t('tools.aIJobPosting.eGSeniorSoftwareEngineer', 'e.g., Senior Software Engineer')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIJobPosting.companyName', 'Company Name *')}</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder={t('tools.aIJobPosting.eGAcmeCorporation', 'e.g., Acme Corporation')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>
        </div>

        {/* Industry, Job Type, Experience */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIJobPosting.industry', 'Industry')}</label>
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

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIJobPosting.jobType', 'Job Type')}</label>
            <select
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value as JobType })}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            >
              {jobTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIJobPosting.experienceLevel', 'Experience Level')}</label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            >
              {experienceLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Salary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aIJobPosting.location', 'Location')}</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={t('tools.aIJobPosting.eGNewYorkNy', 'e.g., New York, NY / Remote')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aIJobPosting.salaryRangeOptional', 'Salary Range (Optional)')}</label>
            <input
              type="text"
              value={formData.salaryRange}
              onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
              placeholder="e.g., $80,000 - $120,000"
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aIJobPosting.requiredSkillsCommaSeparated', 'Required Skills (comma-separated)')}</label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            placeholder={t('tools.aIJobPosting.eGJavascriptReactNode', 'e.g., JavaScript, React, Node.js, SQL')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateJobPosting}
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20"
        >
          <Sparkles className="w-5 h-5" />
          {t('tools.aIJobPosting.generateJobPosting', 'Generate Job Posting')}
        </button>

        {/* Generated Job Posting */}
        {generatedPosting.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                {t('tools.aIJobPosting.generatedJobPosting', 'Generated Job Posting')}
              </span>
              <button
                onClick={handleCopy}
                className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? t('tools.aIJobPosting.copied', 'Copied!') : t('tools.aIJobPosting.copyAll', 'Copy All')}
              </button>
            </div>

            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              {/* Job Header */}
              <div className={`p-4 border-b ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-teal-50 border-gray-200'}`}>
                <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formData.jobTitle || 'Job Title'}
                </h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Building2 className="w-4 h-4 inline mr-1" />
                    {formData.company || 'Company'}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    | {formData.location || 'Location'} | {formData.jobType.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Sections */}
              <div className="p-4 space-y-6">
                {generatedPosting.map((section, index) => (
                  <div key={index}>
                    <h5 className={`font-semibold mb-2 ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                      {section.title}
                    </h5>
                    <div className={`whitespace-pre-line text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={generateJobPosting}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {t('tools.aIJobPosting.regenerate', 'Regenerate')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {generatedPosting.length === 0 && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIJobPosting.fillInTheJobDetails', 'Fill in the job details to generate a professional posting')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIJobPostingTool;
