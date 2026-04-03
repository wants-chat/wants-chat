/**
 * Media Consulting App Type Definition
 *
 * Complete definition for media consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEDIA_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'media-consulting',
  name: 'Media Consulting',
  category: 'professional-services',
  description: 'Media Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "media consulting",
      "media",
      "consulting",
      "media software",
      "media app",
      "media platform",
      "media system",
      "media management",
      "consulting media"
  ],

  synonyms: [
      "Media Consulting platform",
      "Media Consulting software",
      "Media Consulting system",
      "media solution",
      "media service"
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a media consulting platform",
      "Create a media consulting app",
      "I need a media consulting management system",
      "Build a media consulting solution",
      "Create a media consulting booking system"
  ],
};
