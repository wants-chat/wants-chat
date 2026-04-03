# Global Theme Support Guide

## Overview

All React component generators must support the global theme system. Themes are managed via `ui-config.ts` which contains static theme constants that can be updated at runtime.

## How It Works

1. **Theme Source**: `/frontend/src/lib/ui-config.ts`
   ```typescript
   export const UI_VARIANT: DesignVariant = 'glassmorphism';
   export const UI_COLOR_SCHEME: ColorScheme = 'red';
   ```

2. **Component Usage**: Components import these constants and use them as defaults
3. **Runtime Update**: Backend updates `ui-config.ts` → Frontend reloads → New theme applies

## Required Pattern for Component Generators

### ✅ CORRECT: Use Global Theme Constants

```typescript
// In your generator file (e.g., hero-section.generator.ts)

export const generateMyComponent = (resolved: ResolvedComponent) => {
  return `
import React from 'react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface MyComponentProps {
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
}

export default function MyComponent({
  className,
  variant = UI_VARIANT,        // ✅ Use global constant
  colorScheme = UI_COLOR_SCHEME // ✅ Use global constant
}: MyComponentProps) {
  const styles = getVariantStyles(variant, colorScheme);

  return (
    <div className={cn(styles.container, className)}>
      {/* Your component JSX */}
    </div>
  );
}
`;
};
```

### ❌ WRONG: Hardcoded Theme Values

```typescript
// DON'T DO THIS:
export default function MyComponent({
  variant = 'minimal',      // ❌ Hardcoded
  colorScheme = 'blue'      // ❌ Hardcoded
}: MyComponentProps) {
  // ...
}
```

## Checklist for Component Generators

When creating or updating a component generator:

- [ ] Import `UI_VARIANT` and `UI_COLOR_SCHEME` from `@/lib/ui-config`
- [ ] Import `getVariantStyles` from `@/lib/design-variants`
- [ ] Add `variant?: DesignVariant` prop (optional)
- [ ] Add `colorScheme?: ColorScheme` prop (optional)
- [ ] Set default values to `UI_VARIANT` and `UI_COLOR_SCHEME`
- [ ] Call `getVariantStyles(variant, colorScheme)` to get theme styles
- [ ] Apply styles using `cn()` utility for className merging

## Import Order

```typescript
// 1. React imports
import React from 'react';

// 2. Third-party imports
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

// 3. Internal utilities
import { cn } from '@/lib/utils';

// 4. Theme imports (ALWAYS TOGETHER)
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

// 5. UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

## Testing Theme Support

After updating a generator:

1. **Generate an app**: Create a new app or regenerate existing
2. **Check imports**: Verify generated component has correct imports
3. **Check defaults**: Verify props default to `UI_VARIANT` and `UI_COLOR_SCHEME`
4. **Test update**: Change theme in app-detail Settings → Reload → Verify theme applies

## Quick Fix Script

If you have multiple generators to update, use this pattern:

```bash
# 1. Add UI_VARIANT import after design-variants import
sed -i '' '/import.*design-variants/a\
import { UI_VARIANT, UI_COLOR_SCHEME } from '\''@/lib/ui-config'\'';
' your-file.generator.ts

# 2. Replace hardcoded defaults
sed -i '' "s/variant = 'minimal'/variant = UI_VARIANT/g" your-file.generator.ts
sed -i '' "s/colorScheme = 'blue'/colorScheme = UI_COLOR_SCHEME/g" your-file.generator.ts
```

## Available Theme Values

### Design Variants
- `minimal` - Clean and simple
- `glassmorphism` - Frosted glass effect
- `neumorphism` - Soft 3D shadows
- `brutalist` - Bold and raw
- `corporate` - Professional business look
- `creative` - Colorful gradients

### Color Schemes
- `blue`, `purple`, `green`, `orange`, `pink`
- `indigo`, `teal`, `red`, `neutral`, `warm`

## Examples

### Simple Component
```typescript
export default function SimpleCard({
  title,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: SimpleCardProps) {
  const styles = getVariantStyles(variant, colorScheme);

  return (
    <div className={cn(styles.card, styles.cardHover)}>
      <h3 className={styles.title}>{title}</h3>
    </div>
  );
}
```

### Component with Custom Styles
```typescript
export default function CustomComponent({
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME,
  className
}: CustomProps) {
  const styles = getVariantStyles(variant, colorScheme);

  return (
    <div className={cn(
      styles.container,
      styles.background,
      'p-6 rounded-lg', // Custom Tailwind classes
      className         // User-provided classes
    )}>
      <button className={cn(styles.button, styles.buttonHover)}>
        Click Me
      </button>
    </div>
  );
}
```

## Common Mistakes

### ❌ Forgetting to import ui-config
```typescript
// Missing: import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
variant = 'minimal' // Will fail - UI_VARIANT is undefined
```

### ❌ Not using constants as defaults
```typescript
variant?: DesignVariant = 'minimal' // Wrong - hardcoded
variant?: DesignVariant = UI_VARIANT // Correct - uses global
```

### ❌ Calling getVariantStyles with hardcoded values
```typescript
const styles = getVariantStyles('minimal', 'blue'); // Wrong
const styles = getVariantStyles(variant, colorScheme); // Correct
```

## Questions?

If you're unsure about theme support, check these reference files:
- `/generators/react-components/core/layout.generator.ts`
- `/generators/react-components/core/sidebar.generator.ts`
- `/generators/react-components/ui/react/common/hero-section.generator.ts`

These are fully implemented with proper theme support.
