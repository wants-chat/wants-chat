/**
 * ROUTING EXAMPLE
 *
 * This file shows how to integrate the security pages into your App.tsx
 * Copy the relevant sections into your actual App.tsx file
 */

// ============================================================================
// STEP 1: Add to imports section (top of App.tsx)
// ============================================================================

import { VPN, TwoFactorAuth, Ciphertext } from './pages/security';

// ============================================================================
// STEP 2: Add routes inside <Routes> component
// ============================================================================

// Option A: Protected Routes (Recommended)
<Route
  path="/security/vpn"
  element={<ProtectedRoute><VPN /></ProtectedRoute>}
/>
<Route
  path="/security/2fa"
  element={<ProtectedRoute><TwoFactorAuth /></ProtectedRoute>}
/>
<Route
  path="/security/cipher"
  element={<ProtectedRoute><Ciphertext /></ProtectedRoute>}
/>

// Option B: Public Routes (Not recommended for security tools)
<Route path="/security/vpn" element={<VPN />} />
<Route path="/security/2fa" element={<TwoFactorAuth />} />
<Route path="/security/cipher" element={<Ciphertext />} />

// ============================================================================
// STEP 3: Add navigation links
// ============================================================================

// Example 1: Dashboard Navigation
import { Shield, Key, Lock } from 'lucide-react';

const SecuritySection = () => (
  <div className="space-y-2">
    <h3 className="text-lg font-bold text-white mb-3">Security Tools</h3>

    <Link
      to="/security/vpn"
      className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-all"
    >
      <Shield className="w-5 h-5 text-teal-400" />
      <div>
        <p className="font-medium text-white">VPN Shield</p>
        <p className="text-xs text-slate-400">Secure your connection</p>
      </div>
    </Link>

    <Link
      to="/security/2fa"
      className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-all"
    >
      <Key className="w-5 h-5 text-teal-400" />
      <div>
        <p className="font-medium text-white">Two-Factor Auth</p>
        <p className="text-xs text-slate-400">TOTP code generator</p>
      </div>
    </Link>

    <Link
      to="/security/cipher"
      className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-all"
    >
      <Lock className="w-5 h-5 text-teal-400" />
      <div>
        <p className="font-medium text-white">Ciphertext Encoder</p>
        <p className="text-xs text-slate-400">Encrypt & decrypt text</p>
      </div>
    </Link>
  </div>
);

// Example 2: Sidebar Menu Item
<nav className="space-y-1">
  <Link
    to="/security/vpn"
    className="flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-teal-500/10 rounded-lg"
  >
    <Shield className="w-5 h-5 mr-3" />
    VPN Shield
  </Link>

  <Link
    to="/security/2fa"
    className="flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-teal-500/10 rounded-lg"
  >
    <Key className="w-5 h-5 mr-3" />
    Two-Factor Auth
  </Link>

  <Link
    to="/security/cipher"
    className="flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-teal-500/10 rounded-lg"
  >
    <Lock className="w-5 h-5 mr-3" />
    Ciphertext
  </Link>
</nav>

// Example 3: App Settings Page Integration
const AppSettingsSecuritySection = () => (
  <div className="bg-slate-800/50 rounded-xl p-6">
    <h2 className="text-xl font-bold text-white mb-4">Security & Privacy</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Link
        to="/security/vpn"
        className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-lg p-4 hover:scale-105 transition-transform"
      >
        <Shield className="w-8 h-8 text-blue-400 mb-2" />
        <h3 className="font-bold text-white">VPN</h3>
        <p className="text-sm text-slate-400">Secure connection</p>
      </Link>

      <Link
        to="/security/2fa"
        className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-lg p-4 hover:scale-105 transition-transform"
      >
        <Key className="w-8 h-8 text-teal-400 mb-2" />
        <h3 className="font-bold text-white">2FA</h3>
        <p className="text-sm text-slate-400">Authenticator</p>
      </Link>

      <Link
        to="/security/cipher"
        className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 hover:scale-105 transition-transform"
      >
        <Lock className="w-8 h-8 text-purple-400 mb-2" />
        <h3 className="font-bold text-white">Cipher</h3>
        <p className="text-sm text-slate-400">Text encryption</p>
      </Link>
    </div>
  </div>
);

// ============================================================================
// STEP 4: Add to MegaDropdown (if applicable)
// ============================================================================

// In your mega dropdown configuration
const megaDropdownConfig = {
  // ... other sections
  security: {
    title: 'Security',
    items: [
      {
        icon: Shield,
        title: 'VPN Shield',
        description: 'Secure your internet connection',
        href: '/security/vpn',
        color: 'text-blue-400',
      },
      {
        icon: Key,
        title: 'Two-Factor Auth',
        description: 'Generate TOTP codes',
        href: '/security/2fa',
        color: 'text-teal-400',
      },
      {
        icon: Lock,
        title: 'Ciphertext',
        description: 'Encrypt and decrypt text',
        href: '/security/cipher',
        color: 'text-purple-400',
      },
    ],
  },
};

// ============================================================================
// COMPLETE EXAMPLE - Minimal App.tsx Integration
// ============================================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Security pages import
import { VPN, TwoFactorAuth, Ciphertext } from './pages/security';

function App() {
  return (
    <Router>
      <Routes>
        {/* Your existing routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Security routes */}
        <Route
          path="/security/vpn"
          element={<ProtectedRoute><VPN /></ProtectedRoute>}
        />
        <Route
          path="/security/2fa"
          element={<ProtectedRoute><TwoFactorAuth /></ProtectedRoute>}
        />
        <Route
          path="/security/cipher"
          element={<ProtectedRoute><Ciphertext /></ProtectedRoute>}
        />
      </Routes>
    </Router>
  );
}

export default App;

// ============================================================================
// TESTING THE ROUTES
// ============================================================================

/**
 * After adding routes, test by navigating to:
 *
 * - http://localhost:5173/security/vpn
 * - http://localhost:5173/security/2fa
 * - http://localhost:5173/security/cipher
 *
 * Each page should:
 * 1. Show the Header component
 * 2. Display animated background effects
 * 3. Have fully functional features
 * 4. Be responsive on all screen sizes
 */

// ============================================================================
// BREADCRUMB EXAMPLE (Optional)
// ============================================================================

const Breadcrumbs = ({ items }: { items: { label: string; href?: string }[] }) => (
  <nav className="flex items-center space-x-2 text-sm mb-6">
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <span className="text-slate-500">/</span>}
        {item.href ? (
          <Link to={item.href} className="text-teal-400 hover:text-teal-300">
            {item.label}
          </Link>
        ) : (
          <span className="text-slate-400">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

// Usage in security pages
<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Security', href: '/security' },
    { label: 'VPN Shield' },
  ]}
/>

// ============================================================================
// END OF ROUTING EXAMPLE
// ============================================================================
