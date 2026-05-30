CREATE TABLE `legacyLetters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recipientName` varchar(64) NOT NULL,
	`recipientRelationship` varchar(32),
	`recipientEmail` varchar(320),
	`recipientPhone` varchar(32),
	`title` varchar(256),
	`content` text,
	`releaseCondition` enum('after_death','specific_date','event') NOT NULL DEFAULT 'after_death',
	`releaseDate` timestamp,
	`releaseEventDesc` varchar(256),
	`status` enum('draft','locked','released') NOT NULL DEFAULT 'draft',
	`releasedAt` timestamp,
	`viewedAt` timestamp,
	`attachmentKey` varchar(512),
	`attachmentUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legacyLetters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lifeJournals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`journalDate` varchar(16) NOT NULL,
	`conversationJson` text,
	`diaryText` text,
	`imageKey` varchar(512),
	`imageUrl` text,
	`imageStyle` varchar(32) DEFAULT 'watercolor',
	`emotionTags` varchar(256),
	`isShared` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lifeJournals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`relationship` varchar(32) NOT NULL DEFAULT 'self',
	`photoKey` varchar(512),
	`photoUrl` text,
	`facePrompt` text,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personProfiles_id` PRIMARY KEY(`id`)
);
