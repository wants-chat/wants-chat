/**
 * Installation Services App Type Definition
 *
 * Complete definition for installation services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INSTALLATION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'installation-services',
  name: 'Installation Services',
  category: 'services',
  description: 'Installation Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "installation services",
      "installation",
      "services",
      "installation software",
      "installation app",
      "installation platform",
      "installation system",
      "installation management",
      "services installation"
  ],

  synonyms: [
      "Installation Services platform",
      "Installation Services software",
      "Installation Services system",
      "installation solution",
      "installation service"
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
      "Build a installation services platform",
      "Create a installation services app",
      "I need a installation services management system",
      "Build a installation services solution",
      "Create a installation services booking system"
  ],
};
