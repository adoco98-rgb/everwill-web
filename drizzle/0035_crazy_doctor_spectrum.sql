ALTER TABLE `payments` MODIFY COLUMN `stripeSessionId` varchar(128);--> statement-breakpoint
ALTER TABLE `payments` ADD `tossOrderId` varchar(128);--> statement-breakpoint
ALTER TABLE `payments` ADD `tossPaymentKey` varchar(200);--> statement-breakpoint
ALTER TABLE `payments` ADD `paymentMethod` varchar(50);--> statement-breakpoint
ALTER TABLE `payments` ADD `paymentType` varchar(50);--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_tossOrderId_unique` UNIQUE(`tossOrderId`);