/**
 * Semiconductor App Type Definition
 *
 * Complete definition for semiconductor applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEMICONDUCTOR_APP_TYPE: AppTypeDefinition = {
  id: 'semiconductor',
  name: 'Semiconductor',
  category: 'services',
  description: 'Semiconductor platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "semiconductor",
      "semiconductor software",
      "semiconductor app",
      "semiconductor platform",
      "semiconductor system",
      "semiconductor management",
      "services semiconductor"
  ],

  synonyms: [
      "Semiconductor platform",
      "Semiconductor software",
      "Semiconductor system",
      "semiconductor solution",
      "semiconductor service"
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
      "Build a semiconductor platform",
      "Create a semiconductor app",
      "I need a semiconductor management system",
      "Build a semiconductor solution",
      "Create a semiconductor booking system"
  ],
};
