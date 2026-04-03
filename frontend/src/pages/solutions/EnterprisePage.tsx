import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SEO } from '../../components/SEO';
import {
  ArrowRight,
  Check,
  Building2,
  Shield,
  Users,
  Zap,
  Lock,
  Globe,
  Headphones,
  Settings,
} from 'lucide-react';

const featureIcons = [Shield, Users, Settings, Lock, Globe, Headphones];
const featureKeys = [
  'enterpriseSecurity',
  'unlimitedUsers',
  'customIntegrations',
  'dataGovernance',
  'globalInfrastructure',
  'dedicatedSupport',
];

const benefitKeys = [
  'unlimitedUsersStorage',
  'customBranding',
  'advancedSecurity',
  'dedicatedInfrastructure',
  'customContract',
  'priorityFeatures',
];

const certificationKeys = ['soc2', 'gdpr', 'hipaa', 'iso27001', 'ccpa'];

const EnterprisePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t('solutions.enterprisePage.seoTitle')}
        description={t('solutions.enterprisePage.seoDescription')}
        keywords={t('solutions.enterprisePage.seoKeywords')}
      />
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-cyan-900/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">{t('solutions.enterprisePage.badge')}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  {t('solutions.enterprisePage.heroTitle')}
                </span>
                <br />
                {t('solutions.enterprisePage.heroTitleLine2')}
              </h1>

              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                {t('solutions.enterprisePage.heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/contact')}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/25 transition-shadow"
                >
                  {t('solutions.enterprisePage.contactSales')}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 bg-gray-800 border border-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-700 transition-colors"
                >
                  {t('solutions.enterprisePage.startFreeTrial')}
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
                {t('solutions.enterprisePage.featuresTitle')}{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {t('solutions.enterprisePage.featuresTitleHighlight')}
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                {t('solutions.enterprisePage.featuresSubtitle')}
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
                    className="p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-emerald-500/30 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {t(`solutions.enterprisePage.features.${key}.title`)}
                    </h3>
                    <p className="text-gray-400">
                      {t(`solutions.enterprisePage.features.${key}.description`)}
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
                  {t('solutions.enterprisePage.benefitsTitle')}{' '}
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    {t('solutions.enterprisePage.benefitsTitleHighlight')}
                  </span>
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  {t('solutions.enterprisePage.benefitsSubtitle')}
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
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-gray-300">{t(`solutions.enterprisePage.benefits.${key}`)}</span>
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
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
                <div className="relative p-8 rounded-3xl bg-gray-800/50 border border-gray-700/50">
                  <div className="flex items-center gap-4 mb-6">
                    <Zap className="w-10 h-10 text-emerald-400" />
                    <div>
                      <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        {t('solutions.enterprisePage.stats.uptimeSla.value')}
                      </p>
                      <p className="text-gray-400">{t('solutions.enterprisePage.stats.uptimeSla.label')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-gray-900/50">
                      <p className="text-2xl font-bold text-white">{t('solutions.enterprisePage.stats.enterpriseClients.value')}</p>
                      <p className="text-sm text-gray-400">{t('solutions.enterprisePage.stats.enterpriseClients.label')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-900/50">
                      <p className="text-2xl font-bold text-white">{t('solutions.enterprisePage.stats.enterpriseUsers.value')}</p>
                      <p className="text-sm text-gray-400">{t('solutions.enterprisePage.stats.enterpriseUsers.label')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-900/50">
                      <p className="text-2xl font-bold text-white">{t('solutions.enterprisePage.stats.countries.value')}</p>
                      <p className="text-sm text-gray-400">{t('solutions.enterprisePage.stats.countries.label')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-900/50">
                      <p className="text-2xl font-bold text-white">{t('solutions.enterprisePage.stats.prioritySupport.value')}</p>
                      <p className="text-sm text-gray-400">{t('solutions.enterprisePage.stats.prioritySupport.label')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Security Badges Section */}
        <section className="py-16 bg-gray-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h3 className="text-xl font-semibold text-gray-400 mb-8">
                {t('solutions.enterprisePage.certificationsTitle')}
              </h3>
              <div className="flex flex-wrap justify-center gap-8">
                {certificationKeys.map((cert) => (
                  <div
                    key={cert}
                    className="px-6 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50"
                  >
                    <span className="font-semibold text-gray-300">
                      {t(`solutions.enterprisePage.certifications.${cert}`)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-emerald-900/20 via-gray-900 to-cyan-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('solutions.enterprisePage.ctaTitle')}
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                {t('solutions.enterprisePage.ctaSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/contact')}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-lg inline-flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/25 transition-shadow"
                >
                  {t('solutions.enterprisePage.ctaContactSales')}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 bg-gray-800 border border-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-700 transition-colors"
                >
                  {t('solutions.enterprisePage.ctaTryFree')}
                </motion.button>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                {t('solutions.enterprisePage.ctaNote')}
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default EnterprisePage;
