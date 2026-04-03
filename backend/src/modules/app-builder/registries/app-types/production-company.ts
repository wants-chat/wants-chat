/**
 * Production Company App Type Definition
 *
 * Complete definition for production company applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRODUCTION_COMPANY_APP_TYPE: AppTypeDefinition = {
  id: 'production-company',
  name: 'Production Company',
  category: 'services',
  description: 'Production Company platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "production company",
      "production",
      "company",
      "production software",
      "production app",
      "production platform",
      "production system",
      "production management",
      "services production"
  ],

  synonyms: [
      "Production Company platform",
      "Production Company software",
      "Production Company system",
      "production solution",
      "production service"
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
      "Build a production company platform",
      "Create a production company app",
      "I need a production company management system",
      "Build a production company solution",
      "Create a production company booking system"
  ],
};
