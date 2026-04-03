/**
 * Watermelon Farm App Type Definition
 *
 * Complete definition for watermelon farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATERMELON_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'watermelon-farm',
  name: 'Watermelon Farm',
  category: 'services',
  description: 'Watermelon Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "watermelon farm",
      "watermelon",
      "farm",
      "watermelon software",
      "watermelon app",
      "watermelon platform",
      "watermelon system",
      "watermelon management",
      "services watermelon"
  ],

  synonyms: [
      "Watermelon Farm platform",
      "Watermelon Farm software",
      "Watermelon Farm system",
      "watermelon solution",
      "watermelon service"
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
      "Build a watermelon farm platform",
      "Create a watermelon farm app",
      "I need a watermelon farm management system",
      "Build a watermelon farm solution",
      "Create a watermelon farm booking system"
  ],
};
