/**
 * Synagogue Services App Type Definition
 *
 * Complete definition for synagogue services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SYNAGOGUE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'synagogue-services',
  name: 'Synagogue Services',
  category: 'nonprofit',
  description: 'Synagogue Services platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "synagogue services",
      "synagogue",
      "services",
      "synagogue software",
      "synagogue app",
      "synagogue platform",
      "synagogue system",
      "synagogue management",
      "nonprofit synagogue"
  ],

  synonyms: [
      "Synagogue Services platform",
      "Synagogue Services software",
      "Synagogue Services system",
      "synagogue solution",
      "synagogue service"
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
      "crm",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "messaging",
      "blog",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'nonprofit',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'warm',

  examplePrompts: [
      "Build a synagogue services platform",
      "Create a synagogue services app",
      "I need a synagogue services management system",
      "Build a synagogue services solution",
      "Create a synagogue services booking system"
  ],
};
