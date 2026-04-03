import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, Eye, EyeOff, Loader2, Sparkles, Heart, Brain, Wallet, Plane, Users, Zap, Shield, Check, Star, Globe } from 'lucide-react';
import { FaGoogle, FaGithub, FaApple } from 'react-icons/fa';
import { SEO } from '../../components/SEO';
import { PAGE_SEO } from '../../config/seo';
import { toast } from 'sonner';
import * as organizationApi from '../../services/organizationApi';

// Helper to extract invitation token from various sources
function getInvitationToken(searchParams: URLSearchParams, locationState: any): string | null {
  // Check URL params: ?invite=TOKEN or ?invitation=TOKEN
  const inviteParam = searchParams.get('invite') || searchParams.get('invitation');
  if (inviteParam) return inviteParam;

  // Check redirect param for /invite/TOKEN pattern
  const redirectParam = searchParams.get('redirect');
  if (redirectParam) {
    const inviteMatch = redirectParam.match(/\/invite\/([^/?]+)/);
    if (inviteMatch) return inviteMatch[1];
  }

  // Check location state from for /invite/TOKEN pattern
  const fromPath = locationState?.from?.pathname;
  if (fromPath) {
    const inviteMatch = fromPath.match(/\/invite\/([^/?]+)/);
    if (inviteMatch) return inviteMatch[1];
  }

  // Check localStorage for pending invitation
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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null);

  const from = (location.state as any)?.from?.pathname || '/chat';

  // Check for invitation token on mount
  useEffect(() => {
    const checkInvitation = async () => {
      const token = getInvitationToken(searchParams, location.state);
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
              setEmail(inviteDetails.email);
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
  }, [searchParams, location.state]);

  const handleSocialSignIn = async (provider: string) => {
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
      console.error(`${provider} sign-in failed:`, err);
      setError(`Failed to sign in with ${provider}. Please try again.`);
      setSocialLoading('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);

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

          if (inviteErr.message?.toLowerCase().includes('email') ||
              inviteErr.message?.toLowerCase().includes('mismatch')) {
            toast.error('Email mismatch', {
              description: 'The invitation was sent to a different email address'
            });
          } else {
            toast.warning('Could not accept invitation', {
              description: inviteErr.message || 'The invitation may have expired'
            });
          }
        }
      }

      // Navigate to chat after successful login
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login');
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
        title={PAGE_SEO.login.title}
        description={PAGE_SEO.login.description}
        url={PAGE_SEO.login.url}
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

        {/* Left Panel - Branding (hidden on mobile) */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center items-center p-12"
          initial={{ opacity: 0, x: -50 }}
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
                {t('auth.branding.welcomeBack')} <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t('auth.branding.back')}</span>
              </h1>
              <p className="text-xl text-gray-400">
                {t('auth.branding.tagline')}
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4 mt-8"
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
                  J
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">John D.</div>
                  <div className="text-gray-500 text-sm">{t('auth.branding.powerUser')}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
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

            {/* Glass Card */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="p-8">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5, delay: 0.3 }}
                    className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30"
                  >
                    <Sparkles className="h-8 w-8 text-emerald-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t('auth.login.title')}</h2>
                  <p className="text-gray-400">{t('auth.login.subtitle')}</p>
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
                    onClick={() => handleSocialSignIn('google')}
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
                    onClick={() => handleSocialSignIn('github')}
                    disabled={isLoading || socialLoading !== ''}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white border border-gray-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
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
                    onClick={() => handleSocialSignIn('apple')}
                    disabled={isLoading || socialLoading !== ''}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white border border-gray-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
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
                    <span className="px-4 text-gray-500 bg-gray-900/50">{t('auth.login.orContinueWith')}</span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">{t('auth.login.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-gray-300">{t('auth.login.password')}</Label>
                      <Link to="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                        {t('auth.login.forgotPassword')}
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-gray-700 bg-gray-800/50 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <label htmlFor="remember" className="text-sm text-gray-400">
                      {t('auth.login.rememberMe')}
                    </label>
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('auth.login.signingIn')}
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          {t('auth.login.signIn')}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>

                <p className="text-center text-gray-400 mt-6">
                  {t('auth.login.noAccount')}{' '}
                  <Link
                    to={invitationInfo?.token ? `/signup?invite=${invitationInfo.token}` : '/signup'}
                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    {t('auth.login.signUp')}
                  </Link>
                </p>
              </div>
            </motion.div>

            {/* Security badge */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                <Shield className="h-4 w-4" />
                <span>Secure login protected by encryption</span>
              </div>
            </motion.div>

            {/* Footer */}
            <p className="text-center text-gray-500 text-sm mt-4">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-gray-400 hover:text-gray-300 underline">Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-gray-400 hover:text-gray-300 underline">Privacy Policy</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
