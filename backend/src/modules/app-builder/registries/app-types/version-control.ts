/**
 * Version Control App Type Definition
 *
 * Complete definition for version control applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VERSION_CONTROL_APP_TYPE: AppTypeDefinition = {
  id: 'version-control',
  name: 'Version Control',
  category: 'services',
  description: 'Version Control platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "version control",
      "version",
      "control",
      "version software",
      "version app",
      "version platform",
      "version system",
      "version management",
      "services version"
  ],

  synonyms: [
      "Version Control platform",
      "Version Control software",
      "Version Control system",
      "version solution",
      "version service"
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
      "Build a version control platform",
      "Create a version control app",
      "I need a version control management system",
      "Build a version control solution",
      "Create a version control booking system"
  ],
};
