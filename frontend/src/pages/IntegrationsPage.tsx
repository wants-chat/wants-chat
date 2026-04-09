// @ts-nocheck
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';
import {
  Zap, Search, ArrowRight, Check, Globe, Lock, Workflow, Cloud,
  MessageSquare, FileText, Calendar, Mail, Database, Code, Users
} from 'lucide-react';

// Integration categories with apps
const integrationCategories = [
  {
    name: 'Productivity',
    icon: Workflow,
    color: 'from-blue-500 to-cyan-500',
    apps: [
      { name: 'Notion', logo: 'N', desc: 'All-in-one workspace' },
      { name: 'Slack', logo: 'S', desc: 'Team messaging' },
      { name: 'Trello', logo: 'T', desc: 'Visual task management' },
      { name: 'Asana', logo: 'A', desc: 'Project management' },
      { name: 'Monday.com', logo: 'M', desc: 'Work OS' },
      { name: 'ClickUp', logo: 'C', desc: 'Everything app' },
    ]
  },
  {
    name: 'Communication',
    icon: MessageSquare,
    color: 'from-emerald-500 to-teal-500',
    apps: [
      { name: 'Gmail', logo: 'G', desc: 'Email service' },
      { name: 'Microsoft Teams', logo: 'T', desc: 'Business communication' },
      { name: 'Discord', logo: 'D', desc: 'Community platform' },
      { name: 'Zoom', logo: 'Z', desc: 'Video meetings' },
      { name: 'Telegram', logo: 'T', desc: 'Messaging app' },
      { name: 'WhatsApp', logo: 'W', desc: 'Instant messaging' },
    ]
  },
  {
    name: 'Development',
    icon: Code,
    color: 'from-purple-500 to-pink-500',
    apps: [
      { name: 'GitHub', logo: 'G', desc: 'Code hosting' },
      { name: 'GitLab', logo: 'G', desc: 'DevOps platform' },
      { name: 'Jira', logo: 'J', desc: 'Issue tracking' },
      { name: 'Linear', logo: 'L', desc: 'Modern issue tracker' },
      { name: 'Vercel', logo: 'V', desc: 'Frontend cloud' },
      { name: 'Netlify', logo: 'N', desc: 'Web deployment' },
    ]
  },
  {
    name: 'Cloud Storage',
    icon: Cloud,
    color: 'from-orange-500 to-amber-500',
    apps: [
      { name: 'Google Drive', logo: 'G', desc: 'Cloud storage' },
      { name: 'Dropbox', logo: 'D', desc: 'File hosting' },
      { name: 'OneDrive', logo: 'O', desc: 'Microsoft storage' },
      { name: 'Box', logo: 'B', desc: 'Secure file sharing' },
      { name: 'iCloud', logo: 'i', desc: 'Apple cloud' },
      { name: 'AWS S3', logo: 'S', desc: 'Object storage' },
    ]
  },
  {
    name: 'CRM & Sales',
    icon: Users,
    color: 'from-rose-500 to-red-500',
    apps: [
      { name: 'Salesforce', logo: 'S', desc: 'CRM platform' },
      { name: 'HubSpot', logo: 'H', desc: 'Inbound marketing' },
      { name: 'Pipedrive', logo: 'P', desc: 'Sales CRM' },
      { name: 'Zendesk', logo: 'Z', desc: 'Customer service' },
      { name: 'Intercom', logo: 'I', desc: 'Customer messaging' },
      { name: 'Freshworks', logo: 'F', desc: 'Customer engagement' },
    ]
  },
  {
    name: 'Databases',
    icon: Database,
    color: 'from-indigo-500 to-violet-500',
    apps: [
      { name: 'Airtable', logo: 'A', desc: 'Spreadsheet database' },
      { name: 'Firebase', logo: 'F', desc: 'App development' },
      { name: 'Supabase', logo: 'S', desc: 'Open source Firebase' },
      { name: 'MongoDB', logo: 'M', desc: 'NoSQL database' },
      { name: 'PostgreSQL', logo: 'P', desc: 'SQL database' },
      { name: 'Coda', logo: 'C', desc: 'Doc-database' },
    ]
  },
  {
    name: 'Automation',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    apps: [
      { name: 'Zapier', logo: 'Z', desc: 'App automation' },
      { name: 'Make', logo: 'M', desc: 'Visual automation' },
      { name: 'n8n', logo: 'n', desc: 'Workflow automation' },
      { name: 'IFTTT', logo: 'I', desc: 'App connections' },
      { name: 'Pabbly', logo: 'P', desc: 'Business automation' },
      { name: 'Automate.io', logo: 'A', desc: 'Cloud integration' },
    ]
  },
  {
    name: 'Scheduling',
    icon: Calendar,
    color: 'from-teal-500 to-green-500',
    apps: [
      { name: 'Calendly', logo: 'C', desc: 'Meeting scheduling' },
      { name: 'Google Calendar', logo: 'G', desc: 'Time management' },
      { name: 'Outlook', logo: 'O', desc: 'Email & calendar' },
      { name: 'Cal.com', logo: 'C', desc: 'Open scheduling' },
      { name: 'Doodle', logo: 'D', desc: 'Group scheduling' },
      { name: 'Acuity', logo: 'A', desc: 'Appointment scheduling' },
    ]
  },
];

// Featured integrations for hero
const featuredIntegrations = [
  'Google', 'Slack', 'Notion', 'GitHub', 'Zapier', 'Salesforce',
  'Discord', 'Trello', 'Jira', 'HubSpot', 'Shopify', 'Stripe',
  'Figma', 'Linear', 'Airtable', 'Mailchimp'
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const IntegrationsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t('integrations.seo.title')}
        description={t('integrations.seo.description')}
        keywords="integrations, automation, zapier, slack, notion, github, google, api, workflow"
      />

      <div className="min-h-screen bg-gray-950 text-white">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]"
            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]"
            animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white/80">{t('integrations.hero.badge')}</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  {t('integrations.hero.title')}
                </span>
              </h1>

              <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">
                {t('integrations.hero.subtitle')}
              </p>

              {/* Search bar */}
              <div className="max-w-xl mx-auto mb-12">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder={t('integrations.hero.searchPlaceholder')}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Featured integration logos */}
              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {featuredIntegrations.map((app, index) => (
                  <motion.div
                    key={app}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:border-emerald-500/30 transition-all cursor-pointer"
                  >
                    {app}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-16 px-4 border-y border-white/10">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '500+', label: t('integrations.stats.integrations') },
                { value: '50M+', label: t('integrations.stats.workflowsRun') },
                { value: '99.9%', label: t('integrations.stats.uptimeSla') },
                { value: '24/7', label: t('integrations.stats.support') },
              ].map((stat, index) => (
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

        {/* Integration Categories */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('integrations.categories.title')}
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                {t('integrations.categories.subtitle')}
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-12"
            >
              {integrationCategories.map((category, categoryIndex) => (
                <motion.div key={category.name} variants={itemVariants}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <span className="text-sm text-white/40">({category.apps.length}+ apps)</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {category.apps.map((app, appIndex) => (
                      <motion.div
                        key={app.name}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-emerald-500/30 hover:bg-white/10 transition-all cursor-pointer group"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white font-bold text-lg mb-3`}>
                          {app.logo}
                        </div>
                        <h4 className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                          {app.name}
                        </h4>
                        <p className="text-xs text-white/50 mt-1">{app.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 px-4 bg-white/5">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('integrations.features.title')}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Globe,
                  title: t('integrations.features.universalConnectivity.title'),
                  description: t('integrations.features.universalConnectivity.description'),
                },
                {
                  icon: Lock,
                  title: t('integrations.features.enterpriseSecurity.title'),
                  description: t('integrations.features.enterpriseSecurity.description'),
                },
                {
                  icon: Zap,
                  title: t('integrations.features.realtimeSync.title'),
                  description: t('integrations.features.realtimeSync.description'),
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-gray-950/50 border border-white/10 rounded-xl"
                >
                  <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 w-fit mb-4">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/60">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-12 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('integrations.cta.title')}
              </h2>
              <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                {t('integrations.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/signup'}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                >
                  {t('integrations.cta.getStarted')}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.location.href = '/contact'}
                  className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  {t('integrations.cta.contactSales')}
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default IntegrationsPage;