import React, { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Activity } from '../../types/ai-travel-planner';

interface AddActivityFormProps {
  dayIndex: number;
  onSave: (dayIndex: number, newActivity: Partial<Activity>) => void;
  onCancel: () => void;
}

const AddActivityForm: React.FC<AddActivityFormProps> = ({ dayIndex, onSave, onCancel }) => {
  const [category, setCategory] = useState<string>('sightseeing');
  const handleSubmit = () => {
    const name = (document.getElementById(`name-${dayIndex}`) as HTMLInputElement)?.value;
    const time = (document.getElementById(`time-${dayIndex}`) as HTMLInputElement)?.value;
    const description = (document.getElementById(`description-${dayIndex}`) as HTMLInputElement)
      ?.value;
    const location = (document.getElementById(`location-${dayIndex}`) as HTMLInputElement)?.value;
    const duration = (document.getElementById(`duration-${dayIndex}`) as HTMLInputElement)?.value;
    const cost = parseFloat(
      (document.getElementById(`cost-${dayIndex}`) as HTMLInputElement)?.value || '0',
    );
    const categoryValue = category as Activity['category'];
    const image = (document.getElementById(`image-${dayIndex}`) as HTMLInputElement)?.value;

    onSave(dayIndex, {
      name,
      time,
      description,
      location,
      duration,
      cost,
      category: categoryValue,
      image,
    });
  };

  return (
    <div className="border-2 border-dashed border-teal-500/50 rounded-xl p-3 sm:p-4 bg-teal-500/10">
      <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base text-white">
        <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
        Add New Activity
      </h4>
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id={`name-${dayIndex}`}
            placeholder="Activity name"
            className="h-9 sm:h-10 rounded-xl text-sm bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
          <Input
            id={`time-${dayIndex}`}
            placeholder="Time (e.g., 10:00 AM)"
            className="h-9 sm:h-10 rounded-xl text-sm bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
        </div>
        <Input
          id={`description-${dayIndex}`}
          placeholder="Description"
          className="h-9 sm:h-10 rounded-xl text-sm bg-white/5 border-white/20 text-white placeholder:text-white/40"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            id={`location-${dayIndex}`}
            placeholder="Location"
            className="h-9 sm:h-10 rounded-xl text-sm bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
          <Input
            id={`duration-${dayIndex}`}
            placeholder="Duration (e.g., 2 hours)"
            className="h-9 sm:h-10 rounded-xl text-sm bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
          <Input
            id={`cost-${dayIndex}`}
            type="number"
            placeholder="Cost ($)"
            className="h-9 sm:h-10 rounded-xl text-sm bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger className="h-9 sm:h-10 rounded-xl text-sm bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-teal-800/90 backdrop-blur-xl border-white/20">
              <SelectItem value="sightseeing" className="text-white hover:bg-white/10">Sightseeing</SelectItem>
              <SelectItem value="adventure" className="text-white hover:bg-white/10">Adventure</SelectItem>
              <SelectItem value="culture" className="text-white hover:bg-white/10">Culture</SelectItem>
              <SelectItem value="shopping" className="text-white hover:bg-white/10">Shopping</SelectItem>
              <SelectItem value="relaxation" className="text-white hover:bg-white/10">Relaxation</SelectItem>
              <SelectItem value="entertainment" className="text-white hover:bg-white/10">Entertainment</SelectItem>
            </SelectContent>
          </Select>
          <Input
            id={`image-${dayIndex}`}
            placeholder="Image URL (optional)"
            className="h-9 sm:h-10 rounded-xl text-sm bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl text-xs sm:text-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-xs sm:text-sm"
          >
            <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Add Activity
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddActivityForm;