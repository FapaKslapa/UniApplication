CREATE TABLE IF NOT EXISTS `exams` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`external_id` text NOT NULL,
	`link_id` text NOT NULL,
	`subject` text NOT NULL,
	`course_name` text,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`kind` text,
	`aula` text,
	`professor` text,
	`reg_opens_at` integer,
	`reg_closes_at` integer,
	`reg_confirmed` integer DEFAULT 0 NOT NULL,
	`canceled` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `idx_exams_source_external` ON `exams` (`source`, `external_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_exams_starts_at` ON `exams` (`starts_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_exams_link_id` ON `exams` (`link_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `exam_calendars` (
	`exam_id` text NOT NULL,
	`link_id` text NOT NULL,
	PRIMARY KEY (`exam_id`, `link_id`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_exam_calendars_link_id` ON `exam_calendars` (`link_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `exam_follows` (
	`user_id` text NOT NULL,
	`exam_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY (`user_id`, `exam_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `exam_reminders_sent` (
	`user_id` text NOT NULL,
	`exam_id` text NOT NULL,
	`kind` text NOT NULL,
	`sent_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY (`user_id`, `exam_id`, `kind`)
);
