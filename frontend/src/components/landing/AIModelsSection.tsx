import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Zap,
  Code2,
  Pencil,
  Search,
  MessageSquare,
  Image,
  Brain,
  Gauge,
  Shield,
  BookOpen,
  Calculator,
} from 'lucide-react';

interface AIModel {
  name: string;
  provider: string;
  bestFor: string;
  bestForIcon: React.ElementType;
  gradient: string;
  providerColor: string;
}

const aiModels: AIModel[] = [
  // OpenAI
  {
    name: 'GPT-4o',
    provider: 'OpenAI',
    bestFor: 'All-rounder',
    bestForIcon: Sparkles,
    gradient: 'from-emerald-500 to-teal-500',
    providerColor: 'text-emerald-400',
  },
  {
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    bestFor: 'Complex tasks',
    bestForIcon: Brain,
    gradient: 'from-emerald-500 to-green-500',
    providerColor: 'text-emerald-400',
  },
  {
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    bestFor: 'Fast & cheap',
    bestForIcon: Zap,
    gradient: 'from-teal-500 to-cyan-500',
    providerColor: 'text-emerald-400',
  },
  {
    name: 'o1',
    provider: 'OpenAI',
    bestFor: 'Reasoning',
    bestForIcon: Calculator,
    gradient: 'from-emerald-600 to-teal-600',
    providerColor: 'text-emerald-400',
  },
  {
    name: 'o1-mini',
    provider: 'OpenAI',
    bestFor: 'Quick reasoning',
    bestForIcon: Gauge,
    gradient: 'from-green-500 to-emerald-500',
    providerColor: 'text-emerald-400',
  },

  // Anthropic
  {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    bestFor: 'Coding',
    bestForIcon: Code2,
    gradient: 'from-orange-500 to-amber-500',
    providerColor: 'text-orange-400',
  },
  {
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    bestFor: 'Analysis',
    bestForIcon: Search,
    gradient: 'from-amber-500 to-yellow-500',
    providerColor: 'text-orange-400',
  },
  {
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    bestFor: 'Speed',
    bestForIcon: Zap,
    gradient: 'from-yellow-500 to-orange-500',
    providerColor: 'text-orange-400',
  },
  {
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    bestFor: 'Balanced',
    bestForIcon: Gauge,
    gradient: 'from-orange-400 to-red-500',
    providerColor: 'text-orange-400',
  },

  // Google
  {
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    bestFor: 'Multimodal',
    bestForIcon: Image,
    gradient: 'from-blue-500 to-indigo-500',
    providerColor: 'text-blue-400',
  },
  {
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    bestFor: 'Long context',
    bestForIcon: BookOpen,
    gradient: 'from-indigo-500 to-purple-500',
    providerColor: 'text-blue-400',
  },
  {
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    bestFor: 'Fast responses',
    bestForIcon: Zap,
    gradient: 'from-purple-500 to-blue-500',
    providerColor: 'text-blue-400',
  },

  // Meta
  {
    name: 'Llama 3.1 405B',
    provider: 'Meta',
    bestFor: 'Open source',
    bestForIcon: Shield,
    gradient: 'from-blue-600 to-blue-800',
    providerColor: 'text-blue-500',
  },
  {
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    bestFor: 'Balanced',
    bestForIcon: Gauge,
    gradient: 'from-blue-500 to-indigo-600',
    providerColor: 'text-blue-500',
  },
  {
    name: 'Llama 3.2 Vision',
    provider: 'Meta',
    bestFor: 'Vision',
    bestForIcon: Image,
    gradient: 'from-indigo-500 to-blue-600',
    providerColor: 'text-blue-500',
  },

  // Mistral
  {
    name: 'Mistral Large',
    provider: 'Mistral',
    bestFor: 'Multilingual',
    bestForIcon: MessageSquare,
    gradient: 'from-rose-500 to-pink-500',
    providerColor: 'text-rose-400',
  },
  {
    name: 'Mixtral 8x22B',
    provider: 'Mistral',
    bestFor: 'MoE efficiency',
    bestForIcon: Brain,
    gradient: 'from-pink-500 to-rose-500',
    providerColor: 'text-rose-400',
  },
  {
    name: 'Codestral',
    provider: 'Mistral',
    bestFor: 'Code gen',
    bestForIcon: Code2,
    gradient: 'from-rose-400 to-orange-500',
    providerColor: 'text-rose-400',
  },

  // Cohere
  {
    name: 'Command R+',
    provider: 'Cohere',
    bestFor: 'RAG',
    bestForIcon: Search,
    gradient: 'from-violet-500 to-purple-500',
    providerColor: 'text-violet-400',
  },
  {
    name: 'Command R',
    provider: 'Cohere',
    bestFor: 'Enterprise',
    bestForIcon: Shield,
    gradient: 'from-purple-500 to-violet-500',
    providerColor: 'text-violet-400',
  },

  // Others
  {
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    bestFor: 'Research',
    bestForIcon: BookOpen,
    gradient: 'from-cyan-500 to-blue-500',
    providerColor: 'text-cyan-400',
  },
  {
    name: 'Qwen 2.5',
    provider: 'Alibaba',
    bestFor: 'Chinese/English',
    bestForIcon: MessageSquare,
    gradient: 'from-orange-600 to-red-500',
    providerColor: 'text-orange-500',
  },
  {
    name: 'Grok 2',
    provider: 'xAI',
    bestFor: 'Real-time',
    bestForIcon: Zap,
    gradient: 'from-gray-600 to-gray-800',
    providerColor: 'text-gray-400',
  },
  {
    name: 'DALL-E 3',
    provider: 'OpenAI',
    bestFor: 'Image gen',
    bestForIcon: Image,
    gradient: 'from-pink-500 to-rose-500',
    providerColor: 'text-emerald-400',
  },
  {
    name: 'Stable Diffusion 3',
    provider: 'Stability',
    bestFor: 'Creative',
    bestForIcon: Pencil,
    gradient: 'from-purple-600 to-pink-600',
    providerColor: 'text-purple-400',
  },
  {
    name: 'Whisper',
    provider: 'OpenAI',
    bestFor: 'Transcription',
    bestForIcon: MessageSquare,
    gradient: 'from-teal-600 to-emerald-600',
    providerColor: 'text-emerald-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

const AIModelsSection: React.FC = () => {
  const { t } = useTranslation();
  const providers = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral', 'Cohere', t('landing.aiModels.others')];

  return (
    <section className="py-20 bg-gray-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <motion.div
        className="absolute top-[-200px] right-[-200px] w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -60, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 11,
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
            {t('landing.aiModels.badge')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('landing.aiModels.title')}{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t('landing.aiModels.titleHighlight')}
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('landing.aiModels.subtitle')}
          </p>
        </motion.div>

        {/* Provider Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {providers.map((provider) => (
            <span
              key={provider}
              className="px-4 py-2 rounded-full bg-gray-900/50 border border-gray-800 text-gray-400 text-sm font-medium hover:border-emerald-500/50 hover:text-emerald-400 transition-colors cursor-default"
            >
              {provider}
            </span>
          ))}
        </motion.div>

        {/* Models Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {aiModels.map((model) => (
            <motion.div
              key={model.name}
              variants={itemVariants}
              className="group"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-5 border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 h-full relative overflow-hidden">
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Model Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${model.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <Brain className="w-6 h-6 text-white" />
                  </div>

                  {/* Model Name */}
                  <h3 className="text-lg font-bold text-white mb-1 truncate">
                    {model.name}
                  </h3>

                  {/* Provider */}
                  <p className={`text-sm ${model.providerColor} mb-3`}>
                    {model.provider}
                  </p>

                  {/* Best For Tag */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 w-fit">
                    <model.bestForIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs text-gray-300 font-medium">
                      {model.bestFor}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              <h3 className="text-2xl font-bold text-white">
                {t('landing.aiModels.autoSelect')}
              </h3>
            </div>
            <p className="text-gray-400 mb-6">
              {t('landing.aiModels.autoSelectDesc')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Code2 className="w-4 h-4 text-orange-400" />
                <span>{t('landing.aiModels.codingModel')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>{t('landing.aiModels.quickTaskModel')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Image className="w-4 h-4 text-pink-400" />
                <span>{t('landing.aiModels.imagesModel')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIModelsSection;
