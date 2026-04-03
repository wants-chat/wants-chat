/**
 * Parking Services App Type Definition
 *
 * Complete definition for parking services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARKING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'parking-services',
  name: 'Parking Services',
  category: 'services',
  description: 'Parking Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "parking services",
      "parking",
      "services",
      "parking software",
      "parking app",
      "parking platform",
      "parking system",
      "parking management",
      "services parking"
  ],

  synonyms: [
      "Parking Services platform",
      "Parking Services software",
      "Parking Services system",
      "parking solution",
      "parking service"
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
      "Build a parking services platform",
      "Create a parking services app",
      "I need a parking services management system",
      "Build a parking services solution",
      "Create a parking services booking system"
  ],
};
