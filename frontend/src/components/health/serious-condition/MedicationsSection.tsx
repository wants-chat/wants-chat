import React from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Medication as Pill, Add as Plus, Close } from '@mui/icons-material';
import { SeriousConditionFormProps } from '../../../types/health';

interface MedicationsSectionProps extends Omit<SeriousConditionFormProps, 'errors'> {
  currentMedication: string;
  onCurrentMedicationChange: (value: string) => void;
  onAddMedication: () => void;
  onRemoveMedication: (medication: string) => void;
}

const MedicationsSection: React.FC<MedicationsSectionProps> = ({
  formData,
  handleInputChange,
  currentMedication,
  onCurrentMedicationChange,
  onAddMedication,
  onRemoveMedication
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddMedication();
    }
  };

  return (
    <div className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
      <div className="p-6 pb-2">
        <h3 className="flex items-center gap-3 text-xl font-bold text-white">
          <Pill className="h-6 w-6 text-teal-400" />
          Medications
        </h3>
        <p className="text-base text-white/60 mt-1">
          Add medications for this condition
        </p>
      </div>
      <div className="p-6 pt-4 space-y-5">
        {/* Input Section */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Pill className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              value={currentMedication}
              onChange={(e) => onCurrentMedicationChange(e.target.value)}
              placeholder="Enter medication name (e.g., Metformin 500mg)"
              onKeyPress={handleKeyPress}
              className="pl-11 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <Button
            onClick={onAddMedication}
            disabled={!currentMedication.trim()}
            className="h-12 px-5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add
          </Button>
        </div>

        {/* Medications List */}
        {formData.medications.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white/80">
                Current Medications
              </h4>
              <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                {formData.medications.length} medication{formData.medications.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.medications.map((medication, index) => (
                <div
                  key={medication}
                  className="group flex items-center gap-2 px-4 py-2.5 bg-teal-500/10 border border-teal-500/20 rounded-xl hover:border-teal-500/40 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-7 h-7 bg-teal-500/20 rounded-lg">
                    <Pill className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {medication}
                  </span>
                  <button
                    onClick={() => onRemoveMedication(medication)}
                    className="ml-1 p-1 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors duration-200"
                    title="Remove medication"
                  >
                    <Close className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {formData.medications.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-white/20 rounded-xl">
            <Pill className="h-10 w-10 text-white/30 mx-auto mb-2" />
            <p className="text-sm text-white/50">
              No medications added yet
            </p>
            <p className="text-xs text-white/40 mt-1">
              Type a medication name above and click Add
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationsSection;
