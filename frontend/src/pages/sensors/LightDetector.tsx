import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sun, Moon, Sunrise, Sunset, Activity } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

const LightDetector: React.FC = () => {
  const { alert } = useConfirm();
  const [lightLevel, setLightLevel] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  useEffect(() => {
    // Check if Ambient Light Sensor API is supported
    if ('AmbientLightSensor' in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const startDetection = async () => {
    if (!isSupported) {
      await alert({
        title: 'Not Supported',
        message: 'Ambient Light Sensor is not supported on this device/browser.',
        variant: 'warning'
      });
      return;
    }

    try {
      // @ts-ignore - AmbientLightSensor is not in TypeScript types yet
      const sensor = new AmbientLightSensor();

      sensor.addEventListener('reading', () => {
        setLightLevel(sensor.illuminance || 0);
      });

      sensor.addEventListener('error', async (event: any) => {
        console.error('Sensor error:', event.error);
        if (event.error.name === 'NotAllowedError') {
          setPermissionState('denied');
          await alert({
            title: 'Permission Denied',
            message: 'Permission to access light sensor was denied.',
            variant: 'warning'
          });
        }
      });

      sensor.start();
      setIsDetecting(true);
      setPermissionState('granted');
    } catch (error) {
      console.error('Error starting light sensor:', error);
      await alert({
        title: 'Sensor Error',
        message: 'Failed to start light sensor. Your browser may not support this feature.',
        variant: 'warning'
      });
    }
  };

  const stopDetection = () => {
    setIsDetecting(false);
  };

  const getLightCategory = (lux: number) => {
    if (lux < 10) return { text: 'Very Dark', icon: Moon, color: 'from-indigo-900 to-purple-900' };
    if (lux < 50) return { text: 'Dark', icon: Moon, color: 'from-blue-900 to-indigo-900' };
    if (lux < 200) return { text: 'Dim', icon: Sunrise, color: 'from-blue-700 to-teal-700' };
    if (lux < 500) return { text: 'Normal', icon: Lightbulb, color: 'from-teal-600 to-cyan-600' };
    if (lux < 1000) return { text: 'Bright', icon: Sun, color: 'from-yellow-500 to-orange-500' };
    if (lux < 5000) return { text: 'Very Bright', icon: Sun, color: 'from-orange-400 to-red-400' };
    return { text: 'Extremely Bright', icon: Sunset, color: 'from-red-500 to-pink-500' };
  };

  const category = getLightCategory(lightLevel);
  const CategoryIcon = category.icon;
  const gaugeRotation = Math.min((lightLevel / 10000) * 180, 180);

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
            <Lightbulb className="w-10 h-10 text-cyan-400" />
            Light Detector
          </h1>
          <p className="text-teal-200">Measure ambient light levels using your device's light sensor</p>
        </motion.div>

        {/* Main Detector Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 backdrop-blur-xl border border-teal-400/30 rounded-2xl p-8 shadow-2xl mb-6"
        >
          {/* Gauge Display */}
          <div className="flex flex-col items-center mb-8">
            {/* Semi-circular Gauge */}
            <div className="relative w-80 h-48 mb-6">
              {/* Gauge Background */}
              <svg className="w-full h-full" viewBox="0 0 320 160">
                {/* Background Arc */}
                <path
                  d="M 40 140 A 120 120 0 0 1 280 140"
                  fill="none"
                  stroke="rgba(20, 184, 166, 0.2)"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                {/* Active Arc */}
                <motion.path
                  d="M 40 140 A 120 120 0 0 1 280 140"
                  fill="none"
                  stroke="url(#lightGradient)"
                  strokeWidth="24"
                  strokeLinecap="round"
                  strokeDasharray={`${(Math.PI * 120)} ${(Math.PI * 120)}`}
                  strokeDashoffset={Math.PI * 120 * (1 - gaugeRotation / 180)}
                  animate={{ strokeDashoffset: Math.PI * 120 * (1 - gaugeRotation / 180) }}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="25%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="75%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Gauge Needle */}
              <motion.div
                className="absolute bottom-0 left-1/2 origin-bottom"
                style={{
                  width: '4px',
                  height: '100px',
                  marginLeft: '-2px',
                  marginBottom: '20px',
                }}
                animate={{ rotate: gaugeRotation - 90 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-full h-full bg-gradient-to-t from-white to-cyan-400 rounded-full shadow-lg"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg"></div>
              </motion.div>

              {/* Center Display */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-center">
                <div className="text-5xl font-bold text-white mb-1">{lightLevel.toFixed(0)}</div>
                <div className="text-teal-200 text-sm">lux</div>
              </div>
            </div>

            {/* Category Badge */}
            <motion.div
              className={`px-6 py-3 rounded-full bg-gradient-to-r ${category.color} mb-6 flex items-center gap-2 shadow-lg`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CategoryIcon className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">{category.text}</span>
            </motion.div>

            {/* Control Button */}
            <button
              onClick={isDetecting ? stopDetection : startDetection}
              disabled={!isSupported && !isDetecting}
              className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                isDetecting
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
              } shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isDetecting ? 'Stop Detection' : 'Start Detection'}
            </button>
          </div>

          {/* Light Scale Reference */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-teal-400/20">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Light Level Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-teal-200">Moonless night:</span>
                <span className="text-white font-mono">0.001 lux</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-200">Full moon:</span>
                <span className="text-white font-mono">0.1 lux</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-200">Dark room:</span>
                <span className="text-white font-mono">10 lux</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-200">Living room:</span>
                <span className="text-white font-mono">50 lux</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-200">Office:</span>
                <span className="text-white font-mono">320-500 lux</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-200">Overcast day:</span>
                <span className="text-white font-mono">1,000 lux</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-200">Sunny day:</span>
                <span className="text-white font-mono">10,000 lux</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-200">Direct sunlight:</span>
                <span className="text-white font-mono">100,000+ lux</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Support Warning */}
        {!isSupported && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm mb-6"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-yellow-200 font-semibold mb-2">Limited Browser Support</h3>
                <p className="text-yellow-200 text-sm mb-3">
                  The Ambient Light Sensor API is not supported in your current browser. This feature is experimental and currently only available in:
                </p>
                <ul className="text-yellow-200 text-sm space-y-1 ml-4">
                  <li>• Chrome/Edge on Android (with flag enabled)</li>
                  <li>• Some Samsung Internet browsers</li>
                  <li>• Limited desktop browser support</li>
                </ul>
                <p className="text-yellow-200 text-sm mt-3">
                  To enable in Chrome/Edge: Visit <code className="bg-black/30 px-1 rounded">chrome://flags</code> and enable "Generic Sensor Extra Classes"
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Permission Denied */}
        {permissionState === 'denied' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/30 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm mb-6"
          >
            <p className="text-red-200 text-sm">
              <strong>Permission Denied:</strong> Please allow access to the light sensor in your browser settings and reload the page.
            </p>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Sun className="w-5 h-5 text-blue-400" />
            About Light Detection
          </h3>
          <div className="space-y-2 text-teal-200 text-sm">
            <p>This tool uses your device's ambient light sensor to measure illuminance in lux (lumens per square meter).</p>
            <p className="mt-3"><strong>Use cases:</strong></p>
            <ul className="space-y-1 ml-4">
              <li>• Check if a room has adequate lighting for reading or working</li>
              <li>• Monitor daylight levels for photography</li>
              <li>• Determine optimal screen brightness settings</li>
              <li>• Test light-blocking curtains or shades</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default LightDetector;
