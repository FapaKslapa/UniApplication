CREATE TABLE IF NOT EXISTS `change_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`link_id` text NOT NULL,
	`changes` text NOT NULL,
	`detected_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_change_log_link_detected` ON `change_log` (`link_id`,`detected_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_change_log_detected` ON `change_log` (`detected_at`);
