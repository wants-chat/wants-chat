/**
 * Energy Consulting App Type Definition
 *
 * Complete definition for energy consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ENERGY_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'energy-consulting',
  name: 'Energy Consulting',
  category: 'professional-services',
  description: 'Energy Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "energy consulting",
      "energy",
      "consulting",
      "energy software",
      "energy app",
      "energy platform",
      "energy system",
      "energy management",
      "consulting energy"
  ],

  synonyms: [
      "Energy Consulting platform",
      "Energy Consulting software",
      "Energy Consulting system",
      "energy solution",
      "energy service"
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
      "Build a energy consulting platform",
      "Create a energy consulting app",
      "I need a energy consulting management system",
      "Build a energy consulting solution",
      "Create a energy consulting booking system"
  ],
};
