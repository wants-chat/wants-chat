import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Luggage, Search, AutoAwesome } from '@mui/icons-material';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface EmptyStateProps {
  type: 'no-plans' | 'no-results';
  onClearFilters?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onClearFilters }) => {
  const navigate = useNavigate();

  if (type === 'no-plans') {
    return (
      <Card className="rounded-2xl p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center mx-auto mb-6">
          <Luggage className="h-10 w-10 text-teal-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">No Travel Plans Yet</h3>
        <p className="text-white/60 mb-6">
          Create your first AI-powered travel itinerary
        </p>
        <Button
          onClick={() => navigate('/travel-planner/generate')}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl"
        >
          <AutoAwesome className="h-4 w-4 mr-2" />
          Generate Your First Plan
        </Button>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center mx-auto mb-6">
        <Search className="h-10 w-10 text-teal-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">No Plans Found</h3>
      <p className="text-white/60 mb-6">
        No travel plans match your current search and filters
      </p>
      <Button onClick={onClearFilters} className="bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl">
        Clear Filters
      </Button>
    </Card>
  );
};

export default EmptyState;