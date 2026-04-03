import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Cloud,
  FileSpreadsheet,
  Calendar,
  Mail,
  MessageSquare,
  Database,
  CreditCard,
  Users,
  GitBranch,
  HardDrive,
  Send,
  Bot,
  Workflow,
  Building2,
  FileText,
  Video,
  Briefcase,
  BarChart3,
  ShoppingCart,
  Phone,
  Link2,
  Layers,
} from 'lucide-react';

interface Connector {
  name: string;
  icon: React.ElementType;
  category: string;
  gradient: string;
}

const connectors: Connector[] = [
  // Google Suite
  { name: 'Google Drive', icon: HardDrive, category: 'Google', gradient: 'from-blue-500 to-green-500' },
  { name: 'Google Sheets', icon: FileSpreadsheet, category: 'Google', gradient: 'from-green-500 to-emerald-500' },
  { name: 'Google Calendar', icon: Calendar, category: 'Google', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Gmail', icon: Mail, category: 'Google', gradient: 'from-red-500 to-orange-500' },

  // Microsoft
  { name: 'Office 365', icon: FileText, category: 'Microsoft', gradient: 'from-orange-500 to-red-500' },
  { name: 'OneDrive', icon: Cloud, category: 'Microsoft', gradient: 'from-blue-500 to-indigo-500' },
  { name: 'Teams', icon: Video, category: 'Microsoft', gradient: 'from-indigo-500 to-purple-500' },

  // Communication
  { name: 'Slack', icon: MessageSquare, category: 'Communication', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Discord', icon: MessageSquare, category: 'Communication', gradient: 'from-indigo-500 to-purple-500' },
  { name: 'Twilio', icon: Phone, category: 'Communication', gradient: 'from-red-500 to-pink-500' },
  { name: 'SendGrid', icon: Send, category: 'Communication', gradient: 'from-blue-500 to-cyan-500' },

  // Productivity
  { name: 'Notion', icon: FileText, category: 'Productivity', gradient: 'from-gray-600 to-gray-800' },
  { name: 'Airtable', icon: Database, category: 'Productivity', gradient: 'from-yellow-500 to-orange-500' },
  { name: 'Trello', icon: Layers, category: 'Productivity', gradient: 'from-blue-500 to-blue-600' },

  // Automation
  { name: 'Zapier', icon: Workflow, category: 'Automation', gradient: 'from-orange-500 to-amber-500' },
  { name: 'Make', icon: Workflow, category: 'Automation', gradient: 'from-purple-500 to-violet-500' },
  { name: 'n8n', icon: Workflow, category: 'Automation', gradient: 'from-rose-500 to-pink-500' },

  // Cloud Providers
  { name: 'AWS', icon: Cloud, category: 'Cloud', gradient: 'from-orange-500 to-yellow-500' },
  { name: 'Azure', icon: Cloud, category: 'Cloud', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'GCP', icon: Cloud, category: 'Cloud', gradient: 'from-red-500 to-blue-500' },

  // Payments
  { name: 'Stripe', icon: CreditCard, category: 'Payments', gradient: 'from-indigo-500 to-purple-500' },
  { name: 'PayPal', icon: CreditCard, category: 'Payments', gradient: 'from-blue-500 to-blue-700' },
  { name: 'Square', icon: CreditCard, category: 'Payments', gradient: 'from-gray-700 to-gray-900' },

  // CRM
  { name: 'Salesforce', icon: Users, category: 'CRM', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'HubSpot', icon: Users, category: 'CRM', gradient: 'from-orange-500 to-red-500' },
  { name: 'Zoho', icon: Users, category: 'CRM', gradient: 'from-red-500 to-yellow-500' },

  // Development
  { name: 'GitHub', icon: GitBranch, category: 'Development', gradient: 'from-gray-700 to-gray-900' },
  { name: 'GitLab', icon: GitBranch, category: 'Development', gradient: 'from-orange-500 to-red-500' },
  { name: 'Bitbucket', icon: GitBranch, category: 'Development', gradient: 'from-blue-500 to-indigo-500' },

  // Storage
  { name: 'Dropbox', icon: HardDrive, category: 'Storage', gradient: 'from-blue-500 to-blue-600' },
  { name: 'Box', icon: HardDrive, category: 'Storage', gradient: 'from-blue-600 to-blue-700' },

  // AI
  { name: 'OpenAI', icon: Bot, category: 'AI', gradient: 'from-emerald-500 to-teal-500' },
  { name: 'Claude', icon: Bot, category: 'AI', gradient: 'from-orange-500 to-amber-500' },
  { name: 'Gemini', icon: Bot, category: 'AI', gradient: 'from-blue-500 to-purple-500' },

  // Business
  { name: 'QuickBooks', icon: BarChart3, category: 'Business', gradient: 'from-green-500 to-emerald-500' },
  { name: 'Shopify', icon: ShoppingCart, category: 'Business', gradient: 'from-green-500 to-lime-500' },
  { name: 'Jira', icon: Briefcase, category: 'Business', gradient: 'from-blue-500 to-indigo-500' },
  { name: 'Asana', icon: Briefcase, category: 'Business', gradient: 'from-rose-500 to-pink-500' },
  { name: 'Monday', icon: Building2, category: 'Business', gradient: 'from-red-500 to-orange-500' },
  { name: 'Zendesk', icon: Users, category: 'Business', gradient: 'from-teal-500 to-cyan-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

const ConnectorsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-gray-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <motion.div
        className="absolute top-[-300px] left-[-200px] w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-[-300px] right-[-200px] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-4">
            {t('landing.connectors.badge')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('landing.connectors.title')}{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {t('landing.connectors.titleHighlight')}
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('landing.connectors.subtitle')}
          </p>
        </motion.div>

        {/* Connectors Grid - Animated Scroll Effect */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />

          {/* First row - scrolling left */}
          <motion.div
            className="flex gap-4 mb-4"
            animate={{ x: [0, -1500, 0] }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {[...connectors.slice(0, 20), ...connectors.slice(0, 20)].map((connector, index) => (
              <ConnectorCard key={`row1-${index}`} connector={connector} />
            ))}
          </motion.div>

          {/* Second row - scrolling right */}
          <motion.div
            className="flex gap-4 mb-4"
            animate={{ x: [-1500, 0, -1500] }}
            transition={{
              duration: 65,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {[...connectors.slice(20, 40), ...connectors.slice(20, 40)].map((connector, index) => (
              <ConnectorCard key={`row2-${index}`} connector={connector} />
            ))}
          </motion.div>
        </div>

        {/* Static Grid for Mobile/Fallback */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="hidden sm:hidden grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mt-8"
        >
          {connectors.map((connector, index) => (
            <motion.div key={`static-${index}`} variants={itemVariants}>
              <ConnectorCard connector={connector} />
            </motion.div>
          ))}
        </motion.div>

        {/* Categories Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {['Google', 'Microsoft', 'Automation', 'Cloud', 'Payments', 'CRM', 'Development', 'AI', 'Storage', 'Communication'].map((category) => (
              <span
                key={category}
                className="px-4 py-2 rounded-full bg-gray-900/50 border border-gray-800 text-gray-400 text-sm hover:border-cyan-500/50 hover:text-cyan-400 transition-colors cursor-default"
              >
                {category}
              </span>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-6">
            <Link2 className="w-4 h-4 inline-block mr-1" />
            {t('landing.connectors.moreIntegrations')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

interface ConnectorCardProps {
  connector: Connector;
}

const ConnectorCard: React.FC<ConnectorCardProps> = ({ connector }) => {
  const Icon = connector.icon;

  return (
    <div className="flex-shrink-0 group">
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800 hover:border-cyan-500/50 transition-all duration-300 w-[140px]">
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${connector.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm text-white font-medium text-center truncate w-full">
            {connector.name}
          </span>
          <span className="text-xs text-gray-500">{connector.category}</span>
        </div>
      </div>
    </div>
  );
};

export default ConnectorsSection;
