import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Loader2, Copy, Check, Clock, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const tutorialTypes = [
  { value: 'step-by-step', label: 'Step-by-Step Guide' },
  { value: 'quick-start', label: 'Quick Start Guide' },
  { value: 'comprehensive', label: 'Comprehensive Tutorial' },
  { value: 'video-script', label: 'Video Tutorial Script' },
  { value: 'hands-on', label: 'Hands-on Workshop' },
  { value: 'reference', label: 'Reference Documentation' },
];

const targetAudiences = [
  { value: 'beginner', label: 'Beginner (No prior knowledge)' },
  { value: 'intermediate', label: 'Intermediate (Some experience)' },
  { value: 'advanced', label: 'Advanced (Experienced users)' },
  { value: 'all-levels', label: 'All Skill Levels' },
];

const categories = [
  { value: 'software', label: 'Software/App' },
  { value: 'programming', label: 'Programming/Coding' },
  { value: 'design', label: 'Design/Creative' },
  { value: 'business', label: 'Business Process' },
  { value: 'diy', label: 'DIY/Craft' },
  { value: 'cooking', label: 'Cooking/Recipe' },
  { value: 'fitness', label: 'Fitness/Exercise' },
  { value: 'other', label: 'Other' },
];

interface TutorialWriterToolProps {
  uiConfig?: UIConfig;
}

export const TutorialWriterTool: React.FC<TutorialWriterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [topic, setTopic] = useState('');
  const [tutorialType, setTutorialType] = useState('step-by-step');
  const [category, setCategory] = useState('software');
  const [targetAudience, setTargetAudience] = useState('beginner');
  const [learningGoals, setLearningGoals] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorial, setTutorial] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Prefill from uiConfig or gallery edit
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
        if (params.tutorialType) {
          setTutorialType(params.tutorialType);
          hasPrefill = true;
        }
        if (params.category) {
          setCategory(params.category);
          hasPrefill = true;
        }
        if (params.targetAudience) {
          setTargetAudience(params.targetAudience);
          hasPrefill = true;
        }
        if (params.learningGoals) {
          setLearningGoals(params.learningGoals);
          hasPrefill = true;
        }
        if (params.prerequisites) {
          setPrerequisites(params.prerequisites);
          hasPrefill = true;
        }
        if (params.additionalNotes) {
          setAdditionalNotes(params.additionalNotes);
          hasPrefill = true;
        }
        // Restore the generated tutorial
        if (params.text) {
          setTutorial(params.text);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.text || params.content) {
          setTopic(params.text || params.content || '');
          hasPrefill = true;
        }
        if (params.formData) {
          if (params.formData.topic) setTopic(params.formData.topic);
          if (params.formData.tutorialType) setTutorialType(params.formData.tutorialType);
          if (params.formData.category) setCategory(params.formData.category);
          if (params.formData.targetAudience) setTargetAudience(params.formData.targetAudience);
          if (params.formData.learningGoals) setLearningGoals(params.formData.learningGoals);
          if (params.formData.prerequisites) setPrerequisites(params.formData.prerequisites);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for your tutorial');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const typeLabel = tutorialTypes.find(t => t.value === tutorialType)?.label;
      const audienceLabel = targetAudiences.find(a => a.value === targetAudience)?.label;
      const categoryLabel = categories.find(c => c.value === category)?.label;

      const prompt = `Create a ${typeLabel} tutorial about: ${topic}

Tutorial Details:
- Category: ${categoryLabel}
- Target Audience: ${audienceLabel}
- Learning Goals: ${learningGoals || 'Understand and apply the topic'}
- Prerequisites: ${prerequisites || 'None specified'}
- Additional Notes: ${additionalNotes || 'None'}

Requirements:
1. Start with an engaging introduction explaining what the reader will learn
2. Include clear prerequisites section if applicable
3. Break content into logical, numbered steps
4. Use clear, concise language appropriate for ${audienceLabel}
5. Include helpful tips, warnings, and best practices
6. Add troubleshooting section for common issues
7. Include a summary/recap at the end
8. ${tutorialType === 'video-script' ? 'Format as a video script with timing cues' : ''}
9. ${category === 'programming' ? 'Include code examples with comments' : ''}
10. Make it actionable - readers should be able to follow along

Format with:
- Clear headings and subheadings
- Numbered steps
- Bullet points for lists
- [TIP], [WARNING], [NOTE] callouts where appropriate`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert technical writer who creates clear, comprehensive tutorials that help people learn effectively.',
        temperature: 0.7,
        maxTokens: 4000,
      });

      if (response.success && response.data?.text) {
        setTutorial(response.data.text);
      } else {
        setError(response.error || 'Failed to generate tutorial');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tutorial);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!tutorial) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `Tutorial: ${topic}`,
        prompt: `Tutorial on ${topic}`,
        metadata: {
          text: tutorial,
          toolId: 'tutorial-writer',
          topic,
          tutorialType,
          category,
          targetAudience,
          learningGoals,
          prerequisites,
          additionalNotes,
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

  const wordCount = tutorial.split(/\s+/).filter(w => w).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-sky-900/20' : 'from-white to-sky-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 rounded-lg">
            <GraduationCap className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.tutorialWriter.tutorialWriter', 'Tutorial Writer')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tutorialWriter.createComprehensiveTutorialsOnAny', 'Create comprehensive tutorials on any topic')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">
              {isEditFromGallery
                ? t('tools.tutorialWriter.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.tutorialWriter.contentLoadedFromYourConversation', 'Content loaded from your conversation')}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tutorialWriter.tutorialTopic', 'Tutorial Topic *')}</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.tutorialWriter.whatDoYouWantTo', 'What do you want to teach? (e.g., How to use Git, Building a React app)')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tutorialWriter.tutorialType', 'Tutorial Type')}</label>
            <select
              value={tutorialType}
              onChange={(e) => setTutorialType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {tutorialTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tutorialWriter.category', 'Category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tutorialWriter.targetAudience', 'Target Audience')}</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {targetAudiences.map((audience) => (
                <option key={audience.value} value={audience.value}>{audience.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tutorialWriter.learningGoals', 'Learning Goals')}</label>
          <textarea
            value={learningGoals}
            onChange={(e) => setLearningGoals(e.target.value)}
            placeholder={t('tools.tutorialWriter.whatShouldLearnersBeAble', 'What should learners be able to do after completing this tutorial?')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tutorialWriter.prerequisites', 'Prerequisites')}</label>
          <input
            type="text"
            value={prerequisites}
            onChange={(e) => setPrerequisites(e.target.value)}
            placeholder={t('tools.tutorialWriter.whatShouldLearnersKnowBeforehand', 'What should learners know beforehand? (e.g., Basic JavaScript)')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tutorialWriter.additionalNotes', 'Additional Notes')}</label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder={t('tools.tutorialWriter.anySpecificToolsVersionsOr', 'Any specific tools, versions, or considerations to include...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <GraduationCap className="w-5 h-5" />}
          {isGenerating ? t('tools.tutorialWriter.writingTutorial', 'Writing Tutorial...') : t('tools.tutorialWriter.generateTutorial', 'Generate Tutorial')}
        </button>

        {tutorial && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{wordCount} words</span>
                <span className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="w-4 h-4" /> {readingTime} min read
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  {t('tools.tutorialWriter.editable', 'Editable')}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.tutorialWriter.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.tutorialWriter.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('tools.tutorialWriter.copied', 'Copied!') : t('tools.tutorialWriter.copy', 'Copy')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-sky-900/30 hover:bg-sky-900/50 text-sky-300' : 'bg-sky-50 hover:bg-sky-100 text-sky-700'} rounded-lg disabled:opacity-50`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.tutorialWriter.save', 'Save')}
                </button>
              </div>
            </div>
            <textarea
              value={tutorial}
              onChange={(e) => setTutorial(e.target.value)}
              rows={20}
              className={`w-full p-4 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-700'} rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all resize-y leading-relaxed`}
              placeholder={t('tools.tutorialWriter.generatedTutorialWillAppearHere', 'Generated tutorial will appear here...')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialWriterTool;
