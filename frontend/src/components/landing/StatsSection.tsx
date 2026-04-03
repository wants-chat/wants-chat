import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Wrench,
  Brain,
  MessageSquare,
  Shield,
  Zap,
  Globe,
  Clock
} from 'lucide-react';

const getStats = (t: any) => [
  {
    icon: Sparkles,
    value: '30+',
    label: t('landing.stats.aiModels'),
    description: t('landing.stats.aiModelsDesc'),
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Wrench,
    value: '1,100+',
    label: t('landing.stats.smartTools'),
    description: t('landing.stats.smartToolsDesc'),
    color: 'from-emerald-500 to-cyan-500',
  },
  {
    icon: Brain,
    value: '100+',
    label: t('landing.stats.integrations'),
    description: t('landing.stats.integrationsDesc'),
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: MessageSquare,
    value: '50+',
    label: t('landing.stats.industries'),
    description: t('landing.stats.industriesDesc'),
    color: 'from-blue-500 to-indigo-500',
  },
];

const getFeatures = (t: any) => [
  { icon: Shield, text: t('landing.stats.privacyFirst') },
  { icon: Zap, text: t('landing.stats.instantResponses') },
  { icon: Globe, text: t('landing.stats.worksEverywhere') },
  { icon: Clock, text: t('landing.stats.alwaysAvailable') },
];

const StatsSection: React.FC = () => {
  const { t } = useTranslation();
  const stats = getStats(t);
  const features = getFeatures(t);

  return (
    <section className="py-20 bg-gray-950 relative overflow-hidden">
      {/* Background Effects - matching login page */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-4">
            {t('landing.stats.badge')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('landing.stats.title')}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> {t('landing.stats.titleHighlight')} </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('landing.stats.subtitle')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 hover:bg-gray-800/50">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-lg font-medium text-white/90">{stat.label}</div>
                <div className="text-sm text-gray-400">{stat.description}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-gray-900/50 border border-gray-800 hover:border-emerald-500/50 transition-colors"
            >
              <feature.icon className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
