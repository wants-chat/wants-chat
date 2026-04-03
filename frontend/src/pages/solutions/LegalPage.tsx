import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SEO } from '../../components/SEO';
import {
  ArrowRight,
  Check,
  Scale,
  FileText,
  Clock,
  Users,
  Shield,
  Search,
  Calendar,
  Briefcase,
} from 'lucide-react';

const featureIcons = [FileText, Clock, Calendar, Users, Search, Shield];
const featureKeys = [
  'documentManagement',
  'timeBilling',
  'caseCalendar',
  'clientPortal',
  'legalResearch',
  'secureCompliant',
];

const benefitKeys = [
  'reduceDocumentSearch',
  'automateBilling',
  'neverMissDeadline',
  'secureClientComm',
  'integrateTools',
  'mobileAccess',
];

const LegalPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t('solutions.legalPage.seoTitle')}
        description={t('solutions.legalPage.seoDescription')}
        keywords={t('solutions.legalPage.seoKeywords')}
      />
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-transparent to-teal-900/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-400">{t('solutions.legalPage.badge')}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  {t('solutions.legalPage.heroTitle')}
                </span>
                <br />
                {t('solutions.legalPage.heroTitleLine2')}
              </h1>

              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                {t('solutions.legalPage.heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-shadow"
                >
                  {t('solutions.legalPage.getStartedFree')}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/contact')}
                  className="px-8 py-4 bg-gray-800 border border-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-700 transition-colors"
                >
                  {t('solutions.legalPage.scheduleDemo')}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('solutions.legalPage.featuresTitle')}{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  {t('solutions.legalPage.featuresTitleHighlight')}
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                {t('solutions.legalPage.featuresSubtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featureKeys.map((key, index) => {
                const Icon = featureIcons[index];
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-cyan-500/30 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {t(`solutions.legalPage.features.${key}.title`)}
                    </h3>
                    <p className="text-gray-400">
                      {t(`solutions.legalPage.features.${key}.description`)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {t('solutions.legalPage.benefitsTitle')}{' '}
                  <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                    {t('solutions.legalPage.benefitsTitleHighlight')}
                  </span>
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  {t('solutions.legalPage.benefitsSubtitle')}
                </p>

                <div className="space-y-4">
                  {benefitKeys.map((key, index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-gray-300">{t(`solutions.legalPage.benefits.${key}`)}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-3xl blur-2xl" />
                <div className="relative p-8 rounded-3xl bg-gray-800/50 border border-gray-700/50">
                  <div className="flex items-center gap-4 mb-6">
                    <Briefcase className="w-10 h-10 text-cyan-400" />
                    <div>
                      <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                        {t('solutions.legalPage.stats.fasterRetrieval.value')}
                      </p>
                      <p className="text-gray-400">{t('solutions.legalPage.stats.fasterRetrieval.label')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-gray-900/50">
                      <p className="text-2xl font-bold text-white">{t('solutions.legalPage.stats.lawFirms.value')}</p>
                      <p className="text-sm text-gray-400">{t('solutions.legalPage.stats.lawFirms.label')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-900/50">
                      <p className="text-2xl font-bold text-white">{t('solutions.legalPage.stats.documentsManaged.value')}</p>
                      <p className="text-sm text-gray-400">{t('solutions.legalPage.stats.documentsManaged.label')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-900/50">
                      <p className="text-2xl font-bold text-white">{t('solutions.legalPage.stats.uptime.value')}</p>
                      <p className="text-sm text-gray-400">{t('solutions.legalPage.stats.uptime.label')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-900/50">
                      <p className="text-2xl font-bold text-white">{t('solutions.legalPage.stats.soc2.value')}</p>
                      <p className="text-sm text-gray-400">{t('solutions.legalPage.stats.soc2.label')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-cyan-900/20 via-gray-900 to-teal-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('solutions.legalPage.ctaTitle')}
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                {t('solutions.legalPage.ctaSubtitle')}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl font-semibold text-lg inline-flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-shadow"
              >
                {t('solutions.legalPage.ctaButton')}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <p className="text-gray-500 text-sm mt-4">
                {t('solutions.legalPage.ctaNote')}
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default LegalPage;
