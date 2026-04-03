import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  NotebookPen,
  Clock,
  TrendingUp,
  User
} from 'lucide-react';
import { cn } from '../lib/utils';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { CaloriesProvider } from '../contexts/CaloriesContext';
import { BackgroundEffects } from '../components/ui/BackgroundEffects';

const CaloriesTrackerLayout: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/calories-tracker/dashboard',
      icon: Home
    },
    {
      name: 'Diary',
      path: '/calories-tracker/diary',
      icon: NotebookPen
    },
    {
      name: 'Fasting',
      path: '/calories-tracker/fasting',
      icon: Clock
    },
    {
      name: 'Progress',
      path: '/calories-tracker/progress',
      icon: TrendingUp
    },
    {
      name: 'Profile',
      path: '/calories-tracker/profile',
      icon: User
    }
  ];

  return (
    <CaloriesProvider>
      <div className="min-h-screen relative">
        <BackgroundEffects variant="default" />
        <Header />

        {/* Navigation */}
        <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "border-teal-400 text-teal-400"
                        : "border-transparent text-white/60 hover:text-white hover:border-white/40"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CaloriesProvider>
  );
};

export default CaloriesTrackerLayout;