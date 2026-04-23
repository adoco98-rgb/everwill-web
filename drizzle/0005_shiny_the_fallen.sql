CREATE TABLE `siteStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`value` bigint NOT NULL DEFAULT 0,
	`label` varchar(128),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteStats_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteStats_key_unique` UNIQUE(`key`)
);
