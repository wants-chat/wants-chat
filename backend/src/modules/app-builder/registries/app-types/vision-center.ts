/**
 * Vision Center App Type Definition
 *
 * Complete definition for vision center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VISION_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'vision-center',
  name: 'Vision Center',
  category: 'services',
  description: 'Vision Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vision center",
      "vision",
      "center",
      "vision software",
      "vision app",
      "vision platform",
      "vision system",
      "vision management",
      "services vision"
  ],

  synonyms: [
      "Vision Center platform",
      "Vision Center software",
      "Vision Center system",
      "vision solution",
      "vision service"
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
      "Build a vision center platform",
      "Create a vision center app",
      "I need a vision center management system",
      "Build a vision center solution",
      "Create a vision center booking system"
  ],
};
