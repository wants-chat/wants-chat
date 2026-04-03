import React, { useState } from 'react';
import { ArrowRightLeft, Sheet, BarChart, Bell, DollarSign } from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import CurrencyConverter from '../../components/currency-converter/CurrencyConverter';
import RatesTab from '../../components/currency-converter/RatesTab';
import ChartsTab from '../../components/currency-converter/ChartsTab';
import AlertsTab from '../../components/currency-converter/AlertsTab';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

type Tab = 'convert' | 'rates' | 'charts' | 'alerts';

const CurrencyConverterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('convert');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'convert':
        return <CurrencyConverter />;
      case 'rates':
        return <RatesTab />;
      case 'charts':
        return <ChartsTab />;
      case 'alerts':
        return <AlertsTab />;
      default:
        return null;
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Tools', href: '/dashboard' },
    { label: 'Currency Converter', icon: DollarSign }
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

      {/* Navigation Tabs */}
      <div className="relative z-10 bg-white/5 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 -mb-px">
            <button
              onClick={() => setActiveTab('convert')}
              className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'convert'
                  ? 'border-teal-400 text-white'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              <ArrowRightLeft className="h-5 w-5" />
              Convert
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rates'
                  ? 'border-teal-400 text-white'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              <Sheet className="h-5 w-5" />
              Rates
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'charts'
                  ? 'border-teal-400 text-white'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              <BarChart className="h-5 w-5" />
              Charts
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'alerts'
                  ? 'border-teal-400 text-white'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              <Bell className="h-5 w-5" />
              Alerts
            </button>
          </nav>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default CurrencyConverterPage;