import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFaqSearch = (
  resolved: ResolvedComponent,
  variant: 'instant' | 'modal' | 'page' = 'instant'
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
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, ChevronDown, TrendingUp, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';`;

  const variants = {
    instant: `
${commonImports}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FaqSearchProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const FaqSearch: React.FC<FaqSearchProps> = ({
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
  const [openFaq, setOpenFaq] = useState<string | null>(null);

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
  const placeholder = ${getField('placeholder')};
  const popularQuestions = ${getField('popularQuestions')};
  const faqItems = ${getField('faqs')};
  const noResultsTitle = ${getField('noResultsTitle')};
  const noResultsMessage = ${getField('noResultsMessage')};
  const contactText = ${getField('contactText')};

  // Combine all FAQs
  const allFaqs = useMemo(() => [...faqItems, ...popularQuestions], [faqItems, popularQuestions]);

  // Filter FAQs based on search query with highlighting
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return [];

    return allFaqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allFaqs]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(\`(\${query})\`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-gray-900">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const toggleFaq = (faqId: string) => {
    setOpenFaq(openFaq === faqId ? null : faqId);
  };

  return (
    <section className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 py-6 text-lg border-2 border-gray-200 focus:border-blue-600 rounded-xl shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchQuery ? (
          <div className="mb-12">
            {filteredFaqs.length > 0 ? (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}
                </p>
                {filteredFaqs.map((faq: FAQ) => {
                  const isOpen = openFaq === faq.id;

                  return (
                    <div
                      key={faq.id}
                      className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-6 text-left"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-600 text-xs">
                              {faq.category}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 pr-8">
                            {highlightText(faq.question, searchQuery)}
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
                            {highlightText(faq.answer, searchQuery)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {noResultsTitle}
                </h3>
                <p className="text-gray-600">
                  {noResultsMessage}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Popular Questions */
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Popular Questions
              </h2>
            </div>
            <div className="space-y-4">
              {popularQuestions.map((faq: FAQ) => {
                const isOpen = openFaq === faq.id;

                return (
                  <div
                    key={faq.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-600 text-xs mb-2">
                          {faq.category}
                        </Badge>
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
          </div>
        )}

        {/* Contact Section */}
        <div className="text-center mt-16 p-8 bg-white rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {contactText}
          </h3>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FaqSearch;
    `,

    modal: `
${commonImports}
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FaqSearchProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const FaqSearch: React.FC<FaqSearchProps> = ({
  ${dataName}: propData,
  className,
  isOpen = false,
  onClose = () => {}
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
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  if (isLoading && !propData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const faqData = ${dataName} || {};

  const title = ${getField('title')};
  const placeholder = ${getField('placeholder')};
  const popularQuestions = ${getField('popularQuestions')};
  const faqItems = ${getField('faqs')};
  const noResultsTitle = ${getField('noResultsTitle')};
  const noResultsMessage = ${getField('noResultsMessage')};

  const allFaqs = useMemo(() => [...faqItems, ...popularQuestions], [faqItems, popularQuestions]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return popularQuestions;

    return allFaqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allFaqs, popularQuestions]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(\`(\${query})\`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-gray-900">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const toggleFaq = (faqId: string) => {
    setOpenFaq(openFaq === faqId ? null : faqId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 py-5 text-base border-2 border-gray-200 focus:border-blue-600 rounded-lg"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Results */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-3">
            {!searchQuery && (
              <p className="text-sm text-gray-600 mb-3">Popular Questions</p>
            )}
            {filteredFaqs.map((faq: FAQ) => {
              const isOpen = openFaq === faq.id;

              return (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-600 text-xs mb-1">
                        {faq.category}
                      </Badge>
                      <h3 className="text-base font-semibold text-gray-900 pr-8">
                        {highlightText(faq.question, searchQuery)}
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
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pt-3 text-sm text-gray-600 leading-relaxed">
                        {highlightText(faq.answer, searchQuery)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {noResultsTitle}
            </h3>
            <p className="text-gray-600 text-sm">
              {noResultsMessage}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FaqSearch;
    `,

    page: `
${commonImports}
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FaqSearchProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const FaqSearch: React.FC<FaqSearchProps> = ({
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
  const [activeTab, setActiveTab] = useState('all');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

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
  const placeholder = ${getField('placeholder')};
  const popularQuestions = ${getField('popularQuestions')};
  const faqItems = ${getField('faqs')};
  const noResultsTitle = ${getField('noResultsTitle')};
  const noResultsMessage = ${getField('noResultsMessage')};
  const contactText = ${getField('contactText')};

  const allFaqs = useMemo(() => [...faqItems, ...popularQuestions], [faqItems, popularQuestions]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allFaqs.map((faq: FAQ) => faq.category));
    return ['all', ...Array.from(cats)];
  }, [allFaqs]);

  const filteredFaqs = useMemo(() => {
    let filtered = allFaqs;

    if (activeTab !== 'all') {
      filtered = filtered.filter((faq: FAQ) => faq.category === activeTab);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((faq: FAQ) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, activeTab, allFaqs]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(\`(\${query})\`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-gray-900">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const toggleFaq = (faqId: string) => {
    setOpenFaq(openFaq === faqId ? null : faqId);
  };

  return (
    <section className={cn("min-h-screen bg-white py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 py-6 text-lg border-2 border-gray-200 focus:border-blue-600 rounded-xl shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="w-full justify-start overflow-x-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Results */}
        {filteredFaqs.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 mb-6">
              {filteredFaqs.length} question{filteredFaqs.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-4">
              {filteredFaqs.map((faq: FAQ) => {
                const isOpen = openFaq === faq.id;

                return (
                  <div
                    key={faq.id}
                    className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-600 text-xs mb-2">
                          {faq.category}
                        </Badge>
                        <h3 className="text-lg font-semibold text-gray-900 pr-8">
                          {highlightText(faq.question, searchQuery)}
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
                          {highlightText(faq.answer, searchQuery)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {noResultsTitle}
            </h3>
            <p className="text-gray-600 mb-6">
              {noResultsMessage}
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
              }}
              variant="outline"
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Popular Questions Sidebar */}
        {!searchQuery && (
          <div className="mt-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Most Popular
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {popularQuestions.slice(0, 4).map((faq: FAQ) => (
                <button
                  key={faq.id}
                  onClick={() => toggleFaq(faq.id)}
                  className="text-left p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <Badge variant="secondary" className="bg-blue-100 text-blue-600 text-xs mb-2">
                    {faq.category}
                  </Badge>
                  <p className="font-semibold text-gray-900 text-sm">
                    {faq.question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="text-center mt-16 p-8 bg-gray-900 text-white rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">
            {contactText}
          </h3>
          <Button className="bg-white text-gray-900 hover:bg-gray-100">
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FaqSearch;
    `
  };

  return variants[variant] || variants.instant;
};
