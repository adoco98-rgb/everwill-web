CREATE TABLE `medicalDirectives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('advance','organ') NOT NULL,
	`selections` text NOT NULL,
	`savedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medicalDirectives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `willCertificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`willId` int NOT NULL,
	`certDate` varchar(20) NOT NULL,
	`purpose` varchar(200) NOT NULL,
	`status` enum('pending','issued','rejected') NOT NULL DEFAULT 'pending',
	`issueNumber` varchar(50),
	`paymentId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `willCertificates_id` PRIMARY KEY(`id`)
);
