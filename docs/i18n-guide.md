# Internationalization (i18n) Guide

## Overview

Wants AI uses different i18n solutions for each platform:

| Platform | Library | Config Location |
|----------|---------|----------------|
| Frontend (Web) | `i18next` + `react-i18next` | `frontend/src/i18n/` |
| Mobile (Flutter) | `easy_localization` | `mobile/assets/translations/` |

## Frontend i18n

### Current Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | Complete |
| Japanese | `ja` | Complete |

### Adding a New Language

1. Create a new locale file:
   ```bash
   cp frontend/src/i18n/locales/en.json frontend/src/i18n/locales/XX.json
   ```
   Replace `XX` with the [ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

2. Translate the strings in the new file.

3. Register the language in `frontend/src/i18n/index.ts`:
   ```typescript
   import xxTranslation from './locales/xx.json';

   // Add to resources:
   resources: {
     en: { translation: enTranslation },
     ja: { translation: jaTranslation },
     xx: { translation: xxTranslation }, // Add this line
   }
   ```

4. Add the language to the language selector component.

### Translation File Structure

The JSON file uses nested keys:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "auth": {
    "login": "Log in",
    "signup": "Sign up"
  },
  "tools": {
    "currencyConverter": {
      "title": "Currency Converter",
      "amount": "Amount"
    }
  }
}
```

### Using Translations in Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('tools.myTool.title', 'My Tool')}</h1>
      <p>{t('tools.myTool.description', 'Default description')}</p>
    </div>
  );
}
```

Always provide a fallback English string as the second argument to `t()`.

### Translation Tips

- Keep keys descriptive and hierarchical
- Use interpolation for dynamic values: `t('greeting', { name: 'John' })`
- For plurals: `t('items', { count: 5 })`
- Test with a longer language (like German) to catch layout issues

## Mobile i18n

### Current Languages (Mobile)

English, Spanish, French, German, Portuguese, Japanese, Arabic (7 languages).

### Adding a Mobile Language

1. Create translation file in `mobile/assets/translations/XX.json`
2. Register in `mobile/lib/main.dart` supported locales list
3. Test RTL support if adding an RTL language

## Contributing Translations

We welcome translation contributions! Here's how:

1. Fork the repository
2. Create your translation file(s)
3. Submit a PR with title: `i18n: Add [Language] translations`
4. Include the percentage of strings translated in the PR description

Partial translations are welcome — untranslated strings will fall back to English.
