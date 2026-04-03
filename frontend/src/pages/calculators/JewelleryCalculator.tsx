import React, { useState, useEffect } from 'react';
import { Scale, TrendingUp, DollarSign } from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

type MetalType = 'gold' | 'silver' | 'platinum';

interface JewelleryState {
  metalType: MetalType;
  weight: string;
  purity: string;
  pricePerGram: string;
}

const JewelleryCalculator: React.FC = () => {
  const [state, setState] = useState<JewelleryState>({
    metalType: 'gold',
    weight: '',
    purity: '24',
    pricePerGram: '',
  });

  const [calculatedValue, setCalculatedValue] = useState<number>(0);
  const [pureWeight, setPureWeight] = useState<number>(0);

  const karatToPurity: Record<string, number> = {
    '24': 100,
    '22': 91.67,
    '21': 87.5,
    '18': 75,
    '14': 58.33,
    '10': 41.67,
  };

  const metalDefaults = {
    gold: { purities: ['24', '22', '21', '18', '14', '10'], defaultPrice: '65' },
    silver: { purities: ['99.9', '92.5', '90', '80'], defaultPrice: '0.85' },
    platinum: { purities: ['95', '90', '85'], defaultPrice: '35' },
  };

  useEffect(() => {
    const weight = parseFloat(state.weight) || 0;
    const price = parseFloat(state.pricePerGram) || 0;

    let purityPercent = 0;
    if (state.metalType === 'gold') {
      purityPercent = karatToPurity[state.purity] || 100;
    } else {
      purityPercent = parseFloat(state.purity) || 100;
    }

    const pureMetalWeight = (weight * purityPercent) / 100;
    const value = pureMetalWeight * price;

    setPureWeight(pureMetalWeight);
    setCalculatedValue(value);
  }, [state]);

  const handleMetalChange = (metal: MetalType) => {
    setState({
      ...state,
      metalType: metal,
      purity: metal === 'gold' ? '24' : metalDefaults[metal].purities[0],
      pricePerGram: metalDefaults[metal].defaultPrice,
    });
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Calculators', href: '/dashboard' },
    { label: 'Jewellery Calculator', icon: Scale }
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
                <Scale className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Jewellery Calculator</h1>
                <p className="text-white/80 text-sm mt-1">Calculate precious metal value by weight and purity</p>
              </div>
            </div>
          </div>

          {/* Metal Type Selection */}
          <div className="p-6 border-b border-white/10">
            <label className="block text-sm font-medium text-white/80 mb-3">Metal Type</label>
            <div className="grid grid-cols-3 gap-3">
              {(['gold', 'silver', 'platinum'] as MetalType[]).map((metal) => (
                <button
                  key={metal}
                  onClick={() => handleMetalChange(metal)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    state.metalType === metal
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {metal.charAt(0).toUpperCase() + metal.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          <div className="p-6 space-y-6">
            {/* Weight Input */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Weight (grams)
              </label>
              <input
                type="number"
                value={state.weight}
                onChange={(e) => setState({ ...state, weight: e.target.value })}
                placeholder="Enter weight in grams"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                step="0.01"
                min="0"
              />
            </div>

            {/* Purity Selection */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {state.metalType === 'gold' ? 'Karat' : 'Purity (%)'}
              </label>
              <select
                value={state.purity}
                onChange={(e) => setState({ ...state, purity: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none cursor-pointer"
              >
                {metalDefaults[state.metalType].purities.map((purity) => (
                  <option key={purity} value={purity} className="bg-slate-800">
                    {state.metalType === 'gold' ? `${purity}K` : `${purity}%`}
                    {state.metalType === 'gold' && ` (${karatToPurity[purity]}%)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Price per Gram */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Current Price per Gram (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="number"
                  value={state.pricePerGram}
                  onChange={(e) => setState({ ...state, pricePerGram: e.target.value })}
                  placeholder="Enter current market price"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="p-6 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pure Weight */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="h-5 w-5 text-teal-400" />
                  <p className="text-sm text-white/60">Pure Metal Weight</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {pureWeight.toFixed(3)} g
                </p>
              </div>

              {/* Total Value */}
              <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-sm rounded-lg p-4 border border-teal-400/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-teal-400" />
                  <p className="text-sm text-white/60">Estimated Value</p>
                </div>
                <p className="text-3xl font-bold text-white">
                  ${calculatedValue.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Info Text */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-white/60 text-center">
                Note: Prices are indicative. Actual market prices may vary.
                This calculator provides estimates based on pure metal content.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JewelleryCalculator;
