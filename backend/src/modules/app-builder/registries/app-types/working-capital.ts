/**
 * Working Capital App Type Definition
 *
 * Complete definition for working capital applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKING_CAPITAL_APP_TYPE: AppTypeDefinition = {
  id: 'working-capital',
  name: 'Working Capital',
  category: 'services',
  description: 'Working Capital platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "working capital",
      "working",
      "capital",
      "working software",
      "working app",
      "working platform",
      "working system",
      "working management",
      "services working"
  ],

  synonyms: [
      "Working Capital platform",
      "Working Capital software",
      "Working Capital system",
      "working solution",
      "working service"
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
      "Build a working capital platform",
      "Create a working capital app",
      "I need a working capital management system",
      "Build a working capital solution",
      "Create a working capital booking system"
  ],
};
