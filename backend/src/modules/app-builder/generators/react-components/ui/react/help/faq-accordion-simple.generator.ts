import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFaqAccordionSimple = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'styled' | 'animated' = 'basic'
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
    return `/${dataSource || 'faqs'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'faqs';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronDown, Plus, Minus, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';`;

  const variants = {
    basic: `
${commonImports}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionSimpleProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const FaqAccordionSimple: React.FC<FaqAccordionSimpleProps> = ({
  ${dataName}: propData,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const faqData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badge = ${getField('badge')};
  const faqItems = ${getField('faqs')};
  const defaultExpanded = ${getField('defaultExpanded')};

  const [openIndex, setOpenIndex] = useState<number | null>(defaultExpanded);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={cn("min-h-screen bg-white py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-600">
            {badge}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqItems.map((faq: FAQ, index: number) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-8">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    isOpen ? "max-h-96" : "max-h-0"
                  )}
                >
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqAccordionSimple;
    `,

    styled: `
${commonImports}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionSimpleProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const FaqAccordionSimple: React.FC<FaqAccordionSimpleProps> = ({
  ${dataName}: propData,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const faqData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badge = ${getField('badge')};
  const faqItems = ${getField('faqs')};
  const defaultExpanded = ${getField('defaultExpanded')};

  const [openIndex, setOpenIndex] = useState<number | null>(defaultExpanded);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-600">
            {badge}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* FAQ Accordion - Styled */}
        <div className="space-y-4">
          {faqItems.map((faq: FAQ, index: number) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.id}
                className={cn(
                  "border-2 rounded-xl overflow-hidden transition-all duration-300",
                  isOpen
                    ? "border-blue-600 shadow-lg bg-white"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                )}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                      isOpen ? "bg-blue-600" : "bg-gray-200"
                    )}>
                      <span className={cn(
                        "text-sm font-bold",
                        isOpen ? "text-white" : "text-gray-600"
                      )}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 pr-8">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-all duration-300",
                      isOpen ? "rotate-180 text-blue-600" : "text-gray-400"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="px-6 pb-6 pl-[4.5rem] text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions?
          </p>
          <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
            Contact our support team
          </a>
        </div>
      </div>
    </section>
  );
};

export default FaqAccordionSimple;
    `,

    animated: `
${commonImports}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionSimpleProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const FaqAccordionSimple: React.FC<FaqAccordionSimpleProps> = ({
  ${dataName}: propData,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const faqData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badge = ${getField('badge')};
  const faqItems = ${getField('faqs')};
  const defaultExpanded = ${getField('defaultExpanded')};

  const [openIndex, setOpenIndex] = useState<number | null>(defaultExpanded);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={cn("min-h-screen bg-gray-900 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-600 text-white">
            {badge}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            {title}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* FAQ Accordion - Animated */}
        <div className="space-y-4">
          {faqItems.map((faq: FAQ, index: number) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.id}
                className={cn(
                  "border-2 rounded-2xl overflow-hidden transition-all duration-500",
                  isOpen
                    ? "border-blue-600 bg-gradient-to-r from-blue-600/10 to-purple-600/10"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                )}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                      isOpen
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 scale-110"
                        : "bg-gray-700 group-hover:bg-gray-600"
                    )}>
                      {isOpen ? (
                        <Minus className="w-5 h-5 text-white" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <h3 className={cn(
                      "text-lg font-semibold pr-8 transition-colors duration-300",
                      isOpen ? "text-white" : "text-gray-200 group-hover:text-white"
                    )}>
                      {faq.question}
                    </h3>
                  </div>
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="px-6 pb-6 pl-20">
                    <div className={cn(
                      "text-gray-400 leading-relaxed transition-all duration-500",
                      isOpen ? "translate-y-0" : "-translate-y-4"
                    )}>
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            Can't find what you're looking for?
          </p>
          <a href="#" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Get in touch with us
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FaqAccordionSimple;
    `
  };

  return variants[variant] || variants.basic;
};
