ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `zipCode` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `stateProvince` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `nationality` varchar(8);--> statement-breakpoint
ALTER TABLE `users` ADD `furigana` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `religion` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `agreeTerms` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `agreePrivacy` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `agreeMarketing` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `agreeGdpr` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `occupation` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `assetScale` varchar(16);