ALTER TABLE `users` ADD `residentNumberEnc` varchar(512);--> statement-breakpoint
ALTER TABLE `users` ADD `residentNumberMasked` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `foreignerNumberEnc` varchar(512);--> statement-breakpoint
ALTER TABLE `users` ADD `passportNumberEnc` varchar(512);--> statement-breakpoint
ALTER TABLE `users` ADD `passportExpiry` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `addressDetail` text;--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `kycStatus` enum('none','pending','verified','failed','expired') DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `users` ADD `kycVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `kycProvider` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `kycReferenceId` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `kycExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `identityVerified` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `signatureVerified` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `signatureVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `signatureProvider` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `signatureDocId` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `voiceVerified` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `voiceVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `voiceFileKey` varchar(512);--> statement-breakpoint
ALTER TABLE `users` ADD `blockchainHash` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `blockchainTxId` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `blockchainAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `timestampToken` text;--> statement-breakpoint
ALTER TABLE `users` ADD `timestampIssuedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `adminNote` text;--> statement-breakpoint
ALTER TABLE `users` ADD `suspended` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `suspendReason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `suspendedAt` timestamp;