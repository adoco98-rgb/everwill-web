CREATE TABLE `helperCommissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`helperId` int NOT NULL,
	`customerId` int NOT NULL,
	`stripeSessionId` varchar(128),
	`productName` varchar(256),
	`saleAmount` bigint NOT NULL,
	`commissionRate` int NOT NULL,
	`commissionAmount` bigint NOT NULL,
	`payoutStatus` enum('pending','paid') NOT NULL DEFAULT 'pending',
	`payoutId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `helperCommissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `helperDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`helperId` int NOT NULL,
	`docType` enum('resident','id_card','bankbook') NOT NULL,
	`fileKey` varchar(512),
	`fileUrl` varchar(1024),
	`ocrName` varchar(128),
	`ocrBirthDate` varchar(16),
	`ocrAddress` text,
	`ocrBankName` varchar(64),
	`ocrAccountNumber` varchar(64),
	`ocrAccountHolder` varchar(128),
	`ocrRawData` text,
	`ocrStatus` enum('pending','done','error') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `helperDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `helperPayouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`helperId` int NOT NULL,
	`grossAmount` bigint NOT NULL,
	`taxRate` int NOT NULL DEFAULT 33,
	`taxAmount` bigint NOT NULL,
	`netAmount` bigint NOT NULL,
	`bankName` varchar(64),
	`accountNumber` varchar(64),
	`accountHolder` varchar(128),
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`adminNote` text,
	`processedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `helperPayouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `helpers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`helperCode` varchar(32),
	`status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`commissionRate` int NOT NULL DEFAULT 15,
	`totalSales` bigint NOT NULL DEFAULT 0,
	`pendingCommission` bigint NOT NULL DEFAULT 0,
	`totalPaidCommission` bigint NOT NULL DEFAULT 0,
	`adminNote` text,
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `helpers_id` PRIMARY KEY(`id`),
	CONSTRAINT `helpers_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `helpers_helperCode_unique` UNIQUE(`helperCode`)
);
