/**
 * Artisan Cheese App Type Definition
 *
 * Complete definition for artisan cheese applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARTISAN_CHEESE_APP_TYPE: AppTypeDefinition = {
  id: 'artisan-cheese',
  name: 'Artisan Cheese',
  category: 'services',
  description: 'Artisan Cheese platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "artisan cheese",
      "artisan",
      "cheese",
      "artisan software",
      "artisan app",
      "artisan platform",
      "artisan system",
      "artisan management",
      "services artisan"
  ],

  synonyms: [
      "Artisan Cheese platform",
      "Artisan Cheese software",
      "Artisan Cheese system",
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
      "Build a artisan cheese platform",
      "Create a artisan cheese app",
      "I need a artisan cheese management system",
      "Build a artisan cheese solution",
      "Create a artisan cheese booking system"
  ],
};
