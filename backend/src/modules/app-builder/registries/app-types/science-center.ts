/**
 * Science Center App Type Definition
 *
 * Complete definition for science center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCIENCE_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'science-center',
  name: 'Science Center',
  category: 'services',
  description: 'Science Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "science center",
      "science",
      "center",
      "science software",
      "science app",
      "science platform",
      "science system",
      "science management",
      "services science"
  ],

  synonyms: [
      "Science Center platform",
      "Science Center software",
      "Science Center system",
      "science solution",
      "science service"
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
      "Build a science center platform",
      "Create a science center app",
      "I need a science center management system",
      "Build a science center solution",
      "Create a science center booking system"
  ],
};
