/**
 * Artisan Jewelry App Type Definition
 *
 * Complete definition for artisan jewelry applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARTISAN_JEWELRY_APP_TYPE: AppTypeDefinition = {
  id: 'artisan-jewelry',
  name: 'Artisan Jewelry',
  category: 'services',
  description: 'Artisan Jewelry platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "artisan jewelry",
      "artisan",
      "jewelry",
      "artisan software",
      "artisan app",
      "artisan platform",
      "artisan system",
      "artisan management",
      "services artisan"
  ],

  synonyms: [
      "Artisan Jewelry platform",
      "Artisan Jewelry software",
      "Artisan Jewelry system",
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
      "Build a artisan jewelry platform",
      "Create a artisan jewelry app",
      "I need a artisan jewelry management system",
      "Build a artisan jewelry solution",
      "Create a artisan jewelry booking system"
  ],
};
