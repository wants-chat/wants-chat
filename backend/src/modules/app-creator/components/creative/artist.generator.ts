/**
 * Artist Component Generators for Creative/Design Apps
 *
 * Generates artist-related components including:
 * - ArtistProfileGallery - Artist profile with portfolio gallery
 */

export interface ArtistGeneratorOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate ArtistProfileGallery component - comprehensive artist profile with artwork
 */
export function generateArtistProfileGallery(options: ArtistGeneratorOptions = {}): string {
  const {
    componentName = 'ArtistProfileGallery',
    endpoint = '/artists',
    queryKey = 'artist',
  } = options;

  return `import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  MapPin,
  Globe,
  Calendar,
  Mail,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Heart,
  Eye,
  ShoppingCart,
  Award,
  Palette,
  Image as ImageIcon,
  Grid,
  List,
  ExternalLink,
  MessageCircle,
  Share2,
  Star,
  Users,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Artwork {
  id: string;
  title: string;
  image_url: string;
  thumbnail_url?: string;
  price?: number;
  medium?: string;
  dimensions?: string;
  year?: number;
  status?: 'available' | 'sold' | 'reserved';
  likes?: number;
  views?: number;
}

interface Artist {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  email?: string;
  specialties?: string[];
  social_links?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
  stats?: {
    artworks: number;
    followers: number;
    following: number;
    totalViews: number;
    totalLikes: number;
    totalSales: number;
  };
  achievements?: {
    title: string;
    description: string;
    year: number;
  }[];
  created_at?: string;
  artworks?: Artwork[];
}

interface ${componentName}Props {
  artistId?: string;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'available' | 'sold';

const ${componentName}: React.FC<${componentName}Props> = ({ artistId: propArtistId, className }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const artistId = propArtistId || paramId;

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const { data: artist, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', artistId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + artistId);
      return response?.data || response;
    },
    enabled: !!artistId,
  });

  const { data: artworks = [] } = useQuery({
    queryKey: ['${queryKey}-artworks', artistId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + artistId + '/artworks');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!artistId,
  });

  if (isLoading) {
    return (
      <div className={\`flex justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className={\`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center \${className || ''}\`}>
        <p className="text-red-600 dark:text-red-400">Artist not found</p>
      </div>
    );
  }

  const filteredArtworks = (artist.artworks || artworks).filter((artwork: Artwork) => {
    if (activeTab === 'all') return true;
    return artwork.status === activeTab;
  });

  const socialIcons: Record<string, React.ElementType> = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
  };

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    sold: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    reserved: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <div className={className}>
      {/* Cover & Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 relative">
          {artist.cover_url && (
            <img
              src={artist.cover_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-12">
            {/* Avatar & Name */}
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 rounded-xl border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-lg">
                {artist.avatar_url ? (
                  <img
                    src={artist.avatar_url}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600">
                    <span className="text-4xl font-bold text-white">
                      {(artist.name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {artist.name}
                </h1>
                {artist.username && (
                  <p className="text-gray-500 dark:text-gray-400">@{artist.username}</p>
                )}
                {artist.specialties && artist.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {artist.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 md:mt-0">
              <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Follow
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Bio */}
          {artist.bio && (
            <p className="mt-6 text-gray-700 dark:text-gray-300 max-w-3xl">
              {artist.bio}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
            {artist.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {artist.location}
              </span>
            )}
            {artist.website && (
              <a
                href={artist.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-purple-600 transition-colors"
              >
                <Globe className="w-4 h-4" />
                {artist.website.replace(/^https?:\\/\\//, '').replace(/\\/$/, '')}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {artist.created_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(artist.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Social Links */}
          {artist.social_links && Object.keys(artist.social_links).length > 0 && (
            <div className="flex gap-3 mt-4">
              {Object.entries(artist.social_links).map(([platform, url]) => {
                if (!url) return null;
                const Icon = socialIcons[platform] || Globe;
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Stats */}
          {artist.stats && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{artist.stats.artworks || 0}</p>
                <p className="text-sm text-gray-500">Artworks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{(artist.stats.followers || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{(artist.stats.following || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Following</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{(artist.stats.totalViews || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Views</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{(artist.stats.totalLikes || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Likes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{artist.stats.totalSales || 0}</p>
                <p className="text-sm text-gray-500">Sales</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      {artist.achievements && artist.achievements.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Achievements & Awards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artist.achievements.map((achievement, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{achievement.year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Section */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Portfolio Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-500" />
                Portfolio
              </h2>
              {/* Tab Filters */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                {(['all', 'available', 'sold'] as FilterTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={\`px-4 py-1.5 text-sm capitalize \${
                      activeTab === tab
                        ? 'bg-purple-600 text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }\`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            {/* View Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={\`p-2 \${viewMode === 'grid' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}\`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={\`p-2 \${viewMode === 'list' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}\`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Artwork Grid/List */}
        <div className="p-6">
          {filteredArtworks.length > 0 ? (
            <div className={\`\${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}\`}>
              {filteredArtworks.map((artwork: Artwork) => (
                <div
                  key={artwork.id}
                  onClick={() => navigate('/artworks/' + artwork.id)}
                  className={\`cursor-pointer group \${
                    viewMode === 'list'
                      ? 'flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700'
                      : 'bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow'
                  }\`}
                >
                  <div className={\`overflow-hidden \${viewMode === 'list' ? 'w-32 h-32 rounded-lg flex-shrink-0' : 'aspect-square'}\`}>
                    <img
                      src={artwork.thumbnail_url || artwork.image_url}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className={viewMode === 'list' ? 'flex-1' : 'p-4'}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                        {artwork.title}
                      </h3>
                      {artwork.status && (
                        <span className={\`px-2 py-0.5 text-xs rounded-full \${statusColors[artwork.status]}\`}>
                          {artwork.status}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {artwork.medium && <span>{artwork.medium}</span>}
                      {artwork.dimensions && <span>{artwork.dimensions}</span>}
                      {artwork.year && <span>{artwork.year}</span>}
                    </div>
                    {artwork.price !== undefined && artwork.status === 'available' && (
                      <p className="mt-2 text-lg font-semibold text-purple-600 dark:text-purple-400">
                        \${artwork.price.toLocaleString()}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      {artwork.views !== undefined && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {artwork.views}
                        </span>
                      )}
                      {artwork.likes !== undefined && (
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {artwork.likes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {activeTab === 'all' ? 'No artworks yet' : \`No \${activeTab} artworks\`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
