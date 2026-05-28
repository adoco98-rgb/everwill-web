ALTER TABLE `users` ADD `faceVerified` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `idImageKey` varchar(512);--> statement-breakpoint
ALTER TABLE `users` ADD `selfieImageKey` varchar(512);--> statement-breakpoint
ALTER TABLE `users` ADD `faceVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `faceVerifyResult` text;