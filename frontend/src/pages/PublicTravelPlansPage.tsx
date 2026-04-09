// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Globe, Search, X, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { api } from '../lib/api';
import { SEO } from '../components/SEO';
import { PAGE_SEO } from '../config/seo';

interface PopularDestination {
  destination: string;
  visitCount: number;
  averageBudget: number;
  currency: string;
  budgetRange: string;
  countryCode?: string;
  coverImageUrl?: string;
  description?: string;
  popularTravelType?: string;
  tags?: string[];
}

interface DestinationLocation {
  name: string;
  category: string;
  frequency: number;
  averageCost?: number;
  description?: string;
}

interface Destination {
  name: string;
  country: string;
  icon: string;
  image: string;
  budgetRange: string;
  description: string;
  budgetCategory: 'budget' | 'mid-range' | 'luxury';
  budgetLabel: string;
  tourSpots: string[];
}

// All destinations - same as landing page
const ALL_DESTINATIONS: Destination[] = [
  {
    name: 'Bali',
    country: 'Indonesia',
    icon: '🇮🇩',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop',
    budgetRange: '$500 - $1,000',
    description: 'Tropical paradise with stunning beaches',
    budgetCategory: 'budget',
    budgetLabel: 'Budget-Friendly',
    tourSpots: ['Ubud Rice Terraces & Monkey Forest', 'Tanah Lot Temple at Sunset', 'Seminyak Beach & Clubs', 'Mount Batur Sunrise Trek', 'Tegalalang Rice Terraces', 'Uluwatu Temple & Kecak Dance', 'Sacred Monkey Forest Sanctuary', 'Kuta Beach & Water Sports'],
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    icon: '🇹🇭',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=300&fit=crop',
    budgetRange: '$600 - $1,200',
    description: 'Vibrant street food and culture',
    budgetCategory: 'budget',
    budgetLabel: 'Budget-Friendly',
    tourSpots: ['Grand Palace & Emerald Buddha', 'Wat Pho Reclining Buddha', 'Wat Arun Temple of Dawn', 'Chatuchak Weekend Market', 'Khao San Road Nightlife', 'Damnoen Saduak Floating Market', 'Ayutthaya Historical Park', 'Jim Thompson House Museum'],
  },
  {
    name: 'Mexico City',
    country: 'Mexico',
    icon: '🇲🇽',
    image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&h=300&fit=crop',
    budgetRange: '$700 - $1,300',
    description: 'Rich history and amazing cuisine',
    budgetCategory: 'budget',
    budgetLabel: 'Budget-Friendly',
    tourSpots: ['Teotihuacan Pyramids Tour', 'Zócalo & Metropolitan Cathedral', 'Chapultepec Castle & Park', 'Frida Kahlo Museum Casa Azul', 'Xochimilco Floating Gardens', 'Coyoacán Historic District', 'Palacio de Bellas Artes', 'Plaza Garibaldi Mariachi'],
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    icon: '🇪🇸',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop',
    budgetRange: '$1,500 - $2,500',
    description: 'Art, architecture, and beaches',
    budgetCategory: 'mid-range',
    budgetLabel: 'Mid-Range',
    tourSpots: ['Sagrada Familia Basilica', 'Park Güell & Gaudí Gardens', 'La Rambla & Boqueria Market', 'Gothic Quarter El Barri Gòtic', 'Casa Batlló & Casa Milà', 'Barceloneta Beach & Boardwalk', 'Camp Nou FC Barcelona Stadium', 'Magic Fountain of Montjuïc'],
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    icon: '🇯🇵',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
    budgetRange: '$1,800 - $3,000',
    description: 'Modern meets traditional culture',
    budgetCategory: 'mid-range',
    budgetLabel: 'Mid-Range',
    tourSpots: ['Shibuya Crossing & Hachiko Statue', 'Senso-ji Temple Asakusa', 'Tokyo Skytree Observatory', 'Meiji Shrine & Yoyogi Park', 'Tsukiji Outer Fish Market', 'Akihabara Electric Town', 'Harajuku Takeshita Street', 'Imperial Palace East Gardens'],
  },
  {
    name: 'Rome',
    country: 'Italy',
    icon: '🇮🇹',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop',
    budgetRange: '$1,600 - $2,800',
    description: 'Eternal city of history',
    budgetCategory: 'mid-range',
    budgetLabel: 'Mid-Range',
    tourSpots: ['Colosseum, Roman Forum & Palatine Hill', 'Vatican City & St. Peter\'s Basilica', 'Trevi Fountain & Spanish Steps', 'Roman Forum & Ancient Ruins', 'Pantheon & Piazza della Rotonda', 'Spanish Steps Piazza di Spagna', 'Sistine Chapel Vatican Museums', 'Piazza Navona & Bernini Fountains'],
  },
  {
    name: 'Dubai',
    country: 'UAE',
    icon: '🇦🇪',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
    budgetRange: '$3,000 - $6,000',
    description: 'Luxury and innovation',
    budgetCategory: 'luxury',
    budgetLabel: 'Luxury',
    tourSpots: ['Burj Khalifa At The Top SKY', 'Dubai Mall & Dubai Fountain', 'Palm Jumeirah & Atlantis Resort', 'Burj Al Arab Luxury Hotel', 'Dubai Marina & JBR Beach', 'Gold Souk & Spice Souk', 'Desert Safari & Dune Bashing', 'Atlantis Aquaventure Waterpark'],
  },
  {
    name: 'Paris',
    country: 'France',
    icon: '🇫🇷',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop',
    budgetRange: '$2,500 - $5,000',
    description: 'City of love and elegance',
    budgetCategory: 'luxury',
    budgetLabel: 'Luxury',
    tourSpots: ['Eiffel Tower & Champ de Mars', 'Louvre Museum & Mona Lisa', 'Notre-Dame Cathedral & Île de la Cité', 'Arc de Triomphe & Champs-Élysées', 'Champs-Élysées Shopping Avenue', 'Sacré-Cœur & Montmartre Hills', 'Palace of Versailles Day Trip', 'Musée d\'Orsay Impressionist Art'],
  },
  {
    name: 'Maldives',
    country: 'Maldives',
    icon: '🇲🇻',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=300&fit=crop',
    budgetRange: '$4,000 - $8,000',
    description: 'Ultimate tropical luxury',
    budgetCategory: 'luxury',
    budgetLabel: 'Luxury',
    tourSpots: ['Vaadhoo Island Sea of Stars', 'Male City & Grand Friday Mosque', 'Banana Reef Diving & Snorkeling', 'HP Reef Marine Protected Area', 'Artificial Beach Male Recreation', 'Ithaa Undersea Restaurant', 'Bioluminescent Beach Night Tour', 'Conrad Maldives Rangali Island'],
  },
];

const PublicTravelPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [allDestinations, setAllDestinations] = useState<Destination[]>(ALL_DESTINATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch popular destinations from API
  useEffect(() => {
    const fetchPopularDestinations = async () => {
      try {
        setLoading(true);
        const data: PopularDestination[] = await api.request('/travel/public/popular-destinations?limit=20');

        if (data && data.length > 0) {
          // First, set destinations without locations
          const convertedDestinations = data.map(apiDest => {
            const parts = apiDest.destination.split(',').map(p => p.trim());
            const country = parts.length > 1 ? parts[1] : parts[0];
            const city = parts[0];
            const getCountryIcon = (destination: string) => {
              const countryMap: Record<string, string> = {
                'Spain': '🇪🇸', 'France': '🇫🇷', 'Italy': '🇮🇹', 'Japan': '🇯🇵',
                'Thailand': '🇹🇭', 'Indonesia': '🇮🇩', 'UAE': '🇦🇪', 'USA': '🇺🇸',
                'Mexico': '🇲🇽', 'Maldives': '🇲🇻', 'UK': '🇬🇧'
              };
              for (const [country, icon] of Object.entries(countryMap)) {
                if (destination.includes(country)) return icon;
              }
              return '🌍';
            };

            return {
              name: city,
              country: country,
              icon: getCountryIcon(apiDest.destination),
              image: apiDest.coverImageUrl ||
                `https://source.unsplash.com/400x300/?${encodeURIComponent(city)},travel,landmark`,
              budgetRange: apiDest.budgetRange || 'Budget-friendly',
              description: apiDest.description || `Explore amazing ${city}`,
              budgetCategory: apiDest.averageBudget >= 3000 ? 'luxury' : apiDest.averageBudget >= 1500 ? 'mid-range' : 'budget',
              budgetLabel: apiDest.averageBudget >= 3000 ? 'Luxury' : apiDest.averageBudget >= 1500 ? 'Mid-Range' : 'Budget-Friendly',
              tourSpots: [] as string[]
            } as Destination;
          });

          setAllDestinations(convertedDestinations);

          // Then fetch locations for each destination
          const locationPromises = data.map(async (dest, index) => {
            try {
              const locations: DestinationLocation[] = await api.request(
                `/travel/public/destinations/${encodeURIComponent(dest.destination)}/locations?limit=8`
              );
              if (locations && locations.length > 0) {
                const tourSpots = locations.map(l => l.name);

                // Update the specific destination with locations
                setAllDestinations(prev => {
                  const updated = [...prev];
                  if (updated[index]) {
                    updated[index] = {
                      ...updated[index],
                      tourSpots: tourSpots
                    };
                  }
                  return updated;
                });
              }
            } catch (err) {
              console.error(`Failed to fetch locations for ${dest.destination}:`, err);
            }
          });

          await Promise.all(locationPromises);
        } else {
          // Use fallback data if API returns empty
          setAllDestinations(ALL_DESTINATIONS);
        }
      } catch (error) {
        console.error('Failed to fetch popular destinations:', error);
        // Use fallback data on error
        setAllDestinations(ALL_DESTINATIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularDestinations();
  }, []);

  useEffect(() => {
    filterDestinations();
  }, [searchQuery, selectedDestination, allDestinations]);

  const filterDestinations = () => {
    let filtered = allDestinations;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(dest =>
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.budgetLabel.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply destination filter
    if (selectedDestination) {
      filtered = filtered.filter(dest => dest.name === selectedDestination);
    }

    setDestinations(filtered);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDestination('');
  };

  const uniqueDestinations = Array.from(new Set(allDestinations.map(dest => dest.name)));

  return (
    <>
      <SEO
        title={PAGE_SEO.publicTravelPlans.title}
        description={PAGE_SEO.publicTravelPlans.description}
        url={PAGE_SEO.publicTravelPlans.url}
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Popular Travel Destinations
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore amazing destinations and their top attractions
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="hidden sm:flex"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Destinations</option>
              {uniqueDestinations.map((dest) => (
                <option key={dest} value={dest}>
                  {dest}
                </option>
              ))}
            </select>
            {(searchQuery || selectedDestination) && (
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Destinations Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading popular destinations...</p>
            </div>
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-20">
            <Globe className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Destinations Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters to find more destinations
            </p>
            <Button onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card
                  className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full cursor-pointer"
                  onClick={() => navigate(`/travel-plans/${destination.name.toLowerCase().replace(/\s+/g, '-')}`)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
                      <span className="text-3xl">{destination.icon}</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-1">{destination.name}</h3>
                      <p className="text-sm opacity-90">{destination.country}</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 mb-3">
                        <span className="text-sm font-bold text-primary">{destination.budgetLabel}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {destination.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-primary font-semibold">{destination.budgetRange}</span>
                    </div>

                    {/* Tour Spots Preview */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Popular Spots</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {destination.tourSpots.slice(0, 3).map((spot) => (
                          <span
                            key={spot}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {spot}
                          </span>
                        ))}
                        {destination.tourSpots.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            +{destination.tourSpots.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default PublicTravelPlansPage;