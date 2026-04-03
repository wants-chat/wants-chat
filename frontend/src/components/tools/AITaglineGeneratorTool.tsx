import React, { useState, useEffect } from 'react';
import { Zap, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

type Industry = 'technology' | 'healthcare' | 'finance' | 'retail' | 'food' | 'education' | 'fitness' | 'creative' | 'consulting' | 'other';
type Style = 'bold' | 'clever' | 'emotional' | 'simple' | 'action' | 'question';

interface TaglineTemplate {
  template: string;
  style: Style;
}

const taglineTemplates: Record<Industry, TaglineTemplate[]> = {
  technology: [
    { template: "{action} the future of {benefit}.", style: 'bold' },
    { template: "Where {adjective} meets {outcome}.", style: 'clever' },
    { template: "{benefit}. Simplified.", style: 'simple' },
    { template: "Because your {target} deserves {adjective} {noun}.", style: 'emotional' },
    { template: "Ready to {action} your {target}?", style: 'question' },
    { template: "{action}. {action2}. {outcome}.", style: 'action' },
  ],
  healthcare: [
    { template: "Caring for {target}, one {noun} at a time.", style: 'emotional' },
    { template: "Your health, our {adjective} priority.", style: 'simple' },
    { template: "{action} better health today.", style: 'action' },
    { template: "Where {adjective} care meets {outcome}.", style: 'clever' },
    { template: "Because you deserve {adjective} {noun}.", style: 'emotional' },
    { template: "The future of {noun} is here.", style: 'bold' },
  ],
  finance: [
    { template: "{action} your financial future.", style: 'action' },
    { template: "Where {adjective} meets {outcome}.", style: 'clever' },
    { template: "Your money, {adverb} protected.", style: 'simple' },
    { template: "{benefit}. Built for you.", style: 'bold' },
    { template: "Because your {target} matters.", style: 'emotional' },
    { template: "Ready to {action} smarter?", style: 'question' },
  ],
  retail: [
    { template: "{action} what you love.", style: 'simple' },
    { template: "Where {adjective} shopping meets {outcome}.", style: 'clever' },
    { template: "More than a store. A {noun}.", style: 'emotional' },
    { template: "{benefit}, delivered.", style: 'action' },
    { template: "Shop {adverb}. Live {adverb2}.", style: 'bold' },
    { template: "Why settle for less?", style: 'question' },
  ],
  food: [
    { template: "Taste the {adjective} difference.", style: 'simple' },
    { template: "Where {adjective} flavors come alive.", style: 'clever' },
    { template: "{action}. Savor. Repeat.", style: 'action' },
    { template: "Made with {noun}, served with {noun2}.", style: 'emotional' },
    { template: "Hungry for {adjective}?", style: 'question' },
    { template: "{benefit} in every bite.", style: 'bold' },
  ],
  education: [
    { template: "Where {adjective} minds {action}.", style: 'clever' },
    { template: "Learn {adverb}. Grow {adverb2}.", style: 'action' },
    { template: "Your journey to {outcome} starts here.", style: 'emotional' },
    { template: "{action} your potential.", style: 'bold' },
    { template: "Education, {adverb} reimagined.", style: 'simple' },
    { template: "Ready to {action} differently?", style: 'question' },
  ],
  fitness: [
    { template: "{action} your limits.", style: 'bold' },
    { template: "Where {adjective} bodies meet {adjective2} minds.", style: 'clever' },
    { template: "Your {adjective} self awaits.", style: 'emotional' },
    { template: "Train {adverb}. Live {adverb2}.", style: 'action' },
    { template: "Fitness, {adverb} done right.", style: 'simple' },
    { template: "Ready to become {adjective}?", style: 'question' },
  ],
  creative: [
    { template: "Where {adjective} ideas come to life.", style: 'clever' },
    { template: "{action}. Create. Inspire.", style: 'action' },
    { template: "Your vision, {adverb} realized.", style: 'emotional' },
    { template: "Creativity {adverb} unleashed.", style: 'bold' },
    { template: "{adjective} work. {adjective2} results.", style: 'simple' },
    { template: "What will you create?", style: 'question' },
  ],
  consulting: [
    { template: "Where {adjective} strategy drives {outcome}.", style: 'clever' },
    { template: "{action} your business forward.", style: 'action' },
    { template: "Your success, our {adjective} mission.", style: 'emotional' },
    { template: "Insight. Strategy. {outcome}.", style: 'bold' },
    { template: "{adjective} advice for {adjective2} growth.", style: 'simple' },
    { template: "Ready to {action} further?", style: 'question' },
  ],
  other: [
    { template: "Where {adjective} meets {outcome}.", style: 'clever' },
    { template: "{action}. {action2}. Succeed.", style: 'action' },
    { template: "Your {target}, our {adjective} focus.", style: 'emotional' },
    { template: "{benefit}, redefined.", style: 'bold' },
    { template: "{adjective} solutions for {adjective2} times.", style: 'simple' },
    { template: "Why choose ordinary?", style: 'question' },
  ],
};

const wordBank = {
  action: ['Transform', 'Discover', 'Unlock', 'Embrace', 'Elevate', 'Build', 'Create', 'Power', 'Drive', 'Shape', 'Ignite', 'Accelerate'],
  action2: ['Innovate', 'Evolve', 'Thrive', 'Achieve', 'Succeed', 'Lead', 'Excel', 'Grow'],
  adjective: ['innovative', 'exceptional', 'smart', 'bold', 'trusted', 'powerful', 'seamless', 'brilliant', 'dynamic', 'authentic'],
  adjective2: ['stronger', 'better', 'smarter', 'faster', 'brighter', 'healthier', 'happier'],
  adverb: ['brilliantly', 'effortlessly', 'boldly', 'smartly', 'simply', 'masterfully'],
  adverb2: ['better', 'bigger', 'bolder', 'brighter', 'fully'],
  outcome: ['success', 'results', 'excellence', 'innovation', 'growth', 'possibilities', 'impact'],
  benefit: ['Quality', 'Innovation', 'Excellence', 'Performance', 'Reliability', 'Trust'],
  target: ['future', 'business', 'team', 'vision', 'dreams', 'goals', 'journey'],
  noun: ['passion', 'purpose', 'care', 'love', 'excellence', 'quality', 'experience'],
  noun2: ['heart', 'dedication', 'pride', 'expertise'],
};

interface AITaglineGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const AITaglineGeneratorTool: React.FC<AITaglineGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [generatedTaglines, setGeneratedTaglines] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    businessName: '',
    industry: 'technology' as Industry,
    targetAudience: '',
    uniqueValue: '',
    keywords: '',
  });

  const [style, setStyle] = useState<Style>('bold');
  const [count, setCount] = useState(5);

  const getRandomWord = (category: keyof typeof wordBank) => {
    const words = wordBank[category];
    return words[Math.floor(Math.random() * words.length)];
  };

  const generateTaglines = () => {
    const templates = taglineTemplates[formData.industry] || taglineTemplates.other;
    const filteredTemplates = style === 'bold'
      ? templates
      : templates.filter(t => t.style === style).length > 0
        ? templates.filter(t => t.style === style)
        : templates;

    const taglines: string[] = [];
    const usedTemplates = new Set<number>();

    while (taglines.length < count && usedTemplates.size < filteredTemplates.length) {
      const idx = Math.floor(Math.random() * filteredTemplates.length);
      if (usedTemplates.has(idx)) continue;
      usedTemplates.add(idx);

      let tagline = filteredTemplates[idx].template;

      // Replace placeholders with random words
      tagline = tagline.replace(/{action}/g, getRandomWord('action'));
      tagline = tagline.replace(/{action2}/g, getRandomWord('action2'));
      tagline = tagline.replace(/{adjective}/g, getRandomWord('adjective'));
      tagline = tagline.replace(/{adjective2}/g, getRandomWord('adjective2'));
      tagline = tagline.replace(/{adverb}/g, getRandomWord('adverb'));
      tagline = tagline.replace(/{adverb2}/g, getRandomWord('adverb2'));
      tagline = tagline.replace(/{outcome}/g, getRandomWord('outcome'));
      tagline = tagline.replace(/{benefit}/g, getRandomWord('benefit'));
      tagline = tagline.replace(/{target}/g, getRandomWord('target'));
      tagline = tagline.replace(/{noun}/g, getRandomWord('noun'));
      tagline = tagline.replace(/{noun2}/g, getRandomWord('noun2'));

      // Capitalize first letter
      tagline = tagline.charAt(0).toUpperCase() + tagline.slice(1);

      taglines.push(tagline);
    }

    // Fill remaining with variations if needed
    while (taglines.length < count) {
      const template = filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)];
      let tagline = template.template;

      tagline = tagline.replace(/{action}/g, getRandomWord('action'));
      tagline = tagline.replace(/{action2}/g, getRandomWord('action2'));
      tagline = tagline.replace(/{adjective}/g, getRandomWord('adjective'));
      tagline = tagline.replace(/{adjective2}/g, getRandomWord('adjective2'));
      tagline = tagline.replace(/{adverb}/g, getRandomWord('adverb'));
      tagline = tagline.replace(/{adverb2}/g, getRandomWord('adverb2'));
      tagline = tagline.replace(/{outcome}/g, getRandomWord('outcome'));
      tagline = tagline.replace(/{benefit}/g, getRandomWord('benefit'));
      tagline = tagline.replace(/{target}/g, getRandomWord('target'));
      tagline = tagline.replace(/{noun}/g, getRandomWord('noun'));
      tagline = tagline.replace(/{noun2}/g, getRandomWord('noun2'));

      tagline = tagline.charAt(0).toUpperCase() + tagline.slice(1);

      if (!taglines.includes(tagline)) {
        taglines.push(tagline);
      }
    }

    setGeneratedTaglines(taglines);
  };

  const handleCopy = (index: number) => {
    navigator.clipboard.writeText(generatedTaglines[index]);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedTaglines.join('\n'));
    setCopied(-1);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.businessName) setFormData(prev => ({ ...prev, businessName: params.businessName }));
      if (params.industry) setFormData(prev => ({ ...prev, industry: params.industry }));
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  const industries: { value: Industry; label: string }[] = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'education', label: 'Education' },
    { value: 'fitness', label: 'Fitness & Wellness' },
    { value: 'creative', label: 'Creative & Design' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'other', label: 'Other' },
  ];

  const styles: { value: Style; label: string; desc: string }[] = [
    { value: 'bold', label: 'Bold', desc: 'Strong and confident' },
    { value: 'clever', label: 'Clever', desc: 'Witty and memorable' },
    { value: 'emotional', label: 'Emotional', desc: 'Connects with feelings' },
    { value: 'simple', label: 'Simple', desc: 'Clear and direct' },
    { value: 'action', label: 'Action', desc: 'Call to action' },
    { value: 'question', label: 'Question', desc: 'Engages curiosity' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Zap className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aITaglineGenerator.aiTaglineGenerator', 'AI Tagline Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aITaglineGenerator.createCatchyTaglinesForYour', 'Create catchy taglines for your business')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.aITaglineGenerator.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Business Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aITaglineGenerator.businessName', 'Business Name')}</label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder={t('tools.aITaglineGenerator.eGAcmeCorp', 'e.g., Acme Corp')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aITaglineGenerator.industry', 'Industry')}</label>
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

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aITaglineGenerator.targetAudienceOptional', 'Target Audience (Optional)')}</label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder={t('tools.aITaglineGenerator.eGSmallBusinessOwners', 'e.g., Small business owners')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aITaglineGenerator.uniqueValueOptional', 'Unique Value (Optional)')}</label>
            <input
              type="text"
              value={formData.uniqueValue}
              onChange={(e) => setFormData({ ...formData, uniqueValue: e.target.value })}
              placeholder={t('tools.aITaglineGenerator.eGFastestDeliveryIn', 'e.g., Fastest delivery in the industry')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>
        </div>

        {/* Style Selection */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aITaglineGenerator.taglineStyle', 'Tagline Style')}</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {styles.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`p-3 rounded-xl text-left transition-all ${
                  style === s.value
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{s.label}</div>
                <div className={`text-xs ${style === s.value ? 'text-teal-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Number of Taglines: {count}</label>
          <input
            type="range"
            min="3"
            max="10"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateTaglines}
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20"
        >
          <Sparkles className="w-5 h-5" />
          {t('tools.aITaglineGenerator.generateTaglines', 'Generate Taglines')}
        </button>

        {/* Generated Taglines */}
        {generatedTaglines.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                {t('tools.aITaglineGenerator.generatedTaglines', 'Generated Taglines')}
              </span>
              <button
                onClick={handleCopyAll}
                className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                  copied === -1
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied === -1 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === -1 ? t('tools.aITaglineGenerator.copied', 'Copied!') : t('tools.aITaglineGenerator.copyAll', 'Copy All')}
              </button>
            </div>

            {generatedTaglines.map((tagline, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl flex justify-between items-center gap-3 ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} border`}
              >
                <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  "{tagline}"
                </p>
                <button
                  onClick={() => handleCopy(index)}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                    copied === index
                      ? 'bg-green-500 text-white'
                      : 'bg-teal-500 hover:bg-teal-600 text-white'
                  }`}
                >
                  {copied === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}

            <button
              onClick={generateTaglines}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {t('tools.aITaglineGenerator.generateMore', 'Generate More')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {generatedTaglines.length === 0 && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aITaglineGenerator.enterYourBusinessDetailsTo', 'Enter your business details to generate taglines')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITaglineGeneratorTool;
