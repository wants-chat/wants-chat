import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import CheckIcon from '@mui/icons-material/Check';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SEO } from '../components/SEO';
import { PAGE_SEO } from '../config/seo';
import {
  PRICING_PLANS,
  PRICING_CONFIG,
  getMonthlyPrice,
} from '../config/pricing';

// Feature translation key mapping for each plan
const PLAN_FEATURE_KEYS: Record<string, string[]> = {
  free: [
    'pricing.planFeatures.aiMessagesPerDay',
    'pricing.planFeatures.geminiFlashOnly',
    'pricing.planFeatures.toolsWithPins',
    'pricing.planFeatures.imageGenerationsPerMonth',
    'pricing.planFeatures.appProjects',
    'pricing.planFeatures.communitySupport',
  ],
  pro: [
    'pricing.planFeatures.aiMessagesPerMonth',
    'pricing.planFeatures.allAiModels',
    'pricing.planFeatures.unlimitedToolUses',
    'pricing.planFeatures.imageGenerationsPerMonth',
    'pricing.planFeatures.videoGenerationsPerMonth',
    'pricing.planFeatures.allExportFormats',
  ],
  team: [
    'pricing.planFeatures.unlimitedAiMessages',
    'pricing.planFeatures.unlimitedImageGeneration',
    'pricing.planFeatures.videoGenerationsPerMonth',
    'pricing.planFeatures.noCodeAppBuilder',
    'pricing.planFeatures.teamMembersIncluded',
    'pricing.planFeatures.apiAccess',
  ],
  enterprise: [
    'pricing.planFeatures.everythingUnlimited',
    'pricing.planFeatures.unlimitedTeamMembers',
    'pricing.planFeatures.customAiModelTraining',
    'pricing.planFeatures.ssoSaml',
    'pricing.planFeatures.dedicatedAccountManager',
    'pricing.planFeatures.slaGuarantee',
  ],
};

// Feature parameters for interpolation
const FEATURE_PARAMS: Record<string, Record<string, Record<string, number | string>>> = {
  free: {
    'pricing.planFeatures.aiMessagesPerDay': { count: 3 },
    'pricing.planFeatures.toolsWithPins': { count: 100, pins: 3 },
    'pricing.planFeatures.imageGenerationsPerMonth': { count: 3 },
    'pricing.planFeatures.appProjects': { count: 1 },
  },
  pro: {
    'pricing.planFeatures.aiMessagesPerMonth': { count: '2,500' },
    'pricing.planFeatures.imageGenerationsPerMonth': { count: 100 },
    'pricing.planFeatures.videoGenerationsPerMonth': { count: 10 },
  },
  team: {
    'pricing.planFeatures.videoGenerationsPerMonth': { count: 100 },
    'pricing.planFeatures.teamMembersIncluded': { count: 5 },
  },
  enterprise: {
    'pricing.planFeatures.slaGuarantee': { percent: 99.9 },
  },
};

// FAQ data structure with translation keys
interface FAQItemTranslated {
  questionKey: string;
  answerKey: string;
  category: string;
}

const FAQ_ITEMS_TRANSLATED: FAQItemTranslated[] = [
  // General
  { questionKey: 'pricing.faq.general.whatIsWants.question', answerKey: 'pricing.faq.general.whatIsWants.answer', category: 'general' },
  { questionKey: 'pricing.faq.general.howDiffers.question', answerKey: 'pricing.faq.general.howDiffers.answer', category: 'general' },
  { questionKey: 'pricing.faq.general.toolCategories.question', answerKey: 'pricing.faq.general.toolCategories.answer', category: 'general' },
  { questionKey: 'pricing.faq.general.multipleDevices.question', answerKey: 'pricing.faq.general.multipleDevices.answer', category: 'general' },
  // Pricing
  { questionKey: 'pricing.faq.pricing.freeIncludes.question', answerKey: 'pricing.faq.pricing.freeIncludes.answer', category: 'pricing' },
  { questionKey: 'pricing.faq.pricing.aiModelsAccess.question', answerKey: 'pricing.faq.pricing.aiModelsAccess.answer', category: 'pricing' },
  { questionKey: 'pricing.faq.pricing.subscriptionIncludes.question', answerKey: 'pricing.faq.pricing.subscriptionIncludes.answer', category: 'pricing' },
  { questionKey: 'pricing.faq.pricing.annualDiscount.question', answerKey: 'pricing.faq.pricing.annualDiscount.answer', category: 'pricing' },
  { questionKey: 'pricing.faq.pricing.refunds.question', answerKey: 'pricing.faq.pricing.refunds.answer', category: 'pricing' },
  { questionKey: 'pricing.faq.pricing.freeTrial.question', answerKey: 'pricing.faq.pricing.freeTrial.answer', category: 'pricing' },
  // Features
  { questionKey: 'pricing.faq.features.toolsAvailable.question', answerKey: 'pricing.faq.features.toolsAvailable.answer', category: 'features' },
  { questionKey: 'pricing.faq.features.aiMessageLimits.question', answerKey: 'pricing.faq.features.aiMessageLimits.answer', category: 'features' },
  { questionKey: 'pricing.faq.features.appBuilder.question', answerKey: 'pricing.faq.features.appBuilder.answer', category: 'features' },
  { questionKey: 'pricing.faq.features.integrations.question', answerKey: 'pricing.faq.features.integrations.answer', category: 'features' },
  { questionKey: 'pricing.faq.features.apiAccess.question', answerKey: 'pricing.faq.features.apiAccess.answer', category: 'features' },
  { questionKey: 'pricing.faq.features.imageVideoGeneration.question', answerKey: 'pricing.faq.features.imageVideoGeneration.answer', category: 'features' },
  // Technical
  { questionKey: 'pricing.faq.technical.dataSecurity.question', answerKey: 'pricing.faq.technical.dataSecurity.answer', category: 'technical' },
  { questionKey: 'pricing.faq.technical.exportData.question', answerKey: 'pricing.faq.technical.exportData.answer', category: 'technical' },
  { questionKey: 'pricing.faq.technical.browserSupport.question', answerKey: 'pricing.faq.technical.browserSupport.answer', category: 'technical' },
  { questionKey: 'pricing.faq.technical.apiRateLimit.question', answerKey: 'pricing.faq.technical.apiRateLimit.answer', category: 'technical' },
  { questionKey: 'pricing.faq.technical.offlineWork.question', answerKey: 'pricing.faq.technical.offlineWork.answer', category: 'technical' },
  // Account
  { questionKey: 'pricing.faq.account.shareAccount.question', answerKey: 'pricing.faq.account.shareAccount.answer', category: 'account' },
  { questionKey: 'pricing.faq.account.dataAfterCancel.question', answerKey: 'pricing.faq.account.dataAfterCancel.answer', category: 'account' },
  { questionKey: 'pricing.faq.account.changePlan.question', answerKey: 'pricing.faq.account.changePlan.answer', category: 'account' },
  { questionKey: 'pricing.faq.account.getSupport.question', answerKey: 'pricing.faq.account.getSupport.answer', category: 'account' },
  { questionKey: 'pricing.faq.account.commercialUse.question', answerKey: 'pricing.faq.account.commercialUse.answer', category: 'account' },
];

const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  // Use centralized pricing config
  const plans = PRICING_PLANS;
  const yearlyDiscount = PRICING_CONFIG.yearlyDiscount;

  // FAQ categories with translation keys
  const faqCategories = useMemo(() => [
    { id: 'all', labelKey: 'pricing.faqCategories.all' },
    { id: 'general', labelKey: 'pricing.faqCategories.general' },
    { id: 'pricing', labelKey: 'pricing.faqCategories.pricing' },
    { id: 'features', labelKey: 'pricing.faqCategories.features' },
    { id: 'technical', labelKey: 'pricing.faqCategories.technical' },
    { id: 'account', labelKey: 'pricing.faqCategories.account' },
  ], []);

  const filteredFAQs = useMemo(() => {
    if (selectedCategory === 'all') return FAQ_ITEMS_TRANSLATED;
    return FAQ_ITEMS_TRANSLATED.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  const categories = useMemo(() => faqCategories.map(cat => ({
    ...cat,
    label: t(cat.labelKey),
    count: cat.id === 'all' ? FAQ_ITEMS_TRANSLATED.length : FAQ_ITEMS_TRANSLATED.filter(i => i.category === cat.id).length
  })), [faqCategories, t]);

  const handleGetStarted = (planId: string) => {
    if (isAuthenticated) {
      // Navigate to dashboard or payment page
      navigate('/fitness/dashboard');
    } else {
      // Navigate to signup with plan selection
      navigate('/signup', { state: { selectedPlan: planId } });
    }
  };

  // Get translated feature text
  const getFeatureText = (planId: string, featureKey: string): string => {
    const params = FEATURE_PARAMS[planId]?.[featureKey] || {};
    return t(featureKey, params);
  };

  return (
    <>
      <SEO
        title={PAGE_SEO.pricing.title}
        description={PAGE_SEO.pricing.description}
        url={PAGE_SEO.pricing.url}
      />
      <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"
        animate={{
          x: [0, 80, 0],
          y: [0, 60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]"
        animate={{
          x: [0, -60, 0],
          y: [0, -80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Pricing Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="py-20 lg:py-32 relative z-10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            variants={containerVariants}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-6"
            >
              <LocalOfferIcon className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-400">{t('common.pricing').toUpperCase()}</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white"
            >
              {t('pricing.title')}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-400 mb-8"
            >
              {t('pricing.subtitle')}
            </motion.p>

            {/* Billing Toggle */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-4 p-1.5 bg-gray-800/50 rounded-full border border-gray-700"
            >
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('pricing.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('pricing.yearly')}
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  {t('pricing.save')} {yearlyDiscount}%
                </span>
              </button>
            </motion.div>

            {billingCycle === 'yearly' && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 text-sm mt-4"
              >
                {t('pricing.twoMonthsFree')}
              </motion.p>
            )}
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          >
            {plans.map((plan) => {
              const isYearly = billingCycle === 'yearly';
              // Show monthly price (calculated from yearly if yearly is selected)
              const displayPrice = getMonthlyPrice(plan, isYearly);
              const featureKeys = PLAN_FEATURE_KEYS[plan.id] || [];

              return (
                <motion.div
                  key={plan.id}
                  variants={cardVariants}
                  className={`relative bg-gray-900/50 rounded-2xl border ${
                    plan.highlighted
                      ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                      : 'border-gray-800'
                  } p-6 flex flex-col`}
                >
                  {/* Popular Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-semibold rounded-full">
                        {t('pricing.mostPopular').toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Free Forever Badge */}
                  {plan.price.monthly === 0 && (
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs font-medium rounded-full">
                        {t('pricing.freeForever')}
                      </span>
                    </div>
                  )}

                  {/* Plan Name */}
                  <h3 className="text-xl font-bold mb-2 text-white">
                    {t(`pricing.plans.${plan.id}.name`)}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {t(`pricing.plans.${plan.id}.description`)}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold text-white">
                        ${displayPrice}
                      </span>
                      <span className="text-gray-500 mb-1">{t('pricing.perMonth')}</span>
                    </div>
                    {isYearly && plan.price.monthly > 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="line-through">${plan.price.monthly * 12}</span>
                        <span className="text-green-400 ml-2">${plan.price.yearly}{t('pricing.perYear')}</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-grow">
                    {featureKeys.map((featureKey, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">
                          {getFeatureText(plan.id, featureKey)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleGetStarted(plan.id)}
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {plan.id === 'free' ? t('pricing.getStarted') : plan.id === 'enterprise' ? t('pricing.contactSales') : t('pricing.upgrade')}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Bottom Features */}
          <div className="mt-20 text-center">
            <p className="text-lg font-semibold mb-8 text-white">{t('pricing.allPlansInclude')}</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: CheckIcon, textKey: 'pricing.freeTrial' },
                { icon: CheckIcon, textKey: 'pricing.noCreditCard' },
                { icon: CheckIcon, textKey: 'pricing.cancelAnytime' },
                { icon: CheckIcon, textKey: 'pricing.freeMigration' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 justify-center">
                  <item.icon className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-white/70">{t(item.textKey)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="py-20 lg:py-32 relative z-10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* FAQ Header */}
            <motion.div
              variants={itemVariants}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                {t('pricing.faqTitle')}
              </h2>
              <p className="text-lg text-white/70">
                {t('pricing.faqSubtitle')}
              </p>
            </motion.div>

            {/* Category Filter */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-2 justify-center mb-8"
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {category.label}
                  <span className="ml-2 text-xs opacity-75">({category.count})</span>
                </button>
              ))}
            </motion.div>

            {/* FAQ Items */}
            <motion.div
              variants={containerVariants}
              className="space-y-4"
            >
              {filteredFAQs.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="border border-gray-800 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
                  >
                    <span className="font-medium text-white pr-8">
                      {t(item.questionKey)}
                    </span>
                    <ExpandMoreIcon
                      className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${
                        openFAQ === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 py-4 bg-gray-800/30">
                      <p className="text-gray-400 leading-relaxed">
                        {t(item.answerKey)}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Contact Support */}
            <div className="mt-12 text-center">
              <p className="text-gray-500 mb-4">
                {t('pricing.needCustomPlan')} <a href="/contact" className="text-emerald-400 hover:underline">{t('pricing.contactUsFor')}</a> {t('pricing.forEnterprisePricing')}
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
    </>
  );
};

export default PricingPage;
