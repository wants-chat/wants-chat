import React, { useState, useEffect } from 'react';
import { Linkedin, Copy, Check, RefreshCw, Sparkles, Hash, AtSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

type PostType = 'thought-leadership' | 'career-update' | 'industry-insight' | 'personal-story' | 'how-to' | 'celebration' | 'question' | 'announcement';
type Tone = 'professional' | 'conversational' | 'inspirational' | 'educational' | 'storytelling';

interface PostTemplate {
  hook: string;
  body: string[];
  cta: string;
  type: PostType;
  tone: Tone;
}

const postTemplates: PostTemplate[] = [
  // Thought Leadership
  {
    hook: "I've been thinking a lot about {topic} lately.\n\nHere's what I've learned:",
    body: [
      "1. {insight_1}",
      "2. {insight_2}",
      "3. {insight_3}",
      "\nThe biggest takeaway? {main_point}",
    ],
    cta: "What's your experience with {topic}? I'd love to hear your thoughts in the comments.",
    type: 'thought-leadership',
    tone: 'professional',
  },
  {
    hook: "Unpopular opinion about {topic}:",
    body: [
      "\n{main_point}",
      "\nHere's why I believe this:",
      "\n- {insight_1}",
      "- {insight_2}",
      "- {insight_3}",
    ],
    cta: "\nAgree or disagree? Let me know below.",
    type: 'thought-leadership',
    tone: 'conversational',
  },

  // Career Update
  {
    hook: "Excited to share some news!",
    body: [
      "\nI'm thrilled to announce that I'm {announcement}.",
      "\nThis journey has taught me so much:",
      "\n- The importance of {insight_1}",
      "- Why {insight_2} matters",
      "- How {insight_3} changed my perspective",
      "\nI'm grateful to everyone who has been part of this journey.",
    ],
    cta: "\nHere's to new beginnings! What's the best career advice you've received?",
    type: 'career-update',
    tone: 'professional',
  },

  // Industry Insight
  {
    hook: "The {industry} industry is changing faster than ever.",
    body: [
      "\nHere are the top trends I'm seeing:",
      "\n1. {insight_1}",
      "2. {insight_2}",
      "3. {insight_3}",
      "\nCompanies that adapt to these changes will {benefit}.",
      "Those that don't risk {risk}.",
    ],
    cta: "\nWhat trends are you seeing in your industry? Share below!",
    type: 'industry-insight',
    tone: 'professional',
  },

  // Personal Story
  {
    hook: "{time_period} ago, I {past_situation}.",
    body: [
      "\nToday, I {current_situation}.",
      "\nWhat changed? Here's what I learned:",
      "\n1. {insight_1}",
      "2. {insight_2}",
      "3. {insight_3}",
      "\nThe journey wasn't easy, but every setback taught me something valuable.",
    ],
    cta: "\nIf you're facing a similar challenge, know that growth takes time. What's your story?",
    type: 'personal-story',
    tone: 'storytelling',
  },
  {
    hook: "Let me tell you about the moment that changed everything for me.",
    body: [
      "\nI was {past_situation}.",
      "\nThen something unexpected happened: {turning_point}.",
      "\nThat experience taught me:",
      "\n- {insight_1}",
      "- {insight_2}",
      "- {insight_3}",
    ],
    cta: "\nHave you had a moment like this? I'd love to hear about it.",
    type: 'personal-story',
    tone: 'inspirational',
  },

  // How-To
  {
    hook: "Want to {goal}? Here's my proven framework:",
    body: [
      "\nStep 1: {step_1}",
      "Step 2: {step_2}",
      "Step 3: {step_3}",
      "Step 4: {step_4}",
      "\nBonus tip: {bonus_tip}",
      "\nI've used this approach to {result}.",
    ],
    cta: "\nSave this post for later! What would you add to this list?",
    type: 'how-to',
    tone: 'educational',
  },

  // Celebration
  {
    hook: "Today marks a special milestone!",
    body: [
      "\n{achievement}",
      "\nThis wouldn't have been possible without:",
      "\n- My amazing team who {team_contribution}",
      "- The mentors who {mentor_contribution}",
      "- Everyone who {community_contribution}",
      "\nLooking back, I'm reminded of {reflection}.",
    ],
    cta: "\nThank you all for being part of this journey! What milestones are you celebrating?",
    type: 'celebration',
    tone: 'professional',
  },

  // Question
  {
    hook: "I have a question for my network:",
    body: [
      "\n{question}",
      "\nI've been thinking about this because {context}.",
      "\nMy current thinking is {current_view}.",
      "\nBut I know there's more to consider.",
    ],
    cta: "\nWhat's your take? I'm genuinely curious to hear different perspectives.",
    type: 'question',
    tone: 'conversational',
  },

  // Announcement
  {
    hook: "Big news to share with my network!",
    body: [
      "\n{announcement}",
      "\nThis is exciting because:",
      "\n- {reason_1}",
      "- {reason_2}",
      "- {reason_3}",
      "\nI can't wait to see what's next.",
    ],
    cta: "\nStay tuned for updates! What questions do you have?",
    type: 'announcement',
    tone: 'professional',
  },
];

const hashtagSuggestions: Record<string, string[]> = {
  leadership: ['#Leadership', '#Management', '#LeadershipDevelopment', '#ExecutiveLeadership'],
  career: ['#CareerAdvice', '#CareerGrowth', '#ProfessionalDevelopment', '#CareerTips'],
  technology: ['#Tech', '#Innovation', '#DigitalTransformation', '#FuturOfWork'],
  marketing: ['#Marketing', '#DigitalMarketing', '#ContentMarketing', '#MarketingStrategy'],
  entrepreneurship: ['#Entrepreneurship', '#Startup', '#Founder', '#BusinessGrowth'],
  productivity: ['#Productivity', '#TimeManagement', '#WorkLifeBalance', '#Efficiency'],
  networking: ['#Networking', '#PersonalBranding', '#LinkedInTips', '#ProfessionalNetworking'],
  general: ['#Insights', '#Learning', '#Growth', '#Success'],
};

interface AILinkedInPostToolProps {
  uiConfig?: UIConfig;
}

export const AILinkedInPostTool: React.FC<AILinkedInPostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');

  const [formData, setFormData] = useState({
    topic: '',
    mainPoint: '',
    insight1: '',
    insight2: '',
    insight3: '',
    context: '',
  });

  const [postType, setPostType] = useState<PostType>('thought-leadership');
  const [tone, setTone] = useState<Tone>('professional');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [selectedHashtagCategory, setSelectedHashtagCategory] = useState('general');

  const generatePost = () => {
    const templates = postTemplates.filter(t => t.type === postType);
    const matchingTone = templates.filter(t => t.tone === tone);
    const template = matchingTone.length > 0
      ? matchingTone[Math.floor(Math.random() * matchingTone.length)]
      : templates[Math.floor(Math.random() * templates.length)];

    let post = template.hook + '\n' + template.body.join('\n') + '\n' + template.cta;

    // Replace placeholders
    const topic = formData.topic || 'professional growth';
    const mainPoint = formData.mainPoint || 'consistency is key';
    const insight1 = formData.insight1 || 'Start with clear goals';
    const insight2 = formData.insight2 || 'Build strong relationships';
    const insight3 = formData.insight3 || 'Never stop learning';
    const context = formData.context || 'my recent experiences';

    const replacements: Record<string, string> = {
      '{topic}': topic,
      '{main_point}': mainPoint,
      '{insight_1}': insight1,
      '{insight_2}': insight2,
      '{insight_3}': insight3,
      '{context}': context,
      '{industry}': topic,
      '{announcement}': formData.mainPoint || 'starting a new chapter',
      '{benefit}': 'thrive in the new landscape',
      '{risk}': 'being left behind',
      '{time_period}': 'Two years',
      '{past_situation}': 'facing a major challenge',
      '{current_situation}': 'I see things differently',
      '{turning_point}': 'I had to make a difficult decision',
      '{goal}': mainPoint || 'level up your career',
      '{step_1}': insight1,
      '{step_2}': insight2,
      '{step_3}': insight3,
      '{step_4}': 'Review and iterate',
      '{bonus_tip}': 'Stay consistent',
      '{result}': 'achieve meaningful results',
      '{achievement}': formData.mainPoint || 'reaching an important milestone',
      '{team_contribution}': 'believed in the vision',
      '{mentor_contribution}': 'shared invaluable wisdom',
      '{community_contribution}': 'supported along the way',
      '{reflection}': 'how far we\'ve come',
      '{question}': formData.mainPoint || 'What\'s your biggest professional challenge right now?',
      '{current_view}': context || 'there are multiple valid approaches',
      '{reason_1}': insight1,
      '{reason_2}': insight2,
      '{reason_3}': insight3,
    };

    Object.entries(replacements).forEach(([key, value]) => {
      post = post.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    // Add hashtags
    if (includeHashtags) {
      const hashtags = hashtagSuggestions[selectedHashtagCategory] || hashtagSuggestions.general;
      const selectedHashtags = [...hashtags].sort(() => Math.random() - 0.5).slice(0, 4);
      post += '\n\n' + selectedHashtags.join(' ');
    }

    setGeneratedPost(post);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.topic) setFormData(prev => ({ ...prev, topic: params.topic }));
      if (params.mainPoint) setFormData(prev => ({ ...prev, mainPoint: params.mainPoint }));
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  const postTypes: { value: PostType; label: string }[] = [
    { value: 'thought-leadership', label: 'Thought Leadership' },
    { value: 'career-update', label: 'Career Update' },
    { value: 'industry-insight', label: 'Industry Insight' },
    { value: 'personal-story', label: 'Personal Story' },
    { value: 'how-to', label: 'How-To Guide' },
    { value: 'celebration', label: 'Celebration' },
    { value: 'question', label: 'Question' },
    { value: 'announcement', label: 'Announcement' },
  ];

  const tones: { value: Tone; label: string }[] = [
    { value: 'professional', label: 'Professional' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'educational', label: 'Educational' },
    { value: 'storytelling', label: 'Storytelling' },
  ];

  const hashtagCategories = [
    { value: 'general', label: 'General' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'career', label: 'Career' },
    { value: 'technology', label: 'Technology' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'entrepreneurship', label: 'Entrepreneurship' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'networking', label: 'Networking' },
  ];

  const characterCount = generatedPost.length;
  const isOverLimit = characterCount > 3000;

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0A66C2]/10 rounded-lg">
            <Linkedin className="w-5 h-5 text-[#0A66C2]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aILinkedInPost.aiLinkedinPostGenerator', 'AI LinkedIn Post Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aILinkedInPost.createEngagingLinkedinPostsThat', 'Create engaging LinkedIn posts that drive engagement')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.aILinkedInPost.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Post Type & Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aILinkedInPost.postType', 'Post Type')}</label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            >
              {postTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aILinkedInPost.tone', 'Tone')}</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            >
              {tones.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic & Main Point */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aILinkedInPost.topicSubject', 'Topic/Subject *')}</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder={t('tools.aILinkedInPost.eGLeadershipRemoteWork', 'e.g., Leadership, Remote Work, AI')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aILinkedInPost.mainMessageInsight', 'Main Message/Insight')}</label>
            <input
              type="text"
              value={formData.mainPoint}
              onChange={(e) => setFormData({ ...formData, mainPoint: e.target.value })}
              placeholder={t('tools.aILinkedInPost.eGTheKeyTo', 'e.g., The key to success is...')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>
        </div>

        {/* Key Points */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aILinkedInPost.keyPointsOptional', 'Key Points (Optional)')}</label>
          <input
            type="text"
            value={formData.insight1}
            onChange={(e) => setFormData({ ...formData, insight1: e.target.value })}
            placeholder={t('tools.aILinkedInPost.firstKeyPoint', 'First key point')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
          />
          <input
            type="text"
            value={formData.insight2}
            onChange={(e) => setFormData({ ...formData, insight2: e.target.value })}
            placeholder={t('tools.aILinkedInPost.secondKeyPoint', 'Second key point')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
          />
          <input
            type="text"
            value={formData.insight3}
            onChange={(e) => setFormData({ ...formData, insight3: e.target.value })}
            placeholder={t('tools.aILinkedInPost.thirdKeyPoint', 'Third key point')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
          />
        </div>

        {/* Hashtags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Hash className="w-4 h-4 inline mr-1" />
              {t('tools.aILinkedInPost.includeHashtags', 'Include Hashtags')}
            </label>
            <button
              onClick={() => setIncludeHashtags(!includeHashtags)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                includeHashtags ? 'bg-teal-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  includeHashtags ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {includeHashtags && (
            <select
              value={selectedHashtagCategory}
              onChange={(e) => setSelectedHashtagCategory(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            >
              {hashtagCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePost}
          className="w-full py-3 bg-gradient-to-r from-[#0A66C2] to-[#004182] hover:from-[#004182] hover:to-[#0A66C2] text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0A66C2]/20"
        >
          <Sparkles className="w-5 h-5" />
          {t('tools.aILinkedInPost.generateLinkedinPost', 'Generate LinkedIn Post')}
        </button>

        {/* Generated Post */}
        {generatedPost && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                {t('tools.aILinkedInPost.generatedPost', 'Generated Post')}
              </span>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${isOverLimit ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {characterCount}/3000
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
                  {copied ? t('tools.aILinkedInPost.copied', 'Copied!') : t('tools.aILinkedInPost.copy', 'Copy')}
                </button>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <AtSign className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aILinkedInPost.yourName', 'Your Name')}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your headline | Just now</div>
                </div>
              </div>
              <div className={`whitespace-pre-line text-sm leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {generatedPost}
              </div>
            </div>

            <button
              onClick={generatePost}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {t('tools.aILinkedInPost.regenerate', 'Regenerate')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!generatedPost && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Linkedin className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aILinkedInPost.fillInTheDetailsTo', 'Fill in the details to generate your LinkedIn post')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AILinkedInPostTool;
