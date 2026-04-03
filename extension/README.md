# Wants Chrome Extension

Chrome extension with 1000+ tools, sharing code with the Wants.chat frontend.

## Architecture

```
wants/
├── frontend/                 # SaaS website
│   └── src/
│       └── components/
│           └── tools/        # 1084 tool components (SHARED)
│
├── extension/                # Chrome extension (THIS)
│   ├── src/
│   │   ├── App.tsx          # Extension UI
│   │   ├── tools-registry.tsx # Tool metadata + lazy imports
│   │   └── contexts/        # Extension-specific contexts
│   ├── manifest.json
│   └── vite.config.ts       # Imports from ../frontend
│
└── backend/                  # Shared backend API
```

## How Code Sharing Works

1. **Tool components** live in `frontend/src/components/tools/`
2. **Extension imports** them via `@tools/ToolName` alias
3. **Vite resolves** `@tools` to `../frontend/src/components/tools`
4. **ThemeContext** is overridden to use extension's version
5. **Same subscription** system via Wants.chat backend

## Development

### Prerequisites

```bash
# Install frontend dependencies first
cd ../frontend && npm install

# Install extension dependencies
cd ../extension && npm install
```

### Run Development Server

```bash
npm run dev
```

Opens at http://localhost:5174 for testing in browser.

### Build Extension

```bash
npm run build
```

Output: `dist/` folder with:
- `index.html`
- `assets/` (JS, CSS)
- `icons/`
- `manifest.json`

### Create ZIP for Chrome Web Store

```bash
npm run zip
```

Output: `wants-extension.zip`

## Load in Chrome

1. Go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` folder

## Adding New Tools

1. Create tool in `frontend/src/components/tools/NewTool.tsx`
2. Export from `frontend/src/components/tools/index.ts`
3. Add entry in `extension/src/tools-registry.tsx`:

```typescript
{
  id: 'new-tool',
  name: 'New Tool',
  description: 'Tool description',
  category: 'developer',
  icon: '🔧',
  keywords: ['new', 'tool'],
  isPro: false,
  component: lazyTool(() => import('@tools/NewTool')),
}
```

## Tool Categories

- `developer` - JSON, Base64, Hash, UUID, etc.
- `text` - Case converter, Word counter, etc.
- `converter` - Temperature, Length, Currency, etc.
- `calculator` - Percentage, Discount, BMI, etc.
- `generator` - Password, QR Code, UUID, etc.
- `image` - Color picker, Gradient, Resize, etc.
- `ai-writing` - Email, Essay, Blog (PRO)
- `ai-image` - Image gen, Logo, Background remover (PRO)
- `business` - Invoice, Contract, etc.
- `finance` - Mortgage, Loan, etc.
- `health` - BMI, Calorie, etc.
- `education` - Flashcard, Quiz, etc.
- `lifestyle` - World clock, Timer, etc.

## Authentication

Uses Wants.chat website for login:

```typescript
// Opens wants.chat/login
window.open('https://wants.chat/login?source=extension', '_blank');
```

After login, extension syncs user status via:
- `chrome.storage.local` for offline caching
- Backend API for subscription verification

## Subscription Tiers

**Free:**
- All non-PRO tools (~950 tools)
- 5 AI credits

**Pro ($9.99/mo):**
- All 1000+ tools
- Unlimited AI features
- Priority support

## File Structure

```
extension/
├── manifest.json          # Chrome extension manifest v3
├── index.html             # Entry point
├── package.json           # Dependencies
├── vite.config.ts         # Build config with aliases
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind CSS
├── postcss.config.js      # PostCSS
├── public/
│   └── icons/             # Extension icons
├── src/
│   ├── main.tsx           # React entry
│   ├── App.tsx            # Main UI
│   ├── index.css          # Tailwind styles
│   ├── tools-registry.tsx # Tool definitions
│   └── contexts/
│       └── ThemeContext.tsx
└── dist/                  # Build output
```

## Troubleshooting

### "Failed to load tool"
- Check if tool exists in frontend
- Verify export in frontend/src/components/tools/index.ts
- Check browser console for import errors

### Theme not working
- Tool must use `useTheme` from `../../contexts/ThemeContext`
- Vite alias redirects this to extension's ThemeContext

### Build errors
- Run `npm install` in both frontend and extension
- Check vite.config.ts aliases are correct

## Chrome Web Store Submission

1. Build: `npm run build`
2. Create ZIP: `npm run zip`
3. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Upload `wants-extension.zip`
5. Fill store listing details
6. Submit for review (2-7 days)

## License

MIT - Part of Wants.chat project
