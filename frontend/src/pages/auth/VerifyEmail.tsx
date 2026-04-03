import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Mail, RefreshCw, Shield, Sparkles, XCircle, Key } from 'lucide-react';
import { authService } from '../../services/authService';

type VerificationState = 'verifying' | 'success' | 'error' | 'expired' | 'invalid';

const VerifyEmail: React.FC = () => {
  const [verificationState, setVerificationState] = useState<VerificationState>('verifying');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hasVerified = useRef(false);
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (hasVerified.current) {
        return;
      }
      hasVerified.current = true;

      if (!token) {
        setVerificationState('invalid');
        setError('Invalid or missing verification token.');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setVerificationState('success');

        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Email verified successfully! Please sign in to continue.' }
          });
        }, 3000);
      } catch (err: any) {
        if (err.message?.includes('expired') || err.code === 'TOKEN_EXPIRED') {
          setVerificationState('expired');
          setError('This verification link has expired. Please request a new verification email.');
        } else if (err.message?.includes('invalid') || err.code === 'INVALID_TOKEN') {
          setVerificationState('invalid');
          setError('This verification link is invalid or has already been used.');
        } else {
          setVerificationState('error');
          setError(err.message || 'Email verification failed. Please try again.');
        }
      }
    };

    verifyEmailToken();
  }, [token, navigate]);

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setError(null);

    try {
      await authService.resendEmailVerification();
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  const floatingIcons = [
    { Icon: Key, color: 'text-yellow-400', delay: 0, x: '15%', y: '25%' },
    { Icon: Shield, color: 'text-blue-400', delay: 0.5, x: '75%', y: '20%' },
    { Icon: Mail, color: 'text-teal-400', delay: 1, x: '20%', y: '70%' },
    { Icon: Sparkles, color: 'text-rose-400', delay: 1.5, x: '80%', y: '75%' },
  ];

  const BackgroundAnimation = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      <motion.div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/30 rounded-full blur-[120px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/30 rounded-full blur-[120px]"
        animate={{
          x: [0, -40, 0],
          y: [0, -40, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {floatingIcons.map(({ Icon, color, delay, x, y }, index) => (
        <motion.div
          key={index}
          className={`absolute ${color} opacity-20`}
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
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

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
    </div>
  );

  const getStateConfig = () => {
    switch (verificationState) {
      case 'verifying':
        return {
          icon: <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />,
          bgColor: 'bg-teal-500/20 border-teal-500/30',
          title: 'Verifying Email',
          description: 'Please wait while we verify your email address...'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-10 w-10 text-emerald-400" />,
          bgColor: 'bg-emerald-500/20 border-emerald-500/30',
          title: 'Email Verified!',
          description: 'Your email address has been successfully verified.'
        };
      case 'expired':
        return {
          icon: <XCircle className="h-10 w-10 text-orange-400" />,
          bgColor: 'bg-orange-500/20 border-orange-500/30',
          title: 'Link Expired',
          description: 'This verification link has expired.'
        };
      case 'invalid':
        return {
          icon: <XCircle className="h-10 w-10 text-red-400" />,
          bgColor: 'bg-red-500/20 border-red-500/30',
          title: 'Invalid Link',
          description: 'This verification link is invalid or has already been used.'
        };
      default:
        return {
          icon: <XCircle className="h-10 w-10 text-red-400" />,
          bgColor: 'bg-red-500/20 border-red-500/30',
          title: 'Verification Failed',
          description: 'Something went wrong during email verification.'
        };
    }
  };

  const { icon, bgColor, title, description } = getStateConfig();

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
            <span className="text-2xl font-bold text-white">Wants</span>
          </Link>
        </div>

        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5, delay: 0.3 }}
              className={`w-20 h-20 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-6 border`}
            >
              {icon}
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-white/60 mb-6">{description}</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2 mb-6"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm text-left">{error}</span>
              </motion.div>
            )}

            {verificationState === 'verifying' && (
              <div className="py-4">
                <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                </div>
              </div>
            )}

            {verificationState === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-white/40">
                  Redirecting to login page...
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200"
                    onClick={() => navigate('/login')}
                  >
                    Continue to Login
                  </Button>
                </motion.div>
              </div>
            )}

            {(verificationState === 'expired' || verificationState === 'error') && (
              <div className="space-y-4">
                {resendSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">Verification email sent! Please check your inbox.</span>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="w-full h-12 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-200"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending Email...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-5 w-5" />
                          Send New Verification Email
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            )}

            {verificationState === 'invalid' && (
              <div className="space-y-4">
                <p className="text-sm text-white/40">
                  This verification link may have already been used or is no longer valid.
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-white/10 mt-6">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-white/60 hover:text-white/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 text-white/40 text-sm">
            <Shield className="h-4 w-4" />
            <span>Your security is our priority</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
