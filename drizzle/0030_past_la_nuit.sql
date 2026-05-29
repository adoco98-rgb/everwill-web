ALTER TABLE `charityDonations` ADD `donationType` enum('posthumous','lifetime') DEFAULT 'posthumous' NOT NULL;--> statement-breakpoint
ALTER TABLE `charityDonations` ADD `paymentStatus` enum('pending','completed','failed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `charityDonations` ADD `stripeSessionId` varchar(128);--> statement-breakpoint
ALTER TABLE `charityDonations` ADD `paidAt` timestamp;--> statement-breakpoint
ALTER TABLE `charityDonations` ADD `publicMessage` text;--> statement-breakpoint
ALTER TABLE `charityDonations` ADD `messagePublic` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `charityDonations` ADD `displayName` varchar(64);--> statement-breakpoint
ALTER TABLE `charityDonations` ADD `country` varchar(8) DEFAULT 'KR';