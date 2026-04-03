/**
 * Factory Outlet App Type Definition
 *
 * Complete definition for factory outlet applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FACTORY_OUTLET_APP_TYPE: AppTypeDefinition = {
  id: 'factory-outlet',
  name: 'Factory Outlet',
  category: 'services',
  description: 'Factory Outlet platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "factory outlet",
      "factory",
      "outlet",
      "factory software",
      "factory app",
      "factory platform",
      "factory system",
      "factory management",
      "services factory"
  ],

  synonyms: [
      "Factory Outlet platform",
      "Factory Outlet software",
      "Factory Outlet system",
      "factory solution",
      "factory service"
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
      "Build a factory outlet platform",
      "Create a factory outlet app",
      "I need a factory outlet management system",
      "Build a factory outlet solution",
      "Create a factory outlet booking system"
  ],
};
