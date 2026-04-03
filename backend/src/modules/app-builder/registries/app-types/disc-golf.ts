/**
 * Disc Golf App Type Definition
 *
 * Complete definition for disc golf applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DISC_GOLF_APP_TYPE: AppTypeDefinition = {
  id: 'disc-golf',
  name: 'Disc Golf',
  category: 'services',
  description: 'Disc Golf platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "disc golf",
      "disc",
      "golf",
      "disc software",
      "disc app",
      "disc platform",
      "disc system",
      "disc management",
      "services disc"
  ],

  synonyms: [
      "Disc Golf platform",
      "Disc Golf software",
      "Disc Golf system",
      "disc solution",
      "disc service"
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
      "Build a disc golf platform",
      "Create a disc golf app",
      "I need a disc golf management system",
      "Build a disc golf solution",
      "Create a disc golf booking system"
  ],
};
