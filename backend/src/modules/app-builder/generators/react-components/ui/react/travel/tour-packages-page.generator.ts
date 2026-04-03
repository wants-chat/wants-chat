import { AppBlueprint, Page } from '../../../../../interfaces/app-builder.types';

export function generateTourPackagesPage(
  blueprint: AppBlueprint,
  page: Page,
): string {
  return `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Calendar, Users, Star, Clock, Search, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import BottomNav from '../../components/BottomNav';

interface TourPackage {
  id: string;
  name: string;
  description?: string;
  short_description?: string;
  duration_days: number;
  duration_nights?: number;
  tour_type?: string;
  difficulty_level?: string;
  group_size_min?: number;
  group_size_max?: number;
  price: number;
  currency?: string;
  highlights?: string[];
  cover_image?: string;
  images?: string[];
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
}

const tourTypeColors: Record<string, string> = {
  adventure: 'from-orange-500 to-red-500',
  cultural: 'from-purple-500 to-pink-500',
  beach: 'from-cyan-500 to-blue-500',
  wildlife: 'from-green-500 to-emerald-500',
  city: 'from-gray-500 to-slate-500',
};

export default function TourPackagesPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const tourTypes = ['adventure', 'cultural', 'beach', 'wildlife', 'city'];

  const { data: packages = [], isLoading: loading } = useQuery({
    queryKey: ['tour-packages', selectedType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedType) params.append('tour_type', selectedType);
      const response = await api.get<any>(\`/tour-packages?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    retry: 1,
  });

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredPackages = filteredPackages.filter((pkg) => pkg.is_featured);
  const regularPackages = filteredPackages.filter((pkg) => !pkg.is_featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/20 backdrop-blur-xl px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Tour Packages</h1>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/20 backdrop-blur-xl rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Tour Type Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedType(null)}
            className={\`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all \${
              !selectedType
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-white/5 text-gray-400'
            }\`}
          >
            All
          </button>
          {tourTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={\`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all capitalize \${
                selectedType === type
                  ? \`bg-gradient-to-r \${tourTypeColors[type] || 'from-blue-500 to-purple-600'} text-white\`
                  : 'bg-white/5 text-gray-400'
              }\`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">No tour packages found</p>
          </div>
        ) : (
          <>
            {/* Featured Packages */}
            {featuredPackages.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-3">Featured Tours</h2>
                <div className="space-y-4">
                  {featuredPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => navigate(\`/tours/\${pkg.id}\`)}
                      className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                    >
                      <div className="relative h-48">
                        {pkg.cover_image ? (
                          <img src={pkg.cover_image} alt={pkg.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={\`w-full h-full bg-gradient-to-br \${tourTypeColors[pkg.tour_type || ''] || 'from-blue-500 to-purple-600'} flex items-center justify-center\`}>
                            <span className="text-6xl">🌍</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full">
                          Featured
                        </div>
                        {pkg.tour_type && (
                          <div className={\`absolute top-3 right-3 px-2 py-1 bg-gradient-to-r \${tourTypeColors[pkg.tour_type] || 'from-blue-500 to-purple-600'} text-white text-xs rounded-full capitalize\`}>
                            {pkg.tour_type}
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-white text-lg mb-1">{pkg.name}</h3>
                        {pkg.short_description && (
                          <p className="text-gray-400 text-sm line-clamp-2 mb-3">{pkg.short_description}</p>
                        )}

                        <div className="flex flex-wrap gap-3 mb-3">
                          <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{pkg.duration_days}D{pkg.duration_nights ? \`/\${pkg.duration_nights}N\` : ''}</span>
                          </div>
                          {pkg.group_size_max && (
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <Users className="w-4 h-4" />
                              <span>Max {pkg.group_size_max}</span>
                            </div>
                          )}
                          {pkg.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-white font-medium">{Number(pkg.rating).toFixed(1)}</span>
                              {pkg.review_count && (
                                <span className="text-gray-400 text-sm">({pkg.review_count})</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-white">
                              {pkg.currency || '$'}{pkg.price}
                            </span>
                            <span className="text-gray-400 text-sm">/person</span>
                          </div>
                          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Packages */}
            {regularPackages.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">All Tours</h2>
                <div className="grid grid-cols-1 gap-4">
                  {regularPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => navigate(\`/tours/\${pkg.id}\`)}
                      className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                    >
                      <div className="flex">
                        <div className="relative w-32 h-32 flex-shrink-0">
                          {pkg.cover_image ? (
                            <img src={pkg.cover_image} alt={pkg.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className={\`w-full h-full bg-gradient-to-br \${tourTypeColors[pkg.tour_type || ''] || 'from-blue-500 to-purple-600'} flex items-center justify-center\`}>
                              <span className="text-3xl">🌍</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 p-3">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-white line-clamp-1">{pkg.name}</h3>
                            {pkg.tour_type && (
                              <span className={\`px-2 py-0.5 bg-gradient-to-r \${tourTypeColors[pkg.tour_type] || 'from-blue-500 to-purple-600'} text-white text-xs rounded-full capitalize\`}>
                                {pkg.tour_type}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-400 text-sm">
                              {pkg.duration_days} days
                            </span>
                            {pkg.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-white text-sm">{Number(pkg.rating).toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">
                              {pkg.currency || '$'}{pkg.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
`;
}
