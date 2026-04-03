/**
 * Yacht Management App Type Definition
 *
 * Complete definition for yacht management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YACHT_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'yacht-management',
  name: 'Yacht Management',
  category: 'services',
  description: 'Yacht Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "yacht management",
      "yacht",
      "management",
      "yacht software",
      "yacht app",
      "yacht platform",
      "yacht system",
      "services yacht"
  ],

  synonyms: [
      "Yacht Management platform",
      "Yacht Management software",
      "Yacht Management system",
      "yacht solution",
      "yacht service"
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
      "Build a yacht management platform",
      "Create a yacht management app",
      "I need a yacht management management system",
      "Build a yacht management solution",
      "Create a yacht management booking system"
  ],
};
