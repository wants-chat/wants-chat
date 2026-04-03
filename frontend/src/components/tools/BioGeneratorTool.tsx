import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Platform = 'twitter' | 'instagram' | 'linkedin' | 'tiktok' | 'general';
type Tone = 'professional' | 'casual' | 'funny' | 'creative' | 'minimal';

interface BioTemplate {
  template: string;
  tone: Tone;
}

const bioTemplates: Record<string, BioTemplate[]> = {
  developer: [
    { template: "{emoji} {title} | Building {project} | {hobby} enthusiast | {location}", tone: 'casual' },
    { template: "{title} crafting digital experiences. {specialty} expert. Open source contributor. {hobby} lover.", tone: 'professional' },
    { template: "I turn coffee into code ☕💻 | {specialty} | Making the web a better place, one commit at a time", tone: 'funny' },
    { template: "{emoji} {specialty} | {project} | {location}", tone: 'minimal' },
  ],
  creator: [
    { template: "{emoji} Creating content that matters | {niche} | {achievement} | DM for collabs ✉️", tone: 'casual' },
    { template: "Content Creator | {niche} | Helping you {benefit} | 📧 {email}", tone: 'professional' },
    { template: "Professional overthinker 🧠 | {niche} content | Here to make you {emotion} | Link below 👇", tone: 'funny' },
    { template: "{niche} • {achievement} • {location}", tone: 'minimal' },
  ],
  entrepreneur: [
    { template: "Founder @{company} | {mission} | {achievement} | Sharing the journey", tone: 'casual' },
    { template: "CEO & Founder of {company} | {industry} | Building solutions for {problem} | {location}", tone: 'professional' },
    { template: "Failed {number}x, succeeded once. Now helping others skip the failures. 🚀 Founder @{company}", tone: 'funny' },
    { template: "Building {company} | {industry}", tone: 'minimal' },
  ],
  fitness: [
    { template: "{emoji} Fitness & Health | {specialty} | Transform your body & mind | 💪 Let's get started!", tone: 'casual' },
    { template: "Certified {certification} | {specialty} Coach | Helping you achieve your {goal} goals", tone: 'professional' },
    { template: "I lift things up and put them down 🏋️ | {specialty} | Your future gains are calling", tone: 'funny' },
    { template: "{specialty} • {certification} • {location}", tone: 'minimal' },
  ],
  general: [
    { template: "{emoji} {occupation} | {hobby} lover | {location} | Living life one {thing} at a time", tone: 'casual' },
    { template: "{occupation} | Passionate about {interest} | {achievement} | {location}", tone: 'professional' },
    { template: "Just a {occupation} trying to {goal} without breaking anything 😅 | {hobby} enthusiast", tone: 'funny' },
    { template: "{occupation} • {location}", tone: 'minimal' },
  ],
};

const emojis = ['✨', '🚀', '💡', '🎯', '⚡', '🌟', '💪', '🔥', '🎨', '💻', '📱', '🌍'];

const platformLimits: Record<Platform, number> = {
  twitter: 160,
  instagram: 150,
  linkedin: 220,
  tiktok: 80,
  general: 300,
};

interface BioGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const BioGeneratorTool: React.FC<BioGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [platform, setPlatform] = useState<Platform>('instagram');
  const [category, setCategory] = useState('general');
  const [tone, setTone] = useState<Tone>('casual');
  const [formData, setFormData] = useState({
    name: '',
    occupation: '',
    specialty: '',
    hobby: '',
    location: '',
    achievement: '',
    company: '',
    project: '',
  });
  const [generatedBio, setGeneratedBio] = useState('');
  const [copied, setCopied] = useState(false);

  const generateBio = () => {
    const templates = bioTemplates[category] || bioTemplates.general;
    const matchingTemplates = templates.filter(t => t.tone === tone);
    const template = matchingTemplates.length > 0
      ? matchingTemplates[Math.floor(Math.random() * matchingTemplates.length)]
      : templates[Math.floor(Math.random() * templates.length)];

    let bio = template.template;
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    // Replace placeholders
    bio = bio.replace(/{emoji}/g, emoji);
    bio = bio.replace(/{name}/g, formData.name || 'Your Name');
    bio = bio.replace(/{occupation}/g, formData.occupation || 'Professional');
    bio = bio.replace(/{title}/g, formData.occupation || 'Developer');
    bio = bio.replace(/{specialty}/g, formData.specialty || 'Full-Stack');
    bio = bio.replace(/{hobby}/g, formData.hobby || 'Coffee');
    bio = bio.replace(/{location}/g, formData.location || '🌍');
    bio = bio.replace(/{achievement}/g, formData.achievement || '10K+ followers');
    bio = bio.replace(/{company}/g, formData.company || 'MyStartup');
    bio = bio.replace(/{project}/g, formData.project || 'amazing things');
    bio = bio.replace(/{niche}/g, formData.specialty || 'Tech');
    bio = bio.replace(/{industry}/g, formData.specialty || 'Technology');
    bio = bio.replace(/{certification}/g, formData.specialty || 'Personal Trainer');
    bio = bio.replace(/{goal}/g, 'fitness');
    bio = bio.replace(/{interest}/g, formData.hobby || 'technology');
    bio = bio.replace(/{benefit}/g, 'grow online');
    bio = bio.replace(/{problem}/g, 'real problems');
    bio = bio.replace(/{mission}/g, 'making a difference');
    bio = bio.replace(/{emotion}/g, 'smile');
    bio = bio.replace(/{thing}/g, 'day');
    bio = bio.replace(/{number}/g, String(Math.floor(Math.random() * 10) + 3));
    bio = bio.replace(/{email}/g, 'hello@example.com');

    // Trim to platform limit
    if (bio.length > platformLimits[platform]) {
      bio = bio.substring(0, platformLimits[platform] - 3) + '...';
    }

    setGeneratedBio(bio);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedBio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'developer', label: 'Developer' },
    { value: 'creator', label: 'Creator' },
    { value: 'entrepreneur', label: 'Entrepreneur' },
    { value: 'fitness', label: 'Fitness' },
  ];

  const tones: { value: Tone; label: string }[] = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'funny', label: 'Funny' },
    { value: 'creative', label: 'Creative' },
    { value: 'minimal', label: 'Minimal' },
  ];

  const platforms: { value: Platform; label: string; limit: number }[] = [
    { value: 'instagram', label: 'Instagram', limit: 150 },
    { value: 'twitter', label: 'Twitter/X', limit: 160 },
    { value: 'linkedin', label: 'LinkedIn', limit: 220 },
    { value: 'tiktok', label: 'TikTok', limit: 80 },
    { value: 'general', label: 'General', limit: 300 },
  ];

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || '';
      if (textContent) {
        setFormData(prev => ({
          ...prev,
          occupation: textContent,
        }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <User className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bioGenerator.bioGenerator', 'Bio Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bioGenerator.createCatchySocialMediaBios', 'Create catchy social media bios')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Platform Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.bioGenerator.platform', 'Platform')}
          </label>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  platform === p.value
                    ? 'bg-pink-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {p.label}
                <span className={`ml-1 text-xs ${platform === p.value ? 'text-pink-200' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  ({p.limit})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Category & Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.bioGenerator.category', 'Category')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.bioGenerator.tone', 'Tone')}
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {tones.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.bioGenerator.occupationTitle', 'Occupation/Title')}
            </label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder={t('tools.bioGenerator.eGDeveloperDesignerCoach', 'e.g., Developer, Designer, Coach')}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.bioGenerator.specialtyNiche', 'Specialty/Niche')}
            </label>
            <input
              type="text"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              placeholder={t('tools.bioGenerator.eGReactFitnessMarketing', 'e.g., React, Fitness, Marketing')}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.bioGenerator.hobbyInterest', 'Hobby/Interest')}
            </label>
            <input
              type="text"
              value={formData.hobby}
              onChange={(e) => setFormData({ ...formData, hobby: e.target.value })}
              placeholder={t('tools.bioGenerator.eGCoffeeTravelGaming', 'e.g., Coffee, Travel, Gaming')}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.bioGenerator.location', 'Location')}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={t('tools.bioGenerator.eGNycRemote', 'e.g., NYC, Remote, 🌍')}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateBio}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/20"
        >
          <Sparkles className="w-5 h-5" />
          {t('tools.bioGenerator.generateBio', 'Generate Bio')}
        </button>

        {/* Generated Bio */}
        {generatedBio && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-100'} border`}>
            <div className="flex justify-between items-start mb-3">
              <span className={`text-sm font-medium ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>
                {t('tools.bioGenerator.generatedBio', 'Generated Bio')}
              </span>
              <span className={`text-sm ${generatedBio.length > platformLimits[platform] ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {generatedBio.length}/{platformLimits[platform]}
              </span>
            </div>
            <p className={`text-lg leading-relaxed ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {generatedBio}
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCopy}
                className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-pink-500 hover:bg-pink-600 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.bioGenerator.copied', 'Copied!') : t('tools.bioGenerator.copyBio', 'Copy Bio')}
              </button>
              <button
                onClick={generateBio}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {t('tools.bioGenerator.regenerate', 'Regenerate')}
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.bioGenerator.tipsForGreatBios', 'Tips for great bios:')}</strong> Keep it concise, show personality, include a call-to-action,
            and use relevant emojis sparingly. Update your bio regularly to reflect your current focus.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BioGeneratorTool;
