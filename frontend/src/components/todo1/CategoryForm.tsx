import React, { useState, useEffect } from 'react';
import { Category } from '../../types/todo1';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { FolderOpen, Palette } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CategoryFormProps {
  onSubmit: (category: Partial<Category>) => void;
  category?: Category | null;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
];

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit, category }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color || '#3b82f6');
    } else {
      setName('');
      setColor('#3b82f6');
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...category, name, color });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-white">
          Category Name
        </Label>
        <div className="relative">
          <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter category name..."
            className="pl-10 bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/40"
            required
          />
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-white flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Category Color
        </Label>

        {/* Color Preview */}
        <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
          <div
            className="w-10 h-10 rounded-lg shadow-inner border-2 border-white/20"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {name || 'Category Preview'}
            </p>
            <p className="text-xs text-white/60">
              {color.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Preset Colors */}
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              onClick={() => setColor(presetColor)}
              className={cn(
                "w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110",
                color === presetColor
                  ? "ring-2 ring-offset-2 ring-teal-400 ring-offset-transparent"
                  : "hover:ring-2 hover:ring-white/30"
              )}
              style={{ backgroundColor: presetColor }}
            />
          ))}
        </div>

        {/* Custom Color Picker */}
        <div className="flex items-center gap-3">
          <Label htmlFor="customColor" className="text-xs text-white/60">
            Custom:
          </Label>
          <input
            id="customColor"
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-10 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
          <Input
            type="text"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-24 h-8 text-xs font-mono bg-white/10 border-white/20 text-white placeholder:text-white/40"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button type="submit" className="px-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
          {category ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
