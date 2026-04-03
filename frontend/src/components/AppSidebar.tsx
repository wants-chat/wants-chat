import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePinnedTools } from '../contexts/PinnedToolsContext';
import { cn } from '../lib/utils';
import { getToolIcon } from '../lib/toolIcons';
import { billingAPI } from '../lib/api/billing';
import {
  MessageSquare,
  Plus,
  Settings,
  LogOut,
  FolderOpen,
  Grid3X3,
  X,
  CreditCard,
  Brain,
  Coins,
} from 'lucide-react';
import { LanguageSwitcher } from './shared/LanguageSwitcher';
import { ToolsModal } from './ToolsModal';
import { ContextualUI, UIConfig } from './ContextualUI';
import { getAllTools } from '../services/toolsApi';

interface AppSidebarProps {
  isConnected?: boolean;
  activePage?: 'chat' | 'content' | 'memories' | 'settings';
  onOpenChatHistory?: () => void;
  onNewChat?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isConnected = true,
  activePage = 'chat',
  onOpenChatHistory,
  onNewChat,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { pinnedTools, unpinTool, clearPinnedTools } = usePinnedTools();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [showContextualUI, setShowContextualUI] = useState(false);
  const [activeToolConfig, setActiveToolConfig] = useState<UIConfig | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch subscription and credits
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: () => billingAPI.getSubscription(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: credits } = useQuery({
    queryKey: ['user-credits'],
    queryFn: () => billingAPI.getCredits(),
    staleTime: 60 * 1000, // Cache for 1 minute
  });

  // Get plan name for display
  const planName = subscription?.planName || subscription?.plan || 'Free';

  // Format credits for display with 2 decimal places
  const formatCredits = (microcents: number) => {
    const dollars = microcents / 1000000;
    return `$${dollars.toFixed(2)}`;
  };

  // Get credit balance
  const creditBalance = credits?.balance || 0;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    clearPinnedTools();
    await logout();
    navigate('/login');
  };

  const handleOpenPinnedTool = (toolId: string, title: string, type: string) => {
    setActiveToolConfig({
      type: type as any,
      toolId: toolId as any,
      title,
    });
    setShowContextualUI(true);
  };

  const handleToolFromModal = (toolId: string, title: string, type: string) => {
    setActiveToolConfig({
      type: type as any,
      toolId: toolId as any,
      title,
    });
    setShowContextualUI(true);
    // Keep Tools Modal open so user can browse more tools
  };

  return (
    <>
      <aside className={cn(
        "w-16 flex flex-col items-center py-4 border-r backdrop-blur-sm",
        theme === 'dark' ? 'bg-[#1a1a1a]/90 border-[#2a2a2a]' : 'bg-white/80 border-slate-200/60'
      )}>
        {/* Chat Button - Opens history sidebar if on chat page, otherwise navigates */}
        <button
          onClick={() => {
            if (activePage === 'chat' && onOpenChatHistory) {
              onOpenChatHistory();
            } else {
              navigate('/chat');
            }
          }}
          className={cn(
            "p-2.5 rounded-xl mb-2 transition-all duration-200",
            activePage === 'chat'
              ? 'bg-[#0D9488]/10 text-[#0D9488]'
              : theme === 'dark' ? 'hover:bg-[#2a2a2a] text-slate-400' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
          )}
          title={t('chatHistory.title')}
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* New Chat Button */}
        <button
          onClick={() => {
            if (onNewChat) {
              onNewChat();
            } else {
              navigate('/chat');
            }
          }}
          className="p-2.5 rounded-xl mb-4 transition-all duration-200 bg-gradient-to-br from-[#0D9488] to-[#0F766E] hover:from-[#14B8A6] hover:to-[#0D9488] text-white shadow-lg shadow-[#0D9488]/25 hover:shadow-[#0D9488]/40 hover:scale-105"
          title={t('chatHistory.newChat')}
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* All Tools Button */}
        <button
          onClick={() => setShowToolsModal(true)}
          className={cn(
            "p-2.5 rounded-xl mb-2 transition-all duration-200",
            theme === 'dark'
              ? 'hover:bg-[#2a2a2a] text-slate-400 hover:text-[#0D9488]'
              : 'hover:bg-[#0D9488]/10 text-slate-500 hover:text-[#0D9488]'
          )}
          title={t('toolsModal.allTools')}
        >
          <Grid3X3 className="w-5 h-5" />
        </button>

        {/* Pinned Tools Section - Scrollable and stretches to fill space */}
        {pinnedTools.length > 0 ? (
          <>
            <div className={cn(
              "w-8 h-px my-2",
              theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gradient-to-r from-transparent via-slate-200 to-transparent'
            )} />
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-0.5 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              {pinnedTools.map(tool => {
                // Get icon from tools data, fallback to stored icon
                const toolData = getAllTools().find(t => t.id === tool.toolId);
                const iconName = toolData?.icon || tool.icon || 'calculator';
                const IconComponent = getToolIcon(iconName);
                return (
                  <div key={tool.toolId} className="relative group">
                    <button
                      onClick={() => handleOpenPinnedTool(tool.toolId, tool.title, tool.type)}
                      className={cn(
                        "p-2.5 rounded-xl transition-all duration-200",
                        theme === 'dark'
                          ? 'hover:bg-[#2a2a2a] text-[#0D9488]'
                          : 'hover:bg-[#0D9488]/10 text-[#0D9488] hover:text-[#0F766E]'
                      )}
                      title={tool.title}
                    >
                      <IconComponent className="w-5 h-5" />
                    </button>
                    {/* Remove button on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unpinTool(tool.toolId);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500 hover:bg-red-600 text-white shadow-sm"
                      title={t('toolsModal.unpinTool')}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className={cn(
              "w-8 h-px my-2",
              theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gradient-to-r from-transparent via-slate-200 to-transparent'
            )} />
          </>
        ) : (
          /* Spacer when no pinned tools */
          <div className="flex-1" />
        )}

        {/* Settings with User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200",
              showUserMenu
                ? theme === 'dark' ? 'bg-[#2a2a2a] text-[#0D9488]' : 'bg-[#0D9488]/10 text-[#0D9488]'
                : theme === 'dark' ? 'hover:bg-[#2a2a2a] text-slate-400' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            )}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Settings Dropdown Menu */}
          {showUserMenu && (
            <div className={cn(
              "absolute bottom-full left-0 mb-2 w-52 rounded-2xl shadow-xl border overflow-hidden z-50 backdrop-blur-xl",
              theme === 'dark'
                ? 'bg-[#1a1a1a]/95 border-[#2a2a2a]'
                : 'bg-white/95 border-slate-200'
            )}>
              {/* User Info */}
              <div className={cn(
                "px-4 py-3 border-b",
                theme === 'dark' ? 'border-[#2a2a2a]' : 'border-slate-100'
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-semibold",
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    )}>
                      {user?.name || 'User'}
                    </p>
                    <p className={cn(
                      "text-xs",
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    )}>
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connection Status */}
              <div className={cn(
                "px-4 py-2.5 flex items-center gap-3",
                theme === 'dark' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-slate-50'
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                )} />
                <span className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                )}>
                  {isConnected ? t('sidebar.online') : t('sidebar.offline')}
                </span>
              </div>

              {/* Content Library */}
              <button
                onClick={() => {
                  navigate('/content');
                  setShowUserMenu(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all duration-200",
                  activePage === 'content'
                    ? theme === 'dark' ? 'bg-[#2a2a2a] text-[#0D9488]' : 'bg-[#0D9488]/10 text-[#0D9488]'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:bg-[#2a2a2a]'
                      : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <FolderOpen className="w-4 h-4" />
                {t('sidebar.contentLibrary')}
              </button>

              {/* Credits Balance */}
              <div className={cn(
                "px-4 py-2.5 flex items-center gap-3",
                theme === 'dark' ? 'border-b border-[#2a2a2a]' : 'border-b border-slate-100'
              )}>
                <Coins className="w-4 h-4 text-amber-500" />
                <span className={cn(
                  "text-sm flex-1",
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                )}>
                  {t('sidebar.credits')}
                </span>
                <span className="text-sm font-semibold text-amber-500">
                  {formatCredits(creditBalance)}
                </span>
              </div>

              {/* Billing & Subscription */}
              <button
                onClick={() => {
                  navigate('/billing');
                  setShowUserMenu(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all duration-200",
                  location.pathname === '/billing'
                    ? theme === 'dark' ? 'bg-[#2a2a2a] text-[#0D9488]' : 'bg-[#0D9488]/10 text-[#0D9488]'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:bg-[#2a2a2a]'
                      : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <CreditCard className="w-4 h-4" />
                <span className="flex-1">{t('sidebar.billingPlan')}</span>
                <span className={cn(
                  "px-1.5 py-0.5 text-xs font-medium rounded capitalize",
                  planName.toLowerCase() === 'free'
                    ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    : planName.toLowerCase() === 'pro'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                    : planName.toLowerCase() === 'team'
                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400'
                    : planName.toLowerCase() === 'enterprise'
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
                    : 'bg-[#0D9488]/20 text-[#0D9488]'
                )}>
                  {planName}
                </span>
              </button>

              {/* Memory */}
              <button
                onClick={() => {
                  navigate('/memories');
                  setShowUserMenu(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all duration-200",
                  activePage === 'memories'
                    ? theme === 'dark' ? 'bg-[#2a2a2a] text-[#0D9488]' : 'bg-[#0D9488]/10 text-[#0D9488]'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:bg-[#2a2a2a]'
                      : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <Brain className="w-4 h-4" />
                {t('sidebar.memory')}
              </button>

              {/* Settings */}
              <button
                onClick={() => {
                  navigate('/settings');
                  setShowUserMenu(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all duration-200",
                  location.pathname === '/settings'
                    ? theme === 'dark' ? 'bg-[#2a2a2a] text-[#0D9488]' : 'bg-[#0D9488]/10 text-[#0D9488]'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:bg-[#2a2a2a]'
                      : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <Settings className="w-4 h-4" />
                {t('sidebar.settings')}
              </button>

              {/* Language Switcher */}
              <div className={cn(
                "px-4 py-1",
                theme === 'dark'
                  ? 'text-slate-300'
                  : 'text-slate-600'
              )}>
                <LanguageSwitcher variant="mobile" showLabel={true} showFlag={true} />
              </div>

              {/* Divider */}
              <div className={cn(
                "h-px mx-3",
                theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-slate-100'
              )} />

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all duration-200",
                  theme === 'dark'
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-red-600 hover:bg-red-50'
                )}
              >
                <LogOut className="w-4 h-4" />
                {t('sidebar.signOut')}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Tools Modal */}
      <ToolsModal
        isOpen={showToolsModal}
        onClose={() => setShowToolsModal(false)}
        onSelectTool={handleToolFromModal}
      />

      {/* Contextual UI */}
      {showContextualUI && activeToolConfig && (
        <ContextualUI
          intent={{
            uiConfig: activeToolConfig
          }}
          onClose={() => setShowContextualUI(false)}
        />
      )}

    </>
  );
};
