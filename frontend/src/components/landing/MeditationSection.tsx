import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import CompactBMICalculator from './CompactBMICalculator';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TimerIcon from '@mui/icons-material/Timer';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface MeditationProgram {
  id: string;
  name: string;
  description: string;
  instructor: string;
  difficulty: string;
  durationDays: number;
  sessionsCount: number;
  totalDurationMinutes: number;
  category: string;
  imageUrl: string;
  rating: number;
  enrollmentCount: number;
}

interface MeditationStats {
  totalPrograms: number;
  totalSessions: number;
  totalDurationMinutes: number;
  totalEnrollments: number;
}

const MeditationSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [programs, setPrograms] = useState<MeditationProgram[]>([]);
  const [stats, setStats] = useState<MeditationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch meditation programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await api.request('/public/meditation/programs?limit=10');
        setPrograms(data);
      } catch (error) {
        console.error('Failed to fetch programs:', error);
        setPrograms([]);
      }
    };

    const fetchStats = async () => {
      try {
        const data = await api.request('/public/meditation/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({
          totalPrograms: 0,
          totalSessions: 0,
          totalDurationMinutes: 0,
          totalEnrollments: 0
        });
      }
    };

    Promise.all([fetchPrograms(), fetchStats()]).finally(() => setLoading(false));
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (programs.length === 0) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % programs.length);
      }, 4000);
    };

    startAutoPlay();

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [programs.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? programs.length - 1 : prev - 1));
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % programs.length);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const getDefaultImage = (category: string) => {
    const images = {
      mindfulness: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=400&fit=crop&q=80',
      sleep: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=500&h=400&fit=crop&q=80',
      stress: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=500&h=400&fit=crop&q=80',
      focus: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500&h=400&fit=crop&q=80',
      default: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=500&h=400&fit=crop&q=80'
    };
    return images[category as keyof typeof images] || images.default;
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
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
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
          variants={cardVariants}
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4 sm:mb-6">
            <SelfImprovementIcon className="h-4 w-4 text-teal-400" />
            <span className="text-xs sm:text-sm font-medium text-white">Health & Wellness</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-4">
            <span className="text-white">Mindfulness &</span>
            <span className="text-teal-400"> Meditation</span>
          </h2>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto px-4">
            Find your inner peace with guided meditation sessions and track your fitness goals
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Meditation Series Carousel */}
          <motion.div variants={cardVariants} className="space-y-4">
            <Card className="shadow-2xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl hover:shadow-teal-500/20 transition-all duration-300">
              <div className="p-4 border-b border-white/20 bg-white/10 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg shadow-md">
                      <SelfImprovementIcon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-white">Meditation Series</h3>
                  </div>
                  <button
                    className="text-xs text-teal-400 font-semibold flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login');
                      } else {
                        navigate('/meditation/series');
                      }
                    }}
                  >
                    View All
                    <span className="text-sm">→</span>
                  </button>
                </div>
              </div>

              {/* Carousel */}
              <div className="relative">
                {programs.length > 0 ? (
                  <>
                    <div className="overflow-hidden">
                      <motion.div
                        className="flex transition-transform duration-300"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                      >
                        {programs.map((program) => (
                          <div key={program.id} className="min-w-full p-4">
                            <div className="space-y-3">
                              {/* Program Image */}
                              <div className="relative h-40 rounded-xl overflow-hidden shadow-xl border-2 border-teal-200 dark:border-teal-800 group">
                                <img
                                  src={program.imageUrl || `https://source.unsplash.com/500x400/?meditation,${program.category || 'zen'}`}
                                  alt={program.name}
                                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    const imageIndex = program.id ? Math.abs(program.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 5 : 0;
                                    const fallbackImages = [
                                      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=400&fit=crop&q=80',
                                      'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=500&h=400&fit=crop&q=80',
                                      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=500&h=400&fit=crop&q=80',
                                      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500&h=400&fit=crop&q=80',
                                      'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=500&h=400&fit=crop&q=80'
                                    ];
                                    target.src = fallbackImages[imageIndex];
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute top-2 right-2">
                                  <span className="px-2 py-1 bg-gradient-to-r from-teal-500 to-pink-500 text-white rounded-full text-xs font-bold capitalize shadow-lg">
                                    {program.difficulty}
                                  </span>
                                </div>
                              </div>

                              {/* Program Info */}
                              <div className="bg-white/10 backdrop-blur-xl rounded-lg p-3 border border-white/20">
                                <h4 className="font-bold text-base mb-1 text-white">{program.name}</h4>
                                <p className="text-xs text-white/60 line-clamp-2 mb-2">
                                  {program.description}
                                </p>
                                {program.instructor && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <span>👤</span>
                                    <span className="font-semibold text-white/80">{program.instructor}</span>
                                  </div>
                                )}
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl p-2 rounded-lg border border-white/20">
                                  <PlayCircleOutlineIcon className="h-4 w-4 text-teal-400" />
                                  <div>
                                    <p className="text-xs text-white/60">Sessions</p>
                                    <p className="font-bold text-sm text-white">{program.sessionsCount}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl p-2 rounded-lg border border-white/20">
                                  <TimerIcon className="h-4 w-4 text-cyan-400" />
                                  <div>
                                    <p className="text-xs text-white/60">Duration</p>
                                    <p className="font-bold text-sm text-white">{program.totalDurationMinutes} min</p>
                                  </div>
                                </div>
                              </div>

                              {/* Enroll Button */}
                              <Button
                                onClick={() => navigate(isAuthenticated ? '/meditation/series' : '/login')}
                                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-6 text-base font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-xl transition-all"
                              >
                                <span className="mr-2 text-xl">🧘‍♀️</span>
                                {isAuthenticated ? 'View Details' : 'Start Meditation'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </div>

                    {/* Indicators */}
                    <div className="flex justify-center gap-2 pb-4">
                      {programs.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentIndex(index);
                            if (autoPlayRef.current) {
                              clearInterval(autoPlayRef.current);
                            }
                          }}
                          className={`h-2 transition-all ${
                            index === currentIndex
                              ? 'w-8 bg-teal-500'
                              : 'w-2 bg-gray-300 dark:bg-gray-600'
                          } rounded-full`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-white/60">
                    {loading ? 'Loading programs...' : 'No meditation programs available'}
                  </div>
                )}
              </div>
            </Card>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300 transform hover:scale-105">
                  <span className="text-2xl mb-1 block">📚</span>
                  <p className="text-xs font-semibold text-white/60 mb-0.5">Total Series</p>
                  <p className="text-2xl font-bold text-teal-400">{stats.totalPrograms || 0}</p>
                </Card>
                <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300 transform hover:scale-105">
                  <span className="text-2xl mb-1 block">⏱️</span>
                  <p className="text-xs font-semibold text-white/60 mb-0.5">Total Duration</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {Math.round((stats.totalDurationMinutes || 0) / 60)}h
                  </p>
                </Card>
              </div>
            )}
          </motion.div>

          {/* Right Column - BMI Calculator */}
          <motion.div variants={cardVariants}>
            <CompactBMICalculator />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default MeditationSection;
