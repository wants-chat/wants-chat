/**
 * Service Station App Type Definition
 *
 * Complete definition for service station applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SERVICE_STATION_APP_TYPE: AppTypeDefinition = {
  id: 'service-station',
  name: 'Service Station',
  category: 'services',
  description: 'Service Station platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "service station",
      "service",
      "station",
      "service software",
      "service app",
      "service platform",
      "service system",
      "service management",
      "services service"
  ],

  synonyms: [
      "Service Station platform",
      "Service Station software",
      "Service Station system",
      "service solution",
      "service service"
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
      "Build a service station platform",
      "Create a service station app",
      "I need a service station management system",
      "Build a service station solution",
      "Create a service station booking system"
  ],
};
