/**
 * Dating Profile Component Generators
 *
 * Generates profile cards, previews, stats, and specialized profile types
 * for dating applications.
 */

export interface DatingProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDatingProfile(options: DatingProfileOptions = {}): string {
  const { componentName = 'DatingProfile', endpoint = '/profiles' } = options;

  return `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2, MapPin, Briefcase, GraduationCap, Heart, X, Star,
  ChevronLeft, ChevronRight, Verified, Shield, Camera, Music,
  Film, Book, Plane, Coffee, Dumbbell, MessageCircle
} from 'lucide-react';
import { api } from '@/lib/api';

interface Profile {
  id: string;
  name: string;
  age: number;
  bio?: string;
  photos: string[];
  location?: string;
  occupation?: string;
  education?: string;
  interests?: string[];
  height?: string;
  looking_for?: string;
  relationship_type?: string;
  verified?: boolean;
  premium?: boolean;
  distance?: number;
  compatibility_score?: number;
  prompts?: Array<{ question: string; answer: string }>;
  spotify_artists?: string[];
  instagram_photos?: string[];
  created_at?: string;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const response = await api.get<Profile>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/' + id + '/like', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', id] }),
  });

  const superLikeMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/' + id + '/superlike', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', id] }),
  });

  const passMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/' + id + '/pass', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', id] }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Profile not found</p>
      </div>
    );
  }

  const photos = profile.photos?.length > 0 ? profile.photos : ['/placeholder-avatar.jpg'];

  const getInterestIcon = (interest: string) => {
    const icons: Record<string, React.ReactNode> = {
      music: <Music className="w-4 h-4" />,
      movies: <Film className="w-4 h-4" />,
      reading: <Book className="w-4 h-4" />,
      travel: <Plane className="w-4 h-4" />,
      coffee: <Coffee className="w-4 h-4" />,
      fitness: <Dumbbell className="w-4 h-4" />,
    };
    return icons[interest.toLowerCase()] || null;
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Photo Gallery */}
      <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700">
        <img
          src={photos[currentPhotoIndex]}
          alt={profile.name}
          className="w-full h-full object-cover"
        />

        {/* Photo Navigation */}
        <div className="absolute top-4 left-4 right-4 flex gap-1">
          {photos.map((_, idx) => (
            <div
              key={idx}
              className={\`h-1 flex-1 rounded-full transition-all \${
                idx === currentPhotoIndex
                  ? 'bg-white'
                  : 'bg-white/40'
              }\`}
            />
          ))}
        </div>

        {/* Photo Navigation Buttons */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setCurrentPhotoIndex((i) => Math.max(0, i - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 rounded-full text-white opacity-0 hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 rounded-full text-white opacity-0 hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Basic Info */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <span className="text-2xl">{profile.age}</span>
            {profile.verified && (
              <Verified className="w-6 h-6 text-blue-400" />
            )}
            {profile.premium && (
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            )}
          </div>

          {profile.occupation && (
            <div className="flex items-center gap-2 mt-1 text-white/90">
              <Briefcase className="w-4 h-4" />
              <span>{profile.occupation}</span>
            </div>
          )}

          {profile.location && (
            <div className="flex items-center gap-2 mt-1 text-white/90">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
              {profile.distance && (
                <span className="text-white/70">({profile.distance} km away)</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-6">
        {/* Compatibility Score */}
        {profile.compatibility_score && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{profile.compatibility_score}%</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Compatibility Score</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Based on your preferences</p>
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">About</h3>
            <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
          </div>
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3">
          {profile.education && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <GraduationCap className="w-5 h-5 text-gray-400" />
              <span className="text-sm">{profile.education}</span>
            </div>
          )}
          {profile.height && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span className="text-gray-400">Height:</span>
              <span className="text-sm">{profile.height}</span>
            </div>
          )}
          {profile.looking_for && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Heart className="w-5 h-5 text-gray-400" />
              <span className="text-sm">{profile.looking_for}</span>
            </div>
          )}
        </div>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm"
                >
                  {getInterestIcon(interest)}
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prompts */}
        {profile.prompts && profile.prompts.length > 0 && (
          <div className="space-y-4">
            {profile.prompts.map((prompt, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{prompt.question}</p>
                <p className="text-gray-800 dark:text-gray-200">{prompt.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Spotify Artists */}
        {profile.spotify_artists && profile.spotify_artists.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Top Artists
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.spotify_artists.map((artist, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                >
                  {artist}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => passMutation.mutate()}
            disabled={passMutation.isPending}
            className="w-16 h-16 rounded-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
          >
            <X className="w-8 h-8 text-gray-400" />
          </button>

          <button
            onClick={() => superLikeMutation.mutate()}
            disabled={superLikeMutation.isPending}
            className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
          >
            <Star className="w-6 h-6 text-white fill-white" />
          </button>

          <button
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </button>

          <button
            className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateProfilePreview(options: DatingProfileOptions = {}): string {
  const { componentName = 'ProfilePreview', endpoint = '/profiles' } = options;

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Verified, Star } from 'lucide-react';

interface ProfilePreviewProps {
  profile: {
    id: string;
    name: string;
    age: number;
    photo?: string;
    location?: string;
    bio?: string;
    verified?: boolean;
    premium?: boolean;
    distance?: number;
    compatibility_score?: number;
    online?: boolean;
  };
  onLike?: (id: string) => void;
  onPass?: (id: string) => void;
  compact?: boolean;
}

const ${componentName}: React.FC<ProfilePreviewProps> = ({
  profile,
  onLike,
  onPass,
  compact = false
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/profiles/' + profile.id);
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className="relative group cursor-pointer bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
      >
        <div className="aspect-square relative">
          <img
            src={profile.photo || '/placeholder-avatar.jpg'}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
          {profile.online && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white font-semibold text-sm truncate">
              {profile.name}, {profile.age}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
      <div
        onClick={handleClick}
        className="aspect-[3/4] relative cursor-pointer"
      >
        <img
          src={profile.photo || '/placeholder-avatar.jpg'}
          alt={profile.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Online Indicator */}
        {profile.online && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-green-500 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs text-white font-medium">Online</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {profile.verified && (
            <div className="p-1.5 bg-blue-500 rounded-full">
              <Verified className="w-4 h-4 text-white" />
            </div>
          )}
          {profile.premium && (
            <div className="p-1.5 bg-yellow-500 rounded-full">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Compatibility Badge */}
        {profile.compatibility_score && (
          <div className="absolute top-4 right-4 px-2 py-1 bg-pink-500 rounded-full">
            <span className="text-xs text-white font-bold">{profile.compatibility_score}% Match</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{profile.name}</h3>
            <span className="text-lg">{profile.age}</span>
          </div>

          {profile.location && (
            <div className="flex items-center gap-1 mt-1 text-white/80 text-sm">
              <MapPin className="w-3 h-3" />
              <span>{profile.location}</span>
              {profile.distance && (
                <span>- {profile.distance} km away</span>
              )}
            </div>
          )}

          {profile.bio && (
            <p className="mt-2 text-sm text-white/70 line-clamp-2">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {(onLike || onPass) && (
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onPass && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPass(profile.id);
              }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <span className="text-white text-lg">X</span>
            </button>
          )}
          {onLike && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(profile.id);
              }}
              className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center hover:bg-pink-600 transition-colors"
            >
              <Heart className="w-5 h-5 text-white fill-white" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateProfileStats(options: DatingProfileOptions = {}): string {
  const { componentName = 'ProfileStats', endpoint = '/profiles/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, Heart, Eye, Star, MessageCircle,
  TrendingUp, Users, Sparkles, Crown
} from 'lucide-react';
import { api } from '@/lib/api';

interface ProfileStatsData {
  total_likes: number;
  total_matches: number;
  total_views: number;
  super_likes_received: number;
  messages_received: number;
  profile_score: number;
  weekly_likes: number[];
  top_admirers?: Array<{ id: string; name: string; photo: string }>;
  boost_active?: boolean;
  boost_remaining_time?: number;
}

interface ${componentName}Props {
  userId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ userId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['profile-stats', userId],
    queryFn: async () => {
      const url = userId ? '${endpoint}/' + userId : '${endpoint}';
      const response = await api.get<ProfileStatsData>(url);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      icon: Heart,
      label: 'Likes Received',
      value: stats.total_likes,
      color: 'bg-pink-500',
      lightBg: 'bg-pink-50 dark:bg-pink-900/20',
    },
    {
      icon: Users,
      label: 'Matches',
      value: stats.total_matches,
      color: 'bg-purple-500',
      lightBg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Eye,
      label: 'Profile Views',
      value: stats.total_views,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Star,
      label: 'Super Likes',
      value: stats.super_likes_received,
      color: 'bg-yellow-500',
      lightBg: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Boost Status */}
      {stats.boost_active && (
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6" />
              <span className="font-bold text-lg">Boost Active</span>
            </div>
            <p className="text-white/80">
              Your profile is being shown to more people!
            </p>
            {stats.boost_remaining_time && (
              <p className="mt-2 text-sm text-white/60">
                {Math.floor(stats.boost_remaining_time / 60)} minutes remaining
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className={\`\${stat.lightBg} rounded-2xl p-5 transition-transform hover:scale-105\`}
          >
            <div className={\`w-12 h-12 \${stat.color} rounded-xl flex items-center justify-center mb-3\`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Profile Score */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Score</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">How attractive is your profile</p>
          </div>
          <div className="text-3xl font-bold text-pink-500">{stats.profile_score}%</div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-500"
            style={{ width: stats.profile_score + '%' }}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
            Add more photos +5%
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
            Verify profile +10%
          </span>
        </div>
      </div>

      {/* Weekly Activity */}
      {stats.weekly_likes && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Activity</h3>
          </div>
          <div className="flex items-end justify-between h-24 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const value = stats.weekly_likes[idx] || 0;
              const maxValue = Math.max(...stats.weekly_likes, 1);
              const height = (value / maxValue) * 100;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-pink-500 to-rose-400 rounded-t-md transition-all"
                    style={{ height: height + '%', minHeight: value > 0 ? '8px' : '2px' }}
                  />
                  <span className="text-xs text-gray-400">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Admirers */}
      {stats.top_admirers && stats.top_admirers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Admirers</h3>
          </div>
          <div className="flex gap-3">
            {stats.top_admirers.slice(0, 5).map((admirer) => (
              <div key={admirer.id} className="text-center">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-pink-500">
                  <img src={admirer.photo} alt={admirer.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate w-14">{admirer.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateAthleteProfile(options: DatingProfileOptions = {}): string {
  const { componentName = 'AthleteProfile', endpoint = '/profiles' } = options;

  return `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, MapPin, Trophy, Medal, Dumbbell, Heart,
  ChevronLeft, ChevronRight, Verified, Target, Timer,
  Flame, Award, Calendar
} from 'lucide-react';
import { api } from '@/lib/api';

interface AthleteProfileData {
  id: string;
  name: string;
  age: number;
  photos: string[];
  location?: string;
  bio?: string;
  sport: string;
  level: 'amateur' | 'semi-pro' | 'professional';
  achievements?: Array<{ title: string; year: number; icon: string }>;
  stats?: {
    years_active: number;
    competitions: number;
    medals: number;
    personal_records?: Record<string, string>;
  };
  training_schedule?: string;
  looking_for?: string;
  verified?: boolean;
  team?: string;
  diet?: string;
  goals?: string[];
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['athlete-profile', id],
    queryFn: async () => {
      const response = await api.get<AthleteProfileData>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Dumbbell className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Profile not found</p>
      </div>
    );
  }

  const photos = profile.photos?.length > 0 ? profile.photos : ['/placeholder-avatar.jpg'];

  const levelColors = {
    amateur: 'bg-green-500',
    'semi-pro': 'bg-blue-500',
    professional: 'bg-purple-500',
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Photo Gallery */}
      <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700">
        <img
          src={photos[currentPhotoIndex]}
          alt={profile.name}
          className="w-full h-full object-cover"
        />

        {/* Photo Navigation */}
        <div className="absolute top-4 left-4 right-4 flex gap-1">
          {photos.map((_, idx) => (
            <div
              key={idx}
              className={\`h-1 flex-1 rounded-full \${
                idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
              }\`}
            />
          ))}
        </div>

        {photos.length > 1 && (
          <>
            <button
              onClick={() => setCurrentPhotoIndex((i) => Math.max(0, i - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 rounded-full text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 rounded-full text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Sport Badge */}
        <div className="absolute top-16 left-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 rounded-full text-white font-medium">
            <Dumbbell className="w-4 h-4" />
            {profile.sport}
          </div>
          <div className={\`mt-2 px-3 py-1 \${levelColors[profile.level]} rounded-full text-white text-sm font-medium capitalize\`}>
            {profile.level.replace('-', ' ')}
          </div>
        </div>

        {/* Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Basic Info */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <span className="text-2xl">{profile.age}</span>
            {profile.verified && <Verified className="w-6 h-6 text-blue-400" />}
          </div>

          {profile.team && (
            <div className="flex items-center gap-2 mt-1 text-white/90">
              <Award className="w-4 h-4" />
              <span>{profile.team}</span>
            </div>
          )}

          {profile.location && (
            <div className="flex items-center gap-2 mt-1 text-white/90">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        {profile.stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <Calendar className="w-5 h-5 mx-auto text-orange-500 mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">{profile.stats.years_active}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Years Active</p>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Target className="w-5 h-5 mx-auto text-blue-500 mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">{profile.stats.competitions}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Competitions</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <Medal className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">{profile.stats.medals}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Medals</p>
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">About</h3>
            <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
          </div>
        )}

        {/* Achievements */}
        {profile.achievements && profile.achievements.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Achievements
            </h3>
            <div className="space-y-2">
              {profile.achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{achievement.title}</p>
                    <p className="text-sm text-gray-500">{achievement.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal Records */}
        {profile.stats?.personal_records && Object.keys(profile.stats.personal_records).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Personal Records
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(profile.stats.personal_records).map(([key, value]) => (
                <div key={key} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{key.replace('_', ' ')}</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Schedule */}
        {profile.training_schedule && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <Timer className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Training Schedule</p>
              <p className="text-gray-800 dark:text-gray-200">{profile.training_schedule}</p>
            </div>
          </div>
        )}

        {/* Goals */}
        {profile.goals && profile.goals.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Goals</h3>
            <div className="flex flex-wrap gap-2">
              {profile.goals.map((goal, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Looking For */}
        {profile.looking_for && (
          <div className="flex items-start gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
            <Heart className="w-5 h-5 text-pink-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Looking For</p>
              <p className="text-gray-800 dark:text-gray-200">{profile.looking_for}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateArtistProfile(options: DatingProfileOptions = {}): string {
  const { componentName = 'ArtistProfile', endpoint = '/profiles' } = options;

  return `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, MapPin, Palette, Music, Heart, ChevronLeft,
  ChevronRight, Verified, Star, Play, ExternalLink,
  Camera, Film, Mic, PenTool
} from 'lucide-react';
import { api } from '@/lib/api';

interface ArtistProfileData {
  id: string;
  name: string;
  stage_name?: string;
  age: number;
  photos: string[];
  location?: string;
  bio?: string;
  art_type: 'visual' | 'music' | 'performance' | 'digital' | 'photography' | 'film';
  style?: string;
  portfolio?: Array<{
    id: string;
    title: string;
    image: string;
    type: string;
    likes?: number;
  }>;
  streaming_links?: Record<string, string>;
  exhibitions?: Array<{ title: string; venue: string; year: number }>;
  collaborations?: string[];
  influences?: string[];
  looking_for?: string;
  verified?: boolean;
  featured?: boolean;
  followers_count?: number;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['artist-profile', id],
    queryFn: async () => {
      const response = await api.get<ArtistProfileData>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Palette className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Profile not found</p>
      </div>
    );
  }

  const photos = profile.photos?.length > 0 ? profile.photos : ['/placeholder-avatar.jpg'];

  const artTypeIcons: Record<string, React.ReactNode> = {
    visual: <Palette className="w-4 h-4" />,
    music: <Music className="w-4 h-4" />,
    performance: <Mic className="w-4 h-4" />,
    digital: <PenTool className="w-4 h-4" />,
    photography: <Camera className="w-4 h-4" />,
    film: <Film className="w-4 h-4" />,
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Photo Gallery */}
      <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700">
        <img
          src={photos[currentPhotoIndex]}
          alt={profile.name}
          className="w-full h-full object-cover"
        />

        {/* Photo Navigation */}
        <div className="absolute top-4 left-4 right-4 flex gap-1">
          {photos.map((_, idx) => (
            <div
              key={idx}
              className={\`h-1 flex-1 rounded-full \${
                idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
              }\`}
            />
          ))}
        </div>

        {photos.length > 1 && (
          <>
            <button
              onClick={() => setCurrentPhotoIndex((i) => Math.max(0, i - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 rounded-full text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 rounded-full text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Art Type Badge */}
        <div className="absolute top-16 left-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 rounded-full text-white font-medium">
            {artTypeIcons[profile.art_type]}
            <span className="capitalize">{profile.art_type} Artist</span>
          </div>
          {profile.featured && (
            <div className="mt-2 flex items-center gap-1 px-3 py-1 bg-yellow-500 rounded-full text-white text-sm font-medium">
              <Star className="w-3 h-3 fill-white" />
              Featured
            </div>
          )}
        </div>

        {/* Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Basic Info */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{profile.stage_name || profile.name}</h1>
            <span className="text-2xl">{profile.age}</span>
            {profile.verified && <Verified className="w-6 h-6 text-blue-400" />}
          </div>

          {profile.stage_name && profile.name !== profile.stage_name && (
            <p className="text-white/70 text-sm mt-1">{profile.name}</p>
          )}

          {profile.style && (
            <p className="text-white/90 mt-1">{profile.style}</p>
          )}

          {profile.location && (
            <div className="flex items-center gap-2 mt-1 text-white/80">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.followers_count && (
            <p className="text-white/70 text-sm mt-2">
              {profile.followers_count.toLocaleString()} followers
            </p>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-6">
        {/* Bio */}
        {profile.bio && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">About</h3>
            <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
          </div>
        )}

        {/* Portfolio */}
        {profile.portfolio && profile.portfolio.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-500" />
              Portfolio
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {profile.portfolio.slice(0, 6).map((item) => (
                <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  {item.likes && (
                    <div className="absolute bottom-1 right-1 flex items-center gap-1 px-1.5 py-0.5 bg-black/50 rounded text-white text-xs">
                      <Heart className="w-3 h-3 fill-white" />
                      {item.likes}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {profile.portfolio.length > 6 && (
              <button className="w-full mt-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:underline">
                View all {profile.portfolio.length} works
              </button>
            )}
          </div>
        )}

        {/* Streaming Links */}
        {profile.streaming_links && Object.keys(profile.streaming_links).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Listen / Watch</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(profile.streaming_links).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="capitalize text-sm text-gray-700 dark:text-gray-300">{platform}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Exhibitions */}
        {profile.exhibitions && profile.exhibitions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Exhibitions & Shows</h3>
            <div className="space-y-2">
              {profile.exhibitions.map((exhibition, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="font-medium text-gray-900 dark:text-white">{exhibition.title}</p>
                  <p className="text-sm text-gray-500">{exhibition.venue} - {exhibition.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Influences */}
        {profile.influences && profile.influences.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Influences</h3>
            <div className="flex flex-wrap gap-2">
              {profile.influences.map((influence, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                >
                  {influence}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Open to Collaborations */}
        {profile.collaborations && profile.collaborations.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Open to Collaborate On</h3>
            <div className="flex flex-wrap gap-2">
              {profile.collaborations.map((collab, idx) => (
                <span key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                  {collab}{idx < profile.collaborations!.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Looking For */}
        {profile.looking_for && (
          <div className="flex items-start gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
            <Heart className="w-5 h-5 text-pink-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Looking For</p>
              <p className="text-gray-800 dark:text-gray-200">{profile.looking_for}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
