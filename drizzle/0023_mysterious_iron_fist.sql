ALTER TABLE `wills` ADD `pdfKey` varchar(512);--> statement-breakpoint
ALTER TABLE `wills` ADD `pdfUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `wills` ADD `blockchainHash` varchar(128);--> statement-breakpoint
ALTER TABLE `wills` ADD `certNumber` varchar(32);--> statement-breakpoint
ALTER TABLE `wills` ADD CONSTRAINT `wills_certNumber_unique` UNIQUE(`certNumber`);