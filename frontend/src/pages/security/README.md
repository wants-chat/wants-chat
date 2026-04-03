# Security Pages

Three modern security-focused pages with teal/cyan gradient theme matching the mobile style.

## Pages Created

### 1. VPN.tsx
**VPN Connection UI**
- Connect/disconnect functionality with animated status indicator
- Server list with country flags, ping times, and load percentages
- Real-time connection stats (ping, load, protocol)
- Color-coded server load indicators
- Premium server badges
- Smooth animations and transitions

**Features:**
- 8 pre-configured VPN servers (US, UK, Germany, Japan, Singapore, Canada, Australia, France)
- WireGuard protocol display
- Server load visualization with progress bars
- One-click connect/disconnect

### 2. TwoFactorAuth.tsx
**2FA Authenticator with TOTP Code Generator**
- Time-based One-Time Password (TOTP) generation
- 30-second countdown timer with visual progress bar
- Add/remove accounts functionality
- Copy codes to clipboard
- Auto-refreshing codes

**Features:**
- Real TOTP algorithm implementation (simplified for demo)
- Color-coded account cards
- Time-remaining indicator
- One-click copy to clipboard
- Secure account management

**Note:** Uses simplified TOTP algorithm for demonstration. For production, integrate libraries like:
- `otpauth`
- `speakeasy`
- `@otplib/preset-default`

### 3. Ciphertext.tsx
**Text Encryption/Decryption Tool**
- Multiple cipher methods:
  - **Caesar Cipher** - Classic shift cipher with adjustable shift (1-25)
  - **Reverse Cipher** - Simple text reversal
  - **Atbash Cipher** - A↔Z, B↔Y substitution
  - **AES Encryption** - Placeholder for production crypto implementation
- Encrypt/decrypt mode toggle
- Swap input/output functionality
- Copy results to clipboard

**Features:**
- Real Caesar cipher implementation
- Real Atbash cipher implementation
- Adjustable Caesar shift with visual slider
- AES placeholder with key input
- Side-by-side input/output display

## Installation

These pages are already created and ready to use. To add them to your routing:

### 1. Import in App.tsx

```tsx
// Add to imports section
import { VPN, TwoFactorAuth, Ciphertext } from './pages/security';
```

### 2. Add Routes

```tsx
// Add inside <Routes> component
<Route path="/security/vpn" element={<ProtectedRoute><VPN /></ProtectedRoute>} />
<Route path="/security/2fa" element={<ProtectedRoute><TwoFactorAuth /></ProtectedRoute>} />
<Route path="/security/cipher" element={<ProtectedRoute><Ciphertext /></ProtectedRoute>} />
```

### 3. Add Navigation Links

Add to your dashboard or navigation menu:

```tsx
<Link to="/security/vpn">VPN Shield</Link>
<Link to="/security/2fa">Two-Factor Auth</Link>
<Link to="/security/cipher">Ciphertext Encoder</Link>
```

## Dependencies

All required dependencies are already part of the project:
- `react` - UI framework
- `framer-motion` - Animations
- `lucide-react` - Icons
- `react-router-dom` - Routing
- Tailwind CSS - Styling

## Component Structure

Each page follows the same structure:
```
<BackgroundEffects /> - Animated gradient background
<Header /> - Main navigation header
<Content> - Page-specific content with cards and animations
```

## Customization

### Colors
All pages use the teal/cyan gradient theme. To customize:
- Look for `from-teal-500 to-cyan-500` classes
- Gradient backgrounds use `bg-gradient-to-r`
- Borders use `border-teal-400/30`

### Animations
Powered by Framer Motion:
- `initial={{ opacity: 0, y: 20 }}`
- `animate={{ opacity: 1, y: 0 }}`
- Staggered delays for list items

### Responsive Design
- Mobile-first approach with Tailwind
- Grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Flexible containers with `flex-col sm:flex-row`

## Production Considerations

### VPN Page
- Integrate with actual VPN API/SDK
- Add real server status checks
- Implement actual connection logic
- Add connection error handling
- Store server preferences

### 2FA Page
- Use proper TOTP library (speakeasy, otpauth)
- Implement QR code scanning
- Add encrypted storage for secrets
- Sync with cloud backup
- Export/import functionality

### Ciphertext Page
- Use Web Crypto API for AES
- Add more cipher algorithms (Vigenère, Playfair, etc.)
- Implement file encryption
- Add key strength indicators
- Store encryption history

## File Locations

```
frontend/src/pages/security/
├── VPN.tsx              # VPN connection page
├── TwoFactorAuth.tsx    # 2FA authenticator
├── Ciphertext.tsx       # Text encryption tool
├── index.ts             # Barrel export
└── README.md            # This file
```

## Example Usage

```tsx
import { VPN, TwoFactorAuth, Ciphertext } from './pages/security';

// In your router
<Routes>
  <Route path="/vpn" element={<VPN />} />
  <Route path="/2fa" element={<TwoFactorAuth />} />
  <Route path="/cipher" element={<Ciphertext />} />
</Routes>
```

## Screenshots

### VPN
- Connection status card with animated indicator
- Server list with flags and stats
- Load percentage bars

### Two-Factor Auth
- Countdown timer with progress
- TOTP codes with copy button
- Add account form

### Ciphertext
- Cipher method selector
- Dual text areas (input/output)
- Settings for each cipher type

## Support

For issues or questions:
1. Check the component source code
2. Review Tailwind CSS documentation
3. Check Framer Motion docs for animation customization
4. Review lucide-react for icon options
