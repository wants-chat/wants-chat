/**
 * Womens Wear App Type Definition
 *
 * Complete definition for womens wear applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOMENS_WEAR_APP_TYPE: AppTypeDefinition = {
  id: 'womens-wear',
  name: 'Womens Wear',
  category: 'services',
  description: 'Womens Wear platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "womens wear",
      "womens",
      "wear",
      "womens software",
      "womens app",
      "womens platform",
      "womens system",
      "womens management",
      "services womens"
  ],

  synonyms: [
      "Womens Wear platform",
      "Womens Wear software",
      "Womens Wear system",
      "womens solution",
      "womens service"
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
      "Build a womens wear platform",
      "Create a womens wear app",
      "I need a womens wear management system",
      "Build a womens wear solution",
      "Create a womens wear booking system"
  ],
};
