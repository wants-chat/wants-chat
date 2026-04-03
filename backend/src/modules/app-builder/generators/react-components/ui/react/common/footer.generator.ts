import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFooter = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'newsletter' | 'minimal' | 'withCta' | 'featured' = 'standard'
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

  const variants = {
    standard: `
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface FooterProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onLinkClick?: (label: string) => void;
  onSocialClick?: (platform: string) => void;
}

export default function Footer({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME,
  onLinkClick,
  onSocialClick
}: FooterProps) {
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

  const styles = getVariantStyles(variant, colorScheme);
  const footerData = ${dataName} || {};

  // Default footer data for ecommerce
  const defaultProductLinks = [
    { label: 'All Products', href: '/marketplace' },
    { label: 'Categories', href: '/categories' },
    { label: 'New Arrivals', href: '/new' },
    { label: 'Best Sellers', href: '/bestsellers' }
  ];

  const defaultCompanyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' }
  ];

  const defaultResourcesLinks = [
    { label: 'Help Center', href: '/help' },
    { label: 'FAQs', href: '/faq' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns', href: '/returns' }
  ];

  const defaultLegalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' }
  ];

  const defaultSocialLinks = [
    { platform: 'facebook', url: '#' },
    { platform: 'twitter', url: '#' },
    { platform: 'instagram', url: '#' },
    { platform: 'linkedin', url: '#' }
  ];

  const brandName = ${getField('brandName')} || 'AgriMarket';
  const brandDescription = ${getField('brandDescription')} || 'Your trusted agricultural marketplace connecting farmers with consumers. Fresh, organic, and sustainable products delivered to your door.';
  const productLinks = ${getField('productLinks')} && Array.isArray(${getField('productLinks')}) && ${getField('productLinks')}.length > 0 ? ${getField('productLinks')} : defaultProductLinks;
  const companyLinks = ${getField('companyLinks')} && Array.isArray(${getField('companyLinks')}) && ${getField('companyLinks')}.length > 0 ? ${getField('companyLinks')} : defaultCompanyLinks;
  const resourcesLinks = ${getField('resourcesLinks')} && Array.isArray(${getField('resourcesLinks')}) && ${getField('resourcesLinks')}.length > 0 ? ${getField('resourcesLinks')} : defaultResourcesLinks;
  const legalLinks = ${getField('legalLinks')} && Array.isArray(${getField('legalLinks')}) && ${getField('legalLinks')}.length > 0 ? ${getField('legalLinks')} : defaultLegalLinks;
  const copyrightText = ${getField('copyrightText')} || \`© \${new Date().getFullYear()} \${brandName || 'AgriMarket'}. All rights reserved.\`;
  const bottomLinks = ${getField('bottomLinks')} && Array.isArray(${getField('bottomLinks')}) && ${getField('bottomLinks')}.length > 0 ? ${getField('bottomLinks')} : defaultLegalLinks;
  const socialLinks = ${getField('socialLinks')} && Array.isArray(${getField('socialLinks')}) && ${getField('socialLinks')}.length > 0 ? ${getField('socialLinks')} : defaultSocialLinks;

  return (
    <footer className={cn(styles.background, 'border-t', styles.border, className)}>
      <div className="max-w-7xl mx-auto px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className={cn('w-10 h-10 rounded-xl shadow-lg', styles.badge)}></div>
              <span className={\`text-2xl font-bold \${styles.title}\`}>{brandName}</span>
            </div>
            <p className={\`text-sm mb-8 max-w-sm leading-relaxed \${styles.subtitle}\`}>
              {brandDescription}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social: any, index: number) => {
                const iconMap: any = {
                  facebook: Facebook,
                  twitter: Twitter,
                  instagram: Instagram,
                  linkedin: Linkedin
                };
                const Icon = iconMap[social.platform?.toLowerCase()] || Facebook;
                return (
                  <a
                    key={index}
                    href={social.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (onSocialClick) {
                        e.preventDefault();
                        onSocialClick(social.platform);
                      }
                    }}
                    className={cn(styles.badge, 'w-12 h-12 rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl group')}
                  >
                    <Icon className={\`w-5 h-5 group-hover:scale-110 transition-transform \${styles.accent}\`} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className={\`font-semibold mb-5 text-lg \${styles.title}\`}>Product</h3>
            <ul className="space-y-4">
              {productLinks.map((link: any, index: number) => (
                <li key={index}>
                  <Link to={link.href} className={\`text-sm transition-all duration-300 hover:translate-x-1 inline-block group \${styles.text}\`}>
                    <span className="group-hover:underline">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className={\`font-semibold mb-5 text-lg \${styles.title}\`}>Company</h3>
            <ul className="space-y-4">
              {companyLinks.map((link: any, index: number) => (
                <li key={index}>
                  <Link to={link.href} className={\`text-sm transition-all duration-300 hover:translate-x-1 inline-block group \${styles.text}\`}>
                    <span className="group-hover:underline">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className={\`font-semibold mb-5 text-lg \${styles.title}\`}>Resources</h3>
            <ul className="space-y-4">
              {resourcesLinks.map((link: any, index: number) => (
                <li key={index}>
                  <Link to={link.href} className={\`text-sm transition-all duration-300 hover:translate-x-1 inline-block group \${styles.text}\`}>
                    <span className="group-hover:underline">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className={\`font-semibold mb-5 text-lg \${styles.title}\`}>Legal</h3>
            <ul className="space-y-4">
              {legalLinks.map((link: any, index: number) => (
                <li key={index}>
                  <Link to={link.href} className={\`text-sm transition-all duration-300 hover:translate-x-1 inline-block group \${styles.text}\`}>
                    <span className="group-hover:underline">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={\`pt-10 mt-12 border-t \${styles.border}\`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className={\`text-sm \${styles.subtitle}\`}>
              {copyrightText}
            </p>
            <div className={\`flex items-center gap-8 text-sm \${styles.subtitle}\`}>
              {bottomLinks.map((link: any, index: number) => (
                <Link key={index} to={typeof link === 'string' ? \`/\${link.toLowerCase().replace(/\\s+/g, '-')}\` : link.href} className="hover:opacity-80 transition-all duration-300 hover:translate-y-[-2px]">
                  {typeof link === 'string' ? link : link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
    `,

    newsletter: `
import { Mail, ArrowRight, MapPin, Phone, Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface FooterProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onLinkClick?: (label: string) => void;
  onSocialClick?: (platform: string) => void;
  onSubscribe?: (email: string) => void;
  onCtaClick?: (action: string) => void;
  onContactClick?: (type: string) => void;
  onLanguageClick?: (language: string) => void;
}

export default function Footer({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: FooterProps) {
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

  const styles = getVariantStyles(variant, colorScheme);
  const footerData = ${dataName} || {};
  const [email, setEmail] = useState('');

  const newsletterTitle = ${getField('newsletterTitle')};
  const newsletterDescription = ${getField('newsletterDescription')};
  const newsletterPlaceholder = ${getField('newsletterPlaceholder')};
  const subscribeButtonText = ${getField('subscribeButtonText')};
  const newsletterPrivacy = ${getField('newsletterPrivacy')};
  const solutionsLinks = ${getField('solutionsLinks')};
  const supportLinks = ${getField('supportLinks')};
  const companyLinks = ${getField('companyLinks')};
  const legalLinks = ${getField('legalLinks')};
  const address = ${getField('address')};
  const phone = ${getField('phone')};
  const emailContact = ${getField('email')};
  const brandName = ${getField('brandName')};
  const copyrightLong = ${getField('copyrightLong')};

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribe:', email);
    setEmail('');
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    e.preventDefault();
    console.log(\`Clicked: \${label}\`);
  };

  return (
    <footer className={cn(styles.background, 'border-t', styles.border, className)}>
      <div className="max-w-7xl mx-auto px-8 py-16 lg:py-20">
        {/* Newsletter Section */}
        <div className={\`mb-16 pb-16 border-b \${styles.border}\`}>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className={\`text-4xl md:text-5xl font-bold mb-5 \${styles.title}\`}>
                {newsletterTitle}
              </h2>
              <p className={\`text-lg leading-relaxed \${styles.subtitle}\`}>
                {newsletterDescription}
              </p>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={newsletterPlaceholder}
                  className={cn(styles.card, 'flex-1 px-6 py-5 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300', styles.text)}
                />
                <button type="submit" className={cn(styles.button, styles.buttonHover, 'px-8 py-5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl hover:scale-105')}>
                  {subscribeButtonText}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
              <p className={\`text-sm mt-3 \${styles.subtitle}\`}>
                {newsletterPrivacy.split('Privacy Policy')[0]}
                <a href="#" onClick={(e) => handleLinkClick(e, 'Privacy Policy')} className={\`underline \${styles.accent}\`}>
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div>
            <h3 className={\`font-semibold mb-5 text-lg \${styles.title}\`}>Solutions</h3>
            <ul className="space-y-4">
              {solutionsLinks.map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.href} onClick={(e) => handleLinkClick(e, link.label)} className={\`text-sm transition-all duration-300 hover:translate-x-1 inline-block group \${styles.text}\`}>
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={\`font-semibold mb-5 text-lg \${styles.title}\`}>Support</h3>
            <ul className="space-y-4">
              {supportLinks.map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.href} onClick={(e) => handleLinkClick(e, link.label)} className={\`text-sm transition-all duration-300 hover:translate-x-1 inline-block group \${styles.text}\`}>
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={\`font-semibold mb-5 text-lg \${styles.title}\`}>Company</h3>
            <ul className="space-y-4">
              {companyLinks.map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.href} onClick={(e) => handleLinkClick(e, link.label)} className={\`text-sm transition-all duration-300 hover:translate-x-1 inline-block group \${styles.text}\`}>
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={\`font-semibold mb-5 text-lg \${styles.title}\`}>Legal</h3>
            <ul className="space-y-4">
              {legalLinks.map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.href} onClick={(e) => handleLinkClick(e, link.label)} className={\`text-sm transition-all duration-300 hover:translate-x-1 inline-block group \${styles.text}\`}>
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className={\`flex flex-wrap gap-6 mb-12 text-sm \${styles.subtitle}\`}>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>{emailContact}</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={\`pt-10 mt-12 border-t flex flex-col md:flex-row justify-between items-center gap-6 \${styles.border}\`}>
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl shadow-lg', styles.badge)}></div>
            <span className={\`text-xl font-bold \${styles.title}\`}>{brandName}</span>
          </div>
          <p className={\`text-sm \${styles.subtitle}\`}>
            {copyrightLong}
          </p>
        </div>
      </div>
    </footer>
  );
}
    `,

    minimal: `
import { Github, Twitter, Linkedin, Youtube, Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface FooterProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onLinkClick?: (label: string) => void;
  onSocialClick?: (platform: string) => void;
  onSubscribe?: (email: string) => void;
  onCtaClick?: (action: string) => void;
  onContactClick?: (type: string) => void;
  onLanguageClick?: (language: string) => void;
}

export default function Footer({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: FooterProps) {
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

  const styles = getVariantStyles(variant, colorScheme);
  const footerData = ${dataName} || {};

  const brandName = ${getField('brandName')};
  const tagline = ${getField('tagline')};
  const platformLinks = ${getField('platformLinks')};
  const developersLinks = ${getField('developersLinks')};
  const companyLinks = ${getField('companyLinks')};
  const madeWithLove = ${getField('madeWithLove')};
  const copyrightShort = ${getField('copyrightShort')};
  const legalBottomLinks = ${getField('legalBottomLinks')};

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    e.preventDefault();
    console.log(\`Clicked: \${label}\`);
  };

  const handleSocialClick = (e: React.MouseEvent<HTMLAnchorElement>, platform: string) => {
    e.preventDefault();
    console.log(\`Social click: \${platform}\`);
  };

  return (
    <footer className={cn(styles.background, className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className={cn('w-10 h-10 rounded-xl', styles.badge)}></div>
              <span className={\`text-2xl font-bold \${styles.title}\`}>{brandName}</span>
            </div>
            <p className={\`mb-6 max-w-md leading-relaxed \${styles.subtitle}\`}>
              {tagline}
            </p>
            <div className="flex gap-3">
              {[
                { icon: Github, href: '#', name: 'Github' },
                { icon: Twitter, href: '#', name: 'Twitter' },
                { icon: Linkedin, href: '#', name: 'LinkedIn' },
                { icon: Youtube, href: '#', name: 'YouTube' }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  onClick={(e) => handleSocialClick(e, social.name)}
                  className={cn(styles.card, styles.cardHover, 'w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110')}
                >
                  <social.icon className={\`w-5 h-5 \${styles.accent}\`} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className={\`font-semibold mb-5 \${styles.title}\`}>Platform</h3>
            <ul className="space-y-3">
              {platformLinks.map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.href} onClick={(e) => handleLinkClick(e, link.label)} className={\`text-sm transition-colors \${styles.text}\`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h3 className={\`font-semibold mb-5 \${styles.title}\`}>Developers</h3>
            <ul className="space-y-3">
              {developersLinks.map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.href} onClick={(e) => handleLinkClick(e, link.label)} className={\`text-sm transition-colors \${styles.text}\`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className={\`font-semibold mb-5 \${styles.title}\`}>Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.href} onClick={(e) => handleLinkClick(e, link.label)} className={\`text-sm transition-colors \${styles.text}\`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={\`pt-8 border-t \${styles.border}\`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={\`flex items-center gap-1 text-sm \${styles.subtitle}\`}>
              <span>{madeWithLove.split('love')[0]}love</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              <span>{madeWithLove.split('love')[1]}</span>
            </div>
            <div className={\`flex flex-wrap items-center gap-6 text-sm \${styles.subtitle}\`}>
              <span>{copyrightShort}</span>
              {legalBottomLinks.map((link: string, i: number) => (
                <a key={i} href="#" onClick={(e) => handleLinkClick(e, link)} className="hover:opacity-80 transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
    `,

    withCta: `
import { Smartphone, Mail, MessageCircle, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface FooterProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onLinkClick?: (label: string) => void;
  onSocialClick?: (platform: string) => void;
  onSubscribe?: (email: string) => void;
  onCtaClick?: (action: string) => void;
  onContactClick?: (type: string) => void;
  onLanguageClick?: (language: string) => void;
}

export default function Footer({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: FooterProps) {
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

  const styles = getVariantStyles(variant, colorScheme);
  const footerData = ${dataName} || {};

  const ctaTitle = ${getField('ctaTitle')};
  const ctaDescription = ${getField('ctaDescription')};
  const ctaPrimaryButton = ${getField('ctaPrimaryButton')};
  const ctaSecondaryButton = ${getField('ctaSecondaryButton')};
  const productLinks = ${getField('productLinks')};
  const resourcesLinks = ${getField('resourcesLinks')};
  const companyLinks = ${getField('companyLinks')};
  const contactMethods = ${getField('contactMethods')};
  const brandName = ${getField('brandName')};
  const builtForDevelopers = ${getField('builtForDevelopers')};
  const quickLinks = ${getField('quickLinks')};

  const handleCtaClick = (action: string) => {
    console.log(\`CTA clicked: \${action}\`);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    e.preventDefault();
    console.log(\`Clicked: \${label}\`);
  };

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>, type: string) => {
    e.preventDefault();
    console.log(\`Contact method: \${type}\`);
  };

  return (
    <footer className={cn(styles.background, className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* CTA Section */}
        <div className={cn(styles.gradient, 'rounded-3xl p-8 lg:p-12 mb-16')}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {ctaTitle}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {ctaDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => handleCtaClick(ctaPrimaryButton)} className="bg-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-gray-900">
                {ctaPrimaryButton}
              </button>
              <button onClick={() => handleCtaClick(ctaSecondaryButton)} className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                {ctaSecondaryButton}
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className={\`font-semibold mb-4 \${styles.title}\`}>Product</h3>
            <ul className="space-y-3">
              {productLinks.map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.href} onClick={(e) => handleLinkClick(e, link.label)} className={\`text-sm transition-colors \${styles.text}\`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={\`font-semibold mb-4 \${styles.title}\`}>Resources</h3>
            <ul className="space-y-3">
              {resourcesLinks.map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.href} onClick={(e) => handleLinkClick(e, link.label)} className={\`text-sm transition-colors \${styles.text}\`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={\`font-semibold mb-4 \${styles.title}\`}>Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.href} onClick={(e) => handleLinkClick(e, link.label)} className={\`text-sm transition-colors \${styles.text}\`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={\`font-semibold mb-4 \${styles.title}\`}>Connect</h3>
            <div className="space-y-4">
              {contactMethods.map((method: any, i: number) => (
                <a key={i} href="#" onClick={(e) => handleContactClick(e, method.type)} className={\`flex items-center gap-3 text-sm transition-colors \${styles.text}\`}>
                  <div className={cn(styles.badge, 'w-10 h-10 rounded-lg flex items-center justify-center')}>
                    {method.type === 'email' && <Mail className={\`w-5 h-5 \${styles.accent}\`} />}
                    {method.type === 'chat' && <MessageCircle className={\`w-5 h-5 \${styles.accent}\`} />}
                    {method.type === 'phone' && <Smartphone className={\`w-5 h-5 \${styles.accent}\`} />}
                  </div>
                  <span>{method.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={\`pt-8 border-t \${styles.border}\`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-lg', styles.badge)}></div>
              <span className={\`text-lg font-bold \${styles.title}\`}>{brandName}</span>
            </div>
            <p className={\`text-sm \${styles.subtitle}\`}>
              {builtForDevelopers}
            </p>
            <div className="flex gap-4">
              {quickLinks.map((link: string, i: number) => (
                <a key={i} href="#" onClick={(e) => handleLinkClick(e, link)} className={\`text-sm transition-colors \${styles.text}\`}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
    `,

    featured: `
import { ArrowRight, Award, Shield, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface FooterProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onLinkClick?: (label: string) => void;
  onSocialClick?: (platform: string) => void;
  onSubscribe?: (email: string) => void;
  onCtaClick?: (action: string) => void;
  onContactClick?: (type: string) => void;
  onLanguageClick?: (language: string) => void;
}

export default function Footer({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: FooterProps) {
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

  const styles = getVariantStyles(variant, colorScheme);
  const footerData = ${dataName} || {};
  const [email, setEmail] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('🇺🇸');

  const features = ${getField('features')};
  const brandName = ${getField('brandName')};
  const modernPlatform = ${getField('modernPlatform')};
  const newsletterPlaceholder = ${getField('newsletterPlaceholder')};
  const platformLinks = ${getField('platformLinks')};
  const resourcesLinks = ${getField('resourcesLinks')};
  const companyLinks = ${getField('companyLinks')};
  const copyrightLong = ${getField('copyrightLong')};
  const legalBottomLinks = ${getField('legalBottomLinks')};

  const iconMap: any = {
    'Secure': Shield,
    'Fast': Zap,
    'Trusted': Award
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscribe:', email);
    setEmail('');
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    e.preventDefault();
    console.log(\`Clicked: \${label}\`);
  };

  const handleLanguageClick = (language: string) => {
    setSelectedLanguage(language);
    console.log('Language selected:', language);
  };

  return (
    <footer className={cn(styles.background, className)}>
      {/* Features Bar */}
      <div className={\`border-b \${styles.border}\`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature: any, i: number) => {
              const Icon = iconMap[feature.title] || Shield;
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className={cn(styles.badge, 'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0')}>
                    <Icon className={\`w-6 h-6 \${styles.accent}\`} />
                  </div>
                  <div>
                    <h3 className={\`font-semibold text-lg mb-1 \${styles.title}\`}>{feature.title}</h3>
                    <p className={\`text-sm \${styles.subtitle}\`}>{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-6">
              <div className={cn('w-10 h-10 rounded-xl', styles.badge)}></div>
              <span className={\`text-2xl font-bold \${styles.title}\`}>{brandName}</span>
            </div>
            <p className={\`mb-8 leading-relaxed max-w-md \${styles.subtitle}\`}>
              {modernPlatform}
            </p>

            <div className="mb-6">
              <h3 className={\`text-sm font-semibold mb-3 \${styles.title}\`}>Subscribe to our newsletter</h3>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={newsletterPlaceholder}
                  className={cn(styles.card, 'flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 text-sm', styles.text)}
                />
                <button type="submit" className={cn(styles.button, styles.buttonHover, 'px-4 py-3 rounded-lg transition-colors')}>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className={\`font-semibold mb-4 \${styles.title}\`}>Platform</h3>
              <ul className="space-y-3">
                {platformLinks.map((link: any, i: number) => (
                  <li key={i}>
                    <a href={link.href} onClick={(e) => handleLinkClick(e, link.label)} className={\`text-sm transition-colors \${styles.text}\`}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className={\`font-semibold mb-4 \${styles.title}\`}>Resources</h3>
              <ul className="space-y-3">
                {resourcesLinks.map((link: any, i: number) => (
                  <li key={i}>
                    <a href={link.href} onClick={(e) => handleLinkClick(e, link.label)} className={\`text-sm transition-colors \${styles.text}\`}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className={\`font-semibold mb-4 \${styles.title}\`}>Company</h3>
              <ul className="space-y-3">
                {companyLinks.map((link: any, i: number) => (
                  <li key={i}>
                    <a href={link.href} onClick={(e) => handleLinkClick(e, link.label)} className={\`text-sm transition-colors \${styles.text}\`}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={\`pt-8 border-t \${styles.border}\`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className={\`flex flex-wrap items-center gap-6 text-sm \${styles.subtitle}\`}>
              <span>{copyrightLong}</span>
              {legalBottomLinks.map((link: string, i: number) => (
                <a key={i} href="#" onClick={(e) => handleLinkClick(e, link)} className="hover:opacity-80 transition-colors">{link}</a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                {['🇺🇸', '🇬🇧', '🇩🇪', '🇫🇷', '🇯🇵'].map((flag, i) => (
                  <button
                    key={i}
                    onClick={() => handleLanguageClick(flag)}
                    className={cn(styles.card, styles.cardHover, \`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-sm \${selectedLanguage === flag ? 'ring-2' : ''}\`)}
                  >
                    {flag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
    `
  };

  return variants[variant] || variants.standard;
};
