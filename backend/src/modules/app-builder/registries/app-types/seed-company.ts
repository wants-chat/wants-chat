/**
 * Seed Company App Type Definition
 *
 * Complete definition for seed company applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEED_COMPANY_APP_TYPE: AppTypeDefinition = {
  id: 'seed-company',
  name: 'Seed Company',
  category: 'services',
  description: 'Seed Company platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "seed company",
      "seed",
      "company",
      "seed software",
      "seed app",
      "seed platform",
      "seed system",
      "seed management",
      "services seed"
  ],

  synonyms: [
      "Seed Company platform",
      "Seed Company software",
      "Seed Company system",
      "seed solution",
      "seed service"
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
      "Build a seed company platform",
      "Create a seed company app",
      "I need a seed company management system",
      "Build a seed company solution",
      "Create a seed company booking system"
  ],
};
