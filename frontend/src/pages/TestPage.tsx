import React from 'react';
import { Card } from '../components/ui/card';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Products Test</h1>
      <div className="space-y-8">
        <Card className="p-8">
          <h2 className="text-2xl font-bold">Fitness Tracker</h2>
          <p>Test content for fitness tracker</p>
        </Card>
        <Card className="p-8">
          <h2 className="text-2xl font-bold">Health Tracker</h2>
          <p>Test content for health tracker</p>
        </Card>
      </div>
    </div>
  );
};

export default TestPage;