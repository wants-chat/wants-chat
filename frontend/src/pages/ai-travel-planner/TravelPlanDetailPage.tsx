import React, { useState } from 'react';
import { Hotel, Map, Save, Edit as EditIcon, Favorite, FavoriteBorder } from '@mui/icons-material';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import TravelPlanDetailEnhanced from '../../components/travel/TravelPlanDetailEnhanced';
import PlanDetailHeader from '../../components/ai-travel-planner/PlanDetailHeader';
import HotelCard from '../../components/ai-travel-planner/HotelCard';
import DayItinerary from '../../components/ai-travel-planner/DayItinerary';
import type { TravelPlan, Activity } from '../../types/ai-travel-planner';
import { travelPlannerService } from '../../services/travelPlannerService';
import type { TravelPlanResponse } from '../../services/travelPlannerService';
import { toast } from '../../components/ui/toast';

interface TravelPlanDetailPageProps {
  plan: TravelPlan;
  editingActivity: string | null;
  addingActivityDay: number | null;
  onBack: () => void;
  onEditActivity: (dayIndex: number, activityId: string) => void;
  onSaveActivity: (dayIndex: number, activityId: string, updates: Partial<Activity>) => void;
  onDeleteActivity: (dayIndex: number, activityId: string) => void;
  onAddActivity: (dayIndex: number) => void;
  onSaveNewActivity: (dayIndex: number, newActivity: Partial<Activity>) => void;
  setAddingActivityDay: (day: number | null) => void;
  setEditingActivity: (id: string | null) => void;
  isAIGenerated?: boolean;
  aiResponse?: TravelPlanResponse | null;
  travelStyle?: string;
}

const TravelPlanDetailPage: React.FC<TravelPlanDetailPageProps> = ({
  plan,
  editingActivity,
  addingActivityDay,
  onBack,
  onEditActivity,
  onSaveActivity,
  onDeleteActivity,
  onAddActivity,
  onSaveNewActivity,
  setAddingActivityDay,
  setEditingActivity,
  isAIGenerated = false,
  aiResponse,
  travelStyle = 'balanced'
}) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);
  const [isAIFavorite, setIsAIFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  
  const handleSavePlan = async () => {
    // Check if this plan is already saved
    if (plan.id && !plan.id.startsWith('preview-')) {
      toast.info('This plan is already saved!');
      return;
    }
    
    if (!aiResponse) {
      console.error('No AI response data available to save');
      return;
    }

    setIsSaving(true);
    try {
      const savedPlan = await travelPlannerService.saveAIGeneratedPlan(aiResponse, travelStyle);
      console.log('Travel plan saved successfully:', savedPlan);
      
      // Show success message
      toast.success('Travel plan saved successfully!');
      
      // Navigate to the plans list
      navigate('/travel-planner');
    } catch (error) {
      console.error('Failed to save travel plan:', error);
      toast.error('Failed to save travel plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPlan = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      toast.info('You can now edit the plan details. Click "Add Activity" to add new activities or delete existing ones.');
    }
  };
  
  const handleSaveEdits = async () => {
    setIsSaving(true);
    try {
      // If it's a saved plan, update it
      if (plan.id && !plan.id.startsWith('preview-')) {
        // Create an update object with only the properties the backend accepts
        // The backend expects fields matching UpdateTravelPlanDto (partial of CreateTravelPlanDto)
        const updateData = {
          tags: plan.tags,
          metadata: {
            ...plan.metadata,
            itinerary: plan.itinerary,
            hotels: plan.hotels,
            total_estimated_cost: plan.totalEstimatedCost
          }
        };
        
        await travelPlannerService.updateTravelPlan(plan.id, updateData);
        toast.success('Changes saved successfully!');
      } else if (aiResponse) {
        // If it's a preview, save as new
        const savedPlan = await travelPlannerService.saveAIGeneratedPlan(aiResponse, travelStyle);
        toast.success('Travel plan saved successfully!');
        navigate('/travel-planner');
        return;
      }
      
      setHasEdits(false);
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAIFavorite = async () => {
    if (!isAIGenerated || !aiResponse?.data?.id) return;
    
    setTogglingFavorite(true);
    try {
      const result = await travelPlannerService.toggleAIFavorite(
        aiResponse.data.id, 
        !isAIFavorite
      );
      
      setIsAIFavorite(result.is_favourite);
      toast.success(result.message);
    } catch (error) {
      console.error('Failed to toggle AI favorite:', error);
      toast.error('Failed to update favorite status');
    } finally {
      setTogglingFavorite(false);
    }
  };

  return (
    <div>
      {/* Plan Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-sm sm:text-base text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
            size="sm"
          >
            ← Back to Plans
          </Button>

          {isAIGenerated && (
            <div className="flex gap-2">
              {/* Only show favorite button for saved plans (not preview plans) */}
              {plan.id && !plan.id.startsWith('preview-') && (
                <Button
                  variant="outline"
                  onClick={handleToggleAIFavorite}
                  disabled={togglingFavorite}
                  className="text-sm sm:text-base bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                  size="sm"
                >
                  {togglingFavorite ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                  ) : isAIFavorite ? (
                    <Favorite className="h-4 w-4 mr-1 text-red-500" />
                  ) : (
                    <FavoriteBorder className="h-4 w-4 mr-1" />
                  )}
                  {isAIFavorite ? 'Favorited' : 'Add to Favorites'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleEditPlan}
                className="text-sm sm:text-base bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                size="sm"
              >
                <EditIcon className="h-4 w-4 mr-1" />
                {isEditMode ? 'Done Editing' : 'Edit Plan'}
              </Button>
              {isEditMode && hasEdits && (
                <Button
                  variant="default"
                  onClick={handleSaveEdits}
                  disabled={isSaving}
                  className="text-sm sm:text-base bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl"
                  size="sm"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
              {(!plan.id || plan.id.startsWith('preview-')) && (
                <Button
                  variant="default"
                  onClick={handleSavePlan}
                  disabled={isSaving}
                  className="text-sm sm:text-base bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl"
                  size="sm"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save Plan
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Map and Expense Tracking */}
        <TravelPlanDetailEnhanced plan={plan} />

        {/* Plan Details Header */}
        <PlanDetailHeader plan={plan} />

        {/* Show edit mode indicator */}
        {isEditMode && (
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-3 mb-4 mt-4">
            <p className="text-sm text-teal-300">
              Edit mode is active. You can add new activities or delete existing ones.
            </p>
          </div>
        )}
      </div>

      {/* Hotel Recommendations */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2 text-white">
          <Hotel className="h-5 w-5 sm:h-6 sm:w-6 text-teal-400" />
          Recommended Hotels
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {(plan.hotels || []).map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </div>

      {/* Itinerary */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2 text-white">
          <Map className="h-5 w-5 sm:h-6 sm:w-6 text-teal-400" />
          Daily Itinerary
        </h2>

        {(plan.itinerary || []).map((day, dayIndex) => (
          <DayItinerary
            key={day.day}
            day={day}
            dayIndex={dayIndex}
            editingActivity={editingActivity}
            addingActivityDay={addingActivityDay}
            onSaveActivity={(dayIndex, activityId, updates) => {
              setHasEdits(true);
              onSaveActivity(dayIndex, activityId, updates);
            }}
            onDeleteActivity={(dayIndex, activityId) => {
              setHasEdits(true);
              onDeleteActivity(dayIndex, activityId);
            }}
            onAddActivity={(dayIndex) => {
              if (isEditMode) {
                setHasEdits(true);
              }
              onAddActivity(dayIndex);
            }}
            onSaveNewActivity={(dayIndex, newActivity) => {
              setHasEdits(true);
              onSaveNewActivity(dayIndex, newActivity);
            }}
            onCancelAddActivity={() => setAddingActivityDay(null)}
            setEditingActivity={setEditingActivity}
          />
        ))}
      </div>
    </div>
  );
};

export default TravelPlanDetailPage;