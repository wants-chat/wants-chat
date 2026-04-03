import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, HelpCircle, Sparkles, CreditCard, Settings, Wrench, Plug2 } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  faqs: FAQ[];
}

const getCategories = (t: any): Category[] => [
  {
    id: 'general',
    name: t('landing.faq.categories.general'),
    icon: HelpCircle,
    faqs: [
      {
        question: t('landing.faq.general.q1'),
        answer: t('landing.faq.general.a1'),
      },
      {
        question: t('landing.faq.general.q2'),
        answer: t('landing.faq.general.a2'),
      },
      {
        question: t('landing.faq.general.q3'),
        answer: t('landing.faq.general.a3'),
      },
      {
        question: t('landing.faq.general.q4'),
        answer: t('landing.faq.general.a4'),
      },
      {
        question: t('landing.faq.general.q5'),
        answer: t('landing.faq.general.a5'),
      },
    ],
  },
  {
    id: 'features',
    name: t('landing.faq.categories.features'),
    icon: Sparkles,
    faqs: [
      {
        question: t('landing.faq.features.q1'),
        answer: t('landing.faq.features.a1'),
      },
      {
        question: t('landing.faq.features.q2'),
        answer: t('landing.faq.features.a2'),
      },
      {
        question: t('landing.faq.features.q3'),
        answer: t('landing.faq.features.a3'),
      },
      {
        question: t('landing.faq.features.q4'),
        answer: t('landing.faq.features.a4'),
      },
      {
        question: t('landing.faq.features.q5'),
        answer: t('landing.faq.features.a5'),
      },
    ],
  },
  {
    id: 'pricing',
    name: t('landing.faq.categories.pricing'),
    icon: CreditCard,
    faqs: [
      {
        question: t('landing.faq.pricing.q1'),
        answer: t('landing.faq.pricing.a1'),
      },
      {
        question: t('landing.faq.pricing.q2'),
        answer: t('landing.faq.pricing.a2'),
      },
      {
        question: t('landing.faq.pricing.q3'),
        answer: t('landing.faq.pricing.a3'),
      },
      {
        question: t('landing.faq.pricing.q4'),
        answer: t('landing.faq.pricing.a4'),
      },
    ],
  },
  {
    id: 'tools',
    name: t('landing.faq.categories.tools'),
    icon: Wrench,
    faqs: [
      {
        question: t('landing.faq.tools.q1'),
        answer: t('landing.faq.tools.a1'),
      },
      {
        question: t('landing.faq.tools.q2'),
        answer: t('landing.faq.tools.a2'),
      },
      {
        question: t('landing.faq.tools.q3'),
        answer: t('landing.faq.tools.a3'),
      },
      {
        question: t('landing.faq.tools.q4'),
        answer: t('landing.faq.tools.a4'),
      },
    ],
  },
  {
    id: 'technical',
    name: t('landing.faq.categories.technical'),
    icon: Settings,
    faqs: [
      {
        question: t('landing.faq.technical.q1'),
        answer: t('landing.faq.technical.a1'),
      },
      {
        question: t('landing.faq.technical.q2'),
        answer: t('landing.faq.technical.a2'),
      },
      {
        question: t('landing.faq.technical.q3'),
        answer: t('landing.faq.technical.a3'),
      },
      {
        question: t('landing.faq.technical.q4'),
        answer: t('landing.faq.technical.a4'),
      },
    ],
  },
  {
    id: 'integrations',
    name: t('landing.faq.categories.integrations'),
    icon: Plug2,
    faqs: [
      {
        question: t('landing.faq.integrations.q1'),
        answer: t('landing.faq.integrations.a1'),
      },
      {
        question: t('landing.faq.integrations.q2'),
        answer: t('landing.faq.integrations.a2'),
      },
      {
        question: t('landing.faq.integrations.q3'),
        answer: t('landing.faq.integrations.a3'),
      },
      {
        question: t('landing.faq.integrations.q4'),
        answer: t('landing.faq.integrations.a4'),
      },
    ],
  },
];

const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const categories = getCategories(t);

  const currentCategory = categories.find((cat) => cat.id === selectedCategory) || categories[0];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-950 relative overflow-hidden">
      {/* Background - matching login page */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 12, repeat: Infinity }}
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
            {t('landing.faq.badge')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('landing.faq.title')}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> {t('landing.faq.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('landing.faq.subtitle')}
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Category Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setOpenIndex(0);
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-500/50 text-white'
                      : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:bg-gray-800/50 hover:border-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{category.name}</span>
                </button>
              );
            })}
          </motion.div>

          {/* FAQ List */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {currentCategory.faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden hover:border-emerald-500/30 transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-gray-800/50"
                  >
                    <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-6 h-6 text-emerald-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-gray-800/50 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Contact Support CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
              <span className="text-white">{t('landing.faq.stillHaveQuestions')}</span>
              <a
                href="/support"
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors underline"
              >
                {t('landing.faq.contactSupport')}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
