ALTER TABLE `users` ADD `assetLocked` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `assetLockedAt` timestamp;