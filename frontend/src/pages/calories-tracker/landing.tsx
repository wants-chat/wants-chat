import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useCalories } from '../../contexts/CaloriesContext';
import Header from '../../components/landing/Header';
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
import BackgroundEffects from '../../components/ui/BackgroundEffects';

const CaloriesTrackerLanding: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { profile } = useCalories();

  const handleGetStarted = () => {
    // Check if user is authenticated and has a profile
    if (isAuthenticated && profile) {
      // Existing user - go to dashboard
      navigate('/calories-tracker/dashboard');
    } else {
      // New user - go to onboarding
      navigate('/calories-tracker/onboarding');
    }
  };

  const features = [
    {
      icon: mdiFoodApple,
      title: 'Food Diary',
      description: 'Track your daily meals with our comprehensive food database',
      color: 'from-emerald-500/10 to-green-500/10 border-emerald-200',
      iconColor: 'text-emerald-600'
    },
    {
      icon: mdiTarget,
      title: 'Goal Setting',
      description: 'Set personalized weight and nutrition goals with timeline tracking',
      color: 'from-primary/10 to-blue-500/10 border-primary/20',
      iconColor: 'text-primary'
    },
    {
      icon: mdiClockTimeFour,
      title: 'Intermittent Fasting',
      description: 'Multiple fasting plans with timer and progress tracking',
      color: 'from-purple-500/10 to-pink-500/10 border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      icon: mdiChartLine,
      title: 'Progress Analytics',
      description: 'Detailed charts and insights into your nutrition journey',
      color: 'from-orange-500/10 to-red-500/10 border-orange-200',
      iconColor: 'text-orange-600'
    },
    {
      icon: mdiScaleBalance,
      title: 'Weight Tracking',
      description: 'Monitor your weight changes with goal projections',
      color: 'from-blue-500/10 to-cyan-500/10 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      icon: mdiWater,
      title: 'Hydration',
      description: 'Track daily water intake with visual progress indicators',
      color: 'from-cyan-500/10 to-teal-500/10 border-cyan-200',
      iconColor: 'text-cyan-600'
    }
  ];

  const dietPlans = [
    {
      name: 'Balanced Diet',
      description: 'Well-rounded nutrition for overall health',
      macros: '50% Carbs, 20% Protein, 30% Fat',
      color: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200'
    },
    {
      name: 'Keto Diet',
      description: 'Low-carb, high-fat for rapid weight loss',
      macros: '5% Carbs, 25% Protein, 70% Fat',
      color: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
    },
    {
      name: 'Mediterranean',
      description: 'Heart-healthy with emphasis on whole foods',
      macros: '45% Carbs, 20% Protein, 35% Fat',
      color: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
    },
    {
      name: 'DASH Diet',
      description: 'Designed to help stop hypertension',
      macros: '55% Carbs, 18% Protein, 27% Fat',
      color: 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
    }
  ];

  const stats = [
    { label: 'Food Items', value: '50,000+', icon: mdiFoodApple },
    { label: 'Diet Plans', value: '7', icon: mdiTarget },
    { label: 'Success Rate', value: '89%', icon: mdiTrophy },
    { label: 'Active Users', value: '1M+', icon: mdiHeart }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-teal-500/20 rounded-2xl">
              <Icon path={mdiFoodApple} size={3} className="text-teal-400" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Calories Tracker
          </h1>

          <p className="text-xl text-white/60 mb-8 max-w-3xl mx-auto">
            Take control of your nutrition journey with comprehensive calorie tracking,
            personalized diet plans, and powerful analytics to reach your health goals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
            >
              Get Started
              <Icon path={mdiArrowRight} size={0.8} className="ml-2" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/calories-tracker/dashboard')}
            >
              View Dashboard
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center bg-white/10 backdrop-blur-xl border border-white/20 hover:shadow-lg transition-all duration-200">
              <Icon path={stat.icon} size={1.5} className="text-teal-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-white/60">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you track, analyze, and optimize your nutrition for lasting results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 hover:border-teal-400/50 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                onClick={handleGetStarted}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-lg">
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
              </Card>
            ))}
          </div>
        </div>

        {/* Diet Plans Preview */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Choose Your Diet Plan
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Select from scientifically-backed diet plans or create your own custom macronutrient distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dietPlans.map((plan, index) => (
              <Card
                key={index}
                className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 hover:border-teal-400/50 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => navigate('/calories-tracker/plan-selection')}
              >
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-white/60">
                    {plan.description}
                  </p>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs font-medium text-white/80">
                      {plan.macros}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/calories-tracker/plan-selection')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              View All Plans
              <Icon path={mdiArrowRight} size={0.8} className="ml-2" />
            </Button>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="p-8 bg-teal-500/20 border border-teal-400/30 text-center">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-teal-500/20 rounded-2xl">
                <Icon path={mdiTrophy} size={2} className="text-teal-400" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Health?
              </h2>
              <p className="text-lg text-white/60 mb-6 max-w-2xl mx-auto">
                Join thousands of users who have successfully reached their nutrition goals.
                Start your personalized journey today with our guided onboarding process.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                <Icon path={mdiFire} size={0.8} className="mr-2" />
                Start Your Journey
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/calories-tracker/recipes')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Icon path={mdiFoodApple} size={0.8} className="mr-2" />
                Browse Recipes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CaloriesTrackerLanding;