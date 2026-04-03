/**
 * Symbol Design App Type Definition
 *
 * Complete definition for symbol design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SYMBOL_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'symbol-design',
  name: 'Symbol Design',
  category: 'services',
  description: 'Symbol Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "symbol design",
      "symbol",
      "design",
      "symbol software",
      "symbol app",
      "symbol platform",
      "symbol system",
      "symbol management",
      "services symbol"
  ],

  synonyms: [
      "Symbol Design platform",
      "Symbol Design software",
      "Symbol Design system",
      "symbol solution",
      "symbol service"
  ],

  negativeKeywords: ['blog', 'portfolio'],

  sections: [
      {
          "id": "frontend",
          "name": "Public Portal",
          "enabled": true,
          "basePath": "/",
          "layout": "public",
          "description": "Public-facing interface"
      },
      {
          "id": "admin",
          "name": "Admin Dashboard",
          "enabled": true,
          "basePath": "/admin",
          "requiredRole": "staff",
          "layout": "admin",
          "description": "Administrative interface"
      }
  ],

  roles: [
      {
          "id": "admin",
          "name": "Administrator",
          "level": 100,
          "isDefault": false,
          "accessibleSections": [
              "frontend",
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "staff",
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a symbol design platform",
      "Create a symbol design app",
      "I need a symbol design management system",
      "Build a symbol design solution",
      "Create a symbol design booking system"
  ],
};
