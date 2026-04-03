/**
 * User Experience App Type Definition
 *
 * Complete definition for user experience applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const USER_EXPERIENCE_APP_TYPE: AppTypeDefinition = {
  id: 'user-experience',
  name: 'User Experience',
  category: 'services',
  description: 'User Experience platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "user experience",
      "user",
      "experience",
      "user software",
      "user app",
      "user platform",
      "user system",
      "user management",
      "services user"
  ],

  synonyms: [
      "User Experience platform",
      "User Experience software",
      "User Experience system",
      "user solution",
      "user service"
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
      "Build a user experience platform",
      "Create a user experience app",
      "I need a user experience management system",
      "Build a user experience solution",
      "Create a user experience booking system"
  ],
};
