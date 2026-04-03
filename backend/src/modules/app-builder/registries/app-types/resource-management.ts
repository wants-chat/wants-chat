/**
 * Resource Management App Type Definition
 *
 * Complete definition for resource management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESOURCE_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'resource-management',
  name: 'Resource Management',
  category: 'services',
  description: 'Resource Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "resource management",
      "resource",
      "management",
      "resource software",
      "resource app",
      "resource platform",
      "resource system",
      "services resource"
  ],

  synonyms: [
      "Resource Management platform",
      "Resource Management software",
      "Resource Management system",
      "resource solution",
      "resource service"
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
      "Build a resource management platform",
      "Create a resource management app",
      "I need a resource management management system",
      "Build a resource management solution",
      "Create a resource management booking system"
  ],
};
