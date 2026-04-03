/**
 * Alignment Services App Type Definition
 *
 * Complete definition for alignment services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALIGNMENT_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'alignment-services',
  name: 'Alignment Services',
  category: 'services',
  description: 'Alignment Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "alignment services",
      "alignment",
      "services",
      "alignment software",
      "alignment app",
      "alignment platform",
      "alignment system",
      "alignment management",
      "services alignment"
  ],

  synonyms: [
      "Alignment Services platform",
      "Alignment Services software",
      "Alignment Services system",
      "alignment solution",
      "alignment service"
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
      "Build a alignment services platform",
      "Create a alignment services app",
      "I need a alignment services management system",
      "Build a alignment services solution",
      "Create a alignment services booking system"
  ],
};
