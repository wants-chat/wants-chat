/**
 * Acoustic Consulting App Type Definition
 *
 * Complete definition for acoustic consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ACOUSTIC_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'acoustic-consulting',
  name: 'Acoustic Consulting',
  category: 'professional-services',
  description: 'Acoustic Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "acoustic consulting",
      "acoustic",
      "consulting",
      "acoustic software",
      "acoustic app",
      "acoustic platform",
      "acoustic system",
      "acoustic management",
      "consulting acoustic"
  ],

  synonyms: [
      "Acoustic Consulting platform",
      "Acoustic Consulting software",
      "Acoustic Consulting system",
      "acoustic solution",
      "acoustic service"
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
      "Build a acoustic consulting platform",
      "Create a acoustic consulting app",
      "I need a acoustic consulting management system",
      "Build a acoustic consulting solution",
      "Create a acoustic consulting booking system"
  ],
};
