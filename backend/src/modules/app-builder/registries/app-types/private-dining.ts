/**
 * Private Dining App Type Definition
 *
 * Complete definition for private dining applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRIVATE_DINING_APP_TYPE: AppTypeDefinition = {
  id: 'private-dining',
  name: 'Private Dining',
  category: 'services',
  description: 'Private Dining platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "private dining",
      "private",
      "dining",
      "private software",
      "private app",
      "private platform",
      "private system",
      "private management",
      "services private"
  ],

  synonyms: [
      "Private Dining platform",
      "Private Dining software",
      "Private Dining system",
      "private solution",
      "private service"
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
      "Build a private dining platform",
      "Create a private dining app",
      "I need a private dining management system",
      "Build a private dining solution",
      "Create a private dining booking system"
  ],
};
