/**
 * Adhesive Manufacturing App Type Definition
 *
 * Complete definition for adhesive manufacturing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ADHESIVE_MANUFACTURING_APP_TYPE: AppTypeDefinition = {
  id: 'adhesive-manufacturing',
  name: 'Adhesive Manufacturing',
  category: 'services',
  description: 'Adhesive Manufacturing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "adhesive manufacturing",
      "adhesive",
      "manufacturing",
      "adhesive software",
      "adhesive app",
      "adhesive platform",
      "adhesive system",
      "adhesive management",
      "services adhesive"
  ],

  synonyms: [
      "Adhesive Manufacturing platform",
      "Adhesive Manufacturing software",
      "Adhesive Manufacturing system",
      "adhesive solution",
      "adhesive service"
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
      "Build a adhesive manufacturing platform",
      "Create a adhesive manufacturing app",
      "I need a adhesive manufacturing management system",
      "Build a adhesive manufacturing solution",
      "Create a adhesive manufacturing booking system"
  ],
};
