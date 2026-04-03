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
  Home,
  Crown,
  Clock,
  Info,
  Lock,
  Unlock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APP_CATEGORIES, MOBILE_ONLY_APPS } from '@/contexts/AppPreferencesContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

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

  // Home & Life
  'home-repair': { name: 'Home Repair', icon: 'Wrench', color: 'bg-orange-500' },
  'pet-care': { name: 'Pet Care', icon: 'Heart', color: 'bg-pink-500' },
  'bill-reminder': { name: 'Bill Reminder', icon: 'Bell', color: 'bg-red-500' },
  'investment-tracker': { name: 'Investment Tracker', icon: 'TrendingUp', color: 'bg-green-500' },
  'event-reminder': { name: 'Event Reminder', icon: 'Calendar', color: 'bg-purple-500' },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Life Management': <Heart className="w-5 h-5" />,
  'AI Tools': <Brain className="w-5 h-5" />,
  Productivity: <Briefcase className="w-5 h-5" />,
  'Home & Life': <Home className="w-5 h-5" />,
};

// Web-available categories (excluding mobile-only)
const WEB_CATEGORIES = ['Life Management', 'AI Tools', 'Productivity', 'Home & Life'];

interface TrialStatus {
  isTrialActive: boolean;
  daysRemaining: number;
  trialEnded: boolean;
  needsAppSelection: boolean;
  freeAppSelected: string | null;
}

const AppSelectorPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string>('Life Management');
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  // Fetch trial status
  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/users/trial-status');
        const data = response.data || response;

        setTrialStatus({
          isTrialActive: data.isTrialActive ?? false,
          daysRemaining: data.daysRemaining ?? 0,
          trialEnded: data.trialEnded ?? false,
          needsAppSelection: data.needsAppSelection ?? false,
          freeAppSelected: data.freeAppSelected ?? null,
        });

        // If user already has a free app selected, show it and lock
        if (data.freeAppSelected) {
          setSelectedApp(data.freeAppSelected);
          setIsLocked(true);
        }

        // If trial is still active, redirect to dashboard
        if (data.isTrialActive) {
          toast.info('Your trial is still active! Enjoy full access.');
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Failed to fetch trial status:', error);
        toast.error('Failed to load trial status');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrialStatus();
  }, [navigate]);

  const toggleApp = (appId: string) => {
    if (isLocked) {
      toast.error('Your selection is locked. Upgrade to change your app.');
      return;
    }

    // Only allow selecting one app
    if (selectedApp === appId) {
      setSelectedApp(null);
    } else {
      setSelectedApp(appId);
    }
  };

  const handleSave = async () => {
    if (!selectedApp) {
      toast.error('Please select one app to continue');
      return;
    }

    try {
      setSaving(true);

      // Save the selected free app
      await api.request('/users/select-free-app', {
        method: 'POST',
        body: JSON.stringify({ appId: selectedApp }),
      });

      toast.success('App selected successfully!');
      setIsLocked(true);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Failed to save app selection:', error);
      toast.error('Failed to save app selection');
    } finally {
      setSaving(false);
    }
  };

  const handleUnselect = async () => {
    if (!isLocked) return;

    try {
      setSaving(true);

      // Unselect the free app
      await api.request('/users/unselect-free-app', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      setSelectedApp(null);
      setIsLocked(false);
      toast.success('App unselected. Choose a new app.');
    } catch (error) {
      console.error('Failed to unselect app:', error);
      toast.error('Failed to unselect app');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
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
                Choose Your Free App
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {isLocked
                  ? 'Your selection is locked. Upgrade to change or access more apps.'
                  : 'Select 1 app to keep using for free forever'}
              </p>
            </div>
            <div className="text-right">
              <Badge
                className={`${
                  isLocked
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-purple-500/20 text-purple-300'
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock className="w-3 h-3 mr-1" />
                    Locked
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3 mr-1" />
                    Select 1
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Trial Ended Banner */}
          <div className="mt-3 p-4 bg-amber-500/20 rounded-lg border border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-amber-300 font-semibold">Trial Ended</h3>
                <p className="text-white/70 text-sm mt-1">
                  Your 14-day free trial has ended. Choose 1 app to keep using for free, or upgrade for unlimited access to all 70+ apps.
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

          {/* Locked - Unselect Button */}
          {isLocked && selectedApp && (
            <div className="mt-3 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">
                      Your free app: {APP_METADATA[selectedApp]?.name || selectedApp}
                    </p>
                    <p className="text-white/60 text-sm">
                      You can change this once by unselecting
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleUnselect}
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
                >
                  Unselect
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {WEB_CATEGORIES.map((category) => {
          const categoryApps = APP_CATEGORIES[category as keyof typeof APP_CATEGORIES] || [];
          const webApps = categoryApps.filter(
            (id) => APP_METADATA[id] && !MOBILE_ONLY_APPS.includes(id as any)
          );

          if (webApps.length === 0) return null;

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
                    <p className="text-white/40 text-sm">{webApps.length} apps available</p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-white/40 transition-transform ${
                    expandedCategory === category ? 'rotate-90' : ''
                  }`}
                />
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
                        const isSelected = selectedApp === appId;
                        const isDisabled = isLocked && !isSelected;

                        return (
                          <button
                            key={appId}
                            onClick={() => toggleApp(appId)}
                            disabled={isDisabled}
                            className={`relative p-4 rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-purple-500/20 border-purple-500 ring-2 ring-purple-500/50'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
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

        {/* Upgrade prompt */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 p-6 mt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-purple-500/20">
              <Crown className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">Want access to all apps?</h3>
              <p className="text-white/60 text-sm mt-1">
                Upgrade to Starter for 5 apps, or Pro/Premium for unlimited app access,
                more AI requests, and the ability to change your apps anytime.
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
      </div>

      {/* Fixed Footer */}
      {!isLocked && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-white font-medium">
                {selectedApp ? '1 app selected' : 'No app selected'}
              </p>
              {selectedApp && (
                <p className="text-white/40 text-sm">
                  {APP_METADATA[selectedApp]?.name || selectedApp}
                </p>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={!selectedApp || saving}
              className="bg-gradient-to-r from-purple-500 to-pink-500 px-8"
            >
              {saving ? 'Saving...' : 'Confirm Selection'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppSelectorPage;
