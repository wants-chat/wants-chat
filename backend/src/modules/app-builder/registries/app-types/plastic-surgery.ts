/**
 * Plastic Surgery App Type Definition
 *
 * Complete definition for plastic surgery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PLASTIC_SURGERY_APP_TYPE: AppTypeDefinition = {
  id: 'plastic-surgery',
  name: 'Plastic Surgery',
  category: 'services',
  description: 'Plastic Surgery platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "plastic surgery",
      "plastic",
      "surgery",
      "plastic software",
      "plastic app",
      "plastic platform",
      "plastic system",
      "plastic management",
      "services plastic"
  ],

  synonyms: [
      "Plastic Surgery platform",
      "Plastic Surgery software",
      "Plastic Surgery system",
      "plastic solution",
      "plastic service"
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
      "Build a plastic surgery platform",
      "Create a plastic surgery app",
      "I need a plastic surgery management system",
      "Build a plastic surgery solution",
      "Create a plastic surgery booking system"
  ],
};
