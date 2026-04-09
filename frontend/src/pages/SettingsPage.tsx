import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { AppSidebar } from '../components/AppSidebar';
import { SettingsSubmenu } from '../components/layout/SettingsSubmenu';
import {
  User,
  CreditCard,
  Globe,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  Brain,
  Sparkles,
  Key,
} from 'lucide-react';
import { LanguageSwitcher } from '../components/shared/LanguageSwitcher';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  onClick?: () => void;
  badge?: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const settingSections: SettingSection[] = [
    {
      id: 'profile',
      title: t('settings.sections.profile.title'),
      description: t('settings.sections.profile.description'),
      icon: User,
      onClick: () => navigate('/profile'),
    },
    {
      id: 'memory',
      title: t('settings.sections.memory.title'),
      description: t('settings.sections.memory.description'),
      icon: Brain,
      onClick: () => navigate('/memories'),
    },
    {
      id: 'ai-preferences',
      title: t('settings.sections.aiPreferences.title'),
      description: t('settings.sections.aiPreferences.description'),
      icon: Sparkles,
      onClick: () => navigate('/preferences'),
    },
    {
      id: 'api-keys',
      title: t('settings.sections.apiKeys.title'),
      description: t('settings.sections.apiKeys.description'),
      icon: Key,
      onClick: () => navigate('/api-keys'),
      badge: t('settings.sections.apiKeys.badge'),
    },
  ];

  return (
    <div className={cn(
      "flex h-full",
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-slate-50'
    )}>
      {/* Sidebar */}
      <AppSidebar activePage="settings" />

      {/* Settings Submenu */}
      <SettingsSubmenu />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className={cn(
              "text-3xl font-bold",
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            )}>
              {t('settings.title')}
            </h1>
            <p className={cn(
              "mt-2 text-base",
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            )}>
              {t('settings.subtitle')}
            </p>
          </div>

          {/* User Info Card */}
          <div className={cn(
            "mb-8 p-6 rounded-2xl border",
            theme === 'dark'
              ? 'bg-[#2a2a2a] border-[#3a3a3a]'
              : 'bg-white border-slate-200 shadow-sm'
          )}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <h2 className={cn(
                  "text-xl font-semibold",
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                )}>
                  {user?.name || 'User'}
                </h2>
                <p className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}>
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-3">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={section.onClick}
                disabled={!section.onClick}
                className={cn(
                  "w-full p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 text-left",
                  section.onClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-60',
                  theme === 'dark'
                    ? 'bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#333] hover:border-[#444]'
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  theme === 'dark' ? 'bg-[#3a3a3a]' : 'bg-slate-100'
                )}>
                  <section.icon className={cn(
                    "w-5 h-5",
                    section.id === 'billing' ? 'text-[#0D9488]' : theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "font-medium",
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    )}>
                      {section.title}
                    </h3>
                    {section.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#0D9488]/20 text-[#0D9488]">
                        {section.badge}
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    "text-sm mt-0.5",
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  )}>
                    {section.description}
                  </p>
                </div>
                {section.onClick && (
                  <ChevronRight className={cn(
                    "w-5 h-5",
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  )} />
                )}
              </button>
            ))}
          </div>

          {/* Language Selection */}
          <div className={cn(
            "mt-6 p-4 rounded-xl border flex items-center justify-between",
            theme === 'dark'
              ? 'bg-[#2a2a2a] border-[#3a3a3a]'
              : 'bg-white border-slate-200 shadow-sm'
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                theme === 'dark' ? 'bg-[#3a3a3a]' : 'bg-slate-100'
              )}>
                <Globe className={cn(
                  "w-5 h-5",
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                )} />
              </div>
              <div>
                <h3 className={cn(
                  "font-medium",
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                )}>
                  {t('settings.sections.language.title')}
                </h3>
                <p className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}>
                  {t('settings.sections.language.description')}
                </p>
              </div>
            </div>
            <LanguageSwitcher variant="header" showLabel={true} showFlag={true} />
          </div>

          {/* Theme Toggle */}
          <div className={cn(
            "mt-3 p-4 rounded-xl border flex items-center justify-between",
            theme === 'dark'
              ? 'bg-[#2a2a2a] border-[#3a3a3a]'
              : 'bg-white border-slate-200 shadow-sm'
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                theme === 'dark' ? 'bg-[#3a3a3a]' : 'bg-slate-100'
              )}>
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Sun className="w-5 h-5 text-orange-400" />
                )}
              </div>
              <div>
                <h3 className={cn(
                  "font-medium",
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                )}>
                  {t('settings.darkMode.title')}
                </h3>
                <p className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}>
                  {theme === 'dark' ? t('settings.darkMode.dark') : t('settings.darkMode.light')}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors duration-200",
                theme === 'dark' ? 'bg-[#0D9488]' : 'bg-slate-300'
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200",
                theme === 'dark' ? 'left-7' : 'left-1'
              )} />
            </button>
          </div>

          {/* Sign Out */}
          <button
            onClick={logout}
            className={cn(
              "mt-6 w-full p-4 rounded-xl border flex items-center gap-4 transition-all duration-200",
              theme === 'dark'
                ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400'
                : 'bg-red-50 border-red-200 hover:bg-red-100 text-red-600'
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
            )}>
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium">{t('settings.signOut')}</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
