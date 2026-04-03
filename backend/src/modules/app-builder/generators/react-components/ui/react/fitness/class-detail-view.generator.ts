import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateClassDetailView = (resolved: ResolvedComponent) => {
  return `import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Calendar, Clock, MapPin, User, Users, Dumbbell,
  Loader2, ChevronRight, Sparkles, Timer, Target
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ClassDetailViewProps {
  className?: string;
  data?: any;
  backRoute?: string;
  bookRoute?: string;
  [key: string]: any;
}

export default function ClassDetailView({
  className,
  data: propData,
  backRoute = '/classes',
  bookRoute = '/member/classes/:id/book'
}: ClassDetailViewProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['classes', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/classes/\${id}\`);
      return response.data?.data || response.data || response;
    },
    enabled: !propData && !!id,
  });

  const data = propData || fetchedData;

  // Format date and time
  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return { date: '', time: '', day: '', fullDate: '' };
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      day: date.toLocaleDateString('en-US', { weekday: 'long' }),
      fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    };
  };

  // Get class gradient based on type
  const getClassGradient = (classType: string | undefined) => {
    const type = (classType || '').toLowerCase();
    if (type.includes('yoga') || type.includes('meditation')) return 'from-purple-500 to-indigo-500';
    if (type.includes('hiit') || type.includes('cardio') || type.includes('boxing')) return 'from-red-500 to-orange-500';
    if (type.includes('strength') || type.includes('weight') || type.includes('crossfit')) return 'from-blue-500 to-cyan-500';
    if (type.includes('spin') || type.includes('cycling')) return 'from-green-500 to-teal-500';
    if (type.includes('pilates') || type.includes('stretch')) return 'from-pink-500 to-rose-500';
    if (type.includes('dance') || type.includes('zumba')) return 'from-amber-500 to-yellow-500';
    return 'from-blue-500 to-purple-500';
  };

  // Get class icon/emoji
  const getClassIcon = (classType: string | undefined) => {
    const type = (classType || '').toLowerCase();
    if (type.includes('yoga') || type.includes('meditation') || type.includes('pilates')) return '🧘';
    if (type.includes('hiit') || type.includes('cardio')) return '🔥';
    if (type.includes('strength') || type.includes('weight')) return '💪';
    if (type.includes('spin') || type.includes('cycling')) return '🚴';
    if (type.includes('boxing') || type.includes('kickboxing')) return '🥊';
    if (type.includes('dance') || type.includes('zumba')) return '💃';
    if (type.includes('swim') || type.includes('aqua')) return '🏊';
    return '🏋️';
  };

  const handleBack = () => navigate(backRoute);

  const handleBookClass = () => {
    if (bookRoute && id) {
      navigate(bookRoute.replace(':id', id));
    }
  };

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
        <p className="text-gray-500 mb-4">Unable to load class details</p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const { date, time, day, fullDate } = formatDateTime(data.scheduled_at);
  const gradient = getClassGradient(data.class_type);
  const icon = getClassIcon(data.class_type);
  const trainerName = \`\${data.trainer_first_name || ''} \${data.trainer_last_name || ''}\`.trim();
  const spotsLeft = (data.capacity || 20) - (data.enrolled_count || 0);
  const isFull = spotsLeft <= 0;
  const enrollmentPercentage = Math.min(((data.enrolled_count || 0) / (data.capacity || 20)) * 100, 100);

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20", className)}>
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
            Back to Classes
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-6">
              {/* Class Icon */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl sm:text-5xl shadow-xl">
                {icon}
              </div>

              <div>
                {/* Class Type Badge */}
                {data.class_type && (
                  <Badge className="mb-3 bg-white/20 text-white border-white/30">
                    {data.class_type}
                  </Badge>
                )}

                {/* Class Name */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
                  {data.name}
                </h1>

                {/* Quick Info */}
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{day}, {date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{time}</span>
                  </div>
                  {data.duration_minutes && (
                    <div className="flex items-center gap-1.5">
                      <Timer className="h-4 w-4" />
                      <span>{data.duration_minutes} min</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Book Now CTA */}
            <div className="flex flex-col items-start lg:items-end gap-3">
              <Button
                onClick={handleBookClass}
                disabled={isFull}
                size="lg"
                className={cn(
                  "px-8 py-6 text-lg font-semibold rounded-xl shadow-xl transition-all",
                  isFull
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-900 hover:bg-gray-100 hover:scale-105"
                )}
              >
                {isFull ? 'Class Full' : 'Book This Class'}
              </Button>
              <Badge className={cn(
                "text-sm",
                isFull ? 'bg-red-500' : spotsLeft <= 3 ? 'bg-amber-500' : 'bg-green-500'
              )}>
                {isFull ? 'No spots available' : \`\${spotsLeft} spots remaining\`}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            {data.description && (
              <Card className="overflow-hidden border-0 shadow-xl">
                <div className={cn("h-1.5 bg-gradient-to-r", gradient)} />
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    About This Class
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {data.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Class Details Card */}
            <Card className="overflow-hidden border-0 shadow-xl">
              <div className={cn("h-1.5 bg-gradient-to-r", gradient)} />
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Class Details
                </h2>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Date & Time */}
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Date & Time</p>
                      <p className="font-semibold text-gray-900">{fullDate}</p>
                      <p className="text-blue-600 font-medium">{time}</p>
                    </div>
                  </div>

                  {/* Duration */}
                  {data.duration_minutes && (
                    <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                        <Timer className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Duration</p>
                        <p className="font-semibold text-gray-900">{data.duration_minutes} minutes</p>
                        <p className="text-purple-600 font-medium">Includes warm-up & cool-down</p>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {data.location && (
                    <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Location</p>
                        <p className="font-semibold text-gray-900">{data.location}</p>
                      </div>
                    </div>
                  )}

                  {/* Trainer */}
                  {trainerName && (
                    <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Instructor</p>
                        <p className="font-semibold text-gray-900">{trainerName}</p>
                        <Link
                          to={\`/trainers/\${data.trainer_id}\`}
                          className="text-orange-600 font-medium hover:underline text-sm"
                        >
                          View Profile →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="overflow-hidden border-0 shadow-xl sticky top-6">
              <div className={cn("h-1.5 bg-gradient-to-r", gradient)} />
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Class Enrollment
                </h3>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{data.enrolled_count || 0} enrolled</span>
                    <span className="text-gray-600">{data.capacity || 20} capacity</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full bg-gradient-to-r transition-all duration-500", gradient)}
                      style={{ width: \`\${enrollmentPercentage}%\` }}
                    />
                  </div>
                </div>

                {/* Spots Badge */}
                <div className="flex justify-center mb-6">
                  <Badge className={cn(
                    "text-base px-4 py-2",
                    isFull ? 'bg-red-500' : spotsLeft <= 3 ? 'bg-amber-500' : 'bg-green-500'
                  )}>
                    {isFull ? 'Class Full' : \`\${spotsLeft} spots left\`}
                  </Badge>
                </div>

                {/* Book Button */}
                <Button
                  onClick={handleBookClass}
                  disabled={isFull}
                  className={cn(
                    "w-full h-12 font-semibold text-lg rounded-xl transition-all",
                    isFull
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : cn("bg-gradient-to-r text-white shadow-lg hover:shadow-xl hover:scale-[1.02]", gradient)
                  )}
                >
                  {isFull ? 'Class Full' : 'Book Now'}
                </Button>

                {!isFull && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Secure your spot before it fills up!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Cover Image */}
            {data.cover_image && (
              <Card className="overflow-hidden border-0 shadow-xl">
                <img
                  src={data.cover_image}
                  alt={data.name}
                  className="w-full h-48 object-cover"
                />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
};
