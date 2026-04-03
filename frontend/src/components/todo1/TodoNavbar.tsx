import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Check, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Theme } from '../../types';

interface TodoNavbarProps {
  theme: Theme;
  toggleTheme: () => void;
}

const TodoNavbar: React.FC<TodoNavbarProps> = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white/10 backdrop-blur-xl border-b border-white/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Check className="h-6 w-6 text-teal-400" />
            <span className="text-xl font-semibold text-white">
              Todo List
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View notifications"
                className="text-white hover:bg-white/10"
              >
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>
              {showNotifications && (
                <div className="absolute top-12 right-0 w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-md shadow-lg p-2">
                  <p className="text-sm p-2 text-white/60">No new notifications</p>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="text-white hover:bg-white/10">
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="border-white/20 text-white hover:bg-white/10">
              Back to Home
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default TodoNavbar;
