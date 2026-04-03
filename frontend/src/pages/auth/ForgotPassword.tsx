import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Mail, Sparkles, Shield, Key, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.requestPasswordReset({ email });
      sessionStorage.setItem('resetEmail', email);
      setIsSubmitted(true);
    } catch (err: any) {
      setIsSubmitted(true);
      sessionStorage.setItem('resetEmail', email);
    } finally {
      setIsLoading(false);
    }
  };

  // Floating icons for background animation
  const floatingIcons = [
    { Icon: Key, color: 'text-amber-400', delay: 0, x: '15%', y: '25%' },
    { Icon: Shield, color: 'text-emerald-400', delay: 0.5, x: '75%', y: '20%' },
    { Icon: Mail, color: 'text-cyan-400', delay: 1, x: '20%', y: '70%' },
    { Icon: Sparkles, color: 'text-rose-400', delay: 1.5, x: '80%', y: '75%' },
  ];

  const BackgroundAnimation = () => (
    <div className="absolute inset-0 bg-gray-950">
      {/* Animated gradient orbs - matching landing page */}
      <motion.div
        className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -30, 0],
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
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, color, delay, x, y }, index) => (
        <motion.div
          key={index}
          className={`absolute ${color} opacity-10`}
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.05, 0.15, 0.05],
            scale: [1, 1.2, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon className="w-12 h-12" />
        </motion.div>
      ))}

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <BackgroundAnimation />

        <motion.div
          className="w-full max-w-md px-4 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/assets/logo.png" alt="Wants" className="h-10 w-10" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Wants</span>
            </Link>
          </div>

          {/* Glass Card - matching landing page style */}
          <motion.div
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5, delay: 0.3 }}
                className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30"
              >
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2">{t('auth.forgotPassword.success')}</h2>
              <p className="text-gray-400 mb-2">
                {t('auth.forgotPassword.successSubtitle', { defaultValue: "We've sent password reset instructions to:" })}
              </p>
              <p className="text-emerald-400 font-medium mb-6">{email}</p>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
                <p className="text-sm text-cyan-200">
                  <strong>Didn't receive the email?</strong> Check your spam folder or try resending.
                </p>
              </div>

              <div className="space-y-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full h-12 bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700 rounded-xl"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Try another email
                  </Button>
                </motion.div>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300 transition-colors pt-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('auth.forgotPassword.backToLogin')}
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <BackgroundAnimation />

      <motion.div
        className="w-full max-w-md px-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/assets/logo.png" alt="Wants" className="h-10 w-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Wants</span>
          </Link>
        </div>

        {/* Glass Card - matching landing page style */}
        <motion.div
          className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5, delay: 0.3 }}
                className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30"
              >
                <Key className="h-8 w-8 text-emerald-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('auth.forgotPassword.title')}</h2>
              <p className="text-gray-400">
                {t('auth.forgotPassword.subtitle')}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 mb-6"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">{t('auth.forgotPassword.email')}</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl h-12 pl-12"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
                <p className="text-xs text-gray-500">
                  Enter the email associated with your account
                </p>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('auth.forgotPassword.sending')}
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      {t('auth.forgotPassword.sendLink')}
                    </>
                  )}
                </Button>
              </motion.div>

              <div className="flex items-center justify-center gap-4 text-sm pt-2">
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-gray-300 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('auth.forgotPassword.backToLogin')}
                </Link>
                <span className="text-gray-600">|</span>
                <Link
                  to="/signup"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {t('auth.signup.createAccount')}
                </Link>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Security note */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <Shield className="h-4 w-4" />
            <span>Your security is our priority</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
