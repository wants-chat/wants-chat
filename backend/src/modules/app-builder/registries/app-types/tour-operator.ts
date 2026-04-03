/**
 * Tour Operator App Type Definition
 *
 * Complete definition for tour operator applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOUR_OPERATOR_APP_TYPE: AppTypeDefinition = {
  id: 'tour-operator',
  name: 'Tour Operator',
  category: 'services',
  description: 'Tour Operator platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tour operator",
      "tour",
      "operator",
      "tour software",
      "tour app",
      "tour platform",
      "tour system",
      "tour management",
      "services tour"
  ],

  synonyms: [
      "Tour Operator platform",
      "Tour Operator software",
      "Tour Operator system",
      "tour solution",
      "tour service"
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
      "Build a tour operator platform",
      "Create a tour operator app",
      "I need a tour operator management system",
      "Build a tour operator solution",
      "Create a tour operator booking system"
  ],
};
