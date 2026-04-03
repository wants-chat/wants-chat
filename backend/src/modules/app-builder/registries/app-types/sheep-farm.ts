/**
 * Sheep Farm App Type Definition
 *
 * Complete definition for sheep farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHEEP_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'sheep-farm',
  name: 'Sheep Farm',
  category: 'services',
  description: 'Sheep Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sheep farm",
      "sheep",
      "farm",
      "sheep software",
      "sheep app",
      "sheep platform",
      "sheep system",
      "sheep management",
      "services sheep"
  ],

  synonyms: [
      "Sheep Farm platform",
      "Sheep Farm software",
      "Sheep Farm system",
      "sheep solution",
      "sheep service"
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
      "Build a sheep farm platform",
      "Create a sheep farm app",
      "I need a sheep farm management system",
      "Build a sheep farm solution",
      "Create a sheep farm booking system"
  ],
};
