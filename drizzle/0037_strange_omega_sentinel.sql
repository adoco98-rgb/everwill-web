CREATE TABLE `aiConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`purpose` enum('autobiography','diary','letter','free_chat') NOT NULL DEFAULT 'free_chat',
	`title` varchar(200),
	`messages` text NOT NULL,
	`extractedMemoryIds` text,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiMemories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` enum('basic_info','family','career','values','life_events','emotions','hobbies','health','wishes','diary_summary','letter_summary','conversation') NOT NULL,
	`content` text NOT NULL,
	`importance` int NOT NULL DEFAULT 3,
	`source` enum('manual','conversation','diary','letter','autobiography') NOT NULL DEFAULT 'manual',
	`lastUsedAt` timestamp,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiMemories_id` PRIMARY KEY(`id`)
);
