/**
 * Winter Garden App Type Definition
 *
 * Complete definition for winter garden applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINTER_GARDEN_APP_TYPE: AppTypeDefinition = {
  id: 'winter-garden',
  name: 'Winter Garden',
  category: 'services',
  description: 'Winter Garden platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "winter garden",
      "winter",
      "garden",
      "winter software",
      "winter app",
      "winter platform",
      "winter system",
      "winter management",
      "services winter"
  ],

  synonyms: [
      "Winter Garden platform",
      "Winter Garden software",
      "Winter Garden system",
      "winter solution",
      "winter service"
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
      "Build a winter garden platform",
      "Create a winter garden app",
      "I need a winter garden management system",
      "Build a winter garden solution",
      "Create a winter garden booking system"
  ],
};
