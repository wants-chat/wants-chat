import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Bug,
  CreditCard,
  User,
  Lightbulb,
  HelpCircle as HelpIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supportApi, SupportType } from '@/lib/api/support-api';

interface SupportFormData {
  name: string;
  email: string;
  supportType: SupportType;
  subject: string;
  message: string;
}

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left hover:text-emerald-400 transition-colors"
        onClick={onToggle}
      >
        <span className="font-medium text-white">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/60 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pb-4 text-white/70 leading-relaxed"
        >
          {answer}
        </motion.div>
      )}
    </div>
  );
};

const getSupportTypes = (t: (key: string) => string): { value: SupportType; label: string; icon: React.ReactNode }[] => [
  { value: 'technical_issue', label: t('support.supportTypes.technicalIssue'), icon: <Bug className="w-4 h-4" /> },
  { value: 'billing', label: t('support.supportTypes.billingQuestion'), icon: <CreditCard className="w-4 h-4" /> },
  { value: 'account', label: t('support.supportTypes.accountRelated'), icon: <User className="w-4 h-4" /> },
  { value: 'feature_request', label: t('support.supportTypes.featureRequest'), icon: <Lightbulb className="w-4 h-4" /> },
  { value: 'bug_report', label: t('support.supportTypes.bugReport'), icon: <Bug className="w-4 h-4" /> },
  { value: 'general', label: t('support.supportTypes.generalQuestion'), icon: <HelpIcon className="w-4 h-4" /> },
];

const getFaqs = (t: (key: string) => string) => [
  {
    question: t('support.faq.items.gettingStarted.question'),
    answer: t('support.faq.items.gettingStarted.answer'),
  },
  {
    question: t('support.faq.items.changeSubscription.question'),
    answer: t('support.faq.items.changeSubscription.answer'),
  },
  {
    question: t('support.faq.items.syncData.question'),
    answer: t('support.faq.items.syncData.answer'),
  },
  {
    question: t('support.faq.items.dataSecurity.question'),
    answer: t('support.faq.items.dataSecurity.answer'),
  },
  {
    question: t('support.faq.items.cancelSubscription.question'),
    answer: t('support.faq.items.cancelSubscription.answer'),
  },
  {
    question: t('support.faq.items.exportData.question'),
    answer: t('support.faq.items.exportData.answer'),
  },
];

export default function SupportPage() {
  const { t } = useTranslation();
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [formData, setFormData] = useState<SupportFormData>({
    name: '',
    email: '',
    supportType: 'general',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const supportTypes = getSupportTypes(t);
  const faqs = getFaqs(t);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSupportTypeChange = (value: SupportType) => {
    setFormData({
      ...formData,
      supportType: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await supportApi.submitSupportRequest(formData);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        supportType: 'general',
        subject: '',
        message: '',
      });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t('support.form.errorDefault')
      );
      console.error('Support form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-xl shadow-emerald-500/30 mb-6">
              <HelpCircle className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              {t('support.title')}
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              {t('support.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Support Form Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Support Form */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {t('support.submitTicket')}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name and Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">
                          {t('contact.form.name')} *
                        </Label>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={t('support.form.namePlaceholder')}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">
                          {t('contact.form.email')} *
                        </Label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={t('support.form.emailPlaceholder')}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>

                    {/* Support Type Dropdown */}
                    <div className="space-y-2">
                      <Label htmlFor="supportType" className="text-white">
                        {t('support.form.supportTypeLabel')} *
                      </Label>
                      <Select
                        value={formData.supportType}
                        onValueChange={handleSupportTypeChange}
                      >
                        <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder={t('support.form.supportTypePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {supportTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                {type.icon}
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-white">
                        {t('contact.form.subject')} *
                      </Label>
                      <Input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder={t('support.form.subjectPlaceholder')}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-white">
                        {t('contact.form.message')} *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={t('support.form.messagePlaceholder')}
                        className="w-full resize-none bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {t('contact.form.sending')}
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          {t('contact.form.send')}
                        </>
                      )}
                    </Button>

                    {/* Success Message */}
                    {submitStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-300">
                          {t('contact.success')}
                        </span>
                      </motion.div>
                    )}

                    {/* Error Message */}
                    {submitStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-300">{errorMessage}</span>
                      </motion.div>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                {/* Contact Details Card */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold text-white mb-6">
                      {t('support.contactSupport')}
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Mail className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {t('contact.info.email')}
                          </p>
                          <a
                            href="mailto:support@wants.chat"
                            className="text-emerald-400 hover:underline"
                          >
                            support@wants.chat
                          </a>
                        </div>
                      </div>
                    </div>
                    <p className="mt-6 text-sm text-white/60">
                      {t('support.responseTimeNote')}
                    </p>
                  </CardContent>
                </Card>

                {/* Response Time Card */}
                <Card className="border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      {t('support.responseTimes.title')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">
                          {t('support.responseTimes.generalQuestions')}
                        </span>
                        <span className="font-medium text-white">{t('support.responseTimes.generalTime')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">
                          {t('support.responseTimes.technicalIssues')}
                        </span>
                        <span className="font-medium text-white">{t('support.responseTimes.technicalTime')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">
                          {t('support.responseTimes.billingIssues')}
                        </span>
                        <span className="font-medium text-white">{t('support.responseTimes.billingTime')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                {t('support.faq.title')}
              </h2>
              <p className="text-white/70">
                {t('support.subtitle')}
              </p>
            </div>

            <Card className="border-white/10 bg-white/5 backdrop-blur-sm shadow-sm">
              <CardContent className="p-6">
                <div className="divide-y divide-white/10 space-y-0">
                  {faqs.map((faq, index) => (
                    <FAQItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={openFAQ === index}
                      onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
