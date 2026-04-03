import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/landing/Header';
import { Button } from '../components/ui/button';
import { GlassCard } from '../components/ui/GlassCard';
import { BackgroundEffects } from '../components/ui/BackgroundEffects';
import {
  MedicalServices,
  Medication,
  LocalHospital,
  ChildCare,
  MonitorHeart,
  Warning,
  NightsStay
} from '@mui/icons-material';

const HealthPage: React.FC = () => {
  const navigate = useNavigate();

  const healthFeatures = [
    {
      id: 'medical-records',
      title: 'Medical Records',
      description: 'Store and organize all your medical documents in one place',
      icon: <MedicalServices className="h-8 w-8" style={{ color: 'rgb(71, 189, 255)' }} />,
      color: 'bg-blue-50 dark:bg-blue-950',
      onClick: () => navigate('/health/medical-records')
    },
    {
      id: 'medications',
      title: 'Medication Tracker',
      description: 'Never miss a dose with medication reminders and tracking',
      icon: <Medication className="h-8 w-8" />,
      color: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400',
      onClick: () => navigate('/health/medications')
    },
    {
      id: 'mothercare',
      title: 'Mother Care',
      description: 'Track pregnancy progress and prenatal care records',
      icon: <ChildCare className="h-8 w-8" />,
      color: 'bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400',
      onClick: () => navigate('/health/mother-care')
    },
    {
      id: 'serious',
      title: 'Serious Care',
      description: 'Manage chronic conditions and serious health conditions',
      icon: <Warning className="h-8 w-8" />,
      color: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
      onClick: () => navigate('/health/serious-care')
    }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      <main className="min-h-screen relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-6 bg-gradient-to-r from-teal-500 to-cyan-500">
              <LocalHospital className="h-6 w-6 text-white" />
            </div>
            <div className="mb-2">
              <span className="text-lg font-medium bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Let's Get Started
              </span>
            </div>
            <h1 className="text-6xl font-bold text-white mb-6">
              Welcome to <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Health Manager</span>
            </h1>
            <p className="text-xl text-white/60 mb-16">
              What type of health management do you need?
            </p>
          </div>

          {/* Main Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Medical Records Card */}
            <GlassCard
              hover={true}
              glow={true}
              onClick={() => navigate('/health/medical-records')}
            >
              <div className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8 bg-gradient-to-r from-teal-500 to-cyan-500">
                    <MedicalServices className="h-10 w-10 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-6">
                    Medical Records
                  </h2>

                  <div className="space-y-4 text-left mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-teal-500/20">
                        <span className="text-teal-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Store all medical documents</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-teal-500/20">
                        <span className="text-teal-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Track vital signs & test results</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-teal-500/20">
                        <span className="text-teal-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Manage insurance information</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-teal-500/20">
                        <span className="text-teal-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Doctor visits & appointments</span>
                    </div>
                  </div>

                  <Button
                    className="w-full py-4 text-white font-normal text-base rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); navigate('/health/medical-records'); }}
                  >
                    Select Medical Records
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Medications Card */}
            <GlassCard
              hover={true}
              glow={true}
              onClick={() => navigate('/health/medications')}
            >
              <div className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8 bg-gradient-to-r from-emerald-500 to-teal-500">
                    <Medication className="h-10 w-10 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-6">
                    Medication Tracker
                  </h2>

                  <div className="space-y-4 text-left mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500/20">
                        <span className="text-emerald-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Never miss a dose</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500/20">
                        <span className="text-emerald-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Medication reminders</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500/20">
                        <span className="text-emerald-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Prescription refill tracking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500/20">
                        <span className="text-emerald-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Flexible scheduling</span>
                    </div>
                  </div>

                  <Button
                    className="w-full py-4 text-white font-normal text-base rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); navigate('/health/medications'); }}
                  >
                    Select Medication Tracker
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Secondary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Mother Care Card */}
            <GlassCard
              hover={true}
              glow={true}
              onClick={() => navigate('/health/mother-care')}
            >
              <div className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8 bg-gradient-to-r from-pink-500 to-rose-500">
                    <ChildCare className="h-10 w-10 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-6">
                    Mother Care
                  </h2>

                  <div className="space-y-4 text-left mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-pink-500/20">
                        <span className="text-pink-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Pregnancy progress tracking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-pink-500/20">
                        <span className="text-pink-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Prenatal care records</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-pink-500/20">
                        <span className="text-pink-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Baby development milestones</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-pink-500/20">
                        <span className="text-pink-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Appointment reminders</span>
                    </div>
                  </div>

                  <Button
                    className="w-full py-4 text-white font-normal text-base rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); navigate('/health/mother-care'); }}
                  >
                    Select Mother Care
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Serious Care Card */}
            <GlassCard
              hover={true}
              glow={true}
              onClick={() => navigate('/health/serious-care')}
            >
              <div className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8 bg-gradient-to-r from-red-500 to-orange-500">
                    <Warning className="h-10 w-10 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-6">
                    Serious Care
                  </h2>

                  <div className="space-y-4 text-left mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/20">
                        <span className="text-red-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Chronic condition management</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/20">
                        <span className="text-red-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Treatment plan tracking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/20">
                        <span className="text-red-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Emergency contact info</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/20">
                        <span className="text-red-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Specialized care monitoring</span>
                    </div>
                  </div>

                  <Button
                    className="w-full py-4 text-white font-normal text-base rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); navigate('/health/serious-care'); }}
                  >
                    Select Serious Care
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Sleep Tracking Card */}
            <GlassCard
              hover={true}
              glow={true}
              onClick={() => navigate('/health/sleep')}
            >
              <div className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8 bg-gradient-to-r from-indigo-500 to-purple-500">
                    <NightsStay className="h-10 w-10 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-6">
                    Sleep Tracking
                  </h2>

                  <div className="space-y-4 text-left mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-indigo-500/20">
                        <span className="text-indigo-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Track sleep duration & quality</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-indigo-500/20">
                        <span className="text-indigo-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Smart alarm with sleep cycles</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-indigo-500/20">
                        <span className="text-indigo-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Bedtime reminders</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-indigo-500/20">
                        <span className="text-indigo-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60">Sleep trends & insights</span>
                    </div>
                  </div>

                  <Button
                    className="w-full py-4 text-white font-normal text-base rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); navigate('/health/sleep'); }}
                  >
                    Select Sleep Tracking
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Footer Text */}
          <div className="text-center">
            <p className="text-white/40">
              You can access all features anytime from your health dashboard
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthPage;