ALTER TABLE `heirs` ADD `priority` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `heirs` ADD `shareType` enum('percent','amount') DEFAULT 'percent';--> statement-breakpoint
ALTER TABLE `heirs` ADD `shareAmount` bigint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `heirs` ADD `smsConsent` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `heirs` ADD `smsSent` int DEFAULT 0;