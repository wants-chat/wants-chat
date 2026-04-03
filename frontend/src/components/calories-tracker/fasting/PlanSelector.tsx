import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { mdiPlay } from '@mdi/js';

export interface FastingPlan {
  id: string;
  name: string;
  duration: number; // in hours
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  benefits: string[];
  schedule: string;
  popular: boolean;
}

interface PlanSelectorProps {
  plans: FastingPlan[];
  selectedPlan: string;
  onSelectPlan: (planId: string) => void;
  onStartFast: () => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  plans,
  selectedPlan,
  onSelectPlan,
  onStartFast
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'Intermediate':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-white/10 text-white/80 border border-white/20';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/5 border border-white/10">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Choose Fasting Plan</h2>

          <div className="grid gap-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedPlan === plan.id
                    ? 'border-teal-400 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 shadow-lg shadow-teal-500/20'
                    : 'border-white/10 bg-white/5 hover:border-teal-400/50 hover:bg-white/10'
                  }
                `}
                onClick={() => onSelectPlan(plan.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">
                        {plan.name}
                      </h3>
                      {plan.popular && (
                        <Badge className="bg-teal-500/20 text-teal-400 border border-teal-500/30">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-white/60 mb-2">
                      {plan.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <Badge className={getDifficultyColor(plan.difficulty)}>
                        {plan.difficulty}
                      </Badge>
                      <span className="text-white/60">
                        {plan.schedule}
                      </span>
                    </div>
                  </div>

                  <div className="text-center ml-4">
                    <p className="text-2xl font-bold text-teal-400">{plan.duration}</p>
                    <p className="text-xs text-white/60">hours</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            size="lg"
            onClick={onStartFast}
          >
            <Icon path={mdiPlay} size={1} className="mr-2" />
            Start Fasting
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PlanSelector;