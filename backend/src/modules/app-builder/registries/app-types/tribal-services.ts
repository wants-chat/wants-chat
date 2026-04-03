/**
 * Tribal Services App Type Definition
 *
 * Complete definition for tribal services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRIBAL_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'tribal-services',
  name: 'Tribal Services',
  category: 'services',
  description: 'Tribal Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "tribal services",
      "tribal",
      "services",
      "tribal software",
      "tribal app",
      "tribal platform",
      "tribal system",
      "tribal management",
      "services tribal"
  ],

  synonyms: [
      "Tribal Services platform",
      "Tribal Services software",
      "Tribal Services system",
      "tribal solution",
      "tribal service"
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
      "Build a tribal services platform",
      "Create a tribal services app",
      "I need a tribal services management system",
      "Build a tribal services solution",
      "Create a tribal services booking system"
  ],
};
