import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, Check, X } from 'lucide-react';

// Tools/brands that Wants can replace
const toolCategories = [
  {
    category: 'AI Chat',
    tools: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini'],
  },
  {
    category: 'Design',
    tools: ['Canva', 'Figma', 'Adobe Express'],
  },
  {
    category: 'Productivity',
    tools: ['Notion', 'Airtable', 'Coda'],
  },
  {
    category: 'Automation',
    tools: ['Zapier', 'Make', 'n8n'],
  },
  {
    category: 'Finance',
    tools: ['QuickBooks', 'Mint', 'YNAB'],
  },
  {
    category: 'Writing',
    tools: ['Grammarly', 'Jasper', 'Copy.ai'],
  },
  {
    category: 'Research',
    tools: ['Wolfram Alpha', 'Elicit', 'Consensus'],
  },
  {
    category: 'Scheduling',
    tools: ['Calendly', 'Cal.com', 'Doodle'],
  },
];

// Flatten all tools for the scrolling animation
const allTools = toolCategories.flatMap((cat) => cat.tools);
const duplicatedTools = [...allTools, ...allTools]; // Duplicate for seamless loop

const BrandsReplaced: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-gray-950 relative overflow-hidden">
      {/* Background Effects */}
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
          className="text-center mb-12"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {t('landing.brandsReplaced.badge')}
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('landing.brandsReplaced.title')}{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t('landing.brandsReplaced.titleHighlight')}
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('landing.brandsReplaced.subtitle')}
          </p>
        </motion.div>

        {/* Scrolling Tools - Row 1 (Left to Right) */}
        <div className="relative mb-4 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-950 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-950 to-transparent z-10" />

          <motion.div
            className="flex gap-4"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              x: {
                duration: 30,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
          >
            {duplicatedTools.map((tool, index) => (
              <motion.div
                key={`row1-${index}`}
                className="flex-shrink-0"
              >
                <div className="relative group">
                  <div className="px-6 py-3 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800 flex items-center gap-3 transition-all duration-300 hover:border-red-500/50 hover:bg-gray-800/50">
                    <span className="text-gray-400 font-medium whitespace-nowrap group-hover:line-through group-hover:text-gray-600 transition-all">
                      {tool}
                    </span>
                    <X className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scrolling Tools - Row 2 (Right to Left) */}
        <div className="relative mb-12 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-950 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-950 to-transparent z-10" />

          <motion.div
            className="flex gap-4"
            animate={{ x: ['-50%', '0%'] }}
            transition={{
              x: {
                duration: 25,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
          >
            {[...duplicatedTools].reverse().map((tool, index) => (
              <motion.div
                key={`row2-${index}`}
                className="flex-shrink-0"
              >
                <div className="relative group">
                  <div className="px-6 py-3 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800 flex items-center gap-3 transition-all duration-300 hover:border-red-500/50 hover:bg-gray-800/50">
                    <span className="text-gray-400 font-medium whitespace-nowrap group-hover:line-through group-hover:text-gray-600 transition-all">
                      {tool}
                    </span>
                    <X className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Category Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {toolCategories.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-5 border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-semibold">{category.category}</h3>
              </div>
              <div className="space-y-1">
                {category.tools.map((tool) => (
                  <div
                    key={tool}
                    className="text-sm text-gray-500 line-through decoration-gray-700 group-hover:text-gray-400 transition-colors"
                  >
                    {tool}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
            <span className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              20+
            </span>
            <div className="text-left">
              <div className="text-white font-semibold">{t('landing.brandsReplaced.toolsReplaced')}</div>
              <div className="text-sm text-gray-400">{t('landing.brandsReplaced.oneSubscription')}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BrandsReplaced;
