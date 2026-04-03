import React from 'react';

interface LanguageFlagProps {
  languageCode: string;
  languageName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

const LanguageFlag: React.FC<LanguageFlagProps> = ({
  languageCode,
  languageName,
  size = 'md',
  showName = false,
  className = ''
}) => {
  const languageFlags: { [key: string]: { flag: string; name: string } } = {
    'es': { flag: '🇪🇸', name: 'Spanish' },
    'fr': { flag: '🇫🇷', name: 'French' },
    'de': { flag: '🇩🇪', name: 'German' },
    'it': { flag: '🇮🇹', name: 'Italian' },
    'pt': { flag: '🇵🇹', name: 'Portuguese' },
    'ja': { flag: '🇯🇵', name: 'Japanese' },
    'ko': { flag: '🇰🇷', name: 'Korean' },
    'zh': { flag: '🇨🇳', name: 'Chinese' },
    'ru': { flag: '🇷🇺', name: 'Russian' },
    'ar': { flag: '🇸🇦', name: 'Arabic' },
    'hi': { flag: '🇮🇳', name: 'Hindi' },
    'nl': { flag: '🇳🇱', name: 'Dutch' },
    'en': { flag: '🇺🇸', name: 'English' },
    'pl': { flag: '🇵🇱', name: 'Polish' },
    'tr': { flag: '🇹🇷', name: 'Turkish' },
    'sv': { flag: '🇸🇪', name: 'Swedish' },
    'da': { flag: '🇩🇰', name: 'Danish' },
    'no': { flag: '🇳🇴', name: 'Norwegian' },
    'fi': { flag: '🇫🇮', name: 'Finnish' },
    'he': { flag: '🇮🇱', name: 'Hebrew' },
    'th': { flag: '🇹🇭', name: 'Thai' },
    'vi': { flag: '🇻🇳', name: 'Vietnamese' }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          flag: 'text-lg',
          container: 'w-6 h-6',
          text: 'text-xs'
        };
      case 'lg':
        return {
          flag: 'text-4xl',
          container: 'w-12 h-12',
          text: 'text-base'
        };
      case 'xl':
        return {
          flag: 'text-5xl',
          container: 'w-16 h-16',
          text: 'text-lg'
        };
      default:
        return {
          flag: 'text-2xl',
          container: 'w-8 h-8',
          text: 'text-sm'
        };
    }
  };

  const classes = getSizeClasses();
  const language = languageFlags[languageCode.toLowerCase()];
  
  if (!language) {
    return (
      <div className={`
        ${classes.container} 
        bg-muted 
        rounded-full flex items-center justify-center 
        ${className}
      `}>
        <span className="text-muted-foreground font-mono text-xs">
          {languageCode.toUpperCase()}
        </span>
      </div>
    );
  }

  if (showName) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`
          ${classes.container} 
          rounded-full flex items-center justify-center 
          bg-background border border-border
        `}>
          <span className={classes.flag}>{language.flag}</span>
        </div>
        <span className={`${classes.text} font-medium text-foreground`}>
          {languageName || language.name}
        </span>
      </div>
    );
  }

  return (
    <div className={`
      ${classes.container} 
      rounded-full flex items-center justify-center 
      bg-background border border-border
      ${className}
    `}>
      <span className={classes.flag}>{language.flag}</span>
    </div>
  );
};

export default LanguageFlag;