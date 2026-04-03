# Tool Development Guide

This guide explains how to create new contextual tool components for Wants AI.

## What is a Tool?

A tool is a React component that renders a contextual UI when the AI detects a matching user intent. For example, when a user says "convert 500 USD to EUR", the platform renders the `CurrencyConverterTool` with pre-filled values.

## Tool Component Structure

Tools live in `frontend/src/components/tools/` and follow a consistent pattern:

```tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface MyToolProps {
  initialData?: Record<string, unknown>;
  onDataChange?: (data: Record<string, unknown>) => void;
}

export function MyTool({ initialData, onDataChange }: MyToolProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialData?.value || '');

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onDataChange?.({ value: newValue });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tools.myTool.title', 'My Tool')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={t('tools.myTool.placeholder', 'Enter value...')}
        />
        {/* Tool UI here */}
      </CardContent>
    </Card>
  );
}
```

## Key Patterns

### 1. Props Interface

All tools receive:
- `initialData` - Pre-filled data from AI entity extraction
- `onDataChange` - Callback to sync data back to the platform

### 2. Styling

- Use **shadcn/ui** components (`Card`, `Button`, `Input`, `Select`, etc.)
- Use **Tailwind CSS** for custom styling
- Support dark mode via Tailwind's `dark:` prefix

### 3. Internationalization

- Wrap all user-facing strings with `t()` from `react-i18next`
- Always provide a fallback English string as the second argument
- Add translation keys to `frontend/src/i18n/locales/en.json`

### 4. Export Functionality

Tools that produce data should support export:

```tsx
import { exportToPDF, exportToCSV, exportToJSON } from '@/utils/export';

// In your component:
<Button onClick={() => exportToPDF(data, 'my-tool-export')}>
  Export PDF
</Button>
```

## Registering a Tool

After creating the component, register it in `frontend/src/components/ContextualUI.tsx`:

1. Import the component
2. Add a mapping entry that links an intent keyword to the component
3. Add the tool to the tools registry in `backend/src/data/tools-registry.ts`

## Testing

Run the dev server and test your tool by typing related intents in the chat:

```bash
cd frontend && npm run dev
```

## Best Practices

- Keep components focused on a single purpose
- Use TypeScript types for all props and state
- Handle loading and error states
- Make tools responsive (mobile-friendly)
- Support keyboard navigation for accessibility
