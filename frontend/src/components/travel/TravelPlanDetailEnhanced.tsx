import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney as DollarSign,
  Map as MapIcon,
  Info,
  Warning,
  CheckCircle,
  Route,
  ChevronRight,
  ChevronLeft,
  Layers,
  TheaterComedy,
  Hotel,
  Restaurant,
  LocalTaxi,
  ShoppingBag,
  Category
} from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

interface TravelPlanDetailEnhancedProps {
  plan: any;
}

interface ExpenseData {
  totalSpent: number;
  totalBudget: number;
  dailyAverage: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
    icon: React.ReactNode;
    color: string;
  }[];
  savingsOrOverspend: number;
  percentageUsed: number;
}

const TravelPlanDetailEnhanced: React.FC<TravelPlanDetailEnhancedProps> = ({ plan }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [mapView, setMapView] = useState<'route' | 'activities'>('route');
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Default to Paris
  const [mapZoom] = useState(12);

  // Calculate expense data
  useEffect(() => {
    if (!plan) return;

    let totalSpent = 0;
    const categoryAmounts: { [key: string]: number } = {
      Activities: 0,
      Accommodation: 0,
      Dining: 0,
      Transportation: 0,
      Shopping: 0,
      Other: 0
    };

    // Calculate total spent from itinerary
    plan.itinerary.forEach((day: any) => {
      // Activities
      day.activities.forEach((activity: any) => {
        totalSpent += activity.cost || 0;
        if (activity.category === 'shopping') {
          categoryAmounts.Shopping += activity.cost || 0;
        } else if (activity.category === 'sightseeing' || activity.category === 'culture' || activity.category === 'adventure') {
          categoryAmounts.Activities += activity.cost || 0;
        } else {
          categoryAmounts.Other += activity.cost || 0;
        }
      });

      // Meals
      day.meals.forEach((meal: any) => {
        totalSpent += meal.estimatedCost || 0;
        categoryAmounts.Dining += meal.estimatedCost || 0;
      });
    });

    // Add hotel costs
    const hotelCostPerNight = plan.hotels[0]?.pricePerNight || 200;
    const accommodationTotal = hotelCostPerNight * plan.duration;
    totalSpent += accommodationTotal;
    categoryAmounts.Accommodation = accommodationTotal;

    // Add estimated transportation
    const transportationEstimate = plan.duration * 50; // $50 per day for local transport
    totalSpent += transportationEstimate;
    categoryAmounts.Transportation = transportationEstimate;

    // Calculate category breakdown with percentages
    const categoryBreakdown = Object.entries(categoryAmounts)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalSpent) * 100,
        icon: getCategoryIcon(category),
        color: getCategoryColor(category)
      }))
      .sort((a, b) => b.amount - a.amount);

    // Handle budget as object or number for backward compatibility
    const budgetTotal = typeof plan.budget === 'object' ? plan.budget?.total || 0 : (plan.budget || 0);
    const savingsOrOverspend = budgetTotal - totalSpent;
    const percentageUsed = budgetTotal > 0 ? (totalSpent / budgetTotal) * 100 : 0;
    const dailyAverage = totalSpent / plan.duration;

    setExpenseData({
      totalSpent,
      totalBudget: budgetTotal,
      dailyAverage,
      categoryBreakdown,
      savingsOrOverspend,
      percentageUsed
    });
  }, [plan]);

  // Set map center based on destination
  useEffect(() => {
    const destinationCoordinates: { [key: string]: [number, number] } = {
      'Paris, France': [48.8566, 2.3522],
      'Tokyo, Japan': [35.6762, 139.6503],
      'Bali, Indonesia': [-8.3405, 115.0920],
      'New York, USA': [40.7128, -74.0060],
      'Rome, Italy': [41.9028, 12.4964],
      'Dubai, UAE': [25.2048, 55.2708],
      'London, UK': [51.5074, -0.1278],
      'Barcelona, Spain': [41.3851, 2.1734]
    };

    if (plan && destinationCoordinates[plan.destination]) {
      setMapCenter(destinationCoordinates[plan.destination]);
    }
  }, [plan]);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      Activities: <TheaterComedy className="h-5 w-5 text-teal-400" />,
      Accommodation: <Hotel className="h-5 w-5 text-teal-400" />,
      Dining: <Restaurant className="h-5 w-5 text-teal-400" />,
      Transportation: <LocalTaxi className="h-5 w-5 text-teal-400" />,
      Shopping: <ShoppingBag className="h-5 w-5 text-teal-400" />,
      Other: <Category className="h-5 w-5 text-teal-400" />
    };
    return icons[category] || <Category className="h-5 w-5 text-teal-400" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Activities: 'bg-sky-400',
      Accommodation: 'bg-blue-400',
      Dining: 'bg-cyan-400',
      Transportation: 'bg-teal-400',
      Shopping: 'bg-indigo-400',
      Other: 'bg-slate-400'
    };
    return colors[category] || 'bg-slate-400';
  };

  // Generate route coordinates for the map
  const getRouteCoordinates = (): [number, number][] => {
    if (!plan || !plan.itinerary.length) return [];
    
    const coordinates: [number, number][] = [];
    
    // Add slight variations to create a route around the city
    const baseCoord = mapCenter;
    const variations = [
      [0, 0],
      [0.01, 0.02],
      [0.02, -0.01],
      [-0.01, 0.03],
      [-0.02, 0.01],
      [0.015, -0.02]
    ];
    
    plan.itinerary.forEach((_day: any, index: number) => {
      if (index < variations.length) {
        coordinates.push([
          baseCoord[0] + variations[index][0],
          baseCoord[1] + variations[index][1]
        ]);
      }
    });
    
    return coordinates;
  };

  // Get activity locations for selected day
  const getDayActivityLocations = (): Array<{ position: [number, number]; name: string; time: string }> => {
    if (!plan || !plan.itinerary[selectedDay]) return [];
    
    const locations: Array<{ position: [number, number]; name: string; time: string }> = [];
    const baseCoord = mapCenter;
    
    plan.itinerary[selectedDay].activities.forEach((activity: any, index: number) => {
      // Generate random but consistent positions around the city center
      const angle = (index * 2 * Math.PI) / plan.itinerary[selectedDay].activities.length;
      const radius = 0.02 + Math.random() * 0.01;
      
      locations.push({
        position: [
          baseCoord[0] + radius * Math.cos(angle),
          baseCoord[1] + radius * Math.sin(angle)
        ],
        name: activity.name,
        time: activity.time
      });
    });
    
    return locations;
  };

  if (!plan) return null;

  return (
    <div className="space-y-6">
      {/* Map Section */}
      <Card className="rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-white">
              <MapIcon className="h-6 w-6 text-teal-400" />
              Travel Route Map
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={mapView === 'route' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMapView('route')}
                className={`rounded-xl ${mapView === 'route' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
              >
                <Route className="h-4 w-4 mr-1" />
                Full Route
              </Button>
              <Button
                variant={mapView === 'activities' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMapView('activities')}
                className={`rounded-xl ${mapView === 'activities' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
              >
                <Layers className="h-4 w-4 mr-1" />
                Daily Activities
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px] relative">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="h-full w-full"
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {mapView === 'route' ? (
                <>
                  {/* Show full route */}
                  <Polyline
                    positions={getRouteCoordinates()}
                    color="#14b8a6"
                    weight={3}
                    opacity={0.7}
                  />
                  {getRouteCoordinates().map((position, index) => (
                    <Marker key={index} position={position}>
                      <Popup>
                        <div className="text-sm">
                          <strong>Day {index + 1}</strong>
                          <br />
                          {plan.itinerary[index]?.title || 'Exploring'}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </>
              ) : (
                <>
                  {/* Show activities for selected day */}
                  {getDayActivityLocations().map((location, index) => (
                    <Marker key={index} position={location.position}>
                      <Popup>
                        <div className="text-sm">
                          <strong>{location.name}</strong>
                          <br />
                          {location.time}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {/* Connect activities with lines */}
                  <Polyline
                    positions={getDayActivityLocations().map(loc => loc.position)}
                    color="#10b981"
                    weight={2}
                    opacity={0.6}
                    dashArray="5, 10"
                  />
                </>
              )}
            </MapContainer>

            {/* Day selector for activities view */}
            {mapView === 'activities' && (
              <div className="absolute bottom-4 left-4 z-[1000] bg-black/60 backdrop-blur-xl rounded-xl shadow-lg p-3 border border-white/20">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                    disabled={selectedDay === 0}
                    className="h-8 w-8 p-0 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-2 text-white">
                    Day {selectedDay + 1} of {plan.duration}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedDay(Math.min(plan.duration - 1, selectedDay + 1))}
                    disabled={selectedDay === plan.duration - 1}
                    className="h-8 w-8 p-0 text-white hover:bg-white/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Tracking Section */}
      {expenseData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budget Overview Card */}
          <Card className="rounded-2xl lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="h-6 w-6 text-teal-400" />
                Budget & Expense Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Budget Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-sm text-white/60 mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-white">${expenseData.totalBudget}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-sm text-white/60 mb-1">Estimated Expenses</p>
                  <p className="text-2xl font-bold text-white">${expenseData.totalSpent.toFixed(0)}</p>
                </div>
                <div className={`rounded-xl p-4 ${expenseData.savingsOrOverspend >= 0 ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                  <p className="text-sm text-white/60 mb-1">
                    {expenseData.savingsOrOverspend >= 0 ? 'Estimated Savings' : 'Over Budget'}
                  </p>
                  <div className="flex items-center gap-2">
                    {expenseData.savingsOrOverspend >= 0 ? (
                      <TrendingDown className="h-5 w-5 text-green-400" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-red-400" />
                    )}
                    <p className={`text-2xl font-bold ${expenseData.savingsOrOverspend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${Math.abs(expenseData.savingsOrOverspend).toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-white">Budget Usage</span>
                  <span className="text-sm font-medium text-white">{expenseData.percentageUsed.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500`}
                    style={{
                      width: `${Math.min(100, expenseData.percentageUsed)}%`,
                      backgroundColor: expenseData.percentageUsed <= 80
                        ? '#14b8a6'
                        : expenseData.percentageUsed <= 100
                        ? '#fbbf24'
                        : '#ef4444'
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-white/50">$0</span>
                  <span className="text-xs text-white/50">${expenseData.totalBudget}</span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div>
                <h4 className="font-semibold mb-3 text-white">Expense Breakdown by Category</h4>
                <div className="space-y-3">
                  {expenseData.categoryBreakdown.map((category) => (
                    <div key={category.category} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-white">{category.category}</span>
                          <span className="text-sm font-semibold text-white">${category.amount.toFixed(0)}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`h-full rounded-full ${category.color}`}
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-white/50 w-12 text-right">
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights Card */}
          <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Info className="h-6 w-6 text-teal-400" />
                Budget Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Daily Average */}
              <div className="bg-teal-500/20 rounded-xl p-4 border border-teal-500/30">
                <p className="text-sm text-teal-300 mb-1">Daily Average Spend</p>
                <p className="text-xl font-bold text-teal-400">
                  ${expenseData.dailyAverage.toFixed(0)}/day
                </p>
              </div>

              {/* Status Messages */}
              <div className="space-y-3">
                {expenseData.savingsOrOverspend >= 0 ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-300">
                        Within Budget!
                      </p>
                      <p className="text-xs text-white/60">
                        You're saving ${expenseData.savingsOrOverspend.toFixed(0)} from your budget
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Warning className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-300">
                        Over Budget
                      </p>
                      <p className="text-xs text-white/60">
                        Consider reducing expenses by ${Math.abs(expenseData.savingsOrOverspend).toFixed(0)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="border-t border-white/10 pt-3">
                  <p className="text-xs font-medium text-white mb-2">
                    Money-Saving Tips
                  </p>
                  <ul className="space-y-1 text-xs text-white/60">
                    {expenseData.categoryBreakdown[0]?.category === 'Accommodation' && (
                      <li>• Consider budget-friendly accommodations</li>
                    )}
                    {expenseData.categoryBreakdown[0]?.category === 'Dining' && (
                      <li>• Try local street food for authentic & cheap meals</li>
                    )}
                    <li>• Book activities in advance for discounts</li>
                    <li>• Use public transport instead of taxis</li>
                    <li>• Look for free walking tours</li>
                  </ul>
                </div>

                {/* Budget Health Score */}
                <div className="border-t border-white/10 pt-3">
                  <p className="text-xs font-medium text-white mb-2">
                    Budget Health Score
                  </p>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-8 rounded-full`}
                        style={{
                          backgroundColor: i < Math.floor((100 - Math.min(100, expenseData.percentageUsed)) / 20) + 1
                            ? expenseData.percentageUsed <= 80
                              ? '#14b8a6'
                              : expenseData.percentageUsed <= 100
                              ? '#fbbf24'
                              : '#ef4444'
                            : 'rgba(255,255,255,0.1)'
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    {expenseData.percentageUsed <= 80
                      ? 'Excellent'
                      : expenseData.percentageUsed <= 100
                      ? 'Good'
                      : 'Needs Attention'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TravelPlanDetailEnhanced;