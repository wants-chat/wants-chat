import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import {
  Home,
  Dumbbell,
  TrendingUp,
  User,
  type LucideIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { BackgroundEffects } from '../components/ui/BackgroundEffects';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/fitness/dashboard' },
  { icon: Dumbbell, label: 'Workouts', path: '/fitness/workout-plans' },
  { icon: TrendingUp, label: 'Progress', path: '/fitness/progress' },
  { icon: User, label: 'Profile', path: '/fitness/profile' },
];

const FitnessLayout: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get the current mode from URL parameters or localStorage
  const urlMode = searchParams.get('mode');
  const storedMode = localStorage.getItem('workoutMode');
  const currentMode = urlMode || storedMode;

  // Store mode in localStorage when it changes
  useEffect(() => {
    if (urlMode && urlMode !== storedMode) {
      localStorage.setItem('workoutMode', urlMode);
    }
  }, [urlMode, storedMode]);

  // Helper function to create paths with mode parameter
  const createPathWithMode = (basePath: string) => {
    if (currentMode) {
      return `${basePath}?mode=${currentMode}`;
    }
    return basePath;
  };

  // Generate breadcrumbs based on current page
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Home', href: '/dashboard' },
      { label: 'Fitness Tracker', href: '/fitness' }
    ];

    // Find current nav item
    const currentNav = navItems.find(item => item.path === location.pathname);
    if (currentNav) {
      breadcrumbs.push({ label: currentNav.label, icon: currentNav.icon });
    }

    return breadcrumbs;
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="default" />
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={getBreadcrumbs()} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navItems.map((item) => {
              const pathWithMode = createPathWithMode(item.path);
              const isActive = location.pathname === item.path;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={pathWithMode}
                  className={cn(
                    "flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "border-teal-400 text-teal-400"
                      : "border-transparent text-white/60 hover:text-white hover:border-white/40"
                  )}
                >
                  <IconComponent className="h-5 w-5" />
                  {item.label}
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
  );
};

export default FitnessLayout;