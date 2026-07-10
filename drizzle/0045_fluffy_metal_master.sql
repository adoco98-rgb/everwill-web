CREATE TABLE `notarizationDocs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`docId` varchar(100) NOT NULL,
	`docName` varchar(200) NOT NULL,
	`fileKey` text NOT NULL,
	`fileUrl` text NOT NULL,
	`fileName` varchar(500) NOT NULL,
	`fileSize` int NOT NULL DEFAULT 0,
	`analysisResult` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notarizationDocs_id` PRIMARY KEY(`id`)
);
