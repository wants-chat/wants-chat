/**
 * Sports Therapy App Type Definition
 *
 * Complete definition for sports therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'sports-therapy',
  name: 'Sports Therapy',
  category: 'healthcare',
  description: 'Sports Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "sports therapy",
      "sports",
      "therapy",
      "sports software",
      "sports app",
      "sports platform",
      "sports system",
      "sports management",
      "healthcare sports"
  ],

  synonyms: [
      "Sports Therapy platform",
      "Sports Therapy software",
      "Sports Therapy system",
      "sports solution",
      "sports service"
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
          "name": "Practice Owner",
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
          "name": "Healthcare Provider",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Patient",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/appointments"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "calendar",
      "scheduling",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "treatment-plans",
      "documents",
      "invoicing",
      "payments",
      "messaging"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'healthcare',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'calm',

  examplePrompts: [
      "Build a sports therapy platform",
      "Create a sports therapy app",
      "I need a sports therapy management system",
      "Build a sports therapy solution",
      "Create a sports therapy booking system"
  ],
};
