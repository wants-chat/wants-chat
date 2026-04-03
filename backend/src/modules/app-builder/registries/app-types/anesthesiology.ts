/**
 * Anesthesiology App Type Definition
 *
 * Complete definition for anesthesiology applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANESTHESIOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'anesthesiology',
  name: 'Anesthesiology',
  category: 'services',
  description: 'Anesthesiology platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "anesthesiology",
      "anesthesiology software",
      "anesthesiology app",
      "anesthesiology platform",
      "anesthesiology system",
      "anesthesiology management",
      "services anesthesiology"
  ],

  synonyms: [
      "Anesthesiology platform",
      "Anesthesiology software",
      "Anesthesiology system",
      "anesthesiology solution",
      "anesthesiology service"
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
      "Build a anesthesiology platform",
      "Create a anesthesiology app",
      "I need a anesthesiology management system",
      "Build a anesthesiology solution",
      "Create a anesthesiology booking system"
  ],
};
