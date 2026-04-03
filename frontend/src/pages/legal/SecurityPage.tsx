import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { SEO } from '../../components/SEO';
import {
  Shield, Lock, Key, Server, Eye, CheckCircle, Award,
  FileCheck, AlertTriangle, Globe, Database, Fingerprint,
  RefreshCcw, ShieldCheck, BadgeCheck, Clock
} from 'lucide-react';

const SecurityPage: React.FC = () => {
  const { t } = useTranslation();

  // Security certifications
  const certifications = [
    {
      name: t('legal.security.certifications.soc2.name'),
      description: t('legal.security.certifications.soc2.description'),
      icon: Award,
      status: t('legal.security.certifications.soc2.status'),
    },
    {
      name: t('legal.security.certifications.gdpr.name'),
      description: t('legal.security.certifications.gdpr.description'),
      icon: Globe,
      status: t('legal.security.certifications.gdpr.status'),
    },
    {
      name: t('legal.security.certifications.hipaa.name'),
      description: t('legal.security.certifications.hipaa.description'),
      icon: FileCheck,
      status: t('legal.security.certifications.hipaa.status'),
    },
    {
      name: t('legal.security.certifications.iso27001.name'),
      description: t('legal.security.certifications.iso27001.description'),
      icon: BadgeCheck,
      status: t('legal.security.certifications.iso27001.status'),
    },
  ];

  // Security features
  const securityFeatures = [
    {
      icon: Lock,
      title: t('legal.security.features.encryption.title'),
      description: t('legal.security.features.encryption.description'),
    },
    {
      icon: Key,
      title: t('legal.security.features.authentication.title'),
      description: t('legal.security.features.authentication.description'),
    },
    {
      icon: Server,
      title: t('legal.security.features.infrastructure.title'),
      description: t('legal.security.features.infrastructure.description'),
    },
    {
      icon: Eye,
      title: t('legal.security.features.privacy.title'),
      description: t('legal.security.features.privacy.description'),
    },
    {
      icon: Database,
      title: t('legal.security.features.backup.title'),
      description: t('legal.security.features.backup.description'),
    },
    {
      icon: RefreshCcw,
      title: t('legal.security.features.audits.title'),
      description: t('legal.security.features.audits.description'),
    },
  ];

  // Security practices
  const securityPractices = [
    {
      category: t('legal.security.practices.accessControl.title'),
      items: [
        t('legal.security.practices.accessControl.item1'),
        t('legal.security.practices.accessControl.item2'),
        t('legal.security.practices.accessControl.item3'),
        t('legal.security.practices.accessControl.item4'),
      ],
    },
    {
      category: t('legal.security.practices.networkSecurity.title'),
      items: [
        t('legal.security.practices.networkSecurity.item1'),
        t('legal.security.practices.networkSecurity.item2'),
        t('legal.security.practices.networkSecurity.item3'),
        t('legal.security.practices.networkSecurity.item4'),
      ],
    },
    {
      category: t('legal.security.practices.applicationSecurity.title'),
      items: [
        t('legal.security.practices.applicationSecurity.item1'),
        t('legal.security.practices.applicationSecurity.item2'),
        t('legal.security.practices.applicationSecurity.item3'),
        t('legal.security.practices.applicationSecurity.item4'),
      ],
    },
    {
      category: t('legal.security.practices.incidentResponse.title'),
      items: [
        t('legal.security.practices.incidentResponse.item1'),
        t('legal.security.practices.incidentResponse.item2'),
        t('legal.security.practices.incidentResponse.item3'),
        t('legal.security.practices.incidentResponse.item4'),
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Security - Trust & Safety | Wants"
        description="Learn about Wants security practices, certifications, and how we protect your data. SOC 2 certified, GDPR and HIPAA compliant."
        keywords="security, privacy, SOC 2, GDPR, HIPAA, encryption, data protection, compliance"
      />

      <div className="min-h-screen bg-gray-950 text-white">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]"
            animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]"
            animate={{ x: [0, 60, 0], y: [0, -80, 0] }}
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
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">{t('legal.enterpriseSecurity')}</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  {t('legal.security.title')}
                </span>
              </h1>

              <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">
                {t('legal.security.subtitle')}
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-white/50">
                <Clock className="w-4 h-4" />
                <span>{t('legal.lastUpdated')}: January 2, 2026</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Certifications */}
        <section className="relative py-16 px-4 border-y border-white/10">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-xl text-center hover:border-emerald-500/30 transition-all"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <cert.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold mb-1">{cert.name}</h3>
                  <p className="text-xs text-white/50 mb-2">{cert.description}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    cert.status === 'Certified' || cert.status === 'Compliant'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {cert.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('legal.security.features.title')}</h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                {t('legal.security.features.subtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-emerald-500/30 transition-all"
                >
                  <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/60">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Practices */}
        <section className="relative py-20 px-4 bg-white/5">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('legal.security.practices.title')}</h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                {t('legal.security.practices.subtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {securityPractices.map((practice, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-gray-950/50 border border-white/10 rounded-xl"
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    {practice.category}
                  </h3>
                  <ul className="space-y-3">
                    {practice.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3 text-sm text-white/70">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vulnerability Reporting */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-500/30">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('legal.security.vulnerability.title')}</h3>
                  <p className="text-white/70 mb-4">
                    {t('legal.security.vulnerability.description')}
                  </p>
                  <a
                    href="mailto:support@wants.chat"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/30 transition-all"
                  >
                    <Fingerprint className="w-4 h-4" />
                    support@wants.chat
                  </a>
                </div>
              </div>
            </motion.div>
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
              <Shield className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">{t('legal.security.cta.title')}</h2>
              <p className="text-white/70 mb-6">
                {t('legal.security.cta.subtitle')}
              </p>
              <a
                href="mailto:support@wants.chat"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all"
              >
                {t('legal.security.cta.contactSecurityTeam')}
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SecurityPage;
