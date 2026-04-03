import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { AuthenticatedHeader } from '../components/layout/AuthenticatedHeader';
import { cn } from '../lib/utils';

const AuthenticatedLayout: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "flex flex-col h-screen",
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
    )}>
      <AuthenticatedHeader />
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
