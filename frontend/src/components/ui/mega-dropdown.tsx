import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Grid3X3, Sparkles, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { categories, TOTAL_APPS_COUNT } from '../../data/categories';
import { useAuth } from '../../contexts/AuthContext';
import { useAppPreferences } from '../../contexts/AppPreferencesContext';

interface MegaDropdownProps {
  className?: string;
}

const MegaDropdown: React.FC<MegaDropdownProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isAppSelected } = useAppPreferences();

  // Filter categories and apps based on user's selected apps
  const filteredCategories = useMemo(() => {
    return categories
      .map(category => ({
        ...category,
        apps: category.apps.filter(app => isAppSelected(app.id))
      }))
      .filter(category => category.apps.length > 0);
  }, [isAppSelected]);

  // Count total selected apps
  const selectedAppsCount = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.apps.length, 0);
  }, [filteredCategories]);

  const handleManageApps = () => {
    setIsOpen(false);
    navigate('/app-settings');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
    if (!activeCategory && filteredCategories.length > 0) {
      setActiveCategory(filteredCategories[0].id);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveCategory(null);
    }, 300);
  };

  const handleAppClick = (e: React.MouseEvent, appLink: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(appLink);
    }
    setIsOpen(false);
  };

  return (
    <div 
      ref={dropdownRef} 
      className={cn("relative", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all",
          "text-white/70 hover:text-white",
          isOpen && "text-white"
        )}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && !activeCategory && filteredCategories.length > 0) {
            setActiveCategory(filteredCategories[0].id);
          }
        }}
      >
        <Grid3X3 className="h-4 w-4" />
        <span>Apps & Tools</span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Mega Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[100] animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="w-[900px] max-w-[calc(100vw-2rem)] bg-teal-800 backdrop-blur-xl border border-teal-400/30 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex">
              {/* Categories Sidebar */}
              <div className="w-72 border-r border-teal-400/30 bg-teal-900/30 flex flex-col">
                <div className="p-4 flex-1 overflow-y-auto max-h-[450px]">
                  <h3 className="font-semibold text-xs text-muted-foreground mb-3 uppercase tracking-wider flex items-center justify-between">
                    <span>Categories</span>
                    <span className="text-teal-400">{selectedAppsCount}/{TOTAL_APPS_COUNT}</span>
                  </h3>
                  <nav className="space-y-1">
                    {filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                          "hover:bg-white/10",
                          activeCategory === category.id && "bg-white/10 shadow-sm border border-white/10"
                        )}
                        onMouseEnter={() => setActiveCategory(category.id)}
                        onClick={() => setActiveCategory(category.id)}
                      >
                        <span className="text-lg">{category.icon}</span>
                        <div className="text-left flex-1">
                          <div className="font-medium text-sm">{category.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {category.apps.length} {category.apps.length === 1 ? 'app' : 'apps'}
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
                      </button>
                    ))}
                  </nav>
                </div>
                {/* Manage Apps Button */}
                {isAuthenticated && (
                  <div className="p-3 border-t border-teal-400/30 bg-teal-900/50">
                    <button
                      onClick={handleManageApps}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium",
                        "bg-teal-600 hover:bg-teal-500 text-white transition-colors"
                      )}
                    >
                      <Settings2 className="h-4 w-4" />
                      <span>Manage Apps</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Apps Grid */}
              <div className="flex-1 p-6">
                {activeCategory && filteredCategories.find(c => c.id === activeCategory) && (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {filteredCategories.find(c => c.id === activeCategory)?.icon}
                        {filteredCategories.find(c => c.id === activeCategory)?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {filteredCategories.find(c => c.id === activeCategory)?.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                      {filteredCategories.find(c => c.id === activeCategory)?.apps.map((app) => (
                        <div
                          key={app.id}
                          onClick={(e) => handleAppClick(e, app.link || '#')}
                          className={cn(
                            "group flex items-start gap-3 p-3 rounded-lg cursor-pointer",
                            "border border-white/10 bg-white/5 hover:bg-white/10",
                            "hover:border-teal-400/30 transition-all duration-200",
                            "hover:shadow-sm"
                          )}
                        >
                          <div className="mt-0.5 text-2xl">
                            {app.isAI ? (
                              <div className="relative">
                                <span>{app.icon || '🤖'}</span>
                                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-teal-400" />
                              </div>
                            ) : (
                              <span>{app.icon || '📱'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-white group-hover:text-teal-400 transition-colors flex items-center gap-1">
                              {app.name}
                              {app.isAI && (
                                <span className="text-xs bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded">
                                  AI
                                </span>
                              )}
                            </h4>
                            {app.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {app.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MegaDropdown;