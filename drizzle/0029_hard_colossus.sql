ALTER TABLE `users` ADD `memberCode` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_memberCode_unique` UNIQUE(`memberCode`);