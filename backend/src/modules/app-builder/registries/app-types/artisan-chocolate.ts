/**
 * Artisan Chocolate App Type Definition
 *
 * Complete definition for artisan chocolate applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARTISAN_CHOCOLATE_APP_TYPE: AppTypeDefinition = {
  id: 'artisan-chocolate',
  name: 'Artisan Chocolate',
  category: 'services',
  description: 'Artisan Chocolate platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "artisan chocolate",
      "artisan",
      "chocolate",
      "artisan software",
      "artisan app",
      "artisan platform",
      "artisan system",
      "artisan management",
      "services artisan"
  ],

  synonyms: [
      "Artisan Chocolate platform",
      "Artisan Chocolate software",
      "Artisan Chocolate system",
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
      "Build a artisan chocolate platform",
      "Create a artisan chocolate app",
      "I need a artisan chocolate management system",
      "Build a artisan chocolate solution",
      "Create a artisan chocolate booking system"
  ],
};
