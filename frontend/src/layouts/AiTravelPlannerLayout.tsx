import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Map,
  BarChart3,
  Plus,
  Heart,
  type LucideIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import Header from '../components/landing/Header';
import { ToastContainer } from '../components/ui/toast';
import { BackgroundEffects } from '../components/ui/BackgroundEffects';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Map, label: 'My Plans', path: '/travel-planner' },
  { icon: Heart, label: 'Favorites', path: '/travel-planner/favorites' },
  { icon: BarChart3, label: 'Travel Stats', path: '/travel-planner/stats' },
];

const AiTravelPlannerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />
      <ToastContainer />

      {/* Navigation */}
      <nav className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
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
                    <IconComponent className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <Button
              onClick={() => navigate('/travel-planner/generate')}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 rounded-lg"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Plan
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default AiTravelPlannerLayout;