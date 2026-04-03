import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';
import {
  Sparkles, Zap, Bug, Wrench, ArrowUp, Clock,
  CheckCircle, Star, Rocket, Shield, Globe, Code
} from 'lucide-react';

// Changelog entries
const changelogEntries = [
  {
    version: '2.5.0',
    date: 'January 2, 2026',
    tag: 'Latest',
    tagColor: 'bg-emerald-500',
    changes: [
      { type: 'feature', icon: Sparkles, text: 'Introduced AI-powered workflow automation with 500+ app integrations' },
      { type: 'feature', icon: Sparkles, text: 'New dark mode improvements across all pages' },
      { type: 'improvement', icon: Zap, text: 'Performance boost: 40% faster page load times' },
      { type: 'fix', icon: Bug, text: 'Fixed chatbot input text contrast in dark theme' },
      { type: 'fix', icon: Bug, text: 'Resolved API errors in landing page sections' },
    ]
  },
  {
    version: '2.4.0',
    date: 'December 20, 2025',
    tag: null,
    tagColor: null,
    changes: [
      { type: 'feature', icon: Sparkles, text: 'Added comprehensive SEO improvements site-wide' },
      { type: 'feature', icon: Sparkles, text: 'Fluxez AI chatbot integration with training docs' },
      { type: 'improvement', icon: Zap, text: 'Enhanced mobile responsiveness for all tools' },
      { type: 'improvement', icon: Zap, text: 'Improved error handling and user feedback' },
    ]
  },
  {
    version: '2.3.0',
    date: 'December 10, 2025',
    tag: null,
    tagColor: null,
    changes: [
      { type: 'feature', icon: Sparkles, text: 'Launched Insurance Quote Tool with backend sync' },
      { type: 'feature', icon: Sparkles, text: 'Added pricing alignment across frontend and backend' },
      { type: 'improvement', icon: Zap, text: 'Support FAQ contrast improvements' },
      { type: 'fix', icon: Bug, text: 'Multiple UI/UX bug fixes based on user feedback' },
    ]
  },
  {
    version: '2.2.0',
    date: 'November 25, 2025',
    tag: null,
    tagColor: null,
    changes: [
      { type: 'feature', icon: Sparkles, text: 'Introduced 30+ AI models including GPT-4o, Claude Opus 4.5, Gemini 2.5' },
      { type: 'feature', icon: Sparkles, text: 'Added image and video generation capabilities' },
      { type: 'improvement', icon: Zap, text: 'Enhanced multi-model chat experience' },
      { type: 'security', icon: Shield, text: 'Upgraded security protocols and encryption' },
    ]
  },
  {
    version: '2.1.0',
    date: 'November 10, 2025',
    tag: null,
    tagColor: null,
    changes: [
      { type: 'feature', icon: Sparkles, text: 'No-code app builder with React frontend generation' },
      { type: 'feature', icon: Sparkles, text: 'API backend auto-generation from natural language' },
      { type: 'improvement', icon: Zap, text: 'Faster deployment pipeline (minutes, not hours)' },
      { type: 'fix', icon: Bug, text: 'Fixed template rendering issues' },
    ]
  },
  {
    version: '2.0.0',
    date: 'October 15, 2025',
    tag: 'Major Release',
    tagColor: 'bg-purple-500',
    changes: [
      { type: 'feature', icon: Rocket, text: 'Complete platform redesign with new UI/UX' },
      { type: 'feature', icon: Sparkles, text: '1000+ tools available through intent-driven interface' },
      { type: 'feature', icon: Globe, text: 'Multi-language support for 50+ languages' },
      { type: 'improvement', icon: Zap, text: 'New architecture for 10x better performance' },
      { type: 'security', icon: Shield, text: 'SOC 2 Type II compliance achieved' },
    ]
  },
  {
    version: '1.5.0',
    date: 'September 1, 2025',
    tag: null,
    tagColor: null,
    changes: [
      { type: 'feature', icon: Sparkles, text: 'Added health and fitness tracking modules' },
      { type: 'feature', icon: Sparkles, text: 'New expense tracker with budget management' },
      { type: 'improvement', icon: Zap, text: 'Improved data synchronization across devices' },
    ]
  },
  {
    version: '1.0.0',
    date: 'July 1, 2025',
    tag: 'Initial Release',
    tagColor: 'bg-cyan-500',
    changes: [
      { type: 'feature', icon: Rocket, text: 'Official launch of Wants platform' },
      { type: 'feature', icon: Sparkles, text: 'Core AI chat functionality' },
      { type: 'feature', icon: Sparkles, text: 'Basic tool suite with 100+ calculators and converters' },
      { type: 'feature', icon: Sparkles, text: 'User authentication and profile management' },
    ]
  },
];

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'feature':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'improvement':
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'fix':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'security':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    default:
      return 'bg-white/10 text-white/70 border-white/20';
  }
};

const ChangelogPage: React.FC = () => {
  const { t } = useTranslation();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return t('changelog.labels.new');
      case 'improvement':
        return t('changelog.labels.improved');
      case 'fix':
        return t('changelog.labels.fixed');
      case 'security':
        return t('changelog.labels.security');
      default:
        return t('changelog.labels.update');
    }
  };

  return (
    <>
      <SEO
        title={t('changelog.seo.title')}
        description={t('changelog.seo.description')}
        keywords="changelog, updates, version history, release notes, new features, improvements"
      />

      <div className="min-h-screen bg-gray-950 text-white">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]"
            animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]"
            animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        {/* Hero Section */}
        <section className="relative pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white/80">{t('changelog.hero.badge')}</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  {t('changelog.hero.title')}
                </span>
              </h1>

              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                {t('changelog.hero.subtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Timeline */}
        <section className="relative py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-cyan-500/30 to-transparent transform md:-translate-x-1/2" />

              {/* Entries */}
              <div className="space-y-12">
                {changelogEntries.map((entry, index) => (
                  <motion.div
                    key={entry.version}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-8 md:pl-0"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transform -translate-x-1/2 mt-2 ring-4 ring-gray-950" />

                    {/* Content card */}
                    <div className={`md:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'md:ml-auto md:pl-8' : 'md:mr-auto md:pr-8'}`}>
                      <div className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-emerald-500/30 transition-all">
                        {/* Header */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="text-2xl font-bold text-white">v{entry.version}</span>
                          {entry.tag && (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${entry.tagColor}`}>
                              {entry.tag}
                            </span>
                          )}
                          <span className="text-sm text-white/50 ml-auto">{entry.date}</span>
                        </div>

                        {/* Changes */}
                        <ul className="space-y-3">
                          {entry.changes.map((change, changeIndex) => (
                            <li key={changeIndex} className="flex items-start gap-3">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getTypeStyles(change.type)}`}>
                                {getTypeLabel(change.type)}
                              </span>
                              <span className="text-white/70 text-sm flex-1">{change.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Subscribe Section */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-center"
            >
              <Star className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">{t('changelog.subscribe.title')}</h2>
              <p className="text-white/70 mb-6">
                {t('changelog.subscribe.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder={t('changelog.subscribe.emailPlaceholder')}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all whitespace-nowrap">
                  {t('changelog.subscribe.button')}
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ChangelogPage;
