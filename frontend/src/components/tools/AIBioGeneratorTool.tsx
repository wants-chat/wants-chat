import React, { useState, useEffect } from 'react';
import { User, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

type BioType = 'professional' | 'creative' | 'executive' | 'entrepreneur' | 'freelancer' | 'academic';
type Tone = 'formal' | 'conversational' | 'confident' | 'friendly' | 'authoritative';
type Length = 'short' | 'medium' | 'long';

interface BioTemplate {
  template: string;
  tone: Tone;
  type: BioType;
}

const bioTemplates: BioTemplate[] = [
  // Professional
  { template: "{name} is a {title} with {experience} years of experience in {industry}. Specializing in {specialty}, {pronoun} has helped organizations {achievement}. {name} holds a {degree} and is passionate about {passion}.", tone: 'formal', type: 'professional' },
  { template: "As a seasoned {title}, {name} brings {experience}+ years of expertise to {industry}. Known for {strength}, {pronoun} has a proven track record of {achievement}. Currently focused on {focus}.", tone: 'authoritative', type: 'professional' },
  { template: "Meet {name}, a {title} who loves turning complex {industry} challenges into simple solutions. With {experience} years under {possessive} belt, {pronoun}'s helped countless clients {achievement}. When not {work_activity}, you'll find {object_pronoun} {hobby}.", tone: 'conversational', type: 'professional' },

  // Creative
  { template: "{name} is a {title} and storyteller at heart. With a unique perspective shaped by {experience} years in {industry}, {pronoun} creates work that {creative_outcome}. Inspired by {inspiration}, {name}'s mission is to {mission}.", tone: 'friendly', type: 'creative' },
  { template: "Creative soul. {title}. Dream builder. {name} has spent {experience} years bringing ideas to life in {industry}. {possessive_cap} work has {achievement}. Currently exploring {focus}.", tone: 'conversational', type: 'creative' },

  // Executive
  { template: "{name} is a {title} and strategic leader with {experience}+ years of experience driving growth in {industry}. Under {possessive} leadership, organizations have {achievement}. {pronoun_cap} holds a {degree} and serves on {boards}.", tone: 'formal', type: 'executive' },
  { template: "Visionary {title} {name} has spent {experience} years transforming {industry} companies. A proven leader who has {achievement}, {pronoun} combines strategic thinking with hands-on execution. {name} is passionate about {passion}.", tone: 'authoritative', type: 'executive' },

  // Entrepreneur
  { template: "Founder & {title} of {company}, {name} is on a mission to {mission}. After {experience} years in {industry}, {pronoun} launched {company} to {company_purpose}. {possessive_cap} work has {achievement}.", tone: 'confident', type: 'entrepreneur' },
  { template: "{name} started {company} because {pronoun} saw a better way to {solution}. As {title}, {pronoun}'s built a team of {team_size}+ and {achievement}. Previously worked at {previous_company}.", tone: 'conversational', type: 'entrepreneur' },

  // Freelancer
  { template: "{name} is a freelance {title} helping {client_type} {client_benefit}. With {experience} years of experience in {industry}, {pronoun}'s worked with clients like {notable_clients}. Available for {services}.", tone: 'friendly', type: 'freelancer' },
  { template: "Independent {title} {name} partners with {client_type} to deliver {deliverable}. {experience}+ years. {project_count}+ projects. {pronoun_cap}'s all about {value_prop}. Let's create something amazing together.", tone: 'conversational', type: 'freelancer' },

  // Academic
  { template: "Dr. {name} is a {title} at {institution}, specializing in {specialty}. {possessive_cap} research focuses on {research_focus}, with publications in {publications}. {pronoun_cap} holds a {degree} from {school}.", tone: 'formal', type: 'academic' },
  { template: "Professor {name} has dedicated {experience} years to advancing knowledge in {specialty}. As {title} at {institution}, {pronoun} mentors the next generation while pursuing groundbreaking research in {research_focus}.", tone: 'authoritative', type: 'academic' },
];

const lengthDescriptions: Record<Length, string> = {
  short: '2-3 sentences',
  medium: '4-5 sentences',
  long: '6-8 sentences',
};

interface AIBioGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const AIBioGeneratorTool: React.FC<AIBioGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedBio, setGeneratedBio] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    industry: '',
    experience: '',
    specialty: '',
    achievement: '',
    passion: '',
    company: '',
    degree: '',
  });

  const [bioType, setBioType] = useState<BioType>('professional');
  const [tone, setTone] = useState<Tone>('formal');
  const [length, setLength] = useState<Length>('medium');
  const [pronouns, setPronouns] = useState<'he' | 'she' | 'they'>('they');

  const getPronounSet = (p: 'he' | 'she' | 'they') => {
    switch (p) {
      case 'he': return { pronoun: 'he', pronoun_cap: 'He', possessive: 'his', possessive_cap: 'His', object_pronoun: 'him' };
      case 'she': return { pronoun: 'she', pronoun_cap: 'She', possessive: 'her', possessive_cap: 'Her', object_pronoun: 'her' };
      case 'they': return { pronoun: 'they', pronoun_cap: 'They', possessive: 'their', possessive_cap: 'Their', object_pronoun: 'them' };
    }
  };

  const generateBio = () => {
    const templates = bioTemplates.filter(t => t.type === bioType && t.tone === tone);
    const template = templates.length > 0
      ? templates[Math.floor(Math.random() * templates.length)]
      : bioTemplates.find(t => t.type === bioType) || bioTemplates[0];

    let bio = template.template;
    const pronounSet = getPronounSet(pronouns);

    // Replace all placeholders
    bio = bio.replace(/{name}/g, formData.name || 'Alex Johnson');
    bio = bio.replace(/{title}/g, formData.title || 'Senior Professional');
    bio = bio.replace(/{industry}/g, formData.industry || 'technology');
    bio = bio.replace(/{experience}/g, formData.experience || '10');
    bio = bio.replace(/{specialty}/g, formData.specialty || 'strategic planning');
    bio = bio.replace(/{achievement}/g, formData.achievement || 'achieve remarkable results');
    bio = bio.replace(/{passion}/g, formData.passion || 'innovation and growth');
    bio = bio.replace(/{company}/g, formData.company || 'Acme Corp');
    bio = bio.replace(/{degree}/g, formData.degree || "Master's degree in Business");
    bio = bio.replace(/{pronoun}/g, pronounSet.pronoun);
    bio = bio.replace(/{pronoun_cap}/g, pronounSet.pronoun_cap);
    bio = bio.replace(/{possessive}/g, pronounSet.possessive);
    bio = bio.replace(/{possessive_cap}/g, pronounSet.possessive_cap);
    bio = bio.replace(/{object_pronoun}/g, pronounSet.object_pronoun);

    // Additional placeholder replacements with sensible defaults
    bio = bio.replace(/{strength}/g, 'driving results and building high-performing teams');
    bio = bio.replace(/{focus}/g, 'emerging trends and innovation');
    bio = bio.replace(/{work_activity}/g, 'working');
    bio = bio.replace(/{hobby}/g, 'exploring new ideas');
    bio = bio.replace(/{creative_outcome}/g, 'resonates and inspires');
    bio = bio.replace(/{inspiration}/g, 'diverse experiences');
    bio = bio.replace(/{mission}/g, 'make a meaningful impact');
    bio = bio.replace(/{boards}/g, 'multiple advisory boards');
    bio = bio.replace(/{company_purpose}/g, 'solve real problems');
    bio = bio.replace(/{solution}/g, 'approach challenges');
    bio = bio.replace(/{team_size}/g, '20');
    bio = bio.replace(/{previous_company}/g, 'Fortune 500 companies');
    bio = bio.replace(/{client_type}/g, 'businesses and entrepreneurs');
    bio = bio.replace(/{client_benefit}/g, 'achieve their goals');
    bio = bio.replace(/{notable_clients}/g, 'industry leaders');
    bio = bio.replace(/{services}/g, 'consulting and projects');
    bio = bio.replace(/{deliverable}/g, 'exceptional results');
    bio = bio.replace(/{project_count}/g, '100');
    bio = bio.replace(/{value_prop}/g, 'quality and collaboration');
    bio = bio.replace(/{institution}/g, 'a leading university');
    bio = bio.replace(/{research_focus}/g, 'cutting-edge developments');
    bio = bio.replace(/{publications}/g, 'top journals');
    bio = bio.replace(/{school}/g, 'a prestigious institution');

    // Adjust length
    const sentences = bio.split(/(?<=[.!?])\s+/);
    let targetSentences = 4;
    if (length === 'short') targetSentences = 2;
    else if (length === 'long') targetSentences = Math.min(sentences.length, 7);

    const finalBio = sentences.slice(0, targetSentences).join(' ');
    setGeneratedBio(finalBio);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedBio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.name) setFormData(prev => ({ ...prev, name: params.name }));
      if (params.title) setFormData(prev => ({ ...prev, title: params.title }));
      if (params.industry) setFormData(prev => ({ ...prev, industry: params.industry }));
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  const bioTypes: { value: BioType; label: string }[] = [
    { value: 'professional', label: 'Professional' },
    { value: 'creative', label: 'Creative' },
    { value: 'executive', label: 'Executive' },
    { value: 'entrepreneur', label: 'Entrepreneur' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'academic', label: 'Academic' },
  ];

  const tones: { value: Tone; label: string }[] = [
    { value: 'formal', label: 'Formal' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'confident', label: 'Confident' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'authoritative', label: 'Authoritative' },
  ];

  const lengths: { value: Length; label: string }[] = [
    { value: 'short', label: 'Short' },
    { value: 'medium', label: 'Medium' },
    { value: 'long', label: 'Long' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <User className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aIBioGenerator.aiBioGenerator', 'AI Bio Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aIBioGenerator.createProfessionalBiosForAny', 'Create professional bios for any platform')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.aIBioGenerator.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Bio Type & Tone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIBioGenerator.bioType', 'Bio Type')}</label>
            <select
              value={bioType}
              onChange={(e) => setBioType(e.target.value as BioType)}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            >
              {bioTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIBioGenerator.tone', 'Tone')}</label>
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

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIBioGenerator.length', 'Length')}</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value as Length)}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            >
              {lengths.map((l) => (
                <option key={l.value} value={l.value}>{l.label} ({lengthDescriptions[l.value]})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aIBioGenerator.fullName', 'Full Name *')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('tools.aIBioGenerator.eGSarahJohnson', 'e.g., Sarah Johnson')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aIBioGenerator.jobTitle', 'Job Title *')}</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('tools.aIBioGenerator.eGMarketingDirector', 'e.g., Marketing Director')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aIBioGenerator.industry', 'Industry')}</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder={t('tools.aIBioGenerator.eGHealthcareTechnology', 'e.g., Healthcare, Technology')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aIBioGenerator.yearsOfExperience', 'Years of Experience')}</label>
            <input
              type="text"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="e.g., 10"
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aIBioGenerator.specialtySkills', 'Specialty/Skills')}</label>
            <input
              type="text"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              placeholder={t('tools.aIBioGenerator.eGDigitalMarketingBrand', 'e.g., Digital Marketing, Brand Strategy')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aIBioGenerator.keyAchievement', 'Key Achievement')}</label>
            <input
              type="text"
              value={formData.achievement}
              onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
              placeholder={t('tools.aIBioGenerator.eGIncreasedRevenueBy', 'e.g., increased revenue by 200%')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>
        </div>

        {/* Pronouns */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIBioGenerator.pronouns', 'Pronouns')}</label>
          <div className="flex gap-3">
            {(['he', 'she', 'they'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPronouns(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pronouns === p
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {p === 'he' ? 'He/Him' : p === 'she' ? t('tools.aIBioGenerator.sheHer', 'She/Her') : t('tools.aIBioGenerator.theyThem', 'They/Them')}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateBio}
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20"
        >
          <Sparkles className="w-5 h-5" />
          {t('tools.aIBioGenerator.generateBio', 'Generate Bio')}
        </button>

        {/* Generated Bio */}
        {generatedBio && (
          <div className={`p-5 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
            <div className="flex justify-between items-start mb-3">
              <span className={`text-sm font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                {t('tools.aIBioGenerator.generatedBio', 'Generated Bio')}
              </span>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {generatedBio.length} characters
              </span>
            </div>
            <p className={`text-base leading-relaxed ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {generatedBio}
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCopy}
                className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.aIBioGenerator.copied', 'Copied!') : t('tools.aIBioGenerator.copyBio', 'Copy Bio')}
              </button>
              <button
                onClick={generateBio}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {t('tools.aIBioGenerator.regenerate', 'Regenerate')}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedBio && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIBioGenerator.fillInYourDetailsAnd', 'Fill in your details and generate a professional bio')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIBioGeneratorTool;
