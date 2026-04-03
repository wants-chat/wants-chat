import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFooterMultiColumn = (
  resolved: ResolvedComponent,
  variant: 'fourColumn' | 'fiveColumn' | 'withNewsletter' = 'fourColumn'
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
import { useState } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Github, Youtube, Mail, Phone, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    fourColumn: `
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

  const brandName = ${getField('brandName')};
  const brandDescription = ${getField('brandDescription')};
  const productSection = ${getField('productSection')};
  const companySection = ${getField('companySection')};
  const resourcesSection = ${getField('resourcesSection')};
  const legalSection = ${getField('legalSection')};
  const socialLinks = ${getField('socialLinks')};
  const copyrightText = ${getField('copyrightText')};

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
      facebook: Facebook,
      twitter: Twitter,
      instagram: Instagram,
      linkedin: Linkedin,
      github: Github,
      youtube: Youtube
    };
    return icons[icon] || Mail;
  };

  return (
    <footer className={cn('bg-gradient-to-b from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-black text-white border-t-2 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500', className)}>
      <div className="max-w-7xl mx-auto px-8 py-16 lg:py-20">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-14 mb-16">
          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg">{productSection.title}</h3>
            <ul className="space-y-4">
              {productSection.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg">{companySection.title}</h3>
            <ul className="space-y-4">
              {companySection.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg">{resourcesSection.title}</h3>
            <ul className="space-y-4">
              {resourcesSection.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg">{legalSection.title}</h3>
            <ul className="space-y-4">
              {legalSection.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Brand & Social Section */}
        <div className="pt-10 border-t border-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Brand */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg"></div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{brandName}</span>
              </div>
              <p className="text-sm text-gray-300 max-w-md text-center md:text-left leading-relaxed">
                {brandDescription}
              </p>
            </div>

            {/* Social Links */}
            <div className="flex flex-col items-center md:items-end gap-5">
              <div className="flex gap-3">
                {socialLinks.map((social: any, index: number) => {
                  const Icon = getSocialIcon(social.icon);
                  const gradients = ['from-blue-500 to-blue-700', 'from-purple-500 to-purple-700', 'from-pink-500 to-pink-700', 'from-indigo-500 to-indigo-700', 'from-violet-500 to-violet-700', 'from-fuchsia-500 to-fuchsia-700'];
                  const gradient = gradients[index % gradients.length];
                  return (
                    <a
                      key={index}
                      href={social.url}
                      onClick={(e) => handleSocialClick(e, social.platform)}
                      className={\`w-12 h-12 bg-gradient-to-br \${gradient} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl group\`}
                    >
                      <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </a>
                  );
                })}
              </div>
              <p className="text-sm text-gray-400">{copyrightText}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
    `,

    fiveColumn: `
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

  const brandName = ${getField('brandName')};
  const brandDescription = ${getField('brandDescription')};
  const productSection = ${getField('productSection')};
  const companySection = ${getField('companySection')};
  const resourcesSection = ${getField('resourcesSection')};
  const legalSection = ${getField('legalSection')};
  const supportSection = ${getField('supportSection')};
  const socialLinks = ${getField('socialLinks')};
  const paymentMethods = ${getField('paymentMethods')};
  const copyrightText = ${getField('copyrightText')};

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
      facebook: Facebook,
      twitter: Twitter,
      instagram: Instagram,
      linkedin: Linkedin,
      github: Github,
      youtube: Youtube
    };
    return icons[icon] || Mail;
  };

  return (
    <footer className={cn('bg-gradient-to-b from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-black border-t-2 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500', className)}>
      <div className="max-w-7xl mx-auto px-8 py-16 lg:py-20">
        {/* Main Grid - 5 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-14 mb-16">
          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg">{productSection.title}</h3>
            <ul className="space-y-4">
              {productSection.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg">{companySection.title}</h3>
            <ul className="space-y-4">
              {companySection.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg">{resourcesSection.title}</h3>
            <ul className="space-y-4">
              {resourcesSection.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg">{supportSection.title}</h3>
            <ul className="space-y-4">
              {supportSection.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg">{legalSection.title}</h3>
            <ul className="space-y-4">
              {legalSection.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-10 border-t border-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{brandName}</span>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-wrap justify-center gap-3">
              {paymentMethods.map((method: string, index: number) => (
                <div
                  key={index}
                  className="w-12 h-8 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center"
                >
                  <CreditCard className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>

            {/* Social & Copyright */}
            <div className="flex flex-col items-end gap-5">
              <div className="flex gap-3">
                {socialLinks.slice(0, 4).map((social: any, index: number) => {
                  const Icon = getSocialIcon(social.icon);
                  const gradients = ['from-blue-500 to-blue-700', 'from-purple-500 to-purple-700', 'from-pink-500 to-pink-700', 'from-indigo-500 to-indigo-700'];
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
              <p className="text-sm text-gray-400">{copyrightText}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
    `,

    withNewsletter: `
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
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const brandName = ${getField('brandName')};
  const newsletterTitle = ${getField('newsletterTitle')};
  const newsletterDescription = ${getField('newsletterDescription')};
  const newsletterPlaceholder = ${getField('newsletterPlaceholder')};
  const subscribeButtonText = ${getField('subscribeButtonText')};
  const newsletterPrivacy = ${getField('newsletterPrivacy')};
  const productSection = ${getField('productSection')};
  const companySection = ${getField('companySection')};
  const resourcesSection = ${getField('resourcesSection')};
  const legalSection = ${getField('legalSection')};
  const socialLinks = ${getField('socialLinks')};
  const copyrightText = ${getField('copyrightText')};
  const emailContact = ${getField('email')};
  const phone = ${getField('phone')};

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    console.log('Subscribe:', email);
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail('');
    }, 1000);
  };

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
      facebook: Facebook,
      twitter: Twitter,
      instagram: Instagram,
      linkedin: Linkedin,
      github: Github,
      youtube: Youtube
    };
    return icons[icon] || Mail;
  };

  return (
    <footer className={cn('bg-gradient-to-b from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-black text-white border-t-2 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500', className)}>
      <div className="max-w-7xl mx-auto px-8 py-16 lg:py-20">
        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-10 lg:p-14 mb-16 shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">{newsletterTitle}</h2>
              <p className="text-blue-100 text-lg leading-relaxed">{newsletterDescription}</p>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Mail className="w-5 h-5 absolute left-5 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={newsletterPlaceholder}
                    required
                    className="w-full pl-14 pr-5 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-white text-blue-600 px-10 py-5 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  {isSubscribing ? 'Subscribing...' : subscribeButtonText}
                </button>
              </form>
              <p className="text-sm text-white/70 mt-3">
                {newsletterPrivacy.split('Privacy Policy')[0]}
                <a href="#" onClick={(e) => handleLinkClick(e, 'Privacy Policy')} className="underline hover:text-white">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-14 mb-16">
          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg">{productSection.title}</h3>
            <ul className="space-y-4">
              {productSection.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg">{companySection.title}</h3>
            <ul className="space-y-4">
              {companySection.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg">{resourcesSection.title}</h3>
            <ul className="space-y-4">
              {resourcesSection.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg">{legalSection.title}</h3>
            <ul className="space-y-4">
              {legalSection.links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.label)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="group-hover:underline">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap gap-6 mb-12 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <a href={\`mailto:\${emailContact}\`} className="hover:text-white transition-colors">
              {emailContact}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <a href={\`tel:\${phone}\`} className="hover:text-white transition-colors">
              {phone}
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-10 border-t border-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Brand & Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg"></div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{brandName}</span>
              </div>
              <p className="text-sm text-gray-400">{copyrightText}</p>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social: any, index: number) => {
                const Icon = getSocialIcon(social.icon);
                const gradients = ['from-blue-500 to-blue-700', 'from-purple-500 to-purple-700', 'from-pink-500 to-pink-700', 'from-indigo-500 to-indigo-700', 'from-violet-500 to-violet-700', 'from-fuchsia-500 to-fuchsia-700'];
                const gradient = gradients[index % gradients.length];
                return (
                  <a
                    key={index}
                    href={social.url}
                    onClick={(e) => handleSocialClick(e, social.platform)}
                    className={\`w-12 h-12 bg-gradient-to-br \${gradient} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl group\`}
                  >
                    <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
    `
  };

  return variants[variant] || variants.fourColumn;
};
