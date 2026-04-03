/**
 * Cigar Lounge App Type Definition
 *
 * Complete definition for cigar lounge applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CIGAR_LOUNGE_APP_TYPE: AppTypeDefinition = {
  id: 'cigar-lounge',
  name: 'Cigar Lounge',
  category: 'services',
  description: 'Cigar Lounge platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "cigar lounge",
      "cigar",
      "lounge",
      "cigar software",
      "cigar app",
      "cigar platform",
      "cigar system",
      "cigar management",
      "services cigar"
  ],

  synonyms: [
      "Cigar Lounge platform",
      "Cigar Lounge software",
      "Cigar Lounge system",
      "cigar solution",
      "cigar service"
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
      "Build a cigar lounge platform",
      "Create a cigar lounge app",
      "I need a cigar lounge management system",
      "Build a cigar lounge solution",
      "Create a cigar lounge booking system"
  ],
};
