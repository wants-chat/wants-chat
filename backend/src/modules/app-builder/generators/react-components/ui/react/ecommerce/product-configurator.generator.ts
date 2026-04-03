import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductConfigurator = (
  resolved: ResolvedComponent,
  variant: 'visual' | 'list' | 'wizard' = 'visual'
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

  const commonImports = `
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Check, Plus, RotateCcw, ShoppingCart, Save, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';`;

  const variants = {
    visual: `
${commonImports}

interface Choice {
  id: string;
  name: string;
  price: number;
  description?: string;
  color?: string;
}

interface Option {
  id: string;
  name: string;
  required: boolean;
  choices: Choice[];
}

interface Addon {
  id: string;
  name: string;
  price: number;
}

interface Product {
  name: string;
  basePrice: number;
  image: string;
  description: string;
}

interface ConfiguratorProps {
  ${dataName}?: any;
  className?: string;
  onAddToCart?: (configuration: any) => void;
  onSaveConfig?: (configuration: any) => void;
}

const ProductConfigurator: React.FC<ConfiguratorProps> = ({
  ${dataName},
  className,
  onAddToCart,
  onSaveConfig
}) => {
  const queryClient = useQueryClient();
  const configuratorData = ${dataName} || {};

  // Mutation for adding to cart
  const addToCartMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('/cart', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart successfully!');
      if (onAddToCart) onAddToCart(data);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to add to cart');
    },
  });

  // Mutation for saving configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('/configurations', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
      toast.success('Configuration saved successfully!');
      if (onSaveConfig) onSaveConfig(data);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to save configuration');
    },
  });

  const product = ${getField('product')} as Product;
  const options = ${getField('options')} as Option[];
  const addons = ${getField('addons')} as Addon[];
  const title = ${getField('title')};
  const addToCartText = ${getField('addToCartText')};
  const saveConfigText = ${getField('saveConfigText')};
  const resetText = ${getField('resetText')};
  const totalPriceText = ${getField('totalPriceText')};
  const requiredText = ${getField('requiredText')};
  const addOnsText = ${getField('addOnsText')};
  const summaryText = ${getField('summaryText')};

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const handleOptionSelect = (optionId: string, choiceId: string) => {
    setSelections({ ...selections, [optionId]: choiceId });
  };

  const handleAddonToggle = (addonId: string) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  const handleReset = () => {
    setSelections({});
    setSelectedAddons([]);
  };

  const totalPrice = useMemo(() => {
    let total = product.basePrice;

    // Add option prices
    options.forEach(option => {
      const selectedChoice = selections[option.id];
      if (selectedChoice) {
        const choice = option.choices.find(c => c.id === selectedChoice);
        if (choice) total += choice.price;
      }
    });

    // Add addon prices
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) total += addon.price;
    });

    return total;
  }, [selections, selectedAddons, options, addons, product.basePrice]);

  const handleAddToCart = () => {
    const configuration = {
      product,
      selections,
      selectedAddons,
      totalPrice
    };

    // Use mutation to add to cart via API
    addToCartMutation.mutate({
      product_id: product.name,
      configuration: selections,
      addons: selectedAddons,
      total_price: totalPrice,
      quantity: 1
    });
  };

  const handleSaveConfig = () => {
    const configuration = {
      product,
      selections,
      selectedAddons,
      totalPrice
    };

    // Use mutation to save configuration via API
    saveConfigMutation.mutate({
      product_name: product.name,
      configuration: selections,
      addons: selectedAddons,
      total_price: totalPrice
    });
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {product.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Product Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-4">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                  <div className="text-6xl">💻</div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      \${totalPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {totalPriceText}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addToCartMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-5 h-5" />
                      )}
                      {addToCartMutation.isPending ? 'Adding...' : addToCartText}
                    </button>
                    <button
                      onClick={handleSaveConfig}
                      disabled={saveConfigMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saveConfigMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {saveConfigMutation.isPending ? 'Saving...' : saveConfigText}
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {resetText}
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {summaryText}
                </h4>
                <div className="space-y-2 text-sm">
                  {options.map(option => {
                    const selected = selections[option.id];
                    const choice = option.choices.find(c => c.id === selected);
                    if (!choice) return null;
                    return (
                      <div key={option.id} className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>{option.name}:</span>
                        <span className="font-medium">{choice.name}</span>
                      </div>
                    );
                  })}
                  {selectedAddons.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2" />
                      {selectedAddons.map(addonId => {
                        const addon = addons.find(a => a.id === addonId);
                        if (!addon) return null;
                        return (
                          <div key={addon.id} className="flex justify-between text-gray-700 dark:text-gray-300">
                            <span>{addon.name}</span>
                            <span className="font-medium">+\${addon.price}</span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Configuration Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Options */}
            {options.map(option => (
              <div key={option.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {option.name}
                  </h3>
                  {option.required && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
                      {requiredText}
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {option.choices.map(choice => {
                    const isSelected = selections[option.id] === choice.id;
                    return (
                      <button
                        key={choice.id}
                        onClick={() => handleOptionSelect(option.id, choice.id)}
                        className={cn(
                          "relative p-4 rounded-lg border-2 transition-all text-left",
                          isSelected
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}

                        {choice.color && (
                          <div
                            className="w-12 h-12 rounded-full mb-3 border-2 border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: choice.color }}
                          />
                        )}

                        <div className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {choice.name}
                        </div>
                        {choice.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {choice.description}
                          </div>
                        )}
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {choice.price > 0 ? \`+$\${choice.price}\` : 'Included'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Add-ons */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {addOnsText}
              </h3>
              <div className="space-y-3">
                {addons.map(addon => {
                  const isSelected = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => handleAddonToggle(addon.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                        isSelected
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded border-2 flex items-center justify-center",
                          isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300 dark:border-gray-600"
                        )}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {addon.name}
                        </span>
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        +\${addon.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductConfigurator;
    `,

    list: `
${commonImports}

interface Choice {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface Option {
  id: string;
  name: string;
  required: boolean;
  choices: Choice[];
}

interface Addon {
  id: string;
  name: string;
  price: number;
}

interface Product {
  name: string;
  basePrice: number;
  description: string;
}

interface ConfiguratorProps {
  ${dataName}?: any;
  className?: string;
  onAddToCart?: (configuration: any) => void;
}

const ProductConfigurator: React.FC<ConfiguratorProps> = ({
  ${dataName},
  className,
  onAddToCart
}) => {
  const queryClient = useQueryClient();
  const configuratorData = ${dataName} || {};

  // Mutation for adding to cart
  const addToCartMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('/cart', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart successfully!');
      if (onAddToCart) onAddToCart(data);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to add to cart');
    },
  });

  const product = ${getField('product')} as Product;
  const options = ${getField('options')} as Option[];
  const addons = ${getField('addons')} as Addon[];
  const title = ${getField('title')};
  const addToCartText = ${getField('addToCartText')};
  const totalPriceText = ${getField('totalPriceText')};

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const totalPrice = useMemo(() => {
    let total = product.basePrice;
    options.forEach(option => {
      const selectedChoice = selections[option.id];
      if (selectedChoice) {
        const choice = option.choices.find(c => c.id === selectedChoice);
        if (choice) total += choice.price;
      }
    });
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) total += addon.price;
    });
    return total;
  }, [selections, selectedAddons, options, addons, product.basePrice]);

  const handleAddToCart = () => {
    // Use mutation to add to cart via API
    addToCartMutation.mutate({
      product_id: product.name,
      configuration: selections,
      addons: selectedAddons,
      total_price: totalPrice,
      quantity: 1
    });
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">{title}</h1>

        <div className="space-y-6">
          {options.map(option => (
            <div key={option.id} className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {option.name}
              </h3>
              <select
                value={selections[option.id] || ''}
                onChange={(e) => setSelections({ ...selections, [option.id]: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select {option.name}</option>
                {option.choices.map(choice => (
                  <option key={choice.id} value={choice.id}>
                    {choice.name} {choice.price > 0 && \`(+$\${choice.price})\`}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add-ons</h3>
            <div className="space-y-2">
              {addons.map(addon => (
                <label key={addon.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAddons.includes(addon.id)}
                    onChange={() => {
                      if (selectedAddons.includes(addon.id)) {
                        setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                      } else {
                        setSelectedAddons([...selectedAddons, addon.id]);
                      }
                    }}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-900 dark:text-gray-100 font-bold">{addon.name} (+\${addon.price})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalPriceText}</span>
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">\${totalPrice.toLocaleString()}</span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addToCartMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </span>
              ) : (
                addToCartText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductConfigurator;
    `,

    wizard: `
${commonImports}

interface Choice {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface Option {
  id: string;
  name: string;
  required: boolean;
  choices: Choice[];
}

interface Product {
  name: string;
  basePrice: number;
  description: string;
}

interface ConfiguratorProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: (configuration: any) => void;
}

const ProductConfigurator: React.FC<ConfiguratorProps> = ({
  ${dataName},
  className,
  onComplete
}) => {
  const queryClient = useQueryClient();
  const configuratorData = ${dataName} || {};

  // Mutation for completing the configuration (adding to cart)
  const completeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('/cart', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Configuration completed and added to cart!');
      if (onComplete) onComplete(data);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to complete configuration');
    },
  });

  const product = ${getField('product')} as Product;
  const options = ${getField('options')} as Option[];
  const addToCartText = ${getField('addToCartText')};

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const totalPrice = useMemo(() => {
    let total = product.basePrice;
    options.forEach(option => {
      const selectedChoice = selections[option.id];
      if (selectedChoice) {
        const choice = option.choices.find(c => c.id === selectedChoice);
        if (choice) total += choice.price;
      }
    });
    return total;
  }, [selections, options, product.basePrice]);

  const handleNext = () => {
    if (currentStep < options.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Use mutation for the final step
      completeMutation.mutate({
        product_id: product.name,
        configuration: selections,
        total_price: totalPrice,
        quantity: 1
      });
    }
  };

  const currentOption = options[currentStep];
  const isLastStep = currentStep === options.length - 1;

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {options.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(((currentStep + 1) / options.length) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: \`\${((currentStep + 1) / options.length) * 100}%\` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {currentOption.name}
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {currentOption.choices.map(choice => {
              const isSelected = selections[currentOption.id] === choice.id;
              return (
                <button
                  key={choice.id}
                  onClick={() => setSelections({ ...selections, [currentOption.id]: choice.id })}
                  className={cn(
                    "p-6 rounded-lg border-2 transition-all text-left",
                    isSelected
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                >
                  <div className="font-bold text-gray-900 dark:text-gray-100 mb-2">{choice.name}</div>
                  {choice.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">{choice.description}</div>
                  )}
                  <div className="text-blue-600 dark:text-blue-400 font-bold">
                    {choice.price > 0 ? \`+$\${choice.price}\` : 'Included'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              \${totalPrice.toLocaleString()}
            </div>

            <button
              onClick={handleNext}
              disabled={!selections[currentOption.id] || completeMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {completeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  {isLastStep ? addToCartText : 'Next'}
                  {!isLastStep && <ChevronRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductConfigurator;
    `
  };

  return variants[variant] || variants.visual;
};
