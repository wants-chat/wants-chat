/**
 * Ophthalmology App Type Definition
 *
 * Complete definition for ophthalmology applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OPHTHALMOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'ophthalmology',
  name: 'Ophthalmology',
  category: 'services',
  description: 'Ophthalmology platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ophthalmology",
      "ophthalmology software",
      "ophthalmology app",
      "ophthalmology platform",
      "ophthalmology system",
      "ophthalmology management",
      "services ophthalmology"
  ],

  synonyms: [
      "Ophthalmology platform",
      "Ophthalmology software",
      "Ophthalmology system",
      "ophthalmology solution",
      "ophthalmology service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a ophthalmology platform",
      "Create a ophthalmology app",
      "I need a ophthalmology management system",
      "Build a ophthalmology solution",
      "Create a ophthalmology booking system"
  ],
};
