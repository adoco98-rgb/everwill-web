ALTER TABLE `charityDonations` ADD `hasSpecificOrg` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `charityDonations` ADD `orgAddress` varchar(256);--> statement-breakpoint
ALTER TABLE `charityDonations` ADD `orgPhone` varchar(64);