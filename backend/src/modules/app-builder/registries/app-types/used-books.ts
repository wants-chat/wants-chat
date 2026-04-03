/**
 * Used Books App Type Definition
 *
 * Complete definition for used books applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const USED_BOOKS_APP_TYPE: AppTypeDefinition = {
  id: 'used-books',
  name: 'Used Books',
  category: 'services',
  description: 'Used Books platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "used books",
      "used",
      "books",
      "used software",
      "used app",
      "used platform",
      "used system",
      "used management",
      "services used"
  ],

  synonyms: [
      "Used Books platform",
      "Used Books software",
      "Used Books system",
      "used solution",
      "used service"
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
      "Build a used books platform",
      "Create a used books app",
      "I need a used books management system",
      "Build a used books solution",
      "Create a used books booking system"
  ],
};
