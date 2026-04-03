import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { billingAPI } from '../../lib/api/billing';
import {
  User,
  FolderOpen,
  CreditCard,
  Brain,
  Sparkles,
  Settings,
  LogOut,
  Circle,
  Key,
} from 'lucide-react';

interface SubmenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
  badgeColor?: string;
}

export const SettingsSubmenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const [planName, setPlanName] = useState<string>('Free');

  useEffect(() => {
    const loadBillingInfo = async () => {
      try {
        const subscription = await billingAPI.getSubscription();
        setPlanName(subscription?.planName || subscription?.plan || 'Free');
      } catch (error) {
        console.error('Failed to load billing info:', error);
      }
    };
    loadBillingInfo();
  }, []);

  const menuItems: SubmenuItem[] = [
    {
      id: 'profile',
      label: t('settingsMenu.profile'),
      icon: User,
      path: '/profile',
    },
    {
      id: 'content',
      label: t('settingsMenu.contentLibrary'),
      icon: FolderOpen,
      path: '/content',
    },
    {
      id: 'billing',
      label: t('settingsMenu.billingPlan'),
      icon: CreditCard,
      path: '/billing',
      badge: planName,
      badgeColor: planName.toLowerCase() === 'enterprise'
        ? 'bg-amber-500/20 text-amber-500'
        : planName.toLowerCase() === 'pro'
          ? 'bg-blue-500/20 text-blue-500'
          : planName.toLowerCase() === 'team'
            ? 'bg-purple-500/20 text-purple-500'
            : 'bg-gray-500/20 text-gray-500',
    },
    {
      id: 'memory',
      label: t('settingsMenu.memory'),
      icon: Brain,
      path: '/memories',
    },
    {
      id: 'preferences',
      label: t('settingsMenu.aiPreferences'),
      icon: Sparkles,
      path: '/preferences',
    },
    {
      id: 'api-keys',
      label: t('settingsMenu.apiKeys'),
      icon: Key,
      path: '/api-keys',
      badge: t('settingsMenu.devBadge'),
      badgeColor: 'bg-emerald-500/20 text-emerald-500',
    },
    {
      id: 'settings',
      label: t('settingsMenu.settings'),
      icon: Settings,
      path: '/settings',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={cn(
      "w-64 flex-shrink-0 border-r flex flex-col",
      theme === 'dark'
        ? 'bg-[#1a1a1a] border-[#2a2a2a]'
        : 'bg-white border-gray-200'
    )}>
      {/* User Info */}
      <div className={cn(
        "p-4 border-b",
        theme === 'dark' ? 'border-[#2a2a2a]' : 'border-gray-200'
      )}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center text-white text-lg font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold truncate",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {user?.name || 'User'}
            </h3>
            <p className={cn(
              "text-sm truncate",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>

        {/* Online Status */}
        <div className="flex items-center gap-2 mt-3">
          <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500" />
          <span className={cn(
            "text-sm",
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            {t('settingsMenu.online')}
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                active
                  ? theme === 'dark'
                    ? 'bg-[#0D9488]/10 text-[#0D9488]'
                    : 'bg-[#0D9488]/10 text-[#0D9488]'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                active && 'text-[#0D9488]'
              )} />
              <span className="flex-1 font-medium">{item.label}</span>

              {/* Badge */}
              {item.badge && (
                <span className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full",
                  item.badgeColor || 'bg-gray-500/20 text-gray-500'
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className={cn(
        "p-3 border-t",
        theme === 'dark' ? 'border-[#2a2a2a]' : 'border-gray-200'
      )}>
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
            theme === 'dark'
              ? 'text-red-400 hover:bg-red-500/10'
              : 'text-red-600 hover:bg-red-50'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{t('settingsMenu.signOut')}</span>
        </button>
      </div>
    </div>
  );
};
