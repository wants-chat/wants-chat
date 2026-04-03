/**
 * Operations Consulting App Type Definition
 *
 * Complete definition for operations consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OPERATIONS_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'operations-consulting',
  name: 'Operations Consulting',
  category: 'professional-services',
  description: 'Operations Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "operations consulting",
      "operations",
      "consulting",
      "operations software",
      "operations app",
      "operations platform",
      "operations system",
      "operations management",
      "consulting operations"
  ],

  synonyms: [
      "Operations Consulting platform",
      "Operations Consulting software",
      "Operations Consulting system",
      "operations solution",
      "operations service"
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
      "Build a operations consulting platform",
      "Create a operations consulting app",
      "I need a operations consulting management system",
      "Build a operations consulting solution",
      "Create a operations consulting booking system"
  ],
};
