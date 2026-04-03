import * as React from "react"
import { cn } from "../../lib/utils"

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  defaultChecked?: boolean
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, defaultChecked = false, onClick, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
    
    const isChecked = checked !== undefined ? checked : internalChecked

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      const newChecked = !isChecked
      
      if (onCheckedChange) {
        onCheckedChange(newChecked)
      } else {
        setInternalChecked(newChecked)
      }
      
      onClick?.(event)
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        data-state={isChecked ? "checked" : "unchecked"}
        ref={ref}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span
          data-state={isChecked ? "checked" : "unchecked"}
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
          )}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }