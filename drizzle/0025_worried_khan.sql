CREATE TABLE `willRevisionPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`willId` int NOT NULL,
	`userId` int NOT NULL,
	`stripeSessionId` varchar(128),
	`amount` int NOT NULL DEFAULT 5000,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `willRevisionPayments_id` PRIMARY KEY(`id`),
	CONSTRAINT `willRevisionPayments_stripeSessionId_unique` UNIQUE(`stripeSessionId`)
);
--> statement-breakpoint
ALTER TABLE `wills` ADD `freeRevisionCount` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `wills` ADD `usedFreeRevisions` int DEFAULT 0 NOT NULL;