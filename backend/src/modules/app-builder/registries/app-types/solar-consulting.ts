/**
 * Solar Consulting App Type Definition
 *
 * Complete definition for solar consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOLAR_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'solar-consulting',
  name: 'Solar Consulting',
  category: 'professional-services',
  description: 'Solar Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "solar consulting",
      "solar",
      "consulting",
      "solar software",
      "solar app",
      "solar platform",
      "solar system",
      "solar management",
      "consulting solar"
  ],

  synonyms: [
      "Solar Consulting platform",
      "Solar Consulting software",
      "Solar Consulting system",
      "solar solution",
      "solar service"
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
      "Build a solar consulting platform",
      "Create a solar consulting app",
      "I need a solar consulting management system",
      "Build a solar consulting solution",
      "Create a solar consulting booking system"
  ],
};
