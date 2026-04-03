/**
 * Mail Services App Type Definition
 *
 * Complete definition for mail services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MAIL_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'mail-services',
  name: 'Mail Services',
  category: 'services',
  description: 'Mail Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "mail services",
      "mail",
      "services",
      "mail software",
      "mail app",
      "mail platform",
      "mail system",
      "mail management",
      "services mail"
  ],

  synonyms: [
      "Mail Services platform",
      "Mail Services software",
      "Mail Services system",
      "mail solution",
      "mail service"
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
      "Build a mail services platform",
      "Create a mail services app",
      "I need a mail services management system",
      "Build a mail services solution",
      "Create a mail services booking system"
  ],
};
