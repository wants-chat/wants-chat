/**
 * Knowledge Base Component Generators
 * For KB articles, search, categories, and sidebars
 */

export interface KnowledgeBaseOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate KB Categories Component
 */
export function generateKBCategories(options: KnowledgeBaseOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface KBCategoriesProps {
      categories: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        articleCount: number;
      }>;
      onSelect?: (id: string) => void;
    }

    const KBCategories: React.FC<KBCategoriesProps> = ({ categories, onSelect }) => {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelect?.(cat.id)}
              className="bg-white rounded-lg shadow-sm border p-5 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{cat.description}</p>
                  <p className="text-xs text-gray-400">{cat.articleCount} articles</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };
  `;
}

/**
 * Generate KB Search Component
 */
export function generateKBSearch(options: KnowledgeBaseOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface KBSearchProps {
      placeholder?: string;
      onSearch?: (query: string) => void;
      suggestions?: string[];
    }

    const KBSearch: React.FC<KBSearchProps> = ({ placeholder = 'Search knowledge base...', onSearch, suggestions }) => {
      const [query, setQuery] = React.useState('');
      const [showSuggestions, setShowSuggestions] = React.useState(false);

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(query);
        setShowSuggestions(false);
      };

      return (
        <div className="relative">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={placeholder}
                className="w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '${primaryColor}' } as any}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </form>
          {showSuggestions && suggestions && suggestions.length > 0 && query && (
            <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg z-10">
              {suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5).map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(suggestion); onSearch?.(suggestion); setShowSuggestions(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    };
  `;
}

/**
 * Generate KB Sidebar Component
 */
export function generateKBSidebar(options: KnowledgeBaseOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface KBSidebarProps {
      categories: Array<{
        id: string;
        name: string;
        icon: string;
        articles: Array<{ id: string; title: string }>;
      }>;
      selectedArticle?: string;
      selectedCategory?: string;
      onSelectArticle?: (id: string) => void;
      onSelectCategory?: (id: string) => void;
    }

    const KBSidebar: React.FC<KBSidebarProps> = ({
      categories,
      selectedArticle,
      selectedCategory,
      onSelectArticle,
      onSelectCategory
    }) => {
      const [expanded, setExpanded] = React.useState<string[]>([selectedCategory || '']);

      const toggleCategory = (id: string) => {
        setExpanded(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
        onSelectCategory?.(id);
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Browse Articles</h3>
          </div>
          <nav className="p-2">
            {categories.map((cat) => (
              <div key={cat.id} className="mb-1">
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={\`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm \${
                    selectedCategory === cat.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }\`}
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </span>
                  <span className="text-gray-400">{expanded.includes(cat.id) ? '▼' : '▶'}</span>
                </button>
                {expanded.includes(cat.id) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {cat.articles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => onSelectArticle?.(article.id)}
                        className={\`w-full text-left px-3 py-1.5 rounded text-sm \${
                          selectedArticle === article.id
                            ? 'font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }\`}
                        style={{ color: selectedArticle === article.id ? '${primaryColor}' : undefined }}
                      >
                        {article.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      );
    };
  `;
}
