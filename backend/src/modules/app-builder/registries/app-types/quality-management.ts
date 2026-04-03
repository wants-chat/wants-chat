/**
 * Quality Management App Type Definition
 *
 * Complete definition for quality management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const QUALITY_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'quality-management',
  name: 'Quality Management',
  category: 'services',
  description: 'Quality Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "quality management",
      "quality",
      "management",
      "quality software",
      "quality app",
      "quality platform",
      "quality system",
      "services quality"
  ],

  synonyms: [
      "Quality Management platform",
      "Quality Management software",
      "Quality Management system",
      "quality solution",
      "quality service"
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
      "Build a quality management platform",
      "Create a quality management app",
      "I need a quality management management system",
      "Build a quality management solution",
      "Create a quality management booking system"
  ],
};
