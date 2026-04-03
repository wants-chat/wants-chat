/**
 * Proposal Writing App Type Definition
 *
 * Complete definition for proposal writing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROPOSAL_WRITING_APP_TYPE: AppTypeDefinition = {
  id: 'proposal-writing',
  name: 'Proposal Writing',
  category: 'services',
  description: 'Proposal Writing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "proposal writing",
      "proposal",
      "writing",
      "proposal software",
      "proposal app",
      "proposal platform",
      "proposal system",
      "proposal management",
      "services proposal"
  ],

  synonyms: [
      "Proposal Writing platform",
      "Proposal Writing software",
      "Proposal Writing system",
      "proposal solution",
      "proposal service"
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
      "Build a proposal writing platform",
      "Create a proposal writing app",
      "I need a proposal writing management system",
      "Build a proposal writing solution",
      "Create a proposal writing booking system"
  ],
};
