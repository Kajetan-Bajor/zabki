CREATE TABLE `admin_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`post_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_mfa` (
	`id` integer PRIMARY KEY NOT NULL,
	`secret` text NOT NULL,
	`last_step` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`category` text NOT NULL,
	`author` text NOT NULL,
	`image` text NOT NULL,
	`status` text NOT NULL,
	`published_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE TABLE `recovery_codes` (
	`hash` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`csrf` text NOT NULL,
	`created_at` integer NOT NULL,
	`last_seen` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`credential_version` text NOT NULL,
	`pending_secret` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer NOT NULL
);
