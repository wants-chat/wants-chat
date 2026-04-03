import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTrainerDetailView = (resolved: ResolvedComponent) => {
  return `import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Mail, Phone, DollarSign, Award, Dumbbell,
  Loader2, ChevronRight, Sparkles, Star, Calendar, Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TrainerDetailViewProps {
  className?: string;
  data?: any;
  backRoute?: string;
  bookSessionRoute?: string;
  [key: string]: any;
}

export default function TrainerDetailView({
  className,
  data: propData,
  backRoute = '/trainers',
  bookSessionRoute
}: TrainerDetailViewProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['trainers', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/trainers/\${id}\`);
      return response.data?.data || response.data || response;
    },
    enabled: !propData && !!id,
  });

  // Fetch trainer's upcoming classes
  const { data: trainerClasses } = useQuery({
    queryKey: ['classes', 'trainer', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/classes?trainer_id=\${id}&limit=6\`);
      return response.data?.data || response.data || response || [];
    },
    enabled: !!id,
  });

  const data = propData || fetchedData;

  // Parse specializations
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
  const getGradient = (seed: string) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-green-500 to-teal-500',
      'from-indigo-500 to-purple-500',
      'from-rose-500 to-orange-500',
    ];
    const index = seed ? seed.charCodeAt(0) % gradients.length : 0;
    return gradients[index];
  };

  const handleBack = () => navigate(backRoute);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Dumbbell className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Unable to load trainer profile</p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const fullName = \`\${data.first_name || ''} \${data.last_name || ''}\`.trim() || 'Trainer';
  const specializations = parseSpecializations(data.specializations);
  const gradient = getGradient(data.id || data.first_name);
  const classList = Array.isArray(trainerClasses) ? trainerClasses : [];

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20", className)}>
      {/* Hero Section */}
      <div className={cn("relative bg-gradient-to-r text-white", gradient)}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-12 sm:py-16">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6 text-white/90 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trainers
          </Button>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl ring-4 ring-white/30">
                {data.avatar_url ? (
                  <img
                    src={data.avatar_url}
                    alt={fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-5xl sm:text-6xl font-bold text-white">
                    {getInitials(data.first_name, data.last_name)}
                  </span>
                )}
              </div>
              {data.is_active && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg" title="Active" />
              )}
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <Badge className="mb-3 bg-white/20 text-white border-white/30">
                <Award className="h-3.5 w-3.5 mr-1" />
                Certified Trainer
              </Badge>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
                {fullName}
              </h1>

              {/* Specializations */}
              {specializations.length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {specializations.map((spec, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
                {data.hourly_rate && (
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-semibold">\${data.hourly_rate}/hr</span>
                  </div>
                )}
                {classList.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <Calendar className="h-5 w-5" />
                    <span className="font-semibold">{classList.length} Upcoming Classes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Card */}
            {data.bio && (
              <Card className="overflow-hidden border-0 shadow-xl">
                <div className={cn("h-1.5 bg-gradient-to-r", gradient)} />
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    About Me
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {data.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Specializations Card */}
            {specializations.length > 0 && (
              <Card className="overflow-hidden border-0 shadow-xl">
                <div className={cn("h-1.5 bg-gradient-to-r", gradient)} />
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Award className="h-5 w-5 text-orange-600" />
                    Specializations & Expertise
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {specializations.map((spec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
                      >
                        <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-r flex items-center justify-center", gradient)}>
                          <Dumbbell className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">{spec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Classes */}
            {classList.length > 0 && (
              <Card className="overflow-hidden border-0 shadow-xl">
                <div className={cn("h-1.5 bg-gradient-to-r", gradient)} />
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Upcoming Classes
                  </h2>
                  <div className="space-y-4">
                    {classList.slice(0, 4).map((classItem: any) => {
                      const classDate = classItem.scheduled_at ? new Date(classItem.scheduled_at) : null;
                      return (
                        <Link
                          key={classItem.id}
                          to={\`/classes/\${classItem.id}\`}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                        >
                          <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center text-xl", gradient)}>
                            🏋️
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {classItem.name}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              {classDate && (
                                <>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {classDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {classDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                  {classList.length > 4 && (
                    <div className="mt-4 text-center">
                      <Link
                        to={\`/classes?trainer_id=\${id}\`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View all {classList.length} classes →
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="overflow-hidden border-0 shadow-xl sticky top-6">
              <div className={cn("h-1.5 bg-gradient-to-r", gradient)} />
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Get in Touch
                </h3>

                {data.email && (
                  <a
                    href={\`mailto:\${data.email}\`}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-3 hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900 text-sm">{data.email}</p>
                    </div>
                  </a>
                )}

                {data.phone && (
                  <a
                    href={\`tel:\${data.phone}\`}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-xl mb-3 hover:bg-green-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{data.phone}</p>
                    </div>
                  </a>
                )}

                {/* Hourly Rate */}
                {data.hourly_rate && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hourly Rate</p>
                      <p className="font-bold text-xl text-gray-900">\${data.hourly_rate}</p>
                    </div>
                  </div>
                )}

                {/* Book Session Button */}
                {bookSessionRoute && (
                  <Button
                    onClick={() => navigate(bookSessionRoute.replace(':id', id || ''))}
                    className={cn(
                      "w-full h-12 font-semibold text-lg rounded-xl transition-all",
                      "bg-gradient-to-r text-white shadow-lg hover:shadow-xl hover:scale-[1.02]",
                      gradient
                    )}
                  >
                    Book a Session
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
};
