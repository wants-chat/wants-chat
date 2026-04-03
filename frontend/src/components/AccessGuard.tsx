import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Clock, Crown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

interface AccessGuardProps {
  appId: string;
  appName: string;
  children: React.ReactNode;
}

/**
 * AccessGuard component - protects app routes based on subscription/trial status.
 * Similar to mobile's AccessGuard widget.
 */
const AccessGuard: React.FC<AccessGuardProps> = ({ appId, appName, children }) => {
  const navigate = useNavigate();
  const {
    canAccessApp,
    refreshTrialStatus,
    isTrialActive,
    needsAppSelection,
    freeAppSelected,
    isLoading,
  } = useSubscriptionContext();

  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);

      // Refresh trial status from server
      await refreshTrialStatus();

      // Check if user can access this app
      const access = canAccessApp(appId);
      setHasAccess(access);
      setIsChecking(false);
    };

    checkAccess();
  }, [appId, canAccessApp, refreshTrialStatus]);

  // Show loading state
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show access denied dialog
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8"
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-amber-500/20">
              {needsAppSelection ? (
                <Clock className="w-8 h-8 text-amber-400" />
              ) : (
                <Lock className="w-8 h-8 text-amber-400" />
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            {needsAppSelection ? 'Trial Ended' : 'Access Restricted'}
          </h2>

          {/* Description */}
          <p className="text-white/70 text-center mb-6">
            {needsAppSelection
              ? 'Your 14-day free trial has ended. Select 1 app to continue for free, or upgrade for unlimited access.'
              : `You don't have access to ${appName}. This app is not included in your current plan.`}
          </p>

          {/* Free app info */}
          {freeAppSelected && (
            <div className="mb-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-blue-400" />
                <p className="text-white/80">
                  Your free app: <span className="font-semibold">{freeAppSelected}</span>
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>

            {needsAppSelection ? (
              <Button
                onClick={() => navigate('/app-selector')}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
              >
                Select Free App
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/billing')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Access granted - render children
  return <>{children}</>;
};

export default AccessGuard;
