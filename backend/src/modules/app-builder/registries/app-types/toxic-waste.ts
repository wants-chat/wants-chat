/**
 * Toxic Waste App Type Definition
 *
 * Complete definition for toxic waste applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOXIC_WASTE_APP_TYPE: AppTypeDefinition = {
  id: 'toxic-waste',
  name: 'Toxic Waste',
  category: 'services',
  description: 'Toxic Waste platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "toxic waste",
      "toxic",
      "waste",
      "toxic software",
      "toxic app",
      "toxic platform",
      "toxic system",
      "toxic management",
      "services toxic"
  ],

  synonyms: [
      "Toxic Waste platform",
      "Toxic Waste software",
      "Toxic Waste system",
      "toxic solution",
      "toxic service"
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
      "Build a toxic waste platform",
      "Create a toxic waste app",
      "I need a toxic waste management system",
      "Build a toxic waste solution",
      "Create a toxic waste booking system"
  ],
};
