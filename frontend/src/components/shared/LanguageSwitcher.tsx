import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { languages } from '../../i18n';

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer' | 'mobile';
  showLabel?: boolean;
  showFlag?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'header',
  showLabel = true,
  showFlag = true,
  className = '',
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 240;
    const menuHeight = 320;
    let top: number;
    let left: number;

    if (variant === 'footer') {
      top = rect.top - menuHeight - 8;
      left = rect.right - menuWidth;
    } else {
      top = rect.bottom + 8;
      left = rect.right - menuWidth;
    }
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
    setMenuPos({ top, left, width: menuWidth });
  };

  useLayoutEffect(() => {
    if (isOpen) updatePosition();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    const handleViewportChange = () => updatePosition();

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('resize', handleViewportChange);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    const selectedLang = languages.find((lang) => lang.code === langCode);
    if (selectedLang) {
      document.documentElement.dir = selectedLang.dir;
      document.documentElement.lang = langCode;
    }
    setIsOpen(false);
  };

  const baseButtonStyles = `
    flex items-center gap-2 transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D9488]
  `;

  const variantStyles = {
    header: 'px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-300',
    footer: 'px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white',
    mobile: 'w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 justify-between',
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseButtonStyles} ${variantStyles[variant]}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <Globe className="w-5 h-5" />
        {showFlag && <span className="text-lg">{currentLanguage.flag}</span>}
        {showLabel && (
          <span className="text-sm font-medium">{currentLanguage.name}</span>
        )}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && menuPos && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            width: menuPos.width,
            zIndex: 9999,
          }}
          className="py-2 bg-white dark:bg-[#2a2a2a] rounded-lg shadow-2xl border border-gray-200 dark:border-[#3a3a3a] max-h-[320px] overflow-y-auto"
          role="listbox"
          aria-label="Available languages"
        >
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              role="option"
              aria-selected={language.code === currentLanguage.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-left
                hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors duration-150
                ${
                  language.code === currentLanguage.code
                    ? 'bg-[#0D9488]/10 text-[#0D9488]'
                    : 'text-gray-700 dark:text-gray-300'
                }
              `}
            >
              <span className="text-xl">{language.flag}</span>
              <div className="flex-1">
                <span className="block text-sm font-medium">{language.nativeName}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">{language.name}</span>
              </div>
              {language.code === currentLanguage.code && (
                <Check className="w-4 h-4 text-[#0D9488]" />
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default LanguageSwitcher;
