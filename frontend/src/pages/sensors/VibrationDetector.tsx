import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vibrate, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface VibrationData {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  timestamp: number;
}

const VibrationDetector: React.FC = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [vibrationLevel, setVibrationLevel] = useState(0);
  const [currentData, setCurrentData] = useState<VibrationData>({ x: 0, y: 0, z: 0, magnitude: 0, timestamp: 0 });
  const [maxVibration, setMaxVibration] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    // Check if DeviceMotionEvent is supported
    if (typeof DeviceMotionEvent === 'undefined') {
      setIsSupported(false);
      return;
    }

    if (isDetecting) {
      const handleMotion = (event: DeviceMotionEvent) => {
        const acc = event.accelerationIncludingGravity;

        if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
          const x = acc.x || 0;
          const y = acc.y || 0;
          const z = acc.z || 0;

          // Calculate magnitude of vibration
          const magnitude = Math.sqrt(x * x + y * y + z * z);

          // Normalize to 0-100 scale (typical phone vibration is 0-20 m/s²)
          const normalizedMagnitude = Math.min((magnitude / 20) * 100, 100);

          setCurrentData({
            x,
            y,
            z,
            magnitude: normalizedMagnitude,
            timestamp: Date.now()
          });

          setVibrationLevel(normalizedMagnitude);
          setMaxVibration(prev => Math.max(prev, normalizedMagnitude));

          // Update history (keep last 50 readings)
          historyRef.current = [...historyRef.current, normalizedMagnitude].slice(-50);
          setHistory(historyRef.current);
        }
      };

      window.addEventListener('devicemotion', handleMotion);
      return () => window.removeEventListener('devicemotion', handleMotion);
    }
  }, [isDetecting]);

  const getVibrationColor = (level: number) => {
    if (level < 20) return 'from-teal-500 to-cyan-500';
    if (level < 40) return 'from-yellow-500 to-orange-500';
    if (level < 60) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  const getVibrationText = (level: number) => {
    if (level < 20) return 'Minimal';
    if (level < 40) return 'Low';
    if (level < 60) return 'Medium';
    if (level < 80) return 'High';
    return 'Very High';
  };

  const resetDetector = () => {
    setVibrationLevel(0);
    setMaxVibration(0);
    setHistory([]);
    historyRef.current = [];
    setCurrentData({ x: 0, y: 0, z: 0, magnitude: 0, timestamp: 0 });
  };

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
            <Vibrate className="w-10 h-10 text-cyan-400" />
            Vibration Detector
          </h1>
          <p className="text-teal-200">Detect and measure device motion and vibrations</p>
        </motion.div>

        {/* Main Detector Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 backdrop-blur-xl border border-teal-400/30 rounded-2xl p-8 shadow-2xl mb-6"
        >
          {/* Visual Indicator */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-64 h-64 mb-6">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-teal-400/20"></div>

              {/* Animated Vibration Rings */}
              <AnimatePresence>
                {isDetecting && vibrationLevel > 10 && (
                  <>
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${getVibrationColor(vibrationLevel)}`}
                      style={{ filter: 'blur(20px)' }}
                    />
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${getVibrationColor(vibrationLevel)}`}
                      style={{ filter: 'blur(20px)' }}
                    />
                  </>
                )}
              </AnimatePresence>

              {/* Center Circle */}
              <motion.div
                animate={{
                  scale: isDetecting ? [1, 1 + vibrationLevel / 200, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`absolute inset-8 rounded-full bg-gradient-to-br ${getVibrationColor(vibrationLevel)} flex items-center justify-center shadow-2xl`}
              >
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">{vibrationLevel.toFixed(0)}</div>
                  <div className="text-white text-sm opacity-90">{getVibrationText(vibrationLevel)}</div>
                </div>
              </motion.div>

              {/* Vibration Icon */}
              <motion.div
                animate={{ rotate: isDetecting ? [0, 10, -10, 0] : 0 }}
                transition={{ duration: 0.5, repeat: isDetecting ? Infinity : 0 }}
                className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-full p-3 border border-teal-400/30"
              >
                <Vibrate className="w-6 h-6 text-cyan-400" />
              </motion.div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setIsDetecting(!isDetecting);
                  if (!isDetecting) resetDetector();
                }}
                className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                  isDetecting
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                } shadow-lg hover:shadow-xl transform hover:scale-105`}
              >
                {isDetecting ? 'Stop Detection' : 'Start Detection'}
              </button>

              {isDetecting && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={resetDetector}
                  className="px-6 py-4 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-teal-400/30 transition-all"
                >
                  Reset
                </motion.button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          {isDetecting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
                <div className="text-teal-200 text-sm mb-1">X-Axis</div>
                <div className="text-2xl font-bold text-white">{currentData.x.toFixed(2)}</div>
                <div className="text-teal-400 text-xs">m/s²</div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
                <div className="text-teal-200 text-sm mb-1">Y-Axis</div>
                <div className="text-2xl font-bold text-white">{currentData.y.toFixed(2)}</div>
                <div className="text-teal-400 text-xs">m/s²</div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
                <div className="text-teal-200 text-sm mb-1">Z-Axis</div>
                <div className="text-2xl font-bold text-white">{currentData.z.toFixed(2)}</div>
                <div className="text-teal-400 text-xs">m/s²</div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <span className="text-teal-200 text-sm">Max Level</span>
                </div>
                <div className="text-2xl font-bold text-white">{maxVibration.toFixed(0)}</div>
                <div className="text-teal-400 text-xs">peak</div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* History Chart */}
        {isDetecting && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 backdrop-blur-xl border border-teal-400/30 rounded-2xl p-8 shadow-2xl mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Vibration History</h2>
            </div>

            <div className="flex items-end gap-1 h-32">
              {history.map((level, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${level}%`,
                    background: `linear-gradient(to top, rgb(20, 184, 166), rgb(6, 182, 212))`,
                    opacity: 0.5 + (index / history.length) * 0.5,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Device Support Warning */}
        {!isSupported && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/30 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-200 font-semibold mb-2">Device Not Supported</h3>
                <p className="text-red-200 text-sm">
                  Your device does not support motion detection. This feature requires a device with motion sensors (accelerometer and gyroscope).
                  Please try accessing this page on a mobile device or tablet.
                </p>
              </div>
            </div>
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
            <Activity className="w-5 h-5 text-blue-400" />
            How It Works
          </h3>
          <div className="space-y-2 text-teal-200 text-sm">
            <p>This detector uses your device's motion sensors to measure vibrations and movement:</p>
            <ul className="space-y-1 ml-4">
              <li>• <strong>X, Y, Z axes</strong> show acceleration in different directions</li>
              <li>• <strong>Vibration level</strong> combines all three axes into a single measurement</li>
              <li>• <strong>History chart</strong> displays vibration patterns over time</li>
              <li>• Try shaking or moving your device to see the readings change</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default VibrationDetector;
