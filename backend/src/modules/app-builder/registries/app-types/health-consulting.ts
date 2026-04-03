/**
 * Health Consulting App Type Definition
 *
 * Complete definition for health consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HEALTH_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'health-consulting',
  name: 'Health Consulting',
  category: 'professional-services',
  description: 'Health Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "health consulting",
      "health",
      "consulting",
      "health software",
      "health app",
      "health platform",
      "health system",
      "health management",
      "consulting health"
  ],

  synonyms: [
      "Health Consulting platform",
      "Health Consulting software",
      "Health Consulting system",
      "health solution",
      "health service"
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
      "Build a health consulting platform",
      "Create a health consulting app",
      "I need a health consulting management system",
      "Build a health consulting solution",
      "Create a health consulting booking system"
  ],
};
