CREATE TABLE `will_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`willId` int,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(1000) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`category` varchar(50) NOT NULL DEFAULT 'other',
	`description` varchar(500),
	`verified` int DEFAULT 0,
	`verifiedAt` timestamp,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `will_attachments_id` PRIMARY KEY(`id`)
);
