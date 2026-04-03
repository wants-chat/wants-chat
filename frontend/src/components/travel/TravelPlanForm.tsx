import React, { useState } from 'react';
import { X, MapPin, Calendar, DollarSign, Users, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import type { TravelPlan, Destination } from '../../services/travelService';

interface TravelPlanFormProps {
  onSubmit: (planData: Omit<TravelPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  destinations: Destination[];
  isSubmitting?: boolean;
  initialData?: Partial<TravelPlan>;
}

interface Traveler {
  name: string;
  email?: string;
  age?: number;
  relationship: string;
}

const TravelPlanForm: React.FC<TravelPlanFormProps> = ({
  onSubmit,
  onCancel,
  destinations,
  isSubmitting = false,
  initialData
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    destination: {
      city: initialData?.destination?.city || '',
      country: initialData?.destination?.country || '',
      coordinates: initialData?.destination?.coordinates || undefined
    },
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    duration: initialData?.duration || 1,
    budget: {
      total: initialData?.budget?.total || 0,
      currency: initialData?.budget?.currency || 'USD',
      spent: 0,
      categories: {
        accommodation: 0,
        transportation: 0,
        food: 0,
        activities: 0,
        shopping: 0,
        other: 0
      }
    },
    travelers: initialData?.travelers || [{ name: '', email: '', relationship: 'self' }] as Traveler[],
    status: initialData?.status || 'planning' as const,
    activities: [],
    accommodations: [],
    transportation: [],
    documents: [],
    notes: initialData?.notes || '',
    isPublic: initialData?.isPublic || false
  });

  const [destinationSearch, setDestinationSearch] = useState('');
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate duration when dates change
  const updateDuration = (startDate: string, endDate: string) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData(prev => ({ ...prev, duration: diffDays }));
    }
  };

  // Filter destinations based on search
  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    dest.country.toLowerCase().includes(destinationSearch.toLowerCase())
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required';
    }

    if (!formData.destination.city || !formData.destination.country) {
      newErrors.destination = 'Destination is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.budget.total < 0) {
      newErrors.budget = 'Budget cannot be negative';
    }

    if (formData.travelers.length === 0) {
      newErrors.travelers = 'At least one traveler is required';
    }

    // Validate travelers
    formData.travelers.forEach((traveler, index) => {
      if (!traveler.name.trim()) {
        newErrors[`traveler_${index}`] = 'Traveler name is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const planData: Omit<TravelPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate)
    };

    onSubmit(planData);
  };

  const handleDestinationSelect = (destination: Destination) => {
    setFormData(prev => ({
      ...prev,
      destination: {
        city: destination.name,
        country: destination.country,
        coordinates: destination.coordinates
      }
    }));
    setDestinationSearch(`${destination.name}, ${destination.country}`);
    setShowDestinationDropdown(false);
  };

  const addTraveler = () => {
    setFormData(prev => ({
      ...prev,
      travelers: [...prev.travelers, { name: '', email: '', relationship: 'family' }]
    }));
  };

  const removeTraveler = (index: number) => {
    if (formData.travelers.length > 1) {
      setFormData(prev => ({
        ...prev,
        travelers: prev.travelers.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTraveler = (index: number, field: keyof Traveler, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      travelers: prev.travelers.map((traveler, i) => 
        i === index ? { ...traveler, [field]: value } : traveler
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {initialData ? 'Edit Travel Plan' : 'Create New Travel Plan'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div>
                <Label htmlFor="name">Trip Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Summer vacation in Paris"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your trip..."
                  rows={3}
                />
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Destination</h3>
              
              <div className="relative">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  value={destinationSearch}
                  onChange={(e) => {
                    setDestinationSearch(e.target.value);
                    setShowDestinationDropdown(true);
                  }}
                  onFocus={() => setShowDestinationDropdown(true)}
                  placeholder="Search for a destination..."
                  className={errors.destination ? 'border-red-500' : ''}
                />
                {errors.destination && <p className="text-sm text-red-500 mt-1">{errors.destination}</p>}
                
                {showDestinationDropdown && filteredDestinations.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    {filteredDestinations.slice(0, 10).map((destination) => (
                      <button
                        key={destination.id}
                        type="button"
                        onClick={() => handleDestinationSelect(destination)}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{destination.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{destination.country}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {destination.costLevel}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dates and Duration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dates</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, startDate: e.target.value }));
                      updateDuration(e.target.value, formData.endDate);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.startDate ? 'border-red-500' : ''}
                  />
                  {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
                </div>
                
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, endDate: e.target.value }));
                      updateDuration(formData.startDate, e.target.value);
                    }}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className={errors.endDate ? 'border-red-500' : ''}
                  />
                  {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
                </div>
              </div>

              {formData.duration > 0 && (
                <div className="p-3 bg-primary/10 rounded">
                  <p className="text-sm">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Duration: {formData.duration} days
                  </p>
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Budget</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Total Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget.total}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      budget: { ...prev.budget, total: parseFloat(e.target.value) || 0 }
                    }))}
                    placeholder="0.00"
                    className={errors.budget ? 'border-red-500' : ''}
                  />
                  {errors.budget && <p className="text-sm text-red-500 mt-1">{errors.budget}</p>}
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.budget.currency} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      budget: { ...prev.budget, currency: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Travelers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Travelers</h3>
                <Button type="button" variant="outline" size="sm" onClick={addTraveler}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Traveler
                </Button>
              </div>
              
              {formData.travelers.map((traveler, index) => (
                <div key={index} className="p-4 border rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Traveler {index + 1}</span>
                    {formData.travelers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTraveler(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`traveler-name-${index}`}>Name *</Label>
                      <Input
                        id={`traveler-name-${index}`}
                        value={traveler.name}
                        onChange={(e) => updateTraveler(index, 'name', e.target.value)}
                        placeholder="Full name"
                        className={errors[`traveler_${index}`] ? 'border-red-500' : ''}
                      />
                      {errors[`traveler_${index}`] && (
                        <p className="text-sm text-red-500 mt-1">{errors[`traveler_${index}`]}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`traveler-email-${index}`}>Email</Label>
                      <Input
                        id={`traveler-email-${index}`}
                        type="email"
                        value={traveler.email || ''}
                        onChange={(e) => updateTraveler(index, 'email', e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`traveler-relationship-${index}`}>Relationship</Label>
                      <Select 
                        value={traveler.relationship} 
                        onValueChange={(value) => updateTraveler(index, 'relationship', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="self">Self</SelectItem>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="colleague">Colleague</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              {errors.travelers && <p className="text-sm text-red-500">{errors.travelers}</p>}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information about your trip..."
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    {initialData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {initialData ? 'Update Plan' : 'Create Plan'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelPlanForm;