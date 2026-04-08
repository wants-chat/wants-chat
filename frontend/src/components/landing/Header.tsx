import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChatIcon from '@mui/icons-material/Chat';
import FolderIcon from '@mui/icons-material/Folder';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsProfileDropdownOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get user's initials for avatar
  const getUserInitials = (name: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/90 backdrop-blur-xl">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to={isAuthenticated ? "/chat" : "/"} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img src="/assets/logo.png" alt="Wants" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">Wants</span>
            </Link>
            <div className="ml-3 mb-2">
              <div className="relative inline-flex items-center">
                <div className="relative flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 rounded-full backdrop-blur-sm border border-blue-400/40 shadow-sm shadow-blue-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-2.5 h-2.5 text-white">
                    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                  </svg>
                  <span className="text-[9px] font-bold text-white uppercase tracking-wider pr-0.5">Beta</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated && (
              <>
                <Link to="/features" className="text-white/70 hover:text-white transition-colors">
                  {t('header.features')}
                </Link>
                <Link to="/about" className="text-white/70 hover:text-white transition-colors">
                  {t('header.about')}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Switcher - Desktop only */}
            <div className="hidden md:block">
              <LanguageSwitcher variant="header" showLabel={false} />
            </div>

            {/* Auth Section - Desktop only */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated && user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {getUserInitials(user.name || user.email || 'User')}
                      </div>
                    )}
                    <span className="text-sm font-medium text-white">
                      {user.name || user.email}
                    </span>
                    <KeyboardArrowDownIcon
                      className={`h-4 w-4 text-white transition-transform ${
                        isProfileDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900/90 backdrop-blur-xl rounded-lg border border-gray-700/30 shadow-lg z-50">
                      <div className="p-3 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name || 'User'}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                              {getUserInitials(user.name || user.email || 'User')}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm text-white">{user.name || 'User'}</p>
                            <p className="text-xs text-white/60">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/chat"
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <ChatIcon className="h-4 w-4 mr-3" />
                          {t('header.chat')}
                        </Link>
                        <Link
                          to="/content"
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <FolderIcon className="h-4 w-4 mr-3" />
                          {t('header.myLibrary')}
                        </Link>
                      </div>

                      <div className="border-t border-white/10 py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <LogoutIcon className="h-4 w-4 mr-3" />
                          {t('header.signOut')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => navigate('/login')}>{t('header.signIn')}</Button>
                  <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl px-6" onClick={() => navigate('/signup')}>{t('header.getStarted')}</Button>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 text-white"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <CloseIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/10">
            {!isAuthenticated && (
              <>
                <Link to="/features" className="block py-2 text-white/70 hover:text-white">
                  {t('header.features')}
                </Link>
                <Link to="/about" className="block py-2 text-white/70 hover:text-white">
                  {t('header.about')}
                </Link>
              </>
            )}

            {/* Language Switcher - Mobile */}
            <div className="py-2">
              <LanguageSwitcher variant="mobile" />
            </div>
            <div className={`${!isAuthenticated ? 'pt-4' : ''} space-y-2`}>
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white flex items-center justify-center text-sm font-medium">
                        {getUserInitials(user.name || user.email || 'User')}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm text-white">{user.name || 'User'}</p>
                      <p className="text-xs text-white/60">{user.email}</p>
                    </div>
                  </div>

                  <Link to="/chat" className="block">
                    <Button variant="ghost" className="w-full justify-start border border-white/20 text-white hover:bg-white/10">
                      <ChatIcon className="h-4 w-4 mr-2" />
                      {t('header.chat')}
                    </Button>
                  </Link>

                  <Link to="/content" className="block">
                    <Button variant="ghost" className="w-full justify-start border border-white/20 text-white hover:bg-white/10">
                      <FolderIcon className="h-4 w-4 mr-2" />
                      {t('header.myLibrary')}
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    className="w-full justify-start border border-red-500/30 text-red-400 hover:bg-red-500/20"
                    onClick={handleLogout}
                  >
                    <LogoutIcon className="h-4 w-4 mr-2" />
                    {t('header.signOut')}
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" className="w-full text-white hover:bg-white/10" onClick={() => navigate('/login')}>{t('header.signIn')}</Button>
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl" onClick={() => navigate('/signup')}>{t('header.getStarted')}</Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
