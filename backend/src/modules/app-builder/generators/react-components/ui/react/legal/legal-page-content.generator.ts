import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateLegalPageContent = (
  resolved: ResolvedComponent,
  variant: 'privacy' | 'terms' | 'cookies' = 'privacy'
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
  const entity = dataSource?.split('.').pop() || 'data';

  const variants = {
    privacy: `
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface LegalPageContentProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function LegalPageContent({ ${dataName}: propData, className }: LegalPageContentProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
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

  const content = ${dataName} || {};
  const title = content.title || 'Privacy Policy';
  const lastUpdated = content.lastUpdated || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const companyName = content.companyName || content.appName || content.organizationName || 'Company';
  const email = content.email || content.supportEmail || 'privacy@' + (content.domain || 'company.com');
  const address = content.address || '123 Business St, City, State 12345';

  return (
    <div className={cn('max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 dark:bg-gray-900 min-h-screen', className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-12 md:p-16">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">{title}</h1>
          <div className="flex items-center gap-2 mb-8">
            <span className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm">
              Last updated: {lastUpdated}
            </span>
          </div>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We collect information that you provide directly to us, including when you create an account,
            make a purchase, or contact us for support. This may include your name, email address,
            phone number, payment information, and any other information you choose to provide.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-8 text-lg text-gray-700 dark:text-gray-300 space-y-3 mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends, usage, and activities</li>
          </ul>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Information Sharing</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We do not sell, trade, or otherwise transfer your personal information to third parties
            without your consent, except as described in this Privacy Policy. We may share your information with:
          </p>
          <ul className="list-disc pl-8 text-lg text-gray-700 dark:text-gray-300 space-y-3 mb-4">
            <li>Service providers who assist in our operations</li>
            <li>Professional advisors such as lawyers and accountants</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Data Security</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal
            information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Your Rights</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            You have the right to access, update, or delete your personal information. You may also
            have the right to restrict or object to certain processing of your data.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Cookies</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We use cookies and similar tracking technologies to track activity on our service and
            hold certain information. You can instruct your browser to refuse all cookies or to
            indicate when a cookie is being sent.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Changes to This Policy</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Contact Us</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
              <strong className="font-semibold text-gray-900 dark:text-white">{companyName}</strong><br />
              <span className="font-semibold">Email:</span> <a href={\`mailto:\${email}\`} className="text-blue-600 dark:text-blue-400 hover:underline">{email}</a><br />
              <span className="font-semibold">Address:</span> {address}
            </p>
          </div>
        </section>
      </div>
    </div>
    </div>
  );
}
    `,

    terms: `
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface LegalPageContentProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function LegalPageContent({ ${dataName}: propData, className }: LegalPageContentProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
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

  const content = ${dataName} || {};
  const title = content.title || 'Terms of Service';
  const lastUpdated = content.lastUpdated || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const companyName = content.companyName || content.appName || content.organizationName || 'Company';
  const email = content.email || content.supportEmail || \`legal@\${content.domain || 'company.com'}\`;
  const address = content.address || '123 Business St, City, State 12345';

  return (
    <div className={cn('max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 dark:bg-gray-900 min-h-screen', className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-12 md:p-16">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">{title}</h1>
          <div className="flex items-center gap-2 mb-8">
            <span className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm">
              Last updated: {lastUpdated}
            </span>
          </div>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            By accessing and using this service, you accept and agree to be bound by the terms and
            provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Use License</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Permission is granted to temporarily download one copy of the materials on {companyName}
            service for personal, non-commercial transitory viewing only.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">Under this license you may not:</p>
          <ul className="list-disc pl-8 text-lg text-gray-700 dark:text-gray-300 space-y-3 mb-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to reverse engineer any software</li>
            <li>Remove any copyright or proprietary notations</li>
          </ul>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            When you create an account with us, you must provide accurate and complete information.
            You are responsible for safeguarding your password and for all activities under your account.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Prohibited Uses</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">You may not use our service:</p>
          <ul className="list-disc pl-8 text-lg text-gray-700 dark:text-gray-300 space-y-3 mb-4">
            <li>In any way that violates any applicable law or regulation</li>
            <li>To transmit any harmful or malicious code</li>
            <li>To impersonate or attempt to impersonate the company or another user</li>
            <li>To engage in any automated data collection</li>
          </ul>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Intellectual Property</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            The service and its original content, features, and functionality are owned by {companyName}
            and are protected by international copyright, trademark, patent, trade secret, and other
            intellectual property laws.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Termination</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We may terminate or suspend your account and bar access to the service immediately, without
            prior notice or liability, under our sole discretion, for any reason whatsoever.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Limitation of Liability</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            In no event shall {companyName}, nor its directors, employees, partners, agents, suppliers,
            or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Changes to Terms</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We reserve the right to modify or replace these Terms at any time. We will provide notice
            of any changes by posting the new Terms on this page.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Contact Us</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            If you have any questions about these Terms, please contact us:
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
              <strong className="font-semibold text-gray-900 dark:text-white">{companyName}</strong><br />
              <span className="font-semibold">Email:</span> <a href={\`mailto:\${email}\`} className="text-blue-600 dark:text-blue-400 hover:underline">{email}</a><br />
              <span className="font-semibold">Address:</span> {address}
            </p>
          </div>
        </section>
      </div>
    </div>
    </div>
  );
}
    `,

    cookies: `
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface LegalPageContentProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function LegalPageContent({ ${dataName}: propData, className }: LegalPageContentProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
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

  const content = ${dataName} || {};
  const title = content.title || 'Cookie Policy';
  const lastUpdated = content.lastUpdated || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const companyName = content.companyName || content.appName || content.organizationName || 'Company';
  const email = content.email || content.supportEmail || 'privacy@' + (content.domain || 'company.com');

  return (
    <div className={cn('max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 dark:bg-gray-900 min-h-screen', className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-12 md:p-16">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">{title}</h1>
          <div className="flex items-center gap-2 mb-8">
            <span className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm">
              Last updated: {lastUpdated}
            </span>
          </div>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. What Are Cookies</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Cookies are small text files that are stored on your device when you visit a website.
            They help the website recognize your device and remember information about your visit.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. How We Use Cookies</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">We use cookies for:</p>
          <ul className="list-disc pl-8 text-lg text-gray-700 dark:text-gray-300 space-y-3 mb-4">
            <li>Essential website functionality</li>
            <li>Understanding how you use our website</li>
            <li>Remembering your preferences and settings</li>
            <li>Improving our services</li>
          </ul>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Types of Cookies We Use</h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Essential Cookies</h3>
            <p className="text-gray-700 dark:text-gray-300">
              These cookies are necessary for the website to function properly and cannot be disabled.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Analytics Cookies</h3>
            <p className="text-gray-700 dark:text-gray-300">
              These cookies help us understand how visitors interact with our website.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Preference Cookies</h3>
            <p className="text-gray-700 dark:text-gray-300">
              These cookies remember your choices and preferences for a better experience.
            </p>
          </div>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Managing Cookies</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            You can control and manage cookies in various ways. Please note that removing or blocking
            cookies can impact your user experience.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Contact Us</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            If you have questions about our use of cookies, please contact us:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>{companyName}</strong><br />
              Email: {email}
            </p>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.privacy;
};
