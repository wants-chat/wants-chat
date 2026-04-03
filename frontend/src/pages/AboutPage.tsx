import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PsychologyIcon from '@mui/icons-material/Psychology';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SecurityIcon from '@mui/icons-material/Security';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

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

  const values = [
    {
      icon: PsychologyIcon,
      title: t('about.values.innovation'),
      description: t('about.values.innovationDesc')
    },
    {
      icon: GroupsIcon,
      title: t('about.values.simplicity'),
      description: t('about.values.simplicityDesc')
    },
    {
      icon: FavoriteIcon,
      title: t('about.values.accessibility'),
      description: t('about.values.accessibilityDesc')
    },
    {
      icon: SecurityIcon,
      title: t('about.values.security'),
      description: t('about.values.securityDesc')
    },
    {
      icon: TrendingUpIcon,
      title: t('about.values.growth'),
      description: t('about.values.growthDesc')
    },
    {
      icon: RocketLaunchIcon,
      title: t('about.values.excellence'),
      description: t('about.values.excellenceDesc')
    }
  ];

  const team = [
    {
      name: t('about.team.members.sarah.name'),
      role: t('about.team.members.sarah.role'),
      bio: t('about.team.members.sarah.bio')
    },
    {
      name: t('about.team.members.michael.name'),
      role: t('about.team.members.michael.role'),
      bio: t('about.team.members.michael.bio')
    },
    {
      name: t('about.team.members.emily.name'),
      role: t('about.team.members.emily.role'),
      bio: t('about.team.members.emily.bio')
    },
    {
      name: t('about.team.members.david.name'),
      role: t('about.team.members.david.role'),
      bio: t('about.team.members.david.bio')
    }
  ];

  const stats = [
    { value: t('about.stats.smartToolsValue'), label: t('about.stats.smartTools') },
    { value: t('about.stats.aiModelsValue'), label: t('about.stats.aiModels') },
    { value: t('about.stats.integrationsValue'), label: t('about.stats.integrations') },
    { value: t('about.stats.industriesValue'), label: t('about.stats.industries') }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t('about.title')}
            </h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">
              {t('about.subtitle')}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative py-20 px-4 bg-gray-900/30 z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                {t('about.ourStory')}
              </h2>
              <div className="space-y-4 text-white/60">
                <p>
                  {t('about.storyText')}
                </p>
                <p>
                  {t('about.ourMission')}: {t('about.missionText')}
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 rounded-2xl p-12 flex items-center justify-center">
              <RocketLaunchIcon className="w-48 h-48 text-emerald-400" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-20 px-4 z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t('about.ourValues')}
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              {t('about.valuesSubtitle')}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all"
              >
                <value.icon className="w-12 h-12 text-emerald-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-white">{value.title}</h3>
                <p className="text-white/60">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-20 px-4 bg-gray-900/30 z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t('about.team.title')}
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              {t('about.team.subtitle')}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-1 text-white">{member.name}</h3>
                <p className="text-sm text-emerald-400 mb-3">{member.role}</p>
                <p className="text-sm text-white/60">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 z-10">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t('about.cta.title')}
            </h2>
            <p className="text-xl mb-8 text-white/70">
              {t('about.cta.subtitle')}
            </p>
            <button
              onClick={() => window.location.href = '/signup'}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold transition-all"
            >
              {t('common.getStarted')}
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
