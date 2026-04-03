import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus,
  Clock,
  MapPin,
  DollarSign,
  Edit2,
  Trash2,
  GripVertical,
  Camera,
  Star,
  Save,
  X,
  Calendar,
  ActivityIcon as Activity
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import type { TravelPlan, TravelActivity } from '../../services/travelService';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface TravelItineraryBuilderProps {
  plan: TravelPlan;
  onUpdate: (updatedPlan: TravelPlan) => void;
  className?: string;
}

interface DayItinerary {
  day: number;
  date: string;
  activities: TravelActivity[];
}

const TravelItineraryBuilder: React.FC<TravelItineraryBuilderProps> = ({
  plan,
  onUpdate,
  className = ''
}) => {
  const { confirm } = useConfirm();
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [addingToDay, setAddingToDay] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate day itineraries from plan
  const generateDayItineraries = (): DayItinerary[] => {
    const days: DayItinerary[] = [];
    const startDate = new Date(plan.startDate);
    
    for (let i = 0; i < plan.duration; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayActivities = plan.activities
        .filter(activity => activity.scheduledDate && 
          new Date(activity.scheduledDate).toDateString() === currentDate.toDateString())
        .sort((a, b) => {
          if (!a.scheduledDate || !b.scheduledDate) return 0;
          return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
        });
      
      days.push({
        day: i + 1,
        date: currentDate.toISOString().split('T')[0],
        activities: dayActivities
      });
    }
    
    return days;
  };

  const [dayItineraries, setDayItineraries] = useState<DayItinerary[]>(generateDayItineraries());

  const getCategoryIcon = (category: TravelActivity['type']) => {
    switch (category) {
      case 'sightseeing': return <Camera className="h-4 w-4" />;
      case 'restaurant': return <Star className="h-4 w-4" />;
      case 'adventure': return <Activity className="h-4 w-4" />;
      case 'cultural': return <Star className="h-4 w-4" />;
      case 'shopping': return <Star className="h-4 w-4" />;
      case 'entertainment': return <Star className="h-4 w-4" />;
      case 'relaxation': return <Star className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: TravelActivity['type']) => {
    switch (category) {
      case 'sightseeing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'restaurant': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'adventure': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'cultural': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'shopping': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'entertainment': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'relaxation': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceDay = parseInt(result.source.droppableId);
    const destDay = parseInt(result.destination.droppableId);
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    // Create new day itineraries
    const newDayItineraries = [...dayItineraries];
    const sourceActivities = [...newDayItineraries[sourceDay].activities];
    const destActivities = sourceDay === destDay ? sourceActivities : [...newDayItineraries[destDay].activities];

    // Move the activity
    const [movedActivity] = sourceActivities.splice(sourceIndex, 1);
    destActivities.splice(destIndex, 0, movedActivity);

    // Update the activity's scheduled date
    const newDate = newDayItineraries[destDay].date;
    movedActivity.scheduledDate = new Date(newDate);

    // Update day itineraries
    newDayItineraries[sourceDay].activities = sourceActivities;
    newDayItineraries[destDay].activities = destActivities;

    setDayItineraries(newDayItineraries);

    // Update the plan
    const updatedActivities = newDayItineraries.flatMap(day => day.activities);
    const updatedPlan = { ...plan, activities: updatedActivities };
    onUpdate(updatedPlan);
  };

  const handleAddActivity = (dayIndex: number) => {
    setAddingToDay(dayIndex);
  };

  const handleSaveNewActivity = async (dayIndex: number, activityData: Partial<TravelActivity>) => {
    setIsLoading(true);
    
    try {
      const newActivity: TravelActivity = {
        id: `temp_${Date.now()}`, // Temporary ID
        planId: plan.id,
        name: activityData.name || 'New Activity',
        description: activityData.description || '',
        type: activityData.type || 'sightseeing',
        location: {
          name: activityData.location?.name || '',
          address: activityData.location?.address || '',
          coordinates: activityData.location?.coordinates
        },
        scheduledDate: new Date(dayItineraries[dayIndex].date),
        duration: activityData.duration || 2,
        cost: activityData.cost,
        bookingInfo: activityData.bookingInfo,
        rating: activityData.rating,
        status: 'planned',
        notes: activityData.notes,
        images: activityData.images || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to day itinerary
      const newDayItineraries = [...dayItineraries];
      newDayItineraries[dayIndex].activities.push(newActivity);
      setDayItineraries(newDayItineraries);

      // Update plan
      const updatedActivities = [...plan.activities, newActivity];
      const updatedPlan = { ...plan, activities: updatedActivities };
      onUpdate(updatedPlan);

      setAddingToDay(null);
    } catch (error) {
      console.error('Failed to add activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditActivity = (activityId: string) => {
    setEditingActivity(activityId);
  };

  const handleSaveActivity = async (activityId: string, updates: Partial<TravelActivity>) => {
    setIsLoading(true);
    
    try {
      // Update in day itineraries
      const newDayItineraries = dayItineraries.map(day => ({
        ...day,
        activities: day.activities.map(activity =>
          activity.id === activityId 
            ? { ...activity, ...updates, updatedAt: new Date().toISOString() }
            : activity
        )
      }));
      
      setDayItineraries(newDayItineraries);

      // Update plan
      const updatedActivities = plan.activities.map(activity =>
        activity.id === activityId 
          ? { ...activity, ...updates, updatedAt: new Date().toISOString() }
          : activity
      );
      const updatedPlan = { ...plan, activities: updatedActivities };
      onUpdate(updatedPlan);

      setEditingActivity(null);
    } catch (error) {
      console.error('Failed to update activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    const confirmed = await confirm({
      title: 'Delete Activity',
      message: 'Are you sure you want to delete this activity?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!confirmed) return;

    setIsLoading(true);

    try {
      // Remove from day itineraries
      const newDayItineraries = dayItineraries.map(day => ({
        ...day,
        activities: day.activities.filter(activity => activity.id !== activityId)
      }));

      setDayItineraries(newDayItineraries);

      // Update plan
      const updatedActivities = plan.activities.filter(activity => activity.id !== activityId);
      const updatedPlan = { ...plan, activities: updatedActivities };
      onUpdate(updatedPlan);
    } catch (error) {
      console.error('Failed to delete activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Itinerary Builder</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Drag and drop activities to organize your daily schedule
          </p>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-6">
          {dayItineraries.map((day, dayIndex) => (
            <Card key={day.day} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Day {day.day}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddActivity(dayIndex)}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Activity
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <Droppable droppableId={dayIndex.toString()}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-4 min-h-20 rounded transition-colors ${
                        snapshot.isDraggingOver ? 'bg-primary/5 border-2 border-dashed border-primary' : ''
                      }`}
                    >
                      {/* Add Activity Form */}
                      {addingToDay === dayIndex && (
                        <ActivityForm
                          onSave={(data) => handleSaveNewActivity(dayIndex, data)}
                          onCancel={() => setAddingToDay(null)}
                          isLoading={isLoading}
                        />
                      )}

                      {day.activities.length === 0 && addingToDay !== dayIndex ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No activities planned for this day</p>
                          <p className="text-xs">Add an activity or drag one here</p>
                        </div>
                      ) : (
                        day.activities.map((activity, activityIndex) => (
                          <Draggable
                            key={activity.id}
                            draggableId={activity.id}
                            index={activityIndex}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-white dark:bg-gray-800 border rounded p-4 transition-all ${
                                  snapshot.isDragging ? 'shadow-lg rotate-3 scale-105' : 'hover:shadow-md'
                                }`}
                              >
                                {editingActivity === activity.id ? (
                                  <ActivityForm
                                    initialData={activity}
                                    onSave={(data) => handleSaveActivity(activity.id, data)}
                                    onCancel={() => setEditingActivity(null)}
                                    isLoading={isLoading}
                                  />
                                ) : (
                                  <div className="flex items-start gap-4">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mt-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <h4 className="font-semibold text-lg">{activity.name}</h4>
                                          {activity.description && (
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                              {activity.description}
                                            </p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge className={getCategoryColor(activity.type)}>
                                            {getCategoryIcon(activity.type)}
                                            <span className="ml-1 capitalize">{activity.type}</span>
                                          </Badge>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        {activity.scheduledDate && (
                                          <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4 text-primary" />
                                            <span>
                                              {new Date(activity.scheduledDate).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                              })}
                                            </span>
                                          </div>
                                        )}
                                        
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-4 w-4 text-primary" />
                                          <span>{activity.duration}h duration</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-4 w-4 text-primary" />
                                          <span className="truncate">{activity.location.name}</span>
                                        </div>

                                        {activity.cost && (
                                          <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4 text-primary" />
                                            <span>
                                              {activity.cost.amount} {activity.cost.currency}
                                              {activity.cost.perPerson && ' per person'}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {activity.notes && (
                                        <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                                          <strong>Notes:</strong> {activity.notes}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditActivity(activity.id)}
                                        disabled={isLoading}
                                        className="h-8 w-8"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteActivity(activity.id)}
                                        disabled={isLoading}
                                        className="h-8 w-8 text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

// Activity Form Component
interface ActivityFormProps {
  initialData?: Partial<TravelActivity>;
  onSave: (data: Partial<TravelActivity>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  initialData,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'sightseeing' as TravelActivity['type'],
    locationName: initialData?.location?.name || '',
    locationAddress: initialData?.location?.address || '',
    scheduledTime: initialData?.scheduledDate 
      ? new Date(initialData.scheduledDate).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      : '',
    duration: initialData?.duration || 2,
    costAmount: initialData?.cost?.amount || 0,
    costCurrency: initialData?.cost?.currency || 'USD',
    costPerPerson: initialData?.cost?.perPerson || false,
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const activityData: Partial<TravelActivity> = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      location: {
        name: formData.locationName,
        address: formData.locationAddress
      },
      duration: formData.duration,
      cost: formData.costAmount > 0 ? {
        amount: formData.costAmount,
        currency: formData.costCurrency,
        perPerson: formData.costPerPerson
      } : undefined,
      notes: formData.notes
    };

    onSave(activityData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-2 border-dashed border-primary/50 rounded bg-primary/5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">
          {initialData ? 'Edit Activity' : 'Add New Activity'}
        </h4>
        {isLoading && <LoadingSpinner size="small" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="activity-name">Activity Name *</Label>
          <Input
            id="activity-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Visit Eiffel Tower"
            required
          />
        </div>

        <div>
          <Label htmlFor="activity-type">Category</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as TravelActivity['type'] }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sightseeing">Sightseeing</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="adventure">Adventure</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="relaxation">Relaxation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="activity-description">Description</Label>
        <Textarea
          id="activity-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the activity..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="activity-location">Location</Label>
          <Input
            id="activity-location"
            value={formData.locationName}
            onChange={(e) => setFormData(prev => ({ ...prev, locationName: e.target.value }))}
            placeholder="Location name"
          />
        </div>

        <div>
          <Label htmlFor="activity-address">Address</Label>
          <Input
            id="activity-address"
            value={formData.locationAddress}
            onChange={(e) => setFormData(prev => ({ ...prev, locationAddress: e.target.value }))}
            placeholder="Full address"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="activity-time">Time</Label>
          <Input
            id="activity-time"
            type="time"
            value={formData.scheduledTime}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="activity-duration">Duration (hours)</Label>
          <Input
            id="activity-duration"
            type="number"
            min="0.5"
            step="0.5"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseFloat(e.target.value) || 1 }))}
          />
        </div>

        <div>
          <Label htmlFor="activity-cost">Cost</Label>
          <Input
            id="activity-cost"
            type="number"
            min="0"
            step="0.01"
            value={formData.costAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, costAmount: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="activity-notes">Notes</Label>
        <Textarea
          id="activity-notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional notes..."
          rows={2}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-1" />
          {initialData ? 'Update' : 'Add'} Activity
        </Button>
      </div>
    </form>
  );
};

export default TravelItineraryBuilder;