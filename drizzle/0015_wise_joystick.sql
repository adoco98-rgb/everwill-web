CREATE TABLE `assetDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`verificationId` int NOT NULL,
	`type` enum('real_estate_registry','bank_statement','asset_list','insurance_policy','stock_statement','other') NOT NULL,
	`label` varchar(256),
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileName` varchar(256),
	`mimeType` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assetDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assetVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','submitted','reviewing','approved','rejected') NOT NULL DEFAULT 'pending',
	`idPhotoKey` varchar(512),
	`idPhotoUrl` text,
	`selfieKey` varchar(512),
	`selfieUrl` text,
	`consentAt` timestamp,
	`signatureKey` varchar(512),
	`signatureUrl` text,
	`reviewedAt` timestamp,
	`reviewNote` text,
	`reviewedBy` int,
	`submittedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assetVerifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `assetVerifications_userId_unique` UNIQUE(`userId`)
);
