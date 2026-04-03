/**
 * Pension App Type Definition
 *
 * Complete definition for pension applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PENSION_APP_TYPE: AppTypeDefinition = {
  id: 'pension',
  name: 'Pension',
  category: 'services',
  description: 'Pension platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "pension",
      "pension software",
      "pension app",
      "pension platform",
      "pension system",
      "pension management",
      "services pension"
  ],

  synonyms: [
      "Pension platform",
      "Pension software",
      "Pension system",
      "pension solution",
      "pension service"
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
      "Build a pension platform",
      "Create a pension app",
      "I need a pension management system",
      "Build a pension solution",
      "Create a pension booking system"
  ],
};
