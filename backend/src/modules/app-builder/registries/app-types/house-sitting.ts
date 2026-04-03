/**
 * House Sitting App Type Definition
 *
 * Complete definition for house sitting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOUSE_SITTING_APP_TYPE: AppTypeDefinition = {
  id: 'house-sitting',
  name: 'House Sitting',
  category: 'services',
  description: 'House Sitting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "house sitting",
      "house",
      "sitting",
      "house software",
      "house app",
      "house platform",
      "house system",
      "house management",
      "services house"
  ],

  synonyms: [
      "House Sitting platform",
      "House Sitting software",
      "House Sitting system",
      "house solution",
      "house service"
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
      "Build a house sitting platform",
      "Create a house sitting app",
      "I need a house sitting management system",
      "Build a house sitting solution",
      "Create a house sitting booking system"
  ],
};
