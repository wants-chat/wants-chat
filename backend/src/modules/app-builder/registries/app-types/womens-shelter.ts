/**
 * Womens Shelter App Type Definition
 *
 * Complete definition for womens shelter applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOMENS_SHELTER_APP_TYPE: AppTypeDefinition = {
  id: 'womens-shelter',
  name: 'Womens Shelter',
  category: 'services',
  description: 'Womens Shelter platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "womens shelter",
      "womens",
      "shelter",
      "womens software",
      "womens app",
      "womens platform",
      "womens system",
      "womens management",
      "services womens"
  ],

  synonyms: [
      "Womens Shelter platform",
      "Womens Shelter software",
      "Womens Shelter system",
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
      "Build a womens shelter platform",
      "Create a womens shelter app",
      "I need a womens shelter management system",
      "Build a womens shelter solution",
      "Create a womens shelter booking system"
  ],
};
