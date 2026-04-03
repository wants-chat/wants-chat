import { AppBlueprint, Page } from '../../../../../interfaces/app-builder.types';

export function generateTourPackageFormPage(
  blueprint: AppBlueprint,
  page: Page,
): string {
  return `import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, X, Trash2, Image, Calendar, Save, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TourPackageForm {
  destination_id: string;
  name: string;
  description: string;
  short_description: string;
  duration_days: number;
  duration_nights: number;
  tour_type: string;
  difficulty_level: string;
  group_size_min: number;
  group_size_max: number;
  price: number;
  currency: string;
  price_includes: string[];
  price_excludes: string[];
  itinerary: { day: number; title: string; description: string; meals: string[] }[];
  highlights: string[];
  images: string[];
  cover_image: string;
  departure_dates: string[];
  is_featured: boolean;
  is_active: boolean;
}

interface Destination {
  id: string;
  name: string;
  country: string;
}

const tourTypes = ['adventure', 'cultural', 'beach', 'wildlife', 'city', 'cruise', 'safari', 'pilgrimage'];
const difficultyLevels = ['easy', 'moderate', 'challenging', 'difficult'];
const currencies = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'AUD'];
const mealOptions = ['breakfast', 'lunch', 'dinner'];

export default function TourPackageFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEditMode = !!id;

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'itinerary' | 'media'>('basic');

  const [form, setForm] = useState<TourPackageForm>({
    destination_id: '',
    name: '',
    description: '',
    short_description: '',
    duration_days: 1,
    duration_nights: 0,
    tour_type: '',
    difficulty_level: 'easy',
    group_size_min: 1,
    group_size_max: 20,
    price: 0,
    currency: 'USD',
    price_includes: [],
    price_excludes: [],
    itinerary: [],
    highlights: [],
    images: [],
    cover_image: '',
    departure_dates: [],
    is_featured: false,
    is_active: true,
  });

  // Temp states for adding items
  const [newHighlight, setNewHighlight] = useState('');
  const [newInclude, setNewInclude] = useState('');
  const [newExclude, setNewExclude] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDepartureDate, setNewDepartureDate] = useState('');

  const { data: destinations = [], isLoading: loadingDestinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const response = await api.get<any>('/destinations');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    retry: 1,
  });

  const { data: existingPackage, isLoading: loadingPackage } = useQuery({
    queryKey: ['tour-package', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/tour-packages/\${id}\`);
      return response?.data || response;
    },
    enabled: isEditMode && !!id,
    retry: 1,
  });

  // Update form when existing package is loaded
  useEffect(() => {
    if (existingPackage) {
      setForm({
        destination_id: existingPackage.destination_id || '',
        name: existingPackage.name || '',
        description: existingPackage.description || '',
        short_description: existingPackage.short_description || '',
        duration_days: existingPackage.duration_days || 1,
        duration_nights: existingPackage.duration_nights || 0,
        tour_type: existingPackage.tour_type || '',
        difficulty_level: existingPackage.difficulty_level || 'easy',
        group_size_min: existingPackage.group_size_min || 1,
        group_size_max: existingPackage.group_size_max || 20,
        price: existingPackage.price || 0,
        currency: existingPackage.currency || 'USD',
        price_includes: existingPackage.price_includes || [],
        price_excludes: existingPackage.price_excludes || [],
        itinerary: existingPackage.itinerary || [],
        highlights: existingPackage.highlights || [],
        images: existingPackage.images || [],
        cover_image: existingPackage.cover_image || '',
        departure_dates: existingPackage.departure_dates || [],
        is_featured: existingPackage.is_featured || false,
        is_active: existingPackage.is_active !== false,
      });
    }
  }, [existingPackage]);

  const loading = loadingDestinations || loadingPackage;

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.duration_days) {
      alert('Please fill in required fields: Name, Price, and Duration');
      return;
    }

    setSaving(true);
    try {
      const url = isEditMode
        ? \`\${import.meta.env.VITE_API_URL}/api/v1/tour_packages/\${id}\`
        : \`\${import.meta.env.VITE_API_URL}/api/v1/tour_packages\`;

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        alert(\`Tour package \${isEditMode ? 'updated' : 'created'} successfully!\`);
        navigate('/admin/tour-packages');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save tour package');
      }
    } catch (error) {
      console.error('Failed to save tour package:', error);
      alert('Failed to save tour package');
    } finally {
      setSaving(false);
    }
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setForm({ ...form, highlights: [...form.highlights, newHighlight.trim()] });
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    setForm({ ...form, highlights: form.highlights.filter((_, i) => i !== index) });
  };

  const addInclude = () => {
    if (newInclude.trim()) {
      setForm({ ...form, price_includes: [...form.price_includes, newInclude.trim()] });
      setNewInclude('');
    }
  };

  const removeInclude = (index: number) => {
    setForm({ ...form, price_includes: form.price_includes.filter((_, i) => i !== index) });
  };

  const addExclude = () => {
    if (newExclude.trim()) {
      setForm({ ...form, price_excludes: [...form.price_excludes, newExclude.trim()] });
      setNewExclude('');
    }
  };

  const removeExclude = (index: number) => {
    setForm({ ...form, price_excludes: form.price_excludes.filter((_, i) => i !== index) });
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setForm({ ...form, images: [...form.images, newImageUrl.trim()] });
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const addDepartureDate = () => {
    if (newDepartureDate && !form.departure_dates.includes(newDepartureDate)) {
      setForm({ ...form, departure_dates: [...form.departure_dates, newDepartureDate].sort() });
      setNewDepartureDate('');
    }
  };

  const removeDepartureDate = (index: number) => {
    setForm({ ...form, departure_dates: form.departure_dates.filter((_, i) => i !== index) });
  };

  const addItineraryDay = () => {
    const newDay = {
      day: form.itinerary.length + 1,
      title: '',
      description: '',
      meals: [],
    };
    setForm({ ...form, itinerary: [...form.itinerary, newDay] });
  };

  const updateItineraryDay = (index: number, field: string, value: any) => {
    const updated = [...form.itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, itinerary: updated });
  };

  const removeItineraryDay = (index: number) => {
    const updated = form.itinerary.filter((_, i) => i !== index);
    // Re-number days
    updated.forEach((day, i) => {
      day.day = i + 1;
    });
    setForm({ ...form, itinerary: updated });
  };

  const toggleMeal = (dayIndex: number, meal: string) => {
    const updated = [...form.itinerary];
    const meals = updated[dayIndex].meals || [];
    if (meals.includes(meal)) {
      updated[dayIndex].meals = meals.filter((m) => m !== meal);
    } else {
      updated[dayIndex].meals = [...meals, meal];
    }
    setForm({ ...form, itinerary: updated });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/20 backdrop-blur-xl px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">
              {isEditMode ? 'Edit Tour Package' : 'Create Tour Package'}
            </h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {(['basic', 'pricing', 'itinerary', 'media'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all \${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/5 text-gray-400'
              }\`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 py-4">
        {activeTab === 'basic' && (
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Tour Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., 5 Days Bali Adventure"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Destination</label>
              <select
                value={form.destination_id}
                onChange={(e) => setForm({ ...form, destination_id: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
              >
                <option value="">Select destination</option>
                {destinations.map((dest) => (
                  <option key={dest.id} value={dest.id}>{dest.name}, {dest.country}</option>
                ))}
              </select>
            </div>

            {/* Short Description */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Short Description</label>
              <input
                type="text"
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                placeholder="Brief summary for listings"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Full Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detailed tour description"
                rows={4}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 resize-none"
              />
            </div>

            {/* Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Days *</label>
                <input
                  type="number"
                  min="1"
                  value={form.duration_days}
                  onChange={(e) => setForm({ ...form, duration_days: parseInt(e.target.value) || 1 })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Nights</label>
                <input
                  type="number"
                  min="0"
                  value={form.duration_nights}
                  onChange={(e) => setForm({ ...form, duration_nights: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                />
              </div>
            </div>

            {/* Tour Type & Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Tour Type</label>
                <select
                  value={form.tour_type}
                  onChange={(e) => setForm({ ...form, tour_type: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">Select type</option>
                  {tourTypes.map((type) => (
                    <option key={type} value={type} className="capitalize">{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Difficulty</label>
                <select
                  value={form.difficulty_level}
                  onChange={(e) => setForm({ ...form, difficulty_level: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                >
                  {difficultyLevels.map((level) => (
                    <option key={level} value={level} className="capitalize">{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Group Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Min Group Size</label>
                <input
                  type="number"
                  min="1"
                  value={form.group_size_min}
                  onChange={(e) => setForm({ ...form, group_size_min: parseInt(e.target.value) || 1 })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Max Group Size</label>
                <input
                  type="number"
                  min="1"
                  value={form.group_size_max}
                  onChange={(e) => setForm({ ...form, group_size_max: parseInt(e.target.value) || 1 })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                />
              </div>
            </div>

            {/* Highlights */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Tour Highlights</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addHighlight()}
                  placeholder="Add a highlight"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                />
                <button
                  onClick={addHighlight}
                  className="px-4 py-3 bg-blue-500 text-white rounded-xl"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {form.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                    <span className="flex-1 text-gray-300 text-sm">{highlight}</span>
                    <button onClick={() => removeHighlight(index)} className="text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured & Active */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="w-5 h-5 rounded bg-white/10 border-white/20"
                />
                <span className="text-gray-300">Featured Tour</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-5 h-5 rounded bg-white/10 border-white/20"
                />
                <span className="text-gray-300">Active</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-4">
            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Price per Person *</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Includes */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Price Includes</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newInclude}
                  onChange={(e) => setNewInclude(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInclude()}
                  placeholder="e.g., Airport transfers"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                />
                <button onClick={addInclude} className="px-4 py-3 bg-green-500 text-white rounded-xl">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {form.price_includes.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 bg-green-500/10 px-3 py-2 rounded-lg">
                    <span className="flex-1 text-green-300 text-sm">{item}</span>
                    <button onClick={() => removeInclude(index)} className="text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Excludes */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Not Included</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newExclude}
                  onChange={(e) => setNewExclude(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addExclude()}
                  placeholder="e.g., International flights"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                />
                <button onClick={addExclude} className="px-4 py-3 bg-red-500 text-white rounded-xl">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {form.price_excludes.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg">
                    <span className="flex-1 text-red-300 text-sm">{item}</span>
                    <button onClick={() => removeExclude(index)} className="text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Departure Dates */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Departure Dates</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  value={newDepartureDate}
                  onChange={(e) => setNewDepartureDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                />
                <button onClick={addDepartureDate} className="px-4 py-3 bg-blue-500 text-white rounded-xl">
                  <Calendar className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.departure_dates.map((date, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                    <span className="text-gray-300 text-sm">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <button onClick={() => removeDepartureDate(index)} className="text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="space-y-4">
            <button
              onClick={addItineraryDay}
              className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-gray-400 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Day
            </button>

            {form.itinerary.map((day, index) => (
              <div key={index} className="bg-white/10 border border-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{day.day}</span>
                    </div>
                    <span className="text-white font-medium">Day {day.day}</span>
                  </div>
                  <button onClick={() => removeItineraryDay(index)} className="text-red-400">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                    placeholder="Day title (e.g., Arrival & City Tour)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-gray-500"
                  />
                  <textarea
                    value={day.description}
                    onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                    placeholder="Describe activities for this day"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-gray-500 resize-none"
                  />
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Meals Included</label>
                    <div className="flex gap-2">
                      {mealOptions.map((meal) => (
                        <button
                          key={meal}
                          onClick={() => toggleMeal(index, meal)}
                          className={\`px-3 py-1.5 rounded-lg text-sm capitalize transition-all \${
                            day.meals?.includes(meal)
                              ? 'bg-green-500 text-white'
                              : 'bg-white/5 text-gray-400'
                          }\`}
                        >
                          {meal}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {form.itinerary.length === 0 && (
              <div className="bg-white/10 border border-white/20 rounded-xl p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No itinerary added yet</p>
                <p className="text-gray-500 text-sm">Click "Add Day" to start building your tour itinerary</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-4">
            {/* Cover Image */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Cover Image URL</label>
              <input
                type="url"
                value={form.cover_image}
                onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
              />
              {form.cover_image && (
                <div className="mt-2 relative h-40 rounded-xl overflow-hidden">
                  <img src={form.cover_image} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Gallery Images */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Gallery Images</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addImage()}
                  placeholder="Image URL"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                />
                <button onClick={addImage} className="px-4 py-3 bg-blue-500 text-white rounded-xl">
                  <Image className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {form.images.map((img, index) => (
                  <div key={index} className="relative h-24 rounded-lg overflow-hidden group">
                    <img src={img} alt={\`Gallery \${index + 1}\`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {form.images.length === 0 && (
                <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-8 text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No images added</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
`;
}
