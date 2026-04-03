/**
 * Tech Consulting App Type Definition
 *
 * Complete definition for tech consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TECH_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'tech-consulting',
  name: 'Tech Consulting',
  category: 'professional-services',
  description: 'Tech Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "tech consulting",
      "tech",
      "consulting",
      "tech software",
      "tech app",
      "tech platform",
      "tech system",
      "tech management",
      "consulting tech"
  ],

  synonyms: [
      "Tech Consulting platform",
      "Tech Consulting software",
      "Tech Consulting system",
      "tech solution",
      "tech service"
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
      "Build a tech consulting platform",
      "Create a tech consulting app",
      "I need a tech consulting management system",
      "Build a tech consulting solution",
      "Create a tech consulting booking system"
  ],
};
