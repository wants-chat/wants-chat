/**
 * Private Chef App Type Definition
 *
 * Complete definition for private chef applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRIVATE_CHEF_APP_TYPE: AppTypeDefinition = {
  id: 'private-chef',
  name: 'Private Chef',
  category: 'services',
  description: 'Private Chef platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "private chef",
      "private",
      "chef",
      "private software",
      "private app",
      "private platform",
      "private system",
      "private management",
      "services private"
  ],

  synonyms: [
      "Private Chef platform",
      "Private Chef software",
      "Private Chef system",
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
      "Build a private chef platform",
      "Create a private chef app",
      "I need a private chef management system",
      "Build a private chef solution",
      "Create a private chef booking system"
  ],
};
