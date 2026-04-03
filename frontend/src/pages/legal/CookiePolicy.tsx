import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import CookieIcon from '@mui/icons-material/Cookie';
import UpdateIcon from '@mui/icons-material/Update';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SecurityIcon from '@mui/icons-material/Security';
import PersonalizeIcon from '@mui/icons-material/Tune';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import InfoIcon from '@mui/icons-material/Info';

const CookiePolicy: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const lastUpdated = 'December 25, 2024';
  const effectiveDate = 'January 1, 2025';

  const sectionVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as any
      }
    }
  } as any;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const essentialCookieItems = [
    { key: 'sessionManagement', name: t('legal.cookiePolicy.typesOfCookies.essential.sessionManagement.name'), desc: t('legal.cookiePolicy.typesOfCookies.essential.sessionManagement.desc') },
    { key: 'security', name: t('legal.cookiePolicy.typesOfCookies.essential.security.name'), desc: t('legal.cookiePolicy.typesOfCookies.essential.security.desc') },
    { key: 'loadBalancing', name: t('legal.cookiePolicy.typesOfCookies.essential.loadBalancing.name'), desc: t('legal.cookiePolicy.typesOfCookies.essential.loadBalancing.desc') },
    { key: 'featureFunctionality', name: t('legal.cookiePolicy.typesOfCookies.essential.featureFunctionality.name'), desc: t('legal.cookiePolicy.typesOfCookies.essential.featureFunctionality.desc') }
  ];

  const analyticsCookieItems = [
    { key: 'usageAnalytics', name: t('legal.cookiePolicy.typesOfCookies.analytics.usageAnalytics.name'), desc: t('legal.cookiePolicy.typesOfCookies.analytics.usageAnalytics.desc') },
    { key: 'performance', name: t('legal.cookiePolicy.typesOfCookies.analytics.performance.name'), desc: t('legal.cookiePolicy.typesOfCookies.analytics.performance.desc') },
    { key: 'featureUsage', name: t('legal.cookiePolicy.typesOfCookies.analytics.featureUsage.name'), desc: t('legal.cookiePolicy.typesOfCookies.analytics.featureUsage.desc') },
    { key: 'errorTracking', name: t('legal.cookiePolicy.typesOfCookies.analytics.errorTracking.name'), desc: t('legal.cookiePolicy.typesOfCookies.analytics.errorTracking.desc') }
  ];

  const cookieUsageItems = [
    { key: 'authentication', purpose: t('legal.cookiePolicy.howWeUseCookies.authentication.purpose'), desc: t('legal.cookiePolicy.howWeUseCookies.authentication.desc') },
    { key: 'personalization', purpose: t('legal.cookiePolicy.howWeUseCookies.personalization.purpose'), desc: t('legal.cookiePolicy.howWeUseCookies.personalization.desc') },
    { key: 'performance', purpose: t('legal.cookiePolicy.howWeUseCookies.performance.purpose'), desc: t('legal.cookiePolicy.howWeUseCookies.performance.desc') },
    { key: 'analytics', purpose: t('legal.cookiePolicy.howWeUseCookies.analytics.purpose'), desc: t('legal.cookiePolicy.howWeUseCookies.analytics.desc') },
    { key: 'security', purpose: t('legal.cookiePolicy.howWeUseCookies.security.purpose'), desc: t('legal.cookiePolicy.howWeUseCookies.security.desc') },
    { key: 'featureEnhancement', purpose: t('legal.cookiePolicy.howWeUseCookies.featureEnhancement.purpose'), desc: t('legal.cookiePolicy.howWeUseCookies.featureEnhancement.desc') }
  ];

  const thirdPartyCookieItems = [
    { key: 'googleAnalytics', service: t('legal.cookiePolicy.thirdPartyCookies.googleAnalytics.service'), purpose: t('legal.cookiePolicy.thirdPartyCookies.googleAnalytics.purpose') },
    { key: 'cdn', service: t('legal.cookiePolicy.thirdPartyCookies.cdn.service'), purpose: t('legal.cookiePolicy.thirdPartyCookies.cdn.purpose') },
    { key: 'payment', service: t('legal.cookiePolicy.thirdPartyCookies.payment.service'), purpose: t('legal.cookiePolicy.thirdPartyCookies.payment.purpose') },
    { key: 'support', service: t('legal.cookiePolicy.thirdPartyCookies.support.service'), purpose: t('legal.cookiePolicy.thirdPartyCookies.support.purpose') }
  ];

  const managingCookiesItems = [
    { key: 'browserSettings', option: t('legal.cookiePolicy.managingCookies.browserSettings.option'), desc: t('legal.cookiePolicy.managingCookies.browserSettings.desc') },
    { key: 'cookieBanner', option: t('legal.cookiePolicy.managingCookies.cookieBanner.option'), desc: t('legal.cookiePolicy.managingCookies.cookieBanner.desc') },
    { key: 'accountSettings', option: t('legal.cookiePolicy.managingCookies.accountSettings.option'), desc: t('legal.cookiePolicy.managingCookies.accountSettings.desc') },
    { key: 'optOutTools', option: t('legal.cookiePolicy.managingCookies.optOutTools.option'), desc: t('legal.cookiePolicy.managingCookies.optOutTools.desc') },
    { key: 'clearCookies', option: t('legal.cookiePolicy.managingCookies.clearCookies.option'), desc: t('legal.cookiePolicy.managingCookies.clearCookies.desc') }
  ];

  const sections = [
    {
      id: 'what-are-cookies',
      title: t('legal.cookiePolicy.whatAreCookies.title'),
      icon: InfoIcon,
      content: (
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            {t('legal.cookiePolicy.whatAreCookies.paragraph1')}
          </p>
          <p className="text-white/70 leading-relaxed">
            {t('legal.cookiePolicy.whatAreCookies.paragraph2')}
          </p>
        </div>
      )
    },
    {
      id: 'types-of-cookies',
      title: t('legal.cookiePolicy.typesOfCookies.title'),
      icon: SettingsIcon,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('legal.cookiePolicy.typesOfCookies.essential.title')}</h3>
            <div className="grid gap-3">
              {essentialCookieItems.map((item, index) => (
                <div key={index} className="flex gap-3 p-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-white">{item.name}:</span>
                    <span className="text-white/70 ml-1">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('legal.cookiePolicy.typesOfCookies.analytics.title')}</h3>
            <div className="grid gap-3">
              {analyticsCookieItems.map((item, index) => (
                <div key={index} className="flex gap-3 p-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-white">{item.name}:</span>
                    <span className="text-white/70 ml-1">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'cookie-purposes',
      title: t('legal.cookiePolicy.howWeUseCookies.title'),
      icon: PersonalizeIcon,
      content: (
        <div className="grid gap-3">
          {cookieUsageItems.map((item, index) => (
            <div key={index} className="flex gap-3 p-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium text-white">{item.purpose}</div>
                <div className="text-sm text-white/70">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'third-party-cookies',
      title: t('legal.cookiePolicy.thirdPartyCookies.title'),
      icon: SecurityIcon,
      content: (
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            {t('legal.cookiePolicy.thirdPartyCookies.intro')}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {thirdPartyCookieItems.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="font-medium text-white mb-1">{item.service}</div>
                <div className="text-sm text-white/70">{item.purpose}</div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500/30">
            <p className="text-amber-200 text-sm">
              <strong>Note:</strong> {t('legal.cookiePolicy.thirdPartyCookies.note')}
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'cookie-management',
      title: t('legal.cookiePolicy.managingCookies.title'),
      icon: AnalyticsIcon,
      content: (
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            {t('legal.cookiePolicy.managingCookies.intro')}
          </p>
          <div className="grid gap-3">
            {managingCookiesItems.map((item, index) => (
              <div key={index} className="flex gap-3 p-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <div>
                  <span className="font-medium text-white">{item.option}:</span>
                  <span className="text-white/70 ml-1">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
            <p className="text-emerald-300 text-sm">
              <strong>Important:</strong> {t('legal.cookiePolicy.managingCookies.important')}
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-200px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            variants={sectionVariants}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 mb-6">
              <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500">
                <CookieIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">{t('legal.cookieInformation')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
              {t('legal.cookiePolicy.title')}
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <UpdateIcon className="h-4 w-4" />
                <span>{t('legal.lastUpdated')}: {lastUpdated}</span>
              </div>
              <span className="hidden sm:block">-</span>
              <span>{t('legal.effective')}: {effectiveDate}</span>
            </div>
          </motion.div>

          {/* Cookie Banner Preview */}
          <motion.div
            className="mb-12"
            variants={sectionVariants}
          >
            <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800">
              <div className="flex items-start gap-4">
                <CookieIcon className="h-8 w-8 text-emerald-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 text-white">{t('legal.cookiePolicy.bannerTitle')}</h3>
                  <p className="text-sm text-white/70 mb-4">
                    {t('legal.cookiePolicy.bannerDescription')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button size="sm" className="w-fit bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">{t('legal.cookiePolicy.acceptAll')}</Button>
                    <Button size="sm" variant="ghost" className="w-fit border border-white/20 text-white hover:bg-white/10">{t('legal.cookiePolicy.managePreferences')}</Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Content Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                <Card className="p-8 hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow bg-gray-900/50 backdrop-blur-sm border border-gray-800">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                      <section.icon
                        className="h-6 w-6 text-emerald-400"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {section.title}
                    </h2>
                  </div>
                  {section.content}
                </Card>
              </motion.div>
            ))}

            {/* Additional Information */}
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <Card className="p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-white">{t('legal.cookiePolicy.additionalInfo.title')}</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">{t('legal.cookiePolicy.additionalInfo.cookieLifetime.title')}</h3>
                    <div className="space-y-2 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.cookiePolicy.additionalInfo.cookieLifetime.session')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.cookiePolicy.additionalInfo.cookieLifetime.persistent')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.cookiePolicy.additionalInfo.cookieLifetime.analytics')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">{t('legal.cookiePolicy.additionalInfo.yourRights.title')}</h3>
                    <div className="space-y-2 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.cookiePolicy.additionalInfo.yourRights.accept')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.cookiePolicy.additionalInfo.yourRights.withdraw')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.cookiePolicy.additionalInfo.yourRights.delete')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Contact Section */}
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <Card className="p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                    <ContactMailIcon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{t('legal.cookiePolicy.contact.title')}</h2>
                </div>
                <p className="text-white/70 mb-6 leading-relaxed">
                  {t('legal.cookiePolicy.contact.intro')}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div>
                        <span className="font-medium text-white">{t('legal.email')}:</span>
                        <span className="text-emerald-400 ml-2">support@wants.chat</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div>
                        <span className="font-medium text-white">{t('legal.support')}:</span>
                        <span className="text-emerald-400 ml-2">support@wants.chat</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2" />
                      <div>
                        <div className="font-medium text-white mb-1">{t('legal.cookiePolicy.contact.cookieSettings.title')}</div>
                        <div className="text-sm text-white/70">
                          {t('legal.cookiePolicy.contact.cookieSettings.desc')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10" onClick={() => navigate('/privacy')}>
                {t('legal.viewPrivacyPolicy')}
              </Button>
              <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10" onClick={() => navigate('/terms')}>
                {t('legal.viewTermsOfService')}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CookiePolicy;
