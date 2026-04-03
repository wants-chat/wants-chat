import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSitemapContent = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'hierarchical' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) return part;
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

  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'sitemap'}`;
  };
  const apiRoute = getApiRoute();
  const entity = dataSource || 'sitemap';

  const variants = {
    standard: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronRight, Loader2 } from 'lucide-react';

interface SitemapContentProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SitemapContent({ ${dataName}: propData, className }: SitemapContentProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const content = ${dataName} || {};
  const appName = content.appName || content.companyName || content.organizationName || 'Company';
  const title = content.title || 'Sitemap';
  const description = content.description || \`Browse all pages and sections of \${appName}.\`;

  const sections = content.sections || [
    {
      title: 'Main Pages',
      links: [
        { label: 'Home', path: '/' },
        { label: 'About Us', path: '/about' },
        { label: 'Contact', path: '/contact' },
      ]
    },
    {
      title: 'Products & Services',
      links: [
        { label: 'Products', path: '/products' },
        { label: 'Pricing', path: '/pricing' },
        { label: 'Features', path: '/features' },
      ]
    },
    {
      title: 'Account',
      links: [
        { label: 'Login', path: '/login' },
        { label: 'Register', path: '/register' },
        { label: 'My Account', path: '/profile' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Cookie Policy', path: '/cookies' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Blog', path: '/blog' },
        { label: 'Help Center', path: '/help' },
        { label: 'FAQ', path: '/faq' },
      ]
    }
  ];

  return (
    <div className={cn('max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12', className)}>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((section, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              {section.title}
            </h2>
            <ul className="space-y-3">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <Link
                    to={link.path}
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Can't find what you're looking for? <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact us</Link>
        </p>
      </div>
    </div>
  );
}
    `,

    hierarchical: `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

interface SitemapContentProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SitemapContent({ ${dataName}: propData, className }: SitemapContentProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const content = ${dataName} || {};
  const appName = content.appName || content.companyName || content.organizationName || 'Company';
  const title = content.title || 'Sitemap';
  const description = content.description || \`Browse all pages and sections of \${appName}.\`;

  const sections = content.sections || [
    {
      title: 'Main Pages',
      links: [
        { label: 'Home', path: '/' },
        { label: 'About Us', path: '/about' },
        { label: 'Contact', path: '/contact' },
      ]
    }
  ];

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className={cn('max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12', className)}>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        {description}
      </p>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(index)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h2>
              {expandedSections.has(index) ? (
                <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            {expandedSections.has(index) && (
              <ul className="p-4 space-y-2 bg-white dark:bg-gray-900">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.standard;
};
