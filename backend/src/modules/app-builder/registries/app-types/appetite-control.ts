/**
 * Appetite Control App Type Definition
 *
 * Complete definition for appetite control applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APPETITE_CONTROL_APP_TYPE: AppTypeDefinition = {
  id: 'appetite-control',
  name: 'Appetite Control',
  category: 'pets',
  description: 'Appetite Control platform with comprehensive management features',
  icon: 'paw',

  keywords: [
      "appetite control",
      "appetite",
      "control",
      "appetite software",
      "appetite app",
      "appetite platform",
      "appetite system",
      "appetite management",
      "pets appetite"
  ],

  synonyms: [
      "Appetite Control platform",
      "Appetite Control software",
      "Appetite Control system",
      "appetite solution",
      "appetite service"
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
      "client-intake",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "gallery",
      "reminders",
      "messaging"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'pets',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
      "Build a appetite control platform",
      "Create a appetite control app",
      "I need a appetite control management system",
      "Build a appetite control solution",
      "Create a appetite control booking system"
  ],
};
