/**
 * Footer Generator
 *
 * Generates footer components with:
 * - Multi-column layout
 * - Link sections
 * - Social media links
 * - Newsletter signup
 * - Copyright notice
 */

export interface FooterLinkSection {
  title: string;
  links: { label: string; path: string }[];
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'github';
  url: string;
}

export interface FooterOptions {
  componentName?: string;
  appName?: string;
  logo?: string;
  description?: string;
  linkSections: FooterLinkSection[];
  socialLinks?: SocialLink[];
  showNewsletter?: boolean;
  copyrightText?: string;
}

/**
 * Generate a footer component
 */
export function generateFooter(options: FooterOptions): string {
  const {
    appName = 'App',
    logo,
    description,
    linkSections,
    socialLinks = [],
    showNewsletter = false,
    copyrightText,
  } = options;

  const componentName = options.componentName || 'Footer';

  // Collect social icons
  const socialIcons: Record<string, string> = {
    facebook: 'Facebook',
    twitter: 'Twitter',
    instagram: 'Instagram',
    linkedin: 'Linkedin',
    youtube: 'Youtube',
    github: 'Github',
  };

  const usedSocialIcons = socialLinks.map(s => socialIcons[s.platform]).filter(Boolean);
  const icons = ['Mail', 'Send', ...usedSocialIcons];

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ${[...new Set(icons)].join(', ')} } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  className?: string;
}

const linkSections = ${JSON.stringify(linkSections, null, 2)};

const socialLinks = ${JSON.stringify(socialLinks, null, 2)};

const socialIcons: Record<string, React.FC<any>> = {
  ${socialLinks.map(s => `${s.platform}: ${socialIcons[s.platform]}`).join(',\n  ')}
};

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  ${showNewsletter ? `const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // TODO: Implement newsletter subscription
      console.log('Subscribe:', email);
      setSubscribed(true);
      setEmail('');
    }
  };` : ''}

  return (
    <footer className={cn('bg-gray-900 text-white', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${linkSections.length + 1} gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              ${logo ? `<img src="${logo}" alt="${appName}" className="w-8 h-8" />` : `<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">${appName.charAt(0)}</div>`}
              <span className="text-xl font-semibold">${appName}</span>
            </Link>
            ${description ? `<p className="text-gray-400 text-sm mb-6">${description}</p>` : ''}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const Icon = socialIcons[social.platform];
                  return Icon ? (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Link Sections */}
          {linkSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          ${showNewsletter ? `{/* Newsletter */}
          <div>
            <h3 className="font-semibold text-white mb-4">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for updates and news.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-green-400">
                <Mail className="w-5 h-5" />
                <span>Thanks for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>` : ''}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            ${copyrightText || `© ${new Date().getFullYear()} ${appName}. All rights reserved.`}
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ${componentName};
`;
}
