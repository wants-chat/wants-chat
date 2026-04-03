import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';

// Icons
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BoltIcon from '@mui/icons-material/Bolt';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import SecurityIcon from '@mui/icons-material/Security';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Category Icons
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GavelIcon from '@mui/icons-material/Gavel';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BrushIcon from '@mui/icons-material/Brush';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const coreFeatures = [
    {
      icon: PsychologyIcon,
      titleKey: 'features.page.coreFeatures.intentUnderstanding.title',
      descriptionKey: 'features.page.coreFeatures.intentUnderstanding.description',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: DashboardCustomizeIcon,
      titleKey: 'features.page.coreFeatures.instantToolRendering.title',
      descriptionKey: 'features.page.coreFeatures.instantToolRendering.description',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: SmartToyIcon,
      titleKey: 'features.page.coreFeatures.contextualTools.title',
      descriptionKey: 'features.page.coreFeatures.contextualTools.description',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: BoltIcon,
      titleKey: 'features.page.coreFeatures.zeroLearningCurve.title',
      descriptionKey: 'features.page.coreFeatures.zeroLearningCurve.description',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: SecurityIcon,
      titleKey: 'features.page.coreFeatures.enterpriseSecurity.title',
      descriptionKey: 'features.page.coreFeatures.enterpriseSecurity.description',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: CloudSyncIcon,
      titleKey: 'features.page.coreFeatures.crossDeviceSync.title',
      descriptionKey: 'features.page.coreFeatures.crossDeviceSync.description',
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  const toolCategories = [
    {
      icon: BusinessCenterIcon,
      nameKey: 'features.categories.business',
      count: '120+',
      exampleKeys: [
        'features.page.toolCategories.examples.invoiceGenerator',
        'features.page.toolCategories.examples.projectTimeline',
        'features.page.toolCategories.examples.meetingScheduler',
        'features.page.toolCategories.examples.contractBuilder',
      ],
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: LocalHospitalIcon,
      nameKey: 'features.categories.health',
      count: '80+',
      exampleKeys: [
        'features.page.toolCategories.examples.bmiCalculator',
        'features.page.toolCategories.examples.calorieTracker',
        'features.page.toolCategories.examples.medicationTracker',
        'features.page.toolCategories.examples.symptomChecker',
      ],
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: GavelIcon,
      nameKey: 'solutions.legal',
      count: '60+',
      exampleKeys: [
        'features.page.toolCategories.examples.ndaGenerator',
        'features.page.toolCategories.examples.contractBuilder',
        'features.page.toolCategories.examples.privacyPolicy',
        'features.page.toolCategories.examples.complianceTools',
      ],
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: SchoolIcon,
      nameKey: 'solutions.education',
      count: '60+',
      exampleKeys: [
        'features.page.toolCategories.examples.flashcardGenerator',
        'features.page.toolCategories.examples.gradeCalculator',
        'features.page.toolCategories.examples.studyTimer',
        'features.page.toolCategories.examples.citationGenerator',
      ],
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: AccountBalanceIcon,
      nameKey: 'features.categories.finance',
      count: '150+',
      exampleKeys: [
        'features.page.toolCategories.examples.budgetPlanner',
        'features.page.toolCategories.examples.investmentTracker',
        'features.page.toolCategories.examples.taxCalculator',
        'features.page.toolCategories.examples.mortgageTools',
      ],
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: BrushIcon,
      nameKey: 'features.categories.generators',
      count: '100+',
      exampleKeys: [
        'features.page.toolCategories.examples.imageGenerator',
        'features.page.toolCategories.examples.logoDesigner',
        'features.page.toolCategories.examples.colorPalette',
        'features.page.toolCategories.examples.qrCodeGenerator',
      ],
      color: 'from-pink-500 to-rose-600',
    },
    {
      icon: HomeWorkIcon,
      nameKey: 'solutions.realEstate',
      count: '40+',
      exampleKeys: [
        'features.page.toolCategories.examples.mortgageCalculator',
        'features.page.toolCategories.examples.propertyManager',
        'features.page.toolCategories.examples.rentVsBuy',
        'features.page.toolCategories.examples.squareFootage',
      ],
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: DirectionsCarIcon,
      nameKey: 'solutions.automotive',
      count: '35+',
      exampleKeys: [
        'features.page.toolCategories.examples.carLoanCalculator',
        'features.page.toolCategories.examples.fuelCost',
        'features.page.toolCategories.examples.mpgCalculator',
        'features.page.toolCategories.examples.evRangeEstimator',
      ],
      color: 'from-slate-500 to-gray-600',
    },
    {
      icon: RestaurantIcon,
      nameKey: 'solutions.foodHospitality',
      count: '40+',
      exampleKeys: [
        'features.page.toolCategories.examples.recipeScaler',
        'features.page.toolCategories.examples.mealPlanner',
        'features.page.toolCategories.examples.nutritionCalculator',
        'features.page.toolCategories.examples.calorieCounter',
      ],
      color: 'from-orange-500 to-red-600',
    },
    {
      icon: FitnessCenterIcon,
      nameKey: 'features.categories.fitness',
      count: '45+',
      exampleKeys: [
        'features.page.toolCategories.examples.workoutPlanner',
        'features.page.toolCategories.examples.oneRepMax',
        'features.page.toolCategories.examples.paceCalculator',
        'features.page.toolCategories.examples.progressTracker',
      ],
      color: 'from-red-500 to-pink-600',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      titleKey: 'features.page.howItWorks.step1.title',
      descriptionKey: 'features.page.howItWorks.step1.description',
    },
    {
      step: '02',
      titleKey: 'features.page.howItWorks.step2.title',
      descriptionKey: 'features.page.howItWorks.step2.description',
    },
    {
      step: '03',
      titleKey: 'features.page.howItWorks.step3.title',
      descriptionKey: 'features.page.howItWorks.step3.description',
    },
    {
      step: '04',
      titleKey: 'features.page.howItWorks.step4.title',
      descriptionKey: 'features.page.howItWorks.step4.description',
    },
  ];

  const traditionalAiItems = [
    'features.page.comparison.traditionalAi.item1',
    'features.page.comparison.traditionalAi.item2',
    'features.page.comparison.traditionalAi.item3',
    'features.page.comparison.traditionalAi.item4',
    'features.page.comparison.traditionalAi.item5',
  ];

  const wantsItems = [
    'features.page.comparison.wants.item1',
    'features.page.comparison.wants.item2',
    'features.page.comparison.wants.item3',
    'features.page.comparison.wants.item4',
    'features.page.comparison.wants.item5',
  ];

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Hero Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />

        <motion.div
          className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              className="inline-flex justify-center mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2">
                <AutoAwesomeIcon className="h-4 w-4 mr-2" />
                {t('features.page.heroBadge')}
              </Badge>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-white">{t('features.page.heroTitleLine1')}</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                {t('features.page.heroTitleLine2')}
              </span>
            </motion.h1>

            <motion.p
              className="text-xl lg:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {t('features.page.heroDescription')}
              <span className="text-white font-medium">{t('features.page.heroDescriptionHighlight')}</span>
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              className="flex flex-wrap justify-center gap-8 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-400">1,100+</div>
                <div className="text-gray-500 text-sm">{t('features.page.stats.smartTools')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-400">30+</div>
                <div className="text-gray-500 text-sm">{t('features.page.stats.aiModels')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-400">100+</div>
                <div className="text-gray-500 text-sm">{t('features.page.stats.integrations')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-400">50+</div>
                <div className="text-gray-500 text-sm">{t('features.page.stats.industries')}</div>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8"
                onClick={() => navigate('/signup')}
              >
                {t('common.tryFree')}
                <ArrowForwardIcon className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => navigate('/tools')}
              >
                {t('features.page.exploreAllTools')}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Core Features */}
      <section className="py-20 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4">
              {t('features.title')}
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              {t('features.page.coreFeatures.sectionTitle')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all h-full">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-gray-400">{t(feature.descriptionKey)}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-4">
              {t('howItWorks.title')}
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              {t('features.page.howItWorks.sectionTitle')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
                )}
                <div className="text-6xl font-bold text-emerald-500/20 mb-4">{step.step}</div>
                <h3 className="text-xl font-bold text-white mb-2">{t(step.titleKey)}</h3>
                <p className="text-gray-400 text-sm">{t(step.descriptionKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Categories */}
      <section className="py-20 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 mb-4">
              {t('features.page.toolCategories.badge')}
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              {t('features.page.toolCategories.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('features.page.toolCategories.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {toolCategories.map((category, index) => (
              <motion.div
                key={category.nameKey}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-5 bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all h-full group cursor-pointer">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-3`}>
                    <category.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-white">{t(category.nameKey)}</h3>
                    <span className="text-xs text-emerald-400 font-medium">{category.count}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {category.exampleKeys.slice(0, 2).map((exampleKey) => (
                      <Badge key={exampleKey} variant="outline" className="text-[10px] border-gray-700 text-gray-500">
                        {t(exampleKey)}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => navigate('/tools')}
            >
              {t('features.page.toolCategories.viewAllTools')}
              <ArrowForwardIcon className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mb-4">
              {t('features.page.comparison.badge')}
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              {t('features.page.comparison.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Traditional AI */}
            <Card className="p-8 bg-gray-900/30 border-gray-800">
              <h3 className="text-xl font-bold text-gray-400 mb-6">{t('features.page.comparison.traditionalAi.title')}</h3>
              <ul className="space-y-4">
                {traditionalAiItems.map((itemKey, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-500">
                    <span className="text-red-400 mt-1">&#10005;</span>
                    {t(itemKey)}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Wants */}
            <Card className="p-8 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30">
              <h3 className="text-xl font-bold text-emerald-400 mb-6">{t('features.page.comparison.wants.title')}</h3>
              <ul className="space-y-4">
                {wantsItems.map((itemKey, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {t(itemKey)}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              {t('landing.ctaTitle')}
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              {t('landing.ctaSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8"
                onClick={() => navigate('/signup')}
              >
                {t('common.startFreeTrial')}
                <ArrowForwardIcon className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => navigate('/pricing')}
              >
                {t('common.pricing')}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                <span>{t('features.page.cta.freeTierAvailable')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                <span>{t('features.page.cta.noCreditCard')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                <span>{t('features.page.cta.cancelAnytime')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
