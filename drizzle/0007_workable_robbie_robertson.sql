CREATE TABLE `farewellAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`letterId` int NOT NULL,
	`userId` int NOT NULL,
	`originalName` varchar(256) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(128),
	`fileSize` bigint,
	`fileType` enum('image','document','other') NOT NULL DEFAULT 'other',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `farewellAttachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `farewellLetters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256),
	`step1Content` text,
	`step2Content` text,
	`step3Content` text,
	`step4Content` text,
	`step5Content` text,
	`recipientMode` enum('all','specific') NOT NULL DEFAULT 'all',
	`status` enum('draft','paid','locked') NOT NULL DEFAULT 'draft',
	`isPaid` tinyint NOT NULL DEFAULT 0,
	`editCount` int NOT NULL DEFAULT 0,
	`isLocked` tinyint NOT NULL DEFAULT 0,
	`stripeSessionId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `farewellLetters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `farewellRecipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`letterId` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`relationship` varchar(32),
	`phone` varchar(32),
	`email` varchar(320),
	`address` text,
	`viewPaid` tinyint NOT NULL DEFAULT 0,
	`viewStripeSessionId` varchar(128),
	`mailPaid` tinyint NOT NULL DEFAULT 0,
	`mailStripeSessionId` varchar(128),
	`viewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `farewellRecipients_id` PRIMARY KEY(`id`)
);
