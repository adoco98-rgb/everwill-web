CREATE TABLE `newsPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`url` varchar(2048) NOT NULL,
	`outlet` varchar(128) NOT NULL,
	`country` varchar(64) NOT NULL,
	`flag` varchar(8) NOT NULL,
	`summary` text,
	`tag` varchar(64),
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdBy` int,
	`publishedAt` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsPosts_id` PRIMARY KEY(`id`)
);
