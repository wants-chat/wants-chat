import React from 'react';
import { motion } from 'framer-motion';

// Import new modular components
import { WelcomeSection } from '../../components/meditation/WelcomeSection';
import { TodaysPractice } from '../../components/meditation/TodaysPractice';
import { MeditationWheelContainer } from '../../components/meditation/MeditationWheelContainer';
import { InspirationalFooter } from '../../components/meditation/InspirationalFooter';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

// Import hooks and utilities
import { useMeditationDataManager } from '../../components/meditation/MeditationDataManager';
import { useMeditationWheelManager } from '../../components/meditation/MeditationWheelManager';

const MeditationHome: React.FC = () => {
  // Use the new modular data manager hook
  const {
    meditationOptions,
    userStats,
    quickSessions,
    weeklyStats,
    avgDailyMinutes,
    typedAudioLibrary,
    loading,
    statsLoading,
    goalsLoading,
    categoriesError
  } = useMeditationDataManager();

  // Use the meditation wheel manager hook
  const {
    selectedDuration,
    setSelectedDuration,
    selectedCategory,
    handleOptionClick,
    handleSubOptionClick,
    handleBackClick,
    getGreeting,
    getColorForCategory,
    getFilteredSessionCount
  } = useMeditationWheelManager(typedAudioLibrary);
















  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />

      <div className="relative z-10 space-y-6">
        {/* Welcome Section */}
        <WelcomeSection
          greeting={getGreeting()}
          currentStreak={userStats.currentStreak}
          totalSessions={userStats.totalSessions}
          statsLoading={statsLoading}
        />

        {/* Primary Section - Today's Focus & Circular Wheel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Practice */}
          <TodaysPractice
            userStats={userStats}
            quickSessions={quickSessions}
            weeklyStats={weeklyStats}
            avgDailyMinutes={avgDailyMinutes}
            goalsLoading={goalsLoading}
            statsLoading={statsLoading}
          />

          {/* Meditation Wheel Container */}
          <MeditationWheelContainer
            selectedCategory={selectedCategory}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
            meditationOptions={meditationOptions}
            typedAudioLibrary={typedAudioLibrary}
            loading={loading}
            onOptionClick={handleOptionClick}
            onSubOptionClick={handleSubOptionClick}
            onBackClick={handleBackClick}
            getColorForCategory={getColorForCategory}
            getFilteredSessionCount={getFilteredSessionCount}
          />
        </div>

        {/* Inspirational Footer */}
        <InspirationalFooter />
      </div>
    </div>
  );
};

export default MeditationHome;