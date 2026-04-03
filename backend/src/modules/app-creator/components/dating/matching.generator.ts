/**
 * Dating Matching Component Generators
 *
 * Generates swipe cards, match cards, discovery filters, and icebreakers
 * for dating applications.
 */

export interface MatchingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateSwipeCards(options: MatchingOptions = {}): string {
  const { componentName = 'SwipeCards', endpoint = '/discover' } = options;

  return `import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2, Heart, X, Star, RotateCcw, Sparkles,
  MapPin, Briefcase, ChevronLeft, ChevronRight,
  Verified, Info, Zap
} from 'lucide-react';
import { api } from '@/lib/api';

interface Profile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  location?: string;
  occupation?: string;
  bio?: string;
  distance?: number;
  verified?: boolean;
  compatibility_score?: number;
  interests?: string[];
}

interface ${componentName}Props {
  onMatch?: (profile: Profile) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onMatch }) => {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['discover-profiles'],
    queryFn: async () => {
      const response = await api.get<Profile[]>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const likeMutation = useMutation({
    mutationFn: (profileId: string) => api.post('${endpoint}/' + profileId + '/like', {}),
    onSuccess: (data: any, profileId: string) => {
      if (data?.matched && onMatch) {
        const matchedProfile = profiles?.find((p) => p.id === profileId);
        if (matchedProfile) onMatch(matchedProfile);
      }
      nextProfile();
    },
  });

  const superLikeMutation = useMutation({
    mutationFn: (profileId: string) => api.post('${endpoint}/' + profileId + '/superlike', {}),
    onSuccess: (data: any, profileId: string) => {
      if (data?.matched && onMatch) {
        const matchedProfile = profiles?.find((p) => p.id === profileId);
        if (matchedProfile) onMatch(matchedProfile);
      }
      nextProfile();
    },
  });

  const passMutation = useMutation({
    mutationFn: (profileId: string) => api.post('${endpoint}/' + profileId + '/pass', {}),
    onSuccess: () => nextProfile(),
  });

  const rewindMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/rewind', {}),
    onSuccess: () => {
      if (currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
        setCurrentPhotoIndex(0);
      }
    },
  });

  const nextProfile = () => {
    setSwipeDirection(null);
    setCurrentPhotoIndex(0);
    setShowInfo(false);
    setCurrentIndex((i) => i + 1);
  };

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!currentProfile) return;

    setSwipeDirection(direction === 'left' ? 'left' : 'right');

    setTimeout(() => {
      if (direction === 'left') {
        passMutation.mutate(currentProfile.id);
      } else if (direction === 'up') {
        superLikeMutation.mutate(currentProfile.id);
      } else {
        likeMutation.mutate(currentProfile.id);
      }
    }, 200);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="w-10 h-10 animate-spin text-pink-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Finding matches for you...</p>
      </div>
    );
  }

  const currentProfile = profiles?.[currentIndex];
  const nextProfiles = profiles?.slice(currentIndex + 1, currentIndex + 3) || [];

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center px-6">
        <div className="w-24 h-24 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No more profiles</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Check back later for new matches or expand your preferences.
        </p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['discover-profiles'] })}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium hover:shadow-lg transition-shadow"
        >
          Refresh Profiles
        </button>
      </div>
    );
  }

  const photos = currentProfile.photos?.length > 0 ? currentProfile.photos : ['/placeholder-avatar.jpg'];

  return (
    <div className="relative max-w-md mx-auto">
      {/* Card Stack */}
      <div className="relative h-[600px]">
        {/* Background Cards */}
        {nextProfiles.map((profile, idx) => (
          <div
            key={profile.id}
            className="absolute inset-x-0 top-0 rounded-3xl bg-white dark:bg-gray-800 shadow-lg overflow-hidden"
            style={{
              transform: \`scale(\${1 - (idx + 1) * 0.05}) translateY(\${(idx + 1) * 20}px)\`,
              zIndex: 10 - idx,
              opacity: 1 - (idx + 1) * 0.3,
            }}
          >
            <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700">
              {profile.photos?.[0] && (
                <img src={profile.photos[0]} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          </div>
        ))}

        {/* Current Card */}
        <div
          ref={cardRef}
          className={\`absolute inset-x-0 top-0 rounded-3xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden transition-transform duration-200 z-20 \${
            swipeDirection === 'left' ? '-translate-x-full rotate-[-20deg]' :
            swipeDirection === 'right' ? 'translate-x-full rotate-[20deg]' : ''
          }\`}
        >
          {/* Photo */}
          <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700">
            <img
              src={photos[currentPhotoIndex]}
              alt={currentProfile.name}
              className="w-full h-full object-cover"
            />

            {/* Photo Indicators */}
            <div className="absolute top-4 left-4 right-4 flex gap-1">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className={\`h-1 flex-1 rounded-full transition-all \${
                    idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                  }\`}
                />
              ))}
            </div>

            {/* Photo Navigation */}
            <div className="absolute inset-0 flex">
              <button
                onClick={() => setCurrentPhotoIndex((i) => Math.max(0, i - 1))}
                className="w-1/3 h-full"
              />
              <button
                onClick={() => setCurrentPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}
                className="w-2/3 h-full"
              />
            </div>

            {/* Swipe Indicators */}
            <div className={\`absolute top-20 left-4 px-4 py-2 border-4 border-green-500 rounded-lg transform rotate-[-20deg] transition-opacity \${
              swipeDirection === 'right' ? 'opacity-100' : 'opacity-0'
            }\`}>
              <span className="text-green-500 font-bold text-2xl">LIKE</span>
            </div>
            <div className={\`absolute top-20 right-4 px-4 py-2 border-4 border-red-500 rounded-lg transform rotate-[20deg] transition-opacity \${
              swipeDirection === 'left' ? 'opacity-100' : 'opacity-0'
            }\`}>
              <span className="text-red-500 font-bold text-2xl">NOPE</span>
            </div>

            {/* Compatibility Badge */}
            {currentProfile.compatibility_score && (
              <div className="absolute top-16 left-4 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white font-medium text-sm flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                {currentProfile.compatibility_score}% Match
              </div>
            )}

            {/* Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

            {/* Profile Info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-3xl font-bold">{currentProfile.name}</h2>
                <span className="text-2xl">{currentProfile.age}</span>
                {currentProfile.verified && (
                  <Verified className="w-6 h-6 text-blue-400" />
                )}
              </div>

              {currentProfile.occupation && (
                <div className="flex items-center gap-2 text-white/90">
                  <Briefcase className="w-4 h-4" />
                  <span>{currentProfile.occupation}</span>
                </div>
              )}

              {currentProfile.location && (
                <div className="flex items-center gap-2 text-white/80 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{currentProfile.location}</span>
                  {currentProfile.distance && (
                    <span>- {currentProfile.distance} km away</span>
                  )}
                </div>
              )}

              {currentProfile.bio && !showInfo && (
                <p className="mt-2 text-white/70 text-sm line-clamp-2">{currentProfile.bio}</p>
              )}
            </div>
          </div>

          {/* Expanded Info */}
          {showInfo && (
            <div className="p-5 max-h-48 overflow-y-auto">
              {currentProfile.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">{currentProfile.bio}</p>
              )}
              {currentProfile.interests && currentProfile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentProfile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => rewindMutation.mutate()}
          disabled={currentIndex === 0 || rewindMutation.isPending}
          className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 border-2 border-yellow-400 flex items-center justify-center shadow-md hover:scale-110 transition-transform disabled:opacity-40 disabled:hover:scale-100"
        >
          <RotateCcw className="w-5 h-5 text-yellow-400" />
        </button>

        <button
          onClick={() => handleSwipe('left')}
          disabled={passMutation.isPending}
          className="w-16 h-16 rounded-full bg-white dark:bg-gray-700 border-2 border-red-400 flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
        >
          <X className="w-8 h-8 text-red-400" />
        </button>

        <button
          onClick={() => handleSwipe('up')}
          disabled={superLikeMutation.isPending}
          className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-md hover:scale-110 transition-transform disabled:opacity-50"
        >
          <Star className="w-6 h-6 text-white fill-white" />
        </button>

        <button
          onClick={() => handleSwipe('right')}
          disabled={likeMutation.isPending}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
        >
          <Heart className="w-8 h-8 text-white fill-white" />
        </button>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 border-2 border-purple-400 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Info className="w-5 h-5 text-purple-400" />
        </button>
      </div>

      {/* Boost Button */}
      <div className="mt-6 text-center">
        <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:shadow-lg transition-shadow">
          <Zap className="w-5 h-5" />
          Boost Your Profile
        </button>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMatchCard(options: MatchingOptions = {}): string {
  const { componentName = 'MatchCard', endpoint = '/matches' } = options;

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Heart, MessageCircle, Sparkles, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface Match {
  id: string;
  profile: {
    id: string;
    name: string;
    photo: string;
    age?: number;
    online?: boolean;
  };
  matched_at: string;
  last_message?: string;
  unread_count?: number;
  is_super_like?: boolean;
  expires_at?: string;
}

interface ${componentName}Props {
  match?: Match;
  compact?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ match, compact = false }) => {
  const navigate = useNavigate();

  if (!match) {
    return null;
  }

  const timeAgo = (date: string) => {
    const now = new Date();
    const matchDate = new Date(date);
    const diff = now.getTime() - matchDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return days + 'd ago';
    if (hours > 0) return hours + 'h ago';
    return 'Just now';
  };

  const handleClick = () => {
    navigate('/matches/' + match.id + '/chat');
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className="relative group cursor-pointer"
      >
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500 p-0.5">
          <img
            src={match.profile.photo || '/placeholder-avatar.jpg'}
            alt={match.profile.name}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        {match.profile.online && (
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
        )}
        {match.is_super_like && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        )}
        <p className="text-xs text-center mt-1 text-gray-700 dark:text-gray-300 truncate w-20">
          {match.profile.name}
        </p>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 dark:border-gray-700"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className={\`w-16 h-16 rounded-full overflow-hidden \${
          match.is_super_like ? 'border-2 border-blue-500' : ''
        }\`}>
          <img
            src={match.profile.photo || '/placeholder-avatar.jpg'}
            alt={match.profile.name}
            className="w-full h-full object-cover"
          />
        </div>
        {match.profile.online && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {match.profile.name}
            {match.profile.age && <span className="font-normal text-gray-500">, {match.profile.age}</span>}
          </h3>
          {match.is_super_like && (
            <Sparkles className="w-4 h-4 text-blue-500" />
          )}
        </div>

        {match.last_message ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {match.last_message}
          </p>
        ) : (
          <p className="text-sm text-pink-500 italic">
            New match! Say hello
          </p>
        )}

        <p className="text-xs text-gray-400 mt-1">
          Matched {timeAgo(match.matched_at)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2">
        {match.unread_count && match.unread_count > 0 ? (
          <span className="w-6 h-6 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
            {match.unread_count}
          </span>
        ) : (
          <MessageCircle className="w-5 h-5 text-gray-400" />
        )}

        {match.expires_at && (
          <div className="flex items-center gap-1 text-xs text-orange-500">
            <Clock className="w-3 h-3" />
            <span>Expires soon</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Match List Component
export const MatchList: React.FC = () => {
  const navigate = useNavigate();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const response = await api.get<Match[]>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  const newMatches = matches?.filter((m) => !m.last_message) || [];
  const conversations = matches?.filter((m) => m.last_message) || [];

  return (
    <div className="space-y-6">
      {/* New Matches */}
      {newMatches.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
            New Matches
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            {newMatches.map((match) => (
              <${componentName} key={match.id} match={match} compact />
            ))}
          </div>
        </div>
      )}

      {/* Conversations */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          Messages
        </h2>
        {conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((match) => (
              <${componentName} key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Match with someone to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDiscoveryFilters(options: MatchingOptions = {}): string {
  const { componentName = 'DiscoveryFilters', endpoint = '/discover/preferences' } = options;

  return `import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2, MapPin, Users, Heart, Sparkles, ChevronDown,
  ChevronUp, Sliders, Check, X
} from 'lucide-react';
import { api } from '@/lib/api';

interface FilterPreferences {
  age_range: [number, number];
  distance: number;
  gender: string[];
  looking_for: string[];
  show_verified_only: boolean;
  has_bio: boolean;
  has_photos_min: number;
  interests: string[];
  education_level?: string[];
  height_range?: [number, number];
  relationship_type?: string[];
}

interface ${componentName}Props {
  onApply?: (filters: FilterPreferences) => void;
  onClose?: () => void;
  modal?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onApply, onClose, modal = false }) => {
  const queryClient = useQueryClient();
  const [expandedSection, setExpandedSection] = useState<string | null>('basic');
  const [localFilters, setLocalFilters] = useState<FilterPreferences | null>(null);

  const { data: savedFilters, isLoading } = useQuery({
    queryKey: ['discovery-filters'],
    queryFn: async () => {
      const response = await api.get<FilterPreferences>('${endpoint}');
      return response?.data || response;
    },
  });

  useEffect(() => {
    if (savedFilters && !localFilters) {
      setLocalFilters(savedFilters);
    }
  }, [savedFilters]);

  const saveMutation = useMutation({
    mutationFn: (filters: FilterPreferences) => api.put('${endpoint}', filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovery-filters'] });
      queryClient.invalidateQueries({ queryKey: ['discover-profiles'] });
      if (onApply && localFilters) onApply(localFilters);
      if (onClose) onClose();
    },
  });

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Other'];
  const lookingForOptions = ['Relationship', 'Casual', 'Friends', 'Not sure yet'];
  const interestsList = [
    'Music', 'Travel', 'Movies', 'Reading', 'Fitness', 'Gaming',
    'Cooking', 'Art', 'Photography', 'Dancing', 'Sports', 'Nature'
  ];
  const educationLevels = ['High School', 'Some College', 'Bachelor\'s', 'Master\'s', 'PhD'];
  const relationshipTypes = ['Monogamous', 'Open', 'Polyamorous', 'Not sure'];

  if (isLoading || !localFilters) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const updateFilter = <K extends keyof FilterPreferences>(
    key: K,
    value: FilterPreferences[K]
  ) => {
    setLocalFilters((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const toggleArrayValue = (key: keyof FilterPreferences, value: string) => {
    const currentArray = (localFilters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as any);
  };

  const handleApply = () => {
    if (localFilters) {
      saveMutation.mutate(localFilters);
    }
  };

  const handleReset = () => {
    if (savedFilters) {
      setLocalFilters(savedFilters);
    }
  };

  const containerClass = modal
    ? 'bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden max-w-md mx-auto'
    : 'bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-pink-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Discovery Filters</h2>
        </div>
        {modal && onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        {/* Basic Filters */}
        <div className="border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={() => toggleSection('basic')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Basic Filters</span>
            </div>
            {expandedSection === 'basic' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'basic' && (
            <div className="px-4 pb-4 space-y-6">
              {/* Age Range */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  Age Range: {localFilters.age_range[0]} - {localFilters.age_range[1]}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={18}
                    max={100}
                    value={localFilters.age_range[0]}
                    onChange={(e) => updateFilter('age_range', [parseInt(e.target.value), localFilters.age_range[1]])}
                    className="flex-1 accent-pink-500"
                  />
                  <input
                    type="range"
                    min={18}
                    max={100}
                    value={localFilters.age_range[1]}
                    onChange={(e) => updateFilter('age_range', [localFilters.age_range[0], parseInt(e.target.value)])}
                    className="flex-1 accent-pink-500"
                  />
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  Distance: {localFilters.distance} km
                </label>
                <input
                  type="range"
                  min={1}
                  max={500}
                  value={localFilters.distance}
                  onChange={(e) => updateFilter('distance', parseInt(e.target.value))}
                  className="w-full accent-pink-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 km</span>
                  <span>500 km</span>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  Show Me
                </label>
                <div className="flex flex-wrap gap-2">
                  {genderOptions.map((gender) => (
                    <button
                      key={gender}
                      onClick={() => toggleArrayValue('gender', gender)}
                      className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${
                        localFilters.gender.includes(gender)
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }\`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Looking For */}
        <div className="border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={() => toggleSection('looking')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Looking For</span>
            </div>
            {expandedSection === 'looking' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'looking' && (
            <div className="px-4 pb-4 space-y-3">
              {lookingForOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleArrayValue('looking_for', option)}
                  className={\`w-full p-3 rounded-xl text-left flex items-center justify-between transition-colors \${
                    localFilters.looking_for.includes(option)
                      ? 'bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-500'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent'
                  }\`}
                >
                  <span className="font-medium text-gray-900 dark:text-white">{option}</span>
                  {localFilters.looking_for.includes(option) && (
                    <Check className="w-5 h-5 text-pink-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Interests */}
        <div className="border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={() => toggleSection('interests')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Interests</span>
            </div>
            {expandedSection === 'interests' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'interests' && (
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {interestsList.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleArrayValue('interests', interest)}
                    className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${
                      localFilters.interests.includes(interest)
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }\`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        <div className="border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={() => toggleSection('advanced')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Advanced</span>
            </div>
            {expandedSection === 'advanced' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'advanced' && (
            <div className="px-4 pb-4 space-y-4">
              {/* Verified Only */}
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer">
                <span className="font-medium text-gray-900 dark:text-white">Verified profiles only</span>
                <div
                  onClick={() => updateFilter('show_verified_only', !localFilters.show_verified_only)}
                  className={\`w-12 h-6 rounded-full transition-colors relative \${
                    localFilters.show_verified_only ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
                  }\`}
                >
                  <div
                    className={\`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform \${
                      localFilters.show_verified_only ? 'left-7' : 'left-1'
                    }\`}
                  />
                </div>
              </label>

              {/* Has Bio */}
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer">
                <span className="font-medium text-gray-900 dark:text-white">Has bio</span>
                <div
                  onClick={() => updateFilter('has_bio', !localFilters.has_bio)}
                  className={\`w-12 h-6 rounded-full transition-colors relative \${
                    localFilters.has_bio ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
                  }\`}
                >
                  <div
                    className={\`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform \${
                      localFilters.has_bio ? 'left-7' : 'left-1'
                    }\`}
                  />
                </div>
              </label>

              {/* Minimum Photos */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Minimum photos: {localFilters.has_photos_min}
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={localFilters.has_photos_min}
                  onChange={(e) => updateFilter('has_photos_min', parseInt(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          disabled={saveMutation.isPending}
          className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Apply Filters'
          )}
        </button>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateIcebreakers(options: MatchingOptions = {}): string {
  const { componentName = 'Icebreakers', endpoint = '/icebreakers' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2, MessageCircle, Sparkles, Send, RefreshCw,
  Heart, Smile, Zap, Music, Film, Plane, Coffee
} from 'lucide-react';
import { api } from '@/lib/api';

interface Icebreaker {
  id: string;
  text: string;
  category: string;
  popularity?: number;
}

interface ${componentName}Props {
  matchId: string;
  recipientName: string;
  onSend?: (message: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  matchId,
  recipientName,
  onSend
}) => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedIcebreaker, setSelectedIcebreaker] = useState<string | null>(null);

  const { data: icebreakers, isLoading, refetch } = useQuery({
    queryKey: ['icebreakers', matchId, selectedCategory],
    queryFn: async () => {
      let url = '${endpoint}?match_id=' + matchId;
      if (selectedCategory !== 'all') {
        url += '&category=' + selectedCategory;
      }
      const response = await api.get<Icebreaker[]>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) => api.post('${endpoint}/send', {
      match_id: matchId,
      message,
    }),
    onSuccess: (_, message) => {
      if (onSend) onSend(message);
      setSelectedIcebreaker(null);
      setCustomMessage('');
    },
  });

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'funny', label: 'Funny', icon: Smile },
    { id: 'flirty', label: 'Flirty', icon: Heart },
    { id: 'deep', label: 'Deep', icon: Zap },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'travel', label: 'Travel', icon: Plane },
    { id: 'food', label: 'Food', icon: Coffee },
  ];

  const handleSend = (message: string) => {
    const personalizedMessage = message.replace(/{name}/g, recipientName);
    sendMutation.mutate(personalizedMessage);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-pink-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Icebreakers</h2>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Break the ice with {recipientName}
        </p>
      </div>

      {/* Categories */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors \${
                selectedCategory === cat.id
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Icebreaker List */}
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
          </div>
        ) : icebreakers && icebreakers.length > 0 ? (
          icebreakers.map((icebreaker) => (
            <div
              key={icebreaker.id}
              onClick={() => setSelectedIcebreaker(
                selectedIcebreaker === icebreaker.id ? null : icebreaker.id
              )}
              className={\`p-4 rounded-xl cursor-pointer transition-all \${
                selectedIcebreaker === icebreaker.id
                  ? 'bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-500'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }\`}
            >
              <p className="text-gray-800 dark:text-gray-200">
                {icebreaker.text.replace(/{name}/g, recipientName)}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400 capitalize">{icebreaker.category}</span>
                {icebreaker.popularity && (
                  <span className="text-xs text-pink-500 flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" />
                    {icebreaker.popularity}% success rate
                  </span>
                )}
              </div>

              {selectedIcebreaker === icebreaker.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSend(icebreaker.text);
                  }}
                  disabled={sendMutation.isPending}
                  className="mt-3 w-full py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-50"
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send This
                    </>
                  )}
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p>No icebreakers found for this category</p>
          </div>
        )}
      </div>

      {/* Custom Message */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Or write your own:</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder={\`Say something to \${recipientName}...\`}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white placeholder-gray-500"
          />
          <button
            onClick={() => handleSend(customMessage)}
            disabled={!customMessage.trim() || sendMutation.isPending}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Emojis */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 justify-center">
          {['Hey! How are you?', 'Love your profile!', 'We should chat!'].map((quick) => (
            <button
              key={quick}
              onClick={() => setCustomMessage(quick)}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {quick}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
