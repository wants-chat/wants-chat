import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import UpdateIcon from '@mui/icons-material/Update';
import StorageIcon from '@mui/icons-material/Storage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FlightIcon from '@mui/icons-material/Flight';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import SettingsIcon from '@mui/icons-material/Settings';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const DataDeletion: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const lastUpdated = 'December 17, 2025';

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
        ease: "easeOut" as const
      }
    }
  };

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

  const deletedDataTypes = [
    {
      icon: PersonIcon,
      title: t('legal.dataDeletion.whatGetsDeleted.profileInfo.title'),
      description: t('legal.dataDeletion.whatGetsDeleted.profileInfo.description')
    },
    {
      icon: FitnessCenterIcon,
      title: t('legal.dataDeletion.whatGetsDeleted.fitnessData.title'),
      description: t('legal.dataDeletion.whatGetsDeleted.fitnessData.description')
    },
    {
      icon: HealthAndSafetyIcon,
      title: t('legal.dataDeletion.whatGetsDeleted.healthRecords.title'),
      description: t('legal.dataDeletion.whatGetsDeleted.healthRecords.description')
    },
    {
      icon: RestaurantIcon,
      title: t('legal.dataDeletion.whatGetsDeleted.nutritionData.title'),
      description: t('legal.dataDeletion.whatGetsDeleted.nutritionData.description')
    },
    {
      icon: FlightIcon,
      title: t('legal.dataDeletion.whatGetsDeleted.travelPlans.title'),
      description: t('legal.dataDeletion.whatGetsDeleted.travelPlans.description')
    },
    {
      icon: AccountBalanceWalletIcon,
      title: t('legal.dataDeletion.whatGetsDeleted.expenseData.title'),
      description: t('legal.dataDeletion.whatGetsDeleted.expenseData.description')
    },
    {
      icon: SelfImprovementIcon,
      title: t('legal.dataDeletion.whatGetsDeleted.meditationSessions.title'),
      description: t('legal.dataDeletion.whatGetsDeleted.meditationSessions.description')
    },
    {
      icon: SettingsIcon,
      title: t('legal.dataDeletion.whatGetsDeleted.preferencesSettings.title'),
      description: t('legal.dataDeletion.whatGetsDeleted.preferencesSettings.description')
    }
  ];

  const deletionSteps = [
    {
      number: '1',
      title: t('legal.dataDeletion.howToDelete.step1.title'),
      description: t('legal.dataDeletion.howToDelete.step1.description')
    },
    {
      number: '2',
      title: t('legal.dataDeletion.howToDelete.step2.title'),
      description: t('legal.dataDeletion.howToDelete.step2.description')
    },
    {
      number: '3',
      title: t('legal.dataDeletion.howToDelete.step3.title'),
      description: t('legal.dataDeletion.howToDelete.step3.description')
    },
    {
      number: '4',
      title: t('legal.dataDeletion.howToDelete.step4.title'),
      description: t('legal.dataDeletion.howToDelete.step4.description')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-red-500/10 rounded-full blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-200px] left-[-100px] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl"
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
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30 mb-6">
              <div className="p-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500">
                <DeleteForeverIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">{t('legal.yourDataYourControl')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
              {t('legal.dataDeletion.title')}{' '}
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                {t('legal.dataDeletion.titleHighlight')}
              </span>
            </h1>

            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-6">
              {t('legal.dataDeletion.subtitle')}
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-white/60">
              <UpdateIcon className="h-4 w-4" />
              <span>{t('legal.lastUpdated')}: {lastUpdated}</span>
            </div>
          </motion.div>

          {/* Important Warning */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mb-8"
          >
            <Card className="p-8 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm border border-red-500/30">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-red-500/30 border border-red-500/40 flex-shrink-0">
                  <WarningAmberIcon className="h-8 w-8 text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {t('legal.dataDeletion.warning.title')}
                  </h2>
                  <p className="text-white/80 leading-relaxed mb-4">
                    {t('legal.dataDeletion.warning.description')}
                  </p>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-center gap-2">
                      <DeleteForeverIcon className="h-4 w-4 text-red-400" />
                      {t('legal.dataDeletion.warning.dataErased')}
                    </li>
                    <li className="flex items-center gap-2">
                      <StorageIcon className="h-4 w-4 text-red-400" />
                      {t('legal.dataDeletion.warning.cannotRecover')}
                    </li>
                    <li className="flex items-center gap-2">
                      <AccessTimeIcon className="h-4 w-4 text-red-400" />
                      {t('legal.dataDeletion.warning.backupRemoval')}
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* What Gets Deleted */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mb-8"
          >
            <Card className="p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-2">{t('legal.dataDeletion.whatGetsDeleted.title')}</h2>
              <p className="text-white/60 mb-6">{t('legal.dataDeletion.whatGetsDeleted.subtitle')}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {deletedDataTypes.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.div
                      key={index}
                      className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-3">
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-xs text-white/60 leading-relaxed">{item.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Deletion Process */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mb-8"
          >
            <Card className="p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-2">{t('legal.dataDeletion.howToDelete.title')}</h2>
              <p className="text-white/60 mb-8">{t('legal.dataDeletion.howToDelete.subtitle')}</p>

              <div className="space-y-6">
                {deletionSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex gap-6 items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-500/30">
                      {step.number}
                    </div>
                    <div className="flex-1 bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                      <p className="text-white/60 leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mb-8"
          >
            <Card className="p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex-shrink-0">
                  <AccessTimeIcon className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('legal.dataDeletion.timeline.title')}</h3>
                  <p className="text-white/60 leading-relaxed">
                    {t('legal.dataDeletion.timeline.subtitle')}
                  </p>
                </div>
              </div>

              <div className="space-y-4 ml-16">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">{t('legal.dataDeletion.timeline.immediate.title')}</p>
                    <p className="text-sm text-white/60">
                      {t('legal.dataDeletion.timeline.immediate.desc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">{t('legal.dataDeletion.timeline.within30Days.title')}</p>
                    <p className="text-sm text-white/60">
                      {t('legal.dataDeletion.timeline.within30Days.desc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">{t('legal.dataDeletion.timeline.within90Days.title')}</p>
                    <p className="text-sm text-white/60">
                      {t('legal.dataDeletion.timeline.within90Days.desc')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mb-8"
          >
            <Card className="p-8 bg-gradient-to-r from-slate-800 to-slate-900 backdrop-blur-sm border border-white/20">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">{t('legal.dataDeletion.cta.title')}</h2>
                <p className="text-white/60 mb-6 max-w-lg mx-auto">
                  {t('legal.dataDeletion.cta.subtitle')}
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    onClick={() => navigate('/login')}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-red-500/30"
                  >
                    {t('legal.dataDeletion.cta.loginToDelete')}
                    <ArrowForwardIcon className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/privacy')}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {t('legal.viewPrivacyPolicy')}
                  </Button>
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
            <Card className="p-8 bg-red-500/10 backdrop-blur-sm border border-red-500/20">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 flex-shrink-0">
                  <ContactMailIcon className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">{t('legal.dataDeletion.contact.title')}</h3>
                  <p className="text-white/60 leading-relaxed mb-4">
                    {t('legal.dataDeletion.contact.subtitle')}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="mailto:support@wants.chat"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium rounded-lg shadow-lg shadow-red-500/30 transition-all duration-300"
                    >
                      {t('legal.dataDeletion.contact.emailPrivacyTeam')}
                    </a>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/terms')}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {t('legal.viewTermsOfService')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default DataDeletion;
