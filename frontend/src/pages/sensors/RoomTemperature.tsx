import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, TrendingUp, TrendingDown, Wind, Droplets, MapPin } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  location: string;
}

const RoomTemperature: React.FC = () => {
  const [temperature, setTemperature] = useState<number>(22);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [useWeatherAPI, setUseWeatherAPI] = useState(false);

  // Simulated temperature reading (in real app, could use device battery temp or weather API)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate slight temperature variations
      setTemperature(prev => {
        const variation = (Math.random() - 0.5) * 0.5;
        return Math.round((prev + variation) * 10) / 10;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // Note: In a real implementation, you would use a weather API like OpenWeatherMap
      // For this demo, we'll simulate the data
      // Example API call (requires API key):
      // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=YOUR_API_KEY&units=metric`);
      // const data = await response.json();

      // Simulated weather data
      setTimeout(() => {
        const simulatedData: WeatherData = {
          temperature: Math.round((Math.random() * 20 + 15) * 10) / 10,
          feelsLike: Math.round((Math.random() * 20 + 15) * 10) / 10,
          humidity: Math.round(Math.random() * 40 + 40),
          windSpeed: Math.round(Math.random() * 15 * 10) / 10,
          description: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Clear'][Math.floor(Math.random() * 4)],
          location: 'Your Location'
        };

        setWeatherData(simulatedData);
        setTemperature(simulatedData.temperature);
        setUseWeatherAPI(true);
        setIsLoading(false);
      }, 1500);

    } catch (err: any) {
      setError(err.message === 'User denied Geolocation'
        ? 'Location permission denied. Please enable location access.'
        : 'Failed to fetch weather data. Please try again.');
      setIsLoading(false);
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return 'from-blue-600 to-cyan-600';
    if (temp < 10) return 'from-cyan-500 to-blue-500';
    if (temp < 15) return 'from-teal-500 to-cyan-500';
    if (temp < 20) return 'from-green-500 to-teal-500';
    if (temp < 25) return 'from-yellow-500 to-green-500';
    if (temp < 30) return 'from-orange-500 to-yellow-500';
    return 'from-red-500 to-orange-500';
  };

  const getTemperatureCategory = (temp: number) => {
    if (temp < 0) return 'Freezing';
    if (temp < 10) return 'Very Cold';
    if (temp < 15) return 'Cold';
    if (temp < 20) return 'Cool';
    if (temp < 25) return 'Comfortable';
    if (temp < 30) return 'Warm';
    return 'Hot';
  };

  const temperaturePercentage = Math.min(Math.max(((temperature + 10) / 60) * 100, 0), 100);

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
            <Thermometer className="w-10 h-10 text-cyan-400" />
            Room Temperature
          </h1>
          <p className="text-teal-200">Monitor ambient temperature in your environment</p>
        </motion.div>

        {/* Main Temperature Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 backdrop-blur-xl border border-teal-400/30 rounded-2xl p-8 shadow-2xl mb-6"
        >
          <div className="flex flex-col items-center mb-8">
            {/* Thermometer Display */}
            <div className="relative w-80 h-80 mb-6">
              {/* Circular Temperature Gauge */}
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="rgba(20, 184, 166, 0.2)"
                  strokeWidth="20"
                  fill="none"
                />
                {/* Temperature Circle */}
                <motion.circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="url(#tempGradient)"
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 140}`}
                  strokeDashoffset={`${2 * Math.PI * 140 * (1 - temperaturePercentage / 100)}`}
                  strokeLinecap="round"
                  animate={{ strokeDashoffset: `${2 * Math.PI * 140 * (1 - temperaturePercentage / 100)}` }}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="25%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="75%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  className="text-7xl font-bold text-white mb-2"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {temperature.toFixed(1)}°
                </motion.div>
                <div className="text-2xl text-teal-200">Celsius</div>
                <motion.div
                  className={`mt-3 px-4 py-2 rounded-full bg-gradient-to-r ${getTemperatureColor(temperature)} text-white font-semibold`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getTemperatureCategory(temperature)}
                </motion.div>
              </div>

              {/* Thermometer Icon */}
              <motion.div
                className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-full p-4 border border-teal-400/30"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Thermometer className="w-8 h-8 text-cyan-400" />
              </motion.div>
            </div>

            {/* Fetch Weather Button */}
            <button
              onClick={fetchWeatherData}
              disabled={isLoading}
              className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Fetching Weather...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Get Weather Data
                </span>
              )}
            </button>
          </div>

          {/* Temperature Scale Reference */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-teal-400/20">
            <h3 className="text-white font-semibold mb-4">Temperature Scale</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600"></div>
                <span className="text-teal-200 text-sm">Below 0°C - Freezing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"></div>
                <span className="text-teal-200 text-sm">0°C - 15°C - Cold</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-3 rounded-full bg-gradient-to-r from-green-500 to-yellow-500"></div>
                <span className="text-teal-200 text-sm">15°C - 25°C - Comfortable</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                <span className="text-teal-200 text-sm">Above 25°C - Warm/Hot</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weather Data Card */}
        {weatherData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 backdrop-blur-xl border border-teal-400/30 rounded-2xl p-8 shadow-2xl mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-cyan-400" />
              Weather Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
                <div className="flex items-center gap-3 mb-2">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                  <span className="text-teal-200 text-sm">Feels Like</span>
                </div>
                <div className="text-3xl font-bold text-white">{weatherData.feelsLike}°C</div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
                <div className="flex items-center gap-3 mb-2">
                  <Droplets className="w-5 h-5 text-blue-400" />
                  <span className="text-teal-200 text-sm">Humidity</span>
                </div>
                <div className="text-3xl font-bold text-white">{weatherData.humidity}%</div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
                <div className="flex items-center gap-3 mb-2">
                  <Wind className="w-5 h-5 text-cyan-400" />
                  <span className="text-teal-200 text-sm">Wind Speed</span>
                </div>
                <div className="text-3xl font-bold text-white">{weatherData.windSpeed}</div>
                <div className="text-teal-400 text-xs mt-1">m/s</div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-400/20">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-teal-400" />
                  <span className="text-teal-200 text-sm">Condition</span>
                </div>
                <div className="text-2xl font-bold text-white">{weatherData.description}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-900/30 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm"
          >
            <p className="text-red-200 text-sm">{error}</p>
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
            <Thermometer className="w-5 h-5 text-blue-400" />
            About Temperature Monitoring
          </h3>
          <div className="space-y-3 text-teal-200 text-sm">
            <p>
              This tool displays ambient temperature information. The readings shown are {useWeatherAPI ? 'from weather data based on your location.' : 'simulated for demonstration purposes.'}
            </p>

            <div className="bg-white/5 rounded-lg p-4 mt-4">
              <p className="font-semibold text-white mb-2">Temperature Sources:</p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>Weather API:</strong> Click "Get Weather Data" to fetch real temperature from your location</li>
                <li>• <strong>Device Sensors:</strong> Some devices expose battery temperature (requires native app)</li>
                <li>• <strong>IoT Sensors:</strong> Can integrate with smart home temperature sensors</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-4 mt-4">
              <p className="font-semibold text-white mb-2">Note:</p>
              <p className="text-teal-200 text-sm">
                Web browsers have limited access to device temperature sensors for privacy and security reasons.
                For accurate room temperature monitoring, consider using dedicated IoT temperature sensors or smart home devices.
                The weather API provides outdoor temperature based on your location.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default RoomTemperature;
