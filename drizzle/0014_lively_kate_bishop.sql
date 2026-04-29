ALTER TABLE `users` ADD `qrCode` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `qrPublic` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_qrCode_unique` UNIQUE(`qrCode`);