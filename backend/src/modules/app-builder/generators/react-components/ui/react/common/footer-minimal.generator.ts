import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFooterMinimal = (
  resolved: ResolvedComponent,
  variant: 'centered' | 'inline' | 'compact' = 'centered'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming
  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import { useState, useEffect } from 'react';
import { Twitter, Github, Linkedin, Instagram, Facebook, ArrowUp, Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    centered: `
${commonImports}

interface FooterProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function Footer({ ${dataName}: propData, className }: FooterProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const footerData = ${dataName} || {};
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showBackToTop, setShowBackToTop] = useState(false);

  const brandName = ${getField('brandName')};
  const tagline = ${getField('tagline')};
  const quickLinks = ${getField('quickLinks')};
  const legalLinks = ${getField('legalLinks')};
  const socialIcons = ${getField('socialIcons')};
  const copyrightText = ${getField('copyrightText')};
  const autoUpdateYear = ${getField('autoUpdateYear')};
  const backToTopText = ${getField('backToTopText')};

  useEffect(() => {
    if (autoUpdateYear) {
      setCurrentYear(new Date().getFullYear());
    }

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [autoUpdateYear]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    e.preventDefault();
    console.log(\`Clicked: \${label}\`);
  };

  const handleSocialClick = (e: React.MouseEvent<HTMLAnchorElement>, platform: string) => {
    e.preventDefault();
    console.log(\`Social click: \${platform}\`);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSocialIcon = (icon: string) => {
    const icons: any = {
      twitter: Twitter,
      github: Github,
      linkedin: Linkedin,
      instagram: Instagram,
      facebook: Facebook
    };
    return icons[icon] || Twitter;
  };

  return (
    <footer className={cn('bg-gradient-to-b from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-black border-t-2 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500', className)}>
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Main Content - Centered */}
        <div className="text-center space-y-10">
          {/* Brand */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 bg-white rounded"></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{brandName}</h3>
              <p className="text-sm text-gray-300 dark:text-gray-400 mt-2">{tagline}</p>
            </div>
          </div>

          {/* Quick Links */}
          <nav>
            <ul className="flex flex-wrap justify-center gap-x-10 gap-y-4">
              {quickLinks.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-300 hover:text-blue-400 transition-all duration-300 font-medium hover:translate-y-[-2px] inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social Icons */}
          <div className="flex justify-center gap-4">
            {socialIcons.map((social: any, index: number) => {
              const Icon = getSocialIcon(social.icon);
              const gradients = ['from-blue-500 to-blue-700', 'from-purple-500 to-purple-700', 'from-pink-500 to-pink-700', 'from-indigo-500 to-indigo-700'];
              const gradient = gradients[index % gradients.length];
              return (
                <a
                  key={index}
                  href={social.url}
                  onClick={(e) => handleSocialClick(e, social.platform)}
                  className={\`w-14 h-14 bg-gradient-to-br \${gradient} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl group\`}
                >
                  <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </a>
              );
            })}
          </div>

          {/* Divider */}
          <div className="max-w-md mx-auto border-t border-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>

          {/* Copyright & Legal */}
          <div className="flex flex-col items-center gap-6">
            <p className="text-sm text-gray-400">
              {autoUpdateYear ? copyrightText.replace(/\\d{4}/, String(currentYear)) : copyrightText}
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              {legalLinks.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.label)}
                  className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-y-[-2px]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group z-50 hover:scale-110"
          aria-label={backToTopText}
        >
          <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
        </button>
      )}
    </footer>
  );
}
    `,

    inline: `
${commonImports}

interface FooterProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function Footer({ ${dataName}: propData, className }: FooterProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const footerData = ${dataName} || {};
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const brandName = ${getField('brandName')};
  const quickLinks = ${getField('quickLinks')};
  const socialIcons = ${getField('socialIcons')};
  const copyrightText = ${getField('copyrightText')};
  const autoUpdateYear = ${getField('autoUpdateYear')};

  useEffect(() => {
    if (autoUpdateYear) {
      setCurrentYear(new Date().getFullYear());
    }
  }, [autoUpdateYear]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    e.preventDefault();
    console.log(\`Clicked: \${label}\`);
  };

  const handleSocialClick = (e: React.MouseEvent<HTMLAnchorElement>, platform: string) => {
    e.preventDefault();
    console.log(\`Social click: \${platform}\`);
  };

  const getSocialIcon = (icon: string) => {
    const icons: any = {
      twitter: Twitter,
      github: Github,
      linkedin: Linkedin,
      instagram: Instagram,
      facebook: Facebook
    };
    return icons[icon] || Twitter;
  };

  return (
    <footer className={cn('bg-gradient-to-b from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-black border-t-2 border-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500', className)}>
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Single Row Layout */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand & Copyright */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl shadow-lg"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">{brandName}</span>
            </div>
            <span className="text-sm text-gray-500 hidden md:block">•</span>
            <p className="text-sm text-gray-400">
              {autoUpdateYear ? copyrightText.replace(/\\d{4}/, String(currentYear)) : copyrightText}
            </p>
          </div>

          {/* Quick Links */}
          <nav className="flex items-center gap-8">
            {quickLinks.map((link: any, index: number) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.label)}
                className="text-sm text-gray-400 hover:text-emerald-400 transition-all duration-300 hover:translate-y-[-2px]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {socialIcons.map((social: any, index: number) => {
              const Icon = getSocialIcon(social.icon);
              const gradients = ['from-emerald-500 to-emerald-700', 'from-teal-500 to-teal-700', 'from-cyan-500 to-cyan-700', 'from-blue-500 to-blue-700'];
              const gradient = gradients[index % gradients.length];
              return (
                <a
                  key={index}
                  href={social.url}
                  onClick={(e) => handleSocialClick(e, social.platform)}
                  className={\`w-11 h-11 bg-gradient-to-br \${gradient} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl group\`}
                >
                  <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
    `,

    compact: `
${commonImports}

interface FooterProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function Footer({ ${dataName}: propData, className }: FooterProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const footerData = ${dataName} || {};
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showBackToTop, setShowBackToTop] = useState(false);

  const brandName = ${getField('brandName')};
  const quickLinks = ${getField('quickLinks')};
  const legalLinks = ${getField('legalLinks')};
  const socialIcons = ${getField('socialIcons')};
  const copyrightText = ${getField('copyrightText')};
  const autoUpdateYear = ${getField('autoUpdateYear')};

  useEffect(() => {
    if (autoUpdateYear) {
      setCurrentYear(new Date().getFullYear());
    }

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [autoUpdateYear]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    e.preventDefault();
    console.log(\`Clicked: \${label}\`);
  };

  const handleSocialClick = (e: React.MouseEvent<HTMLAnchorElement>, platform: string) => {
    e.preventDefault();
    console.log(\`Social click: \${platform}\`);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSocialIcon = (icon: string) => {
    const icons: any = {
      twitter: Twitter,
      github: Github,
      linkedin: Linkedin,
      instagram: Instagram,
      facebook: Facebook
    };
    return icons[icon] || Twitter;
  };

  return (
    <>
      <footer className={cn('bg-gradient-to-b from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-black text-white border-t-2 border-gradient-to-r from-purple-500 via-pink-500 to-rose-500', className)}>
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Compact Two-Row Layout */}
          <div className="space-y-6">
            {/* Top Row - Brand, Links, Social */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl shadow-lg"></div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">{brandName}</span>
              </div>

              {/* Quick Links */}
              <nav className="flex items-center gap-6">
                {quickLinks.slice(0, 4).map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-sm text-gray-400 hover:text-pink-400 transition-all duration-300 hover:translate-y-[-2px]"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {socialIcons.slice(0, 4).map((social: any, index: number) => {
                  const Icon = getSocialIcon(social.icon);
                  const gradients = ['from-purple-500 to-purple-700', 'from-pink-500 to-pink-700', 'from-rose-500 to-rose-700', 'from-fuchsia-500 to-fuchsia-700'];
                  const gradient = gradients[index % gradients.length];
                  return (
                    <a
                      key={index}
                      href={social.url}
                      onClick={(e) => handleSocialClick(e, social.platform)}
                      className={\`w-10 h-10 bg-gradient-to-br \${gradient} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl group\`}
                    >
                      <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Bottom Row - Copyright & Legal */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gradient-to-r from-purple-500/20 via-pink-500/20 to-rose-500/20 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span>{autoUpdateYear ? copyrightText.replace(/\\d{4}/, String(currentYear)) : copyrightText}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline flex items-center gap-1">
                  Made with <Heart className="w-4 h-4 text-pink-500 fill-pink-500 inline animate-pulse" />
                </span>
              </div>

              <div className="flex items-center gap-6">
                {legalLinks.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="hover:text-pink-400 transition-all duration-300 hover:translate-y-[-2px]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group z-50 hover:scale-110"
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
        </button>
      )}
    </>
  );
}
    `
  };

  return variants[variant] || variants.centered;
};
