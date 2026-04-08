import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowUp, Github, Linkedin, Facebook } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import XIcon from '@mui/icons-material/X';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    // If not on landing page, navigate to it first
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }

    // Scroll to section
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.error(t('footer.toast.emailRequired'));
      return;
    }

    if (!validateEmail(email)) {
      toast.error(t('footer.toast.invalidEmail'));
      return;
    }

    try {
      setIsSubscribing(true);

      const response = await api.post<{ success: boolean; message: string }>(
        '/notifications/newsletter/subscribe',
        { email, source: 'website' }
      );

      if (response.success) {
        toast.success(response.message || t('footer.toast.subscribeSuccess'));
        setEmail('');
      } else {
        toast.error(response.message || t('footer.toast.subscribeFailed'));
      }
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast.error(error?.message || t('footer.toast.subscribeError'));
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubscribe();
    }
  };

  return (
    <footer className="relative overflow-hidden bg-gray-950">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]"
        animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <img src="/assets/logo.png" alt="Wants" className="h-10 w-10 rounded-lg" />
                <span className="text-2xl font-bold text-white">Wants</span>
                <div className="relative flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 rounded-full backdrop-blur-sm border border-blue-400/40 shadow-sm shadow-blue-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-white">
                    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                  </svg>
                  <span className="text-[9px] font-bold text-white uppercase tracking-wider pr-0.5">Beta</span>
                </div>
              </div>
              <p className="text-base text-white/70 mb-6 max-w-md leading-relaxed">
                {t('footer.tagline')}
              </p>

              {/* Social Links */}
              <div className="flex space-x-3">
                <a
                  href="https://x.com/InfoInlet2019"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="p-3 rounded-xl bg-gray-800/50 hover:bg-emerald-500 text-white/80 hover:text-white transition-all duration-300 hover:scale-110 border border-gray-700"
                >
                  <XIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/infoinlet-com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-3 rounded-xl bg-gray-800/50 hover:bg-emerald-500 text-white/80 hover:text-white transition-all duration-300 hover:scale-110 border border-gray-700"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/company/info-inlet"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-3 rounded-xl bg-gray-800/50 hover:bg-emerald-500 text-white/80 hover:text-white transition-all duration-300 hover:scale-110 border border-gray-700"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://www.facebook.com/infoinlet"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="p-3 rounded-xl bg-gray-800/50 hover:bg-emerald-500 text-white/80 hover:text-white transition-all duration-300 hover:scale-110 border border-gray-700"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-base mb-6 text-white">{t('footer.product')}</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/features" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('common.features')}
                  </Link>
                </li>
                <li>
                  <Link to="/tools" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('footer.allTools')}
                  </Link>
                </li>
                <li>
                  <Link to="/integrations" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('footer.integrations')}
                  </Link>
                </li>
                <li>
                  <Link to="/changelog" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('footer.changelog')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Solutions Links */}
            <div>
              <h4 className="font-semibold text-base mb-6 text-white">{t('footer.solutions')}</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/solutions/business" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('solutions.business')}
                  </Link>
                </li>
                <li>
                  <Link to="/solutions/healthcare" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('solutions.healthcare')}
                  </Link>
                </li>
                <li>
                  <Link to="/solutions/legal" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('solutions.legal')}
                  </Link>
                </li>
                <li>
                  <Link to="/solutions/education" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('solutions.education')}
                  </Link>
                </li>
                <li>
                  <Link to="/solutions/enterprise" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('solutions.enterprise')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-base mb-6 text-white">{t('footer.company')}</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('common.about')}
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('common.blog')}
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('footer.careers')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('common.contact')}
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('common.support')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-base mb-6 text-white">{t('footer.legal')}</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/privacy" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('footer.privacy')}
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('footer.terms')}
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('footer.cookies')}
                  </Link>
                </li>
                <li>
                  <Link to="/data-deletion" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('footer.dataDeletion')}
                  </Link>
                </li>
                <li>
                  <Link to="/security" className="text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    {t('footer.security')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-10 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left max-w-md">
              <h4 className="font-semibold text-lg mb-3 text-white">{t('footer.newsletter')}</h4>
              <p className="text-white/70">
                {t('footer.newsletterSubtitle')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSubscribing}
                className="px-5 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-72 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              />
              <button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium text-sm hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 whitespace-nowrap hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-emerald-500/25"
              >
                {isSubscribing ? t('footer.subscribing') : t('footer.subscribe')}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm text-white/60 text-center sm:text-left">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>

            <div className="flex items-center gap-4">
              <LanguageSwitcher variant="footer" />
              <button
                onClick={scrollToTop}
                className="p-3 rounded-xl bg-gray-800/50 hover:bg-emerald-500 text-white/80 hover:text-white transition-all duration-300 group hover:scale-110 border border-gray-700"
                aria-label="Scroll to top"
              >
                <ArrowUp className="h-4 w-4 group-hover:-translate-y-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
