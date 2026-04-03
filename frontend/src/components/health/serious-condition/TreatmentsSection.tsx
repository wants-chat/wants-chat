import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { LocalHospital, Add as Plus, Close, CalendarMonth, Repeat, Notes } from '@mui/icons-material';
import { SeriousConditionFormProps, TreatmentItem } from '../../../types/health';

interface TreatmentsSectionProps extends Omit<SeriousConditionFormProps, 'errors'> {
  currentTreatment: TreatmentItem;
  treatmentTypes: string[];
  frequencies: string[];
  onTreatmentChange: (field: keyof TreatmentItem, value: string) => void;
  onAddTreatment: () => void;
  onRemoveTreatment: (index: number) => void;
}

const TreatmentsSection: React.FC<TreatmentsSectionProps> = ({
  formData,
  handleInputChange,
  currentTreatment,
  treatmentTypes,
  frequencies,
  onTreatmentChange,
  onAddTreatment,
  onRemoveTreatment
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
      <div className="p-6 pb-2">
        <h3 className="flex items-center gap-3 text-xl font-bold text-white">
          <LocalHospital className="h-6 w-6 text-teal-400" />
          Treatments
        </h3>
        <p className="text-base text-white/60 mt-1">
          Add current and past treatments for this condition
        </p>
      </div>
      <div className="p-6 pt-4 space-y-6">
        {/* Add Treatment Form */}
        <div className="p-5 border-2 border-dashed border-teal-500/30 rounded-xl bg-teal-500/5">
          <h4 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-teal-400" />
            Add New Treatment
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="treatmentType" className="text-sm font-medium text-white/60">
                  Treatment Type
                </Label>
                <Select value={currentTreatment.type} onValueChange={(value) => onTreatmentChange('type', value)}>
                  <SelectTrigger id="treatmentType" className="h-11 rounded-xl bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select treatment type" />
                  </SelectTrigger>
                  <SelectContent className="bg-teal-800/90 border-teal-400/30">
                    {treatmentTypes.map(type => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-white/10 focus:bg-white/10">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="treatmentStartDate" className="text-sm font-medium text-white/60">
                    Start Date
                  </Label>
                  <Input
                    id="treatmentStartDate"
                    type="date"
                    value={currentTreatment.start_date}
                    onChange={(e) => onTreatmentChange('start_date', e.target.value)}
                    className="h-11 rounded-xl bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="treatmentEndDate" className="text-sm font-medium text-white/60">
                    End Date
                  </Label>
                  <Input
                    id="treatmentEndDate"
                    type="date"
                    value={currentTreatment.end_date}
                    onChange={(e) => onTreatmentChange('end_date', e.target.value)}
                    className="h-11 rounded-xl bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="treatmentFrequency" className="text-sm font-medium text-white/60">
                  Frequency
                </Label>
                <Select value={currentTreatment.frequency} onValueChange={(value) => onTreatmentChange('frequency', value)}>
                  <SelectTrigger id="treatmentFrequency" className="h-11 rounded-xl bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="bg-teal-800/90 border-teal-400/30">
                    {frequencies.map(freq => (
                      <SelectItem key={freq} value={freq} className="text-white hover:bg-white/10 focus:bg-white/10">{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentNotes" className="text-sm font-medium text-white/60">
                  Notes (Optional)
                </Label>
                <Input
                  id="treatmentNotes"
                  value={currentTreatment.notes}
                  onChange={(e) => onTreatmentChange('notes', e.target.value)}
                  placeholder="Additional treatment details"
                  className="h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <Button
                onClick={onAddTreatment}
                disabled={!currentTreatment.type}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Treatment
              </Button>
            </div>
          </div>
        </div>

        {/* Treatment List */}
        {formData.treatments.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white/80">
                Added Treatments
              </h4>
              <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                {formData.treatments.length} treatment{formData.treatments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid gap-3">
              {formData.treatments.map((treatment, index) => (
                <div
                  key={index}
                  className="group relative p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-lg">
                          <LocalHospital className="h-4 w-4 text-blue-400" />
                        </div>
                        <h5 className="font-semibold text-white">
                          {treatment.type}
                        </h5>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        {(treatment.start_date || treatment.end_date) && (
                          <div className="flex items-center gap-1.5 text-white/60">
                            <CalendarMonth className="h-3.5 w-3.5" />
                            <span>
                              {formatDate(treatment.start_date)}
                              {treatment.end_date && ` - ${formatDate(treatment.end_date)}`}
                            </span>
                          </div>
                        )}
                        {treatment.frequency && (
                          <div className="flex items-center gap-1.5 text-white/60">
                            <Repeat className="h-3.5 w-3.5" />
                            <span>{treatment.frequency}</span>
                          </div>
                        )}
                      </div>
                      {treatment.notes && (
                        <div className="flex items-start gap-1.5 mt-2 text-sm text-white/50">
                          <Notes className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span className="italic">{treatment.notes}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveTreatment(index)}
                      className="p-1.5 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors duration-200"
                      title="Remove treatment"
                    >
                      <Close className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {formData.treatments.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-white/20 rounded-xl">
            <LocalHospital className="h-10 w-10 text-white/30 mx-auto mb-2" />
            <p className="text-sm text-white/50">
              No treatments added yet
            </p>
            <p className="text-xs text-white/40 mt-1">
              Fill in the form above and click "Add Treatment"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentsSection;
