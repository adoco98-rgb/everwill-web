CREATE TABLE `autobiographies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) DEFAULT '나의 자서전',
	`status` enum('draft','completed','published') NOT NULL DEFAULT 'draft',
	`completedChapters` int NOT NULL DEFAULT 0,
	`pdfKey` varchar(512),
	`pdfUrl` text,
	`shareToken` varchar(64),
	`isShared` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autobiographies_id` PRIMARY KEY(`id`),
	CONSTRAINT `autobiographies_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `autobiographyChapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`autobiographyId` int NOT NULL,
	`chapterNumber` int NOT NULL,
	`chapterTitle` varchar(128),
	`conversationJson` text,
	`generatedText` text,
	`photoKeys` text,
	`artworkUrls` text,
	`isCompleted` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autobiographyChapters_id` PRIMARY KEY(`id`)
);
