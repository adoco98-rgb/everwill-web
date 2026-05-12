CREATE TABLE `charityDonations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` enum('education','children','elderly','disabled','medical','environment','culture','science','animal','disaster','religion','other') NOT NULL,
	`customOrgName` varchar(128),
	`amount` bigint NOT NULL DEFAULT 0,
	`memo` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `charityDonations_id` PRIMARY KEY(`id`)
);
