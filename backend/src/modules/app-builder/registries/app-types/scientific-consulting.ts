/**
 * Scientific Consulting App Type Definition
 *
 * Complete definition for scientific consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCIENTIFIC_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'scientific-consulting',
  name: 'Scientific Consulting',
  category: 'professional-services',
  description: 'Scientific Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "scientific consulting",
      "scientific",
      "consulting",
      "scientific software",
      "scientific app",
      "scientific platform",
      "scientific system",
      "scientific management",
      "consulting scientific"
  ],

  synonyms: [
      "Scientific Consulting platform",
      "Scientific Consulting software",
      "Scientific Consulting system",
      "scientific solution",
      "scientific service"
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a scientific consulting platform",
      "Create a scientific consulting app",
      "I need a scientific consulting management system",
      "Build a scientific consulting solution",
      "Create a scientific consulting booking system"
  ],
};
