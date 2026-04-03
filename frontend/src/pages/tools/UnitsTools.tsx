import { useState } from 'react';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Ruler, Weight, Thermometer, Clock } from 'lucide-react';

export default function UnitsTools() {
  // Length State
  const [lengthValue, setLengthValue] = useState('');
  const [lengthFrom, setLengthFrom] = useState('meter');
  const [lengthResults, setLengthResults] = useState<Record<string, number>>({});

  // Weight State
  const [weightValue, setWeightValue] = useState('');
  const [weightFrom, setWeightFrom] = useState('kilogram');
  const [weightResults, setWeightResults] = useState<Record<string, number>>({});

  // Temperature State
  const [tempValue, setTempValue] = useState('');
  const [tempFrom, setTempFrom] = useState('celsius');
  const [tempResults, setTempResults] = useState<Record<string, number>>({});

  // Time State
  const [timeValue, setTimeValue] = useState('');
  const [timeFrom, setTimeFrom] = useState('second');
  const [timeResults, setTimeResults] = useState<Record<string, number>>({});

  const lengthUnits: Record<string, number> = {
    meter: 1,
    kilometer: 0.001,
    centimeter: 100,
    millimeter: 1000,
    mile: 0.000621371,
    yard: 1.09361,
    foot: 3.28084,
    inch: 39.3701,
  };

  const weightUnits: Record<string, number> = {
    kilogram: 1,
    gram: 1000,
    milligram: 1000000,
    pound: 2.20462,
    ounce: 35.274,
    ton: 0.001,
  };

  const timeUnits: Record<string, number> = {
    second: 1,
    minute: 1 / 60,
    hour: 1 / 3600,
    day: 1 / 86400,
    week: 1 / 604800,
    month: 1 / 2592000,
    year: 1 / 31536000,
  };

  const convertLength = () => {
    const value = parseFloat(lengthValue);
    if (isNaN(value)) return;

    const inMeters = value / lengthUnits[lengthFrom];
    const results: Record<string, number> = {};

    Object.keys(lengthUnits).forEach((unit) => {
      results[unit] = inMeters * lengthUnits[unit];
    });

    setLengthResults(results);
  };

  const convertWeight = () => {
    const value = parseFloat(weightValue);
    if (isNaN(value)) return;

    const inKg = value / weightUnits[weightFrom];
    const results: Record<string, number> = {};

    Object.keys(weightUnits).forEach((unit) => {
      results[unit] = inKg * weightUnits[unit];
    });

    setWeightResults(results);
  };

  const convertTemperature = () => {
    const value = parseFloat(tempValue);
    if (isNaN(value)) return;

    let celsius = 0;

    switch (tempFrom) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * (5 / 9);
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
    }

    setTempResults({
      celsius: celsius,
      fahrenheit: (celsius * 9) / 5 + 32,
      kelvin: celsius + 273.15,
    });
  };

  const convertTime = () => {
    const value = parseFloat(timeValue);
    if (isNaN(value)) return;

    const inSeconds = value / timeUnits[timeFrom];
    const results: Record<string, number> = {};

    Object.keys(timeUnits).forEach((unit) => {
      results[unit] = inSeconds * timeUnits[unit];
    });

    setTimeResults(results);
  };

  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    if (Math.abs(num) < 0.000001) return num.toExponential(6);
    if (Math.abs(num) > 1000000) return num.toExponential(6);
    return num.toFixed(6).replace(/\.?0+$/, '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <BackgroundEffects />
      <Header />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Unit Converter
            </h1>
            <p className="text-gray-400">Convert between different units of measurement</p>
          </div>

          <Tabs defaultValue="length" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="length" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Ruler className="w-4 h-4 mr-2" />
                Length
              </TabsTrigger>
              <TabsTrigger value="weight" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Weight className="w-4 h-4 mr-2" />
                Weight
              </TabsTrigger>
              <TabsTrigger value="temperature" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Thermometer className="w-4 h-4 mr-2" />
                Temperature
              </TabsTrigger>
              <TabsTrigger value="time" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Clock className="w-4 h-4 mr-2" />
                Time
              </TabsTrigger>
            </TabsList>

            <TabsContent value="length" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Length Converter</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Value</label>
                    <input
                      type="number"
                      value={lengthValue}
                      onChange={(e) => setLengthValue(e.target.value)}
                      placeholder="Enter value"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">From Unit</label>
                    <select
                      value={lengthFrom}
                      onChange={(e) => setLengthFrom(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                      {Object.keys(lengthUnits).map((unit) => (
                        <option key={unit} value={unit}>
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={convertLength}
                  className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Convert
                </button>
                {Object.keys(lengthResults).length > 0 && (
                  <div className="mt-6 grid md:grid-cols-2 gap-3">
                    {Object.entries(lengthResults).map(([unit, value]) => (
                      <div key={unit} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">{unit.charAt(0).toUpperCase() + unit.slice(1)}</div>
                        <div className="text-xl font-semibold text-teal-400">{formatNumber(value)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="weight" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Weight Converter</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Value</label>
                    <input
                      type="number"
                      value={weightValue}
                      onChange={(e) => setWeightValue(e.target.value)}
                      placeholder="Enter value"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">From Unit</label>
                    <select
                      value={weightFrom}
                      onChange={(e) => setWeightFrom(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                      {Object.keys(weightUnits).map((unit) => (
                        <option key={unit} value={unit}>
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={convertWeight}
                  className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Convert
                </button>
                {Object.keys(weightResults).length > 0 && (
                  <div className="mt-6 grid md:grid-cols-2 gap-3">
                    {Object.entries(weightResults).map(([unit, value]) => (
                      <div key={unit} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">{unit.charAt(0).toUpperCase() + unit.slice(1)}</div>
                        <div className="text-xl font-semibold text-teal-400">{formatNumber(value)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="temperature" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Temperature Converter</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Value</label>
                    <input
                      type="number"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      placeholder="Enter value"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">From Unit</label>
                    <select
                      value={tempFrom}
                      onChange={(e) => setTempFrom(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="celsius">Celsius</option>
                      <option value="fahrenheit">Fahrenheit</option>
                      <option value="kelvin">Kelvin</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={convertTemperature}
                  className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Convert
                </button>
                {Object.keys(tempResults).length > 0 && (
                  <div className="mt-6 grid md:grid-cols-3 gap-3">
                    {Object.entries(tempResults).map(([unit, value]) => (
                      <div key={unit} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">{unit.charAt(0).toUpperCase() + unit.slice(1)}</div>
                        <div className="text-xl font-semibold text-teal-400">{formatNumber(value)}°</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="time" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Time Converter</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Value</label>
                    <input
                      type="number"
                      value={timeValue}
                      onChange={(e) => setTimeValue(e.target.value)}
                      placeholder="Enter value"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">From Unit</label>
                    <select
                      value={timeFrom}
                      onChange={(e) => setTimeFrom(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                      {Object.keys(timeUnits).map((unit) => (
                        <option key={unit} value={unit}>
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={convertTime}
                  className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Convert
                </button>
                {Object.keys(timeResults).length > 0 && (
                  <div className="mt-6 grid md:grid-cols-2 gap-3">
                    {Object.entries(timeResults).map(([unit, value]) => (
                      <div key={unit} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">{unit.charAt(0).toUpperCase() + unit.slice(1)}</div>
                        <div className="text-xl font-semibold text-teal-400">{formatNumber(value)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
