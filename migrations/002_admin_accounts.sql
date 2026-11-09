CREATE TABLE admin_accounts (
  id text PRIMARY KEY CHECK (id ~ '^[a-f0-9]{32}$'),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  disabled_at bigint
);
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE admin_accounts FROM PUBLIC;

ALTER TABLE admin_sessions ADD COLUMN account_id text NOT NULL DEFAULT 'owner';
ALTER TABLE recovery_codes ADD COLUMN account_id text NOT NULL DEFAULT 'owner';

-- Preserve id 1 and existing codes for the owner account during deployment and rollback.
ALTER TABLE admin_mfa ADD COLUMN account_id text NOT NULL DEFAULT 'owner' UNIQUE;
ALTER TABLE admin_mfa ADD CONSTRAINT admin_mfa_owner_slot CHECK ((id = 1) = (account_id = 'owner'));
CREATE SEQUENCE admin_mfa_account_id_seq START WITH 2 OWNED BY admin_mfa.id;
REVOKE ALL ON SEQUENCE admin_mfa_account_id_seq FROM PUBLIC;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE admin_accounts FROM anon;
    REVOKE ALL ON SEQUENCE admin_mfa_account_id_seq FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE admin_accounts FROM authenticated;
    REVOKE ALL ON SEQUENCE admin_mfa_account_id_seq FROM authenticated;
  END IF;
END $$;
