/**
 * Example Usage of New Landing Page Components
 *
 * This file demonstrates how to import and use the three new landing page components:
 * - ComparisonTable
 * - FAQSection
 * - AppStoreBadges
 */

import React from 'react';
import ComparisonTable from './ComparisonTable';
import FAQSection from './FAQSection';
import AppStoreBadges from './AppStoreBadges';

const ExampleLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Your existing hero section */}

      {/* Comparison Table Section */}
      <ComparisonTable />

      {/* App Store Badges Section */}
      <AppStoreBadges />

      {/* FAQ Section */}
      <FAQSection />

      {/* Your existing footer */}
    </div>
  );
};

export default ExampleLandingPage;
