import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Clock,
  Sparkles,
  Layers,
  Image,
  Shield
} from 'lucide-react';

const getFeatures = (t: any) => [
  {
    icon: Settings,
    title: t('landing.featuresGrid.onboardingData'),
    description: t('landing.featuresGrid.onboardingDataDesc'),
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Clock,
    title: t('landing.featuresGrid.toolHistory'),
    description: t('landing.featuresGrid.toolHistoryDesc'),
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Sparkles,
    title: t('landing.featuresGrid.chatIntelligence'),
    description: t('landing.featuresGrid.chatIntelligenceDesc'),
    gradient: 'from-emerald-500 to-cyan-500',
  },
  {
    icon: Layers,
    title: t('landing.featuresGrid.contextAwareness'),
    description: t('landing.featuresGrid.contextAwarenessDesc'),
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Image,
    title: t('landing.featuresGrid.multiModal'),
    description: t('landing.featuresGrid.multiModalDesc'),
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    icon: Shield,
    title: t('landing.featuresGrid.privacyFirst'),
    description: t('landing.featuresGrid.privacyFirstDesc'),
    gradient: 'from-teal-500 to-cyan-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const FeaturesGrid: React.FC = () => {
  const { t } = useTranslation();
  const features = getFeatures(t);

  return (
    <section className="py-20 bg-gray-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <motion.div
        className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-[-200px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
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
            {t('landing.featuresGrid.badge')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('landing.featuresGrid.title')}{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t('landing.featuresGrid.titleHighlight')}
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('landing.featuresGrid.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 h-full">
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom accent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm">
            {t('landing.featuresGrid.bottomNote')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
