import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sun, Moon, Smartphone } from 'lucide-react';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const Flashlight: React.FC = () => {
  const [isOn, setIsOn] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [color, setColor] = useState('#FFFFFF');

  useEffect(() => {
    // Apply flashlight effect
    if (isOn) {
      document.body.style.backgroundColor = color;
      document.body.style.filter = `brightness(${brightness}%)`;
    } else {
      document.body.style.backgroundColor = '';
      document.body.style.filter = '';
    }

    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.filter = '';
    };
  }, [isOn, brightness, color]);

  const toggleFlashlight = () => {
    setIsOn(!isOn);
  };

  const presetColors = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Warm', value: '#FFF4E6' },
    { name: 'Red', value: '#FF6B6B' },
    { name: 'Green', value: '#51CF66' },
    { name: 'Blue', value: '#339AF0' },
    { name: 'Yellow', value: '#FFD43B' },
  ];

  return (
    <div className={`min-h-screen transition-all duration-300 ${isOn ? '' : 'bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900'}`}>
      {!isOn && <BackgroundEffects variant="subtle" />}
      {!isOn && <Header />}

      <div className="relative z-10 container mx-auto px-4 py-8 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-2xl mx-auto">
            {!isOn && (
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  Screen Flashlight
                </h1>
                <p className="text-gray-400">
                  Turn your screen into a bright light source
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {isOn ? (
                <motion.div
                  key="flashlight-on"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-black/50 backdrop-blur-md rounded-2xl p-6 max-w-md w-full mx-4"
                  >
                    <div className="text-center mb-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="inline-block"
                      >
                        <Sun className="w-16 h-16 text-white mx-auto mb-4" />
                      </motion.div>
                      <p className="text-white text-lg font-semibold">Flashlight Active</p>
                    </div>

                    {/* Brightness Control */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-white text-sm font-medium">Brightness</label>
                        <span className="text-white text-sm">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Color Presets */}
                    <div className="mb-6">
                      <label className="text-white text-sm font-medium mb-3 block">Color</label>
                      <div className="grid grid-cols-3 gap-2">
                        {presetColors.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => setColor(preset.value)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              color === preset.value
                                ? 'border-white scale-105'
                                : 'border-white/30 hover:border-white/50'
                            }`}
                            style={{ backgroundColor: preset.value }}
                          >
                            <span className="text-xs font-medium text-black/70">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={toggleFlashlight}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6"
                    >
                      <Moon className="w-5 h-5 mr-2" />
                      Turn Off
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="flashlight-off"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="bg-slate-800/50 border-teal-500/30 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-teal-400">
                        <Lightbulb className="w-5 h-5" />
                        Flashlight Control
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Preview */}
                      <div className="relative bg-gradient-to-br from-teal-900/30 to-cyan-900/30 rounded-2xl p-12 border border-teal-500/30">
                        <div className="text-center">
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Smartphone className="w-24 h-24 text-teal-400 mx-auto mb-4" />
                          </motion.div>
                          <p className="text-gray-300 text-lg">
                            Tap the button below to activate
                          </p>
                        </div>
                      </div>

                      {/* Settings */}
                      <div className="space-y-4">
                        {/* Brightness */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-white text-sm font-medium">
                              Brightness
                            </label>
                            <span className="text-teal-400 text-sm">{brightness}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>

                        {/* Color */}
                        <div>
                          <label className="text-white text-sm font-medium mb-3 block">
                            Light Color
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {presetColors.map((preset) => (
                              <button
                                key={preset.name}
                                onClick={() => setColor(preset.value)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                  color === preset.value
                                    ? 'border-teal-400 scale-105'
                                    : 'border-teal-500/30 hover:border-teal-400/50'
                                }`}
                                style={{ backgroundColor: preset.value }}
                              >
                                <span className="text-sm font-medium text-black/70">
                                  {preset.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Turn On Button */}
                      <Button
                        onClick={toggleFlashlight}
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-6 text-lg"
                      >
                        <Sun className="w-5 h-5 mr-2" />
                        Turn On Flashlight
                      </Button>

                      {/* Info */}
                      <div className="text-center text-sm text-gray-400 space-y-1">
                        <p>Your screen will turn into a bright light source</p>
                        <p className="text-xs">
                          Tip: Use warm colors for reading in the dark
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, rgb(20, 184, 166), rgb(6, 182, 212));
          cursor: pointer;
          box-shadow: 0 0 10px rgba(20, 184, 166, 0.5);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, rgb(20, 184, 166), rgb(6, 182, 212));
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(20, 184, 166, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Flashlight;
