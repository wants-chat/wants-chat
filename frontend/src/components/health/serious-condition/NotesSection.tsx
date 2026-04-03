import React from 'react';
import { Notes as NotesIcon, Lightbulb } from '@mui/icons-material';
import { SeriousConditionFormProps } from '../../../types/health';

const NotesSection: React.FC<Omit<SeriousConditionFormProps, 'errors'>> = ({
  formData,
  handleInputChange
}) => {
  const characterCount = formData.notes?.length || 0;
  const maxCharacters = 2000;

  return (
    <div className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
      <div className="p-6 pb-2">
        <h3 className="flex items-center gap-3 text-xl font-bold text-white">
          <NotesIcon className="h-6 w-6 text-teal-400" />
          Additional Notes
        </h3>
        <p className="text-base text-white/60 mt-1">
          Add any additional information about this condition or care instructions
        </p>
      </div>
      <div className="p-6 pt-4 space-y-4">
        {/* Helpful Tips */}
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <Lightbulb className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-300">
            Consider including: triggers, warning signs, dietary restrictions, lifestyle adjustments, or questions for your next doctor visit.
          </p>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Enter any additional information about this condition, symptoms, care instructions, or important notes..."
            className="w-full px-4 py-4 border border-white/20 rounded-xl bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-all duration-200"
            rows={6}
            maxLength={maxCharacters}
          />
          <div className="absolute bottom-3 right-3 text-xs text-white/40">
            {characterCount}/{maxCharacters}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesSection;
