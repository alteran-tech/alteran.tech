CREATE TABLE `github_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cache_key` text NOT NULL,
	`data` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `github_cache_cache_key_unique` ON `github_cache` (`cache_key`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`content` text,
	`image_url` text,
	`live_url` text,
	`source_url` text,
	`github_owner` text,
	`github_repo` text,
	`github_stars` integer DEFAULT 0,
	`github_language` text,
	`github_topics` text,
	`tech_stack` text,
	`category` text,
	`featured` integer DEFAULT 0,
	`sort_order` integer DEFAULT 0,
	`status` text DEFAULT 'draft' NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `site_settings_key_unique` ON `site_settings` (`key`);