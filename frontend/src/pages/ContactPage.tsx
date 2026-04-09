// @ts-nocheck
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BusinessIcon from '@mui/icons-material/Business';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const contactInfo = [
    {
      icon: EmailIcon,
      titleKey: 'contact.info.email.title',
      details: 'support@wants.chat',
      descKey: 'contact.info.email.description'
    },
    {
      icon: PhoneIcon,
      titleKey: 'contact.info.phone.title',
      details: '+81-045-508-9779',
      descKey: 'contact.info.phone.description'
    },
    {
      icon: LocationOnIcon,
      titleKey: 'contact.info.visit.title',
      details: 'Nissho II 1F Room 1-B, 6-5-5 Nagatsuta, Midori-ku, Yokohama, Kanagawa, Japan',
      descKey: 'contact.info.visit.description'
    }
  ];

  const contactReasons = [
    {
      icon: SupportAgentIcon,
      titleKey: 'contact.reasons.support.title',
      descKey: 'contact.reasons.support.description'
    },
    {
      icon: BusinessIcon,
      titleKey: 'contact.reasons.business.title',
      descKey: 'contact.reasons.business.description'
    },
    {
      icon: HelpOutlineIcon,
      titleKey: 'contact.reasons.general.title',
      descKey: 'contact.reasons.general.description'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await api.post<{ success: boolean; message: string; ticketId?: string }>(
        '/contact',
        formData
      );

      if (response.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        toast.success(response.message || 'Message sent successfully!');

        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 5000);
      } else {
        setSubmitStatus('error');
        toast.error(response.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      toast.error(error?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
        {/* Hero Section */}
        <section className="py-20 px-4 relative overflow-hidden">
          {/* Background orbs */}
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

          <div className="container mx-auto max-w-6xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {t('contact.title')}
              </h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                {t('contact.subtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 px-4 relative z-10">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center hover:border-emerald-500/30 transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{t(info.titleKey)}</h3>
                  <p className="text-emerald-400 font-medium mb-2">{info.details}</p>
                  <p className="text-sm text-white/60">{t(info.descKey)}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Contact Reasons */}
        <section className="py-12 px-4 bg-gray-900/30">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                {t('contact.howCanWeHelp')}
              </h2>
              <p className="text-white/60">
                {t('contact.howCanWeHelpSubtitle')}
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              {contactReasons.map((reason, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center"
                >
                  <reason.icon className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">{t(reason.titleKey)}</h3>
                  <p className="text-sm text-white/60">{t(reason.descKey)}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  {t('contact.sendMessage')}
                </h2>
                <p className="text-white/60">
                  {t('contact.sendMessageSubtitle')}
                </p>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-white">
                        {t('contact.form.name')} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
                        {t('contact.form.email')} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2 text-white">
                      {t('contact.form.subject')} *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2 text-white">
                      {t('contact.form.message')} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  {submitStatus === 'success' && (
                    <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-lg">
                      {t('contact.success')}
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
                      {t('contact.error')}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 py-3 text-base bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        {t('contact.form.sending')}
                      </>
                    ) : (
                      <>
                        <SendIcon className="mr-2 h-5 w-5" />
                        {t('contact.form.send')}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-gray-900/30">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                {t('contact.faqTitle')}
              </h2>
              <p className="text-white/60">
                {t('contact.faqSubtitle')}
              </p>
            </motion.div>

            <div className="space-y-4">
              {['responseTime', 'phoneSupport', 'scheduleDemo', 'documentation'].map((faqKey, index) => (
                <motion.div
                  key={faqKey}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-emerald-500/30 transition-all"
                >
                  <h3 className="font-semibold text-lg mb-2 text-white">{t(`contact.faqs.${faqKey}.q`)}</h3>
                  <p className="text-white/60">{t(`contact.faqs.${faqKey}.a`)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
    </div>
  );
};

export default ContactPage;