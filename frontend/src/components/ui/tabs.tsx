import * as React from "react"
import { cn } from "../../lib/utils"

interface TabsContextValue {
  value?: string
  onValueChange?: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value, onValueChange, defaultValue, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    
    const currentValue = value !== undefined ? value : internalValue
    const handleValueChange = React.useCallback((newValue: string) => {
      if (onValueChange) {
        onValueChange(newValue)
      } else {
        setInternalValue(newValue)
      }
    }, [onValueChange])

    const contextValue = React.useMemo(() => ({
      value: currentValue,
      onValueChange: handleValueChange
    }), [currentValue, handleValueChange])

    return (
      <TabsContext.Provider value={contextValue}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-white/10 p-1 text-white/60 border border-white/20",
      className
    )}
    role="tablist"
    {...props}
  />
))
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, onClick, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    
    if (!context) {
      throw new Error("TabsTrigger must be used within Tabs")
    }

    const isActive = context.value === value

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      context.onValueChange?.(value)
      onClick?.(event)
    }

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white/60 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-sm",
          className
        )}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    
    if (!context) {
      throw new Error("TabsContent must be used within Tabs")
    }

    const isActive = context.value === value

    if (!isActive) {
      return null
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={isActive ? "active" : "inactive"}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }