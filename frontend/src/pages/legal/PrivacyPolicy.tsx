import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';
import UpdateIcon from '@mui/icons-material/Update';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import GavelIcon from '@mui/icons-material/Gavel';

const PrivacyPolicy: React.FC = () => {
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
        ease: "easeOut" as any
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

  const personalInfoItems = [
    { key: 'accountInfo', label: t('legal.privacyPolicy.informationCollection.personalInfo.accountInfo.label'), desc: t('legal.privacyPolicy.informationCollection.personalInfo.accountInfo.desc') },
    { key: 'healthFitness', label: t('legal.privacyPolicy.informationCollection.personalInfo.healthFitness.label'), desc: t('legal.privacyPolicy.informationCollection.personalInfo.healthFitness.desc') },
    { key: 'nutritionInfo', label: t('legal.privacyPolicy.informationCollection.personalInfo.nutritionInfo.label'), desc: t('legal.privacyPolicy.informationCollection.personalInfo.nutritionInfo.desc') },
    { key: 'financialData', label: t('legal.privacyPolicy.informationCollection.personalInfo.financialData.label'), desc: t('legal.privacyPolicy.informationCollection.personalInfo.financialData.desc') },
    { key: 'travelPreferences', label: t('legal.privacyPolicy.informationCollection.personalInfo.travelPreferences.label'), desc: t('legal.privacyPolicy.informationCollection.personalInfo.travelPreferences.desc') },
    { key: 'meditationData', label: t('legal.privacyPolicy.informationCollection.personalInfo.meditationData.label'), desc: t('legal.privacyPolicy.informationCollection.personalInfo.meditationData.desc') }
  ];

  const autoCollectedItems = [
    { key: 'deviceInfo', label: t('legal.privacyPolicy.informationCollection.autoCollected.deviceInfo.label'), desc: t('legal.privacyPolicy.informationCollection.autoCollected.deviceInfo.desc') },
    { key: 'usageData', label: t('legal.privacyPolicy.informationCollection.autoCollected.usageData.label'), desc: t('legal.privacyPolicy.informationCollection.autoCollected.usageData.desc') },
    { key: 'locationData', label: t('legal.privacyPolicy.informationCollection.autoCollected.locationData.label'), desc: t('legal.privacyPolicy.informationCollection.autoCollected.locationData.desc') },
    { key: 'cookies', label: t('legal.privacyPolicy.informationCollection.autoCollected.cookies.label'), desc: t('legal.privacyPolicy.informationCollection.autoCollected.cookies.desc') }
  ];

  const dataUsageItems = [
    { key: 'serviceDelivery', title: t('legal.privacyPolicy.dataUsage.serviceDelivery.title'), desc: t('legal.privacyPolicy.dataUsage.serviceDelivery.desc') },
    { key: 'personalization', title: t('legal.privacyPolicy.dataUsage.personalization.title'), desc: t('legal.privacyPolicy.dataUsage.personalization.desc') },
    { key: 'aiFeatures', title: t('legal.privacyPolicy.dataUsage.aiFeatures.title'), desc: t('legal.privacyPolicy.dataUsage.aiFeatures.desc') },
    { key: 'communication', title: t('legal.privacyPolicy.dataUsage.communication.title'), desc: t('legal.privacyPolicy.dataUsage.communication.desc') },
    { key: 'analytics', title: t('legal.privacyPolicy.dataUsage.analytics.title'), desc: t('legal.privacyPolicy.dataUsage.analytics.desc') },
    { key: 'security', title: t('legal.privacyPolicy.dataUsage.security.title'), desc: t('legal.privacyPolicy.dataUsage.security.desc') },
    { key: 'legalCompliance', title: t('legal.privacyPolicy.dataUsage.legalCompliance.title'), desc: t('legal.privacyPolicy.dataUsage.legalCompliance.desc') },
    { key: 'marketing', title: t('legal.privacyPolicy.dataUsage.marketing.title'), desc: t('legal.privacyPolicy.dataUsage.marketing.desc') }
  ];

  const securityItems = [
    { key: 'encryption', title: t('legal.privacyPolicy.dataSecurity.encryption.title'), desc: t('legal.privacyPolicy.dataSecurity.encryption.desc') },
    { key: 'accessControls', title: t('legal.privacyPolicy.dataSecurity.accessControls.title'), desc: t('legal.privacyPolicy.dataSecurity.accessControls.desc') },
    { key: 'infrastructure', title: t('legal.privacyPolicy.dataSecurity.infrastructure.title'), desc: t('legal.privacyPolicy.dataSecurity.infrastructure.desc') },
    { key: 'audits', title: t('legal.privacyPolicy.dataSecurity.audits.title'), desc: t('legal.privacyPolicy.dataSecurity.audits.desc') },
    { key: 'training', title: t('legal.privacyPolicy.dataSecurity.training.title'), desc: t('legal.privacyPolicy.dataSecurity.training.desc') },
    { key: 'incidentResponse', title: t('legal.privacyPolicy.dataSecurity.incidentResponse.title'), desc: t('legal.privacyPolicy.dataSecurity.incidentResponse.desc') }
  ];

  const rightsItems = [
    { key: 'access', right: t('legal.privacyPolicy.yourRights.access.right'), desc: t('legal.privacyPolicy.yourRights.access.desc') },
    { key: 'correction', right: t('legal.privacyPolicy.yourRights.correction.right'), desc: t('legal.privacyPolicy.yourRights.correction.desc') },
    { key: 'deletion', right: t('legal.privacyPolicy.yourRights.deletion.right'), desc: t('legal.privacyPolicy.yourRights.deletion.desc') },
    { key: 'portability', right: t('legal.privacyPolicy.yourRights.portability.right'), desc: t('legal.privacyPolicy.yourRights.portability.desc') },
    { key: 'optOut', right: t('legal.privacyPolicy.yourRights.optOut.right'), desc: t('legal.privacyPolicy.yourRights.optOut.desc') },
    { key: 'restrict', right: t('legal.privacyPolicy.yourRights.restrict.right'), desc: t('legal.privacyPolicy.yourRights.restrict.desc') },
    { key: 'withdraw', right: t('legal.privacyPolicy.yourRights.withdraw.right'), desc: t('legal.privacyPolicy.yourRights.withdraw.desc') }
  ];

  const sections = [
    {
      id: 'introduction',
      title: t('legal.privacyPolicy.introduction.title'),
      icon: PrivacyTipIcon,
      content: (
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            {t('legal.privacyPolicy.introduction.paragraph1')}
          </p>
          <p className="text-white/70 leading-relaxed">
            {t('legal.privacyPolicy.introduction.paragraph2')}
          </p>
        </div>
      )
    },
    {
      id: 'information-collection',
      title: t('legal.privacyPolicy.informationCollection.title'),
      icon: SecurityIcon,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('legal.privacyPolicy.informationCollection.personalInfo.title')}</h3>
            <div className="grid gap-3">
              {personalInfoItems.map((item, index) => (
                <div key={index} className="flex gap-3 p-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-white">{item.label}:</span>
                    <span className="text-white/60 ml-1">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('legal.privacyPolicy.informationCollection.autoCollected.title')}</h3>
            <div className="grid gap-3">
              {autoCollectedItems.map((item, index) => (
                <div key={index} className="flex gap-3 p-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-white">{item.label}:</span>
                    <span className="text-white/60 ml-1">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'data-usage',
      title: t('legal.privacyPolicy.dataUsage.title'),
      icon: VerifiedUserIcon,
      content: (
        <div className="grid gap-3">
          {dataUsageItems.map((item, index) => (
            <div key={index} className="flex gap-3 p-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium text-white">{item.title}</div>
                <div className="text-sm text-white/60">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'data-security',
      title: t('legal.privacyPolicy.dataSecurity.title'),
      icon: LockIcon,
      content: (
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            {t('legal.privacyPolicy.dataSecurity.intro')}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {securityItems.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800">
                <div className="font-medium text-white mb-1">{item.title}</div>
                <div className="text-sm text-white/60">{item.desc}</div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500/30">
            <p className="text-amber-300 text-sm">
              <strong>Important:</strong> {t('legal.privacyPolicy.dataSecurity.warning')}
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'your-rights',
      title: t('legal.privacyPolicy.yourRights.title'),
      icon: GavelIcon,
      content: (
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            {t('legal.privacyPolicy.yourRights.intro')}
          </p>
          <div className="grid gap-3">
            {rightsItems.map((item, index) => (
              <div key={index} className="flex gap-3 p-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <div>
                  <span className="font-medium text-white">{item.right}:</span>
                  <span className="text-white/60 ml-1">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
            <p className="text-emerald-300 text-sm">
              {t('legal.privacyPolicy.yourRights.exerciseRights').replace('<strong>', '').replace('</strong>', '')}
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
                <SecurityIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">{t('legal.privacyAndSecurity')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
              {t('legal.privacyPolicy.title')}
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

            {/* Additional Sections - Simplified */}
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <Card className="p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-white">{t('legal.privacyPolicy.additionalInfo.title')}</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">{t('legal.privacyPolicy.additionalInfo.healthData.title')}</h3>
                    <div className="space-y-2 text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.privacyPolicy.additionalInfo.healthData.hipaaCompliant')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.privacyPolicy.additionalInfo.healthData.neverShared')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.privacyPolicy.additionalInfo.healthData.additionalEncryption')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">{t('legal.privacyPolicy.additionalInfo.dataRetention.title')}</h3>
                    <div className="space-y-2 text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.privacyPolicy.additionalInfo.dataRetention.activeAccounts')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.privacyPolicy.additionalInfo.dataRetention.afterDeletion')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.privacyPolicy.additionalInfo.dataRetention.backups')}</span>
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
                  <h2 className="text-2xl font-bold text-white">{t('legal.contactUs')}</h2>
                </div>
                <p className="text-white/70 mb-6 leading-relaxed">
                  {t('legal.privacyPolicy.contact.intro')}
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
                        <div className="font-medium text-white mb-1">{t('legal.address')}:</div>
                        <div className="text-sm text-white/60">
                          Nissho II 1F Room 1-B<br />
                          6-5-5 Nagatsuta, Midori-ku<br />
                          Yokohama, Kanagawa, Japan<br />
                          +81-045-508-9779
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
              <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10" onClick={() => navigate('/terms')}>
                {t('legal.viewTermsOfService')}
              </Button>
              <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10" onClick={() => navigate('/cookies')}>
                {t('legal.viewCookiePolicy')}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
