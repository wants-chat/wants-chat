export function generateRadioGroup(): string {
  return `import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, defaultValue, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const currentValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <RadioGroupContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
        <div
          ref={ref}
          className={cn("grid gap-2", className)}
          role="radiogroup"
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange'> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const isChecked = context.value === value;

    const handleClick = () => {
      context.onValueChange?.(value);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isChecked}
        onClick={handleClick}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-gray-300 text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isChecked && "border-blue-600 bg-blue-600",
          className
        )}
        {...props}
      >
        {isChecked && (
          <div className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        )}
        <input
          type="radio"
          value={value}
          checked={isChecked}
          onChange={() => {}}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </button>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem }
`;
}