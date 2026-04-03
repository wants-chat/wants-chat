import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { VitalSection } from '../../../types/health';

interface VitalSectionSelectorProps {
  sections: VitalSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const VitalSectionSelector: React.FC<VitalSectionSelectorProps> = ({
  sections,
  activeSection,
  onSectionChange
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {sections.map((section) => {
        const IconComponent = section.icon;
        return (
          <Card
            key={section.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              activeSection === section.id
                ? 'border-2 border-teal-500 bg-gradient-to-br from-teal-500/20 to-cyan-500/20'
                : 'border-2 border-white/10 bg-white/5 hover:border-teal-500/50 hover:bg-white/10'
            }`}
            onClick={() => onSectionChange(section.id)}
          >
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-500/20"
                >
                  <IconComponent className="h-6 w-6 text-teal-400" />
                </div>
                <span className="text-sm font-medium text-white">
                  {section.label}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default VitalSectionSelector;
