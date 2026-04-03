import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass as CompassIcon, Navigation, MapPin, AlertCircle } from 'lucide-react';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

const Compass: React.FC = () => {
  const { alert } = useConfirm();
  const [heading, setHeading] = useState<number>(0);
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Kaaba coordinates
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  useEffect(() => {
    // Check if DeviceOrientationEvent is supported
    if (!window.DeviceOrientationEvent) {
      setIsSupported(false);
      return;
    }

    // Request permission for iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            setPermissionGranted(true);
            startCompass();
          }
        })
        .catch(() => {
          setIsSupported(false);
        });
    } else {
      setPermissionGranted(true);
      startCompass();
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const startCompass = () => {
    window.addEventListener('deviceorientation', handleOrientation);
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    const alpha = event.alpha;
    if (alpha !== null) {
      setHeading(360 - alpha);
    }
  };

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          startCompass();
        }
      } catch (error) {
        setIsSupported(false);
      }
    }
  };

  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      await alert({
        title: 'Geolocation Not Supported',
        message: 'Geolocation is not supported by your browser',
        variant: 'warning'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        calculateQiblaDirection(lat, lng);
      },
      async (error) => {
        console.error('Error getting location:', error);
        await alert({
          title: 'Location Error',
          message: 'Unable to get your location. Please enable location services.',
          variant: 'warning'
        });
      }
    );
  };

  const calculateQiblaDirection = (userLat: number, userLng: number) => {
    // Convert to radians
    const lat1 = (userLat * Math.PI) / 180;
    const lat2 = (KAABA_LAT * Math.PI) / 180;
    const dLng = ((KAABA_LNG - userLng) * Math.PI) / 180;

    // Calculate bearing
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    let bearing = Math.atan2(y, x);
    bearing = (bearing * 180) / Math.PI;
    bearing = (bearing + 360) % 360;

    setQiblaDirection(bearing);
  };

  const getDirection = (degree: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((degree % 360) / 45) % 8);
    return directions[index];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Digital Compass
              </h1>
              <p className="text-gray-400">
                Find your direction with Qibla finder
              </p>
            </div>

            {!isSupported ? (
              <Card className="bg-slate-800/50 border-red-500/30 backdrop-blur-xl">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Compass Not Supported
                  </h3>
                  <p className="text-gray-400">
                    Your device does not support the compass feature. This feature requires a
                    device with orientation sensors.
                  </p>
                </CardContent>
              </Card>
            ) : !permissionGranted ? (
              <Card className="bg-slate-800/50 border-teal-500/30 backdrop-blur-xl">
                <CardContent className="p-6 text-center">
                  <CompassIcon className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Permission Required
                  </h3>
                  <p className="text-gray-400 mb-4">
                    We need permission to access your device's orientation sensors.
                  </p>
                  <Button
                    onClick={requestPermission}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  >
                    Grant Permission
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Compass Card */}
                <Card className="bg-slate-800/50 border-teal-500/30 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-teal-400">
                      <CompassIcon className="w-5 h-5" />
                      Compass
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full aspect-square max-w-md mx-auto">
                      {/* Compass Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/30 to-cyan-900/30 rounded-full border-4 border-teal-500/30" />

                      {/* Rotating Compass */}
                      <motion.div
                        className="absolute inset-0"
                        style={{ rotate: heading }}
                        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                      >
                        {/* Cardinal Directions */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-2xl font-bold text-red-500">
                          N
                        </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-2xl font-bold text-white">
                          S
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-white">
                          E
                        </div>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-white">
                          W
                        </div>

                        {/* Degree Markers */}
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 left-1/2 h-full"
                            style={{ transform: `rotate(${i * 10}deg)` }}
                          >
                            <div
                              className={`w-0.5 mx-auto ${
                                i % 3 === 0 ? 'h-6 bg-teal-400' : 'h-3 bg-teal-600'
                              }`}
                            />
                          </div>
                        ))}
                      </motion.div>

                      {/* Center Needle */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Navigation className="w-16 h-16 text-teal-400" style={{ transform: 'rotate(180deg)' }} />
                      </div>

                      {/* Qibla Indicator */}
                      {qiblaDirection !== null && (
                        <motion.div
                          className="absolute inset-0"
                          style={{ rotate: qiblaDirection - heading }}
                          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                        >
                          <div className="absolute top-8 left-1/2 -translate-x-1/2">
                            <MapPin className="w-8 h-8 text-green-400" />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Heading Display */}
                    <div className="text-center mt-6 space-y-2">
                      <div className="text-5xl font-bold text-teal-400">
                        {Math.round(heading)}°
                      </div>
                      <div className="text-2xl text-gray-300">
                        {getDirection(heading)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Qibla Finder Card */}
                <Card className="bg-slate-800/50 border-teal-500/30 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-teal-400">
                      <MapPin className="w-5 h-5" />
                      Qibla Direction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {qiblaDirection === null ? (
                      <div className="text-center">
                        <p className="text-gray-400 mb-4">
                          Get your location to find the Qibla direction
                        </p>
                        <Button
                          onClick={getUserLocation}
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Find Qibla
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 rounded-lg p-4 border border-teal-500/30">
                          <p className="text-sm text-gray-400 mb-1">Qibla Direction</p>
                          <p className="text-3xl font-bold text-green-400">
                            {Math.round(qiblaDirection)}°
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {getDirection(qiblaDirection)}
                          </p>
                        </div>
                        {userLocation && (
                          <p className="text-xs text-gray-500">
                            Your location: {userLocation.lat.toFixed(4)}°,{' '}
                            {userLocation.lng.toFixed(4)}°
                          </p>
                        )}
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                          <MapPin className="w-4 h-4 text-green-400" />
                          <span>Green pin shows Qibla direction</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Compass;
