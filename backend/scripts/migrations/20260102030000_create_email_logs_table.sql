-- Migration: create_email_logs_table
-- Created at: 2026-01-02
-- Description: Creates email_logs table for tracking sent emails

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    "to" TEXT[] NOT NULL,
    cc TEXT[],
    bcc TEXT[],
    "from" VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    message_id VARCHAR(255),
    error TEXT,
    sent_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_organization_id ON email_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

-- Add comment
COMMENT ON TABLE email_logs IS 'Logs of all emails sent through the platform';
