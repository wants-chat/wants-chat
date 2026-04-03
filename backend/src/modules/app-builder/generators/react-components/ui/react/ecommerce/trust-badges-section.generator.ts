import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTrustBadgesSection = (
  resolved: ResolvedComponent,
  variant: 'row' | 'grid' | 'centered' = 'centered'
) => {
  const dataSource = resolved.dataSource;

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
    row: `
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Shield, Award, Lock, CheckCircle, Truck, Clock, CreditCard, Wallet, Smartphone, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgesSectionProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function TrustBadgesSection({ ${dataName}: initialData, className }: TrustBadgesSectionProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const badgeData = ${dataName} || {};

  const badges = ${getField('badges')};
  const paymentLogos = ${getField('paymentLogos')};

  const iconMap: any = {
    Shield,
    Award,
    Lock,
    CheckCircle,
    Truck,
    Clock,
    CreditCard,
    Wallet,
    Smartphone
  };

  const handleBadgeClick = (badge: any) => {
    if (badge.link && badge.link !== '#') {
      window.location.href = badge.link;
    }
  };

  return (
    <section className={cn('bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-y-2 border-gray-200 dark:border-gray-700', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
          {badges.slice(0, 4).map((badge: any, index: number) => {
            const Icon = iconMap[badge.icon] || Shield;
            const gradients = [
              'from-blue-600 to-purple-600',
              'from-green-500 to-emerald-500',
              'from-orange-500 to-yellow-500',
              'from-pink-500 to-rose-600'
            ];
            return (
              <button
                key={index}
                onClick={() => handleBadgeClick(badge)}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-105 group"
              >
                <div className={\`w-12 h-12 bg-gradient-to-r \${gradients[index % gradients.length]} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all\`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold">{badge.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{badge.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Payment Methods */}
        <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-8">
          <div className="text-center mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Accepted Payment Methods</span>
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {paymentLogos.map((payment: any, index: number) => {
              const Icon = iconMap[payment.icon] || CreditCard;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-blue-500 dark:hover:border-purple-500 transition-all hover:scale-105 shadow-md"
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-bold">{payment.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
    `,

    grid: `
import { Shield, Award, Lock, CheckCircle, Truck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgesSectionProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function TrustBadgesSection({ ${dataName}, className }: TrustBadgesSectionProps) {
  const badgeData = ${dataName} || {};

  const badges = ${getField('badges')};
  const sectionHeading = ${getField('sectionHeading')};
  const grayscaleMode = ${getField('grayscaleMode')};

  const iconMap: any = {
    Shield,
    Award,
    Lock,
    CheckCircle,
    Truck,
    Clock
  };

  const handleBadgeClick = (badge: any) => {
    if (badge.link && badge.link !== '#') {
      window.location.href = badge.link;
    }
  };

  return (
    <section className={cn('bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {sectionHeading}
            </h2>
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge: any, index: number) => {
            const Icon = iconMap[badge.icon] || Shield;
            const colors = [
              'from-blue-600 to-purple-600',
              'from-green-500 to-emerald-500',
              'from-purple-500 to-pink-600',
              'from-orange-500 to-yellow-500',
              'from-pink-500 to-rose-600',
              'from-cyan-500 to-blue-600'
            ];
            return (
              <button
                key={index}
                onClick={() => handleBadgeClick(badge)}
                className={\`group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all text-center hover:scale-105 \${
                  grayscaleMode ? 'grayscale hover:grayscale-0' : ''
                }\`}
              >
                <div className={\`inline-flex p-4 rounded-2xl bg-gradient-to-br \${colors[index % colors.length]} mb-4 group-hover:scale-110 transition-transform shadow-lg\`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {badge.label}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {badge.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
    `,

    centered: `
import { Shield, Award, Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgesSectionProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function TrustBadgesSection({ ${dataName}, className }: TrustBadgesSectionProps) {
  const badgeData = ${dataName} || {};

  const certifications = ${getField('certifications')};
  const sectionHeading = ${getField('sectionHeading')};
  const sectionSubheading = ${getField('sectionSubheading')};

  const iconMap: any = {
    Shield,
    Award,
    Lock,
    CheckCircle
  };

  const colorMap: any = {
    blue: 'from-blue-600 to-purple-600',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-yellow-500'
  };

  return (
    <section className={cn('bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {sectionHeading}
            </h2>
            <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            {sectionSubheading}
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {certifications.map((cert: any, index: number) => {
            const Icon = iconMap[cert.icon] || Shield;
            const gradient = colorMap[cert.color] || colorMap.blue;
            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all text-center hover:scale-105"
              >
                {/* Icon */}
                <div className="relative inline-block mb-6">
                  <div className={\`w-20 h-20 bg-gradient-to-br \${gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl\`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  {/* Checkmark Badge */}
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Label */}
                <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {cert.label}
                </div>

                {/* Description */}
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {cert.description}
                </div>

                {/* Hover Effect */}
                <div className={\`absolute inset-0 rounded-2xl bg-gradient-to-br \${gradient} opacity-0 group-hover:opacity-10 transition-opacity -z-10\`}></div>
              </div>
            );
          })}
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg">
            <Lock className="w-5 h-5 text-white" />
            <p className="text-sm text-white font-bold">
              Your data is protected with industry-leading security standards
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
    `
  };

  return variants[variant] || variants.centered;
};
