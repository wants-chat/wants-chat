import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import GavelIcon from '@mui/icons-material/Gavel';
import UpdateIcon from '@mui/icons-material/Update';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import PolicyIcon from '@mui/icons-material/Policy';
import PaymentIcon from '@mui/icons-material/Payment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ContactMailIcon from '@mui/icons-material/ContactMail';

const TermsOfService: React.FC = () => {
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

  const userAccountItems = [
    { key: 'accountSecurity', title: t('legal.termsOfService.userAccounts.accountSecurity.title'), desc: t('legal.termsOfService.userAccounts.accountSecurity.desc') },
    { key: 'accountActivity', title: t('legal.termsOfService.userAccounts.accountActivity.title'), desc: t('legal.termsOfService.userAccounts.accountActivity.desc') },
    { key: 'accurateInfo', title: t('legal.termsOfService.userAccounts.accurateInfo.title'), desc: t('legal.termsOfService.userAccounts.accurateInfo.desc') },
    { key: 'accountUpdates', title: t('legal.termsOfService.userAccounts.accountUpdates.title'), desc: t('legal.termsOfService.userAccounts.accountUpdates.desc') },
    { key: 'unauthorizedAccess', title: t('legal.termsOfService.userAccounts.unauthorizedAccess.title'), desc: t('legal.termsOfService.userAccounts.unauthorizedAccess.desc') }
  ];

  const acceptableUseItems = [
    { key: 'illegalActivities', activity: t('legal.termsOfService.acceptableUse.illegalActivities.activity'), desc: t('legal.termsOfService.acceptableUse.illegalActivities.desc') },
    { key: 'harmfulContent', activity: t('legal.termsOfService.acceptableUse.harmfulContent.activity'), desc: t('legal.termsOfService.acceptableUse.harmfulContent.desc') },
    { key: 'systemInterference', activity: t('legal.termsOfService.acceptableUse.systemInterference.activity'), desc: t('legal.termsOfService.acceptableUse.systemInterference.desc') },
    { key: 'unauthorizedAccess', activity: t('legal.termsOfService.acceptableUse.unauthorizedAccess.activity'), desc: t('legal.termsOfService.acceptableUse.unauthorizedAccess.desc') },
    { key: 'dataMining', activity: t('legal.termsOfService.acceptableUse.dataMining.activity'), desc: t('legal.termsOfService.acceptableUse.dataMining.desc') },
    { key: 'spam', activity: t('legal.termsOfService.acceptableUse.spam.activity'), desc: t('legal.termsOfService.acceptableUse.spam.desc') }
  ];

  const serviceAvailabilityItems = [
    { key: 'uptime', title: t('legal.termsOfService.serviceAvailability.uptime.title'), desc: t('legal.termsOfService.serviceAvailability.uptime.desc') },
    { key: 'maintenance', title: t('legal.termsOfService.serviceAvailability.maintenance.title'), desc: t('legal.termsOfService.serviceAvailability.maintenance.desc') },
    { key: 'emergencyUpdates', title: t('legal.termsOfService.serviceAvailability.emergencyUpdates.title'), desc: t('legal.termsOfService.serviceAvailability.emergencyUpdates.desc') },
    { key: 'modifications', title: t('legal.termsOfService.serviceAvailability.modifications.title'), desc: t('legal.termsOfService.serviceAvailability.modifications.desc') }
  ];

  const paymentTermsItems = [
    { key: 'authorization', term: t('legal.termsOfService.paymentTerms.authorization.term'), desc: t('legal.termsOfService.paymentTerms.authorization.desc') },
    { key: 'billingCycles', term: t('legal.termsOfService.paymentTerms.billingCycles.term'), desc: t('legal.termsOfService.paymentTerms.billingCycles.desc') },
    { key: 'priceChanges', term: t('legal.termsOfService.paymentTerms.priceChanges.term'), desc: t('legal.termsOfService.paymentTerms.priceChanges.desc') },
    { key: 'refunds', term: t('legal.termsOfService.paymentTerms.refunds.term'), desc: t('legal.termsOfService.paymentTerms.refunds.desc') },
    { key: 'cancellation', term: t('legal.termsOfService.paymentTerms.cancellation.term'), desc: t('legal.termsOfService.paymentTerms.cancellation.desc') },
    { key: 'continuation', term: t('legal.termsOfService.paymentTerms.continuation.term'), desc: t('legal.termsOfService.paymentTerms.continuation.desc') }
  ];

  const liabilityItems = [
    { key: 'serviceAvailability', limitation: t('legal.termsOfService.limitationLiability.serviceAvailability.limitation'), desc: t('legal.termsOfService.limitationLiability.serviceAvailability.desc') },
    { key: 'dataAccuracy', limitation: t('legal.termsOfService.limitationLiability.dataAccuracy.limitation'), desc: t('legal.termsOfService.limitationLiability.dataAccuracy.desc') },
    { key: 'thirdParty', limitation: t('legal.termsOfService.limitationLiability.thirdParty.limitation'), desc: t('legal.termsOfService.limitationLiability.thirdParty.desc') },
    { key: 'maxLiability', limitation: t('legal.termsOfService.limitationLiability.maxLiability.limitation'), desc: t('legal.termsOfService.limitationLiability.maxLiability.desc') },
    { key: 'consequential', limitation: t('legal.termsOfService.limitationLiability.consequential.limitation'), desc: t('legal.termsOfService.limitationLiability.consequential.desc') }
  ];

  const sections = [
    {
      id: 'agreement',
      title: t('legal.termsOfService.agreement.title'),
      icon: GavelIcon,
      content: (
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            {t('legal.termsOfService.agreement.paragraph1')}
          </p>
          <p className="text-white/70 leading-relaxed">
            {t('legal.termsOfService.agreement.paragraph2')}
          </p>
        </div>
      )
    },
    {
      id: 'user-accounts',
      title: t('legal.termsOfService.userAccounts.title'),
      icon: AccountBoxIcon,
      content: (
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            {t('legal.termsOfService.userAccounts.intro')}
          </p>
          <div className="grid gap-3">
            {userAccountItems.map((item, index) => (
              <div key={index} className="flex gap-3 p-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <div>
                  <span className="font-medium text-white">{item.title}:</span>
                  <span className="text-white/60 ml-1">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'acceptable-use',
      title: t('legal.termsOfService.acceptableUse.title'),
      icon: PolicyIcon,
      content: (
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            {t('legal.termsOfService.acceptableUse.intro')}
          </p>
          <div className="grid gap-3">
            {acceptableUseItems.map((item, index) => (
              <div key={index} className="flex gap-3 p-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <div>
                  <span className="font-medium text-white">{item.activity}:</span>
                  <span className="text-white/60 ml-1">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'service-availability',
      title: t('legal.termsOfService.serviceAvailability.title'),
      icon: SecurityIcon,
      content: (
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            {t('legal.termsOfService.serviceAvailability.intro')}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {serviceAvailabilityItems.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800">
                <div className="font-medium text-white mb-1">{item.title}</div>
                <div className="text-sm text-white/60">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'payment-terms',
      title: t('legal.termsOfService.paymentTerms.title'),
      icon: PaymentIcon,
      content: (
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            {t('legal.termsOfService.paymentTerms.intro')}
          </p>
          <div className="grid gap-3">
            {paymentTermsItems.map((item, index) => (
              <div key={index} className="flex gap-3 p-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <div>
                  <span className="font-medium text-white">{item.term}:</span>
                  <span className="text-white/60 ml-1">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'limitation-liability',
      title: t('legal.termsOfService.limitationLiability.title'),
      icon: SupportAgentIcon,
      content: (
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            {t('legal.termsOfService.limitationLiability.intro')}
          </p>
          <div className="grid gap-3">
            {liabilityItems.map((item, index) => (
              <div key={index} className="flex gap-3 p-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <div>
                  <span className="font-medium text-white">{item.limitation}:</span>
                  <span className="text-white/60 ml-1">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500/30">
            <p className="text-amber-300 text-sm">
              <strong>Important:</strong> {t('legal.termsOfService.limitationLiability.warning')}
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
                <GavelIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">{t('legal.legalTerms')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
              {t('legal.termsOfService.title')}
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

            {/* Additional Sections */}
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <Card className="p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-white">{t('legal.termsOfService.additionalTerms.title')}</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">{t('legal.termsOfService.additionalTerms.termination.title')}</h3>
                    <div className="space-y-2 text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.termsOfService.additionalTerms.termination.item1')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.termsOfService.additionalTerms.termination.item2')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.termsOfService.additionalTerms.termination.item3')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">{t('legal.termsOfService.additionalTerms.governingLaw.title')}</h3>
                    <div className="space-y-2 text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.termsOfService.additionalTerms.governingLaw.item1')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.termsOfService.additionalTerms.governingLaw.item2')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{t('legal.termsOfService.additionalTerms.governingLaw.item3')}</span>
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
                  {t('legal.termsOfService.contact.intro')}
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
              <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10" onClick={() => navigate('/privacy')}>
                {t('legal.viewPrivacyPolicy')}
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

export default TermsOfService;
