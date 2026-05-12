ALTER TABLE `users` ADD `memberGrade` enum('general','silver','gold','platinum','vip') DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `gradeUpdatedAt` timestamp;