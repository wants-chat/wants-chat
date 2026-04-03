import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateClassScheduleGrid = (
  resolved: ResolvedComponent,
  variant: 'cards' | 'list' | 'compact' = 'cards'
) => {
  // Use standard 'data' prop name to match react-frontend-generator pattern
  const dataName = 'data';
  const dataSource = resolved.dataSource;

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'classes'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'classes';

  const commonImports = `
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Users, MapPin, User, Dumbbell, ArrowRight, Sparkles, Loader2 } from 'lucide-react';`;

  const variants = {
    cards: `
${commonImports}

interface FitnessClass {
  id: string;
  name: string;
  description?: string;
  class_type?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  capacity?: number;
  enrolled_count?: number;
  location?: string;
  trainer_id?: string;
  trainer_first_name?: string;
  trainer_last_name?: string;
  status?: string;
}

interface ClassScheduleGridProps {
  ${dataName}?: any;
  className?: string;
  onClassClick?: (classItem: FitnessClass) => void;
  onBookClass?: (classItem: FitnessClass) => void;
  bookRoute?: string;
  detailRoute?: string;
  [key: string]: any;
}

const ClassScheduleGrid: React.FC<ClassScheduleGridProps> = ({
  ${dataName}: propData,
  className,
  onClassClick,
  onBookClass,
  bookRoute = '/member/classes/:id/book',
  detailRoute
}) => {
  const navigate = useNavigate();

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;

  // Handle both array directly or nested data object
  const classesList: FitnessClass[] = Array.isArray(${dataName})
    ? ${dataName}
    : ${dataName}?.classes || ${dataName}?.data || [];

  if (isLoading && !propData) {
    return (
      <section className={cn("py-16 bg-gradient-to-br from-slate-50 to-blue-50", className)}>
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </section>
    );
  }

  // Get gradient based on class type
  const getClassGradient = (classType: string | undefined) => {
    const type = (classType || '').toLowerCase();
    if (type.includes('yoga') || type.includes('meditation')) {
      return 'from-purple-500 to-indigo-500';
    }
    if (type.includes('hiit') || type.includes('cardio') || type.includes('boxing')) {
      return 'from-red-500 to-orange-500';
    }
    if (type.includes('strength') || type.includes('weight') || type.includes('crossfit')) {
      return 'from-blue-500 to-cyan-500';
    }
    if (type.includes('spin') || type.includes('cycling')) {
      return 'from-green-500 to-teal-500';
    }
    if (type.includes('pilates') || type.includes('stretch')) {
      return 'from-pink-500 to-rose-500';
    }
    if (type.includes('dance') || type.includes('zumba')) {
      return 'from-amber-500 to-yellow-500';
    }
    // Default gradients based on index
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-green-500 to-teal-500',
      'from-indigo-500 to-purple-500',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  // Get icon based on class type
  const getClassIcon = (classType: string | undefined) => {
    const type = (classType || '').toLowerCase();
    if (type.includes('yoga') || type.includes('meditation') || type.includes('pilates')) {
      return '🧘';
    }
    if (type.includes('hiit') || type.includes('cardio')) {
      return '🔥';
    }
    if (type.includes('strength') || type.includes('weight')) {
      return '💪';
    }
    if (type.includes('spin') || type.includes('cycling')) {
      return '🚴';
    }
    if (type.includes('boxing') || type.includes('kickboxing')) {
      return '🥊';
    }
    if (type.includes('dance') || type.includes('zumba')) {
      return '💃';
    }
    if (type.includes('swim') || type.includes('aqua')) {
      return '🏊';
    }
    return '🏋️';
  };

  // Format date and time
  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return { date: '', time: '', day: '' };
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  };

  // Get availability status
  const getAvailability = (capacity: number | undefined, enrolled: number | undefined) => {
    const cap = capacity || 20;
    const enr = enrolled || 0;
    const available = cap - enr;
    const percentage = (enr / cap) * 100;

    if (available <= 0) return { status: 'full', text: 'Class Full', color: 'bg-red-500' };
    if (percentage >= 80) return { status: 'limited', text: \`\${available} spots left\`, color: 'bg-amber-500' };
    return { status: 'available', text: \`\${available} spots available\`, color: 'bg-green-500' };
  };

  const handleClassClick = (classItem: FitnessClass) => {
    if (onClassClick) {
      onClassClick(classItem);
    } else if (detailRoute) {
      const route = detailRoute.replace(':id', classItem.id);
      navigate(route);
    }
  };

  const handleBookClass = (classItem: FitnessClass, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookClass) {
      onBookClass(classItem);
    } else if (bookRoute) {
      const route = bookRoute.replace(':id', classItem.id);
      navigate(route);
    }
  };

  if (!classesList || classesList.length === 0) {
    return (
      <section className={cn("py-16 bg-gradient-to-br from-slate-50 to-blue-50", className)}>
        <div className="container mx-auto px-4 text-center">
          <Dumbbell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No classes scheduled</p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-16 sm:py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            Class Schedule
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Upcoming Classes
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find the perfect class to match your fitness goals and schedule
          </p>
        </div>

        {/* Class Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {classesList.map((classItem: FitnessClass, index: number) => {
            const gradient = getClassGradient(classItem.class_type);
            const icon = getClassIcon(classItem.class_type);
            const { date, time, day } = formatDateTime(classItem.scheduled_at);
            const availability = getAvailability(classItem.capacity, classItem.enrolled_count);
            const trainerName = \`\${classItem.trainer_first_name || ''} \${classItem.trainer_last_name || ''}\`.trim();

            return (
              <Card
                key={classItem.id}
                onClick={() => handleClassClick(classItem)}
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
                  {/* Class Type Badge & Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg text-2xl",
                      gradient
                    )}>
                      {icon}
                    </div>
                    {classItem.class_type && (
                      <Badge variant="secondary" className="text-xs font-medium">
                        {classItem.class_type}
                      </Badge>
                    )}
                  </div>

                  {/* Class Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {classItem.name}
                  </h3>

                  {/* Description */}
                  {classItem.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                      {classItem.description}
                    </p>
                  )}

                  {/* Class Details */}
                  <div className="space-y-2.5 mb-5">
                    {/* Date & Time */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{day}, {date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>{time}</span>
                      </div>
                    </div>

                    {/* Duration */}
                    {classItem.duration_minutes && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Dumbbell className="w-4 h-4 text-orange-500" />
                        <span>{classItem.duration_minutes} minutes</span>
                      </div>
                    )}

                    {/* Location */}
                    {classItem.location && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span>{classItem.location}</span>
                      </div>
                    )}

                    {/* Trainer */}
                    {trainerName && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <User className="w-4 h-4 text-indigo-500" />
                        <span>with <span className="font-medium text-gray-900">{trainerName}</span></span>
                      </div>
                    )}
                  </div>

                  {/* Capacity Bar */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Users className="w-3.5 h-3.5" />
                        <span>{classItem.enrolled_count || 0}/{classItem.capacity || 20} enrolled</span>
                      </div>
                      <Badge className={cn("text-white text-xs", availability.color)}>
                        {availability.text}
                      </Badge>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full bg-gradient-to-r transition-all duration-500", gradient)}
                        style={{ width: \`\${Math.min(((classItem.enrolled_count || 0) / (classItem.capacity || 20)) * 100, 100)}%\` }}
                      />
                    </div>
                  </div>

                  {/* Book Button */}
                  <Button
                    onClick={(e) => handleBookClass(classItem, e)}
                    disabled={availability.status === 'full'}
                    className={cn(
                      "w-full h-11 font-semibold rounded-xl transition-all duration-300 group/btn",
                      availability.status === 'full'
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : cn("bg-gradient-to-r text-white shadow-md hover:shadow-lg", gradient)
                    )}
                  >
                    {availability.status === 'full' ? (
                      'Class Full'
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Book Now
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    )}
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

export default ClassScheduleGrid;
    `,

    list: `
${commonImports}

interface FitnessClass {
  id: string;
  name: string;
  description?: string;
  class_type?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  capacity?: number;
  enrolled_count?: number;
  location?: string;
  trainer_first_name?: string;
  trainer_last_name?: string;
}

interface ClassScheduleListProps {
  ${dataName}?: any;
  className?: string;
  onClassClick?: (classItem: FitnessClass) => void;
  onBookClass?: (classItem: FitnessClass) => void;
  [key: string]: any;
}

const ClassScheduleList: React.FC<ClassScheduleListProps> = ({
  ${dataName}: propData,
  className,
  onClassClick,
  onBookClass
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;

  const classesList: FitnessClass[] = Array.isArray(${dataName})
    ? ${dataName}
    : ${dataName}?.classes || ${dataName}?.data || [];

  if (isLoading && !propData) {
    return (
      <div className={cn("py-16 flex items-center justify-center", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!classesList || classesList.length === 0) {
    return (
      <div className={cn("py-16 text-center", className)}>
        <p className="text-gray-500">No classes scheduled</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {classesList.map((classItem: FitnessClass) => (
        <Card
          key={classItem.id}
          onClick={() => onClassClick?.(classItem)}
          className="p-4 hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{classItem.name}</h3>
              <p className="text-sm text-gray-600">{classItem.class_type}</p>
            </div>
            <Button
              onClick={(e) => { e.stopPropagation(); onBookClass?.(classItem); }}
              size="sm"
            >
              Book
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ClassScheduleList;
    `,

    compact: `
${commonImports}

interface FitnessClass {
  id: string;
  name: string;
  class_type?: string;
  scheduled_at?: string;
  duration_minutes?: number;
}

interface ClassScheduleCompactProps {
  ${dataName}?: any;
  className?: string;
  onClassClick?: (classItem: FitnessClass) => void;
  [key: string]: any;
}

const ClassScheduleCompact: React.FC<ClassScheduleCompactProps> = ({
  ${dataName}: propData,
  className,
  onClassClick
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;

  const classesList: FitnessClass[] = Array.isArray(${dataName})
    ? ${dataName}
    : ${dataName}?.classes || ${dataName}?.data || [];

  if (isLoading && !propData) {
    return (
      <div className={cn("py-8 flex items-center justify-center", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!classesList || classesList.length === 0) {
    return (
      <div className={cn("py-8 text-center", className)}>
        <p className="text-gray-500 text-sm">No classes</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {classesList.slice(0, 5).map((classItem: FitnessClass) => (
        <div
          key={classItem.id}
          onClick={() => onClassClick?.(classItem)}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <span className="font-medium text-sm text-gray-900">{classItem.name}</span>
          <Badge variant="secondary" className="text-xs">{classItem.class_type}</Badge>
        </div>
      ))}
    </div>
  );
};

export default ClassScheduleCompact;
    `
  };

  return variants[variant] || variants.cards;
};
