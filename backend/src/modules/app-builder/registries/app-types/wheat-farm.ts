/**
 * Wheat Farm App Type Definition
 *
 * Complete definition for wheat farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHEAT_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'wheat-farm',
  name: 'Wheat Farm',
  category: 'services',
  description: 'Wheat Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wheat farm",
      "wheat",
      "farm",
      "wheat software",
      "wheat app",
      "wheat platform",
      "wheat system",
      "wheat management",
      "services wheat"
  ],

  synonyms: [
      "Wheat Farm platform",
      "Wheat Farm software",
      "Wheat Farm system",
      "wheat solution",
      "wheat service"
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
      "Build a wheat farm platform",
      "Create a wheat farm app",
      "I need a wheat farm management system",
      "Build a wheat farm solution",
      "Create a wheat farm booking system"
  ],
};
