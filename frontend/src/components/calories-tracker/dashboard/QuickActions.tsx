import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Plus, Droplets, Scale, Apple, Zap, Target, Dumbbell, Pizza } from 'lucide-react';

interface QuickActionsProps {
  onQuickAdd: (action: 'water' | 'meal' | 'weight' | 'exercise') => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onQuickAdd
}) => {
  const actions = [
    {
      id: 'meal',
      title: 'Log Food',
      description: 'Add a meal or snack',
      icon: Pizza,
      color: 'emerald',
      bgColor: 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20',
      textColor: 'text-white',
      borderColor: 'border-white/20'
    },
    {
      id: 'water',
      title: 'Add Water',
      description: 'Track hydration',
      icon: Droplets,
      color: 'blue',
      bgColor: 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20',
      textColor: 'text-white',
      borderColor: 'border-white/20'
    },
    {
      id: 'weight',
      title: 'Log Weight',
      description: 'Record your weight',
      icon: Scale,
      color: 'purple',
      bgColor: 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20',
      textColor: 'text-white',
      borderColor: 'border-white/20'
    },
    {
      id: 'exercise',
      title: 'Log Exercise',
      description: 'Track workout',
      icon: Dumbbell,
      color: 'orange',
      bgColor: 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20',
      textColor: 'text-white',
      borderColor: 'border-white/20'
    }
  ];

  const quickAddFoods = [
    { name: 'Water (250ml)', icon: Droplets, action: 'water' as const },
    { name: 'Apple (Medium)', icon: Apple, action: 'meal' as const },
    { name: 'Quick Snack', icon: Pizza, action: 'meal' as const }
  ];

  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Zap className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <p className="text-sm text-white/60">Fast track your logging</p>
          </div>
        </div>

        {/* Main Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => onQuickAdd(action.id as any)}
                className={`h-auto p-4 justify-start ${action.bgColor} hover:scale-[1.02] transition-all duration-200`}
              >
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className={`p-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20`}>
                    <Icon className={`h-6 w-6 ${action.textColor}`} />
                  </div>
                  <div className="text-center">
                    <p className={`font-medium text-sm ${action.textColor}`}>
                      {action.title}
                    </p>
                    <p className="text-xs text-white/60">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Quick Add Section */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h4 className="font-medium text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-teal-400" />
            Quick Add
          </h4>

          <div className="space-y-2">
            {quickAddFoods.map((food, index) => {
              const Icon = food.icon;
              return (
                <Button
                  key={index}
                  size="sm"
                  onClick={() => onQuickAdd(food.action)}
                  className="w-full justify-between h-auto p-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-white/60" />
                    <span className="text-sm text-white">{food.name}</span>
                  </div>
                  <Plus className="h-4 w-4 text-white/60" />
                </Button>
              );
            })}
          </div>
        </div>

        {/* Pro Tips */}
        <div className="space-y-2">
          <h4 className="font-medium text-white text-sm">Pro Tips</h4>
          <div className="text-xs text-white/60 space-y-1">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-teal-400 rounded-full mt-1.5 flex-shrink-0" />
              <p>Log meals right after eating for better accuracy</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-teal-400 rounded-full mt-1.5 flex-shrink-0" />
              <p>Use the barcode scanner for packaged foods</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-teal-400 rounded-full mt-1.5 flex-shrink-0" />
              <p>Weigh yourself at the same time daily</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QuickActions;