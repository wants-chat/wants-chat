import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Activity } from 'lucide-react';
import { api } from '../../lib/api';

interface HealthStatistics {
  meditationSessions: number;
  appointments: number;
  medications: number;
  maternalHealthRecords: number;
  caloriesBurned: number;
  hydrationLogs: number;
  nutritionGoals: number;
}

const HealthCaloriesSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'health' | 'calories'>('health');

  // Animated counters
  const [mothersCount, setMothersCount] = useState(0);
  const [meditationCount, setMeditationCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [scheduleCount, setScheduleCount] = useState(0);

  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [hydrationCount, setHydrationCount] = useState(0);
  const [goalsCount, setGoalsCount] = useState(0);

  // Fetch and animate numbers on mount
  useEffect(() => {
    const fetchHealthStats = async () => {
      try {
        const data: HealthStatistics = await api.request('/health/public/statistics');

        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        // Health stats targets from API
        const mothersTarget = data.maternalHealthRecords;
        const meditationTarget = data.meditationSessions;
        const appointmentsTarget = data.appointments;
        const scheduleTarget = data.medications;

        // Calories stats targets from API
        const caloriesTarget = data.caloriesBurned;
        const hydrationTarget = data.hydrationLogs;
        const goalsTarget = data.nutritionGoals;

        let currentStep = 0;

        const timer = setInterval(() => {
          currentStep++;
          const progress = currentStep / steps;

          setMothersCount(Math.floor(mothersTarget * progress));
          setMeditationCount(Math.floor(meditationTarget * progress));
          setAppointmentsCount(Math.floor(appointmentsTarget * progress));
          setScheduleCount(Math.floor(scheduleTarget * progress));

          setCaloriesBurned(Math.floor(caloriesTarget * progress));
          setHydrationCount(Math.floor(hydrationTarget * progress));
          setGoalsCount(Math.floor(goalsTarget * progress));

          if (currentStep >= steps) {
            clearInterval(timer);
          }
        }, interval);

        return () => clearInterval(timer);
      } catch (error) {
        console.error('Failed to fetch health statistics:', error);
        // Fallback to default values if API fails
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        const mothersTarget = 0;
        const meditationTarget = 0;
        const appointmentsTarget = 0;
        const scheduleTarget = 0;

        const caloriesTarget = 0;
        const hydrationTarget = 0;
        const goalsTarget = 0;

        let currentStep = 0;

        const timer = setInterval(() => {
          currentStep++;
          const progress = currentStep / steps;

          setMothersCount(Math.floor(mothersTarget * progress));
          setMeditationCount(Math.floor(meditationTarget * progress));
          setAppointmentsCount(Math.floor(appointmentsTarget * progress));
          setScheduleCount(Math.floor(scheduleTarget * progress));

          setCaloriesBurned(Math.floor(caloriesTarget * progress));
          setHydrationCount(Math.floor(hydrationTarget * progress));
          setGoalsCount(Math.floor(goalsTarget * progress));

          if (currentStep >= steps) {
            clearInterval(timer);
          }
        }, interval);

        return () => clearInterval(timer);
      }
    };

    fetchHealthStats();
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.section
      className="relative py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={sectionVariants}
    >
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]"
        animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px]"
        animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div className="text-center mb-8 sm:mb-12" variants={cardVariants}>
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4 sm:mb-6">
            <Activity className="h-4 w-4 text-teal-400" />
            <span className="text-xs sm:text-sm font-medium text-white">
              Track Your Wellness Journey
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-4">
            <span className="text-white">Health & Wellness</span>
            <span className="text-primary"> In One Place</span>
          </h2>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto px-4">
            Comprehensive health tracking and calorie management to help you achieve your wellness goals
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Left: Health Tracker */}
          <motion.div variants={cardVariants}>
            <Card className="overflow-hidden border border-white/20 shadow-xl h-full bg-white/10 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                    <span className="text-4xl">💙</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Health Tracker</h3>
                    <p className="text-sm text-white/60">Monitor your wellness journey</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Mothers Tracking */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">👩‍🍼</span>
                      <span className="text-xs font-medium text-white/70">Mothers Tracking</span>
                    </div>
                    <p className="text-3xl font-bold text-pink-400">{mothersCount.toLocaleString()}</p>
                    <p className="text-xs text-white/50 mt-1">Active this month</p>
                  </motion.div>

                  {/* Meditation Tracking */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🧘‍♀️</span>
                      <span className="text-xs font-medium text-white/70">Meditation Sessions</span>
                    </div>
                    <p className="text-3xl font-bold text-teal-400">{meditationCount.toLocaleString()}</p>
                    <p className="text-xs text-white/50 mt-1">Completed this week</p>
                  </motion.div>

                  {/* Doctor Appointments */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🩺</span>
                      <span className="text-xs font-medium text-white/70">Appointments</span>
                    </div>
                    <p className="text-3xl font-bold text-cyan-400">{appointmentsCount.toLocaleString()}</p>
                    <p className="text-xs text-white/50 mt-1">Scheduled this week</p>
                  </motion.div>

                  {/* Medication Schedule */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">💊</span>
                      <span className="text-xs font-medium text-white/70">On Schedule</span>
                    </div>
                    <p className="text-3xl font-bold text-green-400">{scheduleCount.toLocaleString()}</p>
                    <p className="text-xs text-white/50 mt-1">Medications taken on time</p>
                  </motion.div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      navigate('/health');
                    }
                  }}
                >
                  <span className="mr-2 text-xl">🏥</span>
                  Start Health Tracking
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Calories Tracker */}
          <motion.div variants={cardVariants}>
            <Card className="overflow-hidden border border-white/20 shadow-xl h-full bg-white/10 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                    <span className="text-4xl">🔥</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Calories Tracker</h3>
                    <p className="text-sm text-white/60">Manage your nutrition goals</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="space-y-4 mb-6">
                  {/* Calories Burned */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-xl bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🔥</span>
                        <span className="text-sm font-medium text-white/70">Calories Burned</span>
                      </div>
                      <span className="text-2xl">📈</span>
                    </div>
                    <p className="text-4xl font-bold text-orange-400 mb-1">
                      {caloriesBurned.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/50">Total this week across all users</p>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Hydration Logged */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">💧</span>
                        <span className="text-xs font-medium text-white/70">Hydration Logs</span>
                      </div>
                      <p className="text-3xl font-bold text-cyan-400">{hydrationCount.toLocaleString()}</p>
                      <p className="text-xs text-white/50 mt-1">Glasses logged this week</p>
                    </motion.div>

                    {/* New Goals Set */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🎯</span>
                        <span className="text-xs font-medium text-white/70">New Goals</span>
                      </div>
                      <p className="text-3xl font-bold text-amber-400">{goalsCount.toLocaleString()}</p>
                      <p className="text-xs text-white/50 mt-1">Users set new goals</p>
                    </motion.div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      navigate('/calories-tracker');
                    }
                  }}
                >
                  <span className="mr-2 text-xl">🍎</span>
                  Start Calories Tracking
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          variants={cardVariants}
          className="text-center"
        >
          <Card className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardContent className="p-6">
              <p className="text-white/80 mb-4">
                Join thousands of users tracking their health and wellness journey
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-cyan-500/10 border border-cyan-400 text-cyan-400 hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      navigate('/health');
                    }
                  }}
                >
                  🏥 Explore Health Tracker
                </Button>
                <Button
                  size="lg"
                  className="bg-orange-500/10 border border-orange-400 text-orange-400 hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      navigate('/calories-tracker');
                    }
                  }}
                >
                  🍎 Explore Calories Tracker
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HealthCaloriesSection;
