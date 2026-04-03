/**
 * Accessibility Consulting App Type Definition
 *
 * Complete definition for accessibility consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ACCESSIBILITY_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'accessibility-consulting',
  name: 'Accessibility Consulting',
  category: 'professional-services',
  description: 'Accessibility Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "accessibility consulting",
      "accessibility",
      "consulting",
      "accessibility software",
      "accessibility app",
      "accessibility platform",
      "accessibility system",
      "accessibility management",
      "consulting accessibility"
  ],

  synonyms: [
      "Accessibility Consulting platform",
      "Accessibility Consulting software",
      "Accessibility Consulting system",
      "accessibility solution",
      "accessibility service"
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
      "Build a accessibility consulting platform",
      "Create a accessibility consulting app",
      "I need a accessibility consulting management system",
      "Build a accessibility consulting solution",
      "Create a accessibility consulting booking system"
  ],
};
