import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Search, Moon, Sun, User, LogIn, LogOut, Crown, ChevronLeft,
  Star, Clock, Grid3X3, Sparkles, Settings, ExternalLink, RefreshCw, Loader2,
  Lock, Zap, X, CreditCard, AlertCircle
} from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { TOOL_CATEGORIES, TOOLS_REGISTRY, TOTAL_TOOLS_COUNT, ToolInfo } from './tools-registry';

// User quota interface
interface UserQuota {
  balance: number;
  includedBalance: number;
  purchasedBalance: number;
  requestsToday: number;
  maxRequestsPerDay: number | null;
  formattedBalance: string;
}

// Wrap the app with providers
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}


// API Configuration
const API_BASE = 'https://api.wants.chat/api/v1';

// Helper to check if tool is an AI tool that requires credits
const isAITool = (tool: ToolInfo): boolean => {
  return tool.category.startsWith('ai-') || tool.isPro === true;
};

// Format credits for display (microcents to dollars)
const formatCredits = (microcents: number): string => {
  const dollars = microcents / 1000000;
  return `$${dollars.toFixed(2)}`;
};

// Main App Content
function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState<ToolInfo | null>(null);
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userQuota, setUserQuota] = useState<UserQuota | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string>('');

  // Check user session - first from synced data, then verify with API
  const checkUserSession = async () => {
    try {
      let token = '';
      let cachedUser = null;

      // Check chrome storage for synced auth data (from content script)
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['authToken', 'user', 'syncedAt']);
        token = result.authToken || '';
        cachedUser = result.user;

        // If we have cached user data synced recently (within 30 minutes), use it directly
        if (cachedUser && result.syncedAt && (Date.now() - result.syncedAt < 30 * 60 * 1000)) {
          console.log('Using cached user:', cachedUser);
          setUser(cachedUser);
          setLoading(false);
          return;
        }

        // If we have token but no recent user, decode it
        if (token && !cachedUser) {
          // Token exists, let the API verify it below
        }
      }

      // Try to get token from cookies as fallback
      if (!token && typeof chrome !== 'undefined' && chrome.cookies) {
        try {
          const cookie = await chrome.cookies.get({
            url: 'https://wants.chat',
            name: 'auth_token'
          });
          if (cookie?.value) {
            token = cookie.value;
          }
        } catch (e) {
          console.log('Could not read cookies');
        }
      }

      // Call API to verify session and get user data
      if (token) {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          const userData = {
            id: data.data?.id || data.id,
            email: data.data?.email || data.email,
            name: data.data?.name || data.name,
            plan: data.data?.subscription?.plan || data.subscription?.plan || 'free',
            credits: data.data?.credits || data.credits || 0
          };
          setUser(userData);
          // Cache user data
          if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ user: userData, authToken: token, syncedAt: Date.now() });
          }
          return;
        }
      }

      // No valid session, clear cached user
      setUser(null);
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.remove(['user', 'authToken', 'syncedAt']);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Background token verification - only updates if successful, never clears
  const verifyTokenInBackground = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.data?.id || data.id,
          email: data.data?.email || data.email,
          name: data.data?.name || data.name,
          plan: data.data?.subscription?.plan || data.subscription?.plan || 'free',
          credits: data.data?.credits || data.credits || 0
        };
        setUser(userData);
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.set({ user: userData, syncedAt: Date.now() });
        }
      }
      // If API fails, keep the JWT-decoded user data - don't clear it
      // The JWT is already validated by signature, so it's trustworthy
    } catch (error) {
      console.error('Background verification failed:', error);
      // Network error - keep existing user data
    }
  };

  // Fetch user quota/credits
  const fetchUserQuota = async () => {
    try {
      let token = '';
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['authToken']);
        token = result.authToken || '';
      }

      if (!token) {
        console.log('No token, skipping quota fetch');
        return;
      }

      console.log('Fetching credits from API...');
      const response = await fetch(`${API_BASE}/billing/credits`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        // Backend wraps response in { data: {...} }
        const data = responseData.data || responseData;
        console.log('Credits response:', data);

        setUserQuota({
          balance: data.balance || 0,
          includedBalance: data.includedBalance || 0,
          purchasedBalance: data.purchasedBalance || 0,
          requestsToday: data.usage?.requestsToday || 0,
          maxRequestsPerDay: data.maxRequestsPerDay || null,
          formattedBalance: data.balanceFormatted || formatCredits(data.balance || 0)
        });
      } else {
        console.log('Credits API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching quota:', error);
    }
  };

  // Check quota before opening AI tool
  const checkQuotaForTool = async (tool: ToolInfo): Promise<{ allowed: boolean; reason?: string }> => {
    if (!isAITool(tool)) {
      return { allowed: true };
    }

    // Not logged in
    if (!user) {
      return {
        allowed: false,
        reason: 'Please login to use AI-powered tools. Free users get 25 AI calls per day!'
      };
    }

    // Check daily limit
    if (userQuota?.maxRequestsPerDay && userQuota.requestsToday >= userQuota.maxRequestsPerDay) {
      return {
        allowed: false,
        reason: `You've used all ${userQuota.maxRequestsPerDay} AI calls for today. Upgrade to Pro for 500 daily calls!`
      };
    }

    // Check credits
    if (userQuota && userQuota.balance < 10000) { // Less than $0.01
      return {
        allowed: false,
        reason: 'You\'re running low on credits. Upgrade to Pro for $20 monthly credits!'
      };
    }

    return { allowed: true };
  };

  // Load user data and check session
  useEffect(() => {
    // Load cached data first
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['user', 'recentTools', 'favorites', 'syncedAt'], (result) => {
        console.log('Initial load from storage:', result);
        if (result.recentTools) setRecentTools(result.recentTools);
        if (result.favorites) setFavorites(result.favorites);

        // If we have user data synced in last 30 minutes, use it immediately
        if (result.user && result.syncedAt && (Date.now() - result.syncedAt < 30 * 60 * 1000)) {
          setUser(result.user);
          setLoading(false);
          return; // Don't call checkUserSession if we have valid cached data
        }

        // Otherwise verify with API
        checkUserSession();
      });
    } else {
      checkUserSession();
    }
  }, []);

  // Fetch quota when user logs in
  useEffect(() => {
    if (user) {
      fetchUserQuota();
    } else {
      setUserQuota(null);
    }
  }, [user]);

  const handleLogin = () => {
    // Open wants.chat login page with extension callback
    window.open('https://wants.chat/login?source=extension&callback=extension', '_blank');
  };

  const handleLogout = () => {
    setUser(null);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove(['user', 'authToken']);
    }
  };

  const handleRefreshSession = () => {
    setLoading(true);
    checkUserSession();
  };

  const handleSelectTool = async (tool: ToolInfo) => {
    // Pre-check quota for AI tools
    const quotaCheck = await checkQuotaForTool(tool);
    if (!quotaCheck.allowed) {
      setUpgradeReason(quotaCheck.reason || 'Please upgrade to use this tool');
      setShowUpgradeModal(true);
      return;
    }

    setSelectedTool(tool);
    // Add to recent tools
    const updated = [tool.id, ...recentTools.filter(t => t !== tool.id)].slice(0, 10);
    setRecentTools(updated);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ recentTools: updated });
    }
  };

  const handleBack = () => setSelectedTool(null);

  const toggleFavorite = (toolId: string) => {
    const updated = favorites.includes(toolId)
      ? favorites.filter(f => f !== toolId)
      : [...favorites, toolId];
    setFavorites(updated);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ favorites: updated });
    }
  };

  // Filter tools based on search and category
  const filteredTools = TOOLS_REGISTRY.filter(tool => {
    const matchesSearch = searchQuery === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Sort AI tools first (categories starting with 'ai-')
    const aIsAI = a.category.startsWith('ai-');
    const bIsAI = b.category.startsWith('ai-');
    if (aIsAI && !bIsAI) return -1;
    if (!aIsAI && bIsAI) return 1;
    // Then sort Pro tools
    if (a.isPro && !b.isPro) return -1;
    if (!a.isPro && b.isPro) return 1;
    return 0;
  });

  // Get recent and favorite tools
  const recentToolsData = recentTools
    .map(id => TOOLS_REGISTRY.find(t => t.id === id))
    .filter(Boolean) as ToolInfo[];

  const favoriteToolsData = favorites
    .map(id => TOOLS_REGISTRY.find(t => t.id === id))
    .filter(Boolean) as ToolInfo[];

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`px-4 py-3 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedTool ? (
              <button
                onClick={handleBack}
                className={`p-1.5 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <img src="/icons/logo.png" alt="Wants" className="w-8 h-8 rounded-lg" />
            )}
            <div>
              <h1 className="font-semibold text-sm">
                {selectedTool ? selectedTool.name : 'Wants'}
              </h1>
              {!selectedTool && (
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {TOTAL_TOOLS_COUNT}+ Tools
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {loading ? (
              <div className="flex items-center gap-2 px-3 py-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                <span className="text-xs text-gray-500">Checking...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* Credits Display - clickable to show upgrade modal for free users */}
                <button
                  onClick={() => {
                    if (user.plan !== 'pro') {
                      setUpgradeReason('Upgrade to Pro for unlimited AI tools and 500 daily calls!');
                      setShowUpgradeModal(true);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.plan === 'pro'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : theme === 'dark'
                        ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
                        : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                  }`}
                  title={userQuota
                    ? `Credits: ${userQuota.formattedBalance} | ${userQuota.requestsToday}/${userQuota.maxRequestsPerDay || '∞'} calls today`
                    : user.plan === 'pro' ? 'Pro Account' : 'Free Account'
                  }
                >
                  <Zap className="w-3 h-3" />
                  {userQuota
                    ? userQuota.formattedBalance
                    : user.credits
                      ? formatCredits(user.credits)
                      : '$0.00'
                  }
                </button>
                {/* Plan Badge */}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.plan === 'pro'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {user.plan === 'pro' ? (
                    <span className="flex items-center gap-1"><Crown className="w-3 h-3" /> Pro</span>
                  ) : 'Free'}
                </span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <User className="w-3.5 h-3.5 text-teal-500" />
                  <span className="text-xs font-medium max-w-[80px] truncate" title={user.email}>
                    {user.name || user.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleRefreshSession}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  title="Refresh login status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshSession}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  title="Refresh login status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-medium rounded-lg hover:opacity-90"
                >
                  <LogIn className="w-3.5 h-3.5" /> Login
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      {selectedTool ? (
        <ToolView
          tool={selectedTool}
          theme={theme}
          isFavorite={favorites.includes(selectedTool.id)}
          onToggleFavorite={() => toggleFavorite(selectedTool.id)}
        />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Search */}
          <div className="px-4 py-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <Search className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder={`Search ${TOTAL_TOOLS_COUNT}+ tools...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent text-sm outline-none ${theme === 'dark' ? 'placeholder-gray-500' : 'placeholder-gray-400'}`}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <CategoryTab
                id="all"
                label="All"
                icon={<Grid3X3 className="w-3.5 h-3.5" />}
                isActive={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
                theme={theme}
              />
              {[...TOOL_CATEGORIES].sort((a, b) => {
                // Show AI categories first
                const aIsAI = a.id.startsWith('ai-');
                const bIsAI = b.id.startsWith('ai-');
                if (aIsAI && !bIsAI) return -1;
                if (!aIsAI && bIsAI) return 1;
                return 0;
              }).map(cat => (
                <CategoryTab
                  key={cat.id}
                  id={cat.id}
                  label={cat.name}
                  icon={cat.icon}
                  isActive={selectedCategory === cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  theme={theme}
                />
              ))}
            </div>
          </div>

          {/* Recent Tools */}
          {searchQuery === '' && selectedCategory === 'all' && recentToolsData.length > 0 && (
            <ToolSection
              title="Recent"
              icon={<Clock className="w-4 h-4" />}
              tools={recentToolsData.slice(0, 4)}
              onSelectTool={handleSelectTool}
              theme={theme}
              user={user}
            />
          )}

          {/* Favorites */}
          {searchQuery === '' && selectedCategory === 'all' && favoriteToolsData.length > 0 && (
            <ToolSection
              title="Favorites"
              icon={<Star className="w-4 h-4" />}
              tools={favoriteToolsData.slice(0, 4)}
              onSelectTool={handleSelectTool}
              theme={theme}
              user={user}
            />
          )}

          {/* All/Filtered Tools */}
          <ToolSection
            title={selectedCategory === 'all' ? 'All Tools' : TOOL_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Tools'}
            icon={<Sparkles className="w-4 h-4" />}
            tools={filteredTools}
            onSelectTool={handleSelectTool}
            theme={theme}
            showCount
            user={user}
          />
        </div>
      )}

      {/* Footer */}
      {!selectedTool && !user && (
        <div className={`px-4 py-3 border-t ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-r from-teal-900/50 to-emerald-900/50 border border-teal-700/50' : 'bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">Unlock AI Tools</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Get Pro for $9.99/mo</p>
              </div>
              <button
                onClick={() => window.open('https://wants.chat/pricing', '_blank')}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-lg hover:opacity-90 flex items-center gap-1"
              >
                <Crown className="w-3 h-3" /> Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          theme={theme}
          reason={upgradeReason}
          isLoggedIn={!!user}
          onClose={() => setShowUpgradeModal(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}

// Upgrade Modal Component
function UpgradeModal({
  theme, reason, isLoggedIn, onClose, onLogin
}: {
  theme: 'light' | 'dark';
  reason: string;
  isLoggedIn: boolean;
  onClose: () => void;
  onLogin: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full max-w-sm rounded-xl shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                {isLoggedIn ? <Zap className="w-5 h-5 text-white" /> : <Lock className="w-5 h-5 text-white" />}
              </div>
              <h3 className="font-semibold">
                {isLoggedIn ? 'Upgrade to Pro' : 'Login Required'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 flex-shrink-0 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-500'}`} />
              <p className="text-sm">{reason}</p>
            </div>
          </div>

          {isLoggedIn ? (
            <>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  <span>500 AI calls per day</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-teal-500" />
                  <span>$20 monthly credits</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="w-4 h-4 text-teal-500" />
                  <span>Access to premium AI models</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => window.open('https://wants.chat/pricing', '_blank')}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center justify-center gap-1"
                >
                  <Crown className="w-4 h-4" /> Upgrade
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  <span>Free: 25 AI calls per day</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-teal-500" />
                  <span>Free: $0.50 monthly credits</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Pro: Unlimited access</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onLogin();
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center justify-center gap-1"
                >
                  <LogIn className="w-4 h-4" /> Login Free
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Category Tab Component
function CategoryTab({
  id, label, icon, isActive, onClick, theme
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  theme: 'light' | 'dark';
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
        isActive
          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
          : theme === 'dark'
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// Tool Section Component
function ToolSection({
  title, icon, tools, onSelectTool, theme, showCount, user
}: {
  title: string;
  icon: React.ReactNode;
  tools: ToolInfo[];
  onSelectTool: (tool: ToolInfo) => void;
  theme: 'light' | 'dark';
  showCount?: boolean;
  user?: any;
}) {
  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-2 mb-2">
        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{icon}</span>
        <h2 className="text-sm font-medium">{title}</h2>
        {showCount && (
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            ({tools.length})
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {tools.map(tool => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={() => onSelectTool(tool)}
            theme={theme}
            user={user}
          />
        ))}
      </div>
    </div>
  );
}

// Tool Card Component
function ToolCard({
  tool, onClick, theme, user
}: {
  tool: ToolInfo;
  onClick: () => void;
  theme: 'light' | 'dark';
  user?: any;
}) {
  const isAI = tool.category.startsWith('ai-') || tool.isPro;
  const showLock = isAI && !user;

  return (
    <button
      onClick={onClick}
      className={`tool-card p-3 rounded-lg text-left relative ${
        theme === 'dark' ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
      } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${
        showLock ? 'opacity-80' : ''
      }`}
    >
      {showLock && (
        <div className="absolute top-1 right-1">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <Lock className="w-3 h-3 text-amber-500" />
          </div>
        </div>
      )}
      <div className="flex items-start gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
          isAI
            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
            : 'bg-gradient-to-br from-teal-500/20 to-emerald-500/20'
        }`}>
          {tool.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium truncate">{tool.name}</p>
            {tool.isPro && (
              <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
            )}
          </div>
          <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {tool.description}
          </p>
        </div>
      </div>
    </button>
  );
}

// Tool View Component - Renders the actual tool
function ToolView({
  tool, theme, isFavorite, onToggleFavorite
}: {
  tool: ToolInfo;
  theme: 'light' | 'dark';
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const ToolComponent = tool.component;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Tool Header */}
      <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{tool.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{tool.name}</h2>
                {tool.isPro && (
                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded">
                    PRO
                  </span>
                )}
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {tool.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button
              onClick={() => window.open(`https://wants.chat/tools/${tool.id}`, '_blank')}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tool Content */}
      <div className="p-4">
        <Suspense fallback={<ToolLoading theme={theme} />}>
          {ToolComponent ? (
            <ToolComponent />
          ) : (
            <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className="text-sm">Tool loading...</p>
              <button
                onClick={() => window.open(`https://wants.chat/tools/${tool.id}`, '_blank')}
                className="mt-2 text-xs text-teal-500 hover:underline"
              >
                Open in Wants.chat
              </button>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}

function ToolLoading({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div className={`p-8 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} animate-pulse`}>
      <div className={`h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/3 mb-4`}></div>
      <div className={`h-32 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4`}></div>
      <div className={`h-10 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4`}></div>
    </div>
  );
}

export default App;
