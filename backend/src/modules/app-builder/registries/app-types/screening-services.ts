/**
 * Screening Services App Type Definition
 *
 * Complete definition for screening services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCREENING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'screening-services',
  name: 'Screening Services',
  category: 'services',
  description: 'Screening Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "screening services",
      "screening",
      "services",
      "screening software",
      "screening app",
      "screening platform",
      "screening system",
      "screening management",
      "services screening"
  ],

  synonyms: [
      "Screening Services platform",
      "Screening Services software",
      "Screening Services system",
      "screening solution",
      "screening service"
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
      "Build a screening services platform",
      "Create a screening services app",
      "I need a screening services management system",
      "Build a screening services solution",
      "Create a screening services booking system"
  ],
};
