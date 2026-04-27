CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`category` enum('general','service','payment','badge','lawyer','other') NOT NULL DEFAULT 'general',
	`subject` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`status` enum('pending','answered','closed') NOT NULL DEFAULT 'pending',
	`reply` text,
	`repliedAt` timestamp,
	`repliedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
