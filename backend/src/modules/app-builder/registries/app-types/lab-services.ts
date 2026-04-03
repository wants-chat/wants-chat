/**
 * Lab Services App Type Definition
 *
 * Complete definition for lab services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LAB_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'lab-services',
  name: 'Lab Services',
  category: 'services',
  description: 'Lab Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "lab services",
      "lab",
      "services",
      "lab software",
      "lab app",
      "lab platform",
      "lab system",
      "lab management",
      "services lab"
  ],

  synonyms: [
      "Lab Services platform",
      "Lab Services software",
      "Lab Services system",
      "lab solution",
      "lab service"
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
      "Build a lab services platform",
      "Create a lab services app",
      "I need a lab services management system",
      "Build a lab services solution",
      "Create a lab services booking system"
  ],
};
