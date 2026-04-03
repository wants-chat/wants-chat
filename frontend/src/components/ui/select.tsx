import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "../../lib/utils"

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
  selectedLabel: string
  setSelectedLabel: (label: string) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const Select: React.FC<SelectProps> = ({ value = '', onValueChange = () => {}, children }) => {
  const [open, setOpen] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState('')
  const selectRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      // Don't close if clicking the trigger
      if (triggerRef.current?.contains(target)) {
        return
      }

      // Don't close if clicking inside the dropdown content
      if (contentRef.current?.contains(target)) {
        return
      }

      // Otherwise, close the dropdown
      setOpen(false)
    }

    // Add listener after a small delay to prevent immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true)
    }, 50)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }, [open])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, triggerRef, contentRef, selectedLabel, setSelectedLabel }}>
      <div className="relative" ref={selectRef}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>
}

const SelectValue: React.FC<{ placeholder?: string; children?: React.ReactNode }> = ({ placeholder, children }) => {
  const context = React.useContext(SelectContext)
  if (!context) return null

  // Display the selected label if available, fallback to value, then placeholder
  const displayValue = context.selectedLabel || context.value || placeholder || 'Select...'

  return <span>{displayValue}</span>
}

interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, id, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) return null

    const mergedRef = (node: HTMLButtonElement) => {
      context.triggerRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    return (
      <button
        ref={mergedRef}
        id={id}
        type="button"
        onClick={() => context.setOpen(!context.open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white",
          className
        )}
        aria-expanded={context.open}
        aria-haspopup="listbox"
        {...props}
      >
        {children}
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", context.open && "rotate-180")} />
      </button>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })

    React.useEffect(() => {
      const updatePosition = () => {
        if (context?.open && context.triggerRef.current) {
          const rect = context.triggerRef.current.getBoundingClientRect()
          // Use viewport coordinates directly without scrollY/scrollX since we're using fixed positioning
          setPosition({
            top: rect.bottom + 4,  // Just 4px gap below the trigger
            left: rect.left,
            width: rect.width
          })
        }
      }

      if (context?.open) {
        updatePosition()
        window.addEventListener('scroll', updatePosition, true)
        window.addEventListener('resize', updatePosition)
      }

      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }, [context?.open])

    if (!context || !context.open) return null

    const mergedRef = (node: HTMLDivElement) => {
      if (context.contentRef) {
        context.contentRef.current = node
      }
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    const content = (
      <div
        ref={mergedRef}
        className={cn(
          "max-h-60 overflow-auto rounded-lg border shadow-xl",
          "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white",
          className
        )}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${position.width}px`,
          minWidth: '8rem',
          position: 'fixed',
          zIndex: 99999,
        }}
        role="listbox"
        onMouseDown={(e) => {
          // Prevent event from bubbling and closing the dropdown
          e.stopPropagation()
        }}
        {...props}
      >
        <div className="p-1">
          {children}
        </div>
      </div>
    )

    return createPortal(content, document.body)
  }
)
SelectContent.displayName = 'SelectContent'

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = 'SelectLabel'

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) return null

    const isSelected = context.value === value

    // Extract text from children (handles both strings and JSX)
    const extractLabel = (node: React.ReactNode): string => {
      if (typeof node === 'string') return node
      if (typeof node === 'number') return String(node)
      if (Array.isArray(node)) {
        return node.map(extractLabel).join(' ')
      }
      if (React.isValidElement(node)) {
        return extractLabel(node.props.children)
      }
      return value // Fallback to value if we can't extract label
    }

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Update value
      context.onValueChange(value)

      // Store the label for display - use value as label
      context.setSelectedLabel(value)

      // Close dropdown immediately
      context.setOpen(false)
    }

    // Set initial label when component mounts and value matches
    React.useEffect(() => {
      if (isSelected) {
        // Use value as the label to display
        context.setSelectedLabel(value)
      }
    }, [isSelected, value])

    return (
      <div
        ref={ref}
        onMouseDown={handleClick}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none transition-colors",
          "text-slate-900 dark:text-white",
          "hover:bg-slate-100 dark:hover:bg-slate-700",
          "focus:bg-slate-100 dark:focus:bg-slate-700",
          isSelected && "bg-slate-100 dark:bg-slate-700 font-medium",
          className
        )}
        role="option"
        aria-selected={isSelected}
        {...props}
      >
        {isSelected && (
          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-teal-500 dark:text-teal-400">
            <Check className="h-4 w-4" />
          </span>
        )}
        {children}
      </div>
    )
  }
)
SelectItem.displayName = 'SelectItem'

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-white/20", className)}
    {...props}
  />
))
SelectSeparator.displayName = 'SelectSeparator'

const SelectScrollUpButton: React.FC = () => null
const SelectScrollDownButton: React.FC = () => null

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}