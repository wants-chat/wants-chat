import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronRight,
  Sparkles,
  Heart,
  Brain,
  Briefcase,
  Wrench,
  Shield,
  Camera,
  Home,
  Smartphone,
  Calculator,
  Music,
  Cpu,
  Crown,
  PartyPopper,
  Clock,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppPreferences, APP_CATEGORIES } from '@/contexts/AppPreferencesContext';
import { useSubscription } from '@/lib/api/billing-api';
import { getPlanConfig, hasUnlimitedApps } from '@/constants/subscription';
import type { PlanType } from '@/constants/subscription';
import { toast } from 'sonner';
import { api } from '@/lib/api';

// App metadata with icons and colors
const APP_METADATA: Record<string, { name: string; icon: string; color: string }> = {
  // Life Management
  'habit-tracker': { name: 'Habit Tracker', icon: 'Target', color: 'bg-green-500' },
  meditation: { name: 'Meditation', icon: 'Heart', color: 'bg-purple-500' },
  fitness: { name: 'Fitness', icon: 'Dumbbell', color: 'bg-orange-500' },
  'calories-tracker': { name: 'Calories Tracker', icon: 'Apple', color: 'bg-red-500' },
  'health-tracker': { name: 'Health Tracker', icon: 'Activity', color: 'bg-pink-500' },
  'recipe-builder': { name: 'Recipe Builder', icon: 'ChefHat', color: 'bg-amber-500' },
  'expense-tracker': { name: 'Expense Tracker', icon: 'Wallet', color: 'bg-emerald-500' },
  'currency-converter': { name: 'Currency Converter', icon: 'Coins', color: 'bg-yellow-500' },
  'travel-planner': { name: 'Travel Planner', icon: 'Plane', color: 'bg-sky-500' },
  'language-learner': { name: 'Language Learner', icon: 'Languages', color: 'bg-indigo-500' },
  blog: { name: 'Blog', icon: 'PenTool', color: 'bg-rose-500' },
  todo: { name: 'Todo List', icon: 'CheckSquare', color: 'bg-blue-500' },

  // AI Tools
  'ai-image-generator': { name: 'AI Image Generator', icon: 'Image', color: 'bg-purple-500' },
  'ai-translator': { name: 'AI Translator', icon: 'Languages', color: 'bg-cyan-500' },
  'ai-text-to-speech': { name: 'AI Text to Speech', icon: 'Volume2', color: 'bg-green-500' },
  'ai-speech-to-text': { name: 'AI Speech to Text', icon: 'Mic', color: 'bg-orange-500' },
  'ai-resume-builder': { name: 'AI Resume Builder', icon: 'FileText', color: 'bg-indigo-500' },
  'ai-cover-letter': { name: 'AI Cover Letter', icon: 'Mail', color: 'bg-blue-500' },
  'ai-email-composer': { name: 'AI Email Composer', icon: 'Send', color: 'bg-cyan-500' },
  'ai-social-captions': { name: 'AI Social Captions', icon: 'MessageSquare', color: 'bg-pink-500' },
  'ai-hashtag-generator': { name: 'AI Hashtag Generator', icon: 'Hash', color: 'bg-violet-500' },
  'ai-video-script': { name: 'AI Video Script', icon: 'Video', color: 'bg-red-500' },
  'ai-meeting-notes': { name: 'AI Meeting Notes', icon: 'Users', color: 'bg-teal-500' },
  'ai-study-notes': { name: 'AI Study Notes', icon: 'GraduationCap', color: 'bg-amber-500' },
  'ai-contract-analyzer': { name: 'AI Contract Analyzer', icon: 'FileSearch', color: 'bg-rose-500' },
  'ai-legal-document': { name: 'AI Legal Document', icon: 'Scale', color: 'bg-slate-500' },
  'ai-tax-calculator': { name: 'AI Tax Calculator', icon: 'Calculator', color: 'bg-emerald-500' },
  'ai-investment-advisor': { name: 'AI Investment Advisor', icon: 'TrendingUp', color: 'bg-sky-500' },

  // Productivity
  notes: { name: 'Notes', icon: 'StickyNote', color: 'bg-yellow-500' },
  'password-manager': { name: 'Password Manager', icon: 'Lock', color: 'bg-red-500' },
  'ebook-reader': { name: 'eBook Reader', icon: 'BookOpen', color: 'bg-amber-500' },
  'billing-system': { name: 'Billing System', icon: 'Receipt', color: 'bg-green-500' },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Life Management': <Heart className="w-5 h-5" />,
  'AI Tools': <Brain className="w-5 h-5" />,
  Productivity: <Briefcase className="w-5 h-5" />,
  'Developer Tools': <Cpu className="w-5 h-5" />,
  Utilities: <Wrench className="w-5 h-5" />,
  'Media & Entertainment': <Music className="w-5 h-5" />,
  'Security & Privacy': <Shield className="w-5 h-5" />,
  'Sensors & Detection': <Smartphone className="w-5 h-5" />,
  'Calculators & Tools': <Calculator className="w-5 h-5" />,
  'Camera Utilities': <Camera className="w-5 h-5" />,
  'Home & Life': <Home className="w-5 h-5" />,
};

// Web-available categories (excluding mobile-only)
const WEB_CATEGORIES = ['Life Management', 'AI Tools', 'Productivity', 'Home & Life'];

interface TrialStatus {
  isTrialActive: boolean;
  daysRemaining: number;
  trialEnded: boolean;
  needsAppSelection: boolean;
}

const AppSelectionOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { updateSelectedApps, setAppOnboardingCompleted, isLoading: prefsLoading } = useAppPreferences();
  const { data: subscription, isLoading: subLoading } = useSubscription();

  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string>('Life Management');
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);

  // Fetch trial status
  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        const response = await api.get('/users/trial-status');
        // Handle both response.data wrapper and direct response
        const data = response?.data || response;
        setTrialStatus({
          isTrialActive: data?.isTrialActive ?? true,
          daysRemaining: data?.daysRemaining ?? 14,
          trialEnded: data?.trialEnded ?? false,
          needsAppSelection: data?.needsAppSelection ?? false,
        });
      } catch (error) {
        console.error('Failed to fetch trial status:', error);
        // Default to trial active for new users
        setTrialStatus({ isTrialActive: true, daysRemaining: 14, trialEnded: false, needsAppSelection: false });
      }
    };
    fetchTrialStatus();
  }, []);

  const planType = (subscription?.plan || 'free') as PlanType;
  const planConfig = getPlanConfig(planType);

  // During trial, unlimited apps; after trial needs app selection based on plan
  const isTrialActive = trialStatus?.isTrialActive ?? true;
  // Free plan: 1 app after trial, Starter: 5 apps, Pro/Premium: unlimited (-1)
  const maxApps = isTrialActive ? -1 : planConfig.maxApps;
  const isUnlimited = isTrialActive || hasUnlimitedApps(planType);

  const canSelectMore = isUnlimited || selectedApps.size < maxApps;
  const remainingSlots = isUnlimited ? Infinity : maxApps - selectedApps.size;

  const toggleApp = (appId: string) => {
    setSelectedApps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        if (!canSelectMore && !prev.has(appId)) {
          toast.error(`You can only select ${maxApps} apps on the ${planConfig.name} plan`);
          return prev;
        }
        newSet.add(appId);
      }
      return newSet;
    });
  };

  const selectAllInCategory = (category: string) => {
    const categoryApps = APP_CATEGORIES[category as keyof typeof APP_CATEGORIES] || [];
    const webApps = categoryApps.filter((id) => APP_METADATA[id]);

    if (isUnlimited) {
      setSelectedApps((prev) => {
        const newSet = new Set(prev);
        webApps.forEach((id) => newSet.add(id));
        return newSet;
      });
    } else {
      const availableSlots = maxApps - selectedApps.size;
      const toAdd = webApps.filter((id) => !selectedApps.has(id)).slice(0, availableSlots);
      setSelectedApps((prev) => {
        const newSet = new Set(prev);
        toAdd.forEach((id) => newSet.add(id));
        return newSet;
      });
      if (toAdd.length < webApps.filter((id) => !selectedApps.has(id)).length) {
        toast.info(`Added ${toAdd.length} apps. Upgrade for more!`);
      }
    }
  };

  const handleContinue = async () => {
    if (selectedApps.size === 0) {
      toast.error('Please select at least one app');
      return;
    }

    try {
      setSaving(true);
      await updateSelectedApps(Array.from(selectedApps));
      await setAppOnboardingCompleted(true);
      toast.success('Apps selected successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save app selection');
    } finally {
      setSaving(false);
    }
  };

  if (subLoading || prefsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Choose Your Apps
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {isTrialActive
                  ? 'Select the apps you want to use. You can always change this later from settings.'
                  : (trialStatus?.needsAppSelection
                    ? 'Select 1 app to keep using for free'
                    : (isUnlimited
                      ? 'Select all the apps you want to use'
                      : `Select up to ${maxApps} apps for your ${planConfig.name} plan`))}
              </p>
            </div>
            <div className="text-right">
              <Badge
                className={`${
                  isTrialActive ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                  (isUnlimited ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/10')
                } text-white`}
              >
                {isTrialActive ? '14-Day Trial' : `${planConfig.name} Plan`}
              </Badge>
              {isTrialActive ? (
                <p className="text-white/60 text-sm mt-1">
                  {selectedApps.size} of 70 selected
                </p>
              ) : !isUnlimited && (
                <p className="text-white/60 text-sm mt-1">
                  {selectedApps.size} / {maxApps} selected
                </p>
              )}
            </div>
          </div>

          {/* Progress bar for limited plans */}
          {!isUnlimited && (
            <Progress
              value={(selectedApps.size / maxApps) * 100}
              className="mt-3 h-2 bg-white/10"
            />
          )}

          {/* 14-Day Trial Banner */}
          {isTrialActive && (
            <div className="mt-3 p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-emerald-500/20">
                  <PartyPopper className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-emerald-300 font-semibold">14-Day Free Trial</h3>
                    {trialStatus && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {trialStatus.daysRemaining} days left
                      </Badge>
                    )}
                  </div>
                  <p className="text-white/70 text-sm mt-1">
                    Select any apps you want! You have full access to all 70+ apps during your trial.
                    After trial: keep 1 app free or upgrade for unlimited.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trial Ended - Select 1 App Warning */}
          {trialStatus?.needsAppSelection && !isTrialActive && (
            <div className="mt-3 p-4 bg-amber-500/20 rounded-lg border border-amber-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-500/20">
                  <Info className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-amber-300 font-semibold">Trial Ended - Select Your Free App</h3>
                  <p className="text-white/70 text-sm mt-1">
                    Choose 1 app to continue using for free, or upgrade for unlimited access to all apps.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/billing')}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Upgrade
                </Button>
              </div>
            </div>
          )}

          {/* One-time lock warning (only for non-trial limited plans) */}
          {!isTrialActive && !trialStatus?.needsAppSelection && planConfig.hasOneTimeLock && (
            <div className="mt-3 p-3 bg-amber-500/20 rounded-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <p className="text-amber-200 text-sm">
                <strong>One-Time Selection:</strong> You won't be able to change your apps later
                on this plan. Choose carefully!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {WEB_CATEGORIES.map((category) => {
          const categoryApps = APP_CATEGORIES[category as keyof typeof APP_CATEGORIES] || [];
          const webApps = categoryApps.filter((id) => APP_METADATA[id]);
          const selectedInCategory = webApps.filter((id) => selectedApps.has(id)).length;

          return (
            <Card
              key={category}
              className="mb-4 bg-white/5 border-white/10 overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? '' : category)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    {CATEGORY_ICONS[category]}
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-medium">{category}</h3>
                    <p className="text-white/40 text-sm">
                      {selectedInCategory} of {webApps.length} selected
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectAllInCategory(category);
                    }}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Select All
                  </Button>
                  <ChevronRight
                    className={`w-5 h-5 text-white/40 transition-transform ${
                      expandedCategory === category ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Apps Grid */}
              <AnimatePresence>
                {expandedCategory === category && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 pt-0">
                      {webApps.map((appId) => {
                        const app = APP_METADATA[appId];
                        const isSelected = selectedApps.has(appId);

                        return (
                          <button
                            key={appId}
                            onClick={() => toggleApp(appId)}
                            disabled={!canSelectMore && !isSelected}
                            className={`relative p-4 rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-purple-500/20 border-purple-500 ring-2 ring-purple-500/50'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            } ${!canSelectMore && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <Check className="w-5 h-5 text-purple-400" />
                              </div>
                            )}
                            <div
                              className={`w-10 h-10 rounded-lg ${app?.color || 'bg-gray-500'} flex items-center justify-center mb-2`}
                            >
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-white text-sm font-medium text-left">
                              {app?.name || appId}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}

        {/* Upgrade prompt for limited plans */}
        {!isUnlimited && (
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 p-6 mt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-purple-500/20">
                <Crown className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Want access to all apps?</h3>
                <p className="text-white/60 text-sm mt-1">
                  Upgrade to Pro or Premium for unlimited app access, more AI requests, and
                  the ability to change your apps anytime.
                </p>
                <Button
                  onClick={() => navigate('/billing')}
                  className="mt-3 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  View Plans
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-white font-medium">
              {selectedApps.size} app{selectedApps.size !== 1 ? 's' : ''} selected
            </p>
            {!isUnlimited && remainingSlots > 0 && (
              <p className="text-white/40 text-sm">{remainingSlots} slots remaining</p>
            )}
          </div>
          <Button
            onClick={handleContinue}
            disabled={selectedApps.size === 0 || saving}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-8"
          >
            {saving ? 'Saving...' : 'Continue'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppSelectionOnboarding;
