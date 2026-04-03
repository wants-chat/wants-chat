/**
 * Zoom Services App Type Definition
 *
 * Complete definition for zoom services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ZOOM_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'zoom-services',
  name: 'Zoom Services',
  category: 'services',
  description: 'Zoom Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "zoom services",
      "zoom",
      "services",
      "zoom software",
      "zoom app",
      "zoom platform",
      "zoom system",
      "zoom management",
      "services zoom"
  ],

  synonyms: [
      "Zoom Services platform",
      "Zoom Services software",
      "Zoom Services system",
      "zoom solution",
      "zoom service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a zoom services platform",
      "Create a zoom services app",
      "I need a zoom services management system",
      "Build a zoom services solution",
      "Create a zoom services booking system"
  ],
};
