/**
 * Ymca App Type Definition
 *
 * Complete definition for ymca applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YMCA_APP_TYPE: AppTypeDefinition = {
  id: 'ymca',
  name: 'Ymca',
  category: 'services',
  description: 'Ymca platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ymca",
      "ymca software",
      "ymca app",
      "ymca platform",
      "ymca system",
      "ymca management",
      "services ymca"
  ],

  synonyms: [
      "Ymca platform",
      "Ymca software",
      "Ymca system",
      "ymca solution",
      "ymca service"
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
      "Build a ymca platform",
      "Create a ymca app",
      "I need a ymca management system",
      "Build a ymca solution",
      "Create a ymca booking system"
  ],
};
