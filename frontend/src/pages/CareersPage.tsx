import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';
import {
  Briefcase, MapPin, Clock, Heart, Zap, Globe, Users,
  Coffee, GraduationCap, Rocket, Mail, ArrowRight, Star,
  Building, Laptop, Sparkles
} from 'lucide-react';

const CareersPage: React.FC = () => {
  const { t } = useTranslation();

  // Translated benefits data
  const benefits = [
    {
      icon: Heart,
      title: t('careers.benefits.healthWellness.title'),
      description: t('careers.benefits.healthWellness.description'),
    },
    {
      icon: Laptop,
      title: t('careers.benefits.remoteFirst.title'),
      description: t('careers.benefits.remoteFirst.description'),
    },
    {
      icon: GraduationCap,
      title: t('careers.benefits.learningBudget.title'),
      description: t('careers.benefits.learningBudget.description'),
    },
    {
      icon: Coffee,
      title: t('careers.benefits.unlimitedPto.title'),
      description: t('careers.benefits.unlimitedPto.description'),
    },
    {
      icon: Rocket,
      title: t('careers.benefits.equityPackage.title'),
      description: t('careers.benefits.equityPackage.description'),
    },
    {
      icon: Users,
      title: t('careers.benefits.teamRetreats.title'),
      description: t('careers.benefits.teamRetreats.description'),
    },
  ];

  // Translated values data
  const values = [
    {
      icon: Sparkles,
      title: t('careers.values.innovationFirst.title'),
      description: t('careers.values.innovationFirst.description'),
    },
    {
      icon: Users,
      title: t('careers.values.userCentric.title'),
      description: t('careers.values.userCentric.description'),
    },
    {
      icon: Zap,
      title: t('careers.values.moveFast.title'),
      description: t('careers.values.moveFast.description'),
    },
    {
      icon: Globe,
      title: t('careers.values.thinkGlobal.title'),
      description: t('careers.values.thinkGlobal.description'),
    },
  ];

  // Translated positions data
  const openPositions = [
    {
      title: t('careers.positions.seniorFullStack.title'),
      department: t('careers.positions.seniorFullStack.department'),
      location: t('careers.positions.seniorFullStack.location'),
      type: t('careers.positions.seniorFullStack.type'),
    },
    {
      title: t('careers.positions.aiMlEngineer.title'),
      department: t('careers.positions.aiMlEngineer.department'),
      location: t('careers.positions.aiMlEngineer.location'),
      type: t('careers.positions.aiMlEngineer.type'),
    },
    {
      title: t('careers.positions.productDesigner.title'),
      department: t('careers.positions.productDesigner.department'),
      location: t('careers.positions.productDesigner.location'),
      type: t('careers.positions.productDesigner.type'),
    },
    {
      title: t('careers.positions.devOpsEngineer.title'),
      department: t('careers.positions.devOpsEngineer.department'),
      location: t('careers.positions.devOpsEngineer.location'),
      type: t('careers.positions.devOpsEngineer.type'),
    },
    {
      title: t('careers.positions.technicalWriter.title'),
      department: t('careers.positions.technicalWriter.department'),
      location: t('careers.positions.technicalWriter.location'),
      type: t('careers.positions.technicalWriter.type'),
    },
  ];

  // Stats data
  const stats = [
    { value: '50+', label: t('careers.stats.teamMembers') },
    { value: '20+', label: t('careers.stats.countries') },
    { value: '100K+', label: t('careers.stats.usersServed') },
    { value: '$10M+', label: t('careers.stats.raised') },
  ];

  return (
    <>
      <SEO
        title="Careers - Join Our Team | Wants"
        description="Join the Wants team and help build the future of AI-powered productivity. We're hiring talented engineers, designers, and more. Remote-first culture."
        keywords="careers, jobs, hiring, remote work, engineering jobs, AI jobs, startup jobs"
      />

      <div className="min-h-screen bg-gray-950 text-white">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]"
            animate={{ x: [0, 80, 0], y: [0, -60, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]"
            animate={{ x: [0, -60, 0], y: [0, 80, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">{t('careers.badge')}</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="text-white">{t('careers.heroTitle')} </span>
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  {t('careers.heroTitleHighlight')}
                </span>
              </h1>

              <p className="text-xl text-white/60 max-w-3xl mx-auto mb-10">
                {t('careers.heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#positions"
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                >
                  {t('careers.viewPositions')}
                  <ArrowRight className="w-5 h-5" />
                </a>
                <button
                  onClick={() => window.location.href = '/about'}
                  className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  {t('careers.learnAboutUs')}
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative py-12 px-4 border-y border-white/10">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('careers.valuesTitle')}</h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                {t('careers.valuesSubtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-xl text-center hover:border-emerald-500/30 transition-all"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-white/60">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="relative py-20 px-4 bg-white/5">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('careers.benefitsTitle')}</h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                {t('careers.benefitsSubtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-gray-950/50 border border-white/10 rounded-xl hover:border-emerald-500/30 transition-all"
                >
                  <div className="w-10 h-10 mb-4 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-white/60">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="positions" className="relative py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('careers.positionsTitle')}</h2>
              <p className="text-lg text-white/60">
                {t('careers.positionsSubtitle')}
              </p>
            </motion.div>

            <div className="space-y-4">
              {openPositions.map((position, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-emerald-500/30 transition-all cursor-pointer group"
                  onClick={() => window.location.href = `mailto:support@wants.chat?subject=Application: ${position.title}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold group-hover:text-emerald-400 transition-colors">
                        {position.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {position.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-center"
            >
              <Mail className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">{t('careers.ctaTitle')}</h2>
              <p className="text-white/70 mb-6">
                {t('careers.ctaSubtitle')}
              </p>
              <a
                href="mailto:support@wants.chat"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all"
              >
                <Mail className="w-5 h-5" />
                support@wants.chat
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CareersPage;
