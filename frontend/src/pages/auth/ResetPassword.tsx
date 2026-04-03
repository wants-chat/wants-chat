import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Loader2, Lock, Check, X, Shield, Sparkles, Key, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, [searchParams]);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'Contains number', met: /\d/.test(formData.password) },
    { label: 'Contains special character', met: /[!@#$%^&*]/.test(formData.password) },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordRequirements.every(req => req.met)) {
      setError('Password does not meet all requirements');
      return;
    }

    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.confirmPasswordReset({
        token,
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      sessionStorage.removeItem('resetEmail');
      setIsSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reset password';
      if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('expired')) {
        setError('This reset link has expired or is invalid. Please request a new one.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Floating icons for background animation
  const floatingIcons = [
    { Icon: Key, color: 'text-amber-400', delay: 0, x: '15%', y: '25%' },
    { Icon: Shield, color: 'text-emerald-400', delay: 0.5, x: '75%', y: '20%' },
    { Icon: Lock, color: 'text-cyan-400', delay: 1, x: '20%', y: '70%' },
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

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>
  );

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <BackgroundAnimation />

        <motion.div
          className="w-full max-w-md px-4 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/assets/logo.png" alt="Wants" className="h-10 w-10" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Wants</span>
            </Link>
          </div>

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

              <h2 className="text-2xl font-bold text-white mb-2">{t('auth.resetPassword.success')}</h2>
              <p className="text-gray-400 mb-6">
                {t('auth.resetPassword.successMessage', { defaultValue: 'Your password has been successfully reset. You can now log in with your new password.' })}
              </p>

              <p className="text-sm text-gray-500 mb-6">
                Redirecting to login page...
              </p>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200"
                  onClick={() => navigate('/login')}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  {t('auth.login.signIn')}
                </Button>
              </motion.div>
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/assets/logo.png" alt="Wants" className="h-10 w-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Wants</span>
          </Link>
        </div>

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
                <Lock className="h-8 w-8 text-emerald-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('auth.resetPassword.title')}</h2>
              <p className="text-gray-400">{t('auth.resetPassword.subtitle')}</p>
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">{t('auth.resetPassword.newPassword')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading || !token}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 grid grid-cols-2 gap-2"
                  >
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {req.met ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <X className="h-3 w-3 text-gray-600" />
                        )}
                        <span className={req.met ? 'text-emerald-400' : 'text-gray-500'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">{t('auth.resetPassword.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading || !token}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    Passwords do not match
                  </p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Passwords match
                  </p>
                )}
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200"
                  disabled={isLoading || !token}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('auth.resetPassword.resetting')}
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      {t('auth.resetPassword.reset')}
                    </>
                  )}
                </Button>
              </motion.div>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300 transition-colors pt-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('auth.forgotPassword.backToLogin')}
              </Link>
            </form>
          </div>
        </motion.div>

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

export default ResetPassword;
