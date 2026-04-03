import React, { useState, useEffect } from 'react';
import { Zap, Info } from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

type BandCount = 4 | 5 | 6;

interface ResistorBands {
  band1: string;
  band2: string;
  band3: string;
  band4: string;
  band5: string;
  band6: string;
}

interface ColorCode {
  name: string;
  value: number;
  multiplier: number;
  tolerance?: number;
  tempCoeff?: number;
  color: string;
}

const ResistorCodes: React.FC = () => {
  const [bandCount, setBandCount] = useState<BandCount>(4);
  const [bands, setBands] = useState<ResistorBands>({
    band1: 'brown',
    band2: 'black',
    band3: 'red',
    band4: 'gold',
    band5: 'brown',
    band6: 'brown',
  });
  const [resistance, setResistance] = useState<number>(0);
  const [tolerance, setTolerance] = useState<string>('±5%');
  const [tempCoeff, setTempCoeff] = useState<string>('');

  const colorCodes: Record<string, ColorCode> = {
    black: { name: 'Black', value: 0, multiplier: 1, color: '#000000' },
    brown: { name: 'Brown', value: 1, multiplier: 10, tolerance: 1, tempCoeff: 100, color: '#8B4513' },
    red: { name: 'Red', value: 2, multiplier: 100, tolerance: 2, tempCoeff: 50, color: '#FF0000' },
    orange: { name: 'Orange', value: 3, multiplier: 1000, tolerance: 0.05, tempCoeff: 15, color: '#FFA500' },
    yellow: { name: 'Yellow', value: 4, multiplier: 10000, tolerance: 0.02, tempCoeff: 25, color: '#FFFF00' },
    green: { name: 'Green', value: 5, multiplier: 100000, tolerance: 0.5, color: '#00FF00' },
    blue: { name: 'Blue', value: 6, multiplier: 1000000, tolerance: 0.25, color: '#0000FF' },
    violet: { name: 'Violet', value: 7, multiplier: 10000000, tolerance: 0.1, color: '#9400D3' },
    gray: { name: 'Gray', value: 8, multiplier: 100000000, tolerance: 0.01, color: '#808080' },
    white: { name: 'White', value: 9, multiplier: 1000000000, color: '#FFFFFF' },
    gold: { name: 'Gold', value: -1, multiplier: 0.1, tolerance: 5, color: '#FFD700' },
    silver: { name: 'Silver', value: -1, multiplier: 0.01, tolerance: 10, color: '#C0C0C0' },
  };

  const valueColors = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray', 'white'];
  const multiplierColors = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray', 'white', 'gold', 'silver'];
  const toleranceColors = ['brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray', 'gold', 'silver'];
  const tempCoeffColors = ['brown', 'red', 'orange', 'yellow'];

  useEffect(() => {
    calculateResistance();
  }, [bands, bandCount]);

  const calculateResistance = () => {
    let value = 0;
    let mult = 1;
    let tol = '';
    let temp = '';

    if (bandCount === 4) {
      value = colorCodes[bands.band1].value * 10 + colorCodes[bands.band2].value;
      mult = colorCodes[bands.band3].multiplier;
      tol = colorCodes[bands.band4].tolerance ? `±${colorCodes[bands.band4].tolerance}%` : '';
    } else if (bandCount === 5) {
      value = colorCodes[bands.band1].value * 100 + colorCodes[bands.band2].value * 10 + colorCodes[bands.band3].value;
      mult = colorCodes[bands.band4].multiplier;
      tol = colorCodes[bands.band5].tolerance ? `±${colorCodes[bands.band5].tolerance}%` : '';
    } else if (bandCount === 6) {
      value = colorCodes[bands.band1].value * 100 + colorCodes[bands.band2].value * 10 + colorCodes[bands.band3].value;
      mult = colorCodes[bands.band4].multiplier;
      tol = colorCodes[bands.band5].tolerance ? `±${colorCodes[bands.band5].tolerance}%` : '';
      temp = colorCodes[bands.band6].tempCoeff ? `${colorCodes[bands.band6].tempCoeff} ppm/K` : '';
    }

    setResistance(value * mult);
    setTolerance(tol);
    setTempCoeff(temp);
  };

  const formatResistance = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} MΩ`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} kΩ`;
    }
    return `${value.toFixed(2)} Ω`;
  };

  const updateBand = (bandName: keyof ResistorBands, color: string) => {
    setBands({ ...bands, [bandName]: color });
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Calculators', href: '/dashboard' },
    { label: 'Resistor Color Codes', icon: Zap }
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
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Resistor Color Code Calculator</h1>
                <p className="text-white/80 text-sm mt-1">Decode resistor values from color bands</p>
              </div>
            </div>
          </div>

          {/* Band Count Selection */}
          <div className="p-6 border-b border-white/10">
            <label className="block text-sm font-medium text-white/80 mb-3">Number of Bands</label>
            <div className="grid grid-cols-3 gap-3">
              {([4, 5, 6] as BandCount[]).map((count) => (
                <button
                  key={count}
                  onClick={() => setBandCount(count)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    bandCount === count
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {count} Bands
                </button>
              ))}
            </div>
          </div>

          {/* Visual Resistor */}
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-center items-center">
              <div className="relative">
                {/* Resistor body */}
                <div className="w-80 h-24 bg-gradient-to-r from-amber-800 to-amber-700 rounded-lg shadow-lg flex items-center justify-center gap-2 px-8">
                  {/* Band 1 */}
                  <div
                    className="w-6 h-20 rounded shadow-md border border-black/30"
                    style={{ backgroundColor: colorCodes[bands.band1].color }}
                  />
                  {/* Band 2 */}
                  <div
                    className="w-6 h-20 rounded shadow-md border border-black/30"
                    style={{ backgroundColor: colorCodes[bands.band2].color }}
                  />
                  {/* Band 3 (only for 5 and 6 band) */}
                  {bandCount >= 5 && (
                    <div
                      className="w-6 h-20 rounded shadow-md border border-black/30"
                      style={{ backgroundColor: colorCodes[bands.band3].color }}
                    />
                  )}
                  <div className="w-4" /> {/* Spacer */}
                  {/* Multiplier band */}
                  <div
                    className="w-6 h-20 rounded shadow-md border border-black/30"
                    style={{ backgroundColor: colorCodes[bandCount === 4 ? bands.band3 : bands.band4].color }}
                  />
                  {/* Tolerance band */}
                  <div
                    className="w-6 h-20 rounded shadow-md border border-black/30"
                    style={{ backgroundColor: colorCodes[bandCount === 4 ? bands.band4 : bands.band5].color }}
                  />
                  {/* Temperature coefficient (only for 6 band) */}
                  {bandCount === 6 && (
                    <div
                      className="w-6 h-20 rounded shadow-md border border-black/30"
                      style={{ backgroundColor: colorCodes[bands.band6].color }}
                    />
                  )}
                </div>
                {/* Wire leads */}
                <div className="absolute -left-8 top-1/2 w-8 h-1 bg-gray-400 transform -translate-y-1/2" />
                <div className="absolute -right-8 top-1/2 w-8 h-1 bg-gray-400 transform -translate-y-1/2" />
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {valueColors.map((color) => (
                  <option key={color} value={color} className="bg-slate-800">
                    {colorCodes[color].name} ({colorCodes[color].value})
                  </option>
                ))}
              </select>
            </div>

            {/* Band 3 (for 5 and 6 band resistors) */}
            {bandCount >= 5 && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Band 3 (3rd Digit)</label>
                <select
                  value={bands.band3}
                  onChange={(e) => updateBand('band3', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {valueColors.map((color) => (
                    <option key={color} value={color} className="bg-slate-800">
                      {colorCodes[color].name} ({colorCodes[color].value})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Multiplier */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {bandCount === 4 ? 'Band 3' : 'Band 4'} (Multiplier)
              </label>
              <select
                value={bandCount === 4 ? bands.band3 : bands.band4}
                onChange={(e) => updateBand(bandCount === 4 ? 'band3' : 'band4', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              <label className="block text-sm font-medium text-white/80 mb-2">
                {bandCount === 4 ? 'Band 4' : 'Band 5'} (Tolerance)
              </label>
              <select
                value={bandCount === 4 ? bands.band4 : bands.band5}
                onChange={(e) => updateBand(bandCount === 4 ? 'band4' : 'band5', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {toleranceColors.map((color) => (
                  <option key={color} value={color} className="bg-slate-800">
                    {colorCodes[color].name} ({colorCodes[color].tolerance ? `±${colorCodes[color].tolerance}%` : ''})
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Coefficient (for 6 band resistors) */}
            {bandCount === 6 && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Band 6 (Temp Coefficient)</label>
                <select
                  value={bands.band6}
                  onChange={(e) => updateBand('band6', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {tempCoeffColors.map((color) => (
                    <option key={color} value={color} className="bg-slate-800">
                      {colorCodes[color].name} ({colorCodes[color].tempCoeff} ppm/K)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="p-6 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-t border-white/10">
            <div className="space-y-4">
              {/* Resistance Value */}
              <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-sm rounded-lg p-6 border border-teal-400/30">
                <p className="text-sm text-white/60 mb-2">Resistance Value</p>
                <p className="text-4xl font-bold text-white">{formatResistance(resistance)}</p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Tolerance</p>
                  <p className="text-xl font-semibold text-white">{tolerance}</p>
                </div>
                {bandCount === 6 && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-white/60 mb-1">Temperature Coefficient</p>
                    <p className="text-xl font-semibold text-white">{tempCoeff}</p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                <Info className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-white/60">
                  Resistor color codes are standardized by EIA (Electronic Industries Alliance).
                  The bands are read from left to right, starting from the band closest to one end.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResistorCodes;
