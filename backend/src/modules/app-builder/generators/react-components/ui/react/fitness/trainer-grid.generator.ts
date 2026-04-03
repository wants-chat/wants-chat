import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTrainerGrid = (
  resolved: ResolvedComponent,
  variant: 'cards' | 'list' | 'compact' = 'cards'
) => {
  const dataSource = resolved.dataSource;

  // Use standard 'data' prop name to match react-frontend-generator pattern
  const dataName = 'data';

  // Generate API route from resolved actions
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'trainers'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'trainers';

  const commonImports = `
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Award, DollarSign, Dumbbell, ArrowRight, Sparkles, Loader2 } from 'lucide-react';`;

  const variants = {
    cards: `
${commonImports}

interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar_url?: string;
  specializations?: string;
  hourly_rate?: number;
  is_active?: boolean;
  email?: string;
}

interface TrainerGridProps {
  ${dataName}?: any;
  className?: string;
  onTrainerClick?: (trainer: Trainer) => void;
  detailRoute?: string;
  [key: string]: any;
}

const TrainerGrid: React.FC<TrainerGridProps> = ({
  ${dataName}: propData,
  className,
  onTrainerClick,
  detailRoute
}) => {
  const navigate = useNavigate();

  // Dynamic data fetching with react-query
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response?.${entity} || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;

  // Handle both array directly or nested data object
  const trainersList: Trainer[] = Array.isArray(${dataName})
    ? ${dataName}
    : ${dataName}?.trainers || ${dataName}?.data || [];

  // Loading state
  if (isLoading && !propData) {
    return (
      <section className={cn("py-16 bg-gradient-to-br from-slate-50 to-blue-50", className)}>
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
      </section>
    );
  }

  // Parse specializations from string or array to array
  const parseSpecializations = (specs: any): string[] => {
    if (!specs) return [];
    if (Array.isArray(specs)) return specs;
    if (typeof specs !== 'string') return [];
    try {
      const parsed = JSON.parse(specs);
      return Array.isArray(parsed) ? parsed : [specs];
    } catch {
      return specs.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return \`\${firstName?.charAt(0) || ''}\${lastName?.charAt(0) || ''}\`.toUpperCase();
  };

  // Get gradient based on index
  const getGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-green-500 to-teal-500',
      'from-indigo-500 to-purple-500',
      'from-rose-500 to-orange-500',
    ];
    return gradients[index % gradients.length];
  };

  const handleTrainerClick = (trainer: Trainer) => {
    if (onTrainerClick) {
      onTrainerClick(trainer);
    } else if (detailRoute) {
      const route = detailRoute.replace(':id', trainer.id);
      navigate(route);
    }
  };

  if (!trainersList || trainersList.length === 0) {
    return (
      <section className={cn("py-16 bg-gradient-to-br from-slate-50 to-blue-50", className)}>
        <div className="container mx-auto px-4 text-center">
          <Dumbbell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No trainers available</p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-16 sm:py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5">
            <Dumbbell className="w-3.5 h-3.5 mr-1.5 inline" />
            Expert Trainers
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent mb-4">
            Meet Our Team
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Our certified trainers are here to help you achieve your fitness goals
          </p>
        </div>

        {/* Trainer Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {trainersList.map((trainer: Trainer, index: number) => {
            const gradient = getGradient(index);
            const specializations = parseSpecializations(trainer.specializations);
            const fullName = \`\${trainer.first_name || ''} \${trainer.last_name || ''}\`.trim();

            return (
              <Card
                key={trainer.id}
                onClick={() => handleTrainerClick(trainer)}
                className="group relative overflow-hidden rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:scale-[1.02] bg-white"
              >
                {/* Top Gradient Bar */}
                <div className={cn("h-2 bg-gradient-to-r", gradient)} />

                {/* Animated Background on Hover */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500",
                  gradient
                )} />

                <CardContent className="p-6 relative z-10">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center mb-6">
                    <div className={cn(
                      "w-28 h-28 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg mb-4 ring-4 ring-white group-hover:scale-110 transition-transform duration-300",
                      gradient
                    )}>
                      {trainer.avatar_url ? (
                        <img
                          src={trainer.avatar_url}
                          alt={fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-white">
                          {getInitials(trainer.first_name, trainer.last_name)}
                        </span>
                      )}
                    </div>

                    {/* Name & Rate */}
                    <h3 className="text-xl font-bold text-gray-900 text-center group-hover:text-purple-600 transition-colors">
                      {fullName || 'Trainer'}
                    </h3>

                    {trainer.hourly_rate && (
                      <div className="flex items-center gap-1 mt-2 text-green-600 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        <span>{trainer.hourly_rate}/hr</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {trainer.bio && (
                    <p className="text-gray-600 text-sm text-center mb-5 line-clamp-3 min-h-[3.75rem]">
                      {trainer.bio}
                    </p>
                  )}

                  {/* Specializations */}
                  {specializations.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-5">
                      {specializations.slice(0, 4).map((spec, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          {spec}
                        </Badge>
                      ))}
                      {specializations.length > 4 && (
                        <Badge variant="secondary" className="text-xs px-2.5 py-1">
                          +{specializations.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrainerClick(trainer);
                    }}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-[1.02]",
                      gradient
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Award className="w-4 h-4" />
                      View Profile
                    </span>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrainerGrid;
    `,

    list: `
${commonImports}

interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  specializations?: string;
  hourly_rate?: number;
}

interface TrainerListProps {
  ${dataName}?: any;
  className?: string;
  onTrainerClick?: (trainer: Trainer) => void;
  detailRoute?: string;
  [key: string]: any;
}

const TrainerList: React.FC<TrainerListProps> = ({
  ${dataName}: propData,
  className,
  onTrainerClick,
  detailRoute
}) => {
  const navigate = useNavigate();

  // Dynamic data fetching with react-query
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response?.${entity} || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;

  const trainersList: Trainer[] = Array.isArray(${dataName})
    ? ${dataName}
    : ${dataName}?.trainers || ${dataName}?.data || [];

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("py-16 text-center", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
      </div>
    );
  }

  const handleTrainerClick = (trainer: Trainer) => {
    if (onTrainerClick) {
      onTrainerClick(trainer);
    } else if (detailRoute) {
      const route = detailRoute.replace(':id', trainer.id);
      navigate(route);
    }
  };

  if (!trainersList || trainersList.length === 0) {
    return (
      <div className={cn("py-16 text-center", className)}>
        <p className="text-gray-500">No trainers available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {trainersList.map((trainer: Trainer) => (
        <Card
          key={trainer.id}
          onClick={() => handleTrainerClick(trainer)}
          className="p-4 hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {trainer.first_name} {trainer.last_name}
              </h3>
              <p className="text-sm text-gray-600">{trainer.specializations}</p>
            </div>
            {trainer.hourly_rate && (
              <Badge variant="secondary">\${trainer.hourly_rate}/hr</Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TrainerList;
    `,

    compact: `
${commonImports}

interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  specializations?: string;
}

interface TrainerCompactProps {
  ${dataName}?: any;
  className?: string;
  onTrainerClick?: (trainer: Trainer) => void;
  detailRoute?: string;
  [key: string]: any;
}

const TrainerCompact: React.FC<TrainerCompactProps> = ({
  ${dataName}: propData,
  className,
  onTrainerClick,
  detailRoute
}) => {
  const navigate = useNavigate();

  // Dynamic data fetching with react-query
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response?.${entity} || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;

  const trainersList: Trainer[] = Array.isArray(${dataName})
    ? ${dataName}
    : ${dataName}?.trainers || ${dataName}?.data || [];

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("py-8 text-center", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
      </div>
    );
  }

  const handleTrainerClick = (trainer: Trainer) => {
    if (onTrainerClick) {
      onTrainerClick(trainer);
    } else if (detailRoute) {
      const route = detailRoute.replace(':id', trainer.id);
      navigate(route);
    }
  };

  if (!trainersList || trainersList.length === 0) {
    return (
      <div className={cn("py-8 text-center", className)}>
        <p className="text-gray-500 text-sm">No trainers</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {trainersList.slice(0, 5).map((trainer: Trainer) => (
        <div
          key={trainer.id}
          onClick={() => handleTrainerClick(trainer)}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <span className="font-medium text-sm text-gray-900">
            {trainer.first_name} {trainer.last_name}
          </span>
          <Badge variant="secondary" className="text-xs">{trainer.specializations}</Badge>
        </div>
      ))}
    </div>
  );
};

export default TrainerCompact;
    `
  };

  return variants[variant] || variants.cards;
};
