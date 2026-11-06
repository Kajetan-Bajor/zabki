CREATE TABLE admin_audit (
	id text PRIMARY KEY NOT NULL,
	action text NOT NULL,
	post_id text,
	created_at bigint NOT NULL
);

CREATE TABLE rate_limits (
	key text PRIMARY KEY NOT NULL,
	count bigint NOT NULL,
	expires_at bigint NOT NULL
);

CREATE TABLE admin_mfa (
	id bigint PRIMARY KEY NOT NULL,
	secret text NOT NULL,
	last_step bigint NOT NULL,
	created_at bigint NOT NULL
);

CREATE TABLE posts (
	id text PRIMARY KEY NOT NULL,
	slug text NOT NULL,
	title text NOT NULL,
	excerpt text NOT NULL,
	content text NOT NULL,
	category text NOT NULL,
	author text NOT NULL,
	image text NOT NULL,
	status text NOT NULL,
	published_at bigint NOT NULL,
	created_at bigint NOT NULL,
	updated_at bigint NOT NULL,
	version bigint DEFAULT 1 NOT NULL,
	deleted_at bigint
);

CREATE UNIQUE INDEX posts_slug_unique ON posts (slug);
CREATE TABLE recovery_codes (
	hash text PRIMARY KEY NOT NULL,
	created_at bigint NOT NULL
);

CREATE TABLE admin_sessions (
	id text PRIMARY KEY NOT NULL,
	role text NOT NULL,
	csrf text NOT NULL,
	created_at bigint NOT NULL,
	last_seen bigint NOT NULL,
	expires_at bigint NOT NULL,
	credential_version text NOT NULL,
	pending_secret text
);

CREATE TABLE settings (
	key text PRIMARY KEY NOT NULL,
	value text NOT NULL
);

CREATE TABLE uploads (
	id text PRIMARY KEY NOT NULL,
	object_key text NOT NULL,
	mime text NOT NULL,
	size bigint NOT NULL,
	created_at bigint NOT NULL
);

CREATE TABLE media_objects (object_key text PRIMARY KEY, data bytea NOT NULL, mime text NOT NULL);
CREATE INDEX posts_published ON posts(status,published_at);
CREATE INDEX session_expiry ON admin_sessions(expires_at);

-- Browser clients have no direct access; only the server connects to PostgreSQL.
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_mfa ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
  REVOKE ALL ON TABLE posts,settings,admin_sessions,rate_limits,admin_mfa,recovery_codes,uploads,admin_audit,media_objects,schema_migrations FROM anon;
 END IF;
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
  REVOKE ALL ON TABLE posts,settings,admin_sessions,rate_limits,admin_mfa,recovery_codes,uploads,admin_audit,media_objects,schema_migrations FROM authenticated;
 END IF;
END $$;
