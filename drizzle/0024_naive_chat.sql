CREATE TABLE `heirInvitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`willId` int NOT NULL,
	`heirId` int NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(128) NOT NULL,
	`emailSent` int NOT NULL DEFAULT 0,
	`smsSent` int NOT NULL DEFAULT 0,
	`accepted` int NOT NULL DEFAULT 0,
	`acceptedAt` timestamp,
	`registered` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp NOT NULL,
	`isActive` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `heirInvitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `heirInvitations_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `heirs` ADD `isExecutor` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `heirs` ADD `accessLevel` enum('own_only','full') DEFAULT 'own_only' NOT NULL;--> statement-breakpoint
ALTER TABLE `heirs` ADD `heirPaid` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `heirs` ADD `heirFee` int DEFAULT 0 NOT NULL;