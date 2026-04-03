/**
 * Educational Consulting App Type Definition
 *
 * Complete definition for educational consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EDUCATIONAL_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'educational-consulting',
  name: 'Educational Consulting',
  category: 'professional-services',
  description: 'Educational Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "educational consulting",
      "educational",
      "consulting",
      "educational software",
      "educational app",
      "educational platform",
      "educational system",
      "educational management",
      "consulting educational"
  ],

  synonyms: [
      "Educational Consulting platform",
      "Educational Consulting software",
      "Educational Consulting system",
      "educational solution",
      "educational service"
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
      "Build a educational consulting platform",
      "Create a educational consulting app",
      "I need a educational consulting management system",
      "Build a educational consulting solution",
      "Create a educational consulting booking system"
  ],
};
