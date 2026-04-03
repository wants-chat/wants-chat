/**
 * Marketing Consulting App Type Definition
 *
 * Complete definition for marketing consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARKETING_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'marketing-consulting',
  name: 'Marketing Consulting',
  category: 'professional-services',
  description: 'Marketing Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "marketing consulting",
      "marketing",
      "consulting",
      "marketing software",
      "marketing app",
      "marketing platform",
      "marketing system",
      "marketing management",
      "consulting marketing"
  ],

  synonyms: [
      "Marketing Consulting platform",
      "Marketing Consulting software",
      "Marketing Consulting system",
      "marketing solution",
      "marketing service"
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
      "Build a marketing consulting platform",
      "Create a marketing consulting app",
      "I need a marketing consulting management system",
      "Build a marketing consulting solution",
      "Create a marketing consulting booking system"
  ],
};
