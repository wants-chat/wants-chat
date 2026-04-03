import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={cn(
      "animate-pulse bg-gradient-to-r from-muted to-muted-foreground/5",
      className
    )}
  />
);

export const StatCardSkeleton = () => (
  <div className="bg-card p-6 rounded-lg shadow-sm border">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-8 w-32 rounded" />
      </div>
      <Skeleton className="h-12 w-12 rounded-lg" />
    </div>
    <div className="mt-4 space-y-1">
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
    </div>
  </div>
);

export const MealCardSkeleton = () => (
  <div className="bg-card rounded-lg p-4 shadow-sm border">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
      <Skeleton className="h-8 w-8 rounded" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-32 rounded" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  </div>
);

export const FoodItemSkeleton = () => (
  <div className="flex items-center justify-between p-4 hover:bg-accent rounded-lg">
    <div className="flex items-center space-x-3">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-48 rounded" />
        <Skeleton className="h-3 w-32 rounded" />
      </div>
    </div>
    <Skeleton className="h-8 w-8 rounded-full" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-card p-6 rounded-lg shadow-sm border">
    <Skeleton className="h-6 w-32 rounded mb-4" />
    <div className="h-64 flex items-end justify-between space-x-2">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end">
          <div
            className="w-full bg-gradient-to-r from-muted to-muted-foreground/5 animate-pulse rounded"
            style={{
              height: `${Math.random() * 60 + 40}%`,
            }}
          />
        </div>
      ))}
    </div>
    <div className="flex justify-between mt-4">
      {[...Array(7)].map((_, i) => (
        <Skeleton key={i} className="h-3 w-8 rounded" />
      ))}
    </div>
  </div>
);

export const ProgressRingSkeleton = () => (
  <div className="relative h-32 w-32">
    <Skeleton className="absolute inset-0 rounded-full" />
    <div className="absolute inset-2 bg-background rounded-full" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-1">
        <Skeleton className="h-6 w-16 rounded mx-auto" />
        <Skeleton className="h-3 w-12 rounded mx-auto" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Welcome Section */}
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-4 rounded-xl border border-border">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-48 rounded mb-2" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <Skeleton className="h-8 w-8 rounded mx-auto mb-1" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="text-center">
            <Skeleton className="h-8 w-8 rounded mx-auto mb-1" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
      </div>
    </div>

    {/* Date Navigation */}
    <div className="flex items-center justify-between bg-card p-3 rounded-lg border">
      <Skeleton className="h-8 w-8 rounded" />
      <div className="text-center">
        <Skeleton className="h-5 w-20 rounded mb-1 mx-auto" />
        <Skeleton className="h-3 w-32 rounded mx-auto" />
      </div>
      <Skeleton className="h-8 w-8 rounded" />
    </div>
    
    {/* Primary Section */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Today's Nutrition Card */}
      <div className="bg-card p-5 border rounded-lg lg:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-6 w-36 rounded" />
        </div>
        
        {/* Calories Section */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-6 w-20 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="flex justify-between pt-2 border-t">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
            </div>
            <div className="mt-3">
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-24 rounded mt-1" />
            </div>
          </div>
          
          {/* Recent Meals */}
          <div>
            <Skeleton className="h-4 w-24 rounded mb-2" />
            <div className="space-y-1">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="p-2 bg-secondary/10 rounded border border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-4 w-32 rounded mb-1" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16 rounded mb-1" />
                      <Skeleton className="h-3 w-24 rounded text-xs" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-5 w-12 rounded mx-auto mb-1" />
                <Skeleton className="h-3 w-14 rounded mx-auto" />
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 rounded" />
            <Skeleton className="h-10 rounded" />
          </div>
        </div>
      </div>
      
      {/* Calories & Macros Progress */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <Skeleton className="h-6 w-32 rounded mb-4" />
          <div className="flex justify-center">
            <ProgressRingSkeleton />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-5 w-12 rounded mx-auto mb-1" />
                <Skeleton className="h-3 w-16 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <Skeleton className="h-6 w-40 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    
    {/* Secondary Section - Water & Weight */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <Skeleton className="h-6 w-32 rounded mb-4" />
        <div className="flex items-center justify-center gap-2 mb-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-8 rounded" />
          ))}
        </div>
        <Skeleton className="h-4 w-32 rounded mx-auto" />
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <Skeleton className="h-6 w-36 rounded mb-4" />
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-24 rounded mb-1" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
          <Skeleton className="h-10 w-24 rounded" />
        </div>
      </div>
    </div>
    
    {/* Quick Actions */}
    <div className="bg-card p-4 rounded-lg shadow-sm border">
      <Skeleton className="h-5 w-24 rounded mb-3" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
    
    {/* AI Components */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-card p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-5 w-32 rounded mb-1" />
                <Skeleton className="h-3 w-48 rounded" />
              </div>
            </div>
            <Skeleton className="h-5 w-5 rounded" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Motivational Footer */}
    <div className="bg-gradient-to-r from-primary/5 to-emerald-500/5 p-4 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-24 rounded mb-1" />
            <Skeleton className="h-3 w-64 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-8 w-28 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export const FoodSearchSkeleton = () => (
  <div className="space-y-4">
    <div className="flex space-x-2">
      <Skeleton className="h-10 flex-1 rounded-lg" />
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>
    
    <div className="flex space-x-2">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-8 w-20 rounded-full" />
      ))}
    </div>
    
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <FoodItemSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const DiaryPageSkeleton = () => (
  <div className="space-y-6">
    {/* Date Navigation */}
    <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
      <Skeleton className="h-8 w-8 rounded" />
      <div className="text-center">
        <Skeleton className="h-6 w-20 rounded mb-1 mx-auto" />
        <Skeleton className="h-4 w-32 rounded mx-auto" />
      </div>
      <Skeleton className="h-8 w-8 rounded" />
    </div>
    
    {/* Daily Summary */}
    <div className="bg-card p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-12 rounded" />
              <Skeleton className="h-4 w-16 rounded text-xs" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
    
    {/* Quick Add Section */}
    <div className="bg-card p-4 rounded-lg border">
      <Skeleton className="h-5 w-20 rounded mb-3" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded" />
        <Skeleton className="h-10 w-20 rounded" />
        <Skeleton className="h-10 w-20 rounded" />
        <Skeleton className="h-10 w-16 rounded" />
      </div>
    </div>
    
    {/* Meal Sections */}
    <div className="space-y-4">
      {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => (
        <div key={meal} className="bg-card rounded-lg border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          </div>
          <div className="p-4 bg-muted/20">
            <Skeleton className="h-4 w-48 rounded mx-auto" />
          </div>
          <div className="p-4 grid grid-cols-4 gap-4 text-center">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-8 rounded mx-auto mb-1" />
                <Skeleton className="h-3 w-12 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    
    {/* Water Tracker */}
    <div className="bg-card p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton className="h-6 w-28 rounded mb-1" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <Skeleton className="h-5 w-12 rounded" />
      </div>
      <Skeleton className="h-3 w-full rounded-full mb-4" />
      <div className="flex gap-2 justify-center">
        <Skeleton className="h-9 w-20 rounded" />
        <Skeleton className="h-9 w-20 rounded" />
        <Skeleton className="h-9 w-16 rounded" />
      </div>
    </div>
  </div>
);

export const ProgressPageSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
    
    <ChartSkeleton />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
    
    <div className="bg-card p-6 rounded-lg shadow-sm border">
      <Skeleton className="h-6 w-32 rounded mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const FastingPageSkeleton = () => (
  <div className="space-y-6">
    {/* Plan Selector Skeleton */}
    <div className="bg-card p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-10 w-32 rounded" />
      </div>
    </div>
    
    {/* Stats Skeleton */}
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-card p-8 rounded-lg shadow-sm border text-center">
        <Skeleton className="h-12 w-12 rounded mb-2 mx-auto" />
        <Skeleton className="h-4 w-20 rounded mx-auto" />
      </div>
      <div className="bg-card p-8 rounded-lg shadow-sm border text-center">
        <Skeleton className="h-12 w-12 rounded mb-2 mx-auto" />
        <Skeleton className="h-4 w-28 rounded mx-auto" />
      </div>
    </div>
    
    {/* History Skeleton */}
    <div className="bg-card p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-28 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded">
            <div className="space-y-1">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
    
    {/* Benefits Skeleton */}
    <div className="bg-gradient-to-br from-primary/5 to-transparent p-6 rounded-lg border">
      <Skeleton className="h-6 w-32 rounded mb-4" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 rounded-full mt-0.5 flex-shrink-0" />
            <Skeleton className="h-4 flex-1 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ProfilePageSkeleton = () => (
  <div className="space-y-6">
    {/* Profile Header Skeleton */}
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 rounded-xl border">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-8 w-40 rounded" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
          <Skeleton className="h-5 w-48 rounded" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <div className="flex gap-6">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
      </div>
    </div>
    
    {/* Tab Navigation Skeleton */}
    <div className="flex gap-4 border-b">
      <Skeleton className="h-10 w-24 rounded-t" />
      <Skeleton className="h-10 w-32 rounded-t" />
    </div>
    
    {/* Content Section */}
    <div className="space-y-6">
      {/* Weight Goal Card */}
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <div className="mb-4">
          <Skeleton className="h-6 w-24 rounded mb-2" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-8 w-12 rounded mx-auto mb-1" />
              <Skeleton className="h-3 w-10 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Personal Information Card */}
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <Skeleton className="h-6 w-40 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);