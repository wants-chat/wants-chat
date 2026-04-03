/**
 * Used Machinery App Type Definition
 *
 * Complete definition for used machinery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const USED_MACHINERY_APP_TYPE: AppTypeDefinition = {
  id: 'used-machinery',
  name: 'Used Machinery',
  category: 'services',
  description: 'Used Machinery platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "used machinery",
      "used",
      "machinery",
      "used software",
      "used app",
      "used platform",
      "used system",
      "used management",
      "services used"
  ],

  synonyms: [
      "Used Machinery platform",
      "Used Machinery software",
      "Used Machinery system",
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
      "Build a used machinery platform",
      "Create a used machinery app",
      "I need a used machinery management system",
      "Build a used machinery solution",
      "Create a used machinery booking system"
  ],
};
