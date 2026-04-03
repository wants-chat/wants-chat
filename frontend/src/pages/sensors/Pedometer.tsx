import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Flame, Target, Calendar } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface DayStats {
  day: string;
  steps: number;
}

const Pedometer: React.FC = () => {
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [dailyGoal] = useState(10000);
  const [calories, setCalories] = useState(0);
  const [distance, setDistance] = useState(0);
  const [weeklyData, setWeeklyData] = useState<DayStats[]>([
    { day: 'Mon', steps: 7500 },
    { day: 'Tue', steps: 9200 },
    { day: 'Wed', steps: 8100 },
    { day: 'Thu', steps: 10500 },
    { day: 'Fri', steps: 6800 },
    { day: 'Sat', steps: 12000 },
    { day: 'Sun', steps: steps },
  ]);

  const progress = Math.min((steps / dailyGoal) * 100, 100);

  useEffect(() => {
    // Check if device motion is supported
    if (typeof DeviceMotionEvent !== 'undefined') {
      if (isTracking) {
        const handleMotion = (event: DeviceMotionEvent) => {
          const acceleration = event.accelerationIncludingGravity;
          if (acceleration && (Math.abs(acceleration.x || 0) > 1 || Math.abs(acceleration.y || 0) > 1)) {
            setSteps(prev => {
              const newSteps = prev + 1;
              // Calculate calories (roughly 0.04 per step)
              setCalories(Math.round(newSteps * 0.04));
              // Calculate distance (roughly 0.8m per step)
              setDistance(Math.round((newSteps * 0.8) / 1000 * 100) / 100);
              return newSteps;
            });
          }
        };

        window.addEventListener('devicemotion', handleMotion);
        return () => window.removeEventListener('devicemotion', handleMotion);
      }
    }
  }, [isTracking]);

  useEffect(() => {
    // Update weekly data when steps change
    setWeeklyData(prev => {
      const newData = [...prev];
      newData[6] = { day: 'Sun', steps };
      return newData;
    });
  }, [steps]);

  const maxWeeklySteps = Math.max(...weeklyData.map(d => d.steps), dailyGoal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      <BackgroundEffects variant="subtle" />
      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-10 h-10 text-cyan-400" />
            Pedometer
          </h1>
          <p className="text-teal-200">Track your daily steps and reach your fitness goals</p>
        </motion.div>

        {/* Main Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 backdrop-blur-xl border border-teal-400/30 rounded-2xl p-8 mb-6 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-6">
            {/* Circular Progress */}
            <div className="relative w-64 h-64 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  stroke="rgba(20, 184, 166, 0.2)"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  stroke="url(#gradient)"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 112}`}
                  strokeDashoffset={`${2 * Math.PI * 112 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold text-white mb-2">{steps.toLocaleString()}</div>
                <div className="text-teal-200 text-lg">steps</div>
                <div className="text-teal-400 text-sm mt-1">{progress.toFixed(0)}% of goal</div>
              </div>
            </div>

            {/* Control Button */}
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                isTracking
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
              } shadow-lg hover:shadow-xl transform hover:scale-105`}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-teal-400" />
                <span className="text-teal-200 text-sm">Daily Goal</span>
              </div>
              <div className="text-3xl font-bold text-white">{dailyGoal.toLocaleString()}</div>
              <div className="text-teal-400 text-xs mt-1">steps</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-teal-200 text-sm">Calories Burned</span>
              </div>
              <div className="text-3xl font-bold text-white">{calories}</div>
              <div className="text-teal-400 text-xs mt-1">kcal</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span className="text-teal-200 text-sm">Distance</span>
              </div>
              <div className="text-3xl font-bold text-white">{distance}</div>
              <div className="text-teal-400 text-xs mt-1">km</div>
            </div>
          </div>
        </motion.div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 backdrop-blur-xl border border-teal-400/30 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Weekly Progress</h2>
          </div>

          <div className="flex items-end justify-between gap-4 h-64">
            {weeklyData.map((day, index) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative flex-1 w-full flex items-end justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.steps / maxWeeklySteps) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`w-full rounded-t-lg ${
                      day.steps >= dailyGoal
                        ? 'bg-gradient-to-t from-teal-500 to-cyan-400'
                        : 'bg-gradient-to-t from-teal-700 to-cyan-600'
                    } relative group cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {day.steps.toLocaleString()} steps
                    </div>
                  </motion.div>
                </div>
                <div className="text-teal-200 text-sm font-medium">{day.day}</div>
              </div>
            ))}
          </div>

          {/* Goal Line */}
          <div className="relative mt-4 pt-4 border-t border-teal-400/20">
            <div className="flex items-center justify-between text-sm text-teal-300">
              <span>Goal: {dailyGoal.toLocaleString()} steps</span>
              <span>Avg: {Math.round(weeklyData.reduce((acc, d) => acc + d.steps, 0) / 7).toLocaleString()} steps</span>
            </div>
          </div>
        </motion.div>

        {/* Device Support Info */}
        {typeof DeviceMotionEvent === 'undefined' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm"
          >
            <p className="text-yellow-200 text-sm">
              <strong>Note:</strong> Your device may not support motion detection. Step counting requires a device with motion sensors (accelerometer).
              The tracking feature uses simulated data for demonstration purposes.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Pedometer;
