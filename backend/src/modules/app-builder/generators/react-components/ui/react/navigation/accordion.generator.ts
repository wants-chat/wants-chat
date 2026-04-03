import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateNavigationAccordion = (
  resolved: ResolvedComponent,
  variant: 'accordionWithArrow' | 'accordionWithGradientBg' | 'accordionWithIcon' | 'accordionWithPlusMinus' = 'accordionWithArrow'
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
    return `/${dataSource || 'accordion'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'accordion' : 'accordion';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronDown, MoreHorizontal, HelpCircle, Plus, Minus, Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';`;

  const variants = {
    accordionWithArrow: `
${commonImports}

interface FAQData {
  id: string;
  question: string;
  answer: string;
  content?: string;
}

interface AccordionProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const AccordionComponent: React.FC<AccordionProps> = ({
  ${dataName}: propData,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
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

  const accordionData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const faqItems = ${getField('faqItems')};

  const leftColumnFAQs = faqItems.slice(0, Math.ceil(faqItems.length / 2));
  const rightColumnFAQs = faqItems.slice(Math.ceil(faqItems.length / 2));

  return (
    <section className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-600">
            {badgeText}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* FAQ Grid using Real Shadcn Accordion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {leftColumnFAQs.map((faq: FAQData) => (
                <AccordionItem 
                  key={faq.id} 
                  value={faq.id}
                  className="border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100/50 transition-colors"
                >
                  <AccordionTrigger className="px-6 py-4 text-left font-medium text-gray-900 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    <span className="text-base">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Right Column */}
          <div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {rightColumnFAQs.map((faq: FAQData) => (
                <AccordionItem 
                  key={faq.id} 
                  value={faq.id}
                  className="border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100/50 transition-colors"
                >
                  <AccordionTrigger className="px-6 py-4 text-left font-medium text-gray-900 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    <span className="text-base">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccordionComponent;
    `,

    accordionWithGradientBg: `
${commonImports}

interface FAQData {
  id?: string;
  question: string;
  answer?: string;
  content: string;
}

interface FAQCardProps {
  question: string;
  content: string;
  className?: string;
  [key: string]: any;
}

interface AccordionProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

// FAQ Card Component with Shadcn styling
const FAQCard: React.FC<FAQCardProps> = ({ question, content, className }) => {
  return (
    <Card className={cn(
      "bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/50 hover:-translate-y-1",
      className
    )}>
      <CardContent className="p-8 h-full flex flex-col justify-between min-h-[280px]">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 leading-tight tracking-tight">
            {question}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {content}
          </p>
        </div>
        
        {/* Three dots indicator - Shadcn style */}
        <div className="flex justify-end mt-8">
          <div className="flex flex-col gap-1 opacity-60 hover:opacity-100 transition-opacity duration-200">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Accordion With Gradient BG Component
const AccordionComponent: React.FC<AccordionProps> = ({
  ${dataName}: propData,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
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

  const accordionData = ${dataName} || {};

  const title = ${getField('title')};
  const badgeText = ${getField('badgeText')};
  const faqItems = ${getField('faqItems')};

  return (
    <section className={cn("min-h-screen bg-background py-16 md:py-24 lg:py-32", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section - Fully Responsive */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <Badge variant="secondary" className="mb-4 md:mb-6 bg-blue-100 text-blue-600">
            {badgeText}
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight tracking-tight max-w-4xl mx-auto">
            {title}
          </h1>
        </div>

        {/* FAQ Grid - Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {faqItems.map((faq: FAQData, index: number) => (
            <FAQCard
              key={faq.id || "faq-" + index}
              question={faq.question}
              content={faq.content || faq.answer || ''}
              className="w-full"
            />
          ))}
        </div>
      </div>
      
      {/* Floating Variants Indicator - Shadcn styled */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-gray-900 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium shadow-lg z-50 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full opacity-40"></div>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full opacity-40"></div>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
          </div>
          <span className="hidden sm:inline">Variants</span>
          <span className="sm:hidden">Var</span>
        </div>
      </div>
    </section>
  );
};

export default AccordionComponent;
    `,

    accordionWithIcon: `
${commonImports}

interface FAQData {
  id?: string;
  question: string;
  answer?: string;
  content: string;
}

interface FAQCardProps {
  question: string;
  content: string;
  className?: string;
  [key: string]: any;
}

interface AccordionProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

// FAQ Card Component with Blue Icon
const FAQCard: React.FC<FAQCardProps> = ({ question, content, className }) => {
  return (
    <div className={cn("flex items-start gap-4 p-6", className)}>
      {/* Blue Icon */}
      <div className="flex-shrink-0 w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
        <HelpCircle className="w-7 h-7 text-white" />
      </div>
      
      {/* Content */}
      <div className="flex-1 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 leading-tight">
          {question}
        </h3>
        <p className="text-gray-600 text-base leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
};

// Decorative Dots Component
const DecorativeDots: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("absolute opacity-20", className)}>
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="w-2 h-2 bg-blue-400 rounded-full"></div>
      ))}
    </div>
  </div>
);

// Main AccordionWithIcon Component
const AccordionComponent: React.FC<AccordionProps> = ({
  ${dataName}: propData,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
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

  const accordionData = ${dataName} || {};

  const title = ${getField('title')};
  const badgeText = ${getField('badgeText')};
  const faqItems = ${getField('faqItems')};

  return (
    <section className={cn("min-h-screen bg-gray-50 py-16 md:py-24 relative overflow-hidden", className)}>
      {/* Decorative Elements */}
      <DecorativeDots className="top-10 left-10" />
      <DecorativeDots className="bottom-10 right-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-600">
            {badgeText}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
            {title}
          </h1>
        </div>

        {/* FAQ Grid - 2x2 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {faqItems.map((faq: FAQData, index: number) => (
            <Card key={faq.id || "faq-" + index} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-0">
                <FAQCard
                  question={faq.question}
                  content={faq.content || faq.answer || ''}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccordionComponent;
    `,

    accordionWithPlusMinus: `
${commonImports}

interface FAQData {
  id: string;
  question: string;
  answer: string;
  content?: string;
}

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  [key: string]: any;
}

interface AccordionProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

// Single Accordion Item Component
const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 text-left hover:bg-gray-50 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium text-gray-900 pr-8 flex-1">
          {question}
        </h3>
        <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-blue-600 flex items-center justify-center bg-white hover:bg-blue-50 transition-colors duration-200">
          {isOpen ? (
            <Minus className="w-5 h-5 text-blue-600" />
          ) : (
            <Plus className="w-5 h-5 text-blue-600" />
          )}
        </div>
      </button>
      
      {/* Collapsible Content */}
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="pb-6 pr-16">
          <p className="text-gray-600 leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main AccordionWithPlusMinus Component
const AccordionComponent: React.FC<AccordionProps> = ({
  ${dataName}: propData,
  className
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
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

  const accordionData = ${dataName} || {};

  const title = ${getField('title')};
  const badgeText = ${getField('badgeText')};
  const faqItems = ${getField('faqItems')};

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <section className={cn("min-h-screen bg-white py-16 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-600">
            {badgeText}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
            {title}
          </h1>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {faqItems.map((faq: FAQData) => (
              <AccordionItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer || faq.content || ''}
                isOpen={openItems.has(faq.id)}
                onToggle={() => toggleItem(faq.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccordionComponent;
    `
  };

  return variants[variant] || variants.accordionWithArrow;
};
