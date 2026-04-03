import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFaqAccordionCategorized = (
  resolved: ResolvedComponent,
  variant: 'tabs' | 'sections' | 'searchable' = 'tabs'
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
import { ChevronDown, ThumbsUp, ThumbsDown, HelpCircle, CreditCard, Code, Shield, Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';`;

  const variants = {
    tabs: `
${commonImports}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  helpful?: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  faqs: FAQ[];
}

interface FaqAccordionCategorizedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const iconMap: Record<string, any> = {
  HelpCircle,
  CreditCard,
  Code,
  Shield
};

const FaqAccordionCategorized: React.FC<FaqAccordionCategorizedProps> = ({
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

  const [activeCategory, setActiveCategory] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, 'up' | 'down' | null>>({});

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const faqData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badge = ${getField('badge')};
  const categories = ${getField('categories')};
  const contactText = ${getField('contactText')};
  const contactLink = ${getField('contactLink')};

  const toggleFaq = (faqId: string) => {
    setOpenFaq(openFaq === faqId ? null : faqId);
  };

  const voteHelpful = (faqId: string, vote: 'up' | 'down') => {
    setHelpfulVotes(prev => ({
      ...prev,
      [faqId]: prev[faqId] === vote ? null : vote
    }));
  };

  return (
    <section className={cn("min-h-screen bg-white py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
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

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category: Category, index: number) => {
            const Icon = iconMap[category.icon] || HelpCircle;
            const isActive = activeCategory === index;

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(index)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                <Icon className="w-5 h-5" />
                {category.name}
                <Badge variant="secondary" className={cn(
                  "ml-1",
                  isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                )}>
                  {category.faqs.length}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {categories[activeCategory].faqs.map((faq: FAQ) => {
              const isOpen = openFaq === faq.id;
              const vote = helpfulVotes[faq.id];

              return (
                <div
                  key={faq.id}
                  className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
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

                  {isOpen && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="pt-4 text-gray-600 leading-relaxed mb-4">
                        {faq.answer}
                      </div>

                      {/* Helpful Voting */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Was this helpful?</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => voteHelpful(faq.id, 'up')}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              vote === 'up'
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => voteHelpful(faq.id, 'down')}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              vote === 'down'
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {contactText}
          </h3>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you with any questions
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FaqAccordionCategorized;
    `,

    sections: `
${commonImports}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  helpful?: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  faqs: FAQ[];
}

interface FaqAccordionCategorizedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const iconMap: Record<string, any> = {
  HelpCircle,
  CreditCard,
  Code,
  Shield
};

const FaqAccordionCategorized: React.FC<FaqAccordionCategorizedProps> = ({
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

  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (faqId: string) => {
    setOpenFaq(openFaq === faqId ? null : faqId);
  };

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const faqData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badge = ${getField('badge')};
  const categories = ${getField('categories')};
  const contactText = ${getField('contactText')};
  const contactLink = ${getField('contactLink')};

  return (
    <section className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
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

        {/* Sections Layout */}
        <div className="space-y-16">
          {categories.map((category: Category) => {
            const Icon = iconMap[category.icon] || HelpCircle;

            return (
              <div key={category.id}>
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {category.name}
                  </h2>
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                    {category.faqs.length} questions
                  </Badge>
                </div>

                {/* FAQs */}
                <div className="space-y-4 pl-0 md:pl-16">
                  {category.faqs.map((faq: FAQ) => {
                    const isOpen = openFaq === faq.id;

                    return (
                      <div
                        key={faq.id}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full flex items-center justify-between p-6 text-left"
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

                        {isOpen && (
                          <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="text-center mt-16 p-8 bg-white rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {contactText}
          </h3>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Reach out to our support team.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FaqAccordionCategorized;
    `,

    searchable: `
${commonImports}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  helpful?: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  faqs: FAQ[];
}

interface FaqAccordionCategorizedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const iconMap: Record<string, any> = {
  HelpCircle,
  CreditCard,
  Code,
  Shield
};

const FaqAccordionCategorized: React.FC<FaqAccordionCategorizedProps> = ({
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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (faqId: string) => {
    setOpenFaq(openFaq === faqId ? null : faqId);
  };

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const faqData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badge = ${getField('badge')};
  const categories = ${getField('categories')};
  const contactText = ${getField('contactText')};
  const contactLink = ${getField('contactLink')};

  // Filter FAQs based on search query and active category
  const getFilteredFaqs = () => {
    const allFaqs = categories.flatMap((cat: Category) =>
      cat.faqs.map((faq: FAQ) => ({ ...faq, categoryId: cat.id, categoryName: cat.name }))
    );

    let filtered = allFaqs;

    if (activeCategory) {
      filtered = filtered.filter(faq => faq.categoryId === activeCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredFaqs = getFilteredFaqs();

  return (
    <section className={cn("min-h-screen bg-gray-50 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
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

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg border-2 border-gray-200 focus:border-blue-600 rounded-xl"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-all duration-200",
              !activeCategory
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            All Categories
          </button>
          {categories.map((category: Category) => {
            const Icon = iconMap[category.icon] || HelpCircle;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div className="max-w-4xl mx-auto">
          {filteredFaqs.length > 0 ? (
            <>
              <p className="text-gray-600 mb-6">
                Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-4">
                {filteredFaqs.map((faq: any) => {
                  const isOpen = openFaq === faq.id;

                  return (
                    <div
                      key={faq.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-6 text-left"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-600 text-xs">
                              {faq.categoryName}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 pr-8">
                            {faq.question}
                          </h3>
                        </div>
                        <ChevronDown
                          className={cn(
                            "w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200",
                            isOpen && "rotate-180"
                          )}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-6 border-t border-gray-100">
                          <div className="pt-4 text-gray-600 leading-relaxed">
                            {faq.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or browse all categories
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory(null);
                }}
                variant="outline"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="text-center mt-16 p-8 bg-white rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {contactText}
          </h3>
          <p className="text-gray-600 mb-6">
            Our support team is available 24/7 to assist you
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FaqAccordionCategorized;
    `
  };

  return variants[variant] || variants.tabs;
};
