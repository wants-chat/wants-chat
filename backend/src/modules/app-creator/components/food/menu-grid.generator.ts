/**
 * Menu Grid Component Generator
 */

export interface MenuGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMenuGrid(options: MenuGridOptions = {}): string {
  const { componentName = 'MenuGrid', endpoint = '/menu-items' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus, Flame, Leaf, Star } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  category?: string;
  onAddToCart?: (item: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ category, onAddToCart }) => {
  const { data: items, isLoading } = useQuery({
    queryKey: ['menu-items', category],
    queryFn: async () => {
      const url = category ? '${endpoint}?category=' + encodeURIComponent(category) : '${endpoint}';
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items && items.length > 0 ? (
        items.map((item: any) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {item.image_url && (
              <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {item.is_spicy && (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        <Flame className="w-3 h-3" /> Spicy
                      </span>
                    )}
                    {item.is_vegetarian && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <Leaf className="w-3 h-3" /> Vegetarian
                      </span>
                    )}
                    {item.is_popular && (
                      <span className="flex items-center gap-1 text-xs text-yellow-600">
                        <Star className="w-3 h-3 fill-current" /> Popular
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600">\${item.price?.toFixed(2)}</span>
              </div>
              {item.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>
              )}
              <button
                onClick={() => onAddToCart?.(item)}
                className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add to Order
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          No menu items found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMenuCategories(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'MenuCategories', endpoint = '/menu-categories' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  selected?: string;
  onSelect?: (category: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ selected, onSelect }) => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const allCategories = [{ id: '', name: 'All' }, ...(categories || [])];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {allCategories.map((cat: any) => (
        <button
          key={cat.id || 'all'}
          onClick={() => onSelect?.(cat.id || cat.name === 'All' ? '' : cat.name)}
          className={\`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors \${
            (cat.id === '' && !selected) || selected === cat.id || selected === cat.name
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }\`}
        >
          {cat.icon && <span className="mr-1">{cat.icon}</span>}
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default ${componentName};
`;
}
