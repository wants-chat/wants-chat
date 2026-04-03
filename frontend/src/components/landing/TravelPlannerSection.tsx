import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../ui/card';
import { MapPin, DollarSign, Sparkles, Loader2, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { api } from '../../lib/api';

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
  visitCount?: number;
  budgetCategory: 'budget' | 'mid-range' | 'luxury';
  budgetLabel: string;
  tourSpots: string[];
}


const TravelPlannerSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentDestinationSlide, setCurrentDestinationSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiDestinations, setApiDestinations] = useState<PopularDestination[]>([]);
  const [currentLocations, setCurrentLocations] = useState<DestinationLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Fetch popular destinations from API
  useEffect(() => {
    const fetchPopularDestinations = async () => {
      try {
        setLoading(true);
        const data = await api.request('/travel/public/popular-destinations?limit=10');
        setApiDestinations(data);
      } catch (error) {
        console.error('Failed to fetch popular destinations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularDestinations();
  }, []);

  // Fetch locations for current destination
  useEffect(() => {
    const fetchLocations = async () => {
      if (apiDestinations.length === 0) return;

      const currentDest = apiDestinations[currentDestinationSlide];
      if (!currentDest) return;

      try {
        setLoadingLocations(true);
        const data = await api.request(
          `/travel/public/destinations/${encodeURIComponent(currentDest.destination)}/locations?limit=8`
        );
        setCurrentLocations(data);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
        setCurrentLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [currentDestinationSlide, apiDestinations]);

  // Fallback destinations (if API fails or returns empty)
  const fallbackDestinations: Destination[] = [
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

  // Convert API destinations to display format
  const convertApiToDisplayDestination = (apiDest: PopularDestination): Destination => {
    // Extract country code emoji or use default
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

    // Extract country from destination string (e.g., "Barcelona, Spain" -> "Spain")
    const parts = apiDest.destination.split(',').map(p => p.trim());
    const country = parts.length > 1 ? parts[1] : parts[0];
    const city = parts[0];

    // Get fallback image from Unsplash
    const image = apiDest.coverImageUrl ||
      `https://source.unsplash.com/400x300/?${encodeURIComponent(city)},travel,landmark`;

    return {
      name: city,
      country: country,
      icon: getCountryIcon(apiDest.destination),
      image: image,
      budgetRange: apiDest.budgetRange || 'Budget-friendly',
      description: apiDest.description || `Explore amazing ${city}`,
      visitCount: apiDest.visitCount,
      budgetCategory: apiDest.averageBudget >= 3000 ? 'luxury' : apiDest.averageBudget >= 1500 ? 'mid-range' : 'budget',
      budgetLabel: apiDest.averageBudget >= 3000 ? 'Luxury' : apiDest.averageBudget >= 1500 ? 'Mid-Range' : 'Budget-Friendly',
      tourSpots: [] // Will be populated from locations API
    };
  };

  // Use API destinations if available, otherwise fallback
  const allDestinations = apiDestinations.length > 0
    ? apiDestinations.map(convertApiToDisplayDestination)
    : fallbackDestinations;

  // Auto-scroll carousel for popular destinations
  useEffect(() => {
    if (allDestinations.length === 0) return;
    const interval = setInterval(() => {
      setCurrentDestinationSlide((prev) => (prev + 1) % allDestinations.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [allDestinations.length]);

  // Color palette for tour spot chips
  const chipColors = [
    'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
    'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30',
    'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
    'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30',
    'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30',
    'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30',
    'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
    'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  ];

  const currentDestination = allDestinations[currentDestinationSlide];

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (loading && apiDestinations.length === 0) {
    return (
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-teal-400 mx-auto mb-4" />
              <p className="text-white/60">Loading amazing destinations...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="relative py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={sectionVariants}
    >
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div className="text-center mb-8 sm:mb-12" variants={cardVariants}>
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4 sm:mb-6">
            <Sparkles className="h-4 w-4 text-teal-400" />
            <span className="text-xs sm:text-sm font-medium text-white">
              AI Travel Planner
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-4 text-white">
            Discover Your Next
            <span className="text-teal-400"> Adventure</span>
          </h2>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto px-4">
            Explore popular destinations tailored to your budget with AI-powered travel planning
          </p>
        </motion.div>

        {/* Popular Destinations Slider */}
        <motion.div variants={cardVariants} className="mb-8 sm:mb-12 md:mb-16 lg:mb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div className="mb-2 md:mb-0">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Popular Destinations</h3>
              <p className="text-xs sm:text-sm text-white/60">Explore amazing destinations and their top attractions</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                size="lg"
                className="bg-white/10 border border-white/30 text-white hover:scale-105 group w-full sm:w-auto text-sm sm:text-base transition-all duration-200"
                onClick={() => navigate('/travel-plans')}
              >
                <Eye className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                <span className="truncate">View All Plans</span>
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl group w-full sm:w-auto text-sm sm:text-base transition-all"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    navigate('/travel-planner/generate');
                  }
                }}
              >
                <span className="mr-2">✈️</span>
                <span className="truncate">Generate AI Travel Plan</span>
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentDestinationSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Budget Label */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
                  <span className="text-sm font-bold text-teal-400">{currentDestination.budgetLabel}</span>
                </div>
                <span className="text-sm text-white/60">{currentDestination.budgetRange}</span>
              </div>

              {/* Main Content: Left Card + Right Tour Spots */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left: Destination Card */}
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <Card
                    className="overflow-hidden border border-white/20 bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/travel-plans/${currentDestination.name.toLowerCase().replace(/\s+/g, '-')}`)}
                  >
                    <div className="relative h-64 sm:h-80 overflow-hidden">
                      <img
                        src={currentDestination.image}
                        alt={currentDestination.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-md">
                        <span className="text-2xl sm:text-3xl">{currentDestination.icon}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                        <h3 className="text-2xl sm:text-3xl font-bold mb-1">{currentDestination.name}</h3>
                        <p className="text-xs sm:text-sm opacity-90 mb-3">{currentDestination.country}</p>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-white/60 mb-3 text-sm">
                        {currentDestination.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-teal-400" />
                        <span className="text-teal-400 font-semibold">{currentDestination.budgetRange}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Right: Tour Spots */}
                <div className="relative min-h-[300px] sm:min-h-[440px] p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <MapPin className="h-5 w-5 text-teal-400" />
                    <h4 className="text-base sm:text-lg font-bold text-white">Popular Tour Spots</h4>
                  </div>
                  <div className="relative h-[240px] sm:h-[360px] overflow-hidden">
                    {loadingLocations ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : currentLocations.length > 0 ? (
                      <>
                        {/* Desktop: Scattered positioning */}
                        {currentLocations.map((location, index) => {
                          const desktopPositions = [
                            { top: '0px', left: '0px' },
                            { top: '0px', left: '280px' },
                            { top: '70px', left: '140px' },
                            { top: '140px', left: '0px' },
                            { top: '140px', left: '300px' },
                            { top: '210px', left: '150px' },
                            { top: '280px', left: '10px' },
                            { top: '280px', left: '290px' },
                          ];

                          const position = desktopPositions[index] || desktopPositions[0];

                          return (
                            <motion.div
                              key={location.name}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                                y: [0, -8, 0],
                              }}
                              transition={{
                                delay: index * 0.1,
                                duration: 0.5,
                                y: {
                                  duration: 2.5 + (index * 0.3),
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }
                              }}
                              whileHover={{
                                scale: 1.15,
                                zIndex: 10,
                                transition: { duration: 0.2 }
                              }}
                              style={{
                                position: 'absolute',
                                top: position.top,
                                left: position.left,
                              }}
                              className={`hidden sm:block px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium border backdrop-blur-sm shadow-lg cursor-default ${
                                chipColors[index % chipColors.length]
                              }`}
                              title={`${location.description} (visited ${location.frequency} times)`}
                            >
                              {location.name}
                            </motion.div>
                          );
                        })}

                        {/* Mobile: Grid layout */}
                        <div className="sm:hidden flex flex-wrap gap-2">
                          {currentLocations.map((location, index) => (
                            <motion.div
                              key={location.name}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm shadow-lg ${
                                chipColors[index % chipColors.length]
                              }`}
                            >
                              {location.name}
                            </motion.div>
                          ))}
                        </div>
                      </>
                    ) : currentDestination.tourSpots.length > 0 ? (
                      <>
                        {/* Desktop: Scattered positioning with fallback data */}
                        {currentDestination.tourSpots.map((spot, index) => {
                          const desktopPositions = [
                            { top: '0px', left: '0px' },
                            { top: '0px', left: '280px' },
                            { top: '70px', left: '140px' },
                            { top: '140px', left: '0px' },
                            { top: '140px', left: '300px' },
                            { top: '210px', left: '150px' },
                            { top: '280px', left: '10px' },
                            { top: '280px', left: '290px' },
                          ];

                          return (
                            <motion.div
                              key={spot}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                                y: [0, -8, 0],
                              }}
                              transition={{
                                delay: index * 0.1,
                                duration: 0.5,
                                y: {
                                  duration: 2.5 + (index * 0.3),
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }
                              }}
                              whileHover={{
                                scale: 1.15,
                                zIndex: 10,
                                transition: { duration: 0.2 }
                              }}
                              className={`absolute px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium border backdrop-blur-sm shadow-lg cursor-default ${
                                chipColors[index % chipColors.length]
                              } hidden sm:block`}
                              style={desktopPositions[index] || desktopPositions[0]}
                            >
                              {spot}
                            </motion.div>
                          );
                        })}

                        {/* Mobile: Grid layout with fallback data */}
                        <div className="sm:hidden flex flex-wrap gap-2">
                          {currentDestination.tourSpots.map((spot, index) => (
                            <motion.div
                              key={spot}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm shadow-lg ${
                                chipColors[index % chipColors.length]
                              }`}
                            >
                              {spot}
                            </motion.div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-white/50">
                        No location data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TravelPlannerSection;
