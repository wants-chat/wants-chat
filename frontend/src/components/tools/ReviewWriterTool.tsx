import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Loader2, Copy, Check, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const reviewTypes = [
  { value: 'product', label: 'Product Review' },
  { value: 'restaurant', label: 'Restaurant/Food Review' },
  { value: 'hotel', label: 'Hotel/Travel Review' },
  { value: 'service', label: 'Service Review' },
  { value: 'book', label: 'Book Review' },
  { value: 'movie', label: 'Movie/TV Review' },
  { value: 'game', label: 'Game Review' },
  { value: 'software', label: 'Software/App Review' },
  { value: 'course', label: 'Course/Education Review' },
];

const tones = [
  { value: 'balanced', label: 'Balanced & Fair' },
  { value: 'enthusiastic', label: 'Enthusiastic & Positive' },
  { value: 'critical', label: 'Critical & Detailed' },
  { value: 'casual', label: 'Casual & Conversational' },
  { value: 'professional', label: 'Professional & Objective' },
];

interface ReviewWriterToolProps {
  uiConfig?: UIConfig;
}

export const ReviewWriterTool: React.FC<ReviewWriterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [reviewType, setReviewType] = useState('product');
  const [itemName, setItemName] = useState('');
  const [rating, setRating] = useState(4);
  const [tone, setTone] = useState('balanced');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [experience, setExperience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState('');
  const [copied, setCopied] = useState(false);
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
        if (params.itemName) {
          setItemName(params.itemName);
          hasPrefill = true;
        }
        if (params.reviewType) {
          setReviewType(params.reviewType);
          hasPrefill = true;
        }
        if (params.rating) {
          setRating(typeof params.rating === 'string' ? parseInt(params.rating) : params.rating);
          hasPrefill = true;
        }
        if (params.tone) {
          setTone(params.tone);
          hasPrefill = true;
        }
        if (params.pros) {
          setPros(params.pros);
          hasPrefill = true;
        }
        if (params.cons) {
          setCons(params.cons);
          hasPrefill = true;
        }
        if (params.experience) {
          setExperience(params.experience);
          hasPrefill = true;
        }
        // Restore the generated review
        if (params.text) {
          setReview(params.text);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.text || params.content) {
          setItemName(params.text || params.content || '');
          hasPrefill = true;
        }
        if (params.formData) {
          if (params.formData.itemName) setItemName(params.formData.itemName);
          if (params.formData.reviewType) setReviewType(params.formData.reviewType);
          if (params.formData.rating) setRating(parseInt(params.formData.rating));
          if (params.formData.tone) setTone(params.formData.tone);
          if (params.formData.pros) setPros(params.formData.pros);
          if (params.formData.cons) setCons(params.formData.cons);
          if (params.formData.experience) setExperience(params.formData.experience);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!itemName.trim()) {
      setError('Please enter what you are reviewing');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const typeLabel = reviewTypes.find(t => t.value === reviewType)?.label;
      const toneLabel = tones.find(t => t.value === tone)?.label;

      const prompt = `Write a ${toneLabel} ${typeLabel} for: ${itemName}

Review Details:
- Rating: ${rating}/5 stars
- Positive Aspects: ${pros || 'Not specified - generate based on rating'}
- Negative Aspects: ${cons || 'Not specified - generate based on rating'}
- Personal Experience: ${experience || 'Not specified'}

Requirements:
1. Write a ${rating >= 4 ? 'positive' : rating >= 3 ? 'mixed' : 'critical'} review matching the ${rating}/5 rating
2. Be ${toneLabel.toLowerCase()} in tone
3. Include specific details about the ${reviewType}
4. ${pros ? `Highlight these positives: ${pros}` : 'Mention relevant positive aspects'}
5. ${cons ? `Address these concerns: ${cons}` : 'Mention relevant drawbacks or areas for improvement'}
6. Make it helpful for others considering this ${reviewType.replace('-', ' ')}
7. Include a clear recommendation at the end
8. Keep it authentic and conversational
9. Aim for 150-300 words
10. Don't use cliches like "game-changer" excessively

Format:
- Catchy opening line
- Main body with details
- Pros and cons
- Conclusion with recommendation`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a trusted reviewer who writes helpful, authentic reviews that help others make informed decisions.',
        temperature: 0.8,
        maxTokens: 1500,
      });

      if (response.success && response.data?.text) {
        setReview(response.data.text);
      } else {
        setError(response.error || 'Failed to generate review');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(review);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!review) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `Review: ${itemName}`,
        prompt: `Review for ${itemName}`,
        metadata: {
          text: review,
          toolId: 'review-writer',
          itemName,
          reviewType,
          rating,
          tone,
          pros,
          cons,
          experience,
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

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-yellow-900/20' : 'from-white to-yellow-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.reviewWriter.reviewWriter', 'Review Writer')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.reviewWriter.createHelpfulReviewsForProducts', 'Create helpful reviews for products and services')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">
              {isEditFromGallery
                ? t('tools.reviewWriter.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.reviewWriter.contentLoadedFromYourConversation', 'Content loaded from your conversation')}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.reviewWriter.reviewType', 'Review Type')}</label>
            <select
              value={reviewType}
              onChange={(e) => setReviewType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {reviewTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.reviewWriter.tone', 'Tone')}</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {tones.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.reviewWriter.whatAreYouReviewing', 'What Are You Reviewing? *')}</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder={t('tools.reviewWriter.productNameRestaurantHotelEtc', 'Product name, restaurant, hotel, etc.')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.reviewWriter.rating', 'Rating')}</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}
                />
              </button>
            ))}
            <span className={`ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{rating}/5 stars</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.reviewWriter.whatYouLikedPros', 'What You Liked (Pros)')}</label>
          <textarea
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            placeholder={t('tools.reviewWriter.listThePositiveAspects', 'List the positive aspects...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.reviewWriter.whatCouldBeBetterCons', 'What Could Be Better (Cons)')}</label>
          <textarea
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            placeholder={t('tools.reviewWriter.listAnyDrawbacksOrAreas', 'List any drawbacks or areas for improvement...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.reviewWriter.yourExperienceOptional', 'Your Experience (Optional)')}</label>
          <textarea
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder={t('tools.reviewWriter.shareSpecificDetailsAboutYour', 'Share specific details about your experience...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !itemName.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
          {isGenerating ? t('tools.reviewWriter.writingReview', 'Writing Review...') : t('tools.reviewWriter.generateReview', 'Generate Review')}
        </button>

        {review && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  {t('tools.reviewWriter.editable', 'Editable')}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.reviewWriter.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.reviewWriter.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('tools.reviewWriter.copied', 'Copied!') : t('tools.reviewWriter.copy', 'Copy')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-300' : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'} rounded-lg disabled:opacity-50`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.reviewWriter.save', 'Save')}
                </button>
              </div>
            </div>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={8}
              className={`w-full p-4 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-700'} rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all resize-y leading-relaxed`}
              placeholder={t('tools.reviewWriter.generatedReviewWillAppearHere', 'Generated review will appear here...')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewWriterTool;
