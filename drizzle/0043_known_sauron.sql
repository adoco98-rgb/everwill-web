ALTER TABLE `countryPricing` ADD `goldPrice` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `countryPricing` ADD `platinumPrice` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `countryPricing` ADD `vipPrice` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `country` varchar(8) DEFAULT 'KR';