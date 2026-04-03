import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import {
  Home,
  BookOpen,
  Trophy,
  User,
  Volume2,
  MessageCircle,
  Target,
  type LucideIcon
} from 'lucide-react';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/language-learner/dashboard' },
  { icon: BookOpen, label: 'Learn', path: '/language-learner/learning' },
  { icon: Target, label: 'Practice', path: '/language-learner/practice' },
  { icon: Volume2, label: 'Sounds', path: '/language-learner/sounds' },
  { icon: MessageCircle, label: 'Stories', path: '/language-learner/stories' },
  { icon: BookOpen, label: 'Words', path: '/language-learner/vocabulary' },
  { icon: Trophy, label: 'Leaderboard', path: '/language-learner/leaderboard' },
  { icon: User, label: 'Profile', path: '/language-learner/profile' }
];

const LanguageLearnerLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />

      {/* Navigation Tabs */}
      <nav className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-hide">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default LanguageLearnerLayout;