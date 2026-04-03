/**
 * Radiology App Type Definition
 *
 * Complete definition for radiology applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RADIOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'radiology',
  name: 'Radiology',
  category: 'services',
  description: 'Radiology platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "radiology",
      "radiology software",
      "radiology app",
      "radiology platform",
      "radiology system",
      "radiology management",
      "services radiology"
  ],

  synonyms: [
      "Radiology platform",
      "Radiology software",
      "Radiology system",
      "radiology solution",
      "radiology service"
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
      "Build a radiology platform",
      "Create a radiology app",
      "I need a radiology management system",
      "Build a radiology solution",
      "Create a radiology booking system"
  ],
};
