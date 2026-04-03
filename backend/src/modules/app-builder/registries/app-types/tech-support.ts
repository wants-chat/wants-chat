/**
 * Tech Support App Type Definition
 *
 * Complete definition for tech support applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TECH_SUPPORT_APP_TYPE: AppTypeDefinition = {
  id: 'tech-support',
  name: 'Tech Support',
  category: 'technology',
  description: 'Tech Support platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "tech support",
      "tech",
      "support",
      "tech software",
      "tech app",
      "tech platform",
      "tech system",
      "tech management",
      "technology tech"
  ],

  synonyms: [
      "Tech Support platform",
      "Tech Support software",
      "Tech Support system",
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
      "projects",
      "tasks",
      "documents",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "time-tracking",
      "invoicing",
      "clients",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a tech support platform",
      "Create a tech support app",
      "I need a tech support management system",
      "Build a tech support solution",
      "Create a tech support booking system"
  ],
};
