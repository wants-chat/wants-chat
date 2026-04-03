import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, DollarSign, Calendar, Sparkles, Search, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { travelPlannerService } from '../../services/travelPlannerService';
import type { TravelPlanRequest } from '../../services/travelPlannerService';

const TravelPlanGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [travelStyle, setTravelStyle] = useState<TravelPlanRequest['travelStyle']>('balanced');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDestinations, setShowDestinations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const popularDestinations = [
    { name: 'Paris, France', icon: '🇫🇷', description: 'City of Love' },
    { name: 'Tokyo, Japan', icon: '🇯🇵', description: 'Modern meets Traditional' },
    { name: 'Bali, Indonesia', icon: '🇮🇩', description: 'Tropical Paradise' },
    { name: 'New York, USA', icon: '🇺🇸', description: 'The Big Apple' },
    { name: 'Rome, Italy', icon: '🇮🇹', description: 'Eternal City' },
    { name: 'Dubai, UAE', icon: '🇦🇪', description: 'Luxury & Innovation' },
    { name: 'London, UK', icon: '🇬🇧', description: 'Historic Capital' },
    { name: 'Barcelona, Spain', icon: '🇪🇸', description: 'Art & Architecture' },
  ];

  const travelStyles = [
    { value: 'budget', label: 'Budget Traveler', icon: '💰', description: 'Maximize experiences, minimize costs' },
    { value: 'balanced', label: 'Balanced', icon: '⚖️', description: 'Mix of comfort and adventure' },
    { value: 'luxury', label: 'Luxury', icon: '💎', description: 'Premium experiences and comfort' },
    { value: 'adventure', label: 'Adventure', icon: '🏔️', description: 'Thrill-seeking and outdoor activities' },
    { value: 'cultural', label: 'Cultural', icon: '🏛️', description: 'Museums, history, and local experiences' },
    { value: 'relaxation', label: 'Relaxation', icon: '🏖️', description: 'Spa, beaches, and tranquility' },
  ];

  const filteredDestinations = popularDestinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleGeneratePlan = async () => {
    // Validation
    if (!destination || !budget || !duration || !startDate) {
      toast.error('Please fill in all required fields including travel date');
      return;
    }

    // Additional validation
    const budgetNum = parseInt(budget);
    const durationNum = parseInt(duration);
    const minBudget = durationNum * 100; // $100 per day minimum
    
    if (budgetNum < minBudget) {
      toast.error(`Budget is too low. Minimum $${minBudget} required for ${durationNum} days ($100/day)`);
      return;
    }

    const startDateObj = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    
    if (startDateObj <= today) {
      toast.error('Please select a future date for your trip');
      return;
    }

    setIsGenerating(true);
    
    try {
      const requestData: TravelPlanRequest = {
        destination,
        budget: budgetNum,
        duration: durationNum,
        startDate,
        travelStyle,
      };

      console.log('Sending travel plan request:', requestData);

      // Call the real API
      const response = await travelPlannerService.generateTravelPlan(requestData);

      if (response.success && response.data) {
        console.log('Generated travel plan:', response.data);
        
        // Store the AI response temporarily in sessionStorage for preview
        sessionStorage.setItem('aiTravelPlanPreview', JSON.stringify({
          response,
          travelStyle,
          generatedAt: new Date().toISOString()
        }));
        
        // Navigate to travel planner to preview the plan
        navigate('/travel-planner?preview=true');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Travel plan generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate travel plan. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/travel-planner')}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Generate AI Travel Plan
            </h1>
            <p className="text-white/60">Let AI create your perfect itinerary</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
          <Sparkles className="h-5 w-5 text-teal-400" />
          <span className="text-sm text-teal-300">Powered by AI</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white flex items-center justify-center font-semibold">
              1
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Destination</p>
              <p className="text-xs text-white/60">Where to go</p>
            </div>
          </div>
          <div className="h-0.5 w-24 bg-white/20"></div>
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-xl ${budget ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/10 text-white/40'} flex items-center justify-center font-semibold`}>
              2
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Budget</p>
              <p className="text-xs text-white/60">How much</p>
            </div>
          </div>
          <div className="h-0.5 w-24 bg-white/20"></div>
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-xl ${duration ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/10 text-white/40'} flex items-center justify-center font-semibold`}>
              3
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Duration</p>
              <p className="text-xs text-white/60">How long</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Destination Selection */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 border-l-4 border-l-teal-500">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mr-3">
              <MapPin className="h-5 w-5 text-teal-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Select Destination</h2>
          </div>

          <div className="relative">
            <input
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setSearchQuery(e.target.value);
                setShowDestinations(true);
              }}
              onFocus={() => setShowDestinations(true)}
              placeholder="Search or select a destination..."
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <Search className="absolute right-3 top-3.5 h-5 w-5 text-white/40" />
          </div>

          {showDestinations && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {filteredDestinations.map((dest) => (
                <button
                  key={dest.name}
                  onClick={() => {
                    setDestination(dest.name);
                    setShowDestinations(false);
                  }}
                  className={`p-3 rounded-xl border ${
                    destination === dest.name
                      ? 'border-teal-500 bg-teal-500/20'
                      : 'border-white/20 bg-white/5 hover:border-teal-500/50 hover:bg-white/10'
                  } transition-all text-left`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{dest.icon}</span>
                    <div>
                      <p className="font-medium text-white">{dest.name}</p>
                      <p className="text-xs text-white/60">{dest.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Budget Input */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 border-l-4 border-l-teal-500">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mr-3">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Set Your Budget</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Total Budget (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-white/60">$</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Enter your budget..."
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Budget Suggestions */}
            <div className="flex flex-wrap gap-2">
              {['500', '1000', '2000', '5000', '10000'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBudget(amount)}
                  className={`px-4 py-2 rounded-xl ${
                    budget === amount
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  } transition-colors`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Duration and Date Input */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 border-l-4 border-l-teal-500">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mr-3">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Trip Duration & Dates</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Number of Days
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="How many days?"
                  min="1"
                  max="30"
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Duration Suggestions */}
            <div className="flex flex-wrap gap-2">
              {[
                { days: '3', label: 'Weekend' },
                { days: '5', label: '5 Days' },
                { days: '7', label: '1 Week' },
                { days: '10', label: '10 Days' },
                { days: '14', label: '2 Weeks' },
              ].map((option) => (
                <button
                  key={option.days}
                  onClick={() => setDuration(option.days)}
                  className={`px-4 py-2 rounded-xl ${
                    duration === option.days
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  } transition-colors`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Date Info Display */}
            {startDate && duration && (
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
                <div className="flex items-center text-teal-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    Trip: {new Date(startDate).toLocaleDateString()} - {
                      new Date(new Date(startDate).getTime() + (parseInt(duration) - 1) * 24 * 60 * 60 * 1000).toLocaleDateString()
                    } ({duration} days)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Travel Style */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 border-l-4 border-l-teal-500">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mr-3">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Travel Style</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {travelStyles.map((style) => (
              <button
                key={style.value}
                onClick={() => setTravelStyle(style.value as TravelPlanRequest['travelStyle'])}
                className={`p-4 rounded-xl border ${
                  travelStyle === style.value
                    ? 'border-teal-500 bg-teal-500/20'
                    : 'border-white/20 bg-white/5 hover:border-teal-500/50 hover:bg-white/10'
                } transition-all text-center`}
              >
                <span className="text-2xl block mb-2">{style.icon}</span>
                <p className="font-medium text-white text-sm">{style.label}</p>
                <p className="text-xs text-white/60 mt-1">{style.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleGeneratePlan}
            disabled={!destination || !budget || !duration || !startDate || isGenerating}
            className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-3 shadow-lg shadow-teal-500/25"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>AI is creating your travel plan... This may take 5-15 seconds</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Generate AI Travel Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelPlanGeneratorPage;