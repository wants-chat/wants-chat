/**
 * Ride Service App Type Definition
 *
 * Complete definition for ride service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RIDE_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'ride-service',
  name: 'Ride Service',
  category: 'services',
  description: 'Ride Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "ride service",
      "ride",
      "service",
      "ride software",
      "ride app",
      "ride platform",
      "ride system",
      "ride management",
      "services ride"
  ],

  synonyms: [
      "Ride Service platform",
      "Ride Service software",
      "Ride Service system",
      "ride solution",
      "ride service"
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
      "Build a ride service platform",
      "Create a ride service app",
      "I need a ride service management system",
      "Build a ride service solution",
      "Create a ride service booking system"
  ],
};
