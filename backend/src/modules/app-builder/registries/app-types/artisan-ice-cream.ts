/**
 * Artisan Ice Cream App Type Definition
 *
 * Complete definition for artisan ice cream applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARTISAN_ICE_CREAM_APP_TYPE: AppTypeDefinition = {
  id: 'artisan-ice-cream',
  name: 'Artisan Ice Cream',
  category: 'services',
  description: 'Artisan Ice Cream platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "artisan ice cream",
      "artisan",
      "ice",
      "cream",
      "artisan software",
      "artisan app",
      "artisan platform",
      "artisan system",
      "artisan management",
      "services artisan"
  ],

  synonyms: [
      "Artisan Ice Cream platform",
      "Artisan Ice Cream software",
      "Artisan Ice Cream system",
      "artisan solution",
      "artisan service"
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
      "Build a artisan ice cream platform",
      "Create a artisan ice cream app",
      "I need a artisan ice cream management system",
      "Build a artisan ice cream solution",
      "Create a artisan ice cream booking system"
  ],
};
