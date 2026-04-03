/**
 * Uk Visa App Type Definition
 *
 * Complete definition for uk visa applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UK_VISA_APP_TYPE: AppTypeDefinition = {
  id: 'uk-visa',
  name: 'Uk Visa',
  category: 'services',
  description: 'Uk Visa platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "uk visa",
      "visa",
      "uk software",
      "uk app",
      "uk platform",
      "uk system",
      "uk management",
      "services uk"
  ],

  synonyms: [
      "Uk Visa platform",
      "Uk Visa software",
      "Uk Visa system",
      "uk solution",
      "uk service"
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
      "Build a uk visa platform",
      "Create a uk visa app",
      "I need a uk visa management system",
      "Build a uk visa solution",
      "Create a uk visa booking system"
  ],
};
