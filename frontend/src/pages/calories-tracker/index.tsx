import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Button } from '../../components/ui/button';
import Header from '../../components/landing/Header';
import { useAuth } from '../../contexts/AuthContext';
import caloriesApi from '../../services/caloriesApi';
import Icon from '@mdi/react';
import {
  mdiFoodApple,
  mdiScaleBalance,
  mdiChartLine,
  mdiTarget,
  mdiWater,
  mdiClockTimeFour,
  mdiTrophy,
  mdiArrowRight,
  mdiHeart,
  mdiFire,
  mdiDumbbell,
  mdiCalendarCheck
} from '@mdi/js';

const CaloriesTrackerLanding: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Check if user has a calories tracker profile and redirect if they do
  useEffect(() => {
    const checkProfile = async () => {
      if (!isAuthenticated) {
        setHasProfile(false);
        setCheckingProfile(false);
        return;
      }

      try {
        await caloriesApi.getUserProfile();
        setHasProfile(true);
        // Automatically redirect to dashboard if user already has a profile
        navigate('/calories-tracker/dashboard');
      } catch (err: any) {
        // 404 means no profile exists
        setHasProfile(false);
        setCheckingProfile(false);
      }
    };

    checkProfile();
  }, [isAuthenticated, navigate]);

  // Show loading while checking profile
  if (isAuthenticated && checkingProfile) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleGetStarted = () => {
    // Navigate to onboarding for new users
    navigate('/calories-tracker/onboarding');
  };

  const features = [
    {
      icon: mdiFoodApple,
      title: 'Food Diary',
      description: 'Track your daily meals with our comprehensive food database'
    },
    {
      icon: mdiTarget,
      title: 'Goal Setting',
      description: 'Set personalized weight and nutrition goals with timeline tracking'
    },
    {
      icon: mdiClockTimeFour,
      title: 'Intermittent Fasting',
      description: 'Multiple fasting plans with timer and progress tracking'
    },
    {
      icon: mdiChartLine,
      title: 'Progress Analytics',
      description: 'Detailed charts and insights into your nutrition journey'
    },
    {
      icon: mdiScaleBalance,
      title: 'Weight Tracking',
      description: 'Monitor your weight changes with goal projections'
    },
    {
      icon: mdiWater,
      title: 'Hydration',
      description: 'Track daily water intake with visual progress indicators'
    }
  ];


  const stats = [
    { label: 'Food Items', value: '50,000+', icon: mdiFoodApple },
    { label: 'Daily Goals', value: 'Custom', icon: mdiTarget },
    { label: 'Success Rate', value: '89%', icon: mdiTrophy },
    { label: 'Active Users', value: '1M+', icon: mdiHeart }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl backdrop-blur-sm border border-white/20">
              <Icon path={mdiFoodApple} size={3} className="text-teal-400" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Calories Tracker
          </h1>

          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Take control of your nutrition journey with comprehensive calorie tracking,
            personalized diet plans, and powerful analytics to reach your health goals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              className="shadow-lg shadow-teal-500/30"
            >
              Get Started
              <Icon path={mdiArrowRight} size={0.8} className="ml-2" />
            </Button>

            {isAuthenticated && hasProfile && (
              <Button
                variant="outline"
                onClick={() => navigate('/calories-tracker/dashboard')}
              >
                View Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <GlassCard key={index} className="p-6 text-center">
              <Icon path={stat.icon} size={1.5} className="text-teal-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-white/60">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you track, analyze, and optimize your nutrition for lasting results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <GlassCard
                key={index}
                className="p-6 group cursor-pointer"
                onClick={() => navigate('/calories-tracker/onboarding')}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-lg">
                      <Icon path={feature.icon} size={1.2} className="text-teal-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-sm text-white/60">
                    {feature.description}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>


        {/* CTA Section */}
        <GlassCard className="p-8 text-center" glow gradient>
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 rounded-2xl">
                <Icon path={mdiTrophy} size={2} className="text-teal-400" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Health?
              </h2>
              <p className="text-lg text-white/70 mb-6 max-w-2xl mx-auto">
                Join thousands of users who have successfully reached their nutrition goals.
                Start your personalized journey today with our guided onboarding process.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/calories-tracker/onboarding')}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
              >
                <Icon path={mdiFire} size={0.8} className="mr-2" />
                Start Your Journey
              </Button>

              {isAuthenticated && hasProfile && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/calories-tracker/food-search')}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Icon path={mdiFoodApple} size={0.8} className="mr-2" />
                  Browse Foods
                </Button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default CaloriesTrackerLanding;