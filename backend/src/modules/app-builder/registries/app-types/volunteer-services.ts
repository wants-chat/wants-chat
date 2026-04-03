/**
 * Volunteer Services App Type Definition
 *
 * Complete definition for volunteer services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOLUNTEER_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'volunteer-services',
  name: 'Volunteer Services',
  category: 'services',
  description: 'Volunteer Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "volunteer services",
      "volunteer",
      "services",
      "volunteer software",
      "volunteer app",
      "volunteer platform",
      "volunteer system",
      "volunteer management",
      "services volunteer"
  ],

  synonyms: [
      "Volunteer Services platform",
      "Volunteer Services software",
      "Volunteer Services system",
      "volunteer solution",
      "volunteer service"
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
      "Build a volunteer services platform",
      "Create a volunteer services app",
      "I need a volunteer services management system",
      "Build a volunteer services solution",
      "Create a volunteer services booking system"
  ],
};
