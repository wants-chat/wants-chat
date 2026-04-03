import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
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
    <div className="min-h-screen bg-background">
      <Header />

      {/* Navigation */}
      <nav className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default LanguageLearnerLayout;