import React, { useState, useEffect } from 'react';
import { Youtube, Copy, Check, RefreshCw, Sparkles, Link, Clock, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

type VideoType = 'tutorial' | 'vlog' | 'review' | 'entertainment' | 'educational' | 'gaming' | 'podcast' | 'music';
type DescriptionStyle = 'detailed' | 'concise' | 'seo-focused' | 'casual';

interface DescriptionTemplate {
  intro: string;
  body: string[];
  sections: {
    timestamps?: string;
    links?: string;
    social?: string;
    cta?: string;
    hashtags?: string;
  };
  type: VideoType;
}

const descriptionTemplates: Record<VideoType, DescriptionTemplate> = {
  tutorial: {
    intro: "{hook}\n\nIn this video, I'll show you exactly how to {topic}. Whether you're a complete beginner or looking to level up your skills, this step-by-step guide has everything you need.",
    body: [
      "\nWhat you'll learn:",
      "- {point_1}",
      "- {point_2}",
      "- {point_3}",
      "- {point_4}",
      "\nThis tutorial is perfect for {audience}.",
    ],
    sections: {
      timestamps: "\n---\nTimestamps:\n0:00 Introduction\n{timestamp_1}\n{timestamp_2}\n{timestamp_3}\n{timestamp_end}",
      links: "\n---\nResources & Links:\n{resource_1}\n{resource_2}",
      social: "\n---\nConnect with me:\n{social_links}",
      cta: "\n---\nDon't forget to LIKE, COMMENT, and SUBSCRIBE for more {category} content!\nHit the notification bell so you never miss an upload.",
      hashtags: "\n\n{hashtags}",
    },
    type: 'tutorial',
  },
  vlog: {
    intro: "{hook}\n\nJoin me on this adventure as {topic}! This vlog captures all the best moments and behind-the-scenes action.",
    body: [
      "\nIn this video:",
      "- {point_1}",
      "- {point_2}",
      "- {point_3}",
      "\nI hope you enjoy coming along for the ride!",
    ],
    sections: {
      timestamps: "\n---\nTimestamps:\n0:00 Intro\n{timestamp_1}\n{timestamp_2}\n{timestamp_3}\n{timestamp_end}",
      social: "\n---\nFollow my journey:\n{social_links}",
      cta: "\n---\nIf you enjoyed this vlog, please give it a thumbs up and subscribe to join the family!\nComment below what you'd like to see next!",
      hashtags: "\n\n{hashtags}",
    },
    type: 'vlog',
  },
  review: {
    intro: "{hook}\n\nIn this honest review, I'm breaking down everything you need to know about {topic}. I'll cover the pros, cons, and whether it's worth your money.",
    body: [
      "\nWhat I cover in this review:",
      "- First impressions & unboxing",
      "- {point_1}",
      "- {point_2}",
      "- {point_3}",
      "- Final verdict & recommendations",
      "\n*This is my honest opinion based on personal experience.",
    ],
    sections: {
      timestamps: "\n---\nTimestamps:\n0:00 Intro\n{timestamp_1}\n{timestamp_2}\n{timestamp_3}\n{timestamp_end}",
      links: "\n---\nProduct Links:\n{resource_1}\n\n(Some links may be affiliate links, which means I earn a small commission at no extra cost to you)",
      social: "\n---\nLet's connect:\n{social_links}",
      cta: "\n---\nWas this review helpful? Let me know in the comments!\nSUBSCRIBE for more honest reviews every week.",
      hashtags: "\n\n{hashtags}",
    },
    type: 'review',
  },
  entertainment: {
    intro: "{hook}\n\n{topic}! Get ready for some laughs, surprises, and unforgettable moments.",
    body: [
      "\nWhat to expect:",
      "- {point_1}",
      "- {point_2}",
      "- {point_3}",
      "\nTrust me, you don't want to miss this one!",
    ],
    sections: {
      timestamps: "\n---\nBest Moments:\n0:00 Intro\n{timestamp_1}\n{timestamp_2}\n{timestamp_3}",
      social: "\n---\nFollow for more content:\n{social_links}",
      cta: "\n---\nDrop a LIKE if this made you smile!\nSUBSCRIBE and hit the bell for more entertaining content!",
      hashtags: "\n\n{hashtags}",
    },
    type: 'entertainment',
  },
  educational: {
    intro: "{hook}\n\nToday we're diving deep into {topic}. By the end of this video, you'll have a solid understanding of {outcome}.",
    body: [
      "\nTopics covered:",
      "1. {point_1}",
      "2. {point_2}",
      "3. {point_3}",
      "4. {point_4}",
      "\nThis video is designed for {audience}.",
    ],
    sections: {
      timestamps: "\n---\nChapters:\n0:00 Introduction\n{timestamp_1}\n{timestamp_2}\n{timestamp_3}\n{timestamp_4}\n{timestamp_end}",
      links: "\n---\nFurther Reading & Resources:\n{resource_1}\n{resource_2}",
      social: "\n---\nStay connected:\n{social_links}",
      cta: "\n---\nFound this helpful? Please LIKE and SUBSCRIBE for more educational content.\nShare your thoughts and questions in the comments!",
      hashtags: "\n\n{hashtags}",
    },
    type: 'educational',
  },
  gaming: {
    intro: "{hook}\n\n{topic}! Let's dive into the gameplay, tips, and everything you need to know.",
    body: [
      "\nIn this video:",
      "- {point_1}",
      "- {point_2}",
      "- {point_3}",
      "\nGrab your controller and let's go!",
    ],
    sections: {
      timestamps: "\n---\nTimestamps:\n0:00 Intro\n{timestamp_1}\n{timestamp_2}\n{timestamp_3}",
      links: "\n---\nGame Info:\n{resource_1}",
      social: "\n---\nJoin the community:\n{social_links}",
      cta: "\n---\nSMASH that like button and SUBSCRIBE for more gaming content!\nDrop your gamertag in the comments - let's play together!",
      hashtags: "\n\n{hashtags}",
    },
    type: 'gaming',
  },
  podcast: {
    intro: "{hook}\n\nWelcome back to another episode! Today we're discussing {topic} with some incredible insights you won't want to miss.",
    body: [
      "\nEpisode highlights:",
      "- {point_1}",
      "- {point_2}",
      "- {point_3}",
      "- Key takeaways and action items",
    ],
    sections: {
      timestamps: "\n---\nEpisode Chapters:\n0:00 Introduction\n{timestamp_1}\n{timestamp_2}\n{timestamp_3}\n{timestamp_end}",
      links: "\n---\nListen on other platforms:\n{resource_1}\n{resource_2}",
      social: "\n---\nConnect with us:\n{social_links}",
      cta: "\n---\nEnjoy the episode? Leave a review and SUBSCRIBE!\nShare your thoughts in the comments below.",
      hashtags: "\n\n{hashtags}",
    },
    type: 'podcast',
  },
  music: {
    intro: "{hook}\n\n{topic}\n\nStream on all platforms - links below!",
    body: [
      "\nAbout this track:",
      "{point_1}",
      "\nCredits:",
      "- {point_2}",
      "- {point_3}",
    ],
    sections: {
      links: "\n---\nStream & Download:\n{resource_1}\n{resource_2}",
      social: "\n---\nFollow the artist:\n{social_links}",
      cta: "\n---\nLike this track? Hit SUBSCRIBE and share with your friends!\nComment your favorite part below.",
      hashtags: "\n\n{hashtags}",
    },
    type: 'music',
  },
};

const defaultHashtags: Record<VideoType, string[]> = {
  tutorial: ['#Tutorial', '#HowTo', '#LearnOnYouTube', '#StepByStep', '#DIY'],
  vlog: ['#Vlog', '#DailyVlog', '#LifeStyle', '#BehindTheScenes', '#MyLife'],
  review: ['#Review', '#HonestReview', '#ProductReview', '#Unboxing', '#WorthIt'],
  entertainment: ['#Entertainment', '#Funny', '#Viral', '#MustWatch', '#Comedy'],
  educational: ['#Education', '#Learn', '#Knowledge', '#Educational', '#Facts'],
  gaming: ['#Gaming', '#Gameplay', '#Gamer', '#LetsPlay', '#GameOn'],
  podcast: ['#Podcast', '#PodcastEpisode', '#Interview', '#Discussion', '#PodcastLife'],
  music: ['#Music', '#NewMusic', '#MusicVideo', '#Artist', '#Song'],
};

interface AIYouTubeDescriptionToolProps {
  uiConfig?: UIConfig;
}

export const AIYouTubeDescriptionTool: React.FC<AIYouTubeDescriptionToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');

  const [formData, setFormData] = useState({
    videoTitle: '',
    topic: '',
    hook: '',
    point1: '',
    point2: '',
    point3: '',
    point4: '',
    audience: '',
    category: '',
  });

  const [videoType, setVideoType] = useState<VideoType>('tutorial');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeLinks, setIncludeLinks] = useState(true);
  const [includeSocial, setIncludeSocial] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);

  const generateDescription = () => {
    const template = descriptionTemplates[videoType];

    const topic = formData.topic || 'this amazing topic';
    const hook = formData.hook || `Welcome back to the channel!`;
    const point1 = formData.point1 || 'Introduction and overview';
    const point2 = formData.point2 || 'Main content and examples';
    const point3 = formData.point3 || 'Tips and best practices';
    const point4 = formData.point4 || 'Summary and next steps';
    const audience = formData.audience || 'anyone interested in this topic';
    const category = formData.category || 'helpful';

    const replacements: Record<string, string> = {
      '{hook}': hook,
      '{topic}': topic,
      '{point_1}': point1,
      '{point_2}': point2,
      '{point_3}': point3,
      '{point_4}': point4,
      '{audience}': audience,
      '{category}': category,
      '{outcome}': 'the key concepts and practical applications',
      '{timestamp_1}': '1:30 ' + point1,
      '{timestamp_2}': '5:00 ' + point2,
      '{timestamp_3}': '10:00 ' + point3,
      '{timestamp_4}': '15:00 ' + point4,
      '{timestamp_end}': '20:00 Conclusion & Wrap-up',
      '{resource_1}': 'Link 1: [Add your link here]',
      '{resource_2}': 'Link 2: [Add your link here]',
      '{social_links}': 'Instagram: @yourhandle\nTwitter: @yourhandle\nTikTok: @yourhandle',
      '{hashtags}': defaultHashtags[videoType].slice(0, 5).join(' '),
    };

    // Build description
    let description = template.intro;
    description += '\n' + template.body.join('\n');

    // Add optional sections
    if (includeTimestamps && template.sections.timestamps) {
      description += template.sections.timestamps;
    }
    if (includeLinks && template.sections.links) {
      description += template.sections.links;
    }
    if (includeSocial && template.sections.social) {
      description += template.sections.social;
    }
    if (template.sections.cta) {
      description += template.sections.cta;
    }
    if (includeHashtags && template.sections.hashtags) {
      description += template.sections.hashtags;
    }

    // Apply replacements
    Object.entries(replacements).forEach(([key, value]) => {
      description = description.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    setGeneratedDescription(description);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDescription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.videoTitle) setFormData(prev => ({ ...prev, videoTitle: params.videoTitle }));
      if (params.topic) setFormData(prev => ({ ...prev, topic: params.topic }));
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  const videoTypes: { value: VideoType; label: string }[] = [
    { value: 'tutorial', label: 'Tutorial/How-To' },
    { value: 'vlog', label: 'Vlog' },
    { value: 'review', label: 'Product Review' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'educational', label: 'Educational' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'music', label: 'Music' },
  ];

  const characterCount = generatedDescription.length;

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-red-900/20' : 'bg-gradient-to-r from-white to-red-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Youtube className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aIYouTubeDescription.aiYoutubeDescriptionGenerator', 'AI YouTube Description Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aIYouTubeDescription.createSeoOptimizedDescriptionsFor', 'Create SEO-optimized descriptions for your videos')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.aIYouTubeDescription.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Video Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIYouTubeDescription.videoType', 'Video Type')}</label>
          <div className="flex flex-wrap gap-2">
            {videoTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setVideoType(type.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  videoType === type.value
                    ? 'bg-red-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Video Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIYouTubeDescription.videoTitle', 'Video Title')}</label>
            <input
              type="text"
              value={formData.videoTitle}
              onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
              placeholder={t('tools.aIYouTubeDescription.eGHowToBuild', 'e.g., How to Build a Website from Scratch')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIYouTubeDescription.topicSubject', 'Topic/Subject')}</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder={t('tools.aIYouTubeDescription.eGBuildingWebsitesWeb', 'e.g., building websites, web development')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none`}
            />
          </div>
        </div>

        {/* Hook */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIYouTubeDescription.openingHook', 'Opening Hook')}</label>
          <input
            type="text"
            value={formData.hook}
            onChange={(e) => setFormData({ ...formData, hook: e.target.value })}
            placeholder={t('tools.aIYouTubeDescription.eGWantToLearn', 'e.g., Want to learn web development? You\'re in the right place!')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none`}
          />
        </div>

        {/* Key Points */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIYouTubeDescription.keyPointsSections', 'Key Points/Sections')}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={formData.point1}
              onChange={(e) => setFormData({ ...formData, point1: e.target.value })}
              placeholder={t('tools.aIYouTubeDescription.firstKeySection', 'First key section')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none`}
            />
            <input
              type="text"
              value={formData.point2}
              onChange={(e) => setFormData({ ...formData, point2: e.target.value })}
              placeholder={t('tools.aIYouTubeDescription.secondKeySection', 'Second key section')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none`}
            />
            <input
              type="text"
              value={formData.point3}
              onChange={(e) => setFormData({ ...formData, point3: e.target.value })}
              placeholder={t('tools.aIYouTubeDescription.thirdKeySection', 'Third key section')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none`}
            />
            <input
              type="text"
              value={formData.point4}
              onChange={(e) => setFormData({ ...formData, point4: e.target.value })}
              placeholder={t('tools.aIYouTubeDescription.fourthKeySectionOptional', 'Fourth key section (optional)')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none`}
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIYouTubeDescription.includeSections', 'Include Sections')}</label>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIncludeTimestamps(!includeTimestamps)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                includeTimestamps
                  ? 'bg-red-500 text-white'
                  : isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              {t('tools.aIYouTubeDescription.timestamps', 'Timestamps')}
            </button>
            <button
              onClick={() => setIncludeLinks(!includeLinks)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                includeLinks
                  ? 'bg-red-500 text-white'
                  : isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Link className="w-4 h-4" />
              {t('tools.aIYouTubeDescription.resourceLinks', 'Resource Links')}
            </button>
            <button
              onClick={() => setIncludeSocial(!includeSocial)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                includeSocial
                  ? 'bg-red-500 text-white'
                  : isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t('tools.aIYouTubeDescription.socialLinks', 'Social Links')}
            </button>
            <button
              onClick={() => setIncludeHashtags(!includeHashtags)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                includeHashtags
                  ? 'bg-red-500 text-white'
                  : isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Hash className="w-4 h-4" />
              {t('tools.aIYouTubeDescription.hashtags', 'Hashtags')}
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateDescription}
          className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20"
        >
          <Sparkles className="w-5 h-5" />
          {t('tools.aIYouTubeDescription.generateDescription', 'Generate Description')}
        </button>

        {/* Generated Description */}
        {generatedDescription && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                {t('tools.aIYouTubeDescription.generatedDescription', 'Generated Description')}
              </span>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {characterCount} characters
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
                  {copied ? t('tools.aIYouTubeDescription.copied', 'Copied!') : t('tools.aIYouTubeDescription.copy', 'Copy')}
                </button>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <pre className={`whitespace-pre-wrap text-sm leading-relaxed font-sans ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {generatedDescription}
              </pre>
            </div>

            <button
              onClick={generateDescription}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {t('tools.aIYouTubeDescription.regenerate', 'Regenerate')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!generatedDescription && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Youtube className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIYouTubeDescription.fillInYourVideoDetails', 'Fill in your video details to generate a description')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIYouTubeDescriptionTool;
