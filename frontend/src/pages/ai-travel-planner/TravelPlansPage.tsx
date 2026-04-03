import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TravelPlansListPage from './TravelPlansListPage';
import TravelPlanDetailPage from './TravelPlanDetailPage';
import { useTravelPlans } from '../../hooks/useTravelPlans';
import type {
  TravelPlan,
  Activity,
  FilterState,
} from '../../types/ai-travel-planner';
import type { TravelPlanResponse } from '../../services/travelPlannerService';
import { toast } from 'sonner';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { useConfirmation } from '../../hooks/useConfirmation';

const TravelPlansPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<TravelPlan | null>(null);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [addingActivityDay, setAddingActivityDay] = useState<number | null>(null);
  const [aiResponse, setAiResponse] = useState<TravelPlanResponse | null>(null);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [travelStyle, setTravelStyle] = useState('balanced');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    filterTag: 'all',
    filterFavorites: 'all',
    sortBy: 'created',
  });

  // Use shared travel plans hook
  const { travelPlans, isLoading, error, updateTravelPlan, deleteTravelPlan, toggleFavorite, refreshPlans } = useTravelPlans();

  const confirmation = useConfirmation();

  // Check for preview mode on mount
  useEffect(() => {
    const isPreview = searchParams.get('preview') === 'true';
    
    if (isPreview) {
      const previewData = sessionStorage.getItem('aiTravelPlanPreview');
      if (previewData) {
        try {
          const { response, travelStyle: style } = JSON.parse(previewData);
          
          // Convert AI response to TravelPlan format for preview
          const previewPlan: TravelPlan = {
            id: `preview-${Date.now()}`,
            destination: response.data.destination,
            budget: response.data.budget,
            currency: response.data.currency,
            duration: response.data.duration,
            startDate: response.data.startDate,
            endDate: response.data.endDate,
            created: new Date().toISOString().split('T')[0],
            totalEstimatedCost: response.data.totalEstimatedCost,
            tags: response.data.tags,
            isFavorite: false,
            image: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80`,
            itinerary: response.data.itinerary,
            hotels: response.data.hotels,
          };
          
          setSelectedPlan(previewPlan);
          setAiResponse(response);
          setIsAIGenerated(true);
          setTravelStyle(style);
          
          // Clear the preview data
          sessionStorage.removeItem('aiTravelPlanPreview');
          
          // Remove preview param from URL
          window.history.replaceState({}, '', '/travel-planner');
        } catch (error) {
          console.error('Error loading preview data:', error);
        }
      }
    }
  }, [searchParams]);


  const handleSaveActivity = (dayIndex: number, activityId: string, updates: Partial<Activity>) => {
    if (!selectedPlan || !selectedPlan.itinerary || !selectedPlan.itinerary[dayIndex]) return;

    const updatedPlan = { ...selectedPlan };
    updatedPlan.itinerary[dayIndex].activities = updatedPlan.itinerary[dayIndex].activities.map(
      (activity) => (activity.id === activityId ? { ...activity, ...updates } : activity),
    );

    setSelectedPlan(updatedPlan);
    updateTravelPlan(selectedPlan.id, updatedPlan);
    setEditingActivity(null);
  };

  const handleDeleteActivity = (dayIndex: number, activityId: string) => {
    if (!selectedPlan || !selectedPlan.itinerary || !selectedPlan.itinerary[dayIndex]) return;

    const updatedPlan = { ...selectedPlan };
    updatedPlan.itinerary[dayIndex].activities = updatedPlan.itinerary[dayIndex].activities.filter(
      (activity) => activity.id !== activityId,
    );

    setSelectedPlan(updatedPlan);
    updateTravelPlan(selectedPlan.id, updatedPlan);
  };

  const handleEditActivity = (_dayIndex: number, activityId: string) => {
    setEditingActivity(activityId);
  };

  const handleAddActivity = (dayIndex: number) => {
    setAddingActivityDay(dayIndex);
  };

  const handleSaveNewActivity = (dayIndex: number, newActivity: Partial<Activity>) => {
    if (!selectedPlan || !selectedPlan.itinerary || !selectedPlan.itinerary[dayIndex]) return;

    const activity: Activity = {
      id: `${dayIndex + 1}-${Date.now()}`,
      time: newActivity.time || '10:00 AM',
      name: newActivity.name || 'New Activity',
      description: newActivity.description || '',
      location: newActivity.location || '',
      duration: newActivity.duration || '2 hours',
      cost: newActivity.cost || 0,
      category: newActivity.category || 'sightseeing',
      image: newActivity.image || '',
      mapUrl: newActivity.mapUrl || '',
    };

    const updatedPlan = { ...selectedPlan };
    if (!updatedPlan.itinerary[dayIndex].activities) {
      updatedPlan.itinerary[dayIndex].activities = [];
    }
    updatedPlan.itinerary[dayIndex].activities.push(activity);

    setSelectedPlan(updatedPlan);
    updateTravelPlan(selectedPlan.id, updatedPlan);
    setAddingActivityDay(null);
  };

  const handleToggleFavorite = (planId: string) => {
    toggleFavorite(planId);
  };

  const handleDeletePlan = async (planId: string) => {
    const confirmed = await confirmation.showConfirmation({
      title: 'Delete Travel Plan',
      message: 'Are you sure you want to delete this travel plan? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
      deleteTravelPlan(planId);
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
      }
      toast.success('Travel plan deleted successfully');
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
            <p className="text-white/60">Loading travel plans...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-300">{error}</p>
          <button
            onClick={refreshPlans}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Content */}
      {!selectedPlan ? (
        <TravelPlansListPage
          travelPlans={travelPlans}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSelectPlan={(plan) => {
            setSelectedPlan(plan);
            // Check if this is an AI-generated plan from metadata
            if (plan.metadata?.ai_generated) {
              setIsAIGenerated(true);
              setTravelStyle(plan.metadata.travel_style || 'balanced');
              // Reconstruct the AI response from metadata
              const reconstructedResponse = {
                success: true,
                data: {
                  id: plan.metadata.ai_plan_id || plan.id,
                  destination: plan.destination,
                  budget: plan.budget,
                  currency: plan.currency,
                  duration: plan.duration,
                  startDate: plan.startDate,
                  endDate: plan.endDate,
                  totalEstimatedCost: plan.metadata.total_estimated_cost || plan.totalEstimatedCost,
                  tags: plan.tags,
                  itinerary: plan.metadata.itinerary || plan.itinerary,
                  hotels: plan.metadata.hotels || plan.hotels
                },
                message: 'Plan loaded from saved data'
              };
              setAiResponse(reconstructedResponse);
            } else {
              setIsAIGenerated(false);
              setAiResponse(null);
            }
          }}
          onDeletePlan={handleDeletePlan}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : selectedPlan ? (
        selectedPlan.itinerary && selectedPlan.itinerary.length > 0 ? (
          <TravelPlanDetailPage
            plan={selectedPlan}
            editingActivity={editingActivity}
            addingActivityDay={addingActivityDay}
            onBack={() => {
              setSelectedPlan(null);
              refreshPlans(); // Refresh the list when going back
            }}
            onEditActivity={handleEditActivity}
            onSaveActivity={handleSaveActivity}
            onDeleteActivity={handleDeleteActivity}
            onAddActivity={handleAddActivity}
            onSaveNewActivity={handleSaveNewActivity}
            setAddingActivityDay={setAddingActivityDay}
            setEditingActivity={setEditingActivity}
            isAIGenerated={isAIGenerated}
            aiResponse={aiResponse}
            travelStyle={travelStyle}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-white/60">This travel plan doesn't have a detailed itinerary yet.</p>
            <button
              onClick={() => {
                setSelectedPlan(null);
                refreshPlans();
              }}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600"
            >
              Back to Plans
            </button>
          </div>
        )
      ) : null}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        icon={confirmation.icon}
      />
    </div>
  );
};

export default TravelPlansPage;