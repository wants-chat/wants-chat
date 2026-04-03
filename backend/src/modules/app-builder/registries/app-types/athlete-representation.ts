/**
 * Athlete Representation App Type Definition
 *
 * Complete definition for athlete representation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ATHLETE_REPRESENTATION_APP_TYPE: AppTypeDefinition = {
  id: 'athlete-representation',
  name: 'Athlete Representation',
  category: 'services',
  description: 'Athlete Representation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "athlete representation",
      "athlete",
      "representation",
      "athlete software",
      "athlete app",
      "athlete platform",
      "athlete system",
      "athlete management",
      "services athlete"
  ],

  synonyms: [
      "Athlete Representation platform",
      "Athlete Representation software",
      "Athlete Representation system",
      "athlete solution",
      "athlete service"
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
      "Build a athlete representation platform",
      "Create a athlete representation app",
      "I need a athlete representation management system",
      "Build a athlete representation solution",
      "Create a athlete representation booking system"
  ],
};
