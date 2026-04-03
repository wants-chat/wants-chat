import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import {
  ArrowRight,
  DollarSign,
  Sparkles,
  Calculator,
  QrCode,
  Image,
  BarChart3,
  FileText,
  Music,
  Video,
  Code2,
  Globe,
  Palette,
  Clock,
  Zap,
  Send,
  Search,
} from 'lucide-react';
import ToolRequestModal from './ToolRequestModal';

// Tool cards for the scrolling animation
const toolCards = [
  { name: 'Currency Converter', icon: DollarSign, color: 'from-emerald-500 to-cyan-500' },
  { name: 'AI Logo Generator', icon: Palette, color: 'from-violet-500 to-purple-500' },
  { name: 'Expense Tracker', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
  { name: 'BMI Calculator', icon: Calculator, color: 'from-amber-500 to-orange-500' },
  { name: 'QR Generator', icon: QrCode, color: 'from-rose-500 to-pink-500' },
  { name: 'Image Editor', icon: Image, color: 'from-indigo-500 to-violet-500' },
  { name: 'PDF Tools', icon: FileText, color: 'from-red-500 to-orange-500' },
  { name: 'Audio Converter', icon: Music, color: 'from-cyan-500 to-blue-500' },
  { name: 'Video Compressor', icon: Video, color: 'from-purple-500 to-pink-500' },
  { name: 'Code Generator', icon: Code2, color: 'from-emerald-500 to-teal-500' },
  { name: 'Web Scraper', icon: Globe, color: 'from-blue-500 to-indigo-500' },
  { name: 'Time Zone Converter', icon: Clock, color: 'from-amber-500 to-yellow-500' },
];

// Duplicate for seamless loop
const duplicatedCards = [...toolCards, ...toolCards];

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const fullText = t('landing.hero.demoText');

  // Typing animation effect
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => setShowResult(true), 500);
      }
    }, 80);

    // Reset animation after completion
    const resetTimeout = setTimeout(() => {
      setTypedText('');
      setShowResult(false);
    }, 12000);

    return () => {
      clearInterval(typingInterval);
      clearTimeout(resetTimeout);
    };
  }, []);

  // Restart typing animation
  useEffect(() => {
    if (typedText === '' && !showResult) {
      const startDelay = setTimeout(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
          if (currentIndex <= fullText.length) {
            setTypedText(fullText.slice(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(typingInterval);
            setTimeout(() => setShowResult(true), 500);
          }
        }, 80);

        return () => clearInterval(typingInterval);
      }, 1000);

      return () => clearTimeout(startDelay);
    }
  }, [typedText, showResult]);

  return (
    <section className="relative overflow-hidden bg-gray-950">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-[-200px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section 1: Main Hero */}
        <div className="min-h-[90vh] flex flex-col justify-center pt-20 pb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-300 tracking-wide">
                {t('landing.hero.badge')}
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight max-w-5xl mx-auto">
              <span className="text-white">{t('landing.hero.headline')}</span>
              <br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                {t('landing.hero.subheadline')}
              </span>
            </h1>
          </motion.div>

          {/* Scrolling Tool Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative mb-12 overflow-hidden"
          >
            {/* Gradient masks for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-950 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-950 to-transparent z-10" />

            {/* First row - scrolling left */}
            <motion.div
              className="flex gap-4 mb-4"
              animate={{ x: [0, -1920] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {duplicatedCards.map((tool, index) => (
                <div
                  key={`row1-${index}`}
                  className="flex-shrink-0 px-4 py-3 rounded-xl bg-gray-900/50 backdrop-blur-xl border border-gray-800 flex items-center gap-3 hover:border-gray-700 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center`}>
                    <tool.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-300 whitespace-nowrap">
                    {tool.name}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Second row - scrolling right */}
            <motion.div
              className="flex gap-4"
              animate={{ x: [-1920, 0] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 35,
                  ease: "linear",
                },
              }}
            >
              {[...duplicatedCards].reverse().map((tool, index) => (
                <div
                  key={`row2-${index}`}
                  className="flex-shrink-0 px-4 py-3 rounded-xl bg-gray-900/50 backdrop-blur-xl border border-gray-800 flex items-center gap-3 hover:border-gray-700 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center`}>
                    <tool.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-300 whitespace-nowrap">
                    {tool.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Use Cases Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-8"
          >
            <p className="text-lg text-gray-400">
              <span className="text-white">{t('landing.hero.categories.aiGeneration')}</span> {t('landing.hero.categories.aiGenerationDesc')} <span className="text-gray-500">|</span>{' '}
              <span className="text-white">{t('landing.hero.categories.devTools')}</span> <span className="text-gray-500">|</span>{' '}
              <span className="text-white">{t('landing.hero.categories.docsFiles')}</span> <span className="text-gray-500">|</span>{' '}
              <span className="text-white">{t('landing.hero.categories.finance')}</span> <span className="text-gray-500">|</span>{' '}
              <span className="text-white">{t('landing.hero.categories.health')}</span> <span className="text-gray-500">|</span>{' '}
              <span className="text-white">{t('landing.hero.categories.legal')}</span> <span className="text-gray-500">|</span>{' '}
              <span className="text-white">{t('landing.hero.categories.analytics')}</span> {t('landing.hero.categories.andMore')}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white group h-14 px-8 text-base shadow-lg shadow-emerald-500/25"
              onClick={() => navigate('/signup')}
            >
              {t('landing.hero.startFree')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800/50 h-14 px-8 text-base"
              onClick={() => navigate('/login')}
            >
              {t('landing.hero.tryDemo')}
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-6 justify-center text-sm text-gray-500"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              {t('landing.hero.trustNoCreditCard')}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              {t('landing.hero.trustToolsIncluded')}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              {t('landing.hero.trustCancelAnytime')}
            </span>
          </motion.div>

          {/* Can't find what you need? - Bold/Highlighted */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center"
          >
            <p className="text-base md:text-lg">
              <span className="text-white font-bold">{t('landing.hero.cantFindQuestion')}</span>{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
                {t('landing.hero.cantFindAnswer')}
              </span>
            </p>
            <motion.button
              onClick={() => setIsToolModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/25"
            >
              <Search className="w-4 h-4" />
              {t('landing.hero.browseAllTools')}
            </motion.button>
          </motion.div>
        </div>

        {/* Section 2: Intent-Driven Platform Demo */}
        <div className="py-24 border-t border-gray-800/50">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400 tracking-wide">
                {t('landing.hero.intentBadge')}
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-4xl mx-auto">
              <span className="text-white">{t('landing.hero.intentHeadline')}</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {t('landing.hero.intentSubheadline')}
              </span>
            </h2>
          </motion.div>

          {/* Demo Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-xl">
              {/* Browser Header */}
              <div className="bg-gray-900/90 border-b border-gray-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 bg-gray-800 rounded-lg px-3 flex items-center text-xs text-gray-400">
                    wants.chat
                  </div>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="p-6 sm:p-8 min-h-[400px] bg-gray-950/50">
                {/* Input Area */}
                <div className="mb-8">
                  <div className="relative">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-900 border border-gray-800">
                      <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <div className="flex-1 text-gray-300 text-lg">
                        {typedText}
                        <span className="inline-block w-0.5 h-5 bg-emerald-400 ml-1 animate-pulse"></span>
                      </div>
                      <button className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <Send className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Result Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{
                    opacity: showResult ? 1 : 0,
                    y: showResult ? 0 : 20,
                    scale: showResult ? 1 : 0.95
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-4"
                >
                  {/* AI Response */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm mb-4">
                        {t('landing.hero.demoResponse')}
                      </p>

                      {/* Currency Converter Tool Card */}
                      <div className="rounded-2xl bg-gray-900/80 border border-gray-800 overflow-hidden">
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{t('landing.hero.currencyConverter')}</h4>
                              <p className="text-xs text-gray-500">{t('landing.hero.realTimeRates')}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                            {t('landing.hero.live')}
                          </span>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center justify-between gap-4">
                            {/* From */}
                            <div className="flex-1 text-center">
                              <div className="text-3xl font-bold text-white mb-1">500.00</div>
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-2xl">🇺🇸</span>
                                <span className="text-gray-400 font-medium">USD</span>
                              </div>
                            </div>

                            {/* Arrow */}
                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                              <ArrowRight className="w-5 h-5 text-emerald-400" />
                            </div>

                            {/* To */}
                            <div className="flex-1 text-center">
                              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                                460.25
                              </div>
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-2xl">🇪🇺</span>
                                <span className="text-gray-400 font-medium">EUR</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-sm">
                            <span className="text-gray-500">{t('landing.hero.exchangeRate')}</span>
                            <span className="text-gray-300">1 USD = 0.9205 EUR</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Floating decoration elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl"
            />
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-gray-400 mb-6">
              {t('landing.hero.noMenus')}
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white group h-12 px-6 text-base shadow-lg shadow-emerald-500/25"
              onClick={() => navigate('/signup')}
            >
              {t('landing.hero.experienceIntentAI')}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Tool Request Modal */}
      <ToolRequestModal
        isOpen={isToolModalOpen}
        onClose={() => setIsToolModalOpen(false)}
      />
    </section>
  );
};

export default Hero;
