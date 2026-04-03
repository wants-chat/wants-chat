import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import TravelGlobe from './TravelGlobe';
import {
  Public,
  Flight,
  LocationOn,
  TravelExplore,
  Map,
  Favorite,
  Timeline,
  EmojiEvents
} from '@mui/icons-material';

interface TravelPlan {
  id: string;
  destination: string;
  visitedYear?: number;
  isFavorite?: boolean;
  duration?: number;
  status?: 'completed' | 'planned' | 'current';
}

interface TravelStatsProps {
  travelPlans: TravelPlan[];
  className?: string;
}

const TravelStats: React.FC<TravelStatsProps> = ({ travelPlans, className }) => {
  const [viewMode, setViewMode] = useState<'globe' | 'stats'>('globe');
  const [showLabels, setShowLabels] = useState(false);
  const [textureQuality, setTextureQuality] = useState<'high' | 'medium' | 'low'>('high');

  // Extract country names from destinations and create visited countries data
  const visitedCountries = useMemo(() => {
    const countries = travelPlans
      .filter(plan => plan.status === 'completed')
      .map(plan => {
        // Extract country name from destination (e.g., "Paris, France" -> "France")
        const countryName = plan.destination.split(', ').pop() || plan.destination;
        
        // Map some common destination formats to country names
        const countryMapping: { [key: string]: string } = {
          'USA': 'USA',
          'United States': 'USA',
          'UK': 'UK',
          'United Kingdom': 'UK',
          'UAE': 'UAE',
          'Japan': 'Japan',
          'France': 'France',
          'Italy': 'Italy',
          'Spain': 'Spain',
          'Indonesia': 'Indonesia',
          'Thailand': 'Thailand',
          'Germany': 'Germany',
          'Australia': 'Australia',
          'Brazil': 'Brazil',
          'India': 'India',
          'China': 'China',
          'Canada': 'Canada',
          'Mexico': 'Mexico'
        };

        const normalizedCountry = countryMapping[countryName] || countryName;
        
        return {
          name: normalizedCountry,
          year: plan.visitedYear || new Date().getFullYear(),
          color: plan.isFavorite ? '#ff6b6b' : '#4ecdc4'
        };
      });

    // Remove duplicates and keep the most recent visit
    const uniqueCountries = countries.reduce((acc, country) => {
      const existing = acc.find(c => c.name === country.name);
      if (!existing || (country.year && country.year > (existing.year || 0))) {
        return [...acc.filter(c => c.name !== country.name), country];
      }
      return acc;
    }, [] as typeof countries);

    return uniqueCountries;
  }, [travelPlans]);

  const stats = useMemo(() => {
    const completed = travelPlans.filter(p => p.status === 'completed').length;
    const planned = travelPlans.filter(p => p.status === 'planned').length;
    const favorites = travelPlans.filter(p => p.isFavorite).length;
    const totalDays = travelPlans.reduce((sum, p) => sum + (p.duration || 0), 0);
    const uniqueCountries = visitedCountries.length;
    
    return {
      completed,
      planned,
      favorites,
      totalDays,
      uniqueCountries,
      totalTrips: travelPlans.length
    };
  }, [travelPlans, visitedCountries]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center">
            <Public className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Travel Statistics
            </h2>
            <p className="text-white/60">
              Your journey around the world
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setViewMode('globe')}
            className={`rounded-xl ${viewMode === 'globe' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'}`}
          >
            <Public className="h-4 w-4 mr-1" />
            Globe
          </Button>
          <Button
            size="sm"
            onClick={() => setViewMode('stats')}
            className={`rounded-xl ${viewMode === 'stats' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'}`}
          >
            <TravelExplore className="h-4 w-4 mr-1" />
            Stats
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <LocationOn className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.uniqueCountries}
                </p>
                <p className="text-xs text-white/60">Countries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Flight className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.completed}
                </p>
                <p className="text-xs text-white/60">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                <Timeline className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.totalDays}
                </p>
                <p className="text-xs text-white/60">Total Days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <Favorite className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.favorites}
                </p>
                <p className="text-xs text-white/60">Favorites</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {viewMode === 'globe' ? (
        <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Public className="h-5 w-5 text-teal-400" />
                Interactive Travel Globe
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowLabels(!showLabels)}
                  className="rounded-xl bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                >
                  <Map className="h-4 w-4 mr-1" />
                  {showLabels ? 'Hide' : 'Show'} Labels
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    const qualities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
                    const currentIndex = qualities.indexOf(textureQuality);
                    const nextIndex = (currentIndex + 1) % qualities.length;
                    setTextureQuality(qualities[nextIndex]);
                  }}
                  className="rounded-xl bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                >
                  Quality: {textureQuality.charAt(0).toUpperCase() + textureQuality.slice(1)}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex justify-center">
            {visitedCountries.length > 0 ? (
              <div className="w-full">
                <TravelGlobe
                  visitedCountries={visitedCountries}
                  width={undefined}
                  height={500}
                  showLabels={showLabels}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-white/60">
                <Public className="h-16 w-16 mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2 text-white">No completed trips yet</h3>
                <p className="text-sm text-center max-w-md">
                  Complete some travel plans to see them highlighted on your personal travel globe!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visited Countries List */}
          <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <LocationOn className="h-5 w-5 text-teal-400" />
                Visited Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visitedCountries.length > 0 ? (
                <div className="space-y-3">
                  {visitedCountries.map((country, index) => (
                    <div key={`visited-${country.name}-${index}`} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: country.color }}
                        />
                        <span className="font-medium text-white">{country.name}</span>
                      </div>
                      {country.year && (
                        <Badge variant="secondary" className="text-xs bg-white/10 text-white/70 border-white/20">
                          {country.year}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  <LocationOn className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No countries visited yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Travel Achievements */}
          <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <EmojiEvents className="h-5 w-5 text-teal-400" />
                Travel Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* First Trip */}
                {stats.completed > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <Flight className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-yellow-300">
                        First Journey
                      </p>
                      <p className="text-sm text-yellow-400/70">
                        Completed your first trip
                      </p>
                    </div>
                  </div>
                )}

                {/* Explorer */}
                {stats.uniqueCountries >= 3 && (
                  <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Public className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-300">
                        Explorer
                      </p>
                      <p className="text-sm text-blue-400/70">
                        Visited 3+ countries
                      </p>
                    </div>
                  </div>
                )}

                {/* Globetrotter */}
                {stats.uniqueCountries >= 5 && (
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <TravelExplore className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-300">
                        Globetrotter
                      </p>
                      <p className="text-sm text-green-400/70">
                        Visited 5+ countries
                      </p>
                    </div>
                  </div>
                )}

                {/* Long Journey */}
                {stats.totalDays >= 30 && (
                  <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Timeline className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-300">
                        Long Journey
                      </p>
                      <p className="text-sm text-purple-400/70">
                        Traveled 30+ days total
                      </p>
                    </div>
                  </div>
                )}

                {stats.completed === 0 && (
                  <div className="text-center py-8 text-white/60">
                    <EmojiEvents className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Complete trips to unlock achievements</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TravelStats;