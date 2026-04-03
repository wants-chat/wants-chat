import * as React from "react"
import { cn } from "../../lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  value?: number | number[] | string;
  onValueChange?: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onChange, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      
      // Call the standard onChange if provided
      if (onChange) {
        onChange(e);
      }
      
      // Also call onValueChange with array format for compatibility
      if (onValueChange) {
        onValueChange([newValue]);
      }
    };

    return (
      <div className="relative w-full">
        <input
          type="range"
          ref={ref}
          value={Array.isArray(value) ? String(value[0]) : String(value || 0)}
          onChange={handleChange}
          className={cn(
            "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-5",
            "[&::-webkit-slider-thumb]:h-5", 
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-primary",
            "[&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:border-primary",
            "[&::-webkit-slider-thumb]:ring-offset-background",
            "[&::-webkit-slider-thumb]:transition-colors",
            "[&::-webkit-slider-thumb]:hover:bg-primary/90",
            "[&::-moz-range-thumb]:w-5",
            "[&::-moz-range-thumb]:h-5",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-primary",
            "[&::-moz-range-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:border-2",
            "[&::-moz-range-thumb]:border-primary",
            "[&::-moz-range-thumb]:hover:bg-primary/90",
            "[&::-webkit-slider-runnable-track]:w-full",
            "[&::-webkit-slider-runnable-track]:h-2",
            "[&::-webkit-slider-runnable-track]:bg-secondary",
            "[&::-webkit-slider-runnable-track]:rounded-lg",
            "[&::-moz-range-track]:w-full",
            "[&::-moz-range-track]:h-2",
            "[&::-moz-range-track]:bg-secondary",
            "[&::-moz-range-track]:rounded-lg",
            "disabled:opacity-50",
            "disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
        {/* Progress fill overlay */}
        <div 
          className="absolute top-0 left-0 h-2 bg-primary rounded-lg pointer-events-none"
          style={{ 
            width: `${((Number(Array.isArray(value) ? value[0] : value || 0) - Number(props.min || 0)) / (Number(props.max || 100) - Number(props.min || 0))) * 100}%` 
          }}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }