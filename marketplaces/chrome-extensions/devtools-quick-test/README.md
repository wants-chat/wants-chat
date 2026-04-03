# DevTools Quick - Chrome Extension

Essential developer utilities in a single Chrome extension popup.

## Features

- **JSON Formatter** - Format, minify, and validate JSON
- **Base64 Encoder/Decoder** - Encode and decode Base64 strings
- **Hash Generator** - Generate SHA-256, SHA-384, SHA-512, SHA-1 hashes
- **URL Encoder/Decoder** - Encode and decode URL components
- **UUID Generator** - Generate UUID v4 identifiers

## Local Testing

### Step 1: Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select this folder: `devtools-quick-test`
5. The extension icon should appear in your toolbar

### Step 2: Test the Extension

1. Click the extension icon in the toolbar
2. Test each tool:
   - Paste JSON and click Format/Minify/Validate
   - Enter text and click Encode/Decode for Base64
   - Enter text and click Generate Hash
   - Enter URL and click Encode/Decode
   - Click Generate UUID

### Step 3: Debug (if needed)

1. Right-click the extension popup
2. Select "Inspect" to open DevTools
3. Check Console for any errors

---

## Chrome Web Store Submission

### Prerequisites

1. **Google Developer Account** - One-time $5 fee
   - Go to: https://chrome.google.com/webstore/devconsole/
   - Sign in with Google account
   - Pay $5 registration fee

### Step 1: Prepare Assets

You'll need these additional images for the store listing:

| Asset | Size | Description |
|-------|------|-------------|
| Small promo tile | 440x280 px | Store listing thumbnail |
| Screenshot 1-5 | 1280x800 or 640x400 | Extension in action |

To create screenshots:
1. Load the extension locally
2. Open popup and use full-screen capture tool
3. Resize to 1280x800

### Step 2: Create ZIP Package

```bash
cd /Users/nymulislam/DEVELOP/wants/marketplaces/chrome-extensions
zip -r devtools-quick.zip devtools-quick-test -x "*.DS_Store" -x "*.md"
```

### Step 3: Submit to Chrome Web Store

1. Go to: https://chrome.google.com/webstore/devconsole/
2. Click **New Item**
3. Upload the `devtools-quick.zip` file
4. Fill in the store listing:

**Store Listing Details:**

| Field | Value |
|-------|-------|
| Title | DevTools Quick - JSON, Base64, Hash & More |
| Summary | Essential developer tools in your browser |
| Category | Developer Tools |
| Language | English |

**Description (copy this):**
```
DevTools Quick brings essential developer utilities right into your browser toolbar.

FEATURES:
• JSON Formatter - Beautify, minify, and validate JSON with instant feedback
• Base64 Encoder/Decoder - Quick encoding and decoding of Base64 strings
• Hash Generator - Generate SHA-256, SHA-384, SHA-512, and SHA-1 hashes
• URL Encoder/Decoder - Properly encode and decode URL components
• UUID Generator - Generate single or multiple UUID v4 identifiers

PERFECT FOR:
• Frontend & Backend Developers
• API Testing & Debugging
• Data Transformation Tasks
• Quick Security Hash Generation

NO ACCOUNT REQUIRED - Works entirely offline!
All processing happens locally in your browser. No data is sent to any server.

Powered by Wants.chat
```

5. Upload screenshots
6. Set privacy policy to "This extension does not collect user data"
7. Click **Submit for Review**

### Step 4: Wait for Review

- First-time submissions: 2-7 business days
- Updates: Usually 1-3 business days
- You'll receive email notification when approved

---

## Troubleshooting

### Extension not loading?
- Make sure all files are in the folder (manifest.json, popup.html, popup.js, icons/)
- Check that manifest_version is 3
- Look for errors in chrome://extensions/

### Popup not opening?
- Check for JavaScript errors in popup console
- Verify popup.html path in manifest.json

### Store rejection?
Common reasons:
- Missing privacy policy
- Screenshots don't match functionality
- Description contains prohibited words
- Icons are too similar to other extensions

---

## File Structure

```
devtools-quick-test/
├── manifest.json      # Extension configuration
├── popup.html         # Popup UI
├── popup.js           # All tool functionality
├── icons/
│   ├── icon16.png     # Toolbar icon (16x16)
│   ├── icon48.png     # Extension page (48x48)
│   └── icon128.png    # Store listing (128x128)
└── README.md          # This file
```

---

## Next Steps After Approval

1. **Monitor Reviews** - Check developer console for user feedback
2. **Track Installs** - View analytics in developer dashboard
3. **Plan Updates** - Consider adding:
   - Color picker tool
   - Timestamp converter
   - Regex tester
   - JWT decoder
   - Markdown preview

---

## License

MIT License - Feel free to modify and reuse.

**Powered by [Wants.chat](https://wants.chat)**
