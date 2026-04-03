/**
 * Womens Clothing App Type Definition
 *
 * Complete definition for womens clothing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOMENS_CLOTHING_APP_TYPE: AppTypeDefinition = {
  id: 'womens-clothing',
  name: 'Womens Clothing',
  category: 'services',
  description: 'Womens Clothing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "womens clothing",
      "womens",
      "clothing",
      "womens software",
      "womens app",
      "womens platform",
      "womens system",
      "womens management",
      "services womens"
  ],

  synonyms: [
      "Womens Clothing platform",
      "Womens Clothing software",
      "Womens Clothing system",
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
      "Build a womens clothing platform",
      "Create a womens clothing app",
      "I need a womens clothing management system",
      "Build a womens clothing solution",
      "Create a womens clothing booking system"
  ],
};
