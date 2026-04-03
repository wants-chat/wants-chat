/**
 * Wage Garnishment App Type Definition
 *
 * Complete definition for wage garnishment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WAGE_GARNISHMENT_APP_TYPE: AppTypeDefinition = {
  id: 'wage-garnishment',
  name: 'Wage Garnishment',
  category: 'services',
  description: 'Wage Garnishment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wage garnishment",
      "wage",
      "garnishment",
      "wage software",
      "wage app",
      "wage platform",
      "wage system",
      "wage management",
      "services wage"
  ],

  synonyms: [
      "Wage Garnishment platform",
      "Wage Garnishment software",
      "Wage Garnishment system",
      "wage solution",
      "wage service"
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
      "Build a wage garnishment platform",
      "Create a wage garnishment app",
      "I need a wage garnishment management system",
      "Build a wage garnishment solution",
      "Create a wage garnishment booking system"
  ],
};
