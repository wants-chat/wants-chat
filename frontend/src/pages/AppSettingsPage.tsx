import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  ChevronLeft,
  Save,
  Loader2,
  Smartphone
} from 'lucide-react';
import { useAppPreferences, ALL_APP_IDS, MOBILE_ONLY_APPS } from '../contexts/AppPreferencesContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/landing/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BackgroundEffects } from '../components/ui/BackgroundEffects';

interface AppCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  mobileOnly?: boolean;
}

// All 70 apps matching mobile app_selection_screen.dart
const apps: AppCard[] = [
  // Life Management (12 apps)
  { id: 'habit-tracker', name: 'Habit Tracker', description: 'Daily habits & streaks with cloud sync', icon: '📊', category: 'Life Management', color: 'from-pink-500 to-rose-500' },
  { id: 'meditation', name: 'Meditation', description: 'Mindfulness & stress relief', icon: '🧘', category: 'Life Management', color: 'from-purple-500 to-violet-500' },
  { id: 'fitness', name: 'Fitness', description: 'Workout plans & tracking', icon: '💪', category: 'Life Management', color: 'from-orange-500 to-red-500' },
  { id: 'calories-tracker', name: 'Calories Tracker', description: 'Nutrition & meal tracking', icon: '🥗', category: 'Life Management', color: 'from-green-500 to-emerald-500' },
  { id: 'health-tracker', name: 'Health Tracker', description: 'Medical records & vitals', icon: '❤️', category: 'Life Management', color: 'from-red-500 to-pink-500' },
  { id: 'recipe-builder', name: 'Recipe Builder', description: 'Create & organize recipes', icon: '👨‍🍳', category: 'Life Management', color: 'from-amber-500 to-orange-500' },
  { id: 'expense-tracker', name: 'Expense Tracker', description: 'Budget & financial management', icon: '💳', category: 'Life Management', color: 'from-emerald-500 to-teal-500' },
  { id: 'currency-converter', name: 'Currency Converter', description: 'Real-time exchange rates', icon: '💱', category: 'Life Management', color: 'from-teal-500 to-cyan-500' },
  { id: 'travel-planner', name: 'Travel Planner', description: 'AI-powered trip planning', icon: '🗺️', category: 'Life Management', color: 'from-indigo-500 to-blue-500' },
  { id: 'language-learner', name: 'Language Learner', description: 'Interactive language learning', icon: '🌐', category: 'Life Management', color: 'from-yellow-500 to-orange-500' },
  { id: 'blog', name: 'Blog', description: 'Content & community platform', icon: '📝', category: 'Life Management', color: 'from-cyan-500 to-blue-500' },
  { id: 'todo', name: 'Todo & Tasks', description: 'Task & project management', icon: '✅', category: 'Life Management', color: 'from-blue-500 to-indigo-500' },

  // AI Tools (16 apps)
  { id: 'ai-image-generator', name: 'AI Image Generator', description: 'Generate images from text prompts', icon: '🎨', category: 'AI Tools', color: 'from-violet-500 to-purple-500' },
  { id: 'ai-translator', name: 'AI Translator', description: 'Translate text between languages', icon: '🌍', category: 'AI Tools', color: 'from-cyan-500 to-blue-500' },
  { id: 'ai-text-to-speech', name: 'AI Text to Speech', description: 'Convert text to audio with AI', icon: '🔊', category: 'AI Tools', color: 'from-purple-500 to-pink-500' },
  { id: 'ai-speech-to-text', name: 'AI Speech to Text', description: 'Transcribe audio to text with AI', icon: '🎤', category: 'AI Tools', color: 'from-fuchsia-500 to-purple-500' },
  { id: 'ai-resume-builder', name: 'AI Resume Builder', description: 'Create professional resumes', icon: '📄', category: 'AI Tools', color: 'from-indigo-500 to-violet-500' },
  { id: 'ai-cover-letter', name: 'AI Cover Letter', description: 'Generate cover letters', icon: '✉️', category: 'AI Tools', color: 'from-violet-500 to-purple-500' },
  { id: 'ai-email-composer', name: 'AI Email Composer', description: 'Write professional emails', icon: '📧', category: 'AI Tools', color: 'from-blue-500 to-indigo-500' },
  { id: 'ai-social-captions', name: 'AI Social Captions', description: 'Create engaging captions', icon: '💬', category: 'AI Tools', color: 'from-pink-500 to-rose-500' },
  { id: 'ai-hashtag-generator', name: 'AI Hashtag Generator', description: 'Generate trending hashtags', icon: '#️⃣', category: 'AI Tools', color: 'from-rose-500 to-pink-500' },
  { id: 'ai-video-script', name: 'AI Video Script', description: 'Write video scripts', icon: '🎬', category: 'AI Tools', color: 'from-orange-500 to-red-500' },
  { id: 'ai-meeting-notes', name: 'AI Meeting Notes', description: 'Organize meeting notes', icon: '📋', category: 'AI Tools', color: 'from-cyan-500 to-teal-500' },
  { id: 'ai-study-notes', name: 'AI Study Notes', description: 'Generate study materials', icon: '📚', category: 'AI Tools', color: 'from-green-500 to-emerald-500' },
  { id: 'ai-contract-analyzer', name: 'AI Contract Analyzer', description: 'Analyze legal contracts', icon: '⚖️', category: 'AI Tools', color: 'from-amber-600 to-yellow-600' },
  { id: 'ai-legal-document', name: 'AI Legal Document', description: 'Draft legal documents', icon: '📜', category: 'AI Tools', color: 'from-slate-500 to-gray-500' },
  { id: 'ai-tax-calculator', name: 'AI Tax Calculator', description: 'Estimate your taxes', icon: '🧮', category: 'AI Tools', color: 'from-teal-500 to-green-500' },
  { id: 'ai-investment-advisor', name: 'AI Investment Advisor', description: 'Get investment insights', icon: '📈', category: 'AI Tools', color: 'from-blue-600 to-indigo-600' },

  // Productivity (4 apps)
  { id: 'notes', name: 'Notes', description: 'Quick notes with tags & sync', icon: '🗒️', category: 'Productivity', color: 'from-yellow-500 to-amber-500' },
  { id: 'password-manager', name: 'Password Manager', description: 'Secure password storage', icon: '🔐', category: 'Productivity', color: 'from-indigo-500 to-blue-500', mobileOnly: true },
  { id: 'ebook-reader', name: 'E-Book Reader', description: 'Read EPUB & PDF books', icon: '📖', category: 'Productivity', color: 'from-amber-600 to-yellow-600' },
  { id: 'billing-system', name: 'Billing System', description: 'Invoices & client management', icon: '🧾', category: 'Productivity', color: 'from-teal-500 to-green-500' },

  // Developer Tools (7 apps) - Mobile Only
  { id: 'text-tools', name: 'Text Tools', description: 'JSON, CSV, Markdown tools', icon: '📝', category: 'Developer Tools', color: 'from-blue-500 to-indigo-500', mobileOnly: true },
  { id: 'encoding-tools', name: 'Encoding Tools', description: 'Base64, URL, Hash tools', icon: '🔒', category: 'Developer Tools', color: 'from-green-500 to-emerald-500', mobileOnly: true },
  { id: 'units-tools', name: 'Units Tools', description: 'Unit & color converters', icon: '📐', category: 'Developer Tools', color: 'from-orange-500 to-amber-500', mobileOnly: true },
  { id: 'images-tools', name: 'Images Tools', description: 'Compress, resize, convert', icon: '🖼️', category: 'Developer Tools', color: 'from-purple-500 to-violet-500', mobileOnly: true },
  { id: 'qr-barcode', name: 'QR & Barcode', description: 'Generate & scan codes', icon: '📱', category: 'Developer Tools', color: 'from-cyan-500 to-blue-500', mobileOnly: true },
  { id: 'docs-tools', name: 'Docs Tools', description: 'PDF merge, split, convert', icon: '📄', category: 'Developer Tools', color: 'from-red-500 to-rose-500', mobileOnly: true },
  { id: 'media-tools', name: 'Media Tools', description: 'Video & audio conversion', icon: '🎞️', category: 'Developer Tools', color: 'from-teal-500 to-cyan-500', mobileOnly: true },

  // Utilities (5 apps)
  { id: 'internet-speed', name: 'Internet Speed', description: 'Speed test & history', icon: '📶', category: 'Utilities', color: 'from-indigo-500 to-blue-500' },
  { id: 'file-transfer', name: 'File Transfer', description: 'WiFi & Bluetooth transfer', icon: '📤', category: 'Utilities', color: 'from-blue-500 to-cyan-500', mobileOnly: true },
  { id: 'compass-qibla', name: 'Compass & Qibla', description: 'Navigation & Qibla finder', icon: '🧭', category: 'Utilities', color: 'from-red-500 to-rose-500', mobileOnly: true },
  { id: 'flashlight', name: 'Flashlight', description: 'SOS & strobe modes', icon: '🔦', category: 'Utilities', color: 'from-yellow-500 to-amber-500', mobileOnly: true },
  { id: 'receipt-scanner', name: 'Receipt Scanner', description: 'Scan & extract receipts', icon: '🧾', category: 'Utilities', color: 'from-green-500 to-emerald-500', mobileOnly: true },

  // Media & Entertainment (5 apps) - Mobile Only
  { id: 'podcast-player', name: 'Podcast Player', description: 'Play podcasts from URLs', icon: '🎙️', category: 'Media & Entertainment', color: 'from-purple-500 to-violet-500', mobileOnly: true },
  { id: 'photo-gallery', name: 'Photo Gallery', description: 'Browse device photos', icon: '🖼️', category: 'Media & Entertainment', color: 'from-teal-500 to-cyan-500', mobileOnly: true },
  { id: 'music-player', name: 'Music Player', description: 'Play local music files', icon: '🎵', category: 'Media & Entertainment', color: 'from-pink-500 to-rose-500', mobileOnly: true },
  { id: 'video-player', name: 'Video Player', description: 'Play local video files', icon: '🎬', category: 'Media & Entertainment', color: 'from-orange-500 to-red-500', mobileOnly: true },
  { id: 'audio-recorder', name: 'Audio Recorder', description: 'Record voice memos', icon: '🎤', category: 'Media & Entertainment', color: 'from-red-500 to-orange-500', mobileOnly: true },

  // Security & Privacy (3 apps) - Mobile Only
  { id: 'vpn', name: 'VPN', description: 'Secure VPN connection', icon: '🛡️', category: 'Security & Privacy', color: 'from-blue-500 to-indigo-500', mobileOnly: true },
  { id: 'two-factor-auth', name: '2FA Authenticator', description: 'TOTP authentication codes', icon: '🔑', category: 'Security & Privacy', color: 'from-teal-500 to-green-500', mobileOnly: true },
  { id: 'ciphertext', name: 'Ciphertext', description: 'Encrypt & decrypt text', icon: '🔐', category: 'Security & Privacy', color: 'from-amber-600 to-yellow-600', mobileOnly: true },

  // Sensors & Detection (7 apps) - Mobile Only
  { id: 'pedometer', name: 'Pedometer', description: 'Track your daily steps', icon: '🚶', category: 'Sensors & Detection', color: 'from-green-500 to-emerald-500', mobileOnly: true },
  { id: 'magnifier', name: 'Magnifier', description: 'Camera magnification tool', icon: '🔍', category: 'Sensors & Detection', color: 'from-slate-500 to-gray-500', mobileOnly: true },
  { id: 'vibration-detector', name: 'Vibration Detector', description: 'Detect device vibrations', icon: '📳', category: 'Sensors & Detection', color: 'from-orange-500 to-red-500', mobileOnly: true },
  { id: 'light-detector', name: 'Light Detector', description: 'Measure light intensity', icon: '💡', category: 'Sensors & Detection', color: 'from-yellow-500 to-amber-500', mobileOnly: true },
  { id: 'color-detector', name: 'Color Detector', description: 'Detect colors from camera', icon: '🎨', category: 'Sensors & Detection', color: 'from-purple-500 to-violet-500', mobileOnly: true },
  { id: 'nfc-scanner', name: 'NFC Scanner', description: 'Scan NFC tags', icon: '📡', category: 'Sensors & Detection', color: 'from-blue-500 to-indigo-500', mobileOnly: true },
  { id: 'room-temperature', name: 'Room Temperature', description: 'Check ambient temperature', icon: '🌡️', category: 'Sensors & Detection', color: 'from-cyan-500 to-blue-500', mobileOnly: true },

  // Calculators & Tools (4 apps) - Mobile Only
  { id: 'jewellery-calculator', name: 'Jewellery Calculator', description: 'Gold & silver value calculator', icon: '💎', category: 'Calculators & Tools', color: 'from-yellow-400 to-amber-400', mobileOnly: true },
  { id: 'protractor', name: 'Protractor', description: 'Measure angles precisely', icon: '📐', category: 'Calculators & Tools', color: 'from-slate-500 to-gray-500', mobileOnly: true },
  { id: 'resistor-codes', name: 'Resistor Codes', description: 'Resistor color code calculator', icon: '⚡', category: 'Calculators & Tools', color: 'from-amber-600 to-yellow-600', mobileOnly: true },
  { id: 'inductor-codes', name: 'Inductor Codes', description: 'Inductor color code calculator', icon: '🔌', category: 'Calculators & Tools', color: 'from-gray-500 to-slate-500', mobileOnly: true },

  // Camera Utilities (2 apps) - Mobile Only
  { id: 'night-mode-cam', name: 'Night Mode Cam', description: 'Night vision camera modes', icon: '🌙', category: 'Camera Utilities', color: 'from-green-400 to-emerald-400', mobileOnly: true },
  { id: 'blank-cam', name: 'Blank Cam', description: 'Discreet camera capture', icon: '📷', category: 'Camera Utilities', color: 'from-gray-600 to-slate-600', mobileOnly: true },

  // Home & Life (5 apps)
  { id: 'home-repair', name: 'Home Repair', description: 'Track home repairs & maintenance', icon: '🏠', category: 'Home & Life', color: 'from-amber-600 to-yellow-600' },
  { id: 'pet-care', name: 'Pet Care', description: 'Manage pet health & records', icon: '🐾', category: 'Home & Life', color: 'from-orange-400 to-amber-400' },
  { id: 'bill-reminder', name: 'Bill Reminder', description: 'Track bills & payments', icon: '📅', category: 'Home & Life', color: 'from-teal-500 to-cyan-500' },
  { id: 'investment-tracker', name: 'Investment Tracker', description: 'Track investments & portfolio', icon: '📊', category: 'Home & Life', color: 'from-blue-500 to-indigo-500' },
  { id: 'event-reminder', name: 'Event Reminder', description: 'Never miss important events', icon: '🎉', category: 'Home & Life', color: 'from-purple-500 to-violet-500' },
];

const AppSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { selectedApps: currentSelectedApps, updateSelectedApps, isLoading: prefsLoading } = useAppPreferences();

  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize selected apps from context
  useEffect(() => {
    if (!prefsLoading && currentSelectedApps.length > 0) {
      setSelectedApps(currentSelectedApps);
    }
  }, [currentSelectedApps, prefsLoading]);

  // Track changes
  useEffect(() => {
    const currentSet = new Set(currentSelectedApps);
    const newSet = new Set(selectedApps);
    const changed = currentSet.size !== newSet.size ||
      [...currentSet].some(app => !newSet.has(app));
    setHasChanges(changed);
    setSaveSuccess(false);
  }, [selectedApps, currentSelectedApps]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const toggleApp = (appId: string) => {
    setSelectedApps(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const selectAll = () => {
    setSelectedApps(ALL_APP_IDS as unknown as string[]);
  };

  const deselectAll = () => {
    setSelectedApps([]);
  };

  const isAllSelected = selectedApps.length === ALL_APP_IDS.length;

  const handleSave = async () => {
    if (selectedApps.length === 0 || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      await updateSelectedApps(selectedApps);
      setSaveSuccess(true);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save app preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group apps by category
  const groupedApps = apps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = [];
    }
    acc[app.category].push(app);
    return acc;
  }, {} as Record<string, AppCard[]>);

  // Category order
  const categoryOrder = [
    'Life Management',
    'AI Tools',
    'Productivity',
    'Home & Life',
    'Developer Tools',
    'Utilities',
    'Media & Entertainment',
    'Security & Privacy',
    'Sensors & Detection',
    'Calculators & Tools',
    'Camera Utilities',
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (prefsLoading) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects variant="subtle" />
        <Header />
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />

      <main className="py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-4 -ml-2 text-white/60 hover:text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-white">
                App Settings
              </h1>
              <p className="text-white/60 mt-2">
                Choose which apps appear in your dashboard and navigation
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/60">
                {selectedApps.length} of {ALL_APP_IDS.length} apps selected
              </span>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || selectedApps.length === 0 || isSubmitting}
                className="min-w-[100px] bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saveSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Only Info */}
          <div className="mb-6 p-4 bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-200 text-sm font-medium">Some apps are mobile-only</p>
                <p className="text-blue-200/70 text-sm mt-1">
                  Apps marked with a phone icon require the mobile app to use. Your selection here syncs with your mobile device.
                </p>
              </div>
            </div>
          </div>

          {/* Select All / Deselect All */}
          <Card className="mb-6 bg-white/10 backdrop-blur-xl border border-white/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Quick Selection</p>
                <p className="text-sm text-white/60">
                  Toggle all apps at once
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  disabled={isAllSelected}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  disabled={selectedApps.length === 0}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  Deselect All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Categories */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {categoryOrder.map((category) => {
              const categoryApps = groupedApps[category];
              if (!categoryApps || categoryApps.length === 0) return null;

              const hasMobileOnlyApps = categoryApps.some(app => app.mobileOnly || MOBILE_ONLY_APPS.includes(app.id as any));

              return (
                <motion.div key={category} variants={itemVariants}>
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg text-white">{category}</CardTitle>
                        {hasMobileOnlyApps && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                            <Smartphone className="h-3 w-3" />
                            Has mobile-only
                          </span>
                        )}
                      </div>
                      <CardDescription className="text-white/60">
                        {categoryApps.filter(app => selectedApps.includes(app.id)).length} of {categoryApps.length} selected
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryApps.map((app) => {
                          const isSelected = selectedApps.includes(app.id);
                          const isMobileOnly = app.mobileOnly || MOBILE_ONLY_APPS.includes(app.id as any);
                          return (
                            <motion.div
                              key={app.id}
                              variants={itemVariants}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div
                                onClick={() => toggleApp(app.id)}
                                className={`
                                  relative p-4 rounded-xl cursor-pointer transition-all duration-200
                                  ${isSelected
                                    ? 'bg-teal-500/20 border-2 border-teal-400'
                                    : 'bg-white/5 backdrop-blur-xl border-2 border-white/10 hover:border-white/20'
                                  }
                                `}
                              >
                                {/* Selection indicator */}
                                {isSelected && (
                                  <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                )}

                                {/* Mobile only badge */}
                                {isMobileOnly && (
                                  <div className="absolute top-3 right-10 flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300">
                                    <Smartphone className="h-3 w-3" />
                                  </div>
                                )}

                                <div className="flex items-start gap-3">
                                  <div className={`
                                    w-12 h-12 rounded-xl bg-gradient-to-br ${app.color}
                                    flex items-center justify-center text-2xl
                                    ${isSelected ? 'shadow-lg' : ''}
                                  `}>
                                    {app.icon}
                                  </div>
                                  <div className="flex-1 min-w-0 pr-8">
                                    <h3 className={`font-semibold ${isSelected ? 'text-teal-400' : 'text-white'}`}>
                                      {app.name}
                                    </h3>
                                    <p className="text-sm text-white/60 mt-0.5">
                                      {app.description}
                                    </p>
                                    {isMobileOnly && (
                                      <p className="text-xs text-blue-300/70 mt-1">
                                        Mobile app only
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Validation message */}
          {selectedApps.length === 0 && (
            <div className="mt-6 p-4 bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 rounded-lg">
              <p className="text-amber-200 text-sm">
                Please select at least one app to continue using Wants AI.
              </p>
            </div>
          )}

          {/* Save button at bottom for mobile */}
          <div className="mt-8 pb-8 lg:hidden">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || selectedApps.length === 0 || isSubmitting}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
              size="lg"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saveSuccess ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved Successfully
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppSettingsPage;
