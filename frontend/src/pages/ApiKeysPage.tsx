import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { AppSidebar } from '../components/AppSidebar';
import { SettingsSubmenu } from '../components/layout/SettingsSubmenu';
import { ApiKeysManager } from '../components/ui/ApiKeysManager';

const ApiKeysPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

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
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className={cn(
              "text-3xl font-bold",
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            )}>
              {t('apiKeys.title')}
            </h1>
            <p className={cn(
              "mt-2 text-base",
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            )}>
              {t('apiKeys.subtitle')}
            </p>
          </div>

          {/* API Keys Manager Component */}
          <ApiKeysManager />
        </div>
      </main>
    </div>
  );
};

export default ApiKeysPage;
