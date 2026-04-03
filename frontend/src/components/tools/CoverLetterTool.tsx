import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Loader2, Copy, Check, Download, Mail, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface GeneratedLetter {
  content: string;
  timestamp: Date;
}

const toneOptions = [
  { label: 'Professional', value: 'professional', description: 'Formal and business-appropriate' },
  { label: 'Enthusiastic', value: 'enthusiastic', description: 'Energetic and passionate' },
  { label: 'Confident', value: 'confident', description: 'Assertive and self-assured' },
  { label: 'Warm', value: 'warm', description: 'Friendly and approachable' },
  { label: 'Formal', value: 'formal', description: 'Traditional and conservative' },
];

interface CoverLetterToolProps {
  uiConfig?: UIConfig;
}

export const CoverLetterTool = ({
  uiConfig }: CoverLetterToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [selectedTone, setSelectedTone] = useState(toneOptions[0]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedLetter | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      let hasPrefill = false;

      if (params.jobTitle) {
        setJobTitle(params.jobTitle);
        hasPrefill = true;
      }
      if (params.companyName) {
        setCompanyName(params.companyName);
        hasPrefill = true;
      }
      if (params.jobDescription) {
        setJobDescription(params.jobDescription);
        hasPrefill = true;
      }
      if (params.qualifications) {
        setQualifications(params.qualifications);
        hasPrefill = true;
      }
      if (params.tone) {
        const foundTone = toneOptions.find(t => t.value === params.tone);
        if (foundTone) {
          setSelectedTone(foundTone);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig]);

  const handleGenerate = async () => {
    if (!jobTitle || !companyName) {
      setError('Please provide at least the job title and company name');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Write a ${selectedTone.value} cover letter for the following position:

Job Title: ${jobTitle}
Company: ${companyName}

${jobDescription ? `Job Description:\n${jobDescription}\n` : ''}

${qualifications ? `Key Qualifications to Highlight:\n${qualifications}\n` : ''}

Write a compelling cover letter that:
- Has a strong opening that captures attention
- Highlights relevant qualifications and experiences
- Shows genuine interest in the role and company
- Demonstrates knowledge of the company (if provided)
- Has a ${selectedTone.value} tone throughout
- Ends with a clear call to action
- Is concise and well-structured (3-4 paragraphs)

Format it as a professional business letter.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        maxTokens: 1500,
        temperature: 0.8,
      });

      const content = response.data?.text || response.text || 'No content generated';

      setGeneratedLetter({
        content,
        timestamp: new Date(),
      });

      // Save to content history
      await api.post('/content', {
        content_type: 'text',
        content,
        metadata: {
          tool: 'cover-letter',
          jobTitle,
          companyName,
          tone: selectedTone.value,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate cover letter');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (generatedLetter?.content) {
      await navigator.clipboard.writeText(generatedLetter.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedLetter?.content) {
      const blob = new Blob([generatedLetter.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cover_Letter_${companyName.replace(/\s+/g, '_')}_${jobTitle.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${isDark ? t('tools.coverLetter.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.coverLetter.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Mail className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.coverLetter.aiCoverLetterGenerator', 'AI Cover Letter Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.coverLetter.createCompellingPersonalizedCoverLetters', 'Create compelling, personalized cover letters')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.coverLetter.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Job Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.coverLetter.jobTitle', 'Job Title *')}
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={t('tools.coverLetter.eGSeniorSoftwareEngineer', 'e.g., Senior Software Engineer')}
              className={`w-full px-4 py-2.5 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.coverLetter.companyName', 'Company Name *')}
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={t('tools.coverLetter.eGTechInnovationsInc', 'e.g., Tech Innovations Inc.')}
              className={`w-full px-4 py-2.5 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.coverLetter.jobDescription', 'Job Description')}
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={t('tools.coverLetter.pasteTheJobDescriptionHere', 'Paste the job description here to help tailor your cover letter...')}
            rows={6}
            className={`w-full px-4 py-3 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
        </div>

        {/* Key Qualifications */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.coverLetter.keyQualificationsToHighlight', 'Key Qualifications to Highlight')}
          </label>
          <textarea
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
            placeholder={t('tools.coverLetter.listYourRelevantSkillsExperiences', 'List your relevant skills, experiences, and achievements that match this role...&#10;&#10;• 5+ years of experience in...&#10;• Led team of 10 developers...&#10;• Increased performance by 40%...')}
            rows={5}
            className={`w-full px-4 py-3 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
        </div>

        {/* Tone Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.coverLetter.tone', 'Tone')}</label>
          <select
            value={selectedTone.label}
            onChange={(e) => {
              const tone = toneOptions.find((t) => t.label === e.target.value);
              if (tone) setSelectedTone(tone);
            }}
            className={`w-full px-4 py-2.5 border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          >
            {toneOptions.map((tone) => (
              <option key={tone.label} value={tone.label}>
                {tone.label} - {tone.description}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-4 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border rounded-xl text-red-600 text-sm`}>
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !jobTitle || !companyName}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.coverLetter.generatingCoverLetter', 'Generating Cover Letter...')}
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              {t('tools.coverLetter.generateCoverLetter', 'Generate Cover Letter')}
            </>
          )}
        </button>

        {/* Generated Cover Letter */}
        {generatedLetter && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Mail className="w-4 h-4" />
                {t('tools.coverLetter.generatedCoverLetter', 'Generated Cover Letter')}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`p-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} rounded-lg transition-colors flex items-center gap-2`}
                  title={t('tools.coverLetter.copyToClipboard', 'Copy to clipboard')}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-sm">{t('tools.coverLetter.copied', 'Copied!')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">{t('tools.coverLetter.copy', 'Copy')}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className={`p-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} rounded-lg transition-colors flex items-center gap-2`}
                  title={t('tools.coverLetter.download2', 'Download')}
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">{t('tools.coverLetter.download', 'Download')}</span>
                </button>
              </div>
            </div>
            <div className={`p-4 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl whitespace-pre-wrap ${isDark ? 'text-gray-200' : 'text-gray-800'} max-h-96 overflow-y-auto leading-relaxed`}>
              {generatedLetter.content}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedLetter && !isGenerating && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.coverLetter.yourGeneratedCoverLetterWill', 'Your generated cover letter will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverLetterTool;
