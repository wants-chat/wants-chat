-- Migration: add_invitation_message_column
-- Created at: 2026-01-02
-- Description: Adds message column to organization_invitations table

-- Add message column to organization_invitations
ALTER TABLE organization_invitations
ADD COLUMN IF NOT EXISTS message TEXT;

-- Add comment
COMMENT ON COLUMN organization_invitations.message IS 'Optional custom message to include with the invitation email';
