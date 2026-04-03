/**
 * Membership Plans Component Generator
 */

export interface MembershipPlansOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMembershipPlans(options: MembershipPlansOptions = {}): string {
  const { componentName = 'MembershipPlans', endpoint = '/memberships' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Check, Star } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['memberships'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
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
    <div className="grid gap-6 md:grid-cols-3">
      {plans && plans.length > 0 ? (
        plans.map((plan: any) => (
          <div
            key={plan.id}
            className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-6 relative \${
              plan.is_popular ? 'border-blue-600' : 'border-gray-200 dark:border-gray-700'
            }\`}
          >
            {plan.is_popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Most Popular
                </span>
              </div>
            )}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">\${plan.price}</span>
              <span className="text-gray-500">/{plan.billing_period || 'month'}</span>
            </div>
            {plan.description && (
              <p className="text-gray-500 mb-6">{plan.description}</p>
            )}
            <ul className="space-y-3 mb-6">
              {(plan.features || []).map((feature: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={\`w-full py-3 rounded-lg font-medium transition-colors \${
                plan.is_popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              Get Started
            </button>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          No membership plans available
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
