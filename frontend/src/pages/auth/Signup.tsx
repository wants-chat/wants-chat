import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, Eye, EyeOff, Loader2, Check, X, Sparkles, Heart, Brain, Wallet, Plane, Users, Zap, Shield, Star, Rocket, Globe } from 'lucide-react';
import { FaGoogle, FaGithub, FaApple } from 'react-icons/fa';
import { SEO } from '../../components/SEO';
import { PAGE_SEO } from '../../config/seo';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import * as organizationApi from '../../services/organizationApi';

// Helper to extract invitation token from various sources
function getInvitationToken(searchParams: URLSearchParams): string | null {
  const inviteParam = searchParams.get('invite') || searchParams.get('invitation');
  if (inviteParam) return inviteParam;

  const redirectParam = searchParams.get('redirect');
  if (redirectParam) {
    const inviteMatch = redirectParam.match(/\/invite\/([^/?]+)/);
    if (inviteMatch) return inviteMatch[1];
  }

  const pendingToken = localStorage.getItem('pendingInviteToken');
  if (pendingToken) return pendingToken;

  return null;
}

interface InvitationInfo {
  token: string;
  organizationName?: string;
  invitedEmail?: string;
  isValid: boolean;
}

const Signup: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null);

  // Check for invitation token on mount
  useEffect(() => {
    const checkInvitation = async () => {
      const token = getInvitationToken(searchParams);
      if (token) {
        try {
          const inviteDetails = await organizationApi.getInvitationByToken(token);
          if (inviteDetails && inviteDetails.is_valid) {
            setInvitationInfo({
              token,
              organizationName: inviteDetails.organization_name,
              invitedEmail: inviteDetails.email,
              isValid: true,
            });
            if (inviteDetails.email) {
              setFormData(prev => ({ ...prev, email: inviteDetails.email }));
            }
          } else {
            setInvitationInfo({ token, isValid: false });
            toast.warning('This invitation link has expired or is invalid');
          }
        } catch (err) {
          console.warn('Failed to fetch invitation details:', err);
          setInvitationInfo({ token, isValid: true });
        }
      }
    };
    checkInvitation();
  }, [searchParams]);

  const handleSocialSignUp = async (provider: string) => {
    setSocialLoading(provider);

    try {
      // Save pending invite token to localStorage before OAuth redirect
      if (invitationInfo?.token) {
        localStorage.setItem('pendingInviteToken', invitationInfo.token);
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const frontendUrl = window.location.origin;

      switch (provider) {
        case 'github':
          window.location.href = `${apiUrl}/api/v1/auth/oauth/github?frontendUrl=${encodeURIComponent(frontendUrl)}`;
          break;
        case 'google':
          window.location.href = `${apiUrl}/api/v1/auth/oauth/google?frontendUrl=${encodeURIComponent(frontendUrl)}`;
          break;
        case 'apple':
          window.location.href = `${apiUrl}/api/v1/auth/oauth/apple?frontendUrl=${encodeURIComponent(frontendUrl)}`;
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (err: any) {
      console.error(`${provider} sign-up failed:`, err);
      setError(`Failed to sign up with ${provider}. Please try again.`);
      setSocialLoading('');
    }
  };

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordRequirements.every(req => req.met)) {
      setError('Password does not meet all requirements');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    // Check email mismatch with invitation
    if (invitationInfo?.invitedEmail && formData.email.toLowerCase() !== invitationInfo.invitedEmail.toLowerCase()) {
      setError(`Please use the invited email address: ${invitationInfo.invitedEmail}`);
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.email, formData.password, formData.name);

      // Check if there's a pending invitation to accept
      if (invitationInfo?.token && invitationInfo.isValid) {
        try {
          const result = await organizationApi.acceptInvitation(invitationInfo.token);
          localStorage.removeItem('pendingInviteToken');

          toast.success(
            `Welcome to ${result.organization_name || invitationInfo.organizationName || 'the team'}!`,
            { description: `You've joined as ${result.role || 'member'}` }
          );

          if (result.organization_id) {
            navigate(`/organizations/${result.organization_id}`, { replace: true });
            return;
          }
        } catch (inviteErr: any) {
          console.error('Failed to accept invitation:', inviteErr);
          localStorage.removeItem('pendingInviteToken');

          toast.warning('Could not accept invitation', {
            description: inviteErr.message || 'The invitation may have expired'
          });
        }
      }

      navigate('/chat', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  // Floating icons for background animation
  const floatingIcons = [
    { Icon: Heart, color: 'text-rose-400', delay: 0, x: '10%', y: '20%' },
    { Icon: Brain, color: 'text-emerald-400', delay: 0.5, x: '80%', y: '15%' },
    { Icon: Wallet, color: 'text-cyan-400', delay: 1, x: '15%', y: '70%' },
    { Icon: Plane, color: 'text-emerald-400', delay: 1.5, x: '75%', y: '75%' },
    { Icon: Sparkles, color: 'text-amber-400', delay: 2, x: '50%', y: '10%' },
  ];

  return (
    <>
      <SEO
        title={PAGE_SEO.signup.title}
        description={PAGE_SEO.signup.description}
        url={PAGE_SEO.signup.url}
        noindex={true}
      />

      <div className="min-h-screen flex relative overflow-hidden">
        {/* Animated Background - matching landing page */}
        <div className="absolute inset-0 bg-gray-950">
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl"
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

        {/* Left Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10 py-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
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
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="p-8">
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
                    className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30"
                  >
                    <Rocket className="h-8 w-8 text-emerald-400" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">{t('auth.signup.title')}</h2>
                  <p className="text-gray-400">{t('auth.signup.subtitle')}</p>
                  {/* Invitation indicator */}
                  {invitationInfo?.isValid && invitationInfo.organizationName && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm">
                        Joining <span className="font-semibold">{invitationInfo.organizationName}</span>
                      </span>
                    </motion.div>
                  )}
                  {invitationInfo?.token && !invitationInfo.isValid && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2"
                    >
                      <span className="text-amber-400 text-sm">
                        Invitation link may be invalid or expired
                      </span>
                    </motion.div>
                  )}
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

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                  <motion.button
                    type="button"
                    onClick={() => handleSocialSignUp('google')}
                    disabled={isLoading || socialLoading !== ''}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {socialLoading === 'google' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <FaGoogle className="h-5 w-5 text-red-500" />
                        <span>{t('auth.oauth.google')}</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => handleSocialSignUp('github')}
                    disabled={isLoading || socialLoading !== ''}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 border border-gray-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {socialLoading === 'github' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <FaGithub className="h-5 w-5" />
                        <span>{t('auth.oauth.github')}</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => handleSocialSignUp('apple')}
                    disabled={isLoading || socialLoading !== ''}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 border border-gray-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {socialLoading === 'apple' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <FaApple className="h-5 w-5" />
                        <span>{t('auth.oauth.apple')}</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 text-gray-500 bg-gray-900/50">{t('auth.signup.orContinueWith')}</span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">{t('auth.signup.name')}</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">{t('auth.signup.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">{t('auth.signup.password')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
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
                    <Label htmlFor="confirmPassword" className="text-gray-300">{t('auth.signup.confirmPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
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

                  <div className="flex items-start gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 rounded border-gray-700 bg-gray-800/50 text-emerald-500 focus:ring-emerald-500/20"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      disabled={isLoading}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-400">
                      {t('auth.signup.agreeToTerms')}
                    </label>
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200"
                      disabled={isLoading || !agreedToTerms}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('auth.signup.creating')}
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          {t('auth.signup.createAccount')}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>

                <p className="text-center text-gray-400 mt-6">
                  {t('auth.signup.haveAccount')}{' '}
                  <Link
                    to={invitationInfo?.token ? `/login?invite=${invitationInfo.token}` : '/login'}
                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    {t('auth.signup.signIn')}
                  </Link>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Panel - Branding (hidden on mobile) */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center items-center p-12"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="max-w-md text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
                <img src="/assets/logo.png" alt="Wants" className="h-20 w-20 mx-auto mb-4" />
                <span className="text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-medium">Wants</span>
              </Link>
              <h1 className="text-5xl font-bold text-white mb-4 mt-4">
                {t('auth.branding.joinWants')} <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t('auth.branding.wants')}</span>
              </h1>
              <p className="text-xl text-gray-400">
                {t('auth.branding.tagline')}
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {[
                { value: '1000+', label: t('auth.branding.aiTools'), icon: Zap },
                { value: '30+', label: t('auth.branding.aiModels'), icon: Globe },
                { value: '4.9', label: t('auth.branding.rating'), icon: Star },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05, borderColor: 'rgba(16, 185, 129, 0.3)' }}
                >
                  <stat.icon className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Features list */}
            <motion.div
              className="mt-8 text-left space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {[
                t('auth.branding.feature1'),
                t('auth.branding.feature2'),
                t('auth.branding.feature3'),
                t('auth.branding.feature4')
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-gray-400">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-emerald-400" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* Testimonial */}
            <motion.div
              className="mt-8 p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-gray-300 italic mb-4">
                "{t('auth.branding.testimonial')}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                  S
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">Sarah M.</div>
                  <div className="text-gray-500 text-sm">{t('auth.branding.premiumMember')}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Signup;
