/**
 * Pastoral Counseling App Type Definition
 *
 * Complete definition for pastoral counseling applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PASTORAL_COUNSELING_APP_TYPE: AppTypeDefinition = {
  id: 'pastoral-counseling',
  name: 'Pastoral Counseling',
  category: 'services',
  description: 'Pastoral Counseling platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "pastoral counseling",
      "pastoral",
      "counseling",
      "pastoral software",
      "pastoral app",
      "pastoral platform",
      "pastoral system",
      "pastoral management",
      "services pastoral"
  ],

  synonyms: [
      "Pastoral Counseling platform",
      "Pastoral Counseling software",
      "Pastoral Counseling system",
      "pastoral solution",
      "pastoral service"
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
      "Build a pastoral counseling platform",
      "Create a pastoral counseling app",
      "I need a pastoral counseling management system",
      "Build a pastoral counseling solution",
      "Create a pastoral counseling booking system"
  ],
};
