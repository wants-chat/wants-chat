// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Home, Check, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

const FitnessLanding: React.FC = () => {
  const navigate = useNavigate();

  const handleLocationSelect = (location: 'gym' | 'home') => {
    // Store the preference in localStorage
    localStorage.setItem('workoutLocation', location);
    localStorage.setItem('workoutMode', location); // Also store as mode for consistency

    // Check if user has completed onboarding
    const hasProfile = localStorage.getItem('fitnessProfile');
    if (hasProfile) {
      // Navigate to workout-plans with the selected mode
      navigate(`/fitness/workout-plans?mode=${location}`);
    } else {
      navigate('/fitness/onboarding');
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Fitness Tracker', icon: Dumbbell }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center p-4 min-h-[80vh]">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 rounded-full bg-teal-500/20 px-4 py-2 mb-6">
            <Sparkles className="h-5 w-5 text-teal-400" />
            <span className="text-sm font-medium text-teal-400">Let's Get Started</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white">
            Welcome to <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Fitness Tracker</span>
          </h1>
          <p className="text-xl text-white/60">
            Where do you prefer to workout?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Gym Option */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="inline-flex p-3 rounded-lg bg-blue-500/20 mb-6">
                <Dumbbell className="h-8 w-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-3 text-white">
                Gym Workouts
              </h2>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-white/80">
                  <Check className="h-4 w-4 text-teal-400 mr-2" />
                  Full equipment access
                </li>
                <li className="flex items-center text-white/80">
                  <Check className="h-4 w-4 text-teal-400 mr-2" />
                  Advanced training programs
                </li>
                <li className="flex items-center text-white/80">
                  <Check className="h-4 w-4 text-teal-400 mr-2" />
                  Heavy lifting routines
                </li>
                <li className="flex items-center text-white/80">
                  <Check className="h-4 w-4 text-teal-400 mr-2" />
                  Machine-based exercises
                </li>
              </ul>
              <Button
                onClick={() => handleLocationSelect('gym')}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
                size="lg"
              >
                Select Gym Workouts
              </Button>
            </div>
          </div>

          {/* Home Option */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="inline-flex p-3 rounded-lg bg-green-500/20 mb-6">
                <Home className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-3 text-white">
                Home Workouts
              </h2>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-white/80">
                  <Check className="h-4 w-4 text-teal-400 mr-2" />
                  No equipment needed
                </li>
                <li className="flex items-center text-white/80">
                  <Check className="h-4 w-4 text-teal-400 mr-2" />
                  Bodyweight exercises
                </li>
                <li className="flex items-center text-white/80">
                  <Check className="h-4 w-4 text-teal-400 mr-2" />
                  Flexible scheduling
                </li>
                <li className="flex items-center text-white/80">
                  <Check className="h-4 w-4 text-teal-400 mr-2" />
                  Minimal space required
                </li>
              </ul>
              <Button
                onClick={() => handleLocationSelect('home')}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
                size="lg"
              >
                Select Home Workouts
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/60">
            You can change this preference anytime in your profile settings
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default FitnessLanding;