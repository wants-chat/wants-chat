import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const dropdownPosition = {
    header: 'right-0 mt-2',
    footer: 'bottom-full mb-2 right-0',
    mobile: 'left-0 right-0 mt-1',
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
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
          <span className="text-sm font-medium">
            {currentLanguage.name}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className={`
            absolute z-50 ${dropdownPosition[variant]}
            min-w-[200px] py-2 bg-white dark:bg-[#2a2a2a] rounded-lg shadow-lg
            border border-gray-200 dark:border-[#3a3a3a]
            max-h-[320px] overflow-y-auto
          `}
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
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
