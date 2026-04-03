import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const steps = [
    {
      step: 1,
      title: t('howItWorks.steps.step1.title'),
      description: t('howItWorks.steps.step1.description'),
      icon: PersonAddIcon,
      color: "from-blue-500 to-cyan-500",
      features: [
        t('howItWorks.steps.step1.features.quickSetup'),
        t('howItWorks.steps.step1.features.freeTrial'),
        t('howItWorks.steps.step1.features.noCard'),
        t('howItWorks.steps.step1.features.instantAccess')
      ]
    },
    {
      step: 2,
      title: t('howItWorks.steps.step2.title'),
      description: t('howItWorks.steps.step2.description'),
      icon: SettingsIcon,
      color: "from-teal-500 to-pink-500",
      features: [
        t('howItWorks.steps.step2.features.focusAreas'),
        t('howItWorks.steps.step2.features.personalGoals'),
        t('howItWorks.steps.step2.features.configPreferences'),
        t('howItWorks.steps.step2.features.syncApps')
      ]
    },
    {
      step: 3,
      title: t('howItWorks.steps.step3.title'),
      description: t('howItWorks.steps.step3.description'),
      icon: TrendingUpIcon,
      color: "from-green-500 to-emerald-500",
      features: [
        t('howItWorks.steps.step3.features.logActivities'),
        t('howItWorks.steps.step3.features.trackProgress'),
        t('howItWorks.steps.step3.features.buildHabits'),
        t('howItWorks.steps.step3.features.smartReminders')
      ]
    },
    {
      step: 4,
      title: t('howItWorks.steps.step4.title'),
      description: t('howItWorks.steps.step4.description'),
      icon: AutoAwesomeIcon,
      color: "from-orange-500 to-red-500",
      features: [
        t('howItWorks.steps.step4.features.personalizedInsights'),
        t('howItWorks.steps.step4.features.smartRecommendations'),
        t('howItWorks.steps.step4.features.patternRecognition'),
        t('howItWorks.steps.step4.features.goalOptimization')
      ]
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <motion.div 
          className="container mx-auto px-4 sm:px-6 lg:px-8 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <AutoAwesomeIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t('howItWorks.badge')}</span>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t('howItWorks.heroTitle')}
              <span className="text-primary"> {t('howItWorks.heroTitleHighlight')} </span>
              {t('howItWorks.heroTitleSuffix')}
            </motion.h1>

            <motion.p
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {t('howItWorks.heroSubtitle')}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                className="group"
                onClick={() => navigate('/signup')}
              >
                {t('howItWorks.getStartedFree')}
                <ArrowForwardIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Steps Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              {t('howItWorks.stepsTitle')} <span className="text-primary">{t('howItWorks.stepsTitleHighlight')}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('howItWorks.stepsSubtitle')}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="p-8 hover:shadow-xl transition-all duration-300 border-primary/10 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} opacity-10 rounded-full -translate-y-8 translate-x-8`} />
                  
                  <div className="flex items-start gap-6">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {t('howItWorks.stepLabel')} {step.step}
                        </Badge>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground mb-6">{step.description}</p>
                      
                      <div className="space-y-2">
                        {step.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-primary" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              {t('howItWorks.ctaTitle')}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t('howItWorks.ctaSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="group"
                onClick={() => navigate('/signup')}
              >
                {t('howItWorks.startJourney')}
                <ArrowForwardIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/products')}>
                {t('howItWorks.viewProducts')}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-primary" />
                <span>{t('howItWorks.freeTrial')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-primary" />
                <span>{t('howItWorks.noCard')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-primary" />
                <span>{t('howItWorks.cancelAnytime')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;