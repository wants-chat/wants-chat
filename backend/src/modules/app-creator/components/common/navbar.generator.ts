/**
 * Navbar Generator
 *
 * Generates navigation bar components with:
 * - Logo and brand
 * - Navigation links
 * - User menu
 * - Mobile responsive hamburger menu
 * - Search bar (optional)
 * - Theme toggle (optional)
 */

import { pascalCase } from 'change-case';

export interface NavLinkConfig {
  label: string;
  path: string;
  icon?: string;
}

export interface NavbarOptions {
  componentName?: string;
  appName?: string;
  logo?: string;
  links: NavLinkConfig[];
  showSearch?: boolean;
  showThemeToggle?: boolean;
  showUserMenu?: boolean;
  fixed?: boolean;
  transparent?: boolean;
}

/**
 * Generate a navbar component
 */
export function generateNavbar(options: NavbarOptions): string {
  const {
    appName = 'App',
    logo,
    links,
    showSearch = false,
    showThemeToggle = true,
    showUserMenu = true,
    fixed = true,
    transparent = false,
  } = options;

  const componentName = options.componentName || 'Navbar';

  // Collect icons
  const icons = ['Menu', 'X', 'Search', 'User', 'LogOut', 'Settings', 'Moon', 'Sun', 'ChevronDown'];
  links.forEach(link => {
    if (link.icon) icons.push(link.icon);
  });

  const uniqueIcons = [...new Set(icons)];

  return `import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ${uniqueIcons.join(', ')} } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  className?: string;
  user?: { name?: string; email?: string; avatar?: string };
  onLogout?: () => void;
}

const navLinks = ${JSON.stringify(links, null, 2)};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  user,
  onLogout,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  ${showThemeToggle ? "const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));" : ''}
  ${showSearch ? 'const [searchQuery, setSearchQuery] = useState("");' : ''}

  ${transparent ? `useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);` : ''}

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  ${showThemeToggle ? `const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };` : ''}

  ${showSearch ? `const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(\`/search?q=\${encodeURIComponent(searchQuery)}\`);
      setSearchQuery('');
    }
  };` : ''}

  return (
    <>
      <nav
        className={cn(
          '${fixed ? 'fixed top-0 left-0 right-0 z-50' : ''} transition-all duration-300',
          ${transparent ? `scrolled ? 'bg-white dark:bg-gray-900 shadow-sm' : 'bg-transparent'` : `'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'`},
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              ${logo ? `<img src="${logo}" alt="${appName}" className="w-8 h-8" />` : `<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">${appName.charAt(0)}</div>`}
              <span className={cn(
                'text-lg font-semibold',
                ${transparent ? `scrolled ? 'text-gray-900 dark:text-white' : 'text-white'` : `'text-gray-900 dark:text-white'`}
              )}>
                ${appName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(link.path)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : ${transparent ? `scrolled ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white/80 hover:text-white hover:bg-white/10'` : `'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'`}
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              ${showSearch ? `{/* Search */}
              <form onSubmit={handleSearch} className="hidden lg:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </form>` : ''}

              ${showThemeToggle ? `{/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  ${transparent ? `scrolled ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'hover:bg-white/10'` : `'hover:bg-gray-100 dark:hover:bg-gray-800'`}
                )}
              >
                {darkMode ? (
                  <Sun className={cn('w-5 h-5', ${transparent ? `scrolled ? 'text-gray-600' : 'text-white'` : `'text-gray-600 dark:text-gray-400'`})} />
                ) : (
                  <Moon className={cn('w-5 h-5', ${transparent ? `scrolled ? 'text-gray-600' : 'text-white'` : `'text-gray-600'`})} />
                )}
              </button>` : ''}

              ${showUserMenu ? `{/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg transition-colors',
                      ${transparent ? `scrolled ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'hover:bg-white/10'` : `'hover:bg-gray-100 dark:hover:bg-gray-800'`}
                    )}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <ChevronDown className={cn('w-4 h-4', ${transparent ? `scrolled ? 'text-gray-600' : 'text-white'` : `'text-gray-600 dark:text-gray-400'`})} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{user.name || 'User'}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" /> Settings
                        </Link>
                        <button
                          onClick={() => { setUserMenuOpen(false); onLogout?.(); }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    ${transparent ? `scrolled ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-blue-600 hover:bg-gray-100'` : `'bg-blue-600 text-white hover:bg-blue-700'`}
                  )}
                >
                  Sign In
                </Link>
              )}` : ''}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  'p-2 rounded-lg md:hidden',
                  ${transparent ? `scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'` : `'hover:bg-gray-100 dark:hover:bg-gray-800'`}
                )}
              >
                {mobileMenuOpen ? (
                  <X className={cn('w-6 h-6', ${transparent ? `scrolled ? 'text-gray-600' : 'text-white'` : `'text-gray-600 dark:text-gray-400'`})} />
                ) : (
                  <Menu className={cn('w-6 h-6', ${transparent ? `scrolled ? 'text-gray-600' : 'text-white'` : `'text-gray-600 dark:text-gray-400'`})} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="px-4 py-3 space-y-1">
              ${showSearch ? `<form onSubmit={handleSearch} className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                />
              </form>` : ''}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'block px-4 py-2 rounded-lg text-sm font-medium',
                    isActive(link.path)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      ${fixed ? '<div className="h-16" />' : ''}
    </>
  );
};

export default ${componentName};
`;
}
