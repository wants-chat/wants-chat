/**
 * Acupressure App Type Definition
 *
 * Complete definition for acupressure applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ACUPRESSURE_APP_TYPE: AppTypeDefinition = {
  id: 'acupressure',
  name: 'Acupressure',
  category: 'services',
  description: 'Acupressure platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "acupressure",
      "acupressure software",
      "acupressure app",
      "acupressure platform",
      "acupressure system",
      "acupressure management",
      "services acupressure"
  ],

  synonyms: [
      "Acupressure platform",
      "Acupressure software",
      "Acupressure system",
      "acupressure solution",
      "acupressure service"
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
      "Build a acupressure platform",
      "Create a acupressure app",
      "I need a acupressure management system",
      "Build a acupressure solution",
      "Create a acupressure booking system"
  ],
};
