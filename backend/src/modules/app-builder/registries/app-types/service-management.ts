/**
 * Service Management App Type Definition
 *
 * Complete definition for service management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SERVICE_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'service-management',
  name: 'Service Management',
  category: 'services',
  description: 'Service Management platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "service management",
      "service",
      "management",
      "service software",
      "service app",
      "service platform",
      "service system",
      "services service"
  ],

  synonyms: [
      "Service Management platform",
      "Service Management software",
      "Service Management system",
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
      "Build a service management platform",
      "Create a service management app",
      "I need a service management management system",
      "Build a service management solution",
      "Create a service management booking system"
  ],
};
