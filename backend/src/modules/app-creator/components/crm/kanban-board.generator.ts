/**
 * Kanban Board Component Generator
 *
 * Generates a kanban board for managing tasks, deals, or any entity with stages.
 */

export interface KanbanBoardOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  stages?: Array<{ id: string; name: string; color?: string }>;
}

export function generateKanbanBoard(options: KanbanBoardOptions = {}): string {
  const {
    componentName = 'KanbanBoard',
    entity = 'deal',
    endpoint,
    stages = [
      { id: 'lead', name: 'Lead', color: 'gray' },
      { id: 'qualified', name: 'Qualified', color: 'blue' },
      { id: 'proposal', name: 'Proposal', color: 'yellow' },
      { id: 'negotiation', name: 'Negotiation', color: 'orange' },
      { id: 'closed', name: 'Closed Won', color: 'green' },
    ],
  } = options;

  const pluralEntity = entity.endsWith('s') ? entity : entity + 's';
  const finalEndpoint = endpoint || `/${pluralEntity}`;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, MoreHorizontal, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
}

const stages = ${JSON.stringify(stages, null, 2)};

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['${pluralEntity}'],
    queryFn: async () => {
      const response = await api.get<any>('${finalEndpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      api.put('${finalEndpoint}/' + id, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${pluralEntity}'] });
    },
    onError: () => toast.error('Failed to update'),
  });

  const getStageColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'bg-gray-100 dark:bg-gray-700',
      blue: 'bg-blue-100 dark:bg-blue-900/30',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
      orange: 'bg-orange-100 dark:bg-orange-900/30',
      green: 'bg-green-100 dark:bg-green-900/30',
      red: 'bg-red-100 dark:bg-red-900/30',
      purple: 'bg-purple-100 dark:bg-purple-900/30',
    };
    return colors[color] || colors.gray;
  };

  const getHeaderColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'border-gray-300',
      blue: 'border-blue-500',
      yellow: 'border-yellow-500',
      orange: 'border-orange-500',
      green: 'border-green-500',
      red: 'border-red-500',
      purple: 'border-purple-500',
    };
    return colors[color] || colors.gray;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const getItemsByStage = (stageId: string) =>
    items?.filter((item: any) => item.stage === stageId || item.status === stageId) || [];

  return (
    <div className={\`overflow-x-auto \${className || ''}\`}>
      <div className="flex gap-4 min-w-max p-4">
        {stages.map((stage) => {
          const stageItems = getItemsByStage(stage.id);
          const stageValue = stageItems.reduce((sum: number, item: any) => sum + (item.value || 0), 0);

          return (
            <div
              key={stage.id}
              className="w-72 flex-shrink-0"
            >
              <div className={\`rounded-t-lg p-3 border-t-4 \${getHeaderColor(stage.color || 'gray')} \${getStageColor(stage.color || 'gray')}\`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{stage.name}</h3>
                  <span className="text-sm text-gray-500">{stageItems.length}</span>
                </div>
                {stageValue > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <DollarSign className="w-3 h-3" />
                    {stageValue.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-b-lg p-2 min-h-[400px] space-y-2">
                {stageItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('itemId', item.id)}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {item.name || item.title}
                      </h4>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    {item.company_name && (
                      <p className="text-xs text-gray-500 mt-1">{item.company_name}</p>
                    )}
                    {item.value && (
                      <p className="text-sm font-semibold text-green-600 mt-2">
                        \${item.value.toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
                <button className="w-full p-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" />
                  Add {entity}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePipelineOverview(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'PipelineOverview', endpoint = '/deals' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, DollarSign, TrendingUp, Users, Target } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: deals, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const totalValue = deals?.reduce((sum: number, d: any) => sum + (d.value || 0), 0) || 0;
  const wonValue = deals?.filter((d: any) => d.stage === 'closed' || d.status === 'won')
    .reduce((sum: number, d: any) => sum + (d.value || 0), 0) || 0;
  const activeDeals = deals?.filter((d: any) => d.stage !== 'closed' && d.status !== 'won' && d.status !== 'lost').length || 0;

  const stats = [
    { label: 'Pipeline Value', value: '\$' + totalValue.toLocaleString(), icon: DollarSign, color: 'blue' },
    { label: 'Won Revenue', value: '\$' + wonValue.toLocaleString(), icon: TrendingUp, color: 'green' },
    { label: 'Active Deals', value: activeDeals.toString(), icon: Target, color: 'purple' },
    { label: 'Total Deals', value: (deals?.length || 0).toString(), icon: Users, color: 'orange' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className={\`w-10 h-10 rounded-lg flex items-center justify-center bg-\${stat.color}-100 dark:bg-\${stat.color}-900/30\`}>
              <stat.icon className={\`w-5 h-5 text-\${stat.color}-600\`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ${componentName};
`;
}
