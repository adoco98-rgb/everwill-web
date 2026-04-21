CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('real_estate','bank','stock','insurance','crypto','vehicle','business','pension','artwork','other') NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`estimatedValue` bigint,
	`currency` varchar(8) DEFAULT 'KRW',
	`country` varchar(8) DEFAULT 'KR',
	`details` text,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `heirs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nameKo` varchar(64) NOT NULL,
	`nameEn` varchar(64),
	`relationship` enum('spouse','child','parent','sibling','grandchild','other') NOT NULL,
	`birthDate` varchar(16),
	`phone` varchar(32),
	`email` varchar(320),
	`country` varchar(8) DEFAULT 'KR',
	`address` text,
	`sharePercent` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `heirs_id` PRIMARY KEY(`id`)
);
