/**
 * Online Banking App Type Definition
 *
 * Complete definition for online banking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_BANKING_APP_TYPE: AppTypeDefinition = {
  id: 'online-banking',
  name: 'Online Banking',
  category: 'services',
  description: 'Online Banking platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "online banking",
      "online",
      "banking",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "services online"
  ],

  synonyms: [
      "Online Banking platform",
      "Online Banking software",
      "Online Banking system",
      "online solution",
      "online service"
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
      "Build a online banking platform",
      "Create a online banking app",
      "I need a online banking management system",
      "Build a online banking solution",
      "Create a online banking booking system"
  ],
};
