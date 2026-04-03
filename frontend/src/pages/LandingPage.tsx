import React from 'react';
import Hero from '../components/landing/Hero';
import IntentDetection from '../components/landing/IntentDetection';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import AIModelsSection from '../components/landing/AIModelsSection';
import ConnectorsSection from '../components/landing/ConnectorsSection';
import BrandsReplaced from '../components/landing/BrandsReplaced';
import StatsSection from '../components/landing/StatsSection';
import ComparisonTable from '../components/landing/ComparisonTable';
import FAQSection from '../components/landing/FAQSection';
import { SEO } from '../components/SEO';
import { PAGE_SEO } from '../config/seo';

const LandingPage: React.FC = () => {
  return (
    <>
      <SEO
        title={PAGE_SEO.home.title}
        description={PAGE_SEO.home.description}
        url={PAGE_SEO.home.url}
      />
      <div className="landing-page bg-gray-950">
        {/* Hero Section - "Every AI talks. We render." */}
        <Hero />

        {/* Intent Detection vs Contextual UI - Traditional AI vs Wants comparison */}
        <IntentDetection />

        {/* Platform Features Grid */}
        <FeaturesGrid />

        {/* 30+ AI Models Supported */}
        <AIModelsSection />

        {/* 100+ Connectors & Integrations */}
        <ConnectorsSection />

        {/* Brands & Tools Wants Replaces */}
        <BrandsReplaced />

        {/* Stats - Show our scale */}
        <StatsSection />

        {/* Comparison with Competitors */}
        <ComparisonTable />

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </>
  );
};

export default LandingPage;
