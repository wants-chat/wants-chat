import React, { useState } from 'react';
import { Search, Plus, Calendar, MapPin, DollarSign, Users, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import BackgroundEffects from '../components/ui/BackgroundEffects';
import Header from '../components/landing/Header';

// Import backend hooks
import {
  useTravelPlans,
  useTravelStats,
  useDestinations,
  useCreateTravelPlan,
} from '../hooks/useServices';

// Import travel types
import type { TravelPlan } from '../services/travelService';

// Import travel components
import TravelStats from '../components/travel/TravelStats';
import TravelPlanForm from '../components/travel/TravelPlanForm';
import TravelItineraryBuilder from '../components/travel/TravelItineraryBuilder';
import TravelBookingManager from '../components/travel/TravelBookingManager';
import TravelDocumentManager from '../components/travel/TravelDocumentManager';
import TravelBudgetTracker from '../components/travel/TravelBudgetTracker';
import TravelPlanCard from '../components/travel/TravelPlanCard';

const TravelPlannerPage: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<'plans' | 'create' | 'stats'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<TravelPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'booked' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'startDate' | 'created' | 'budget' | 'duration'>('startDate');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Backend data hooks
  const {
    data: travelPlansData,
    loading: plansLoading,
    error: plansError,
    refetch: refetchPlans
  } = useTravelPlans();

  const {
    data: _travelStats,
    loading: statsLoading,
    error: statsError
  } = useTravelStats();

  const {
    data: destinations,
    loading: _destinationsLoading,
    error: _destinationsError
  } = useDestinations();

  const createTravelPlanMutation = useCreateTravelPlan();

  // Get plans array from paginated response
  const travelPlans = travelPlansData?.data || [];
  const totalPlans = travelPlansData?.total || 0;

  // Filter and sort plans
  const filteredPlans = travelPlans
    .filter((plan: TravelPlan) => {
      const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plan.destination.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plan.destination.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a: TravelPlan, b: TravelPlan) => {
      switch (sortBy) {
        case 'startDate':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'budget':
          return (b.budget?.total || 0) - (a.budget?.total || 0);
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

  const handleCreatePlan = async (planData: Omit<TravelPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createTravelPlanMutation.mutateAsync(planData);
      setShowCreateForm(false);
      refetchPlans();
    } catch (error) {
      console.error('Failed to create travel plan:', error);
    }
  };

  const handlePlanSelect = (plan: TravelPlan) => {
    setSelectedPlan(plan);
  };

  const handleBackToPlans = () => {
    setSelectedPlan(null);
  };

  // Format stats for TravelStats component
  const formattedStatsPlans = travelPlans.map((plan: TravelPlan) => ({
    id: plan.id,
    destination: `${plan.destination.city}, ${plan.destination.country}`,
    visitedYear: plan.status === 'completed' ? new Date(plan.endDate).getFullYear() : undefined,
    isFavorite: plan.isFavorite || false,
    duration: plan.duration,
    status: plan.status === 'completed' ? 'completed' as const : 'planned' as const
  }));

  // Loading state
  if (plansLoading) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects variant="subtle" />
        <Header />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  // Error state
  if (plansError) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects variant="subtle" />
        <Header />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <ErrorDisplay
            message="Failed to load travel plans"
            onRetry={() => refetchPlans()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Show selected plan detail */}
        {selectedPlan ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleBackToPlans}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Plans
              </Button>
              <h1 className="text-2xl font-bold text-white">{selectedPlan.name}</h1>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-white/10 border border-white/20">
                <TabsTrigger value="overview" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white text-white/60">Overview</TabsTrigger>
                <TabsTrigger value="itinerary" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white text-white/60">Itinerary</TabsTrigger>
                <TabsTrigger value="budget" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white text-white/60">Budget</TabsTrigger>
                <TabsTrigger value="bookings" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white text-white/60">Bookings</TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white text-white/60">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white">{selectedPlan.name}</h2>
                      <Badge variant={
                        selectedPlan.status === 'completed' ? 'secondary' :
                        selectedPlan.status === 'ongoing' ? 'default' :
                        selectedPlan.status === 'booked' ? 'outline' :
                        'secondary'
                      }>
                        {selectedPlan.status}
                      </Badge>
                    </div>
                    <p className="text-white/60">
                      {selectedPlan.destination.city}, {selectedPlan.destination.country}
                    </p>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-teal-400" />
                        <div>
                          <p className="text-sm text-white/60">Duration</p>
                          <p className="font-semibold text-white">{selectedPlan.duration} days</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-teal-400" />
                        <div>
                          <p className="text-sm text-white/60">Budget</p>
                          <p className="font-semibold text-white">
                            {selectedPlan.budget?.total ?
                              `${selectedPlan.budget.total} ${selectedPlan.budget.currency}` :
                              'Not set'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-teal-400" />
                        <div>
                          <p className="text-sm text-white/60">Travelers</p>
                          <p className="font-semibold text-white">{selectedPlan.travelers.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-teal-400" />
                        <div>
                          <p className="text-sm text-white/60">Activities</p>
                          <p className="font-semibold text-white">{selectedPlan.activities.length}</p>
                        </div>
                      </div>
                    </div>

                    {selectedPlan.description && (
                      <div>
                        <h3 className="font-semibold mb-2 text-white">Description</h3>
                        <p className="text-white/60">{selectedPlan.description}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="itinerary">
                <TravelItineraryBuilder
                  plan={selectedPlan}
                  onUpdate={(updatedPlan) => setSelectedPlan(updatedPlan)}
                />
              </TabsContent>

              <TabsContent value="budget">
                <TravelBudgetTracker
                  plan={selectedPlan}
                  onUpdate={(updatedPlan) => setSelectedPlan(updatedPlan)}
                />
              </TabsContent>

              <TabsContent value="bookings">
                <TravelBookingManager
                  plan={selectedPlan}
                  onUpdate={(updatedPlan) => setSelectedPlan(updatedPlan)}
                />
              </TabsContent>

              <TabsContent value="documents">
                <TravelDocumentManager
                  plan={selectedPlan}
                  onUpdate={(updatedPlan) => setSelectedPlan(updatedPlan)}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Main plans view */
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-teal-500/20 rounded-2xl">
                  <MapPin className="h-12 w-12 text-teal-400" />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Travel Planner
              </h1>

              <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
                Plan and manage your travels with AI-powered itineraries
              </p>

              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-lg px-8 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Travel Plan
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
              <div className="flex justify-center mb-8">
                <TabsList className="bg-white/10 border border-white/20">
                  <TabsTrigger value="plans" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white text-white/60">
                    My Plans ({totalPlans})
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white text-white/60">
                    Statistics
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="plans" className="space-y-6">
                {/* Search and Filter Bar */}
                <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Search & Filter</h3>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                    <Input
                      type="text"
                      placeholder="Search destinations or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">Filter by Status</label>
                      <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                        <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="booked">Booked</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">Sort By</label>
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                        <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Created" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startDate">Start Date</SelectItem>
                          <SelectItem value="created">Created</SelectItem>
                          <SelectItem value="budget">Budget</SelectItem>
                          <SelectItem value="duration">Duration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                {/* Travel Plans Grid */}
                {filteredPlans.length === 0 ? (
                  <Card className="p-12 bg-white/10 backdrop-blur-xl border border-white/20 text-center">
                    <MapPin className="h-16 w-16 mx-auto mb-4 text-white/40" />
                    <h3 className="text-xl font-semibold mb-2 text-white">
                      {travelPlans.length === 0 ? 'No travel plans yet' : 'No plans found'}
                    </h3>
                    <p className="text-white/60 mb-6">
                      {travelPlans.length === 0
                        ? 'Create your first travel plan to get started'
                        : 'Try adjusting your search or filters'
                      }
                    </p>
                    {travelPlans.length === 0 && (
                      <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Travel Plan
                      </Button>
                    )}
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlans.map((plan) => (
                      <TravelPlanCard
                        key={plan.id}
                        plan={plan}
                        onClick={() => handlePlanSelect(plan)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stats">
                {statsLoading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="large" />
                  </div>
                ) : statsError ? (
                  <ErrorDisplay message="Failed to load travel statistics" />
                ) : (
                  <TravelStats travelPlans={formattedStatsPlans} />
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Create Travel Plan Form Modal */}
        {showCreateForm && (
          <TravelPlanForm
            onSubmit={handleCreatePlan}
            onCancel={() => setShowCreateForm(false)}
            destinations={destinations || []}
            isSubmitting={createTravelPlanMutation.loading}
          />
        )}
      </div>
    </div>
  );
};

export default TravelPlannerPage;
