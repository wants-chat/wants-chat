import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';
import {
  BookOpen, Bell, Sparkles, ArrowRight, Clock, Rss,
  Twitter, Mail, Rocket, PenTool, Lightbulb, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const BlogPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Preview categories
  const categories = [
    { name: t('blog.categories.productUpdates'), icon: Rocket, color: 'from-emerald-500 to-cyan-500' },
    { name: t('blog.categories.aiTechnology'), icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { name: t('blog.categories.tipsTutorials'), icon: Lightbulb, color: 'from-orange-500 to-amber-500' },
    { name: t('blog.categories.companyNews'), icon: PenTool, color: 'from-blue-500 to-indigo-500' },
  ];

  // Coming soon features
  const upcomingTopics = [
    t('blog.upcomingTopics.topic1'),
    t('blog.upcomingTopics.topic2'),
    t('blog.upcomingTopics.topic3'),
    t('blog.upcomingTopics.topic4'),
    t('blog.upcomingTopics.topic5'),
    t('blog.upcomingTopics.topic6'),
  ];

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.error(t('blog.subscribe.errors.emailRequired'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('blog.subscribe.errors.invalidEmail'));
      return;
    }

    try {
      setIsSubscribing(true);
      const response = await api.post<{ success: boolean; message: string }>(
        '/notifications/newsletter/subscribe',
        { email, source: 'blog_page' }
      );

      if (response.success) {
        toast.success(response.message || t('blog.subscribe.success'));
        setEmail('');
      } else {
        toast.error(response.message || t('blog.subscribe.errors.failed'));
      }
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast.error(error?.message || t('blog.subscribe.errors.failed'));
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <>
      <SEO
        title={t('blog.seo.title')}
        description={t('blog.seo.description')}
        keywords="blog, articles, AI insights, product updates, tutorials, news"
      />

      <div className="min-h-screen bg-gray-950 text-white">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]"
            animate={{ x: [0, 80, 0], y: [0, -60, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]"
            animate={{ x: [0, -60, 0], y: [0, 80, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]"
            animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Coming Soon Badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-8"
              >
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">{t('blog.hero.badge')}</span>
              </motion.div>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center"
              >
                <BookOpen className="w-12 h-12 text-white" />
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  {t('blog.hero.title')}
                </span>
              </h1>

              <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12">
                {t('blog.hero.subtitle')}
              </p>

              {/* Animated dots */}
              <div className="flex justify-center gap-2 mb-12">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories Preview */}
        <section className="relative py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl font-bold mb-2">{t('blog.whatToExpect.title')}</h2>
              <p className="text-white/60">{t('blog.whatToExpect.subtitle')}</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-xl text-center hover:border-emerald-500/30 transition-all"
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-sm">{category.name}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Topics */}
        <section className="relative py-16 px-4">
          <div className="container mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white/5 border border-white/10 rounded-2xl"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                {t('blog.upcomingArticles.title')}
              </h3>
              <ul className="space-y-4">
                {upcomingTopics.map((topic, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-white/70"
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
                    <span>{topic}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Subscribe Section */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-center"
            >
              <Bell className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">{t('blog.subscribe.title')}</h2>
              <p className="text-white/70 mb-6">
                {t('blog.subscribe.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder={t('blog.subscribe.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                  disabled={isSubscribing}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('blog.subscribe.subscribing')}
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      {t('blog.subscribe.button')}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Social Links */}
        <section className="relative py-12 px-4">
          <div className="container mx-auto max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-white/60 mb-6">{t('blog.social.followUs')}</p>
              <div className="flex justify-center gap-4">
                <a
                  href="https://x.com/InfoInlet2019"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-emerald-500/30 transition-all"
                >
                  <Twitter className="w-5 h-5 text-white/70" />
                </a>
                <a
                  href="/changelog"
                  className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-emerald-500/30 transition-all"
                >
                  <Rss className="w-5 h-5 text-white/70" />
                </a>
                <a
                  href="mailto:support@wants.chat"
                  className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-emerald-500/30 transition-all"
                >
                  <Mail className="w-5 h-5 text-white/70" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogPage;
