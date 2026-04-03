/**
 * FAQ Component Generators
 */

export interface FaqOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFaqSection(options: FaqOptions = {}): string {
  const { componentName = 'FaqSection', endpoint = '/faqs' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  category?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ category }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs', category],
    queryFn: async () => {
      const url = '${endpoint}' + (category ? '?category=' + category : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredFaqs = faqs?.filter((faq: any) =>
    faq.question?.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search FAQs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredFaqs && filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq: any) => (
              <div key={faq.id}>
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  {openId === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openId === faq.id && (
                  <div className="px-4 pb-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">No FAQs found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateFaqCategories(options: FaqOptions = {}): string {
  const { componentName = 'FaqCategories', endpoint = '/faq-categories' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['faq-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${
            !activeCategory
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }\`}
        >
          All
        </button>
        {categories?.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${
              activeCategory === cat.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }\`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {categories?.filter((cat: any) => !activeCategory || cat.id === activeCategory).map((category: any) => (
        <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: (category.color || '#8B5CF6') + '20' }}>
                <HelpCircle className="w-5 h-5" style={{ color: category.color || '#8B5CF6' }} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {category.faqs?.map((faq: any) => (
              <div key={faq.id}>
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  {openId === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openId === faq.id && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ${componentName};
`;
}
