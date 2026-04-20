CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeSessionId` varchar(128) NOT NULL,
	`stripePaymentIntentId` varchar(128),
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`amountTotal` bigint,
	`currency` varchar(8) DEFAULT 'krw',
	`items` text,
	`customerEmail` varchar(320),
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_stripeSessionId_unique` UNIQUE(`stripeSessionId`)
);
--> statement-breakpoint
CREATE TABLE `wills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256),
	`data` text,
	`mode` enum('ai','direct') DEFAULT 'ai',
	`status` enum('draft','certified','expired') NOT NULL DEFAULT 'draft',
	`isCertified` int DEFAULT 0,
	`certifiedAt` timestamp,
	`storageExpiresAt` timestamp,
	`paymentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);