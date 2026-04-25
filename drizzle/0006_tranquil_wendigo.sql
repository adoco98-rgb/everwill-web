CREATE TABLE `pointHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('referral_reward','referral_bonus','use','expire','admin') NOT NULL,
	`amount` int NOT NULL,
	`balanceAfter` int NOT NULL,
	`description` varchar(256),
	`relatedUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pointHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `referralCode` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `referredBy` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `pointBalance` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_referralCode_unique` UNIQUE(`referralCode`);