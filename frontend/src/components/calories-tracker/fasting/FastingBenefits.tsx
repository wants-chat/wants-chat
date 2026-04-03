import React from 'react';
import { Card } from '../../ui/card';
import Icon from '@mdi/react';
import { mdiInformation } from '@mdi/js';

const FastingBenefits: React.FC = () => {
  const benefits = [
    'Promotes weight loss by utilizing stored fat for energy',
    'Improves insulin sensitivity and blood sugar control',
    'Triggers cellular repair and autophagy',
    'May improve brain function and mental clarity'
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/20">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon path={mdiInformation} size={1} className="text-cyan-400" />
          <h3 className="font-semibold text-white">Fasting Benefits</h3>
        </div>

        <div className="text-sm text-white/70 space-y-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
              <p>{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default FastingBenefits;