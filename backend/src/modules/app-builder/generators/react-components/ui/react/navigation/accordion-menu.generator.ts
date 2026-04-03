import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAccordionMenu = (
  resolved: ResolvedComponent,
  variant: 'sidebar' | 'vertical' | 'nested' = 'sidebar'
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
    return `/${dataSource || 'accordion-menu'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'accordionMenu' : 'accordionMenu';

  const commonImports = `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Play, ChevronDown, ChevronRight, Box, Zap, BookOpen, HelpCircle, ShoppingBag, Settings, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    sidebar: `
${commonImports}

interface AccordionMenuProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AccordionMenu({ ${dataName}: propData, className }: AccordionMenuProps) {
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

  const menuData = ${dataName} || {};

  const accordionItems = ${getField('accordionItems')};
  const brandName = ${getField('brandName')};
  const allowMultiple = ${getField('allowMultiple')};

  const [expandedItems, setExpandedItems] = useState<string[]>(
    accordionItems.filter((item: any) => item.defaultExpanded).map((item: any) => item.id)
  );

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const iconMap: { [key: string]: any } = {
    Play,
    Box,
    Zap,
    BookOpen,
    HelpCircle,
    ShoppingBag,
    Settings
  };

  const toggleItem = (itemId: string) => {
    if (allowMultiple) {
      setExpandedItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setExpandedItems(prev =>
        prev.includes(itemId) ? [] : [itemId]
      );
    }
  };

  const handleItemClick = (item: any) => {
    console.log('Menu item clicked:', item);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar Accordion Menu */}
      <aside className={cn('w-64 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col shadow-xl', className)}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{brandName}</span>
          </div>
        </div>

        {/* Accordion Items */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {accordionItems.map((item: any) => {
              const isExpanded = expandedItems.includes(item.id);
              const Icon = iconMap[item.icon] || Box;

              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 group hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <ChevronDown className={\`w-4 h-4 text-gray-400 transition-transform duration-300 \${isExpanded ? 'rotate-180' : ''}\`} />
                  </button>

                  {isExpanded && (
                    <div className="mt-1 ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {item.content.map((contentItem: any, index: number) => (
                        <a
                          key={index}
                          href={contentItem.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleItemClick(contentItem);
                          }}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <span>{contentItem.label}</span>
                          {contentItem.badge && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-medium">
                              {contentItem.badge}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Accordion Menu - Sidebar</h1>
        <p className="text-gray-600 dark:text-gray-400">Sidebar navigation with accordion menu items</p>
      </div>
    </div>
  );
}
    `,

    vertical: `
${commonImports}

interface AccordionMenuProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AccordionMenu({ ${dataName}: propData, className }: AccordionMenuProps) {
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

  const menuData = ${dataName} || {};

  const accordionItems = ${getField('accordionItems')};
  const brandName = ${getField('brandName')};
  const allowMultiple = ${getField('allowMultiple')};

  const [expandedItems, setExpandedItems] = useState<string[]>(
    accordionItems.filter((item: any) => item.defaultExpanded).map((item: any) => item.id)
  );

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const iconMap: { [key: string]: any } = {
    Play,
    Box,
    Zap,
    BookOpen,
    HelpCircle,
    ShoppingBag,
    Settings
  };

  const toggleItem = (itemId: string) => {
    if (allowMultiple) {
      setExpandedItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setExpandedItems(prev =>
        prev.includes(itemId) ? [] : [itemId]
      );
    }
  };

  const handleItemClick = (item: any) => {
    console.log('Menu item clicked:', item);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 h-16">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{brandName}</span>
          </div>
        </div>
      </header>

      {/* Vertical Accordion Menu */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700', className)}>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {accordionItems.map((item: any) => {
              const isExpanded = expandedItems.includes(item.id);
              const Icon = iconMap[item.icon] || Box;

              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between px-6 py-4 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      <span className="font-semibold text-lg">{item.title}</span>
                    </div>
                    <ChevronRight className={\`w-5 h-5 text-gray-400 transition-transform duration-200 \${isExpanded ? 'rotate-90' : ''}\`} />
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {item.content.map((contentItem: any, index: number) => (
                          <a
                            key={index}
                            href={contentItem.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleItemClick(contentItem);
                            }}
                            className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <span>{contentItem.label}</span>
                            {contentItem.badge && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-medium">
                                {contentItem.badge}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Accordion Menu - Vertical</h1>
          <p className="text-gray-600 dark:text-gray-400">Vertical accordion menu with grid layout for content items</p>
        </div>
      </div>
    </div>
  );
}
    `,

    nested: `
${commonImports}

interface AccordionMenuProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AccordionMenu({ ${dataName}: propData, className }: AccordionMenuProps) {
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

  const menuData = ${dataName} || {};

  const nestedAccordionItems = ${getField('nestedAccordionItems')};
  const brandName = ${getField('brandName')};
  const allowMultiple = ${getField('allowMultiple')};

  const [expandedParents, setExpandedParents] = useState<string[]>(
    nestedAccordionItems.filter((item: any) => item.defaultExpanded).map((item: any) => item.id)
  );
  const [expandedChildren, setExpandedChildren] = useState<string[]>([]);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const iconMap: { [key: string]: any } = {
    Play,
    Box,
    Zap,
    BookOpen,
    HelpCircle,
    ShoppingBag,
    Settings
  };

  const toggleParent = (itemId: string) => {
    if (allowMultiple) {
      setExpandedParents(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setExpandedParents(prev =>
        prev.includes(itemId) ? [] : [itemId]
      );
      setExpandedChildren([]);
    }
  };

  const toggleChild = (itemId: string) => {
    setExpandedChildren(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item: any) => {
    console.log('Menu item clicked:', item);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Nested Accordion Sidebar */}
      <aside className={cn('w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col', className)}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{brandName}</span>
          </div>
        </div>

        {/* Nested Accordion Items */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {nestedAccordionItems.map((parent: any) => {
              const isParentExpanded = expandedParents.includes(parent.id);
              const ParentIcon = iconMap[parent.icon] || Box;

              return (
                <div key={parent.id}>
                  {/* Parent Item */}
                  <button
                    onClick={() => toggleParent(parent.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <ParentIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      <span className="font-medium">{parent.title}</span>
                    </div>
                    <ChevronDown className={\`w-4 h-4 text-gray-400 transition-transform duration-200 \${isParentExpanded ? 'rotate-180' : ''}\`} />
                  </button>

                  {/* Children Items */}
                  {isParentExpanded && (
                    <div className="mt-1 ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {parent.children.map((child: any) => {
                        const isChildExpanded = expandedChildren.includes(child.id);

                        return (
                          <div key={child.id}>
                            {/* Child Item */}
                            <button
                              onClick={() => toggleChild(child.id)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                            >
                              <div className="flex items-center gap-2">
                                <ChevronRight className={\`w-4 h-4 text-gray-400 transition-transform duration-200 \${isChildExpanded ? 'rotate-90' : ''}\`} />
                                <span className="font-medium text-sm">{child.title}</span>
                              </div>
                            </button>

                            {/* Content Items */}
                            {isChildExpanded && (
                              <div className="mt-1 ml-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                {child.content.map((contentItem: any, index: number) => (
                                  <a
                                    key={index}
                                    href={contentItem.href}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleItemClick(contentItem);
                                    }}
                                    className="block px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                  >
                                    {contentItem.label}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Accordion Menu - Nested</h1>
        <p className="text-gray-600 dark:text-gray-400">Multi-level nested accordion menu with parent-child hierarchy</p>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.sidebar;
};
