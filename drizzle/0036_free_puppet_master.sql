CREATE TABLE `videoWills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(1000) NOT NULL,
	`mimeType` varchar(50) NOT NULL DEFAULT 'video/webm',
	`videoType` enum('legal','emotional','future') NOT NULL DEFAULT 'legal',
	`blockchainHash` varchar(100) NOT NULL,
	`recipient` varchar(200),
	`deliveryDate` varchar(20),
	`memo` text,
	`status` enum('active','deleted') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `videoWills_id` PRIMARY KEY(`id`)
);
