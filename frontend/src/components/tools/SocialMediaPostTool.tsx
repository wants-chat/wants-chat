import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Loader2, Copy, Check, Hash, Sparkles, Save, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface GeneratedPost {
  content: string;
  platform: string;
  hashtags: string[];
  timestamp: Date;
}

const platforms = [
  { label: 'Twitter/X', value: 'twitter', maxLength: 280, icon: '𝕏' },
  { label: 'Instagram', value: 'instagram', maxLength: 2200, icon: '📷' },
  { label: 'Facebook', value: 'facebook', maxLength: 63206, icon: 'f' },
  { label: 'LinkedIn', value: 'linkedin', maxLength: 3000, icon: 'in' },
];

const tones = [
  { label: 'Professional', value: 'professional' },
  { label: 'Casual', value: 'casual' },
  { label: 'Enthusiastic', value: 'enthusiastic' },
  { label: 'Humorous', value: 'humorous' },
  { label: 'Inspirational', value: 'inspirational' },
  { label: 'Educational', value: 'educational' },
];

interface SocialMediaPostToolProps {
  uiConfig?: UIConfig;
}

export const SocialMediaPostTool = ({
  uiConfig }: SocialMediaPostToolProps) => {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState(platforms[0]);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState(tones[0]);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle prefill from uiConfig or gallery edit
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.topic) {
          setTopic(params.topic);
          hasPrefill = true;
        }
        if (params.additionalNotes) {
          setAdditionalNotes(params.additionalNotes);
          hasPrefill = true;
        }
        if (params.platform) {
          const foundPlatform = platforms.find(p => p.value === params.platform);
          if (foundPlatform) {
            setPlatform(foundPlatform);
            hasPrefill = true;
          }
        }
        if (params.tone) {
          const foundTone = tones.find(t => t.value === params.tone);
          if (foundTone) {
            setTone(foundTone);
            hasPrefill = true;
          }
        }
        if (params.includeHashtags !== undefined) {
          setIncludeHashtags(params.includeHashtags);
          hasPrefill = true;
        }
        if (params.includeEmojis !== undefined) {
          setIncludeEmojis(params.includeEmojis);
          hasPrefill = true;
        }
        // Restore the generated post
        if (params.text) {
          const hashtagRegex = /#[\w]+/g;
          const extractedHashtags = params.text.match(hashtagRegex) || [];
          setGeneratedPost({
            content: params.text,
            platform: params.platform ? platforms.find(p => p.value === params.platform)?.label || platform.label : platform.label,
            hashtags: extractedHashtags,
            timestamp: new Date(),
          });
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.topic) {
          setTopic(params.topic);
          hasPrefill = true;
        }
        if (params.additionalNotes) {
          setAdditionalNotes(params.additionalNotes);
          hasPrefill = true;
        }
        if (params.platform) {
          const foundPlatform = platforms.find(p => p.value === params.platform);
          if (foundPlatform) {
            setPlatform(foundPlatform);
            hasPrefill = true;
          }
        }
        if (params.tone) {
          const foundTone = tones.find(t => t.value === params.tone);
          if (foundTone) {
            setTone(foundTone);
            hasPrefill = true;
          }
        }
        if (params.includeHashtags !== undefined) {
          setIncludeHashtags(params.includeHashtags);
          hasPrefill = true;
        }
        if (params.includeEmojis !== undefined) {
          setIncludeEmojis(params.includeEmojis);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or content idea');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Create a social media post for ${platform.label} with the following specifications:

Topic/Content: ${topic}
Tone: ${tone.label}
Platform: ${platform.label} (max ${platform.maxLength} characters)
Include Hashtags: ${includeHashtags ? 'Yes' : 'No'}
Include Emojis: ${includeEmojis ? 'Yes' : 'No'}
${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}

Please create an engaging post optimized for ${platform.label}, following best practices for the platform. ${includeHashtags ? 'Include relevant hashtags at the end.' : ''} ${includeEmojis ? 'Use emojis appropriately to enhance engagement.' : ''}`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a social media marketing expert. Create engaging, platform-optimized posts that drive engagement. Always provide complete post content.',
        temperature: 0.8,
        maxTokens: 1000,
      });

      // Check for API error response
      if (response.success === false) {
        throw new Error(response.error || 'Failed to generate social media post');
      }

      // Extract content from various possible response structures
      let postContent = '';
      if (response.data && typeof response.data.text === 'string') {
        postContent = response.data.text;
      } else if (typeof response.text === 'string') {
        postContent = response.text;
      } else if (response.data && typeof response.data.content === 'string') {
        postContent = response.data.content;
      } else if (typeof response.content === 'string') {
        postContent = response.content;
      } else if (typeof response.data === 'string') {
        postContent = response.data;
      } else if (typeof response === 'string') {
        postContent = response;
      }

      postContent = postContent.trim();

      if (!postContent) {
        throw new Error('No post content was generated. The AI service may be unavailable or you may have reached your usage limit. Please try again later.');
      }

      // Validate content has sufficient length (social posts can be short, but not empty)
      if (postContent.length < 10) {
        throw new Error('Generated post is too short. Please try again with more detailed input.');
      }

      // Extract hashtags from the content
      const hashtagRegex = /#[\w]+/g;
      const extractedHashtags = postContent.match(hashtagRegex) || [];

      setGeneratedPost({
        content: postContent,
        platform: platform.label,
        hashtags: extractedHashtags,
        timestamp: new Date(),
      });

      // Note: User can save manually using the Save button
      // Auto-save removed to avoid duplicate saves
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate post');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedPost) return;

    await navigator.clipboard.writeText(generatedPost.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!generatedPost) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `${platform.label} Post: ${topic.substring(0, 50)}`,
        prompt: `Social media post for ${platform.label}`,
        metadata: {
          text: generatedPost.content,
          toolId: 'social-media-post',
          topic,
          platform: platform.value,
          tone: tone.value,
          includeHashtags,
          includeEmojis,
          additionalNotes,
          hashtags: generatedPost.hashtags,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Call the save callback to refresh the gallery if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getCharacterCount = () => {
    if (!generatedPost) return null;
    return generatedPost.content.length;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 dark:from-gray-800 dark:to-[#0D9488]/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Share2 className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('tools.socialMediaPost.aiSocialMediaPostCreator', 'AI Social Media Post Creator')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('tools.socialMediaPost.generateEngagingSocialMediaPosts', 'Generate engaging social media posts with AI')}
            </p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>
                  {isEditFromGallery
                    ? t('tools.socialMediaPost.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.socialMediaPost.preFilledFromYourRequest', 'Pre-filled from your request')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Platform Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.socialMediaPost.platform', 'Platform')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {platforms.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  platform.value === p.value
                    ? t('tools.socialMediaPost.border0d9488Bg0d948810', 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]') : t('tools.socialMediaPost.borderGray200DarkBorder', 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#0D9488]/50')
                }`}
              >
                <div className="font-semibold text-sm">{p.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {p.maxLength} chars
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Topic Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.socialMediaPost.topicContentIdea', 'Topic / Content Idea')}
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.socialMediaPost.whatDoYouWantTo', 'What do you want to post about? E.g., \'Launching our new product\', \'Tips for better productivity\', etc.')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Tone Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.socialMediaPost.tone', 'Tone')}
          </label>
          <select
            value={tone.value}
            onChange={(e) => {
              const selected = tones.find((t) => t.value === e.target.value);
              if (selected) setTone(selected);
            }}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
          >
            {tones.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Options
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHashtags}
                onChange={(e) => setIncludeHashtags(e.target.checked)}
                className="w-4 h-4 text-[#0D9488] border-gray-300 rounded focus:ring-[#0D9488] focus:ring-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Hash className="w-4 h-4" />
                {t('tools.socialMediaPost.includeHashtags', 'Include Hashtags')}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeEmojis}
                onChange={(e) => setIncludeEmojis(e.target.checked)}
                className="w-4 h-4 text-[#0D9488] border-gray-300 rounded focus:ring-[#0D9488] focus:ring-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.socialMediaPost.includeEmojis', 'Include Emojis')}</span>
            </label>
          </div>
        </div>

        {/* Additional Notes Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.socialMediaPost.additionalNotesOptional', 'Additional Notes (Optional)')}
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder={t('tools.socialMediaPost.anySpecificRequirementsCallTo', 'Any specific requirements, call-to-action, or details to include...')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.socialMediaPost.generatingPost', 'Generating Post...')}
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              {t('tools.socialMediaPost.generatePost', 'Generate Post')}
            </>
          )}
        </button>

        {/* Generated Post Display */}
        {generatedPost && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Generated Post
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  {t('tools.socialMediaPost.editable', 'Editable')}
                </span>
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.socialMediaPost.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.socialMediaPost.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t('tools.socialMediaPost.copied', 'Copied!')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t('tools.socialMediaPost.copy', 'Copy')}
                    </>
                  )}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.socialMediaPost.save', 'Save')}
                </button>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('tools.socialMediaPost.platform2', 'Platform:')}
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {generatedPost.platform}
                  </p>
                </div>
                {getCharacterCount() && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('tools.socialMediaPost.characters', 'Characters:')}
                    </p>
                    <p
                      className={`font-medium ${
                        getCharacterCount()! > platform.maxLength
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}
                    >
                      {getCharacterCount()} / {platform.maxLength}
                    </p>
                  </div>
                )}
              </div>
              <textarea
                value={generatedPost.content}
                onChange={(e) => setGeneratedPost({
                  ...generatedPost,
                  content: e.target.value,
                })}
                rows={6}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-y leading-relaxed"
                placeholder={t('tools.socialMediaPost.generatedPostWillAppearHere', 'Generated post will appear here...')}
              />
              {generatedPost.hashtags.length > 0 && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {t('tools.socialMediaPost.hashtagsUsed', 'Hashtags Used:')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {generatedPost.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#0D9488]/10 text-[#0D9488] rounded-lg text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedPost && !isGenerating && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Share2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.socialMediaPost.yourGeneratedPostWillAppear', 'Your generated post will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaPostTool;
