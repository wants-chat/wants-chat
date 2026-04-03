/**
 * Walnut Farm App Type Definition
 *
 * Complete definition for walnut farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WALNUT_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'walnut-farm',
  name: 'Walnut Farm',
  category: 'services',
  description: 'Walnut Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "walnut farm",
      "walnut",
      "farm",
      "walnut software",
      "walnut app",
      "walnut platform",
      "walnut system",
      "walnut management",
      "services walnut"
  ],

  synonyms: [
      "Walnut Farm platform",
      "Walnut Farm software",
      "Walnut Farm system",
      "walnut solution",
      "walnut service"
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
      "Build a walnut farm platform",
      "Create a walnut farm app",
      "I need a walnut farm management system",
      "Build a walnut farm solution",
      "Create a walnut farm booking system"
  ],
};
