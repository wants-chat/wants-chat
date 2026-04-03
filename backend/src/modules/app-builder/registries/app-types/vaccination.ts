/**
 * Vaccination App Type Definition
 *
 * Complete definition for vaccination applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VACCINATION_APP_TYPE: AppTypeDefinition = {
  id: 'vaccination',
  name: 'Vaccination',
  category: 'services',
  description: 'Vaccination platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vaccination",
      "vaccination software",
      "vaccination app",
      "vaccination platform",
      "vaccination system",
      "vaccination management",
      "services vaccination"
  ],

  synonyms: [
      "Vaccination platform",
      "Vaccination software",
      "Vaccination system",
      "vaccination solution",
      "vaccination service"
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
      "Build a vaccination platform",
      "Create a vaccination app",
      "I need a vaccination management system",
      "Build a vaccination solution",
      "Create a vaccination booking system"
  ],
};
