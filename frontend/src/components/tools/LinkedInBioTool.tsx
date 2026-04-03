import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Linkedin, Loader2, Copy, Check, FileText, MessageSquare, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface GeneratedContent {
  content: string;
  timestamp: Date;
  characterCount: number;
}

const postTypes = [
  { label: 'Thought Leadership', value: 'thought-leadership' },
  { label: 'Announcement', value: 'announcement' },
  { label: 'Story', value: 'story' },
  { label: 'Tips & Advice', value: 'tips-advice' },
  { label: 'Question', value: 'question' },
];

interface LinkedInBioToolProps {
  uiConfig?: UIConfig;
}

export const LinkedInBioTool = ({ uiConfig }: LinkedInBioToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'bio' | 'post'>('bio');

  // Bio fields
  const [currentRole, setCurrentRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [achievements, setAchievements] = useState('');
  const [personality, setPersonality] = useState('');

  // Post fields
  const [topic, setTopic] = useState('');
  const [postType, setPostType] = useState(postTypes[0]);
  const [keyPoints, setKeyPoints] = useState('');
  const [includeHashtags, setIncludeHashtags] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Mode selection
        if (params.mode === 'bio' || params.mode === 'post') {
          setMode(params.mode);
          hasPrefill = true;
        }

        // Bio fields
        if (params.currentRole) {
          setCurrentRole(params.currentRole);
          hasPrefill = true;
        }
        if (params.industry) {
          setIndustry(params.industry);
          hasPrefill = true;
        }
        if (params.achievements) {
          setAchievements(params.achievements);
          hasPrefill = true;
        }
        if (params.personality) {
          setPersonality(params.personality);
          hasPrefill = true;
        }

        // Post fields
        if (params.topic) {
          setTopic(params.topic);
          hasPrefill = true;
        }
        if (params.postType) {
          const foundType = postTypes.find(t => t.value === params.postType);
          if (foundType) {
            setPostType(foundType);
            hasPrefill = true;
          }
        }
        if (params.keyPoints) {
          setKeyPoints(params.keyPoints);
          hasPrefill = true;
        }
        if (params.includeHashtags !== undefined) {
          setIncludeHashtags(params.includeHashtags);
          hasPrefill = true;
        }

        // Restore generated content
        if (params.generatedContent || params.content) {
          setGeneratedContent({
            content: params.generatedContent || params.content,
            timestamp: new Date(),
            characterCount: (params.generatedContent || params.content || '').length,
          });
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);

        // Mode selection
        if (params.mode === 'bio' || params.mode === 'post') {
          setMode(params.mode);
          hasPrefill = true;
        }

        // Bio fields
        if (params.currentRole) {
          setCurrentRole(params.currentRole);
          hasPrefill = true;
        }
        if (params.industry) {
          setIndustry(params.industry);
          hasPrefill = true;
        }
        if (params.achievements) {
          setAchievements(params.achievements);
          hasPrefill = true;
        }
        if (params.personality) {
          setPersonality(params.personality);
          hasPrefill = true;
        }

        // Post fields
        if (params.topic) {
          setTopic(params.topic);
          hasPrefill = true;
        }
        if (params.postType) {
          const foundType = postTypes.find(t => t.value === params.postType);
          if (foundType) {
            setPostType(foundType);
            hasPrefill = true;
          }
        }
        if (params.keyPoints) {
          setKeyPoints(params.keyPoints);
          hasPrefill = true;
        }
        if (params.includeHashtags !== undefined) {
          setIncludeHashtags(params.includeHashtags);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig]);

  const handleGenerate = async () => {
    if (mode === 'bio' && !currentRole) {
      setError('Please provide at least your current role');
      return;
    }

    if (mode === 'post' && !topic) {
      setError('Please provide a topic for your post');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let prompt = '';

      if (mode === 'bio') {
        prompt = `Create a compelling LinkedIn bio/headline with the following information:

Current Role: ${currentRole}
${industry ? `Industry: ${industry}` : ''}
${achievements ? `Key Achievements:\n${achievements}` : ''}
${personality ? `Personality/Traits:\n${personality}` : ''}

Requirements:
- Create a professional yet engaging bio
- Keep it concise (under 220 characters for headline, longer version for About section)
- Highlight unique value proposition
- Use action words and quantifiable achievements
- Make it searchable with relevant keywords
- Show personality while maintaining professionalism

Provide both:
1. A short headline (under 220 characters)
2. A longer "About" section (2-3 paragraphs)`;
      } else {
        prompt = `Create a ${postType.value} LinkedIn post about:

Topic: ${topic}

${keyPoints ? `Key Points to Include:\n${keyPoints}` : ''}

Requirements:
- Write in a ${postType.value} style
- Make it engaging and valuable to your network
- Use short paragraphs and line breaks for readability
- Start with a hook to grab attention
- Include a clear message or call-to-action
- Keep it professional yet conversational
- Optimal length: 1300-2000 characters
${includeHashtags ? '- Include 3-5 relevant hashtags at the end' : '- Do not include hashtags'}

Create a post that encourages engagement (likes, comments, shares).`;
      }

      const response = await api.post('/ai/text/generate', {
        prompt,
        maxTokens: mode === 'bio' ? 800 : 1200,
        temperature: 0.8,
      });

      const content = response.data?.text || response.text || 'No content generated';
      const characterCount = content.length;

      setGeneratedContent({
        content,
        timestamp: new Date(),
        characterCount,
      });

      // Save to content history
      await api.post('/content', {
        content_type: 'text',
        content,
        metadata: {
          toolId: 'linkedin-bio',
          tool: 'linkedin-bio',
          mode,
          currentRole,
          industry,
          achievements,
          personality,
          topic,
          postType: postType.value,
          keyPoints,
          includeHashtags,
          generatedContent: content,
        },
      });

      // Call onSaveCallback if provided (for gallery refresh)
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (generatedContent?.content) {
      await navigator.clipboard.writeText(generatedContent.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${isDark ? t('tools.linkedInBio.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.linkedInBio.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Linkedin className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.linkedInBio.linkedinContentGenerator', 'LinkedIn Content Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.linkedInBio.createEngagingBiosAndPosts', 'Create engaging bios and posts')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{isEditFromGallery ? t('tools.linkedInBio.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.linkedInBio.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <button
            onClick={() => setMode('bio')}
            className={`flex-1 py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 ${
              mode === 'bio'
                ? 'bg-[#0D9488] text-white shadow-sm'
                : `${isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'}`
            }`}
          >
            <FileText className="w-4 h-4" />
            {t('tools.linkedInBio.bioHeadline', 'Bio/Headline')}
          </button>
          <button
            onClick={() => setMode('post')}
            className={`flex-1 py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 ${
              mode === 'post'
                ? 'bg-[#0D9488] text-white shadow-sm'
                : `${isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'}`
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Post
          </button>
        </div>

        {/* Bio Mode Fields */}
        {mode === 'bio' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.linkedInBio.currentRole', 'Current Role *')}
              </label>
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder={t('tools.linkedInBio.eGSeniorProductManager', 'e.g., Senior Product Manager at Tech Corp')}
                className={`w-full px-4 py-2.5 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.linkedInBio.industry', 'Industry')}
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder={t('tools.linkedInBio.eGTechnologyHealthcareFinance', 'e.g., Technology, Healthcare, Finance')}
                className={`w-full px-4 py-2.5 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.linkedInBio.keyAchievements', 'Key Achievements')}
              </label>
              <textarea
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder={t('tools.linkedInBio.listYourNotableAchievementsAwards', 'List your notable achievements, awards, or accomplishments...&#10;&#10;• Launched product used by 1M+ users&#10;• Increased revenue by 150%&#10;• Led team of 20 across 3 countries')}
                rows={4}
                className={`w-full px-4 py-3 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.linkedInBio.personalityTraits', 'Personality Traits')}
              </label>
              <input
                type="text"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder={t('tools.linkedInBio.eGInnovativeDataDriven', 'e.g., Innovative, Data-driven, Collaborative')}
                className={`w-full px-4 py-2.5 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>
          </div>
        )}

        {/* Post Mode Fields */}
        {mode === 'post' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.linkedInBio.topic', 'Topic *')}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t('tools.linkedInBio.eGTheFutureOf', 'e.g., The future of remote work in 2025')}
                className={`w-full px-4 py-2.5 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.linkedInBio.postType', 'Post Type')}</label>
              <select
                value={postType.label}
                onChange={(e) => {
                  const type = postTypes.find((t) => t.label === e.target.value);
                  if (type) setPostType(type);
                }}
                className={`w-full px-4 py-2.5 border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              >
                {postTypes.map((type) => (
                  <option key={type.label} value={type.label}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.linkedInBio.keyPoints', 'Key Points')}
              </label>
              <textarea
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder={t('tools.linkedInBio.whatKeyPointsOrIdeas', 'What key points or ideas should be included in the post?&#10;&#10;• Main message or insight&#10;• Supporting examples&#10;• Call to action')}
                rows={4}
                className={`w-full px-4 py-3 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeHashtags"
                checked={includeHashtags}
                onChange={(e) => setIncludeHashtags(e.target.checked)}
                className="w-4 h-4 text-[#0D9488] border-gray-300 rounded focus:ring-[#0D9488]/20"
              />
              <label
                htmlFor="includeHashtags"
                className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'} cursor-pointer`}
              >
                {t('tools.linkedInBio.includeHashtagSuggestions', 'Include hashtag suggestions')}
              </label>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`p-4 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border rounded-xl text-red-600 text-sm`}>
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || (mode === 'bio' && !currentRole) || (mode === 'post' && !topic)}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.linkedInBio.generating', 'Generating...')}
            </>
          ) : (
            <>
              <Linkedin className="w-5 h-5" />
              Generate {mode === 'bio' ? t('tools.linkedInBio.bio', 'Bio') : 'Post'}
            </>
          )}
        </button>

        {/* Generated Content */}
        {generatedContent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                  <Linkedin className="w-4 h-4" />
                  Generated {mode === 'bio' ? t('tools.linkedInBio.bio2', 'Bio') : 'Post'}
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  mode === 'bio'
                    ? generatedContent.characterCount <= 220
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : generatedContent.characterCount >= 1300 && generatedContent.characterCount <= 2000
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                  {generatedContent.characterCount} characters
                </span>
              </div>
              <button
                onClick={handleCopy}
                className={`p-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} rounded-lg transition-colors flex items-center gap-2`}
                title={t('tools.linkedInBio.copyToClipboard', 'Copy to clipboard')}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-sm">{t('tools.linkedInBio.copied', 'Copied!')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">{t('tools.linkedInBio.copy', 'Copy')}</span>
                  </>
                )}
              </button>
            </div>
            <div className={`p-4 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl whitespace-pre-wrap ${isDark ? 'text-gray-200' : 'text-gray-800'} max-h-96 overflow-y-auto leading-relaxed`}>
              {generatedContent.content}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedContent && !isGenerating && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <Linkedin className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Your generated {mode === 'bio' ? 'bio' : 'post'} will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInBioTool;
