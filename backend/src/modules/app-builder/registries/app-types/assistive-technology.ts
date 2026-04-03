/**
 * Assistive Technology App Type Definition
 *
 * Complete definition for assistive technology applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASSISTIVE_TECHNOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'assistive-technology',
  name: 'Assistive Technology',
  category: 'technology',
  description: 'Assistive Technology platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "assistive technology",
      "assistive",
      "technology",
      "assistive software",
      "assistive app",
      "assistive platform",
      "assistive system",
      "assistive management",
      "technology assistive"
  ],

  synonyms: [
      "Assistive Technology platform",
      "Assistive Technology software",
      "Assistive Technology system",
      "assistive solution",
      "assistive service"
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
      "Build a assistive technology platform",
      "Create a assistive technology app",
      "I need a assistive technology management system",
      "Build a assistive technology solution",
      "Create a assistive technology booking system"
  ],
};
