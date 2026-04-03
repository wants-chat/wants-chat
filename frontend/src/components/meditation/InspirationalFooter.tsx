import React from 'react';
import Icon from '@mdi/react';
import { mdiMeditation } from '@mdi/js';

export const InspirationalFooter: React.FC = () => {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-lg shrink-0 border border-white/10">
          <Icon path={mdiMeditation} size={1} className="text-teal-400" />
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-white">Today's Inspiration</h3>
          <p className="text-xs text-white/60 italic line-clamp-2">
            "Peace comes from within. Do not seek it without." - Buddha
          </p>
        </div>
      </div>
    </div>
  );
};