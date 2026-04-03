import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  Library,
  User
} from 'lucide-react';
import { cn } from '../lib/utils';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { BackgroundEffects } from '../components/ui/BackgroundEffects';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/meditation' },
  { icon: Library, label: 'Series', path: '/meditation/series' },
  { icon: User, label: 'Profile', path: '/meditation/profile' },
];

const MeditationLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="default" />
      <Header />

      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors",
                    isActive
                      ? "border-teal-400 text-teal-400"
                      : "border-transparent text-white/60 hover:text-white hover:border-white/40"
                  )}
                >
                  {React.createElement(item.icon, { className: "h-4 w-4" })}
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

export default MeditationLayout;