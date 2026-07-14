CREATE TABLE `family_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nameKo` varchar(64) NOT NULL,
	`relationship` varchar(32) NOT NULL,
	`birthDate` varchar(32),
	`idFront` varchar(6),
	`address` text,
	`source` enum('family_cert','resident_cert','manual') NOT NULL DEFAULT 'manual',
	`sourceFileKey` text,
	`rawData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_members_id` PRIMARY KEY(`id`)
);
