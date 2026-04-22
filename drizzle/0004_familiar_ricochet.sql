ALTER TABLE `users` ADD `birthDate` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(8) DEFAULT 'KR';--> statement-breakpoint
ALTER TABLE `users` ADD `profileCompleted` int DEFAULT 0;