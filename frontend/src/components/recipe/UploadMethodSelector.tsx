import React from 'react';
import { FileText, Image, Video, Link, ChefHat } from 'lucide-react';
import { UploadMethod } from '../../types/recipe';

interface UploadMethodSelectorProps {
  uploadMethod: UploadMethod;
  onUploadMethodChange: (method: UploadMethod) => void;
}

export const UploadMethodSelector: React.FC<UploadMethodSelectorProps> = ({
  uploadMethod,
  onUploadMethodChange
}) => {
  const methods = [
    {
      id: 'manual' as UploadMethod,
      icon: FileText,
      label: 'Manual Entry',
      description: 'Enter recipe details manually'
    },
    {
      id: 'image' as UploadMethod,
      icon: Image,
      label: 'Upload Image',
      description: 'AI will analyze your recipe image'
    },
    {
      id: 'video' as UploadMethod,
      icon: Video,
      label: 'Upload Video',
      description: 'AI will extract recipe from video'
    },
    {
      id: 'url' as UploadMethod,
      icon: Link,
      label: 'Video URL',
      description: 'Analyze recipe from video URL'
    }
  ];

  return (
    <div className="mb-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-l-teal-500 p-6">
      <div className="mb-4">
        <h2 className="flex items-center gap-3 text-xl font-bold text-white">
          <ChefHat className="h-6 w-6 text-teal-400" />
          Recipe Input Method
        </h2>
        <p className="text-base text-white/60 mt-1">
          Choose how you would like to add your recipe
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onUploadMethodChange(method.id)}
            className={`rounded-xl text-sm h-16 flex flex-col items-center justify-center gap-2 p-4 transition-all duration-200 ${
              uploadMethod === method.id
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                : 'bg-white/5 border border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <method.icon className="h-5 w-5" />
            {method.label}
          </button>
        ))}
      </div>
    </div>
  );
};