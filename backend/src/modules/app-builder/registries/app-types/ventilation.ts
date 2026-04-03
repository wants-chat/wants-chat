/**
 * Ventilation App Type Definition
 *
 * Complete definition for ventilation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VENTILATION_APP_TYPE: AppTypeDefinition = {
  id: 'ventilation',
  name: 'Ventilation',
  category: 'services',
  description: 'Ventilation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ventilation",
      "ventilation software",
      "ventilation app",
      "ventilation platform",
      "ventilation system",
      "ventilation management",
      "services ventilation"
  ],

  synonyms: [
      "Ventilation platform",
      "Ventilation software",
      "Ventilation system",
      "ventilation solution",
      "ventilation service"
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
      "Build a ventilation platform",
      "Create a ventilation app",
      "I need a ventilation management system",
      "Build a ventilation solution",
      "Create a ventilation booking system"
  ],
};
