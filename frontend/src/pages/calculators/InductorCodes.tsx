import React, { useState, useEffect } from 'react';
import { Radio, Info } from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface InductorBands {
  band1: string;
  band2: string;
  band3: string;
  band4: string;
}

interface ColorCode {
  name: string;
  value: number;
  multiplier: number;
  tolerance?: number;
  color: string;
}

const InductorCodes: React.FC = () => {
  const [bands, setBands] = useState<InductorBands>({
    band1: 'brown',
    band2: 'black',
    band3: 'red',
    band4: 'gold',
  });
  const [inductance, setInductance] = useState<number>(0);
  const [tolerance, setTolerance] = useState<string>('±5%');

  const colorCodes: Record<string, ColorCode> = {
    black: { name: 'Black', value: 0, multiplier: 1, color: '#000000' },
    brown: { name: 'Brown', value: 1, multiplier: 10, tolerance: 1, color: '#8B4513' },
    red: { name: 'Red', value: 2, multiplier: 100, tolerance: 2, color: '#FF0000' },
    orange: { name: 'Orange', value: 3, multiplier: 1000, color: '#FFA500' },
    yellow: { name: 'Yellow', value: 4, multiplier: 10000, color: '#FFFF00' },
    green: { name: 'Green', value: 5, multiplier: 100000, tolerance: 0.5, color: '#00FF00' },
    blue: { name: 'Blue', value: 6, multiplier: 1000000, tolerance: 0.25, color: '#0000FF' },
    violet: { name: 'Violet', value: 7, multiplier: 10000000, tolerance: 0.1, color: '#9400D3' },
    gray: { name: 'Gray', value: 8, multiplier: 100000000, color: '#808080' },
    white: { name: 'White', value: 9, multiplier: 1000000000, color: '#FFFFFF' },
    gold: { name: 'Gold', value: -1, multiplier: 0.1, tolerance: 5, color: '#FFD700' },
    silver: { name: 'Silver', value: -1, multiplier: 0.01, tolerance: 10, color: '#C0C0C0' },
  };

  const valueColors = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray', 'white'];
  const multiplierColors = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray', 'white', 'gold', 'silver'];
  const toleranceColors = ['brown', 'red', 'green', 'blue', 'violet', 'gold', 'silver'];

  useEffect(() => {
    calculateInductance();
  }, [bands]);

  const calculateInductance = () => {
    const value = colorCodes[bands.band1].value * 10 + colorCodes[bands.band2].value;
    const mult = colorCodes[bands.band3].multiplier;
    const tol = colorCodes[bands.band4].tolerance ? `±${colorCodes[bands.band4].tolerance}%` : '';

    // Inductance is in microhenries (µH)
    setInductance(value * mult);
    setTolerance(tol);
  };

  const formatInductance = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} H`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} mH`;
    }
    return `${value.toFixed(2)} µH`;
  };

  const updateBand = (bandName: keyof InductorBands, color: string) => {
    setBands({ ...bands, [bandName]: color });
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Calculators', href: '/dashboard' },
    { label: 'Inductor Color Codes', icon: Radio }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      <div className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Radio className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Inductor Color Code Calculator</h1>
                <p className="text-white/80 text-sm mt-1">Decode inductor values from color bands</p>
              </div>
            </div>
          </div>

          {/* Visual Inductor */}
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-center items-center">
              <div className="relative">
                {/* Inductor body with coil effect */}
                <div className="w-80 h-32 relative">
                  {/* Coil visualization */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-64 h-20">
                      {/* Coil rings */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="absolute border-4 border-amber-700 rounded-full"
                          style={{
                            left: `${i * 15}%`,
                            width: '25%',
                            height: '100%',
                            transform: 'rotateY(60deg)',
                          }}
                        />
                      ))}
                      {/* Color bands overlay */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2">
                        {/* Band 1 */}
                        <div
                          className="w-6 h-24 rounded shadow-md border border-black/30"
                          style={{ backgroundColor: colorCodes[bands.band1].color }}
                        />
                        {/* Band 2 */}
                        <div
                          className="w-6 h-24 rounded shadow-md border border-black/30"
                          style={{ backgroundColor: colorCodes[bands.band2].color }}
                        />
                        <div className="w-8" /> {/* Spacer */}
                        {/* Multiplier band */}
                        <div
                          className="w-6 h-24 rounded shadow-md border border-black/30"
                          style={{ backgroundColor: colorCodes[bands.band3].color }}
                        />
                        {/* Tolerance band */}
                        <div
                          className="w-6 h-24 rounded shadow-md border border-black/30"
                          style={{ backgroundColor: colorCodes[bands.band4].color }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Wire leads */}
                  <div className="absolute left-0 top-1/2 w-12 h-1 bg-gray-400 transform -translate-y-1/2" />
                  <div className="absolute right-0 top-1/2 w-12 h-1 bg-gray-400 transform -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div className="p-6 space-y-4">
            {/* Band 1 */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Band 1 (1st Digit)</label>
              <select
                value={bands.band1}
                onChange={(e) => updateBand('band1', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
              >
                {valueColors.map((color) => (
                  <option key={color} value={color} className="bg-slate-800">
                    {colorCodes[color].name} ({colorCodes[color].value})
                  </option>
                ))}
              </select>
            </div>

            {/* Band 2 */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Band 2 (2nd Digit)</label>
              <select
                value={bands.band2}
                onChange={(e) => updateBand('band2', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
              >
                {valueColors.map((color) => (
                  <option key={color} value={color} className="bg-slate-800">
                    {colorCodes[color].name} ({colorCodes[color].value})
                  </option>
                ))}
              </select>
            </div>

            {/* Multiplier */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Band 3 (Multiplier)</label>
              <select
                value={bands.band3}
                onChange={(e) => updateBand('band3', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
              >
                {multiplierColors.map((color) => (
                  <option key={color} value={color} className="bg-slate-800">
                    {colorCodes[color].name} (×{colorCodes[color].multiplier})
                  </option>
                ))}
              </select>
            </div>

            {/* Tolerance */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Band 4 (Tolerance)</label>
              <select
                value={bands.band4}
                onChange={(e) => updateBand('band4', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
              >
                {toleranceColors.map((color) => (
                  <option key={color} value={color} className="bg-slate-800">
                    {colorCodes[color].name} ({colorCodes[color].tolerance ? `±${colorCodes[color].tolerance}%` : ''})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="p-6 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-t border-white/10">
            <div className="space-y-4">
              {/* Inductance Value */}
              <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-sm rounded-lg p-6 border border-teal-400/30">
                <p className="text-sm text-white/60 mb-2">Inductance Value</p>
                <p className="text-4xl font-bold text-white">{formatInductance(inductance)}</p>
              </div>

              {/* Tolerance */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <p className="text-xs text-white/60 mb-1">Tolerance</p>
                <p className="text-xl font-semibold text-white">{tolerance}</p>
              </div>

              {/* Conversion Table */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Microhenries</p>
                  <p className="text-sm font-semibold text-white">{inductance.toFixed(2)} µH</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Millihenries</p>
                  <p className="text-sm font-semibold text-white">{(inductance / 1000).toFixed(4)} mH</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Henries</p>
                  <p className="text-sm font-semibold text-white">{(inductance / 1000000).toFixed(6)} H</p>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                <Info className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-white/60">
                  <p className="mb-2">
                    Inductor color codes follow the same system as resistors. The first two bands represent
                    the significant digits, the third band is the multiplier, and the fourth band indicates tolerance.
                  </p>
                  <p>
                    Common units: µH (microhenry) = 10⁻⁶ H, mH (millihenry) = 10⁻³ H
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InductorCodes;
