/**
 * Safety Consulting App Type Definition
 *
 * Complete definition for safety consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SAFETY_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'safety-consulting',
  name: 'Safety Consulting',
  category: 'professional-services',
  description: 'Safety Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "safety consulting",
      "safety",
      "consulting",
      "safety software",
      "safety app",
      "safety platform",
      "safety system",
      "safety management",
      "consulting safety"
  ],

  synonyms: [
      "Safety Consulting platform",
      "Safety Consulting software",
      "Safety Consulting system",
      "safety solution",
      "safety service"
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
      "Build a safety consulting platform",
      "Create a safety consulting app",
      "I need a safety consulting management system",
      "Build a safety consulting solution",
      "Create a safety consulting booking system"
  ],
};
