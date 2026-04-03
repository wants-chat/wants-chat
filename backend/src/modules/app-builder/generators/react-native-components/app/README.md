# React Native App Core Generators

This directory contains standalone generator functions for core React Native application files. These generators were extracted from the `react-native-mobile-generator.service.ts` and modularized for better code organization and reusability.

## Overview

Each generator is a pure function that returns a string containing the generated code for a specific file. This modular approach allows for:

- Independent testing of each generator
- Easy reuse across different services
- Better separation of concerns
- Cleaner, more maintainable code

## Available Generators

### 1. generateAppTsx

**File**: `app-tsx.generator.ts`

Generates the root `App.tsx` component that serves as the application entry point.

**Signature**:
```typescript
function generateAppTsx(
  blueprint: AppBlueprint,
  appTypeRequiresAuth: (appType: string) => boolean,
): string
```

**Output**: Root App component with:
- QueryClientProvider for React Query
- Conditional AuthProvider based on app type
- NavigationContainer from React Navigation
- StatusBar configuration

**Parameters**:
- `blueprint`: Application blueprint containing metadata
- `appTypeRequiresAuth`: Function to determine if authentication is required

### 2. generateIndexTs

**File**: `index-ts.generator.ts`

Generates a barrel export file for the src directory.

**Signature**:
```typescript
function generateIndexTs(): string
```

**Output**:
```typescript
export { default } from './App';
```

### 3. generateUtilsFile

**File**: `utils.generator.ts`

Generates utility functions for common operations.

**Signature**:
```typescript
function generateUtilsFile(): string
```

**Output**: Three utility functions:
- `cn()`: Class name concatenation utility
- `formatDate()`: Format dates to locale-specific strings
- `formatCurrency()`: Format numbers as USD currency

### 4. generateThemeColors

**File**: `theme-colors.generator.ts`

Generates a color palette for the application theme.

**Signature**:
```typescript
function generateThemeColors(): string
```

**Output**: Color object with:
- Primary and secondary colors
- Status colors (success, warning, error)
- Background and card colors
- Text and text secondary colors
- Border color

**Colors**:
- Primary: `#3b82f6` (Blue)
- Secondary: `#8b5cf6` (Purple)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Error: `#ef4444` (Red)
- Background: `#f9fafb` (Light Gray)
- Card: `#ffffff` (White)
- Text: `#111827` (Dark Gray)
- Text Secondary: `#6b7280` (Medium Gray)
- Border: `#e5e7eb` (Light Border)

### 5. generateTypography

**File**: `typography.generator.ts`

Generates typography styles for the application.

**Signature**:
```typescript
function generateTypography(): string
```

**Output**: Typography scale with:
- `h1`: 32px, bold
- `h2`: 24px, bold
- `h3`: 20px, 600 weight
- `body`: 16px, normal
- `small`: 14px, normal

## Usage

### Import All Generators

```typescript
import {
  generateAppTsx,
  generateIndexTs,
  generateUtilsFile,
  generateThemeColors,
  generateTypography,
} from './react-native-components/app';
```

### Import Individual Generators

```typescript
import { generateAppTsx } from './react-native-components/app/app-tsx.generator';
import { generateUtilsFile } from './react-native-components/app/utils.generator';
```

### Example Usage

```typescript
const blueprint = { /* ... */ };

// Generate App.tsx
const appTsx = generateAppTsx(blueprint, (appType) => {
  return ['CRM', 'E-Commerce', 'Blog Platform', 'Dashboard'].includes(appType);
});

// Generate utility functions
const utils = generateUtilsFile();

// Generate theme colors
const colors = generateThemeColors();

// Generate typography
const typography = generateTypography();

// Generate index export
const index = generateIndexTs();

// Add to files object
const files = {
  'App.tsx': appTsx,
  'lib/utils.ts': utils,
  'theme/colors.ts': colors,
  'theme/typography.ts': typography,
  'index.ts': index,
};
```

## Integration with Service

To use these generators in the `react-native-mobile-generator.service.ts`:

```typescript
import {
  generateAppTsx,
  generateIndexTs,
  generateUtilsFile,
  generateThemeColors,
  generateTypography,
} from './react-native-components/app';

export class ReactNativeMobileGeneratorService {
  private generateSrcFiles(blueprint: AppBlueprint): Record<string, string> {
    const files: Record<string, string> = {};

    // Use the generators
    files['App.tsx'] = generateAppTsx(
      blueprint,
      (appType) => this.appTypeRequiresAuth(appType)
    );
    files['index.ts'] = generateIndexTs();
    files['lib/utils.ts'] = generateUtilsFile();
    files['theme/colors.ts'] = generateThemeColors();
    files['theme/typography.ts'] = generateTypography();

    // ... rest of the implementation
    return files;
  }
}
```

## File Structure

```
app/
├── app-tsx.generator.ts        # Root App component generator
├── index-ts.generator.ts       # Index barrel export generator
├── utils.generator.ts          # Utility functions generator
├── theme-colors.generator.ts   # Color palette generator
├── typography.generator.ts     # Typography styles generator
└── index.ts                    # Barrel export for all generators
```

## Testing

Each generator can be easily unit tested since they are pure functions:

```typescript
describe('App Generators', () => {
  describe('generateAppTsx', () => {
    it('should include AuthProvider when auth is required', () => {
      const blueprint = { metadata: { appType: 'CRM' } };
      const result = generateAppTsx(blueprint, (type) => type === 'CRM');
      expect(result).toContain('AuthProvider');
    });

    it('should not include AuthProvider when auth is not required', () => {
      const blueprint = { metadata: { appType: 'Marketing' } };
      const result = generateAppTsx(blueprint, (type) => type === 'CRM');
      expect(result).not.toContain('AuthProvider');
    });
  });

  describe('generateThemeColors', () => {
    it('should return a valid color palette', () => {
      const result = generateThemeColors();
      expect(result).toContain('primary: \'#3b82f6\'');
      expect(result).toContain('secondary: \'#8b5cf6\'');
    });
  });
});
```

## Benefits

1. **Modularity**: Each generator is independent and focused on a single responsibility
2. **Testability**: Pure functions are easier to test without mocking dependencies
3. **Reusability**: Generators can be imported and used in other services
4. **Maintainability**: Changes to one generator don't affect others
5. **Type Safety**: Full TypeScript support with type-safe parameters and returns
6. **Documentation**: Each generator has clear JSDoc comments

## Related Generators

This directory is part of the larger `react-native-components` generator system:

- `app/` - Core application files (App.tsx, utilities, theme)
- `config/` - Configuration files (package.json, tsconfig, babel.config)
- `navigation/` - Navigation structure generators
- `auth/` - Authentication-related generators
- `lib/` - Library and helper generators

## Extracted From

- **Source File**: `react-native-mobile-generator.service.ts`
- **Extraction Date**: 2025-11-16
- **Methods Extracted**: 5
- **Type Conversion**: Private class methods → Standalone functions

## Dependencies

- TypeScript
- Interfaces from `../../../interfaces/app-builder.types`
  - `AppBlueprint`

## Notes

- All generated code uses consistent styling and imports
- Color palette follows Tailwind-like design system principles
- Typography scale is optimized for React Native components
- Utility functions are lean and focused on common operations
