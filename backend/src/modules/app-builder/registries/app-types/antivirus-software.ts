/**
 * Antivirus Software App Type Definition
 *
 * Complete definition for antivirus software applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANTIVIRUS_SOFTWARE_APP_TYPE: AppTypeDefinition = {
  id: 'antivirus-software',
  name: 'Antivirus Software',
  category: 'technology',
  description: 'Antivirus Software platform with comprehensive management features',
  icon: 'laptop',

  keywords: [
      "antivirus software",
      "antivirus",
      "software",
      "antivirus app",
      "antivirus platform",
      "antivirus system",
      "antivirus management",
      "technology antivirus"
  ],

  synonyms: [
      "Antivirus Software platform",
      "Antivirus Software software",
      "Antivirus Software system",
      "antivirus solution",
      "antivirus service"
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

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a antivirus software platform",
      "Create a antivirus software app",
      "I need a antivirus software management system",
      "Build a antivirus software solution",
      "Create a antivirus software booking system"
  ],
};
