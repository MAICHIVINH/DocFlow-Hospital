-- Migration: Create shared_documents table
-- Purpose: Track which users have access to private documents via sharing
-- Created: 2026-01-03

CREATE TABLE IF NOT EXISTS shared_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate shares
    UNIQUE(document_id, shared_with_user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_shared_documents_document_id ON shared_documents(document_id);
CREATE INDEX idx_shared_documents_shared_with_user_id ON shared_documents(shared_with_user_id);
CREATE INDEX idx_shared_documents_shared_by_user_id ON shared_documents(shared_by_user_id);

-- Add comment for documentation
COMMENT ON TABLE shared_documents IS 'Tracks sharing of private documents between users';
COMMENT ON COLUMN shared_documents.document_id IS 'The document being shared';
COMMENT ON COLUMN shared_documents.shared_with_user_id IS 'The user who receives access';
COMMENT ON COLUMN shared_documents.shared_by_user_id IS 'The user who granted access';
